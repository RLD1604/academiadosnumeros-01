import { useState, useEffect, useMemo } from 'react';
import { Trophy, Star, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

interface AchievementSystemProps {
  statistics: {
    correct: number;
    errors: number;
    corrected: number;
    totalAttempts: number;
    accuracy: number;
  };
  onClose: () => void;
  isVisible: boolean;
}

export default function AchievementSystem({ statistics, onClose, isVisible }: AchievementSystemProps) {
  const [newUnlocked, setNewUnlocked] = useState<Achievement[]>([]);

  const achievements = useMemo<Achievement[]>(() => [
    {
      id: 'first-steps',
      title: 'Primeiros Passos',
      description: 'Complete 10 multiplicações',
      icon: <Star className="w-6 h-6" />,
      unlocked: statistics.correct >= 10,
      progress: Math.min(statistics.correct, 10),
      maxProgress: 10
    },
    {
      id: 'perfectionist',
      title: 'Perfeccionista',
      description: 'Acerte 20 multiplicações seguidas',
      icon: <Trophy className="w-6 h-6" />,
      unlocked: statistics.accuracy >= 95 && statistics.correct >= 20,
      progress: statistics.accuracy >= 95 ? Math.min(statistics.correct, 20) : 0,
      maxProgress: 20
    },
    {
      id: 'speed-demon',
      title: 'Velocista',
      description: 'Complete 50 multiplicações',
      icon: <Zap className="w-6 h-6" />,
      unlocked: statistics.correct >= 50,
      progress: Math.min(statistics.correct, 50),
      maxProgress: 50
    },
    {
      id: 'persistent',
      title: 'Persistente',
      description: 'Corrija 10 erros',
      icon: <Target className="w-6 h-6" />,
      unlocked: statistics.corrected >= 10,
      progress: Math.min(statistics.corrected, 10),
      maxProgress: 10
    }
  ], [statistics.correct, statistics.accuracy, statistics.corrected]);

  useEffect(() => {
    // Check for newly unlocked achievements
    const currentUnlocked = achievements.filter(a => a.unlocked);
    
    // Simple check to prevent showing notifications on first load
    if (statistics.correct > 0 || statistics.corrected > 0) {
      const recentlyUnlocked = currentUnlocked.filter(achievement => {
        // Show notification for achievements that just got unlocked
        if (achievement.id === 'first-steps' && statistics.correct === 10) return true;
        if (achievement.id === 'perfectionist' && statistics.accuracy >= 95 && statistics.correct === 20) return true;
        if (achievement.id === 'speed-demon' && statistics.correct === 50) return true;
        if (achievement.id === 'persistent' && statistics.corrected === 10) return true;
        return false;
      });

      if (recentlyUnlocked.length > 0) {
        setNewUnlocked(recentlyUnlocked);
        setTimeout(() => setNewUnlocked([]), 3000);
      }
    }
  }, [achievements, statistics.correct, statistics.corrected, statistics.accuracy]);

  if (!isVisible) return null;

  return (
    <>
      {/* Notificação de nova conquista */}
      {newUnlocked.map((achievement, index) => (
        <div 
          key={achievement.id}
          className={`fixed top-20 right-4 z-50 transform transition-all duration-500 ${
            index === 0 ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ top: `${80 + index * 80}px` }}
        >
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-2xl border-4 border-white p-4 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-2 text-orange-500">
                {achievement.icon}
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">🎉 Conquista Desbloqueada!</h3>
                <p className="text-white/90 font-semibold">{achievement.title}</p>
                <p className="text-white/80 text-xs">{achievement.description}</p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Painel de conquistas */}
      <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-700 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Conquistas
              </h2>
              <Button variant="ghost" onClick={onClose} className="text-slate-500">×</Button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    achievement.unlocked ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
                  }`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold ${
                      achievement.unlocked ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {achievement.title}
                      {achievement.unlocked && <span className="ml-2">✓</span>}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                    
                    {/* Barra de progresso */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          achievement.unlocked ? 'bg-green-500' : 'bg-blue-400'
                        }`}
                        style={{ 
                          width: `${(achievement.progress / achievement.maxProgress) * 100}%` 
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {achievement.progress}/{achievement.maxProgress}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t bg-gray-50 rounded-b-2xl">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {achievements.filter(a => a.unlocked).length} de {achievements.length} conquistas desbloqueadas
              </p>
              <div className="mt-2 flex justify-center gap-1">
                {achievements.map((_, index) => (
                  <div 
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      achievements[index].unlocked ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}