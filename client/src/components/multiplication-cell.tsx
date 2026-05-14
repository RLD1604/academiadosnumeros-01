import { useCallback } from 'react';

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
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(row, col, e.target.value);
  }, [row, col, onChange]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onValidate(row, col, value);
  }, [row, col, onValidate]);

  const getClassName = () => {
    const baseClasses = "w-full h-full text-center text-xs sm:text-sm lg:text-lg font-bold border-none outline-none transition-all duration-300 transform hover:scale-105 focus:scale-105 focus:z-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-greek";

    switch (cellData.state) {
      case 'correct':
        return `${baseClasses} bg-green-500 text-white shadow-lg`;
      case 'error':
        return `${baseClasses} bg-red-500 text-white shadow-lg`;
      case 'corrected':
        return `${baseClasses} bg-amber-500 text-white shadow-lg`;
      default:
        return `${baseClasses} bg-transparent text-primary hover:bg-background focus:bg-card focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground`;
    }
  };

  return (
    <input
      type="number"
      value={cellData.value}
      onChange={handleChange}
      onBlur={handleBlur}
      className={getClassName()}
      placeholder="?"
      min="1"
      max="100"
    />
  );
}
