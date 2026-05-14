/**
 * Assistente Virtual Arquimedes - Academia dos Números
 * Desenvolvido por: Rodrigo Linhares Drummond
 * © 2025 Academia dos Números
 */

import { useState, useEffect, useRef } from 'react';
import { X, Lightbulb, Target, Trophy, Clock, Send, Loader2, Calculator, Plus, Minus, Divide, Hash, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ProactiveEvent } from '@/lib/arquimedes-events';

interface AssistantTip {
  id: string;
  title: string;
  message: string;
  icon: React.ReactNode;
  page: string;
}

interface VirtualAssistantProps {
  currentPage: string;
  onClose?: () => void;
  isVisible?: boolean;
  event?: ProactiveEvent | null;
}

const defaultTip: AssistantTip = {
  id: 'default',
  title: 'Bem-vindo à Academia!',
  message: 'Salve, jovem estudante! Sou Arquimedes de Siracusa, e estou aqui para te ajudar a dominar a matemática. Explore as seções e não hesite em me fazer perguntas!',
  icon: <Lightbulb className="w-5 h-5" />,
  page: '*',
};

const tips: AssistantTip[] = [
  {
    id: 'multiplication-table',
    title: 'Tabela de Multiplicação Completa',
    message: 'Eureka! Esta é a famosa tabela pitagórica! Clique em qualquer célula para praticar. As cores revelam seu progresso: verde para acertos de primeira, amarelo para correções, vermelho para tentar novamente. Como dizia, a matemática é a linguagem do universo!',
    icon: <Target className="w-5 h-5" />,
    page: '/',
  },
  {
    id: 'addition',
    title: 'Tabuadas de Adição',
    message: 'A adição é o alicerce de toda a matemática! Somar é reunir quantidades. Pratique cada tabuada de soma e perceba os padrões que surgem — cada linha esconde uma sequência bonita e previsível!',
    icon: <Plus className="w-5 h-5" />,
    page: '/adicao',
  },
  {
    id: 'subtraction',
    title: 'Tabuadas de Subtração',
    message: 'Subtrair é o inverso de somar — como desfazer passos! Quando você sabe somar bem, a subtração fica muito mais fácil. Observe que a subtração de uma tabuada é o espelho da adição correspondente!',
    icon: <Minus className="w-5 h-5" />,
    page: '/subtracao',
  },
  {
    id: 'individual-tables',
    title: 'Tabuadas Individuais',
    message: 'Sábio jovem! Aqui você domina cada tabuada separadamente, de 1 a 10. Como descobri ao medir círculos, a prática focada leva à perfeição. Escolha uma tabuada e pratique até dominá-la completamente!',
    icon: <Lightbulb className="w-5 h-5" />,
    page: '/tabuadas',
  },
  {
    id: 'division',
    title: 'Tabuadas de Divisão',
    message: 'A divisão é a arte de repartir igualmente! Ela é o inverso da multiplicação — se 4 × 3 = 12, então 12 ÷ 3 = 4. Sempre que tiver dificuldade, pense: "qual número vezes o divisor dá o dividendo?"',
    icon: <Divide className="w-5 h-5" />,
    page: '/divisao',
  },
  {
    id: 'quiz',
    title: 'Desafio Cronometrado',
    message: 'Prepare-se para o grande teste! Escolha de 10 a 100 questões e o tempo se ajusta automaticamente. Lembre-se: mesmo errando, continue até o final — os erros são oportunidades de aprendizado! Como sempre digo: "Dê-me uma alavanca e moverei o mundo!"',
    icon: <Trophy className="w-5 h-5" />,
    page: '/simulado',
  },
  {
    id: 'educational-clock',
    title: 'Relógio Educativo',
    message: 'Descubra os segredos do tempo! O relógio usa círculos e matemática. Na guia "Aprender", arraste os ponteiros para entender como funcionam. Na "Praticar", teste seus conhecimentos! Use a tabuada do 5 para calcular os minutos — cada número no relógio vale 5 minutos!',
    icon: <Clock className="w-5 h-5" />,
    page: '/relogio',
  },
  {
    id: 'calculadora',
    title: 'Calculadora com IA',
    message: 'Esta não é uma calculadora comum — é um laboratório de matemática! Além do resultado, peça a explicação e eu detalho cada passo da conta. Experimente números grandes e veja como a matemática funciona nos bastidores!',
    icon: <Calculator className="w-5 h-5" />,
    page: '/calculadora',
  },
  {
    id: 'contagem',
    title: 'Prática de Contagem',
    message: 'Contar é o primeiro passo de toda matemática! Os grandes filósofos gregos acreditavam que tudo no universo pode ser expresso em números. Pratique aqui e desenvolva sua intuição numérica — ela será sua aliada para sempre!',
    icon: <Hash className="w-5 h-5" />,
    page: '/contagem',
  },
];

export default function VirtualAssistant({ currentPage, onClose, isVisible = true, event }: VirtualAssistantProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [currentTip, setCurrentTip] = useState<AssistantTip>(defaultTip);
  const [question, setQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAsked, setHasAsked] = useState(false);
  const [proactiveMessage, setProactiveMessage] = useState('');
  const [isProactive, setIsProactive] = useState(false);
  const [isProactiveLoading, setIsProactiveLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const tip = tips.find(t => t.page === currentPage) || defaultTip;
    setCurrentTip(tip);
    setAiAnswer('');
    setHasAsked(false);
    setQuestion('');
    setProactiveMessage('');
    setIsProactive(false);
  }, [currentPage]);

  useEffect(() => {
    setIsOpen(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (!event) return;

    let cancelled = false;
    setIsProactiveLoading(true);
    setIsProactive(true);
    setHasAsked(false);
    setAiAnswer('');
    setProactiveMessage('');

    fetch('/api/arquimedes/evento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: event.type, context: event.context ?? {}, page: currentPage }),
    })
      .then(r => r.json())
      .then(data => {
        if (!cancelled) {
          setProactiveMessage(data.message || '');
          setIsProactiveLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProactiveMessage('');
          setIsProactiveLoading(false);
        }
      });

    if (!isOpen) setIsOpen(true);

    return () => { cancelled = true; };
  }, [event]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleAsk = async () => {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    setIsLoading(true);
    setHasAsked(true);
    setAiAnswer('');
    setIsProactive(false);
    setProactiveMessage('');

    try {
      const res = await fetch('/api/arquimedes/perguntar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed, page: currentPage }),
      });
      const data = await res.json();
      setAiAnswer(data.answer || currentTip.message);
    } catch {
      setAiAnswer(currentTip.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAsk();
  };

  const handleBackToTip = () => {
    setHasAsked(false);
    setAiAnswer('');
    setQuestion('');
    setIsProactive(false);
    setProactiveMessage('');
  };

  const isLoadingAny = isLoading || isProactiveLoading;

  let displayedMessage: string | null = null;
  let displayTitle = currentTip.title;
  let displayIcon = currentTip.icon;

  if (isProactive) {
    displayTitle = '⚡ Arquimedes reagiu!';
    displayIcon = <Zap className="w-5 h-5 text-yellow-500" />;
    displayedMessage = isProactiveLoading ? null : (proactiveMessage || currentTip.message);
  } else if (hasAsked) {
    displayedMessage = isLoading ? null : (aiAnswer || currentTip.message);
  } else {
    displayedMessage = currentTip.message;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl shadow-2xl border-4 border-blue-200 relative">
        {/* Arquimedes Avatar */}
        <div className="absolute -top-8 -left-8 w-16 h-16 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-3xl">
          🧙‍♂️
        </div>

        {/* Spark effect — pulses when proactive message is loading */}
        <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs ${isProactiveLoading ? 'bg-yellow-300 animate-bounce' : 'bg-yellow-400 animate-pulse'}`}>
          {isProactive ? '⚡' : '✨'}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-300/30 pt-6">
          <div className="flex items-center gap-2 ml-6">
            <div className={`rounded-full p-2 ${isProactive ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-200 text-blue-700'}`}>
              {displayIcon}
            </div>
            <div>
              <h3 className="text-blue-800 font-bold text-sm">🏛️ Arquimedes de Siracusa</h3>
              <p className="text-blue-600 text-xs">Matemático da Grécia Antiga</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-blue-700 hover:bg-blue-200/50 p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 pb-2">
          {!hasAsked && (
            <h4 className={`font-semibold text-sm mb-2 flex items-center gap-2 ${isProactive ? 'text-yellow-700' : 'text-blue-800'}`}>
              {displayIcon}
              {displayTitle}
            </h4>
          )}

          <div className={`rounded-lg p-3 border min-h-[60px] flex items-center justify-center ${isProactive ? 'bg-yellow-50/70 border-yellow-300' : 'bg-white/70 border-blue-200'}`}>
            {isLoadingAny ? (
              <div className="flex flex-col items-center gap-2 py-1">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                <p className="text-blue-500 text-xs">Arquimedes está pensando...</p>
              </div>
            ) : (
              <p className={`text-xs leading-relaxed italic whitespace-pre-line ${isProactive ? 'text-yellow-800' : 'text-blue-700'}`}>
                "{displayedMessage}"
              </p>
            )}
          </div>
        </div>

        {/* Question input */}
        <div className="px-4 pb-4 pt-2">
          <p className="text-blue-600 text-xs mb-1 font-medium">Tem alguma dúvida? Pergunte ao Arquimedes!</p>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua pergunta..."
              maxLength={300}
              className="flex-1 text-xs rounded-lg border border-blue-300 bg-white/80 px-3 py-2 text-blue-800 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
            <Button
              size="sm"
              onClick={handleAsk}
              disabled={isLoadingAny || !question.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-3 shadow-md disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>

          {(hasAsked || isProactive) && !isLoadingAny && (
            <button
              onClick={handleBackToTip}
              className="mt-2 text-blue-500 text-xs underline hover:text-blue-700 w-full text-center"
            >
              Ver dica original
            </button>
          )}
        </div>

        {/* Greek decorative elements */}
        <div className="absolute top-2 right-8 text-blue-300 opacity-50 text-xs">
          🏛️
        </div>
        <div className="absolute bottom-2 left-2 text-purple-300 opacity-40 text-xs">
          ⚖️
        </div>
      </div>
    </div>
  );
}
