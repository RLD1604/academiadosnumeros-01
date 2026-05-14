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
  explanation?: string;
  category: string;
}

class ClockMath {
  static readonly DEGREES_PER_HOUR = 30; // 360° / 12 horas
  static readonly DEGREES_PER_MINUTE = 6; // 360° / 60 minutos
  static readonly DEGREES_PER_SECOND = 6; // 360° / 60 segundos
  static readonly HOUR_HAND_SPEED = 0.5; // graus por minuto
  static readonly MINUTE_HAND_SPEED = 0.1; // graus por segundo

  static timeToAngles(time: ClockState): { hour: number; minute: number; second: number } {
    const hour = ((time.hour % 12) * ClockMath.DEGREES_PER_HOUR) + (time.minute * ClockMath.HOUR_HAND_SPEED);
    const minute = time.minute * ClockMath.DEGREES_PER_MINUTE;
    const second = time.second * ClockMath.DEGREES_PER_SECOND;
    
    return { hour, minute, second };
  }

  static angleToCartesian(angle: number, radius: number, center: { x: number; y: number }): { x: number; y: number } {
    const radians = (angle - 90) * (Math.PI / 180);
    return {
      x: center.x + radius * Math.cos(radians),
      y: center.y + radius * Math.sin(radians)
    };
  }

  static cartesianToAngle(x: number, y: number, center: { x: number; y: number }): number {
    const radians = Math.atan2(y - center.y, x - center.x);
    let angle = (radians * 180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    return angle % 360;
  }

  static angleToTime(angle: number, handType: 'hour' | 'minute' | 'second'): number {
    switch (handType) {
      case 'hour':
        return Math.round((angle / ClockMath.DEGREES_PER_HOUR) % 12) || 12;
      case 'minute':
        return Math.round(angle / ClockMath.DEGREES_PER_MINUTE) % 60;
      case 'second':
        return Math.round(angle / ClockMath.DEGREES_PER_SECOND) % 60;
    }
  }

  static distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  static getNearestHand(
    mousePos: { x: number; y: number },
    geometry: ClockGeometry,
    time: ClockState
  ): 'hour' | 'minute' | 'second' | null {
    const angles = ClockMath.timeToAngles(time);
    
    const hourPos = ClockMath.angleToCartesian(angles.hour, geometry.hourHandLength, geometry.center);
    const minutePos = ClockMath.angleToCartesian(angles.minute, geometry.minuteHandLength, geometry.center);
    const secondPos = ClockMath.angleToCartesian(angles.second, geometry.secondHandLength, geometry.center);
    
    const hourDist = ClockMath.distance(mousePos, hourPos);
    const minuteDist = ClockMath.distance(mousePos, minutePos);
    const secondDist = ClockMath.distance(mousePos, secondPos);
    
    const minDist = Math.min(hourDist, minuteDist, secondDist);
    const threshold = 50;
    
    if (minDist > threshold) return null;
    
    if (minDist === hourDist) return 'hour';
    if (minDist === minuteDist) return 'minute';
    return 'second';
  }
}

export default function EducationalClock() {
  const [activeTab, setActiveTab] = useState('praticar');

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
  
  // Estados para verificação no modo praticar
  const [practiceTargetTime, setPracticeTargetTime] = useState<{ hour: number; minute: number }>({ hour: 15, minute: 30 });
  const [practiceVerificationResult, setPracticeVerificationResult] = useState<'none' | 'correct' | 'incorrect'>('none');
  
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

  const challenges: Challenge[] = [
    // Conceitos Básicos - Posicionamento dos Ponteiros
    { 
      id: 1, targetHour: 3, targetMinute: 0, 
      instruction: 'Coloque o ponteiro pequeno (das horas) no 3 e o ponteiro grande (dos minutos) no 12. Que horas são?', 
      difficulty: 'easy', category: 'Conceitos Básicos',
      explanation: 'Ponteiro pequeno no 3 = 3 horas. Ponteiro grande no 12 = 0 minutos. Resposta: 3:00'
    },
    { 
      id: 2, targetHour: 7, targetMinute: 30, 
      instruction: 'Coloque o ponteiro pequeno no 7 e o ponteiro grande no 6. Que horas são?', 
      difficulty: 'easy', category: 'Conceitos Básicos',
      explanation: 'Ponteiro pequeno entre 7 e 8 + ponteiro grande no 6 = 7:30 (7 e meia)'
    },
    { 
      id: 3, targetHour: 10, targetMinute: 0, 
      instruction: 'Se são 10 horas em ponto, onde devem estar os dois ponteiros no relógio?', 
      difficulty: 'easy', category: 'Conceitos Básicos',
      explanation: '10 horas em ponto: ponteiro pequeno no 10, ponteiro grande no 12'
    },
    
    // Conceito de Meia Hora
    { 
      id: 4, targetHour: 12, targetMinute: 30, 
      instruction: 'O almoço na escola começa às 12 e meia. Use seu relógio para mostrar que horas são.', 
      difficulty: 'easy', category: 'Conceito de Meia Hora',
      explanation: '12 e meia = 12:30. Ponteiro pequeno entre 12 e 1, ponteiro grande no 6'
    },
    { 
      id: 5, targetHour: 2, targetMinute: 30, 
      instruction: 'Se agora são 2 horas da tarde e você vai brincar daqui a meia hora, que horas você vai brincar?', 
      difficulty: 'easy', category: 'Conceito de Meia Hora',
      explanation: '2 horas + meia hora = 2:30 (duas e meia da tarde)'
    },
    
    // Situações do Cotidiano - Horários de Refeições
    { 
      id: 6, targetHour: 7, targetMinute: 0, 
      instruction: 'A janta da família é às 19 horas (7 da noite). Mostre no seu relógio como fica esse horário.', 
      difficulty: 'easy', category: 'Horários de Refeições',
      explanation: '19 horas = 7 da noite. No relógio 12h: ponteiro pequeno no 7, grande no 12'
    },
    { 
      id: 7, targetHour: 7, targetMinute: 0, 
      instruction: 'Se você lanche às 15 horas (3 da tarde) e a próxima refeição é 4 horas depois, que horas será o jantar?', 
      difficulty: 'medium', category: 'Horários de Refeições',
      explanation: '15h + 4h = 19h (7 da noite). Cálculo: 3 da tarde + 4 horas = 7 da noite'
    },
    
    // Viagens e Tempo de Deslocamento
    { 
      id: 8, targetHour: 11, targetMinute: 0, 
      instruction: 'Seu voo decola às 9 horas da manhã e a viagem demora 2 horas. Que horas o avião vai pousar?', 
      difficulty: 'medium', category: 'Viagens e Deslocamento',
      explanation: '9h + 2h = 11h. O avião pousa às 11 horas da manhã'
    },
    { 
      id: 9, targetHour: 8, targetMinute: 30, 
      instruction: 'Se você sai de casa às 8 horas para ir à escola e a viagem demora 30 minutos, que horas você chega na escola?', 
      difficulty: 'medium', category: 'Viagens e Deslocamento',
      explanation: '8h + 30min = 8h30min (8 e meia da manhã)'
    },
    { 
      id: 10, targetHour: 8, targetMinute: 15, 
      instruction: 'O ônibus passa na sua casa às 7h30min e demora 45 minutos para chegar ao destino. Que horas vocês chegam?', 
      difficulty: 'medium', category: 'Viagens e Deslocamento',
      explanation: '7h30min + 45min = 8h15min. Cálculo: 30 + 45 = 75min = 1h15min'
    },
    
    // Rotina Matinal - Sequência de Atividades
    { 
      id: 11, targetHour: 7, targetMinute: 45, 
      instruction: 'Você acorda às 7h. Demora 10min para escovar os dentes, 15min para se vestir e 20min para tomar café. Que horas você termina?', 
      difficulty: 'medium', category: 'Rotina Matinal',
      explanation: '7h + 10min + 15min + 20min = 7h45min. Total: 45 minutos de atividades'
    },
    { 
      id: 12, targetHour: 7, targetMinute: 30, 
      instruction: 'Se você precisa sair às 8h e demora 30min para se arrumar, que horas deve acordar?', 
      difficulty: 'medium', category: 'Rotina Matinal',
      explanation: '8h - 30min = 7h30min. Deve acordar às 7 e meia'
    },
    { 
      id: 13, targetHour: 7, targetMinute: 30, 
      instruction: 'Maria acorda às 6h30min, demora 1 hora para se arrumar e sai de casa. Que horas ela sai?', 
      difficulty: 'medium', category: 'Rotina Matinal',
      explanation: '6h30min + 1h = 7h30min. Maria sai às 7 e meia'
    },
    
    // Conceitos de Tempo - Intervalos
    { 
      id: 14, targetHour: 5, targetMinute: 30, 
      instruction: 'Se são 4h da tarde e você tem uma tarefa que demora 1h30min, que horas você vai terminar?', 
      difficulty: 'medium', category: 'Intervalos de Tempo',
      explanation: '4h + 1h30min = 5h30min (5 e meia da tarde)'
    },
    
    // Desafios com Múltiplas Operações
    { 
      id: 15, targetHour: 2, targetMinute: 25, 
      instruction: 'Pedro sai às 13h30min, caminha 20min até a padaria, fica 15min comprando, e demora 20min para voltar. Que horas chega em casa?', 
      difficulty: 'hard', category: 'Múltiplas Operações',
      explanation: '13h30min + 20min + 15min + 20min = 14h25min (2h25min da tarde)'
    },
    { 
      id: 16, targetHour: 3, targetMinute: 20, 
      instruction: 'Ana tem aula às 16h. Precisa chegar 15min antes para se trocar e demora 25min para chegar. Que horas deve sair?', 
      difficulty: 'hard', category: 'Múltiplas Operações',
      explanation: '16h - 15min - 25min = 15h20min (3h20min da tarde)'
    },
    
    // Desafios extras variados
    { 
      id: 17, targetHour: 4, targetMinute: 15, 
      instruction: 'Ajuste o relógio para 4:15 (um quarto depois das 4)', 
      difficulty: 'medium', category: 'Frações de Hora',
      explanation: 'Um quarto de hora = 15 minutos. 4:15 = quatro e quinze'
    },
    { 
      id: 18, targetHour: 9, targetMinute: 45, 
      instruction: 'Mostre no relógio 9:45 (um quarto para as 10)', 
      difficulty: 'medium', category: 'Frações de Hora',
      explanation: 'Um quarto para as 10 = 15min antes das 10 = 9:45'
    },
    { 
      id: 19, targetHour: 1, targetMinute: 5, 
      instruction: 'Configure o relógio para 1:05 (cinco minutos depois da 1)', 
      difficulty: 'medium', category: 'Minutos Específicos',
      explanation: '1 hora + 5 minutos = 1:05. Ponteiro grande no 1 (5min)'
    },
    { 
      id: 20, targetHour: 11, targetMinute: 55, 
      instruction: 'Desafio final: Ajuste para 11:55 (cinco minutos para o meio-dia)', 
      difficulty: 'hard', category: 'Desafio Final',
      explanation: '5 minutos para o meio-dia = 11:55. Ponteiro grande no 11 (55min)'
    },
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
      setScore(score + 1);
      setStreak(streak + 1);
    } else {
      setStreak(0);
    }
  };

  const checkPracticeTime = () => {
    const isCorrect = practiceTime24h.hour === practiceTargetTime.hour && 
                      practiceTime24h.minute === practiceTargetTime.minute;
    
    setPracticeVerificationResult(isCorrect ? 'correct' : 'incorrect');
    
    // Reset resultado após 3 segundos
    setTimeout(() => {
      setPracticeVerificationResult('none');
    }, 3000);
  };

  const generateRandomTarget = () => {
    const randomHour = Math.floor(Math.random() * 24);
    const randomMinute = Math.floor(Math.random() * 12) * 5; // Minutos em intervalos de 5
    setPracticeTargetTime({ hour: randomHour, minute: randomMinute });
    setPracticeVerificationResult('none');
  };

  useEffect(() => {
    generateChallenge();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-900 mb-4 drop-shadow-lg">
            ⏰ Relógio Educativo ⏰
          </h1>
          <p className="text-lg text-gray-600">
            Aprenda a ler as horas de forma divertida e interativa!
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-lg">
            {['praticar', 'desafios'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                {tab === 'praticar' && '🎯 Praticar'}
                {tab === 'desafios' && '🏆 Desafios'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">

          {/* Aba Praticar */}
          {activeTab === 'praticar' && (
            <div className="min-h-screen">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-purple-700 mb-2">Relógio de 24 Horas</h2>
                <p className="text-gray-600">Arraste os ponteiros e veja como o horário muda de 00:00 até 23:59!</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Coluna 1: Display, Fórmula e Período */}
                <div className="space-y-4">
                  {/* Display digital do horário atual */}
                  <div className="bg-blue-600 text-white rounded-lg p-4 text-center">
                    <div className="text-xl font-mono font-bold">
                      {String(practiceTime24h.hour).padStart(2, '0')}:
                      {String(practiceTime24h.minute).padStart(2, '0')}:
                      {String(practiceTime24h.second).padStart(2, '0')}
                    </div>
                  </div>

                  {/* Fórmula dos Minutos */}
                  {practiceTime24h.minute > 0 && (
                    <div className="bg-orange-500 text-white rounded-lg p-3">
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
                  <div className={`flex items-center justify-center px-4 py-3 rounded-lg font-bold ${getDayPeriod(practiceTime24h.hour).color}`}>
                    <span className="text-lg mr-2">{getDayPeriod(practiceTime24h.hour).icon}</span>
                    <div className="text-center">
                      <div className="text-base">{getDayPeriod(practiceTime24h.hour).period}</div>
                      <div className="text-xs opacity-75">({getDayPeriod(practiceTime24h.hour).timeRange})</div>
                    </div>
                  </div>

                  {/* Navegação de períodos e Reset */}
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600 text-center font-medium">Navegue pelos períodos:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        onClick={() => setPracticeTime24h(prev => ({ ...prev, hour: 3 }))}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-2 px-3"
                      >
                        🌙 Madrugada
                      </Button>
                      <Button 
                        onClick={() => setPracticeTime24h(prev => ({ ...prev, hour: 9 }))}
                        className="bg-orange-400 hover:bg-orange-500 text-white text-xs py-2 px-3"
                      >
                        🌅 Manhã
                      </Button>
                      <Button 
                        onClick={() => setPracticeTime24h(prev => ({ ...prev, hour: 15 }))}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs py-2 px-3"
                      >
                        ☀️ Tarde
                      </Button>
                      <Button 
                        onClick={() => setPracticeTime24h(prev => ({ ...prev, hour: 21 }))}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs py-2 px-3"
                      >
                        🌆 Noite
                      </Button>
                    </div>
                    
                    <Button 
                      onClick={() => setPracticeTime24h({ hour: 0, minute: 0, second: 0 })}
                      className="bg-gray-600 hover:bg-gray-700 text-white py-2 text-sm w-full"
                    >
                      🔄 Reset 00:00:00
                    </Button>
                  </div>
                </div>

                {/* Coluna 2: Relógio */}
                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center w-full">
                    <CanvasClockFixed 
                      clock={{
                        hour: convertTo12h(practiceTime24h.hour),
                        minute: practiceTime24h.minute,
                        second: practiceTime24h.second
                      }} 
                      size={420} 
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

                  {/* Sistema de verificação para modo praticar */}
                  <div className="mt-3 space-y-3">
                    {/* Horário alvo */}
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                      <h4 className="text-lg font-bold text-yellow-800 text-center mb-3">🎯 Horário Alvo</h4>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-900 mb-2">
                          {String(practiceTargetTime.hour).padStart(2, '0')}:
                          {String(practiceTargetTime.minute).padStart(2, '0')}
                        </div>
                        <p className="text-sm text-yellow-700">
                          Configure o relógio para este horário
                        </p>
                      </div>
                    </div>

                    {/* Botões de ação */}
                    <div className="flex space-x-3">
                      <Button 
                        onClick={checkPracticeTime}
                        className="bg-green-500 hover:bg-green-600 text-white flex-1 py-3"
                      >
                        Verificar Resposta
                      </Button>
                      <Button 
                        onClick={generateRandomTarget}
                        className="bg-blue-500 hover:bg-blue-600 text-white flex-1 py-3"
                      >
                        Novo Horário
                      </Button>
                    </div>

                    {/* Resultado da verificação */}
                    {practiceVerificationResult !== 'none' && (
                      <div className={`rounded-xl p-4 text-center ${
                        practiceVerificationResult === 'correct' 
                          ? 'bg-green-100 border-2 border-green-300' 
                          : 'bg-red-100 border-2 border-red-300'
                      }`}>
                        {practiceVerificationResult === 'correct' ? (
                          <div>
                            <div className="text-green-600 font-bold text-xl mb-1">🎉 Correto!</div>
                            <p className="text-green-700">Você configurou o horário corretamente!</p>
                          </div>
                        ) : (
                          <div>
                            <div className="text-red-600 font-bold text-xl mb-1">❌ Incorreto</div>
                            <p className="text-red-700">
                              Horário atual: {String(practiceTime24h.hour).padStart(2, '0')}:
                              {String(practiceTime24h.minute).padStart(2, '0')}
                            </p>
                            <p className="text-red-700">
                              Horário alvo: {String(practiceTargetTime.hour).padStart(2, '0')}:
                              {String(practiceTargetTime.minute).padStart(2, '0')}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Coluna 3: Tabuada do 5 e Boxes de visualização */}
                <div className="space-y-4">
                  {/* Tabuada do 5 */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-gray-700">
                        📊 Tabuada do 5 - Calcular minutos
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(num => (
                        <div 
                          key={num}
                          className={`px-3 py-2 rounded text-center font-bold text-white text-sm ${
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

                  {/* Boxes de Horas, Minutos e Segundos */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-gray-700 text-center border-b border-gray-300 pb-2">Visualização Detalhada</h4>
                    
                    {/* Box Horas */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-sm">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <div className="w-6 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                          <span className="text-xs font-bold text-blue-800">HORAS</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-900 mb-1">
                          {String(practiceTime24h.hour).padStart(2, '0')}
                        </div>
                        <div className="text-xs text-blue-700">
                          {practiceTime24h.hour === 0 ? 'Meia-noite' :
                           practiceTime24h.hour === 12 ? 'Meio-dia' :
                           practiceTime24h.hour >= 6 && practiceTime24h.hour < 12 ? `${practiceTime24h.hour} da manhã` :
                           practiceTime24h.hour >= 12 && practiceTime24h.hour < 18 ? `${practiceTime24h.hour - 12 === 0 ? 12 : practiceTime24h.hour - 12} da tarde` :
                           practiceTime24h.hour >= 18 ? `${practiceTime24h.hour - 12} da noite` :
                           `${practiceTime24h.hour} da madrugada`}
                        </div>
                      </div>
                    </div>

                    {/* Box Minutos */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 shadow-sm">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <div className="w-8 h-1 bg-red-600 rounded-full mr-2"></div>
                          <span className="text-xs font-bold text-red-800">MINUTOS</span>
                        </div>
                        <div className="text-2xl font-bold text-red-900 mb-1">
                          {String(practiceTime24h.minute).padStart(2, '0')}
                        </div>
                        <div className="text-xs text-red-700">
                          {practiceTime24h.minute === 0 ? 'Em ponto' :
                           practiceTime24h.minute === 15 ? 'Um quarto' :
                           practiceTime24h.minute === 30 ? 'Meia hora' :
                           practiceTime24h.minute === 45 ? 'Três quartos' :
                           `${practiceTime24h.minute} minutos`}
                        </div>
                      </div>
                    </div>

                    {/* Box Segundos */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 shadow-sm">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <div className="w-10 h-0.5 bg-green-600 rounded-full mr-2"></div>
                          <span className="text-xs font-bold text-green-800">SEGUNDOS</span>
                        </div>
                        <div className="text-2xl font-bold text-green-900 mb-1">
                          {String(practiceTime24h.second).padStart(2, '0')}
                        </div>
                        <div className="text-xs text-green-700">
                          {practiceTime24h.second === 0 ? 'Zero segundos' : `${practiceTime24h.second} segundos`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


              </div>
            </div>
          )}

          {/* Aba Desafios */}
          {activeTab === 'desafios' && (
            <div className="min-h-screen">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-green-700 mb-2">Desafios de Relógio</h2>
                <div className="bg-green-100 border border-green-300 rounded-lg p-3 mb-4">
                  <p className="text-green-800 font-medium">Score: {score} | Sequência: {streak}</p>
                </div>
              </div>

              {currentChallenge && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  {/* Coluna 1: Display, Fórmula e Período */}
                  <div className="space-y-4">

                    {/* Display digital do horário atual */}
                    <div className="bg-blue-600 text-white rounded-lg p-4 text-center">
                      <div className="text-xl font-mono font-bold">
                        {String(practiceTime.hour).padStart(2, '0')}:
                        {String(practiceTime.minute).padStart(2, '0')}:
                        {String(practiceTime.second).padStart(2, '0')}
                      </div>
                    </div>

                    {/* Fórmula dos Minutos */}
                    {practiceTime.minute > 0 && (
                      <div className="bg-orange-500 text-white rounded-lg p-3">
                        <div className="text-center mb-1">
                          <span className="text-sm font-bold">⚡ Fórmula dos Minutos:</span>
                        </div>
                        <div className="text-lg font-bold text-center mb-1">
                          ({Math.floor(practiceTime.minute / 5)} × 5) + {practiceTime.minute % 5} = {practiceTime.minute}
                        </div>
                        <div className="text-xs text-center">
                          Ponteiro azul aponta para {Math.floor(practiceTime.minute / 5)} — Minutos: {practiceTime.minute}
                        </div>
                      </div>
                    )}
                    
                    {/* Indicador de período do dia */}
                    <div className={`flex items-center justify-center px-4 py-3 rounded-lg font-bold ${getDayPeriod(practiceTime.hour).color}`}>
                      <span className="text-lg mr-2">{getDayPeriod(practiceTime.hour).icon}</span>
                      <div className="text-center">
                        <div className="text-base">{getDayPeriod(practiceTime.hour).period}</div>
                        <div className="text-xs opacity-75">({getDayPeriod(practiceTime.hour).timeRange})</div>
                      </div>
                    </div>

                    {/* Navegação de períodos e Reset */}
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600 text-center font-medium">Navegue pelos períodos:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          onClick={() => setPracticeTime(prev => ({ ...prev, hour: 3 }))}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-2 px-3"
                        >
                          🌙 Madrugada
                        </Button>
                        <Button 
                          onClick={() => setPracticeTime(prev => ({ ...prev, hour: 9 }))}
                          className="bg-orange-400 hover:bg-orange-500 text-white text-xs py-2 px-3"
                        >
                          🌅 Manhã
                        </Button>
                        <Button 
                          onClick={() => setPracticeTime(prev => ({ ...prev, hour: 15 }))}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs py-2 px-3"
                        >
                          ☀️ Tarde
                        </Button>
                        <Button 
                          onClick={() => setPracticeTime(prev => ({ ...prev, hour: 21 }))}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs py-2 px-3"
                        >
                          🌆 Noite
                        </Button>
                      </div>
                      
                      <Button 
                        onClick={() => setPracticeTime({ hour: 0, minute: 0, second: 0 })}
                        className="bg-gray-600 hover:bg-gray-700 text-white py-2 text-sm w-full"
                      >
                        🔄 Reset 00:00:00
                      </Button>
                    </div>
                  </div>

                  {/* Coluna 2: Relógio, Pergunta e Botão */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center w-full">
                      <CanvasClockFixed 
                        clock={practiceTime} 
                        size={420} 
                        isDraggable={true}
                        onTimeChange={(newTime: ClockState) => setPracticeTime(newTime)}
                      />
                    </div>

                    {/* Pergunta do desafio embaixo do relógio */}
                    <div className="mt-4 bg-yellow-100 border border-yellow-300 rounded-xl p-4 max-w-md">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          currentChallenge.difficulty === 'easy' ? 'bg-green-200 text-green-800' :
                          currentChallenge.difficulty === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-red-200 text-red-800'
                        }`}>
                          {currentChallenge.difficulty === 'easy' ? 'Fácil' :
                           currentChallenge.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                        </span>
                        <span className="text-sm text-gray-600">{currentChallenge.category}</span>
                      </div>
                      <h3 className="text-lg font-bold text-yellow-800">{currentChallenge.instruction}</h3>
                    </div>

                    {/* Botões de ação embaixo da pergunta */}
                    <div className="mt-4 space-y-3">
                      {!challengeCompleted ? (
                        <Button onClick={checkChallenge} className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg">
                          Verificar Resposta
                        </Button>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                            <div className="text-green-600 font-bold text-xl mb-2">Correto! Parabéns!</div>
                            {currentChallenge.explanation && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                                <h4 className="font-bold text-blue-800 mb-2">Explicação:</h4>
                                <p className="text-blue-700">{currentChallenge.explanation}</p>
                              </div>
                            )}
                          </div>
                          <Button onClick={generateChallenge} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg">
                            Próximo Desafio
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Coluna 3: Tabuada do 5 e Boxes de visualização */}
                  <div className="space-y-4">
                    {/* Tabuada do 5 */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-gray-700">
                          📊 Tabuada do 5 - Calcular minutos
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(num => (
                          <div 
                            key={num}
                            className={`px-3 py-2 rounded text-center font-bold text-white text-sm ${
                              Math.floor(practiceTime.minute / 5) === num 
                                ? 'bg-orange-500 ring-2 ring-orange-300' 
                                : 'bg-purple-500'
                            }`}
                          >
                            {num} × 5 = {num * 5}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Boxes de Horas, Minutos e Segundos */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-gray-700 text-center border-b border-gray-300 pb-2">Visualização Detalhada</h4>
                      
                      {/* Box Horas */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-sm">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <div className="w-6 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                            <span className="text-xs font-bold text-blue-800">HORAS</span>
                          </div>
                          <div className="text-2xl font-bold text-blue-900 mb-1">
                            {String(practiceTime.hour).padStart(2, '0')}
                          </div>
                          <div className="text-xs text-blue-700">
                            {practiceTime.hour === 0 ? 'Meia-noite' :
                             practiceTime.hour === 12 ? 'Meio-dia' :
                             practiceTime.hour >= 6 && practiceTime.hour < 12 ? `${practiceTime.hour} da manhã` :
                             practiceTime.hour >= 12 && practiceTime.hour < 18 ? `${practiceTime.hour - 12 === 0 ? 12 : practiceTime.hour - 12} da tarde` :
                             practiceTime.hour >= 18 ? `${practiceTime.hour - 12} da noite` :
                             `${practiceTime.hour} da madrugada`}
                          </div>
                        </div>
                      </div>

                      {/* Box Minutos */}
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 shadow-sm">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <div className="w-8 h-1 bg-red-600 rounded-full mr-2"></div>
                            <span className="text-xs font-bold text-red-800">MINUTOS</span>
                          </div>
                          <div className="text-2xl font-bold text-red-900 mb-1">
                            {String(practiceTime.minute).padStart(2, '0')}
                          </div>
                          <div className="text-xs text-red-700">
                            {practiceTime.minute === 0 ? 'Em ponto' :
                             practiceTime.minute === 15 ? 'Um quarto' :
                             practiceTime.minute === 30 ? 'Meia hora' :
                             practiceTime.minute === 45 ? 'Três quartos' :
                             `${practiceTime.minute} minutos`}
                          </div>
                        </div>
                      </div>

                      {/* Box Segundos */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 shadow-sm">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <div className="w-10 h-0.5 bg-green-600 rounded-full mr-2"></div>
                            <span className="text-xs font-bold text-green-800">SEGUNDOS</span>
                          </div>
                          <div className="text-2xl font-bold text-green-900 mb-1">
                            {String(practiceTime.second).padStart(2, '0')}
                          </div>
                          <div className="text-xs text-green-700">
                            {practiceTime.second === 0 ? 'Zero segundos' : `${practiceTime.second} segundos`}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progresso dos desafios */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-center mb-3">
                        <span className="text-sm text-gray-600 font-medium">Desafio {currentChallenge.id} de {challenges.length}</span>
                      </div>
                      <div className="flex justify-center space-x-1">
                        {[...Array(Math.min(challenges.length, 10))].map((_, i) => (
                          <div 
                            key={i}
                            className={`w-3 h-3 rounded-full ${
                              i < currentChallenge.id ? 'bg-green-400' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
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