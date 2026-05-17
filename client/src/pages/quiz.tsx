/**
 * Quiz Cronometrado - Academia dos Números
 * Desenvolvido por: Rodrigo Linhares Drummond
 * © 2025 Academia dos Números
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useArquimedesEvents } from '@/lib/arquimedes-events';

type QuizType = 'multiplication' | 'division' | 'addition' | 'subtraction' | 'mixed' | 'squares' | 'cubes';

type QuestionOperation = 'multiplication' | 'division' | 'addition' | 'subtraction' | 'power';

interface ExponentStyleConfig {
  fontSize: number;
  marginLeft: number;
  marginRight: number;
  top: number;
}

const DEFAULT_EXPONENT_STYLE: ExponentStyleConfig = {
  fontSize: 1.25,
  marginLeft: -0.35,
  marginRight: 0.08,
  top: -0.2,
};

function useExponentStyles() {
  const [styles, setStyles] = useState<ExponentStyleConfig>(() => {
    try {
      const saved = localStorage.getItem('exponentStyles');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_EXPONENT_STYLE, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to parse exponent styles from localStorage, using defaults', error);
    }
    return DEFAULT_EXPONENT_STYLE;
  });

  const updateStyles = (newStyles: ExponentStyleConfig) => {
    setStyles(newStyles);
    try {
      localStorage.setItem('exponentStyles', JSON.stringify(newStyles));
    } catch (error) {
      console.error('Failed to save exponent styles to localStorage', error);
    }
  };

  const resetStyles = () => {
    setStyles(DEFAULT_EXPONENT_STYLE);
    try {
      localStorage.setItem('exponentStyles', JSON.stringify(DEFAULT_EXPONENT_STYLE));
    } catch (error) {
      console.error('Failed to reset exponent styles in localStorage', error);
    }
  };

  const currentStyles = styles;
  return { styles: currentStyles, updateStyles, resetStyles };
}

interface BaseQuestion {
  id: number;
  answer: number;
  userAnswer: string;
  isCorrect: boolean | null;
}

interface MultiplicationQuestion extends BaseQuestion {
  operation: 'multiplication';
  multiplicand: number;
  multiplier: number;
}

interface DivisionQuestion extends BaseQuestion {
  operation: 'division';
  dividend: number;
  divisor: number;
}

interface AdditionQuestion extends BaseQuestion {
  operation: 'addition';
  num1: number;
  num2: number;
}

interface SubtractionQuestion extends BaseQuestion {
  operation: 'subtraction';
  minuend: number;
  subtrahend: number;
}

interface PowerQuestion extends BaseQuestion {
  operation: 'power';
  base: number;
  exponent: number;
  prompt: string;
}

type Question = MultiplicationQuestion | DivisionQuestion | AdditionQuestion | SubtractionQuestion | PowerQuestion;

interface WrongAnswer {
  operation: QuestionOperation;
  prompt: string;
  correctAnswer: number;
  userAnswer: string;
}

interface QuizState {
  questions: Question[];
  isCompleted: boolean;
  stats: {
    correct: number;
    total: number;
    wrongAnswers: WrongAnswer[];
  };
}

interface TimerState {
  selectedTime: number;
  remainingTime: number;
  isActive: boolean;
  isConfigured: boolean;
}

interface QuizSettings {
  questionCount: number;
  quizType: QuizType;
  mixedOperations: {
    addition: boolean;
    subtraction: boolean;
    multiplication: boolean;
    division: boolean;
  };
}

export default function Quiz() {
  const { dispatchArquimedesEvent } = useArquimedesEvents();
  const quizCompletedRef = useRef(false);

  const [settings, setSettings] = useState<QuizSettings>({
    questionCount: 20,
    quizType: 'multiplication',
    mixedOperations: {
      addition: true,
      subtraction: true,
      multiplication: true,
      division: true
    }
  });

  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    isCompleted: false,
    stats: { 
      correct: 0, 
      total: 20,
      wrongAnswers: []
    }
  });

  const [timer, setTimer] = useState<TimerState>({
    selectedTime: 2,
    remainingTime: 0,
    isActive: false,
    isConfigured: false
  });

  const { styles: exponentStyles, updateStyles: updateExponentStyles, resetStyles: resetExponentStyles } = useExponentStyles();
  
  const [tempStyles, setTempStyles] = useState<ExponentStyleConfig>(exponentStyles);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleOpenEditor = () => {
    setTempStyles(exponentStyles);
    setIsEditorOpen(true);
  };

  const handleApplyStyles = () => {
    updateExponentStyles(tempStyles);
    setIsEditorOpen(false);
  };

  const handleResetStyles = () => {
    resetExponentStyles();
    setTempStyles(DEFAULT_EXPONENT_STYLE);
  };

  const generateMultiplicationQuestion = (id: number, usedExpressions: Set<string>): MultiplicationQuestion => {
    let multiplicand: number;
    let multiplier: number;
    let expression: string;

    // Gerar até encontrar uma expressão única
    do {
      multiplicand = Math.floor(Math.random() * 10) + 1;
      multiplier = Math.floor(Math.random() * 10) + 1;
      // Normalizar a expressão (3×4 e 4×3 são consideradas diferentes)
      expression = `${multiplicand}×${multiplier}`;
    } while (usedExpressions.has(expression));

    usedExpressions.add(expression);

    return {
      id,
      operation: 'multiplication',
      multiplicand,
      multiplier,
      answer: multiplicand * multiplier,
      userAnswer: '',
      isCorrect: null
    };
  };

  const generateDivisionQuestion = (id: number, usedExpressions: Set<string>): DivisionQuestion => {
    let divisor: number;
    let quotient: number;
    let dividend: number;
    let expression: string;

    // Gerar até encontrar uma expressão única
    do {
      divisor = Math.floor(Math.random() * 10) + 1;
      quotient = Math.floor(Math.random() * 10) + 1;
      dividend = divisor * quotient;
      expression = `${dividend}÷${divisor}`;
    } while (usedExpressions.has(expression));

    usedExpressions.add(expression);

    return {
      id,
      operation: 'division',
      dividend,
      divisor,
      answer: quotient,
      userAnswer: '',
      isCorrect: null
    };
  };

  const generateAdditionQuestion = (id: number, usedExpressions: Set<string>): AdditionQuestion => {
    let num1: number;
    let num2: number;
    let expression: string;

    do {
      num1 = Math.floor(Math.random() * 11); // 0-10
      num2 = Math.floor(Math.random() * 10) + 1; // 1-10
      expression = `${num1}+${num2}`;
    } while (usedExpressions.has(expression));

    usedExpressions.add(expression);

    return {
      id,
      operation: 'addition',
      num1,
      num2,
      answer: num1 + num2,
      userAnswer: '',
      isCorrect: null
    };
  };

  const generateSubtractionQuestion = (id: number, usedExpressions: Set<string>): SubtractionQuestion => {
    let minuend: number;
    let subtrahend: number;
    let expression: string;

    do {
      minuend = Math.floor(Math.random() * 11);
      subtrahend = Math.floor(Math.random() * (minuend + 1));
      expression = `${minuend}-${subtrahend}`;
    } while (usedExpressions.has(expression));

    usedExpressions.add(expression);

    return {
      id,
      operation: 'subtraction',
      minuend,
      subtrahend,
      answer: minuend - subtrahend,
      userAnswer: '',
      isCorrect: null
    };
  };

  const generateSquareQuestion = (id: number, base: number): PowerQuestion => {
    const answer = Math.pow(base, 2);
    return {
      id,
      operation: 'power',
      base,
      exponent: 2,
      answer,
      prompt: `${base}² = ${base} × ${base} = ?`,
      userAnswer: '',
      isCorrect: null
    };
  };

  const generateCubeQuestion = (id: number, base: number): PowerQuestion => {
    const answer = Math.pow(base, 3);
    return {
      id,
      operation: 'power',
      base,
      exponent: 3,
      answer,
      prompt: `${base}³ = ${base} × ${base} × ${base} = ?`,
      userAnswer: '',
      isCorrect: null
    };
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateAllQuestions = useCallback((count: number, type: QuizType): Question[] => {
    const questions: Question[] = [];
    const usedExpressions = new Set<string>();
    const mixedTypes = [
      settings.mixedOperations.addition ? 'addition' : null,
      settings.mixedOperations.subtraction ? 'subtraction' : null,
      settings.mixedOperations.multiplication ? 'multiplication' : null,
      settings.mixedOperations.division ? 'division' : null
    ].filter(Boolean) as Array<'addition' | 'subtraction' | 'multiplication' | 'division'>;
    const safeMixedTypes: Array<'addition' | 'subtraction' | 'multiplication' | 'division'> = mixedTypes.length > 0 ? mixedTypes : ['addition'];

    // Quadrados e Cubos sempre usam 10 questões fixas (bases 1-10)
    if (type === 'squares' || type === 'cubes') {
      const bases = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      bases.forEach((base, index) => {
        const question = type === 'squares'
          ? generateSquareQuestion(index + 1, base)
          : generateCubeQuestion(index + 1, base);
        questions.push(question);
      });
      return questions;
    }

    // Outros tipos usam o count normalmente
    for (let i = 0; i < count; i++) {
      let question: Question;

      if (type === 'multiplication') {
        question = generateMultiplicationQuestion(i + 1, usedExpressions);
      } else if (type === 'division') {
        question = generateDivisionQuestion(i + 1, usedExpressions);
      } else if (type === 'addition') {
        question = generateAdditionQuestion(i + 1, usedExpressions);
      } else if (type === 'subtraction') {
        question = generateSubtractionQuestion(i + 1, usedExpressions);
      } else {
        // mixed com distribuição igual — tratado fora do loop
        question = generateAdditionQuestion(i + 1, usedExpressions); // placeholder, substituído abaixo
      }

      questions.push(question);
    }

    // Para o modo misto, substitui todo o array com distribuição garantidamente igual
    if (type === 'mixed') {
      questions.length = 0;
      const numOps = safeMixedTypes.length;
      const base = Math.floor(count / numOps);
      const remainder = count % numOps;

      // Monta lista de slots: cada operação recebe `base` vagas + 1 extra para as primeiras `remainder`
      const slots: Array<'addition' | 'subtraction' | 'multiplication' | 'division'> = [];
      safeMixedTypes.forEach((op, idx) => {
        const qty = base + (idx < remainder ? 1 : 0);
        for (let j = 0; j < qty; j++) slots.push(op);
      });

      // Embaralha os slots para intercalar as operações aleatoriamente
      const shuffledSlots = shuffleArray(slots);
      const usedExpMixed = new Set<string>();

      shuffledSlots.forEach((opType, i) => {
        let q: Question;
        if (opType === 'addition') q = generateAdditionQuestion(i + 1, usedExpMixed);
        else if (opType === 'subtraction') q = generateSubtractionQuestion(i + 1, usedExpMixed);
        else if (opType === 'multiplication') q = generateMultiplicationQuestion(i + 1, usedExpMixed);
        else q = generateDivisionQuestion(i + 1, usedExpMixed);
        questions.push(q);
      });
    }

    return questions;
  }, [settings.mixedOperations]);

  const startQuiz = useCallback(() => {
    const questions = generateAllQuestions(settings.questionCount, settings.quizType);
    const totalQuestions = (settings.quizType === 'squares' || settings.quizType === 'cubes') ? 10 : settings.questionCount;
    setQuizState({
      questions,
      isCompleted: false,
      stats: { 
        correct: 0, 
        total: totalQuestions,
        wrongAnswers: []
      }
    });
  }, [generateAllQuestions, settings.questionCount, settings.quizType]);

  useEffect(() => {
    startQuiz();
    quizCompletedRef.current = false;
  }, [startQuiz]);

  useEffect(() => {
    if (quizState.isCompleted && !quizCompletedRef.current) {
      quizCompletedRef.current = true;
      const { correct, total } = quizState.stats;
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

      let maxStreak = 0;
      let currentStreak = 0;
      for (const q of quizState.questions) {
        if (q.isCorrect === false) {
          currentStreak++;
          if (currentStreak > maxStreak) maxStreak = currentStreak;
        } else {
          currentStreak = 0;
        }
      }

      if (accuracy === 100) {
        dispatchArquimedesEvent('perfect_score', { correct, total, accuracy });
      } else if (maxStreak >= 3) {
        dispatchArquimedesEvent('wrong_streak', { streak: maxStreak, correct, total, accuracy });
      } else {
        dispatchArquimedesEvent('quiz_complete', { correct, total, accuracy });
      }
    }
  }, [quizState.isCompleted, quizState.stats, quizState.questions, dispatchArquimedesEvent]);

  const handleAnswerChange = useCallback((questionId: number, value: string) => {
    if (!timer.isConfigured || timer.isActive) {
      setQuizState(prev => ({
        ...prev,
        questions: prev.questions.map(q =>
          q.id === questionId ? { ...q, userAnswer: value } : q
        )
      }));
    }
  }, [timer.isActive, timer.isConfigured]);

  const getQuestionPrompt = (q: Question): string => {
    if (q.operation === 'multiplication') {
      return `${q.multiplicand} × ${q.multiplier} = ${q.answer}`;
    } else if (q.operation === 'division') {
      return `${q.dividend} ÷ ${q.divisor} = ${q.answer}`;
    } else if (q.operation === 'addition') {
      return `${q.num1} + ${q.num2} = ${q.answer}`;
    } else if (q.operation === 'subtraction') {
      return `${q.minuend} − ${q.subtrahend} = ${q.answer}`;
    } else {
      return q.prompt.replace(' = ?', ` = ${q.answer}`);
    }
  };

  const submitAnswers = useCallback(() => {
    setQuizState(prev => {
      const updatedQuestions = prev.questions.map(q => {
        const userAnswer = parseInt(q.userAnswer);
        const isCorrect = !isNaN(userAnswer) && userAnswer === q.answer;
        return { ...q, isCorrect };
      });

      const correctCount = updatedQuestions.filter(q => q.isCorrect).length;
      const wrongAnswers: WrongAnswer[] = updatedQuestions
        .filter(q => !q.isCorrect)
        .map(q => ({
          operation: q.operation,
          prompt: getQuestionPrompt(q),
          correctAnswer: q.answer,
          userAnswer: q.userAnswer || 'Não respondido'
        }));

      const totalQuestions = (settings.quizType === 'squares' || settings.quizType === 'cubes') ? 10 : settings.questionCount;

      return {
        ...prev,
        questions: updatedQuestions,
        isCompleted: true,
        stats: {
          correct: correctCount,
          total: totalQuestions,
          wrongAnswers
        }
      };
    });
    
    setTimer(prev => ({ ...prev, isActive: false }));
  }, [settings.questionCount, settings.quizType]);

  const getRecommendedTime = useCallback((questionCount: number): number => {
    if (questionCount <= 10) return 1;
    if (questionCount <= 20) return 2;
    if (questionCount <= 30) return 3;
    if (questionCount <= 50) return 5;
    if (questionCount <= 70) return 7;
    return 10;
  }, []);

  const handleQuestionCountChange = useCallback((value: string) => {
    const count = parseInt(value);
    const recommendedTime = getRecommendedTime(count);
    
    setSettings(prev => ({ ...prev, questionCount: count }));
    
    setTimer(prev => ({
      ...prev,
      selectedTime: recommendedTime,
      remainingTime: recommendedTime * 60,
      isActive: false,
      isConfigured: false
    }));
  }, [getRecommendedTime]);

  const handleTabChange = useCallback((value: string) => {
    const newType = value as QuizType;
    
    // Quadrados e Cubos sempre usam 10 questões e 1 minuto
    if (newType === 'squares' || newType === 'cubes') {
      setSettings(prev => ({ ...prev, quizType: newType, questionCount: 10 }));
      const questions = generateAllQuestions(10, newType);
      setQuizState({
        questions,
        isCompleted: false,
        stats: { 
          correct: 0, 
          total: 10,
          wrongAnswers: []
        }
      });
      setTimer({
        selectedTime: 1,
        remainingTime: 60,
        isActive: false,
        isConfigured: false
      });
    } else {
      // Outros tipos mantêm as configurações do usuário
      setSettings(prev => ({ ...prev, quizType: newType }));
      const questions = generateAllQuestions(settings.questionCount, newType);
      setQuizState({
        questions,
        isCompleted: false,
        stats: { 
          correct: 0, 
          total: settings.questionCount,
          wrongAnswers: []
        }
      });
      setTimer(prev => ({
        ...prev,
        isActive: false,
        remainingTime: prev.selectedTime * 60,
        isConfigured: false
      }));
    }
  }, [generateAllQuestions, settings.questionCount]);

  const handleMixedOperationChange = useCallback((operation: keyof QuizSettings['mixedOperations']) => {
    setSettings(prev => ({
      ...prev,
      mixedOperations: {
        ...prev.mixedOperations,
        [operation]: !prev.mixedOperations[operation]
      }
    }));
  }, []);

  const resetQuiz = useCallback(() => {
    startQuiz();
    setTimer(prev => ({
      ...prev,
      isActive: false,
      remainingTime: prev.selectedTime * 60,
      isConfigured: false
    }));
  }, [startQuiz]);

  const startTimer = useCallback(() => {
    setTimer(prev => ({
      ...prev,
      remainingTime: prev.isConfigured ? prev.remainingTime : prev.selectedTime * 60,
      isActive: true,
      isConfigured: true
    }));
  }, []);

  const pauseTimer = useCallback(() => {
    setTimer(prev => ({ ...prev, isActive: false }));
  }, []);

  const resetTimer = useCallback(() => {
    setTimer(prev => ({
      ...prev,
      remainingTime: prev.selectedTime * 60,
      isActive: false
    }));
  }, []);

  const handleTimeSelect = useCallback((value: string) => {
    const minutes = parseInt(value);
    setTimer(prev => ({
      ...prev,
      selectedTime: minutes,
      remainingTime: minutes * 60,
      isActive: false
    }));
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timer.isActive && timer.remainingTime > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev.remainingTime <= 1) {
            if (!quizState.isCompleted) {
              setTimeout(submitAnswers, 100);
            }
            return { ...prev, remainingTime: 0, isActive: false };
          }
          return { ...prev, remainingTime: prev.remainingTime - 1 };
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timer.isActive, timer.remainingTime, quizState.isCompleted, submitAnswers]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const accuracyPercentage = quizState.stats.total > 0 
    ? Math.round((quizState.stats.correct / quizState.stats.total) * 100) 
    : 0;

  const renderExponent = (text: string, customStyles?: ExponentStyleConfig) => {
    if (!text) return '';
    const styles = customStyles || exponentStyles;
    const parts = text.split(/(²|³)/);
    return parts.map((part, index) => {
      if (part === '²' || part === '³') {
        return (
          <span 
            key={index} 
            className="inline-block font-bold align-super relative"
            style={{ 
              fontSize: `${styles.fontSize}em`,
              verticalAlign: 'super',
              top: `${styles.top}em`,
              lineHeight: '0',
              fontWeight: '800',
              marginLeft: `${styles.marginLeft}em`,
              marginRight: `${styles.marginRight}em`
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const getQuestionDisplay = (question: Question) => {
    const Eq = () => <span className="math-op math-op-eq">=</span>;
    if (question.operation === 'multiplication') {
      return <>{question.multiplicand} <span className="math-op math-op-mul">×</span> {question.multiplier} <Eq /></>;
    } else if (question.operation === 'division') {
      return <>{question.dividend} <span className="math-op math-op-div">÷</span> {question.divisor} <Eq /></>;
    } else if (question.operation === 'addition') {
      return <>{question.num1} <span className="math-op math-op-add">+</span> {question.num2} <Eq /></>;
    } else if (question.operation === 'subtraction') {
      return <>{question.minuend} <span className="math-op math-op-sub">−</span> {question.subtrahend} <Eq /></>;
    } else {
      return question.prompt ? renderExponent(question.prompt) : '';
    }
  };

  const getQuizTitle = () => {
    if (settings.quizType === 'multiplication') return 'Multiplicação';
    if (settings.quizType === 'division') return 'Divisão';
    if (settings.quizType === 'addition') return 'Adição';
    if (settings.quizType === 'subtraction') return 'Subtração';
    if (settings.quizType === 'squares') return renderExponent('Quadrados (n²)');
    if (settings.quizType === 'cubes') return renderExponent('Cubos (n³)');
    return 'Misto (Adição, Multiplicação e Divisão)';
  };

  const quizTypeOptions: { value: QuizType; label: string; icon: string }[] = [
    { value: 'multiplication', label: 'Multiplicação', icon: '✖️' },
    { value: 'division', label: 'Divisão', icon: '➗' },
    { value: 'addition', label: 'Adição', icon: '➕' },
    { value: 'subtraction', label: 'Subtração', icon: '➖' },
    { value: 'squares', label: 'Quadrados', icon: '🔲' },
    { value: 'cubes', label: 'Cubos', icon: '🧊' },
    { value: 'mixed', label: 'Misto', icon: '🔀' },
  ];

  return (
    <div className="flex flex-col px-3 pt-3 pb-4 gap-2">

      {/* Compact Header */}
      <div className="text-center">
        <h1 className="academia-title text-2xl sm:text-3xl leading-tight">🎯 Desafio dos Campeões 🎯</h1>
        <p className="academia-subtitle text-sm">Escolha seu desafio e teste seus conhecimentos</p>
      </div>

      {/* 3-column body */}
      <div className="flex gap-3 items-start">

        {/* ── LEFT: Configurações ── */}
        <aside className="w-48 lg:w-52 flex-shrink-0 flex flex-col gap-2 sticky top-2">

          {/* Tipo de desafio */}
          <div className="academia-container p-3">
            <p className="font-greek font-bold text-xs text-muted-foreground uppercase tracking-wide mb-2">Tipo de Desafio</p>
            <div className="flex flex-col gap-1">
              {quizTypeOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleTabChange(opt.value)}
                  data-testid={`tab-${opt.value}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm font-greek font-semibold transition-all ${
                    settings.quizType === opt.value
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'hover:bg-muted text-card-foreground'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantidade de questões */}
          <div className="academia-container p-3">
            <p className="font-greek font-bold text-xs text-muted-foreground uppercase tracking-wide mb-2">Questões</p>
            {settings.quizType === 'squares' || settings.quizType === 'cubes' ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                <p className="text-blue-800 font-bold font-greek text-lg">10</p>
                <p className="text-blue-600 text-xs font-greek">Questões fixas<br/>(bases 1 a 10)</p>
              </div>
            ) : (
              <Select value={settings.questionCount.toString()} onValueChange={handleQuestionCountChange}>
                <SelectTrigger className="w-full text-sm border-border bg-background" data-testid="select-question-count">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10,20,30,40,50,60,70,80,90,100].map(n => (
                    <SelectItem key={n} value={n.toString()}>{n} questões</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Operações do modo misto */}
          {settings.quizType === 'mixed' && (
            <div className="academia-container p-3">
              <p className="font-greek font-bold text-xs text-muted-foreground uppercase tracking-wide mb-2">Operações (Misto)</p>
              <div className="flex flex-col gap-1">
                {(['addition','subtraction','multiplication','division'] as const).map(op => {
                  const labels = { addition: 'Adição', subtraction: 'Subtração', multiplication: 'Multiplicação', division: 'Divisão' };
                  return (
                    <label key={op} className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5 cursor-pointer hover:bg-muted text-sm">
                      <input
                        type="checkbox"
                        checked={settings.mixedOperations[op]}
                        onChange={() => handleMixedOperationChange(op)}
                      />
                      <span className="font-greek">{labels[op]}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Novo desafio */}
          <Button
            onClick={resetQuiz}
            className="w-full bg-muted hover:bg-muted/80 text-muted-foreground font-greek font-semibold py-2 text-sm rounded-xl"
            data-testid="button-new-quiz"
          >
            🔄 Novo Desafio
          </Button>
        </aside>

        {/* ── CENTER: Questões ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">

          {/* Heading */}
          <div className="academia-container p-3">
            <h3 className="academia-subtitle text-center text-base">
              📝 {quizState.questions.length} Questões de {getQuizTitle()}
            </h3>
          </div>

          {/* Timer blocked warning */}
          {timer.isConfigured && !timer.isActive && !quizState.isCompleted && (
            <div className="p-3 bg-amber-100 border border-amber-300 rounded-lg text-center">
              <p className="text-amber-800 font-semibold font-greek text-sm">
                ⏸️ Timer pausado — inicie o timer para responder!
              </p>
            </div>
          )}

          {/* Questions grid */}
          <div className="academia-container p-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {quizState.questions.map((question, index) => (
                <div key={question.id} className="bg-background rounded-xl p-3 border-2 border-border">
                  <div className="text-center mb-2">
                    <span className="text-xs text-red-600 font-medium">{index + 1}</span>
                    <div className="text-xl font-bold text-card-foreground font-math">
                      {getQuestionDisplay(question)}
                    </div>
                  </div>
                  <input
                    type="number"
                    value={question.userAnswer}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    disabled={(timer.isConfigured && !timer.isActive) || quizState.isCompleted}
                    className={`w-full text-center text-lg font-semibold border-2 rounded-lg p-1.5 transition-colors duration-300 font-math ${
                      quizState.isCompleted
                        ? question.isCorrect
                          ? 'bg-green-100 border-green-300 text-green-800'
                          : question.isCorrect === false
                            ? 'bg-red-100 border-red-300 text-red-800'
                            : 'bg-background border-border text-card-foreground'
                        : timer.isConfigured && !timer.isActive
                          ? 'bg-muted border-border cursor-not-allowed text-muted-foreground'
                          : 'border-border bg-background text-card-foreground focus:border-primary focus:ring-2 focus:ring-primary/20'
                    } [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                    placeholder="?"
                    data-testid={`input-answer-${question.id}`}
                  />
                  {quizState.isCompleted && question.isCorrect === false && (
                    <div className="text-red-600 font-semibold mt-1 text-xs text-center font-greek">
                      ✓ {question.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit button */}
          {!quizState.isCompleted && (
            <div className="text-center">
              <Button
                onClick={submitAnswers}
                className="academia-button-primary py-3 px-10 rounded-xl shadow-lg hover:shadow-xl"
                data-testid="button-submit-quiz"
              >
                ✅ Finalizar Desafio
              </Button>
            </div>
          )}

          {/* Results */}
          {quizState.isCompleted && (
            <div className="academia-container p-4">
              <h3 className="academia-subtitle text-center mb-4 text-base">📊 Resultado Final</h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-green-100 rounded-xl border border-green-200">
                  <div className="text-3xl font-bold text-green-600 font-greek" data-testid="stats-correct">{quizState.stats.correct}</div>
                  <div className="text-green-800 font-semibold text-xs">Acertos</div>
                </div>
                <div className="text-center p-3 bg-red-100 rounded-xl border border-red-200">
                  <div className="text-3xl font-bold text-red-600 font-greek" data-testid="stats-errors">{quizState.stats.wrongAnswers.length}</div>
                  <div className="text-red-800 font-semibold text-xs">Erros</div>
                </div>
                <div className="text-center p-3 bg-blue-100 rounded-xl border border-blue-200">
                  <div className="text-3xl font-bold text-primary font-greek" data-testid="stats-accuracy">{accuracyPercentage}%</div>
                  <div className="text-primary font-semibold text-xs">Precisão</div>
                </div>
              </div>

              {quizState.stats.wrongAnswers.length > 0 && (
                <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
                  <h4 className="text-sm font-bold text-red-800 mb-3 text-center font-greek">
                    🎯 Questões para revisar ({quizState.stats.wrongAnswers.length} erros)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {quizState.stats.wrongAnswers.map((wrong, index) => (
                      <div key={index} className="bg-card rounded-lg p-2 border border-red-300">
                        <div className="text-center">
                          <div className="font-bold text-red-800 font-greek text-sm">
                            {wrong.operation === 'power' ? renderExponent(wrong.prompt) : wrong.prompt}
                          </div>
                          <div className="text-xs text-red-600">Sua resp.: {wrong.userAnswer}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-2 bg-amber-100 border border-amber-300 rounded-lg">
                    <p className="text-amber-800 text-xs text-center font-greek">
                      💡 Pratique essas questões específicas para melhorar!
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: Cronômetro ── */}
        <aside className="w-44 lg:w-48 flex-shrink-0 flex flex-col gap-2 sticky top-2">

          <div className="academia-container p-3 flex flex-col items-center gap-3">
            <p className="font-greek font-bold text-xs text-muted-foreground uppercase tracking-wide">⏱️ Cronômetro</p>

            {/* Big timer display */}
            <div
              className={`text-5xl font-bold font-greek leading-none ${
                timer.remainingTime <= 60 && timer.remainingTime > 0
                  ? 'text-red-500 animate-pulse'
                  : timer.isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
              }`}
              data-testid="timer-display"
            >
              {formatTime(timer.remainingTime)}
            </div>

            {/* Status */}
            <div className="text-xs text-center text-card-foreground font-greek">
              {timer.remainingTime <= 60 && timer.remainingTime > 0
                ? '⚠️ Último minuto!'
                : timer.isActive
                  ? '🏃‍♂️ Correndo...'
                  : timer.isConfigured
                    ? '⏸️ Pausado'
                    : '⏰ Aguardando'}
            </div>

            {/* Time selector */}
            <Select value={timer.selectedTime.toString()} onValueChange={handleTimeSelect} disabled={timer.isActive}>
              <SelectTrigger className="w-full text-sm border-border bg-background" data-testid="select-timer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 min</SelectItem>
                <SelectItem value="2">2 min</SelectItem>
                <SelectItem value="3">3 min</SelectItem>
                <SelectItem value="5">5 min</SelectItem>
                <SelectItem value="7">7 min</SelectItem>
                <SelectItem value="10">10 min</SelectItem>
              </SelectContent>
            </Select>

            {/* Start / Pause */}
            {!timer.isActive ? (
              <Button
                onClick={startTimer}
                className="w-full academia-button-primary py-2 text-sm rounded-xl"
                data-testid="button-start-timer"
              >
                ▶️ {timer.isConfigured ? 'Continuar' : 'Iniciar'}
              </Button>
            ) : (
              <Button
                onClick={pauseTimer}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-greek font-semibold py-2 text-sm rounded-xl"
                data-testid="button-pause-timer"
              >
                ⏸️ Pausar
              </Button>
            )}

            {/* Reset timer */}
            <Button
              onClick={resetTimer}
              className="w-full bg-muted hover:bg-muted/80 text-muted-foreground font-greek font-semibold py-1.5 text-xs rounded-xl"
              data-testid="button-reset-timer"
            >
              🔄 Resetar Timer
            </Button>
          </div>

          {/* Mini stats while active */}
          {(timer.isActive || quizState.isCompleted) && (
            <div className="academia-container p-3 text-center">
              <p className="font-greek font-bold text-xs text-muted-foreground uppercase tracking-wide mb-2">Progresso</p>
              <div className="text-2xl font-bold text-green-600 font-greek">
                {quizState.questions.filter(q => q.userAnswer !== '').length}
                <span className="text-sm text-muted-foreground font-greek">/{quizState.questions.length}</span>
              </div>
              <p className="text-xs text-muted-foreground font-greek">respondidas</p>
            </div>
          )}
        </aside>

      </div>

      {/* Hidden exponent editor dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        {/* DialogTrigger hidden */}
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-greek">⚙️ Editor de Expoentes</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Preview */}
                <div className="bg-muted rounded-lg p-6 text-center">
                  <div className="text-3xl font-greek font-bold">
                    {renderExponent('2² = 2 × 2 = 4', tempStyles)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Preview ao vivo</p>
                </div>

                {/* Controls */}
                <div className="space-y-4">
                  {/* Font Size */}
                  <div>
                    <label htmlFor="fontSize-slider" className="text-sm font-semibold mb-2 block">
                      Tamanho da Fonte: {tempStyles.fontSize.toFixed(2)}em
                    </label>
                    <input
                      id="fontSize-slider"
                      type="range"
                      min="0.8"
                      max="2.0"
                      step="0.05"
                      value={tempStyles.fontSize}
                      onChange={(e) => setTempStyles({ ...tempStyles, fontSize: parseFloat(e.target.value) })}
                      className="w-full"
                      aria-label="Tamanho da fonte do expoente"
                    />
                  </div>

                  {/* Horizontal Position (Left) */}
                  <div>
                    <label htmlFor="marginLeft-slider" className="text-sm font-semibold mb-2 block">
                      Posição Horizontal: {tempStyles.marginLeft.toFixed(2)}em
                    </label>
                    <input
                      id="marginLeft-slider"
                      type="range"
                      min="-1.0"
                      max="0.5"
                      step="0.05"
                      value={tempStyles.marginLeft}
                      onChange={(e) => setTempStyles({ ...tempStyles, marginLeft: parseFloat(e.target.value) })}
                      className="w-full"
                      aria-label="Posição horizontal do expoente"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Negativo = mais próximo | Positivo = mais afastado
                    </p>
                  </div>

                  {/* Horizontal Position (Right) */}
                  <div>
                    <label htmlFor="marginRight-slider" className="text-sm font-semibold mb-2 block">
                      Espaço à Direita: {tempStyles.marginRight.toFixed(2)}em
                    </label>
                    <input
                      id="marginRight-slider"
                      type="range"
                      min="-0.5"
                      max="0.5"
                      step="0.02"
                      value={tempStyles.marginRight}
                      onChange={(e) => setTempStyles({ ...tempStyles, marginRight: parseFloat(e.target.value) })}
                      className="w-full"
                      aria-label="Espaço à direita do expoente"
                    />
                  </div>

                  {/* Vertical Position */}
                  <div>
                    <label htmlFor="top-slider" className="text-sm font-semibold mb-2 block">
                      Posição Vertical: {tempStyles.top.toFixed(2)}em
                    </label>
                    <input
                      id="top-slider"
                      type="range"
                      min="-0.8"
                      max="0.2"
                      step="0.05"
                      value={tempStyles.top}
                      onChange={(e) => setTempStyles({ ...tempStyles, top: parseFloat(e.target.value) })}
                      className="w-full"
                      aria-label="Posição vertical do expoente"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Negativo = mais elevado | Positivo = mais baixo
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    onClick={handleResetStyles} 
                    variant="outline" 
                    className="flex-1"
                  >
                    🔄 Resetar
                  </Button>
                  <Button 
                    onClick={handleApplyStyles} 
                    className="flex-1 academia-button-primary"
                  >
                    ✅ Aplicar
                  </Button>
                </div>
              </div>
            </DialogContent>
      </Dialog>
    </div>
  );
}
