/**
 * Tabuadas Individuais - Academia dos Números
 * Desenvolvido por: Rodrigo Linhares Drummond
 * © 2025 Academia dos Números
 */

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Clock, Play, Pause } from 'lucide-react';
import { useArquimedesEvents } from '@/lib/arquimedes-events';

interface Answer {
  value: string;
  isCorrect: boolean | null;
  correctAnswer: number;
}

interface TimerState {
  isRunning: boolean;
  startTime: number | null;
  elapsedTime: number;
}

export default function IndividualTables() {
  const { dispatchArquimedesEvent } = useArquimedesEvents();
  const [selectedTable, setSelectedTable] = useState<number>(1);
  const [answers, setAnswers] = useState<Map<number, Answer>>(new Map());
  const [isVerified, setIsVerified] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timer, setTimer] = useState<TimerState>({
    isRunning: false,
    startTime: null,
    elapsedTime: 0
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [finalResults, setFinalResults] = useState<{
    correct: number;
    wrong: number;
    time: string;
  } | null>(null);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer.isRunning && timer.startTime) {
      interval = setInterval(() => {
        setTimer(prev => ({
          ...prev,
          elapsedTime: Date.now() - prev.startTime!
        }));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [timer.isRunning, timer.startTime]);

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const startGame = () => {
    setGameStarted(true);
    setTimer({
      isRunning: true,
      startTime: Date.now(),
      elapsedTime: 0
    });
    setIsVerified(false);
    setShowResults(false);
    setFinalResults(null);
    setAnswers(new Map());
  };

  const handleAnswerChange = (multiplier: number, value: string) => {
    setAnswers(prev => {
      const newAnswers = new Map(prev);
      newAnswers.set(multiplier, {
        value,
        isCorrect: null,
        correctAnswer: selectedTable * multiplier
      });
      return newAnswers;
    });
  };

  const verifyAnswers = useCallback(() => {
    // Parar o timer
    setTimer(prev => ({
      ...prev,
      isRunning: false
    }));

    let correctCount = 0;
    let wrongCount = 0;
    const newAnswers = new Map();

    // Verificar todas as respostas e contar acertos/erros
    for (let i = 1; i <= 10; i++) {
      const answer = answers.get(i);
      if (answer && answer.value.trim()) {
        const userAnswer = parseInt(answer.value);
        const isCorrect = !isNaN(userAnswer) && userAnswer === selectedTable * i;
        
        if (isCorrect) {
          correctCount++;
        } else {
          wrongCount++;
        }
        
        newAnswers.set(i, {
          ...answer,
          isCorrect,
          correctAnswer: selectedTable * i
        });
      } else {
        // Resposta vazia conta como erro
        wrongCount++;
        newAnswers.set(i, {
          value: '',
          isCorrect: false,
          correctAnswer: selectedTable * i
        });
      }
    }

    // Atualizar as respostas com os resultados
    setAnswers(newAnswers);

    // Definir resultados finais
    setFinalResults({
      correct: correctCount,
      wrong: wrongCount,
      time: formatTime(timer.elapsedTime)
    });
    
    setIsVerified(true);
    setShowResults(true);

    dispatchArquimedesEvent('table_complete', {
      tableNumber: selectedTable,
      correct: correctCount,
      time: formatTime(timer.elapsedTime),
    });
  }, [selectedTable, timer.elapsedTime, formatTime, answers, dispatchArquimedesEvent]);

  const resetTable = useCallback(() => {
    setAnswers(new Map());
    setIsVerified(false);
    setShowResults(false);
    setGameStarted(false);
    setFinalResults(null);
    setTimer({
      isRunning: false,
      startTime: null,
      elapsedTime: 0
    });
  }, []);

  const handleTableChange = (tableNumber: number) => {
    setSelectedTable(tableNumber);
    resetTable();
  };

  const getAnswer = (multiplier: number): Answer => {
    return answers.get(multiplier) || {
      value: '',
      isCorrect: null,
      correctAnswer: selectedTable * multiplier
    };
  };

  const getCellBackground = (answer: Answer) => {
    if (!isVerified) return 'bg-white';
    return answer.isCorrect ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300';
  };

  const getCellIcon = (answer: Answer) => {
    if (!isVerified) return null;
    return answer.isCorrect ? 
      <CheckCircle className="w-5 h-5 text-green-600 ml-2" /> : 
      <XCircle className="w-5 h-5 text-red-600 ml-2" />;
  };

  const allFieldsFilled = () => {
    for (let i = 1; i <= 10; i++) {
      const answer = getAnswer(i);
      if (!answer.value.trim()) return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 greek-pattern opacity-5"></div>
      <div className="container mx-auto px-6 py-8 max-w-4xl relative">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="font-greek text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-700 mb-2 sm:mb-4">
            Estudo Focado
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-amber-600 font-medium italic px-4">
            Pratique cada tabuada separadamente e teste seu conhecimento!
          </p>
        </div>
        
        {/* Table Selector */}
        <div className="academia-container mb-8">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-700 text-center mb-4 sm:mb-6">🎯 Escolha sua Tabuada</h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3 lg:gap-4 max-w-6xl mx-auto">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
              <Button
                key={num}
                onClick={() => handleTableChange(num)}
                className={`h-12 sm:h-14 lg:h-16 text-lg sm:text-xl lg:text-2xl font-bold rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md sm:shadow-lg font-greek aspect-square ${
                  selectedTable === num 
                    ? 'academia-button-primary' 
                    : 'bg-white hover:bg-gray-50 text-blue-700 border-2 border-blue-200 hover:border-blue-400'
                }`}
              >
                {num}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Timer Display */}
        {gameStarted && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center bg-blue-100 rounded-xl px-6 py-3 border-2 border-blue-200">
              <Clock className="w-6 h-6 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-blue-700">
                {formatTime(timer.elapsedTime)}
              </span>
            </div>
          </div>
        )}

        {/* Current Table Display */}
        <div className="academia-container mb-8">
          <h2 className="academia-title text-center mb-6">
            Tabuada do {selectedTable}
          </h2>
          
          {/* Layout responsivo com proporções automáticas */}
          <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {/* Primeira coluna: 1x a 5x */}
              <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                {Array.from({ length: 5 }, (_, i) => i + 1).map(multiplier => {
                  const answer = getAnswer(multiplier);
                  return (
                    <div key={multiplier} className={`flex items-center justify-between p-2 sm:p-3 lg:p-4 rounded-lg border-2 transition-all duration-300 ${getCellBackground(answer)}`}>
                      <div className="flex items-center text-sm sm:text-lg lg:text-xl font-bold text-blue-700 min-w-0">
                        <span className="whitespace-nowrap">{selectedTable} × {multiplier} =</span>
                      </div>
                      <div className="flex items-center ml-2 flex-shrink-0">
                        <Input
                          type="number"
                          value={answer.value}
                          onChange={(e) => handleAnswerChange(multiplier, e.target.value)}
                          disabled={!gameStarted || isVerified}
                          className="w-12 sm:w-16 lg:w-20 text-center text-sm sm:text-lg lg:text-xl font-bold border-2 focus:border-blue-400"
                          placeholder="?"
                        />
                        {getCellIcon(answer)}
                        {isVerified && !answer.isCorrect && (
                          <span className="ml-1 sm:ml-2 text-green-600 font-bold text-sm sm:text-lg lg:text-xl whitespace-nowrap">
                            = {answer.correctAnswer}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Segunda coluna: 6x a 10x */}
              <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                {Array.from({ length: 5 }, (_, i) => i + 6).map(multiplier => {
                  const answer = getAnswer(multiplier);
                  return (
                    <div key={multiplier} className={`flex items-center justify-between p-2 sm:p-3 lg:p-4 rounded-lg border-2 transition-all duration-300 ${getCellBackground(answer)}`}>
                      <div className="flex items-center text-sm sm:text-lg lg:text-xl font-bold text-blue-700 min-w-0">
                        <span className="whitespace-nowrap">{selectedTable} × {multiplier} =</span>
                      </div>
                      <div className="flex items-center ml-2 flex-shrink-0">
                        <Input
                          type="number"
                          value={answer.value}
                          onChange={(e) => handleAnswerChange(multiplier, e.target.value)}
                          disabled={!gameStarted || isVerified}
                          className="w-12 sm:w-16 lg:w-20 text-center text-sm sm:text-lg lg:text-xl font-bold border-2 focus:border-blue-400"
                          placeholder="?"
                        />
                        {getCellIcon(answer)}
                        {isVerified && !answer.isCorrect && (
                          <span className="ml-1 sm:ml-2 text-green-600 font-bold text-sm sm:text-lg lg:text-xl whitespace-nowrap">
                            = {answer.correctAnswer}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 justify-center items-center">
          {!gameStarted ? (
            <Button 
              onClick={startGame}
              className="academia-button-primary px-8 py-3 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Play className="w-5 h-5 mr-2" />
              Começar
            </Button>
          ) : !isVerified ? (
            <Button 
              onClick={verifyAnswers}
              disabled={!allFieldsFilled()}
              className="academia-button-accent px-8 py-3 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Verificar Respostas
            </Button>
          ) : (
            <Button 
              onClick={resetTable}
              className="academia-button-primary px-8 py-3 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Play className="w-5 h-5 mr-2" />
              Nova Tentativa
            </Button>
          )}
          
          {gameStarted && !allFieldsFilled() && !isVerified && (
            <p className="text-amber-600 font-medium italic">
              Preencha todas as respostas antes de verificar
            </p>
          )}
        </div>

        {/* Final Results Display */}
        {finalResults && (
          <div className="academia-container mt-8">
            <h3 className="academia-title text-center mb-6">Resultado Final</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {finalResults.correct}
                </div>
                <div className="text-green-700 font-semibold">Acertos</div>
              </div>
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {finalResults.wrong}
                </div>
                <div className="text-red-700 font-semibold">Erros</div>
              </div>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {finalResults.time}
                </div>
                <div className="text-blue-700 font-semibold">Tempo</div>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {showResults && (
          <div className="academia-container mt-8">
            <h3 className="academia-title text-center mb-6">📊 Resultados</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Array.from({ length: 10 }, (_, i) => i + 1).map(multiplier => {
                const answer = getAnswer(multiplier);
                return (
                  <div key={multiplier} className={`p-4 rounded-xl border-2 text-center ${
                    answer.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="font-bold text-lg text-gray-700">
                      {selectedTable} × {multiplier}
                    </div>
                    <div className={`text-xl font-bold ${
                      answer.isCorrect ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {answer.correctAnswer}
                    </div>
                    {!answer.isCorrect && (
                      <div className="text-sm text-red-500">
                        Sua resposta: {answer.value || 'vazio'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}