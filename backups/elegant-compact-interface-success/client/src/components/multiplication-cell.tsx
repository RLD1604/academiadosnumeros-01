import { useCallback } from 'react';
import { calculate_product, check_result, get_state } from '@/lib/obfuscation';

type CellState = 'empty' | 'correct' | 'error' | 'corrected';

interface CellData {
  value: string;
  state: CellState;
  attempts: number;
  firstAttemptWrong: boolean;
  hasBeenCorrected: boolean;
}

interface MultiplicationCellProps {
  row: number;
  col: number;
  cellData: CellData;
  onChange: (row: number, col: number, value: string) => void;
  onValidate: (row: number, col: number, value: string) => void;
}

export default function MultiplicationCell({ row, col, cellData, onChange, onValidate }: MultiplicationCellProps) {
  const _0xh1 = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(row, col, e.target.value);
  }, [row, col, onChange]);

  const _0xh2 = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const _v = e.target.value;
    onValidate(row, col, _v);
  }, [row, col, onValidate]);

  const _0xg3 = () => {
    let _bc = "w-full h-full text-center text-xs sm:text-sm lg:text-lg font-bold border-none outline-none transition-all duration-300 transform hover:scale-105 focus:scale-105 focus:z-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-greek";
    
    switch (cellData.state) {
      case 'correct':
        return `${_bc} bg-green-500 text-white shadow-lg`;
      case 'error':
        return `${_bc} bg-red-500 text-white shadow-lg`;
      case 'corrected':
        return `${_bc} bg-amber-500 text-white shadow-lg`;
      default:
        return `${_bc} bg-transparent text-primary hover:bg-background focus:bg-card focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground`;
    }
  };

  return (
    <input
      type="number"
      value={cellData.value}
      onChange={_0xh1}
      onBlur={_0xh2}
      className={_0xg3()}
      placeholder="?"
      min="1"
      max="100"
    />
  );
}
