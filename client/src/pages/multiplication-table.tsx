/**
 * Tabela de Multiplicação - Academia dos Números
 * Desenvolvido por: Rodrigo Linhares Drummond
 * © 2025 Academia dos Números
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import MultiplicationCell from '@/components/multiplication-cell';
import StatisticsPanel from '@/components/statistics-panel';
import AchievementSystem from '@/components/achievement-system';

type CellState = 'empty' | 'correct' | 'error' | 'corrected';

interface CellData {
  value: string;
  state: CellState;
  attempts: number;
  firstAttemptWrong: boolean;
  hasBeenCorrected: boolean;
}

export default function MultiplicationTable() {
  const [cells, setCells] = useState<Map<string, CellData>>(new Map());
  const [showAchievements, setShowAchievements] = useState(false);
  const [statistics, setStatistics] = useState({
    correct: 0,
    errors: 0,
    corrected: 0,
    totalAttempts: 0,
    accuracy: 0
  });

  const getCellKey = (row: number, col: number) => `${row}-${col}`;

  const getCellData = (row: number, col: number): CellData => {
    const key = getCellKey(row, col);
    return cells.get(key) || { 
      value: '', 
      state: 'empty', 
      attempts: 0,
      firstAttemptWrong: false,
      hasBeenCorrected: false
    };
  };

  const updateStatistics = useCallback((newCells: Map<string, CellData>) => {
    let correct = 0;
    let errors = 0;
    let corrected = 0;
    let totalAttempts = 0;

    newCells.forEach((cellData) => {
      totalAttempts += cellData.attempts;
      
      if (cellData.state === 'correct' && cellData.attempts === 1) {
        // Apenas acertos na primeira tentativa
        correct++;
      } else if (cellData.state === 'corrected' || (cellData.state === 'correct' && cellData.attempts > 1)) {
        // Correções ou acertos após várias tentativas
        corrected++;
      } else if (cellData.state === 'error') {
        // Erros não corrigidos
        errors++;
      }
    });

    const totalAnswered = correct + corrected + errors;
    const accuracy = totalAnswered > 0 ? Math.round(((correct + corrected) / totalAnswered) * 100) : 0;

    setStatistics({ correct, errors, corrected, totalAttempts, accuracy });
  }, []);

  const handleCellChange = useCallback((row: number, col: number, value: string) => {
    const key = getCellKey(row, col);
    
    setCells(prev => {
      const newCells = new Map(prev);
      const currentCell = newCells.get(key) || { 
        value: '', 
        state: 'empty' as CellState, 
        attempts: 0,
        firstAttemptWrong: false,
        hasBeenCorrected: false
      };
      
      // Apenas atualizar o valor, sem validar
      newCells.set(key, {
        ...currentCell,
        value: value
      });
      
      return newCells;
    });
  }, []);

  const handleCellValidate = useCallback((row: number, col: number, value: string) => {
    const key = getCellKey(row, col);
    const correctAnswer = row * col;
    const numValue = parseInt(value);
    
    setCells(prev => {
      const newCells = new Map(prev);
      const currentCell = newCells.get(key) || { 
        value: value, 
        state: 'empty' as CellState, 
        attempts: 0,
        firstAttemptWrong: false,
        hasBeenCorrected: false
      };
      
      if (value === '' || isNaN(numValue)) {
        // Célula vazia - resetar
        newCells.set(key, {
          value: value,
          state: 'empty',
          attempts: 0,
          firstAttemptWrong: false,
          hasBeenCorrected: false
        });
      } else {
        const newAttempts = currentCell.attempts + 1;
        
        if (numValue === correctAnswer) {
          // RESPOSTA CORRETA
          if (currentCell.attempts === 0) {
            // Primeira tentativa e correta = VERDE
            newCells.set(key, {
              value: value,
              state: 'correct',
              attempts: newAttempts,
              firstAttemptWrong: false,
              hasBeenCorrected: false
            });
          } else {
            // Já teve tentativas antes e agora acertou = AMARELO
            newCells.set(key, {
              value: value,
              state: 'corrected',
              attempts: newAttempts,
              firstAttemptWrong: currentCell.firstAttemptWrong || currentCell.state === 'error',
              hasBeenCorrected: true
            });
          }
        } else {
          // RESPOSTA ERRADA = VERMELHO
          newCells.set(key, {
            value: value,
            state: 'error',
            attempts: newAttempts,
            firstAttemptWrong: currentCell.attempts === 0 ? true : currentCell.firstAttemptWrong,
            hasBeenCorrected: currentCell.hasBeenCorrected
          });
        }
      }
      
      updateStatistics(newCells);
      return newCells;
    });
  }, [updateStatistics]);

  const resetTable = useCallback(() => {
    setCells(new Map());
    setStatistics({ correct: 0, errors: 0, corrected: 0, totalAttempts: 0, accuracy: 0 });
  }, []);

  const checkAllAnswers = useCallback(() => {
    setCells(prev => {
      const newCells = new Map(prev);
      
      // Trigger validation for all filled cells
      for (let row = 1; row <= 10; row++) {
        for (let col = 1; col <= 10; col++) {
          const cellData = getCellData(row, col);
          if (cellData.value && cellData.value.trim() !== '') {
            const key = getCellKey(row, col);
            const correctAnswer = row * col;
            const numValue = parseInt(cellData.value);
            
            if (!isNaN(numValue)) {
              if (numValue === correctAnswer) {
                if (cellData.firstAttemptWrong || cellData.hasBeenCorrected) {
                  newCells.set(key, { ...cellData, state: 'corrected' });
                } else {
                  newCells.set(key, { ...cellData, state: 'correct' });
                }
              } else {
                const firstAttemptWrong = cellData.attempts === 0 ? true : cellData.firstAttemptWrong;
                newCells.set(key, { 
                  ...cellData, 
                  state: 'error',
                  attempts: Math.max(1, cellData.attempts),
                  firstAttemptWrong
                });
              }
            }
          }
        }
      }
      
      updateStatistics(newCells);
      return newCells;
    });
  }, [updateStatistics]);

  const showHints = useCallback(() => {
    // Find empty cells and highlight them
    const emptyCells = document.querySelectorAll('input[data-state="empty"]');
    emptyCells.forEach(input => {
      const element = input as HTMLInputElement;
      element.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
      setTimeout(() => {
        element.style.boxShadow = '';
      }, 2000);
    });
  }, []);

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 greek-pattern opacity-5"></div>
      <div className="container mx-auto px-6 py-8 max-w-6xl relative">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="font-greek text-3xl sm:text-4xl lg:text-5xl font-bold text-aegean mb-2 sm:mb-4">
            Tabela Pitagórica
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gold font-medium italic px-4">
            Descubra os segredos dos números na tradição dos grandes matemáticos
          </p>
        </div>
        
        {/* Main Content Grid - Statistics + Table */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 lg:items-stretch">
          {/* Statistics Panel - Left Side */}
          <div className="lg:w-1/3">
            <StatisticsPanel 
              statistics={statistics} 
              onViewAchievements={() => setShowAchievements(true)}
            />
          </div>
          
          {/* Multiplication Table - Right Side */}
          <div className="lg:flex-1">
            <div className="academia-container h-full">
              <div className="text-center mb-4 sm:mb-6 lg:mb-8">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-700 mb-2">Complete a Tabela dos Sábios</h2>
                <p className="text-sm sm:text-base lg:text-lg text-amber-600 italic mb-4">Cada número revela um segredo matemático</p>
                
                {/* Legenda de Cores - Horizontal Responsiva */}
                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-gray-200 shadow-lg mb-4 max-w-4xl mx-auto">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3 text-center">🌈 Código das Cores</h4>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
                    <div className="bg-green-200 rounded-lg p-2 sm:p-3 text-center flex-1 min-w-0">
                      <div className="font-bold text-green-800 text-xs sm:text-sm">Verde:</div>
                      <div className="text-green-700 text-xs">Acertou de primeira!</div>
                    </div>
                    <div className="bg-yellow-200 rounded-lg p-2 sm:p-3 text-center flex-1 min-w-0">
                      <div className="font-bold text-yellow-800 text-xs sm:text-sm">Amarelo:</div>
                      <div className="text-yellow-700 text-xs">Corrigiu o erro!</div>
                    </div>
                    <div className="bg-red-200 rounded-lg p-2 sm:p-3 text-center flex-1 min-w-0">
                      <div className="font-bold text-red-800 text-xs sm:text-sm">Vermelho:</div>
                      <div className="text-red-700 text-xs">Tente novamente!</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center overflow-x-auto">
                <div className="inline-block min-w-max">
                  <table className="border-collapse bg-card/80 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
                    <thead>
                      <tr>
                        <th className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-xs sm:text-sm lg:text-base font-bold bg-blue-600 text-white border border-border">
                          ×
                        </th>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                          <th key={num} className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-xs sm:text-sm lg:text-base font-bold bg-blue-500 text-white border border-border">
                            {num}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map(row => (
                        <tr key={row}>
                          <td className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-xs sm:text-sm lg:text-base font-bold bg-blue-500 text-white border border-border text-center">
                            {row}
                          </td>
                          {Array.from({ length: 10 }, (_, j) => j + 1).map(col => (
                            <td key={col} className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 border border-border p-0 bg-background/60">
                              <MultiplicationCell
                                row={row}
                                col={col}
                                cellData={getCellData(row, col)}
                                onChange={handleCellChange}
                                onValidate={handleCellValidate}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend and Instructions */}
        <div className="academia-container mb-6 sm:mb-8">
          <div className="text-center mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-700 mb-2">🎯 Como Jogar</h3>
            <p className="text-sm sm:text-base text-muted-foreground">Aprenda os símbolos e complete a tabela dos sábios</p>
          </div>
          
          {/* Instructions */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-blue-200">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm sm:text-base">💡</span>
              </div>
              <div>
                <h4 className="font-bold text-primary mb-1 sm:mb-2 font-greek text-sm sm:text-base">Dica do Mestre</h4>
                <p className="text-primary/80 font-greek leading-relaxed text-xs sm:text-sm lg:text-base">
                  Preencha cada célula com o resultado da multiplicação da linha pela coluna.<br className="hidden sm:block"/>
                  Por exemplo, Linha 3 × Coluna 4 = 12. Linha 5 x Coluna 5 = 25<br className="hidden sm:block"/>
                  Use a sabedoria dos números antigos!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
          <Button 
            onClick={resetTable}
            className="academia-button-primary py-2 sm:py-3 px-6 sm:px-8 text-sm sm:text-base rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl w-full sm:w-auto"
          >
            🔄 Recomeçar Jornada
          </Button>
          <Button 
            onClick={checkAllAnswers}
            className="academia-button-secondary py-2 sm:py-3 px-6 sm:px-8 text-sm sm:text-base rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl w-full sm:w-auto"
          >
            ✅ Verificar Sabedoria
          </Button>
          <Button 
            onClick={showHints}
            className="academia-button-accent py-2 sm:py-3 px-6 sm:px-8 text-sm sm:text-base rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl w-full sm:w-auto"
          >
            💡 Revelação
          </Button>
        </div>
        
        {/* Achievement System */}
        <AchievementSystem
          statistics={statistics}
          isVisible={showAchievements}
          onClose={() => setShowAchievements(false)}
        />


      </div>
    </div>
  );
}
