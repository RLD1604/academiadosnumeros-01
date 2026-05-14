/**
 * Relógio Educativo - Academia dos Números
 * Desenvolvido por: Rodrigo Linhares Drummond
 * © 2025 Academia dos Números
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import VirtualAssistant from '@/components/virtual-assistant';
import CanvasClockFixed from '@/components/canvas-clock-fixed';

interface ClockState {
  hour: number;
  minute: number;
  second: number;
  millisecond?: number;
}

interface HandPosition {
  angle: number;
  x: number;
  y: number;
}

interface ClockGeometry {
  center: { x: number; y: number };
  radius: number;
  hourHandLength: number;
  minuteHandLength: number;
  secondHandLength: number;
}

interface Challenge {
  id: number;
  targetHour: number;
  targetMinute: number;
  instruction: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

class ClockMath {
  static readonly DEGREES_PER_HOUR = 30; // 360° / 12 horas
  static readonly DEGREES_PER_MINUTE = 6; // 360° / 60 minutos
  static readonly DEGREES_PER_SECOND = 6; // 360° / 60 segundos
  static readonly HOUR_HAND_SPEED = 0.5; // graus por minuto
  static readonly MINUTE_HAND_SPEED = 0.1; // graus por segundo

  static timeToAngles(time: ClockState): { hour: number; minute: number; second: number } {
    return {
      hour: (time.hour % 12) * this.DEGREES_PER_HOUR + time.minute * this.HOUR_HAND_SPEED,
      minute: time.minute * this.DEGREES_PER_MINUTE + time.second * this.MINUTE_HAND_SPEED,
      second: time.second * this.DEGREES_PER_SECOND
    };
  }

  static angleToCartesian(angle: number, radius: number, center: { x: number; y: number }): { x: number; y: number } {
    const radians = (angle - 90) * Math.PI / 180;
    return {
      x: center.x + radius * Math.cos(radians),
      y: center.y + radius * Math.sin(radians)
    };
  }

  static cartesianToAngle(x: number, y: number, center: { x: number; y: number }): number {
    const dx = x - center.x;
    const dy = y - center.y;
    let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
    if (angle < 0) angle += 360;
    return angle;
  }

  static angleToTime(angle: number, handType: 'hour' | 'minute' | 'second'): number {
    switch (handType) {
      case 'hour':
        return Math.round(angle / this.DEGREES_PER_HOUR) % 12 || 12;
      case 'minute':
        return Math.round(angle / this.DEGREES_PER_MINUTE) % 60;
      case 'second':
        return Math.round(angle / this.DEGREES_PER_SECOND) % 60;
      default:
        return 0;
    }
  }

  static distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  static getNearestHand(
    mousePos: { x: number; y: number },
    hands: { hour: HandPosition; minute: HandPosition; second: HandPosition },
    threshold = 20
  ): 'hour' | 'minute' | 'second' | null {
    const distances = {
      hour: this.distance(mousePos, hands.hour),
      minute: this.distance(mousePos, hands.minute),
      second: this.distance(mousePos, hands.second)
    };

    const minDistance = Math.min(distances.hour, distances.minute, distances.second);
    
    if (minDistance > threshold) return null;

    if (minDistance === distances.hour) return 'hour';
    if (minDistance === distances.minute) return 'minute';
    return 'second';
  }
}

export default function EducationalClock() {
  const [activeTab, setActiveTab] = useState('aprender');
  const [currentTime, setCurrentTime] = useState<ClockState>(() => {
    const now = new Date();
    return { 
      hour: now.getHours() % 12 || 12, 
      minute: now.getMinutes(), 
      second: now.getSeconds() 
    };
  });
  const [practiceTime, setPracticeTime] = useState<ClockState>({ hour: 1, minute: 30, second: 40 });
  const [targetTime, setTargetTime] = useState<ClockState>({ hour: 3, minute: 15, second: 0 });
  
  const [isDragging, setIsDragging] = useState(false);
  const [draggedHand, setDraggedHand] = useState<'hour' | 'minute' | 'second' | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAssistant, setShowAssistant] = useState(true);
  
  // Estado para horário em formato 24h no modo praticar
  const [practiceTime24h, setPracticeTime24h] = useState<{ hour: number; minute: number; second: number }>({ hour: 13, minute: 30, second: 0 });
  
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  
  const clockRef = useRef<SVGSVGElement>(null);
  const animationFrameRef = useRef<number>();

  // Função para determinar ícone e período do dia baseado no horário de 24h
  const getDayPeriod = (hour24: number) => {
    if (hour24 >= 0 && hour24 <= 5) {
      return { 
        icon: '🌙', 
        period: 'Madrugada', 
        color: 'bg-indigo-900 text-white',
        timeRange: '00:00 - 05:59'
      };
    } else if (hour24 >= 6 && hour24 <= 11) {
      return { 
        icon: '🌅', 
        period: 'Manhã', 
        color: 'bg-orange-200 text-orange-800',
        timeRange: '06:00 - 11:59'
      };
    } else if (hour24 >= 12 && hour24 <= 17) {
      return { 
        icon: '☀️', 
        period: 'Tarde', 
        color: 'bg-yellow-200 text-yellow-800',
        timeRange: '12:00 - 17:59'
      };
    } else {
      return { 
        icon: '🌆', 
        period: 'Noite', 
        color: 'bg-purple-200 text-purple-800',
        timeRange: '18:00 - 23:59'
      };
    }
  };

  // Converter horário 24h para 12h para exibição no relógio analógico
  const convertTo12h = (hour24: number) => {
    if (hour24 === 0) return 12;  // 00:xx = 12:xx AM
    if (hour24 > 12) return hour24 - 12;  // 13:xx = 1:xx PM
    return hour24;  // 1:xx-12:xx = 1:xx-12:xx
  };

  // Determinar AM/PM baseado no horário 24h
  const getAMPM = (hour24: number) => {
    return hour24 < 12 ? 'AM' : 'PM';
  };

  // Atualizar relógio em tempo real
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime({
        hour: now.getHours() % 12 || 12,
        minute: now.getMinutes(),
        second: now.getSeconds()
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const challenges: Challenge[] = [
    { id: 1, targetHour: 3, targetMinute: 15, instruction: 'Ajuste o relógio para 3:15', difficulty: 'easy' },
    { id: 2, targetHour: 7, targetMinute: 30, instruction: 'Ajuste o relógio para 7:30', difficulty: 'easy' },
    { id: 3, targetHour: 10, targetMinute: 45, instruction: 'Ajuste o relógio para 10:45', difficulty: 'medium' },
    { id: 4, targetHour: 2, targetMinute: 5, instruction: 'Ajuste o relógio para 2:05', difficulty: 'medium' },
    { id: 5, targetHour: 11, targetMinute: 55, instruction: 'Ajuste o relógio para 11:55', difficulty: 'hard' },
  ];

  const generateChallenge = () => {
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    setCurrentChallenge(randomChallenge);
    setChallengeCompleted(false);
    setPracticeTime({ hour: 12, minute: 0, second: 0 });
  };

  const checkChallenge = () => {
    if (!currentChallenge) return;
    
    const isCorrect = practiceTime.hour === currentChallenge.targetHour && 
                     practiceTime.minute === currentChallenge.targetMinute;
    
    if (isCorrect) {
      setChallengeCompleted(true);
      setScore(score + 10);
      setStreak(streak + 1);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  useEffect(() => {
    generateChallenge();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-2">
            🕒 Relógio Educativo
          </h1>
          <p className="text-lg text-gray-600">
            Aprenda a ler as horas de forma divertida e interativa!
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-lg">
            {['aprender', 'praticar', 'desafios'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                {tab === 'aprender' && '📚 Aprender'}
                {tab === 'praticar' && '🎯 Praticar'}
                {tab === 'desafios' && '🏆 Desafios'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Aba Aprender */}
          {activeTab === 'aprender' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-blue-700 mb-6">Relógio Atual</h2>
                <CanvasClockFixed clock={currentTime} size={400} />
              </div>

              <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-center">Como Funciona o Relógio</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white/20 rounded-lg p-4">
                    <h4 className="font-bold mb-2">Ponteiro das Horas</h4>
                    <p>Curto e grosso (azul)<br/>Move 30° a cada hora<br/>Uma volta em 12 horas</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <h4 className="font-bold mb-2">Ponteiro dos Minutos</h4>
                    <p>Médio (vermelho)<br/>Move 6° a cada minuto<br/>Uma volta em 60 minutos</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <h4 className="font-bold mb-2">Ponteiro dos Segundos</h4>
                    <p>Longo e fino (verde)<br/>Move 6° a cada segundo<br/>Uma volta em 60 segundos</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aba Praticar */}
          {activeTab === 'praticar' && (
            <div className="h-screen overflow-hidden px-4">
              <div className="text-center mb-3">
                <h2 className="text-xl font-bold text-purple-700 mb-1">Relógio de 24 Horas</h2>
                <p className="text-sm text-gray-600">Arraste os ponteiros e veja como o horário muda de 00:00 até 23:59!</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full max-h-screen">
                {/* Coluna 1: Display, Fórmula e Período */}
                <div className="space-y-3">
                  {/* Display digital do horário atual */}
                  <div className="bg-blue-900 text-blue-200 rounded-xl p-4">
                    <div className="text-3xl font-mono font-bold text-center text-white">
                      {String(practiceTime24h.hour).padStart(2, '0')}:
                      {String(practiceTime24h.minute).padStart(2, '0')}:
                      {String(practiceTime24h.second).padStart(2, '0')}
                    </div>
                  </div>

                  {/* Fórmula dos Minutos */}
                  {practiceTime24h.minute > 0 && (
                    <div className="bg-orange-500 text-white rounded-xl p-3">
                      <div className="text-center mb-1">
                        <span className="text-sm font-bold">⚡ Fórmula dos Minutos:</span>
                      </div>
                      <div className="text-lg font-bold text-center mb-1">
                        ({Math.floor(practiceTime24h.minute / 5)} × 5) + {practiceTime24h.minute % 5} = {practiceTime24h.minute}
                      </div>
                      <div className="text-xs text-center">
                        Ponteiro azul aponta para {Math.floor(practiceTime24h.minute / 5)} — Minutos: {practiceTime24h.minute}
                      </div>
                    </div>
                  )}
                  
                  {/* Indicador de período do dia */}
                  <div className={`flex items-center justify-center px-4 py-3 rounded-xl font-bold text-sm ${getDayPeriod(practiceTime24h.hour).color}`}>
                    <span className="text-lg mr-2">{getDayPeriod(practiceTime24h.hour).icon}</span>
                    <div className="text-center">
                      <div>{getDayPeriod(practiceTime24h.hour).period}</div>
                      <div className="text-xs opacity-75">({getDayPeriod(practiceTime24h.hour).timeRange})</div>
                    </div>
                  </div>

                  {/* Navegação de 24 horas */}
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600 text-center">Navegue pelas 24 horas:</p>
                    <div className="grid grid-cols-2 gap-1">
                      <Button 
                        onClick={() => setPracticeTime24h(prev => ({ ...prev, hour: 3 }))}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1"
                      >
                        🌙 Madrugada
                      </Button>
                      <Button 
                        onClick={() => setPracticeTime24h(prev => ({ ...prev, hour: 9 }))}
                        className="bg-orange-400 hover:bg-orange-500 text-white text-xs py-1"
                      >
                        🌅 Manhã
                      </Button>
                      <Button 
                        onClick={() => setPracticeTime24h(prev => ({ ...prev, hour: 15 }))}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs py-1"
                      >
                        ☀️ Tarde
                      </Button>
                      <Button 
                        onClick={() => setPracticeTime24h(prev => ({ ...prev, hour: 21 }))}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs py-1"
                      >
                        🌆 Noite
                      </Button>
                    </div>
                    
                    <Button 
                      onClick={() => setPracticeTime24h({ hour: 0, minute: 0, second: 0 })}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 text-sm w-full"
                    >
                      🔄 Reset 00:00:00
                    </Button>
                  </div>
                </div>

                {/* Coluna 2: Relógio */}
                <div className="flex flex-col items-center justify-center">
                  <CanvasClockFixed 
                    clock={{
                      hour: convertTo12h(practiceTime24h.hour),
                      minute: practiceTime24h.minute,
                      second: practiceTime24h.second
                    }} 
                    size={350} 
                    isDraggable={true}
                    onTimeChange={(newTime: ClockState) => {
                      let newHour24;
                      
                      if (practiceTime24h.hour < 12) {
                        if (newTime.hour === 12) {
                          newHour24 = 0;
                        } else {
                          newHour24 = newTime.hour;
                        }
                      } else {
                        if (newTime.hour === 12) {
                          newHour24 = 12;
                        } else {
                          newHour24 = newTime.hour + 12;
                        }
                      }
                      
                      if (practiceTime24h.hour === 11 && newHour24 === 0) {
                        newHour24 = 12;
                      } else if (practiceTime24h.hour === 23 && newHour24 === 12) {
                        newHour24 = 0;
                      } else if (practiceTime24h.hour === 12 && newHour24 === 1) {
                        newHour24 = 13;
                      } else if (practiceTime24h.hour === 0 && newHour24 === 11) {
                        newHour24 = 23;
                      }
                      
                      setPracticeTime24h({
                        hour: newHour24,
                        minute: newTime.minute,
                        second: newTime.second
                      });
                    }}
                  />
                </div>

                {/* Coluna 3: Tabuada do 5 */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-center mb-3">
                    <h3 className="text-sm font-bold text-gray-700">
                      📊 Tabuada do 5 - Calcular minutos
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(num => (
                      <div 
                        key={num}
                        className={`px-2 py-2 rounded text-center font-bold text-white text-xs ${
                          Math.floor(practiceTime24h.minute / 5) === num 
                            ? 'bg-orange-500 ring-2 ring-orange-300' 
                            : 'bg-purple-500'
                        }`}
                      >
                        {num} × 5 = {num * 5}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aba Desafios */}
          {activeTab === 'desafios' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-green-700 mb-6">Desafios de Relógio</h2>
                <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6">
                  <p className="text-green-800 font-medium">Score: {score} | Sequência: {streak}</p>
                </div>
              </div>

              {currentChallenge && (
                <div className="space-y-6">
                  <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 text-center">
                    <h3 className="text-lg font-bold text-yellow-800 mb-2">{currentChallenge.instruction}</h3>
                    <p className="text-yellow-700">Horário alvo: {String(currentChallenge.targetHour).padStart(2, '0')}:{String(currentChallenge.targetMinute).padStart(2, '0')}</p>
                  </div>

                  <div className="text-center">
                    <CanvasClockFixed 
                      clock={practiceTime} 
                      size={400} 
                      isDraggable={true}
                      onTimeChange={(newTime: ClockState) => setPracticeTime(newTime)}
                    />
                  </div>

                  <div className="text-center space-x-4">
                    {!challengeCompleted ? (
                      <Button onClick={checkChallenge} className="bg-green-500 hover:bg-green-600">
                        Verificar Resposta
                      </Button>
                    ) : (
                      <div className="space-x-4">
                        <div className="text-green-600 font-bold mb-4">Correto! 🎉</div>
                        <Button onClick={generateChallenge} className="bg-blue-500 hover:bg-blue-600">
                          Próximo Desafio
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Assistente Virtual */}
        {showAssistant && (
          <VirtualAssistant 
            currentPage="educational-clock" 
            onClose={() => setShowAssistant(false)}
          />
        )}
      </div>
    </div>
  );
}