import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { z } from "zod";
import rateLimit from "express-rate-limit";

// Rate limiters
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Muitas requisições. Aguarde alguns minutos e tente novamente." },
});

const calcRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Muitas requisições. Aguarde um momento." },
});

// Sanitize text inputs before inserting into AI prompts
function sanitizeInput(text: string): string {
  return text
    .replace(/[<>]/g, "")
    .replace(/\bignore\b|\bforget\b|\bpretend\b|\bsystem\b|\bprompt\b/gi, "***")
    .slice(0, 500);
}

const positiveInt = z.string().min(1).regex(/^\d+$/, "Apenas números inteiros positivos");
const decimalOrInt = z.string().min(1).regex(/^\d+(\.\d+)?$/, "Número decimal inválido");

const calcularSchema = z.object({
  numbers: z.array(decimalOrInt).min(2, "Mínimo de 2 números"),
  operation: z.enum(["addition", "subtraction", "multiplication", "division"]),
});

interface ComputeResult {
  result: string;
  quotient?: string;
  remainder?: string;
  operationSymbol: string;
  operationName: string;
  fullExpression: string;
}

function getDecimalPlaces(n: string): number {
  const dot = n.indexOf(".");
  return dot === -1 ? 0 : n.length - dot - 1;
}

function computeDecimalResult(numbers: string[], operation: "addition" | "subtraction"): string {
  const maxPlaces = Math.max(...numbers.map(getDecimalPlaces));
  const scale = Math.pow(10, maxPlaces);
  const scaled = numbers.map(n => Math.round(parseFloat(n) * scale));
  let result: number;
  if (operation === "addition") {
    result = scaled.reduce((a, b) => a + b, 0);
  } else {
    result = scaled.slice(1).reduce((acc, n) => acc - n, scaled[0]);
  }
  const final = result / scale;
  if (maxPlaces === 0) return final.toString();
  return final.toFixed(maxPlaces).replace(/\.?0+$/, "") || "0";
}

function computeResult(numbers: string[], operation: string): ComputeResult {
  if (operation === "addition") {
    const result = computeDecimalResult(numbers, "addition");
    const expr = numbers.join(" + ") + " = " + result;
    return { result, operationSymbol: "+", operationName: "adição", fullExpression: expr };
  }

  if (operation === "subtraction") {
    const result = computeDecimalResult(numbers, "subtraction");
    const expr = numbers.join(" − ") + " = " + result;
    return { result, operationSymbol: "−", operationName: "subtração", fullExpression: expr };
  }

  const bigNums = numbers.map(n => BigInt(n));

  if (operation === "division") {
    const [n1, n2] = bigNums;
    if (n2 === 0n) throw new Error("DIVISION_BY_ZERO");
    const quotient = n1 / n2;
    const remainder = n1 % n2;
    const result = quotient.toString();
    const remainderStr = remainder.toString();
    const expr = remainder === 0n
      ? `${numbers[0]} ÷ ${numbers[1]} = ${result}`
      : `${numbers[0]} ÷ ${numbers[1]} = ${result} com resto ${remainderStr}`;
    return { result, quotient: result, remainder: remainderStr, operationSymbol: "÷", operationName: "divisão", fullExpression: expr };
  }

  // multiplication
  const result = bigNums.reduce((acc, n) => acc * n, 1n).toString();
  const expr = numbers.join(" × ") + " = " + result;
  return { result, operationSymbol: "×", operationName: "multiplicação", fullExpression: expr };
}

export async function registerRoutes(app: Express): Promise<Server> {
  function validateCalc(req: any, res: any): { numbers: string[]; operation: string } | null {
    const body = req.body;
    if (body && Array.isArray(body.numbers)) {
      body.numbers = body.numbers.map((n: unknown) =>
        typeof n === "string" ? n.replace(/,/g, ".") : n
      );
    }
    const parsed = calcularSchema.safeParse(body);
    if (!parsed.success) {
      const msgs = parsed.error.errors.map((e: any) => e.message);
      const msg = msgs.find((m: string) => m !== "Invalid input") || msgs[0] || "Dados inválidos";
      res.status(400).json({ message: msg });
      return null;
    }
    const { numbers, operation } = parsed.data;
    if ((operation === "multiplication" || operation === "division") && numbers.length !== 2) {
      res.status(400).json({ message: "Multiplicação e Divisão aceitam apenas 2 números." });
      return null;
    }
    if (operation === "multiplication" || operation === "division") {
      const intOnly = numbers.every(n => positiveInt.safeParse(n).success);
      if (!intOnly) {
        res.status(400).json({ message: "Multiplicação e Divisão aceitam apenas números inteiros positivos." });
        return null;
      }
    }
    return { numbers, operation };
  }

  // Fast route: just returns the numeric result (no IA)
  app.post("/api/calcular/resultado", calcRateLimit, (req, res) => {
    const validated = validateCalc(req, res);
    if (!validated) return;
    try {
      const { numbers, operation } = validated;
      const computed = computeResult(numbers, operation);
      return res.json({ result: computed.result, quotient: computed.quotient, remainder: computed.remainder });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "DIVISION_BY_ZERO") {
        return res.status(400).json({ message: "DIVISION_BY_ZERO" });
      }
      return res.status(400).json({ message: "Números inválidos para cálculo" });
    }
  });

  // Slow route: calls Groq to get the explanation
  app.post("/api/calcular/explicacao", aiRateLimit, async (req, res) => {
    const validated = validateCalc(req, res);
    if (!validated) return;

    const { numbers, operation } = validated;
    let computed: ComputeResult;

    try {
      computed = computeResult(numbers, operation);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "DIVISION_BY_ZERO") {
        return res.status(400).json({ message: "DIVISION_BY_ZERO" });
      }
      return res.status(400).json({ message: "Números inválidos para cálculo" });
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) return res.json({ explanation: "" });

    try {
      const groq = new OpenAI({
        apiKey: groqKey,
        baseURL: "https://api.groq.com/openai/v1",
      });

      const remainderNote = computed.remainder && computed.remainder !== "0"
        ? `\nO quociente é ${computed.result} e o RESTO é ${computed.remainder}. Explique o que é o resto de uma divisão de forma simples e visual (ex: usando laranjas ou figurinhas para crianças entenderem).`
        : operation === "division"
        ? `\nA divisão é exata, sem resto.`
        : "";

      const multiNote = numbers.length > 2
        ? ` São ${numbers.length} números sendo ${computed.operationName === "adição" ? "somados" : "subtraídos"} em sequência.`
        : "";

      const prompt = `Você é Arquimedes, um sábio matemático grego que explica matemática para crianças de forma simples, clara e encorajadora.
Explique em português brasileiro, de forma bem didática e animada, como chegamos ao resultado desta conta:
${computed.fullExpression}${remainderNote}${multiNote}

Regras:
- Use linguagem simples, adequada para crianças de 6 a 12 anos
- Explique o passo a passo da operação de ${computed.operationName}
- Se forem mais de 2 números, explique que se faz passo a passo da esquerda para a direita
- Se for divisão com resto, explique o conceito de resto de forma lúdica
- Se os números forem grandes, explique a lógica sem fazer contas manuais longas
- Seja breve: no máximo 4 parágrafos curtos
- Use emojis com moderação para deixar divertido
- Termine com uma frase de incentivo`;

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 512,
        temperature: 0.7,
      });

      const explanation = completion.choices[0]?.message?.content || "";
      return res.json({ explanation });
    } catch (err) {
      console.error("Groq API error:", err);
      return res.json({ explanation: "" });
    }
  });

  // Arquimedes AI: free question on any page
  app.post("/api/arquimedes/perguntar", aiRateLimit, async (req, res) => {
    const schema = z.object({
      question: z.string().min(1).max(500),
      page: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Pergunta inválida." });
    }
    const { question: rawQuestion, page } = parsed.data;
    const question = sanitizeInput(rawQuestion);

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) return res.json({ answer: "" });

    const pageContextMap: Record<string, string> = {
      "/": "o aluno está na página da tabela de multiplicação (tabuada pitagórica 10x10)",
      "/adicao": "o aluno está na página de tabuadas de adição (soma de números)",
      "/subtracao": "o aluno está na página de tabuadas de subtração",
      "/tabuadas": "o aluno está na página de tabuadas individuais de multiplicação (de 1 a 10)",
      "/divisao": "o aluno está na página de tabuadas de divisão",
      "/simulado": "o aluno está na página de simulado/desafio cronometrado de multiplicação, divisão, quadrados e cubos",
      "/relogio": "o aluno está na página do relógio educativo, aprendendo a ler horas",
      "/calculadora": "o aluno está na página da calculadora educativa com IA",
      "/contagem": "o aluno está na página de prática de contagem e números",
    };
    const pageContext = page && pageContextMap[page]
      ? `Contexto: ${pageContextMap[page]}.`
      : "";

    try {
      const groq = new OpenAI({
        apiKey: groqKey,
        baseURL: "https://api.groq.com/openai/v1",
      });

      const prompt = `Você é Arquimedes, um sábio matemático grego que ensina crianças de forma simples, clara e encorajadora.
${pageContext}
Uma criança te fez a seguinte pergunta: "${question}"

Regras:
- Responda em português brasileiro, de forma bem didática e simpática
- Use linguagem simples, adequada para crianças de 6 a 12 anos
- Seja breve: no máximo 3 parágrafos curtos
- Use emojis com moderação para deixar divertido
- Se a pergunta for fora do tema educativo, redirecione gentilmente para matemática
- Termine com uma frase de incentivo`;

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 384,
        temperature: 0.7,
      });

      const answer = completion.choices[0]?.message?.content || "";
      return res.json({ answer });
    } catch (err) {
      console.error("Groq API error (arquimedes):", err);
      return res.json({ answer: "" });
    }
  });

  // Arquimedes AI: proactive reaction to student events
  app.post("/api/arquimedes/evento", aiRateLimit, async (req, res) => {
    const schema = z.object({
      event: z.string().min(1).max(100),
      context: z.record(z.string(), z.unknown()).optional(),
      page: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Evento inválido." });
    }
    const { event, context = {}, page } = parsed.data;

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) return res.json({ message: "" });

    const pageContextMap: Record<string, string> = {
      "/": "tabela de multiplicação completa (pitagórica 10x10)",
      "/adicao": "tabuadas de adição",
      "/subtracao": "tabuadas de subtração",
      "/tabuadas": "tabuadas individuais de multiplicação",
      "/divisao": "tabuadas de divisão",
      "/simulado": "desafio cronometrado de matemática",
      "/relogio": "relógio educativo",
      "/calculadora": "calculadora educativa",
      "/contagem": "prática de contagem",
    };
    const pageLabel = page && pageContextMap[page] ? pageContextMap[page] : "plataforma educativa";

    const eventPromptMap: Record<string, string> = {
      quiz_complete: `O aluno acabou de terminar um simulado de ${pageLabel}. Resultado: ${context.correct} acertos de ${context.total} questões (${context.accuracy}% de aproveitamento). Reaja de forma encorajadora, personalizada ao resultado — celebre se foi bom, encoraje se foi abaixo do esperado.`,
      perfect_score: `O aluno acabou de obter PONTUAÇÃO PERFEITA em um simulado de ${pageLabel}: ${context.correct} de ${context.total} questões corretas! Celebre com muito entusiasmo e mostre admiração genuína pelo feito!`,
      table_complete: `O aluno acabou de verificar suas respostas na tabuada do ${context.tableNumber} em ${pageLabel}. Acertou ${context.correct} de 10 questões em ${context.time}. Dê um feedback motivador e contextualizado ao resultado.`,
      wrong_streak: `O aluno errou ${context.streak} questões seguidas no simulado de ${pageLabel}. Encoraje-o gentilmente, sem pressão, e ofereça uma dica rápida de como melhorar.`,
    };

    const eventPrompt = eventPromptMap[event]
      ?? `O aluno realizou uma ação na seção de ${pageLabel}. Reaja de forma encorajadora e breve.`;

    try {
      const groq = new OpenAI({
        apiKey: groqKey,
        baseURL: "https://api.groq.com/openai/v1",
      });

      const prompt = `Você é Arquimedes, um sábio matemático grego que ensina crianças de forma simples, clara e encorajadora.
${eventPrompt}

Regras:
- Responda em português brasileiro, de forma didática e calorosa
- Use linguagem simples, adequada para crianças de 6 a 12 anos
- Seja breve: no máximo 2 parágrafos curtos
- Use emojis com moderação para deixar divertido
- Fale na primeira pessoa como Arquimedes
- Termine com uma frase de incentivo`;

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 256,
        temperature: 0.8,
      });

      const message = completion.choices[0]?.message?.content || "";
      return res.json({ message });
    } catch (err) {
      console.error("Groq API error (arquimedes evento):", err);
      return res.json({ message: "" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
