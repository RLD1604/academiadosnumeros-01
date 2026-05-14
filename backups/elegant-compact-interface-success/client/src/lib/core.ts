const _0xa1b2c3 = (x: number, y: number) => x * y;
const _0xd4e5f6 = (s: string) => parseInt(s, 10);
const _0xg7h8i9 = (n: number) => !isNaN(n);
const _0xj1k2l3 = () => Math.floor(Math.random() * 10) + 1;
const _0xm4n5o6 = (t: number) => {
  const m = Math.floor(t / 60000);
  const s = Math.floor((t % 60000) / 1000);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const core = {
  calc: _0xa1b2c3,
  parse: _0xd4e5f6,
  valid: _0xg7h8i9,
  rand: _0xj1k2l3,
  time: _0xm4n5o6,
  check: (a: number, b: number) => a === b,
  percent: (c: number, t: number) => t > 0 ? Math.round((c / t) * 100) : 0,
  state: (correct: boolean, attempts: number) => {
    if (correct && attempts === 1) return 'correct';
    if (correct && attempts > 1) return 'corrected';
    return correct ? 'correct' : 'error';
  }
};