/**
 * Calculadora Sábia com IA - Academia dos Números
 * Desenvolvido por: Rodrigo Linhares Drummond
 * © 2025 Academia dos Números
 */

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division';

interface DivisionStep {
  label: string;
  value: string;
  detail?: string;
  highlight?: boolean;
}

function computeDivisionSteps(dividend: string, divisor: string, quotient: string, remainder: string): DivisionStep[] {
  const v = BigInt(divisor);
  const q = BigInt(quotient);
  const r = BigInt(remainder);
  const product = q * v;
  const isExact = r === 0n;

  const steps: DivisionStep[] = [];

  steps.push({
    label: '1️⃣ O que queremos saber?',
    value: `${dividend} ÷ ${divisor}`,
    detail: `Quantas vezes ${divisor} cabe dentro de ${dividend}?`,
  });

  steps.push({
    label: '2️⃣ Encontramos o quociente',
    value: `${quotient}`,
    detail: `${divisor} cabe ${quotient} ${Number(q) === 1 ? 'vez' : 'vezes'} em ${dividend}.`,
    highlight: true,
  });

  steps.push({
    label: '3️⃣ Multiplicamos para conferir',
    value: `${quotient} × ${divisor} = ${product}`,
    detail: `O maior múltiplo de ${divisor} que não passa de ${dividend}.`,
  });

  steps.push({
    label: '4️⃣ Subtraímos',
    value: `${dividend} − ${product} = ${remainder}`,
    detail: isExact
      ? `Deu zero! A divisão é exata, sem sobrar nada. 🎉`
      : `Sobra ${remainder} — isso é o resto.`,
  });

  if (!isExact) {
    steps.push({
      label: '5️⃣ Por que paramos no resto?',
      value: `${remainder} < ${divisor}`,
      detail: `O resto (${remainder}) é menor que o divisor (${divisor}), então ${divisor} não cabe mais. Paramos aqui!`,
    });
  }

  steps.push({
    label: isExact ? '5️⃣ Verificação' : '6️⃣ Verificação',
    value: isExact
      ? `${quotient} × ${divisor} = ${dividend} ✓`
      : `${quotient} × ${divisor} + ${remainder} = ${product} + ${remainder} = ${dividend} ✓`,
    detail: 'A conta fecha! Resultado correto.',
    highlight: true,
  });

  return steps;
}

const OPERATIONS: {
  value: Operation;
  label: string;
  symbol: string;
  bg: string;
  activeBg: string;
  text: string;
  ring: string;
  multi: boolean;
}[] = [
  {
    value: 'addition',
    label: 'Adição',
    symbol: '+',
    bg: 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100',
    activeBg: 'bg-green-600 border-green-700 text-white shadow-green-200',
    text: 'text-green-600',
    ring: 'ring-green-400',
    multi: true,
  },
  {
    value: 'subtraction',
    label: 'Subtração',
    symbol: '−',
    bg: 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100',
    activeBg: 'bg-red-600 border-red-700 text-white shadow-red-200',
    text: 'text-red-600',
    ring: 'ring-red-400',
    multi: true,
  },
  {
    value: 'multiplication',
    label: 'Multiplicação',
    symbol: '×',
    bg: 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100',
    activeBg: 'bg-blue-600 border-blue-700 text-white shadow-blue-200',
    text: 'text-blue-600',
    ring: 'ring-blue-400',
    multi: false,
  },
  {
    value: 'division',
    label: 'Divisão',
    symbol: '÷',
    bg: 'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100',
    activeBg: 'bg-purple-600 border-purple-700 text-white shadow-purple-200',
    text: 'text-purple-600',
    ring: 'ring-purple-400',
    multi: false,
  },
];

interface ResultData {
  result: string;
  quotient?: string;
  remainder?: string;
}

interface HistoryEntry {
  id: number;
  numbers: string[];
  operation: Operation;
  result: string;
  remainder?: string;
  explanation: string | null;
  timestamp: number;
}

const HISTORY_KEY = 'calculadora_history';
const MAX_HISTORY = 10;

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
}

export default function Calculadora() {
  const [numbers, setNumbers] = useState<string[]>(['', '']);
  const [operation, setOperation] = useState<Operation>('addition');
  const [validationError, setValidationError] = useState('');
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [lastCalc, setLastCalc] = useState<{ numbers: string[]; op: typeof OPERATIONS[0] } | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explanationError, setExplanationError] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [showDivisionSteps, setShowDivisionSteps] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const latestExplanationReqRef = useRef(0);

  const selectedOp = OPERATIONS.find(o => o.value === operation)!;
  const isMulti = selectedOp.multi;

  const clearResults = () => {
    setResultData(null);
    setExplanation(null);
    setExplanationError(false);
    setShowDivisionSteps(false);
  };

  const handleOpChange = (op: Operation) => {
    const newOp = OPERATIONS.find(o => o.value === op)!;
    setOperation(op);
    clearResults();
    setValidationError('');
    if (!newOp.multi && numbers.length > 2) {
      setNumbers(numbers.slice(0, 2));
    }
  };

  const handleNumberChange = (index: number, value: string) => {
    let cleaned: string;
    if (isMulti) {
      cleaned = value.replace(/[^\d.,]/g, '').replace(/,/g, '.');
      const parts = cleaned.split('.');
      if (parts.length > 2) cleaned = parts[0] + '.' + parts.slice(1).join('');
    } else {
      cleaned = value.replace(/\D/g, '');
    }
    const updated = [...numbers];
    updated[index] = cleaned;
    setNumbers(updated);
    clearResults();
    setValidationError('');
  };

  const addNumber = () => {
    setNumbers(prev => [...prev, '']);
    clearResults();
    setTimeout(() => {
      inputRefs.current[numbers.length]?.focus();
    }, 50);
  };

  const removeNumber = (index: number) => {
    if (numbers.length <= 2) return;
    setNumbers(numbers.filter((_, i) => i !== index));
    clearResults();
  };

  const addToHistory = (
    nums: string[],
    op: Operation,
    res: ResultData,
    expl: string | null
  ): number => {
    const newEntry: HistoryEntry = {
      id: Date.now(),
      numbers: nums,
      operation: op,
      result: res.result,
      remainder: res.remainder,
      explanation: expl,
      timestamp: Date.now(),
    };
    const updated = [newEntry, ...history].slice(0, MAX_HISTORY);
    setHistory(updated);
    saveHistory(updated);
    return newEntry.id;
  };

  const updateHistoryExplanation = (id: number, expl: string) => {
    setHistory(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, explanation: expl } : e);
      saveHistory(updated);
      return updated;
    });
  };

  const resultMutation = useMutation({
    mutationFn: async (data: { numbers: string[]; operation: Operation }) => {
      const res = await apiRequest('POST', '/api/calcular/resultado', data);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erro ao calcular');
      }
      return res.json() as Promise<ResultData>;
    },
    onSuccess: (data, variables) => {
      setResultData(data);
      const op = OPERATIONS.find(o => o.value === variables.operation)!;
      setLastCalc({ numbers: variables.numbers, op });
      setExplanation(null);
      setExplanationError(false);
      const id = addToHistory(variables.numbers, variables.operation, data, null);
      const reqId = ++latestExplanationReqRef.current;
      explanationMutation.mutate({ ...variables, historyId: id, reqId });
    },
    onError: (err: unknown) => {
      setResultData(null);
      if (err instanceof Error && err.message === 'DIVISION_BY_ZERO') {
        setValidationError('Não é possível dividir por zero! Escolha um divisor diferente de 0.');
      } else if (err instanceof Error) {
        setValidationError(err.message);
      }
    },
  });

  const explanationMutation = useMutation({
    mutationFn: async (data: { numbers: string[]; operation: Operation; historyId: number; reqId: number }) => {
      const res = await apiRequest('POST', '/api/calcular/explicacao', {
        numbers: data.numbers,
        operation: data.operation,
      });
      return { ...(await res.json() as { explanation: string }), historyId: data.historyId, reqId: data.reqId };
    },
    onSuccess: (data) => {
      const expl = data.explanation || '';
      updateHistoryExplanation(data.historyId, expl);
      if (data.reqId === latestExplanationReqRef.current) {
        setExplanation(expl);
      }
    },
    onError: (_, variables) => {
      if (variables.reqId === latestExplanationReqRef.current) {
        setExplanationError(true);
      }
    },
  });

  const validate = (): boolean => {
    setValidationError('');
    if (numbers.some(n => !n)) {
      setValidationError('Preencha todos os campos antes de calcular.');
      return false;
    }
    if (isMulti) {
      if (numbers.some(n => !/^\d+(\.\d+)?$/.test(n))) {
        setValidationError('Use números válidos (ex: 3, 3.5 ou 12,75).');
        return false;
      }
    } else {
      if (numbers.some(n => !/^\d+$/.test(n))) {
        setValidationError('Use apenas números inteiros positivos.');
        return false;
      }
      if (operation === 'division' && numbers[1] === '0') {
        setValidationError('Não é possível dividir por zero! Escolha um divisor diferente de 0.');
        return false;
      }
    }
    return true;
  };

  const handleCalcular = () => {
    if (!validate()) return;
    clearResults();
    resultMutation.mutate({ numbers, operation });
  };

  const handleReset = () => {
    setNumbers(['', '']);
    clearResults();
    setValidationError('');
  };

  const handleClearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  const handleReview = (entry: HistoryEntry) => {
    clearResults();
    const op = OPERATIONS.find(o => o.value === entry.operation)!;
    setResultData({ result: entry.result, remainder: entry.remainder });
    setLastCalc({ numbers: entry.numbers, op });
    if (entry.explanation !== null) {
      setExplanation(entry.explanation);
    } else {
      setExplanationError(true);
    }
  };

  const hasRemainder = resultData?.remainder !== undefined && resultData.remainder !== '0';
  const isDivisionExact = lastCalc?.op.value === 'division' && resultData?.remainder === '0';
  const showResult = resultData !== null && lastCalc !== null;
  const isLoading = resultMutation.isPending;

  const getOpForEntry = (op: Operation) => OPERATIONS.find(o => o.value === op)!;

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 border-4 border-amber-400 mb-2 shadow-md">
          <span className="text-2xl">🧮</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-amber-900" style={{ fontFamily: 'Cinzel, serif' }}>
          Calculadora Sábia
        </h1>
        <p className="text-amber-600 text-sm mt-0.5">Calcule e aprenda com Arquimedes</p>
      </div>

      {/* ── Two-column grid on desktop ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ═══ LEFT COLUMN: Form ═══════════════════════════════ */}
        <div className="space-y-4">

          {/* Operation selector */}
          <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-md p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">
              Operação
            </p>
            <div className="grid grid-cols-2 gap-2">
              {OPERATIONS.map(op => (
                <button
                  key={op.value}
                  disabled={isLoading}
                  onClick={() => handleOpChange(op.value)}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    operation === op.value
                      ? `${op.activeBg} shadow-md ring-2 ${op.ring} ring-offset-1 scale-105`
                      : `${op.bg}`
                  }`}
                >
                  <span className="text-2xl font-bold leading-none w-7 text-center flex-shrink-0">
                    {op.symbol}
                  </span>
                  <span className="flex flex-col items-start leading-tight">
                    <span className="font-bold">{op.label}</span>
                    {op.multi && (
                      <span className="text-xs opacity-70 font-normal">vários números</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Number inputs */}
          <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-md p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">
              Números
            </p>

            <div className="space-y-2">
              {numbers.map((num, index) => (
                <div key={index} className="flex items-center gap-2">
                  {/* Symbol / label */}
                  <div className="w-9 flex-shrink-0 flex items-center justify-center">
                    {index === 0 ? (
                      <span className="text-xs font-bold text-gray-300 select-none">N1</span>
                    ) : (
                      <span className={`text-xl font-black ${selectedOp.text}`}>
                        {selectedOp.symbol}
                      </span>
                    )}
                  </div>

                  {/* Input */}
                  <input
                    ref={el => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode={isMulti ? 'decimal' : 'numeric'}
                    value={num}
                    onChange={e => handleNumberChange(index, e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCalcular()}
                    placeholder={index === 0 ? 'Primeiro número' : `Número ${index + 1}`}
                    className="flex-1 text-center text-xl font-bold border-2 border-amber-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 bg-amber-50 transition-colors placeholder:text-gray-300"
                  />

                  {/* Remove button */}
                  {isMulti && numbers.length > 2 ? (
                    <button
                      onClick={() => removeNumber(index)}
                      disabled={isLoading}
                      className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 border border-red-200 text-base font-bold transition-colors disabled:opacity-40"
                      title="Remover número"
                    >
                      ×
                    </button>
                  ) : (
                    <div className="w-9 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>

            {/* Decimal hint — multi-ops only */}
            {isMulti && (
              <p className="text-xs text-center text-amber-500 mt-2 opacity-80">
                Aceita decimais — use ponto ou vírgula (ex: 3.5 ou 12,75)
              </p>
            )}

            {/* Add number — multi-ops only */}
            {isMulti && (
              <button
                onClick={addNumber}
                disabled={isLoading}
                className="mt-2 w-full py-2 rounded-xl border-2 border-dashed border-amber-300 text-amber-600 hover:bg-amber-50 hover:border-amber-400 text-sm font-semibold transition-all disabled:opacity-40"
              >
                + Adicionar número
              </button>
            )}
          </div>

          {/* Validation error */}
          {validationError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm text-center font-medium">
              ⚠️ {validationError}
            </div>
          )}

          {/* Calculate button */}
          <Button
            onClick={handleCalcular}
            disabled={isLoading}
            className="w-full py-4 text-base font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white border-2 border-amber-700 shadow-md transition-all duration-200 hover:scale-105 disabled:scale-100"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Calculando…
              </span>
            ) : '⚡ Calcular'}
          </Button>

          {showResult && (
            <Button
              onClick={handleReset}
              variant="outline"
              className="w-full border-2 border-amber-300 text-amber-700 hover:bg-amber-50 rounded-xl"
            >
              🔄 Nova Conta
            </Button>
          )}
        </div>

        {/* ═══ RIGHT COLUMN: Result + Explanation ══════════════ */}
        <div className="space-y-4">

          {/* Empty state */}
          {!showResult && !isLoading && (
            <div className="bg-white rounded-2xl border-2 border-dashed border-amber-200 shadow-sm p-8 flex flex-col items-center justify-center text-center min-h-[280px]">
              <span className="text-5xl mb-3 opacity-30">🏛️</span>
              <p className="text-amber-400 font-semibold text-sm">
                O resultado e a explicação<br />de Arquimedes aparecerão aqui.
              </p>
            </div>
          )}

          {/* Loading skeleton */}
          {isLoading && !showResult && (
            <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-md p-6 min-h-[280px] flex flex-col items-center justify-center gap-4">
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-3 h-3 bg-amber-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <p className="text-amber-600 text-sm font-medium">Calculando…</p>
            </div>
          )}

          {/* Result card */}
          {showResult && (
            <div className={`rounded-2xl border-2 shadow-md p-5 ${
              lastCalc!.op.activeBg.includes('green') ? 'bg-green-50 border-green-200' :
              lastCalc!.op.activeBg.includes('red') ? 'bg-red-50 border-red-200' :
              lastCalc!.op.activeBg.includes('blue') ? 'bg-blue-50 border-blue-200' :
              'bg-purple-50 border-purple-200'
            }`}>
              <p className="text-xs font-bold uppercase tracking-widest text-center text-gray-400 mb-3">
                Resultado
              </p>

              {/* Expression */}
              <div className="text-center">
                <p className="text-sm font-mono text-gray-500 break-all leading-relaxed">
                  {lastCalc!.numbers.join(` ${lastCalc!.op.symbol} `)} =
                </p>
                <div className={`text-6xl font-black font-mono mt-1 break-all ${lastCalc!.op.text}`}>
                  {resultData!.result}
                </div>
              </div>

              {/* Remainder badge + formula */}
              {hasRemainder && (
                <div className="mt-4 flex flex-col items-center gap-1">
                  <div className="inline-flex items-center gap-2 bg-white border-2 border-purple-300 rounded-xl px-4 py-2 shadow-sm">
                    <span className="text-purple-500 font-bold text-sm">Resto:</span>
                    <span className="text-2xl font-black text-purple-700 font-mono">{resultData!.remainder}</span>
                  </div>
                  <p className="text-purple-500 text-xs mt-0.5">
                    {lastCalc!.numbers[0]} = {resultData!.result} × {lastCalc!.numbers[1]} + {resultData!.remainder}
                  </p>
                </div>
              )}
              {isDivisionExact && (
                <div className="mt-4 flex justify-center">
                  <div className="inline-flex items-center gap-2 bg-white border-2 border-green-300 rounded-xl px-4 py-2 shadow-sm">
                    <span className="text-green-600 font-semibold text-sm">✓ Divisão exata — sem resto!</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Division step-by-step */}
          {showResult && lastCalc?.op.value === 'division' && resultData && (
            <div className="rounded-2xl border-2 border-purple-200 shadow-md overflow-hidden">
              <button
                onClick={() => setShowDivisionSteps(v => !v)}
                className="w-full flex items-center justify-between px-5 py-3 bg-purple-50 hover:bg-purple-100 transition-colors text-left"
              >
                <span className="flex items-center gap-2 font-bold text-purple-800 text-sm">
                  <span className="text-base">📐</span>
                  Ver passo a passo da divisão
                </span>
                <span className={`text-purple-500 text-lg font-bold transition-transform duration-200 ${showDivisionSteps ? 'rotate-180' : ''}`}>
                  ▾
                </span>
              </button>

              {showDivisionSteps && (() => {
                const steps = computeDivisionSteps(
                  lastCalc.numbers[0],
                  lastCalc.numbers[1],
                  resultData.result,
                  resultData.remainder ?? '0',
                );
                return (
                  <div className="bg-white px-5 py-4 space-y-3">
                    {steps.map((step, i) => (
                      <div
                        key={i}
                        className={`rounded-xl px-4 py-3 ${
                          step.highlight
                            ? 'bg-purple-100 border-2 border-purple-300'
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <p className="text-xs font-bold text-gray-500 mb-1">{step.label}</p>
                        <p className={`font-mono font-bold text-base ${step.highlight ? 'text-purple-800' : 'text-gray-800'}`}>
                          {step.value}
                        </p>
                        {step.detail && (
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{step.detail}</p>
                        )}
                      </div>
                    ))}
                    <p className="text-center text-xs text-purple-400 pt-1 italic">
                      Arquimedes te mostrou como a divisão funciona por dentro! 🏛️
                    </p>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Arquimedes loading */}
          {showResult && explanationMutation.isPending && (
            <div className="bg-amber-50 rounded-2xl border-2 border-amber-200 shadow-md p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🏛️</span>
                <h2 className="font-bold text-amber-900 text-base" style={{ fontFamily: 'Cinzel, serif' }}>
                  Arquimedes Explica
                </h2>
              </div>
              <div className="flex items-center gap-3 text-amber-600">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <span className="text-sm italic">Preparando a explicação…</span>
              </div>
            </div>
          )}

          {/* Arquimedes explanation */}
          {showResult && explanation !== null && !explanationMutation.isPending && (
            explanation ? (
              <div className="bg-amber-50 rounded-2xl border-2 border-amber-300 shadow-md p-5">
                <div className="flex items-center gap-2 mb-3 border-b border-amber-200 pb-3">
                  <span className="text-xl">🏛️</span>
                  <h2 className="font-bold text-amber-900 text-base" style={{ fontFamily: 'Cinzel, serif' }}>
                    Arquimedes Explica
                  </h2>
                </div>
                <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {explanation}
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 rounded-2xl border-2 border-amber-200 shadow-sm p-4 text-center text-amber-600 text-sm">
                A explicação da IA não está disponível agora. O resultado acima está correto!
              </div>
            )
          )}

          {showResult && explanationError && (
            <div className="bg-amber-50 rounded-2xl border-2 border-amber-200 shadow-sm p-4 text-center text-amber-600 text-sm">
              A explicação da IA não está disponível agora. O resultado acima está correto!
            </div>
          )}
        </div>
      </div>

      {/* ═══ HISTORY SECTION ══════════════════════════════════════ */}
      {history.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-amber-900 flex items-center gap-2" style={{ fontFamily: 'Cinzel, serif' }}>
              <span>📜</span> Histórico de Contas
            </h2>
            <button
              onClick={handleClearHistory}
              className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors font-medium"
            >
              🗑️ Limpar histórico
            </button>
          </div>

          <div className="space-y-2">
            {history.map((entry) => {
              const op = getOpForEntry(entry.operation);
              const colorBg =
                op.value === 'addition' ? 'bg-green-50 border-green-200' :
                op.value === 'subtraction' ? 'bg-red-50 border-red-200' :
                op.value === 'multiplication' ? 'bg-blue-50 border-blue-200' :
                'bg-purple-50 border-purple-200';
              const colorText =
                op.value === 'addition' ? 'text-green-700' :
                op.value === 'subtraction' ? 'text-red-700' :
                op.value === 'multiplication' ? 'text-blue-700' :
                'text-purple-700';
              const colorBadge =
                op.value === 'addition' ? 'bg-green-100 text-green-700 border-green-300' :
                op.value === 'subtraction' ? 'bg-red-100 text-red-700 border-red-300' :
                op.value === 'multiplication' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                'bg-purple-100 text-purple-700 border-purple-300';

              const expression = entry.numbers.join(` ${op.symbol} `);
              const hasRest = entry.remainder && entry.remainder !== '0';

              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 shadow-sm ${colorBg}`}
                >
                  {/* Operation badge */}
                  <span className={`flex-shrink-0 text-sm font-black w-7 h-7 flex items-center justify-center rounded-lg border ${colorBadge}`}>
                    {op.symbol}
                  </span>

                  {/* Expression + result */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-mono text-sm font-bold truncate ${colorText}`}>
                      {expression} = <span className="text-base">{entry.result}</span>
                      {hasRest && (
                        <span className="text-xs font-normal ml-1 opacity-80">(resto {entry.remainder})</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(entry.timestamp)}</p>
                  </div>

                  {/* Review button */}
                  <button
                    onClick={() => handleReview(entry)}
                    title="Rever explicação"
                    className="flex-shrink-0 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 hover:border-amber-500 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    🏛️ Rever
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
