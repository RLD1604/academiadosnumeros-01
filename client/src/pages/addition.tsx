/**
 * Adição - Academia dos Números
 * Desenvolvido por: Rodrigo Linhares Drummond
 * © 2025 Academia dos Números
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RotateCcw } from 'lucide-react';

interface CellData {
  value: string;
  state: 'empty' | 'correct' | 'error' | 'corrected';
}

export default function Addition() {
  const [selectedTable, setSelectedTable] = useState<number>(1);
  const [cells, setCells] = useState<Map<string, CellData>>(new Map());

  const getCellKey = (num1: number, num2: number) => `${num1}-${num2}`;

  const handleAnswerChange = (num1: number, num2: number, value: string) => {
    const key = getCellKey(num1, num2);
    const correctAnswer = num1 + num2;
    const numValue = parseInt(value);

    setCells(prev => {
      const newCells = new Map(prev);
      const current = newCells.get(key);
      
      let state: CellData['state'] = 'empty';
      
      if (value.trim() !== '' && !isNaN(numValue)) {
        if (numValue === correctAnswer) {
          // Se estava errado e agora acertou, fica amarelo (corrigido)
          state = (current?.state === 'error' || current?.state === 'corrected') ? 'corrected' : 'correct';
        } else {
          state = 'error';
        }
      }

      newCells.set(key, { value, state });
      return newCells;
    });
  };

  const resetTable = useCallback(() => {
    setCells(new Map());
  }, []);

  const handleTableChange = (num: number) => {
    setSelectedTable(num);
    resetTable();
  };

  const getCellStyles = (state: CellData['state']) => {
    switch (state) {
      case 'correct': return 'bg-green-100 border-green-400 text-green-700';
      case 'error': return 'bg-red-100 border-red-400 text-red-700';
      case 'corrected': return 'bg-green-100 border-green-400 text-green-700';
      default: return 'bg-white border-blue-200 text-slate-700';
    }
  };

  const problems = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Header Compacto */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-md p-6 mb-6 text-white text-center">
        <h1 className="font-greek text-3xl md:text-4xl font-bold mb-1">➕ Tabuada de Adição</h1>
        <p className="text-sm md:text-base opacity-90 font-medium">Pratique e aprenda brincando!</p>
      </div>

      {/* Seletor Compacto */}
      <div className="flex flex-wrap justify-center gap-1.5 mb-6 bg-white p-3 rounded-xl shadow-sm border border-blue-100">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <Button
            key={num}
            onClick={() => handleTableChange(num)}
            className={`w-10 h-10 rounded-full font-bold text-base transition-all transform hover:scale-105 ${
              selectedTable === num 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
            }`}
          >
            {num}
          </Button>
        ))}
        <Button
          onClick={resetTable}
          variant="outline"
          className="ml-2 w-10 h-10 p-0 border-amber-200 text-amber-600 hover:bg-amber-50 rounded-full"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="bg-blue-600 text-white p-3 text-center font-bold text-xl font-greek">
          Somar +{selectedTable}
        </div>
        
        {/* Grid em 2 colunas para telas pequenas, 3 para médias */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50/30">
          {problems.map((baseNum) => {
            const key = getCellKey(baseNum, selectedTable);
            const cell = cells.get(key) || { value: '', state: 'empty' };
            
            return (
              <div 
                key={key} 
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-300 ${getCellStyles(cell.state)}`}
              >
                <div className="flex-grow flex items-center justify-between font-bold text-xl px-2 font-math">
                  <span>{baseNum}</span>
                  <span className="math-op math-op-add">+</span>
                  <span>{selectedTable}</span>
                  <span className="math-op math-op-eq">=</span>
                </div>
                <div className="w-20">
                  <Input
                    type="number"
                    value={cell.value}
                    onChange={(e) => handleAnswerChange(baseNum, selectedTable, e.target.value)}
                    className={`h-10 text-center font-bold text-xl bg-white border-2 rounded-md shadow-inner focus:ring-2 focus:ring-blue-400 transition-colors ${
                      cell.state !== 'empty' ? 'border-transparent' : 'border-slate-200'
                    }`}
                    placeholder="?"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legenda de Cores */}
      <div className="mt-6 flex justify-center gap-4 text-xs font-bold uppercase tracking-wider text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <span>Acerto</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <span>Erro</span>
        </div>
      </div>
    </div>
  );
}
