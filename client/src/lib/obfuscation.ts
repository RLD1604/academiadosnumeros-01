const _0x4f2a = [0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa];
const _0x8b1c = (a: number, b: number) => a * b;
const _0x9d3e = (a: number, b: number) => a === b;
const _0x7f5g = (val: string) => parseInt(val, 10);
const _0x6h4i = (val: number) => !isNaN(val) && val > 0;

export const validate_input = (input: string): boolean => {
  const num = _0x7f5g(input);
  return _0x6h4i(num);
};

export const check_result = (user: number, expected: number): boolean => {
  return _0x9d3e(user, expected);
};

export const calculate_product = (factor1: number, factor2: number): number => {
  return _0x8b1c(factor1, factor2);
};

export const get_state = (isCorrect: boolean, attempts: number): string => {
  if (isCorrect && attempts === 1) return 'correct';
  if (isCorrect && attempts > 1) return 'corrected';
  if (!isCorrect) return 'error';
  return 'empty';
};

export const calculate_accuracy = (correct: number, total: number): number => {
  return total > 0 ? Math.round((correct / total) * 100) : 0;
};

const _0x2k8m = {
  timer: () => Date.now(),
  random: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
  format: (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
};

export const timer_utils = _0x2k8m;