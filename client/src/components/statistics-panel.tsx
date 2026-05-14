import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';

interface StatisticsProps {
  statistics: {
    correct: number;
    errors: number;
    corrected: number;
    totalAttempts: number;
    accuracy: number;
  };
  onViewAchievements?: () => void;
}

export default function StatisticsPanel({ statistics, onViewAchievements }: StatisticsProps) {
  return (
    <div className="academia-container h-full flex flex-col">
      <div className="text-center mb-8">
        <h2 className="academia-title">Registro de Conquistas</h2>
        <p className="academia-subtitle">Acompanhe seu progresso matemático</p>
      </div>
      
      {/* Estatísticas em grid vertical para lateral */}
      <div className="flex-1 space-y-4">
        <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{statistics.correct}</div>
              <div className="text-xs font-bold">Acertos Diretos</div>
            </div>
            <div className="text-2xl">🎯</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{statistics.corrected}</div>
              <div className="text-xs font-bold">Corrigidos</div>
            </div>
            <div className="text-2xl">⭐</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-400 to-red-500 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{statistics.errors}</div>
              <div className="text-xs font-bold">Para Melhorar</div>
            </div>
            <div className="text-2xl">🔄</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{statistics.totalAttempts}</div>
              <div className="text-xs font-bold">Tentativas</div>
            </div>
            <div className="text-2xl">🎮</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{statistics.accuracy}%</div>
              <div className="text-xs font-bold">Precisão</div>
            </div>
            <div className="text-2xl">🌟</div>
          </div>
        </div>
      </div>
      
      {/* Botão de Conquistas - Fixado na base */}
      {onViewAchievements && (
        <div className="mt-auto pt-6">
          <Button
            onClick={onViewAchievements}
            className="w-full academia-button-accent py-3 px-4 rounded-xl shadow-lg hover:shadow-xl"
          >
            <Trophy className="w-5 h-5 mr-2" />
            Ver Conquistas
          </Button>
        </div>
      )}
      

    </div>
  );
}
