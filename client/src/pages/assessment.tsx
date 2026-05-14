/**
 * Desafio Avaliação 16/06 - Academia dos Números
 * Desenvolvido por: Rodrigo Linhares Drummond
 * © 2025 Academia dos Números
 */

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Clock, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';

interface Question {
  id: number;
  category: string;
  type: 'multiple-choice' | 'input' | 'clock' | 'comparison';
  question: string;
  options?: string[];
  correctAnswer: string;
  userAnswer: string;
  isCorrect?: boolean | null;
  explanation?: string;
  example?: string;
}

interface CategoryStats {
  total: number;
  correct: number;
  percentage: number;
}

interface AssessmentStats {
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  percentage: number;
  categoryStats: Record<string, CategoryStats>;
}

export default function Assessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [stats, setStats] = useState<AssessmentStats | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isValidated, setIsValidated] = useState<boolean>(false);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && !isCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(time => time + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isCompleted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Geração das questões
  const generateQuestions = useCallback(() => {
    const allQuestions: Question[] = [];
    let questionId = 1;

    // 1. Sistema de numeração decimal (10 questões)
    const decimalQuestions = [
      {
        id: questionId++,
        category: 'Sistema de numeração decimal',
        type: 'multiple-choice' as const,
        question: 'No número 3.847, qual é o valor posicional do algarismo 8?',
        options: ['8 unidades', '8 dezenas', '8 centenas', '8 milhares'],
        correctAnswer: '8 centenas',
        userAnswer: '',
        explanation: 'O algarismo 8 está na casa das centenas, representando 800.'
      },
      {
        id: questionId++,
        category: 'Sistema de numeração decimal',
        type: 'input' as const,
        question: 'Decomponha o número 5.632 em ordens: _____ milhares + _____ centenas + _____ dezenas + _____ unidades',
        correctAnswer: '5 6 3 2',
        userAnswer: '',
        explanation: '5.632 = 5 milhares + 6 centenas + 3 dezenas + 2 unidades',
        example: 'Digite os números separados por espaços. Exemplo: para 1.234, digite: 1 2 3 4'
      },
      {
        id: questionId++,
        category: 'Sistema de numeração decimal',
        type: 'multiple-choice' as const,
        question: 'Qual número tem 4 milhares, 0 centenas, 7 dezenas e 9 unidades?',
        options: ['4.079', '4.709', '4.970', '4.097'],
        correctAnswer: '4.079',
        userAnswer: '',
        explanation: '4 milhares + 0 centenas + 7 dezenas + 9 unidades = 4.079'
      },
      {
        id: questionId++,
        category: 'Sistema de numeração decimal',
        type: 'input' as const,
        question: 'Qual é o sucessor de 2.999?',
        correctAnswer: '3000',
        userAnswer: '',
        explanation: 'O sucessor de 2.999 é 3.000',
        example: 'Digite apenas o número. Exemplo: o sucessor de 199 é 200'
      },
      {
        id: questionId++,
        category: 'Sistema de numeração decimal',
        type: 'multiple-choice' as const,
        question: 'Em qual posição está o algarismo 7 no número 1.753?',
        options: ['Unidades', 'Dezenas', 'Centenas', 'Milhares'],
        correctAnswer: 'Centenas',
        userAnswer: '',
        explanation: 'No número 1.753, o 7 está na casa das centenas'
      },
      {
        id: questionId++,
        category: 'Sistema de numeração decimal',
        type: 'input' as const,
        question: 'Escreva por extenso o número 6.204:',
        correctAnswer: 'seis mil duzentos e quatro',
        userAnswer: '',
        explanation: '6.204 = seis mil, duzentos e quatro',
        example: 'Escreva em palavras. Exemplo: 1.023 = mil e vinte e três'
      },
      {
        id: questionId++,
        category: 'Sistema de numeração decimal',
        type: 'multiple-choice' as const,
        question: 'Qual é o antecessor de 5.000?',
        options: ['4.999', '4.990', '4.900', '4.000'],
        correctAnswer: '4.999',
        userAnswer: '',
        explanation: 'O antecessor de 5.000 é 4.999'
      },
      {
        id: questionId++,
        category: 'Sistema de numeração decimal',
        type: 'input' as const,
        question: 'No número 8.156, quantas dezenas há ao todo?',
        correctAnswer: '815',
        userAnswer: '',
        explanation: '8.156 tem 815 dezenas ao todo (8.150 ÷ 10 = 815)',
        example: 'Digite apenas o número. Exemplo: em 234 há 23 dezenas ao todo'
      },
      {
        id: questionId++,
        category: 'Sistema de numeração decimal',
        type: 'multiple-choice' as const,
        question: 'Qual número representa 3 milhares + 5 dezenas?',
        options: ['3.050', '3.500', '3.005', '35'],
        correctAnswer: '3.050',
        userAnswer: '',
        explanation: '3 milhares + 5 dezenas = 3.000 + 50 = 3.050'
      },
      {
        id: questionId++,
        category: 'Sistema de numeração decimal',
        type: 'input' as const,
        question: 'Qual é o maior número que pode ser formado com os algarismos 2, 8, 1, 5?',
        correctAnswer: '8521',
        userAnswer: '',
        explanation: 'Organizando em ordem decrescente: 8, 5, 2, 1 = 8.521'
      }
    ];

    // 2. Números até 9.999 (10 questões)
    const numberQuestions = [
      {
        id: questionId++,
        category: 'Números até 9.999',
        type: 'multiple-choice' as const,
        question: 'Qual é o maior número de 4 algarismos?',
        options: ['9.999', '9.990', '9.900', '9.000'],
        correctAnswer: '9.999',
        userAnswer: '',
        explanation: 'O maior número de 4 algarismos é 9.999'
      },
      {
        id: questionId++,
        category: 'Números até 9.999',
        type: 'input' as const,
        question: 'Quantos números inteiros existem entre 7.995 e 8.005?',
        correctAnswer: '9',
        userAnswer: '',
        explanation: 'Entre 7.995 e 8.005: 7.996, 7.997, 7.998, 7.999, 8.000, 8.001, 8.002, 8.003, 8.004 = 9 números'
      },
      {
        id: questionId++,
        category: 'Números até 9.999',
        type: 'multiple-choice' as const,
        question: 'Qual sequência está em ordem crescente?',
        options: ['8.765, 8.756, 8.675', '8.675, 8.756, 8.765', '8.756, 8.675, 8.765', '8.765, 8.675, 8.756'],
        correctAnswer: '8.675, 8.756, 8.765',
        userAnswer: '',
        explanation: 'Ordem crescente: 8.675 < 8.756 < 8.765'
      },
      {
        id: questionId++,
        category: 'Números até 9.999',
        type: 'input' as const,
        question: 'Complete a sequência: 8.997, 8.998, 8.999, _____, _____',
        correctAnswer: '9000 9001',
        userAnswer: '',
        explanation: 'Sequência: 8.997, 8.998, 8.999, 9.000, 9.001',
        example: 'Digite os dois números separados por espaço. Exemplo: 100 101'
      },
      {
        id: questionId++,
        category: 'Números até 9.999',
        type: 'multiple-choice' as const,
        question: 'Quantos números pares existem de 9.990 a 9.999?',
        options: ['5', '4', '6', '10'],
        correctAnswer: '5',
        userAnswer: '',
        explanation: 'Números pares: 9.990, 9.992, 9.994, 9.996, 9.998 = 5 números'
      },
      {
        id: questionId++,
        category: 'Números até 9.999',
        type: 'input' as const,
        question: 'Qual é o menor número de 4 algarismos diferentes?',
        correctAnswer: '1023',
        userAnswer: '',
        explanation: 'O menor número de 4 algarismos diferentes é 1.023',
        example: 'Digite apenas o número. Exemplo: o menor de 3 algarismos diferentes é 102'
      },
      {
        id: questionId++,
        category: 'Números até 9.999',
        type: 'multiple-choice' as const,
        question: 'Em qual intervalo está o número 6.543?',
        options: ['6.000 a 6.500', '6.500 a 7.000', '6.400 a 6.600', '6.540 a 6.550'],
        correctAnswer: '6.500 a 7.000',
        userAnswer: '',
        explanation: '6.543 está entre 6.500 e 7.000'
      },
      {
        id: questionId++,
        category: 'Números até 9.999',
        type: 'input' as const,
        question: 'Arredonde 7.638 para a centena mais próxima:',
        correctAnswer: '7600',
        userAnswer: '',
        explanation: '7.638 arredondado para a centena mais próxima é 7.600',
        example: 'Digite apenas o número. Exemplo: 1.250 arredondado para centena é 1300'
      },
      {
        id: questionId++,
        category: 'Números até 9.999',
        type: 'multiple-choice' as const,
        question: 'Qual número está exatamente no meio entre 4.200 e 4.800?',
        options: ['4.400', '4.500', '4.600', '4.300'],
        correctAnswer: '4.500',
        userAnswer: '',
        explanation: 'O meio entre 4.200 e 4.800 é (4.200 + 4.800) ÷ 2 = 4.500'
      },
      {
        id: questionId++,
        category: 'Números até 9.999',
        type: 'input' as const,
        question: 'Quantas unidades de milhar há em 9.999?',
        correctAnswer: '9',
        userAnswer: '',
        explanation: 'Em 9.999 há 9 unidades de milhar',
        example: 'Digite apenas o número. Exemplo: em 5.432 há 5 unidades de milhar'
      }
    ];

    // 3. Comparação (10 questões)
    const comparisonQuestions = [
      {
        id: questionId++,
        category: 'Comparação',
        type: 'comparison' as const,
        question: 'Compare os números: 4.567 _____ 4.576',
        correctAnswer: '<',
        userAnswer: '',
        explanation: '4.567 < 4.576 porque 67 < 76 nas dezenas e unidades'
      },
      {
        id: questionId++,
        category: 'Comparação',
        type: 'multiple-choice' as const,
        question: 'Qual afirmação está correta?',
        options: ['8.999 > 9.001', '7.543 = 7.534', '6.789 < 6.798', '5.432 > 5.423'],
        correctAnswer: '6.789 < 6.798',
        userAnswer: '',
        explanation: '6.789 < 6.798 é a única afirmação correta'
      },
      {
        id: questionId++,
        category: 'Comparação',
        type: 'comparison' as const,
        question: 'Ordene os números em ordem decrescente: 3.456, 3.465, 3.445, 3.654',
        correctAnswer: '3.654, 3.465, 3.456, 3.445',
        userAnswer: '',
        explanation: 'Ordem decrescente: 3.654 > 3.465 > 3.456 > 3.445'
      },
      {
        id: questionId++,
        category: 'Comparação',
        type: 'comparison' as const,
        question: 'Complete com >, < ou =: 2.999 _____ 3.000',
        correctAnswer: '<',
        userAnswer: '',
        explanation: '2.999 < 3.000'
      },
      {
        id: questionId++,
        category: 'Comparação',
        type: 'multiple-choice' as const,
        question: 'Entre os números 8.765, 8.567, 8.675, 8.756, qual é o menor?',
        options: ['8.765', '8.567', '8.675', '8.756'],
        correctAnswer: '8.567',
        userAnswer: '',
        explanation: '8.567 é o menor porque tem 5 na casa das centenas'
      },
      {
        id: questionId++,
        category: 'Comparação',
        type: 'comparison' as const,
        question: 'Complete: 5.432 _____ 5.423',
        correctAnswer: '>',
        userAnswer: '',
        explanation: '5.432 > 5.423 porque 32 > 23 nas dezenas e unidades'
      },
      {
        id: questionId++,
        category: 'Comparação',
        type: 'input' as const,
        question: 'Qual é o maior número entre: 7.890, 7.809, 7.980, 7.098?',
        correctAnswer: '7980',
        userAnswer: '',
        explanation: '7.980 é o maior número da sequência'
      },
      {
        id: questionId++,
        category: 'Comparação',
        type: 'comparison' as const,
        question: 'Compare: 1.000 _____ 999',
        correctAnswer: '>',
        userAnswer: '',
        explanation: '1.000 > 999'
      },
      {
        id: questionId++,
        category: 'Comparação',
        type: 'multiple-choice' as const,
        question: 'Quantos números estão entre 4.995 e 5.005?',
        options: ['8', '9', '10', '11'],
        correctAnswer: '9',
        userAnswer: '',
        explanation: 'Entre 4.995 e 5.005: 4.996, 4.997, 4.998, 4.999, 5.000, 5.001, 5.002, 5.003, 5.004 = 9 números'
      },
      {
        id: questionId++,
        category: 'Comparação',
        type: 'comparison' as const,
        question: 'Ordene em ordem crescente: 6.321, 6.312, 6.231, 6.213',
        correctAnswer: '6.213, 6.231, 6.312, 6.321',
        userAnswer: '',
        explanation: 'Ordem crescente: 6.213 < 6.231 < 6.312 < 6.321'
      }
    ];

    // 4. Medindo o tempo no relógio (10 questões)
    const clockQuestions = [
      {
        id: questionId++,
        category: 'Medindo o tempo no relógio',
        type: 'clock' as const,
        question: 'Que horas são quando o ponteiro pequeno está no 3 e o grande no 12?',
        correctAnswer: '3:00',
        userAnswer: '',
        explanation: 'Quando o ponteiro das horas está no 3 e o dos minutos no 12, são 3:00',
        example: 'Digite no formato hora:minuto. Exemplo: 2:30 ou 14:45'
      },
      {
        id: questionId++,
        category: 'Medindo o tempo no relógio',
        type: 'multiple-choice' as const,
        question: 'Quantos minutos se passaram das 14:15 às 14:45?',
        options: ['30 minutos', '45 minutos', '15 minutos', '60 minutos'],
        correctAnswer: '30 minutos',
        userAnswer: '',
        explanation: 'De 14:15 às 14:45 são 30 minutos'
      },
      {
        id: questionId++,
        category: 'Medindo o tempo no relógio',
        type: 'input' as const,
        question: 'Se agora são 8:25, que horas serão daqui a 1 hora e 20 minutos?',
        correctAnswer: '9:45',
        userAnswer: '',
        explanation: '8:25 + 1:20 = 9:45',
        example: 'Digite no formato hora:minuto. Exemplo: 10:30'
      },
      {
        id: questionId++,
        category: 'Medindo o tempo no relógio',
        type: 'clock' as const,
        question: 'O ponteiro dos minutos está no 6. Quantos minutos isso representa?',
        correctAnswer: '30',
        userAnswer: '',
        explanation: 'Quando o ponteiro dos minutos está no 6, são 30 minutos (6 × 5 = 30)',
        example: 'Digite apenas o número de minutos. Exemplo: 15, 30, 45'
      },
      {
        id: questionId++,
        category: 'Medindo o tempo no relógio',
        type: 'multiple-choice' as const,
        question: 'Que horas são 15:30 no formato de 12 horas?',
        options: ['3:30 da tarde', '3:30 da manhã', '15:30 da tarde', '5:30 da tarde'],
        correctAnswer: '3:30 da tarde',
        userAnswer: '',
        explanation: '15:30 = 3:30 da tarde (15 - 12 = 3)'
      },
      {
        id: questionId++,
        category: 'Medindo o tempo no relógio',
        type: 'input' as const,
        question: 'Quantas horas há entre 7:15 e 11:45?',
        correctAnswer: '4:30',
        userAnswer: '',
        explanation: 'Entre 7:15 e 11:45 há 4 horas e 30 minutos',
        example: 'Digite no formato hora:minuto. Exemplo: 2:15 ou 3:45'
      },
      {
        id: questionId++,
        category: 'Medindo o tempo no relógio',
        type: 'clock' as const,
        question: 'Se o ponteiro das horas está entre o 2 e o 3, e o dos minutos no 9, que horas são?',
        correctAnswer: '2:45',
        userAnswer: '',
        explanation: 'Ponteiro das horas entre 2 e 3, minutos no 9 = 2:45',
        example: 'Digite no formato hora:minuto. Exemplo: 8:15 ou 12:30'
      },
      {
        id: questionId++,
        category: 'Medindo o tempo no relógio',
        type: 'multiple-choice' as const,
        question: 'Uma aula começou às 9:20 e terminou às 10:50. Quanto tempo durou?',
        options: ['1 hora e 30 minutos', '1 hora e 20 minutos', '1 hora e 40 minutos', '2 horas'],
        correctAnswer: '1 hora e 30 minutos',
        userAnswer: '',
        explanation: 'De 9:20 às 10:50 são 1 hora e 30 minutos'
      },
      {
        id: questionId++,
        category: 'Medindo o tempo no relógio',
        type: 'input' as const,
        question: 'São 16:40. Que horas eram 2 horas e 15 minutos atrás?',
        correctAnswer: '14:25',
        userAnswer: '',
        explanation: '16:40 - 2:15 = 14:25'
      },
      {
        id: questionId++,
        category: 'Medindo o tempo no relógio',
        type: 'clock' as const,
        question: 'O ponteiro dos minutos dá uma volta completa em quanto tempo?',
        correctAnswer: '60',
        userAnswer: '',
        explanation: 'O ponteiro dos minutos dá uma volta completa em 60 minutos (1 hora)'
      }
    ];

    // 5. Multiplicação, divisão e subtração (10 questões)
    const mathQuestions = [
      {
        id: questionId++,
        category: 'Multiplicação e divisão',
        type: 'input' as const,
        question: 'Calcule: 7 × 8 =',
        correctAnswer: '56',
        userAnswer: '',
        explanation: '7 × 8 = 56'
      },
      {
        id: questionId++,
        category: 'Multiplicação e divisão',
        type: 'multiple-choice' as const,
        question: 'Qual é o resultado de 72 ÷ 9?',
        options: ['6', '7', '8', '9'],
        correctAnswer: '8',
        userAnswer: '',
        explanation: '72 ÷ 9 = 8'
      },
      {
        id: questionId++,
        category: 'Multiplicação e divisão',
        type: 'input' as const,
        question: 'Complete a tabuada do 6: 6 × _____ = 42',
        correctAnswer: '7',
        userAnswer: '',
        explanation: '6 × 7 = 42',
        example: 'Digite apenas o número que falta. Exemplo: se fosse 3 × ___ = 15, você digitaria: 5'
      },
      {
        id: questionId++,
        category: 'Multiplicação e divisão',
        type: 'multiple-choice' as const,
        question: 'Maria tem 8 pacotes com 6 balas cada. Quantas balas ela tem ao todo?',
        options: ['42', '48', '54', '56'],
        correctAnswer: '48',
        userAnswer: '',
        explanation: '8 × 6 = 48 balas'
      },
      {
        id: questionId++,
        category: 'Multiplicação e divisão',
        type: 'input' as const,
        question: 'Se 45 ÷ 5 = 9, quanto é 45 ÷ 9?',
        correctAnswer: '5',
        userAnswer: '',
        explanation: 'Se 45 ÷ 5 = 9, então 45 ÷ 9 = 5',
        example: 'Digite apenas o resultado da divisão. Exemplo: 20 ÷ 4 = 5'
      },
      {
        id: questionId++,
        category: 'Multiplicação e divisão',
        type: 'multiple-choice' as const,
        question: 'Qual multiplicação tem o mesmo resultado que 4 × 9?',
        options: ['6 × 6', '8 × 4', '9 × 4', '3 × 12'],
        correctAnswer: '9 × 4',
        userAnswer: '',
        explanation: '4 × 9 = 36 e 9 × 4 = 36 (propriedade comutativa)'
      },
      {
        id: questionId++,
        category: 'Multiplicação e divisão',
        type: 'input' as const,
        question: 'João tem 63 figurinhas para dividir igualmente entre 7 amigos. Quantas figurinhas cada um receberá?',
        correctAnswer: '9',
        userAnswer: '',
        explanation: '63 ÷ 7 = 9 figurinhas para cada amigo',
        example: 'Digite apenas o número de figurinhas que cada um recebe. Exemplo: 12 ÷ 3 = 4'
      },
      {
        id: questionId++,
        category: 'Multiplicação e divisão',
        type: 'multiple-choice' as const,
        question: 'Qual é o dobro de 35?',
        options: ['60', '65', '70', '75'],
        correctAnswer: '70',
        userAnswer: '',
        explanation: 'O dobro de 35 é 35 × 2 = 70'
      },
      {
        id: questionId++,
        category: 'Multiplicação e divisão',
        type: 'input' as const,
        question: 'Complete: 8 × _____ = 64',
        correctAnswer: '8',
        userAnswer: '',
        explanation: '8 × 8 = 64'
      },
      {
        id: questionId++,
        category: 'Multiplicação e divisão',
        type: 'multiple-choice' as const,
        question: 'Se cada caixa tem 12 ovos e tenho 5 caixas, quantos ovos tenho?',
        options: ['50', '55', '60', '65'],
        correctAnswer: '60',
        userAnswer: '',
        explanation: '12 × 5 = 60 ovos'
      },
      {
        id: questionId++,
        category: 'Multiplicação e divisão',
        type: 'multiple-choice' as const,
        question: 'Qual é o resultado de 9 − 4?',
        options: ['3', '4', '5', '6'],
        correctAnswer: '5',
        userAnswer: '',
        explanation: '9 − 4 = 5'
      }
    ];

    // Combinar todas as questões
    allQuestions.push(...decimalQuestions);
    allQuestions.push(...numberQuestions);
    allQuestions.push(...comparisonQuestions);
    allQuestions.push(...clockQuestions);
    allQuestions.push(...mathQuestions);

    return allQuestions;
  }, []);

  useEffect(() => {
    setQuestions(generateQuestions());
  }, [generateQuestions]);

  const handleAnswer = (answer: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestion].userAnswer = answer;
    // Remove validação automática - apenas salva a resposta
    updatedQuestions[currentQuestion].isCorrect = null;
    setQuestions(updatedQuestions);
    setIsValidated(false);
  };

  const validateAnswer = () => {
    const updatedQuestions = [...questions];
    const currentQ = updatedQuestions[currentQuestion];
    
    // Verificar se a resposta está correta
    const isCorrect = currentQ.userAnswer.toLowerCase().trim() === currentQ.correctAnswer.toLowerCase().trim();
    currentQ.isCorrect = isCorrect;
    
    setQuestions(updatedQuestions);
    setIsValidated(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setIsValidated(false);
    } else {
      finishAssessment();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setIsValidated(false);
    }
  };

  const finishAssessment = () => {
    setIsCompleted(true);
    setIsActive(false);
    calculateStats();
    setShowResults(true);
  };

  const calculateStats = () => {
    const answeredQuestions = questions.filter(q => q.userAnswer !== '');
    const correctAnswers = questions.filter(q => q.isCorrect === true);
    
    const categoryStats: Record<string, CategoryStats> = {};
    
    // Calcular estatísticas por categoria
    const categorySet = new Set<string>();
    questions.forEach(q => categorySet.add(q.category));
    const categories = Array.from(categorySet);
    categories.forEach(category => {
      const categoryQuestions = questions.filter(q => q.category === category);
      const categoryCorrect = categoryQuestions.filter(q => q.isCorrect === true);
      
      categoryStats[category] = {
        total: categoryQuestions.length,
        correct: categoryCorrect.length,
        percentage: (categoryCorrect.length / categoryQuestions.length) * 100
      };
    });

    setStats({
      totalQuestions: questions.length,
      answeredQuestions: answeredQuestions.length,
      correctAnswers: correctAnswers.length,
      percentage: (correctAnswers.length / questions.length) * 100,
      categoryStats
    });
  };

  const resetAssessment = () => {
    setCurrentQuestion(0);
    setIsCompleted(false);
    setShowResults(false);
    setStats(null);
    setTimeElapsed(0);
    setIsActive(false);
    setQuestions(generateQuestions());
  };

  const startAssessment = () => {
    setIsActive(true);
  };

  if (questions.length === 0) {
    return <div className="flex justify-center items-center min-h-screen">Carregando avaliação...</div>;
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 greek-pattern opacity-5"></div>
      <div className="container mx-auto px-6 py-8 max-w-4xl relative">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-greek text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-700 mb-2 sm:mb-4">
            📋 Desafio Avaliação 16/06 📋
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-amber-600 font-medium italic px-4">
            Avaliação completa dos conteúdos estudados
          </p>
        </div>

        {showResults ? (
          // Tela de Resultados
          <div className="academia-container">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">
                🎯 Resultado da Avaliação
              </h2>
              
              {/* Estatísticas Gerais */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{stats?.percentage.toFixed(1)}%</div>
                  <div className="text-lg">Aproveitamento Geral</div>
                  <div className="text-sm opacity-90 mt-2">
                    {stats?.correctAnswers} acertos de {stats?.totalQuestions} questões
                  </div>
                  <div className="text-sm opacity-90">
                    Tempo total: {formatTime(timeElapsed)}
                  </div>
                </div>
              </div>

              {/* Estatísticas por Categoria */}
              <h3 className="text-xl font-bold mb-4 text-blue-700">📊 Desempenho por Conteúdo</h3>
              <div className="space-y-4 mb-6">
                {Object.entries(stats?.categoryStats || {}).map(([category, stat]) => (
                  <div key={category} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-700">{category}</span>
                      <span className="text-lg font-bold text-blue-600">{stat.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stat.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {stat.correct} de {stat.total} questões corretas
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Button
                  onClick={resetAssessment}
                  className="academia-button-primary py-3 px-8 rounded-xl shadow-lg hover:shadow-xl"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Fazer Nova Avaliação
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Tela da Questão
          <div className="academia-container">
            {/* Barra de Progresso */}
            <div className="bg-white rounded-xl p-4 mb-6 shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-600">
                  Questão {currentQuestion + 1} de {questions.length}
                </span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm font-semibold text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatTime(timeElapsed)}
                  </div>
                  {!isActive && currentQuestion === 0 && (
                    <Button 
                      onClick={startAssessment}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Iniciar
                    </Button>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Categoria e Questão */}
            <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
              <div className="bg-blue-100 rounded-lg p-3 mb-4">
                <span className="text-blue-700 font-semibold text-sm">
                  📚 {currentQ.category}
                </span>
              </div>
              
              <h3 className="text-xl font-bold mb-6 text-gray-800">
                {currentQ.question}
              </h3>

              {/* Área de Resposta */}
              <div className="mb-6">
                {currentQ.type === 'multiple-choice' && (
                  <div className="space-y-3">
                    {currentQ.options?.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(option)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                          currentQ.userAnswer === option
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <span className="font-medium text-gray-700">{String.fromCharCode(65 + index)}) </span>
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {currentQ.type === 'input' && (
                  <div className="space-y-3">
                    {currentQ.example && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-center mb-2">
                          <div className="w-4 h-4 bg-amber-400 rounded-full mr-2"></div>
                          <span className="text-sm font-medium text-amber-800">Orientação:</span>
                        </div>
                        <p className="text-sm text-amber-700">{currentQ.example}</p>
                      </div>
                    )}
                    <Input
                      type="text"
                      placeholder="Digite sua resposta..."
                      value={currentQ.userAnswer}
                      onChange={(e) => handleAnswer(e.target.value)}
                      className="text-lg p-4"
                    />
                  </div>
                )}

                {currentQ.type === 'comparison' && (
                  <div className="flex justify-center space-x-4">
                    {['<', '=', '>'].map((symbol) => (
                      <button
                        key={symbol}
                        onClick={() => handleAnswer(symbol)}
                        className={`px-8 py-4 text-2xl font-bold rounded-lg border-2 transition-all duration-200 ${
                          currentQ.userAnswer === symbol
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                )}

                {currentQ.type === 'clock' && (
                  <div className="space-y-3">
                    {currentQ.example && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-center mb-2">
                          <div className="w-4 h-4 bg-amber-400 rounded-full mr-2"></div>
                          <span className="text-sm font-medium text-amber-800">Orientação:</span>
                        </div>
                        <p className="text-sm text-amber-700">{currentQ.example}</p>
                      </div>
                    )}
                    <Input
                      type="text"
                      placeholder="Ex: 3:30, 15:45, 30, etc."
                      value={currentQ.userAnswer}
                      onChange={(e) => handleAnswer(e.target.value)}
                      className="text-lg p-4"
                    />
                  </div>
                )}
              </div>

              {/* Botão de Validação */}
              {currentQ.userAnswer && !isValidated && (
                <div className="text-center">
                  <Button
                    onClick={validateAnswer}
                    className="academia-button-primary px-8 py-3 text-lg font-semibold"
                  >
                    ✓ Validar Resposta
                  </Button>
                </div>
              )}

              {/* Feedback */}
              {currentQ.userAnswer && isValidated && currentQ.isCorrect !== undefined && (
                <div className={`p-4 rounded-lg mb-4 ${
                  currentQ.isCorrect ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
                }`}>
                  <div className="flex items-center mb-2">
                    {currentQ.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mr-2" />
                    )}
                    <span className={`font-semibold ${
                      currentQ.isCorrect ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {currentQ.isCorrect ? 'Correto!' : 'Incorreto'}
                    </span>
                  </div>
                  {currentQ.explanation && (
                    <p className="text-sm text-gray-700">{currentQ.explanation}</p>
                  )}
                  {!currentQ.isCorrect && (
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>Resposta correta:</strong> {currentQ.correctAnswer}
                    </p>
                  )}
                </div>
              )}

              {/* Navegação */}
              <div className="flex justify-between">
                <Button
                  onClick={previousQuestion}
                  disabled={currentQuestion === 0}
                  variant="outline"
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>

                <Button
                  onClick={nextQuestion}
                  disabled={!currentQ.userAnswer || !isValidated}
                  className="academia-button-primary flex items-center"
                >
                  {currentQuestion === questions.length - 1 ? 'Finalizar' : 'Próxima'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}