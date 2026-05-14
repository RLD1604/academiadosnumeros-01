/**
 * Assistente Virtual Arquimedes - Academia dos Números
 * Desenvolvido por: Rodrigo Linhares Drummond
 * © 2025 Academia dos Números
 */

import { useState, useEffect } from 'react';
import { X, Lightbulb, Target, Trophy, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import archimedesImage from '@assets/image_1749661981819.png';

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
}

const tips: AssistantTip[] = [
  {
    id: 'multiplication-table',
    title: 'Tabela de Multiplicação Completa',
    message: 'Eureka! Esta é a famosa tabela pitagórica! Clique em qualquer célula para praticar. As cores revelam seu progresso: verde para acertos de primeira, amarelo para correções, vermelho para tentar novamente. Como dizia, a matemática é a linguagem do universo!',
    icon: <Target className="w-5 h-5" />,
    page: '/'
  },
  {
    id: 'individual-tables',
    title: 'Tabuadas Individuais',
    message: 'Sábio jovem! Aqui você domina cada tabuada separadamente, de 1 a 10. Como descobri ao medir círculos, a prática focada leva à perfeição. Escolha uma tabuada e pratique até dominá-la completamente!',
    icon: <Lightbulb className="w-5 h-5" />,
    page: '/tabuadas'
  },
  {
    id: 'quiz',
    title: 'Desafio Cronometrado',
    message: 'Prepare-se para o grande teste! Escolha de 10 a 100 questões e o tempo se ajusta automaticamente. Lembre-se: mesmo errando, continue até o final - os erros são oportunidades de aprendizado! Como sempre digo: "Dê-me uma alavanca e moverei o mundo!"',
    icon: <Trophy className="w-5 h-5" />,
    page: '/simulado'
  },
  {
    id: 'educational-clock',
    title: 'Relógio Educativo',
    message: 'Descubra os segredos do tempo! O relógio é uma máquina fascinante que usa círculos e matemática. Na guia "Aprender", arraste os ponteiros para entender como funcionam. Na "Praticar", teste seus conhecimentos! Lembre-se: use a tabuada do 5 para calcular os minutos - cada número no relógio vale 5 minutos!',
    icon: <Clock className="w-5 h-5" />,
    page: '/relogio'
  }
];

export default function VirtualAssistant({ currentPage, onClose, isVisible = true }: VirtualAssistantProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [currentTip, setCurrentTip] = useState<AssistantTip | null>(null);

  useEffect(() => {
    const tip = tips.find(t => t.page === currentPage);
    setCurrentTip(tip || null);
  }, [currentPage]);

  useEffect(() => {
    setIsOpen(isVisible);
  }, [isVisible]);

  if (!isOpen || !currentTip) return null;

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl shadow-2xl border-4 border-blue-200 transform transition-all duration-300 hover:scale-105 relative">
        {/* Arquimedes Avatar com emoji */}
        <div className="absolute -top-8 -left-8 w-16 h-16 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-3xl">
          🧙‍♂️
        </div>

        {/* Efeito de "faísca" */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse flex items-center justify-center text-xs">
          ✨
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-300/30 pt-6">
          <div className="flex items-center gap-2 ml-6">
            <div className="bg-blue-200 rounded-full p-2 text-blue-700">
              {currentTip.icon}
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
        <div className="p-4">
          <h4 className="text-blue-800 font-semibold text-sm mb-3 flex items-center gap-2">
            {currentTip.icon}
            {currentTip.title}
          </h4>
          <div className="bg-white/70 rounded-lg p-3 border border-blue-200">
            <p className="text-blue-700 text-xs leading-relaxed italic">
              "{currentTip.message}"
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <Button
            onClick={handleClose}
            size="sm"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-md"
          >
            Eureka! Entendi! 🎯
          </Button>
        </div>

        {/* Elementos decorativos gregos */}
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