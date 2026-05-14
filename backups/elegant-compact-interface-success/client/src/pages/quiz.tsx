/**
 * Quiz Cronometrado - Academia dos Números
 * Desenvolvido por: Rodrigo Linhares Drummond
 * © 2025 Academia dos Números
 */

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import VirtualAssistant from '@/components/virtual-assistant';

interface Question {
  id: number;
  multiplicand: number;
  multiplier: number;
  answer: number;
  userAnswer: string;
  isCorrect: boolean | null;
}

interface QuizState {
  questions: Question[];
  isCompleted: boolean;
  stats: {
    correct: number;
    total: number;
    wrongAnswers: Array<{
      multiplicand: number;
      multiplier: number;
      correctAnswer: number;
      userAnswer: string;
    }>;
  };
}

interface TimerState {
  selectedTime: number; // em minutos
  remainingTime: number; // em segundos
  isActive: boolean;
  isConfigured: boolean;
}

interface QuizSettings {
  questionCount: number;
}

export default function Quiz() {
  const [settings, setSettings] = useState<QuizSettings>({
    questionCount: 20
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

  const [showAssistant, setShowAssistant] = useState(true);

  const [timer, setTimer] = useState<TimerState>({
    selectedTime: 2, // padrão para 20 questões
    remainingTime: 0,
    isActive: false,
    isConfigured: false
  });

  const generateAllQuestions = useCallback((count: number): Question[] => {
    const questions: Question[] = [];
    
    for (let i = 0; i < count; i++) {
      // Gerar multiplicação aleatória dentro das tabuadas (1-10)
      const multiplicand = Math.floor(Math.random() * 10) + 1;
      const multiplier = Math.floor(Math.random() * 10) + 1;
      
      questions.push({
        id: i + 1,
        multiplicand,
        multiplier,
        answer: multiplicand * multiplier,
        userAnswer: '',
        isCorrect: null
      });
    }
    
    return questions;
  }, []);

  const startQuiz = useCallback(() => {
    const questions = generateAllQuestions(settings.questionCount);
    setQuizState({
      questions,
      isCompleted: false,
      stats: { 
        correct: 0, 
        total: settings.questionCount,
        wrongAnswers: []
      }
    });
  }, [generateAllQuestions, settings.questionCount]);

  useEffect(() => {
    startQuiz();
  }, [startQuiz]);

  const handleAnswerChange = useCallback((questionId: number, value: string) => {
    // Só permite mudanças se o timer estiver ativo ou não configurado
    if (!timer.isConfigured || timer.isActive) {
      setQuizState(prev => ({
        ...prev,
        questions: prev.questions.map(q =>
          q.id === questionId ? { ...q, userAnswer: value } : q
        )
      }));
    }
  }, [timer.isActive, timer.isConfigured]);

  const submitAnswers = useCallback(() => {
    setQuizState(prev => {
      const updatedQuestions = prev.questions.map(q => {
        const userAnswer = parseInt(q.userAnswer);
        const isCorrect = !isNaN(userAnswer) && userAnswer === q.answer;
        return { ...q, isCorrect };
      });

      const correctCount = updatedQuestions.filter(q => q.isCorrect).length;
      const wrongAnswers = updatedQuestions
        .filter(q => !q.isCorrect)
        .map(q => ({
          multiplicand: q.multiplicand,
          multiplier: q.multiplier,
          correctAnswer: q.answer,
          userAnswer: q.userAnswer || 'Não respondido'
        }));

      return {
        ...prev,
        questions: updatedQuestions,
        isCompleted: true,
        stats: {
          correct: correctCount,
          total: settings.questionCount,
          wrongAnswers
        }
      };
    });
    
    // Para o timer quando submete
    setTimer(prev => ({ ...prev, isActive: false }));
  }, [settings.questionCount]);

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
    
    // Auto-adjust timer based on question count
    setTimer(prev => ({
      ...prev,
      selectedTime: recommendedTime,
      remainingTime: recommendedTime * 60,
      isActive: false,
      isConfigured: false
    }));
  }, [getRecommendedTime]);

  const resetQuiz = useCallback(() => {
    startQuiz();
    setTimer(prev => ({
      ...prev,
      isActive: false,
      remainingTime: prev.selectedTime * 60,
      isConfigured: false
    }));
  }, [startQuiz]);

  // Timer functions
  const startTimer = useCallback(() => {
    setTimer(prev => ({
      ...prev,
      remainingTime: prev.selectedTime * 60,
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

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timer.isActive && timer.remainingTime > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev.remainingTime <= 1) {
            // Timer finished - auto submit if not already completed
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

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate accuracy percentage
  const accuracyPercentage = quizState.stats.total > 0 
    ? Math.round((quizState.stats.correct / quizState.stats.total) * 100) 
    : 0;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="academia-title text-5xl">
            🎯 Desafio dos Campeões 🎯
          </h1>
          <p className="academia-subtitle">Desafio de multiplicação configurável</p>
        </div>

        {/* Question Count Selection */}
        <div className="academia-container mb-8">
          <h3 className="academia-subtitle text-center mb-6">📊 Configuração do Desafio</h3>
          
          <div className="max-w-md mx-auto">
            <label className="block text-lg font-semibold text-card-foreground mb-4 text-center font-greek">
              Quantas questões você quer resolver?
            </label>
            <Select value={settings.questionCount.toString()} onValueChange={handleQuestionCountChange}>
              <SelectTrigger className="w-full text-lg py-4 px-6 border-border bg-background">
                <SelectValue placeholder="Selecione a quantidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 questões</SelectItem>
                <SelectItem value="20">20 questões</SelectItem>
                <SelectItem value="30">30 questões</SelectItem>
                <SelectItem value="40">40 questões</SelectItem>
                <SelectItem value="50">50 questões</SelectItem>
                <SelectItem value="60">60 questões</SelectItem>
                <SelectItem value="70">70 questões</SelectItem>
                <SelectItem value="80">80 questões</SelectItem>
                <SelectItem value="90">90 questões</SelectItem>
                <SelectItem value="100">100 questões</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-center text-muted-foreground mt-4">
              Atualmente configurado para <strong>{settings.questionCount} questões</strong>
            </p>
          </div>
        </div>

        {/* Timer Configuration */}
        <div className="academia-container mb-8">
          <h3 className="academia-subtitle text-center mb-6">⏱️ Cronômetro do Desafio</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Time Selection */}
            <div className="text-center">
              <label className="block text-sm font-semibold text-card-foreground mb-2 font-greek">
                Tempo para completar:
              </label>
              <Select value={timer.selectedTime.toString()} onValueChange={handleTimeSelect}>
                <SelectTrigger className="w-full border-border bg-background">
                  <SelectValue placeholder="Selecione o tempo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 minuto</SelectItem>
                  <SelectItem value="2">2 minutos</SelectItem>
                  <SelectItem value="3">3 minutos</SelectItem>
                  <SelectItem value="5">5 minutos</SelectItem>
                  <SelectItem value="7">7 minutos</SelectItem>
                  <SelectItem value="10">10 minutos</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Tempo sugerido automaticamente. Você pode alterar se desejar.
              </p>
            </div>

            {/* Timer Display */}
            <div className="text-center">
              <div className={`text-6xl font-bold mb-4 font-greek ${
                timer.remainingTime <= 60 && timer.remainingTime > 0 
                  ? 'text-red-500 animate-pulse' 
                  : timer.isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
              }`}>
                {formatTime(timer.remainingTime)}
              </div>
              <div className="text-sm text-card-foreground">
                {timer.remainingTime <= 60 && timer.remainingTime > 0 
                  ? '⚠️ Último minuto!' 
                  : timer.isActive 
                    ? '🏃‍♂️ Tempo correndo...' 
                    : timer.isConfigured
                      ? '⏸️ Tempo pausado'
                      : '⏰ Configure o tempo'}
              </div>
            </div>

            {/* Timer Controls */}
            <div className="text-center space-y-3">
              {!timer.isActive ? (
                <Button
                  onClick={startTimer}
                  className="w-full academia-button-primary py-3 px-6 rounded-xl"
                >
                  ▶️ {timer.isConfigured ? 'Continuar' : 'Iniciar'} Timer
                </Button>
              ) : (
                <Button
                  onClick={pauseTimer}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-greek font-semibold py-3 px-6 rounded-xl"
                >
                  ⏸️ Pausar Timer
                </Button>
              )}
              <Button
                onClick={resetTimer}
                className="w-full bg-muted hover:bg-muted/80 text-muted-foreground font-greek font-semibold py-2 px-6 rounded-xl"
              >
                🔄 Resetar Timer
              </Button>
            </div>
          </div>

          {/* Timer Status Message */}
          {timer.isConfigured && !timer.isActive && (
            <div className="mt-6 p-4 bg-amber-100 border border-amber-300 rounded-lg text-center">
              <p className="text-amber-800 font-semibold font-greek">
                ⏸️ Timer pausado - As respostas estão bloqueadas. Inicie o timer para continuar!
              </p>
            </div>
          )}
        </div>

        {/* Quiz Questions Grid */}
        <div className="academia-container mb-8">
          <h3 className="academia-subtitle text-center mb-6">
            📝 {settings.questionCount} Questões de Multiplicação
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {quizState.questions.map((question, index) => (
              <div key={question.id} className="bg-background rounded-xl p-4 border-2 border-border">
                <div className="text-center mb-3">
                  <span className="text-xs text-muted-foreground font-medium">{index + 1}</span>
                  <div className="text-lg font-bold text-card-foreground font-greek">
                    {question.multiplicand} × {question.multiplier} =
                  </div>
                </div>
                <input
                  type="number"
                  value={question.userAnswer}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  disabled={timer.isConfigured && !timer.isActive}
                  className={`w-full text-center text-lg font-semibold border-2 rounded-lg p-2 transition-colors duration-300 font-greek ${
                    timer.isConfigured && !timer.isActive
                      ? 'bg-muted border-border cursor-not-allowed text-muted-foreground'
                      : quizState.isCompleted
                        ? question.isCorrect 
                          ? 'bg-green-100 border-green-300 text-green-800'
                          : question.isCorrect === false
                            ? 'bg-red-100 border-red-300 text-red-800'
                            : 'bg-background border-border text-card-foreground'
                        : 'border-border bg-background text-card-foreground focus:border-primary focus:ring-2 focus:ring-primary/20'
                  } [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                  placeholder="?"
                />
                {quizState.isCompleted && question.isCorrect === false && (
                  <div className="text-red-600 font-semibold mt-1 text-xs text-center font-greek">
                    Correto: {question.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Results and Statistics */}
        {quizState.isCompleted && (
          <div className="academia-container mb-8">
            <h3 className="academia-subtitle text-center mb-6">
              📊 Resultado Final
            </h3>
            
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-green-100 rounded-xl border border-green-200">
                <div className="text-4xl font-bold text-green-600 mb-2 font-greek">
                  {quizState.stats.correct}
                </div>
                <div className="text-green-800 font-semibold">Acertos</div>
              </div>
              <div className="text-center p-6 bg-red-100 rounded-xl border border-red-200">
                <div className="text-4xl font-bold text-red-600 mb-2 font-greek">
                  {quizState.stats.wrongAnswers.length}
                </div>
                <div className="text-red-800 font-semibold">Erros</div>
              </div>
              <div className="text-center p-6 bg-blue-100 rounded-xl border border-blue-200">
                <div className="text-4xl font-bold text-primary mb-2 font-greek">
                  {accuracyPercentage}%
                </div>
                <div className="text-primary font-semibold">Precisão</div>
              </div>
            </div>

            {/* Wrong Answers Detail */}
            {quizState.stats.wrongAnswers.length > 0 && (
              <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
                <h4 className="text-lg font-bold text-red-800 mb-4 text-center font-greek">
                  🎯 Multiplicações para revisar ({quizState.stats.wrongAnswers.length} erros)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {quizState.stats.wrongAnswers.map((wrong, index) => (
                    <div key={index} className="bg-card rounded-lg p-3 border border-red-300">
                      <div className="text-center">
                        <div className="font-bold text-red-800 font-greek">
                          {wrong.multiplicand} × {wrong.multiplier} = {wrong.correctAnswer}
                        </div>
                        <div className="text-sm text-red-600">
                          Sua resposta: {wrong.userAnswer}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-amber-100 border border-amber-300 rounded-lg">
                  <p className="text-amber-800 text-sm text-center font-medium font-greek">
                    💡 Dica para pais: Pratique essas multiplicações específicas para melhorar!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!quizState.isCompleted ? (
            <Button
              onClick={submitAnswers}
              className="academia-button-primary py-3 px-8 rounded-xl shadow-lg hover:shadow-xl"
            >
              ✅ Finalizar Desafio
            </Button>
          ) : (
            <Button
              onClick={resetQuiz}
              className="academia-button-secondary py-3 px-8 rounded-xl shadow-lg hover:shadow-xl"
            >
              🔄 Novo Desafio
            </Button>
          )}
        </div>

        {/* Virtual Assistant */}
        <VirtualAssistant 
          currentPage="/simulado"
          isVisible={showAssistant}
          onClose={() => setShowAssistant(false)}
        />
        
        {/* Button to reopen assistant */}
        {!showAssistant && (
          <div className="fixed bottom-4 right-4 z-40">
            <Button
              onClick={() => setShowAssistant(true)}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg"
            >
              🧙‍♂️
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}