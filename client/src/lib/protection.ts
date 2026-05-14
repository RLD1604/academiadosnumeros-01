const _0x123abc = String.fromCharCode;
const _0x456def = parseInt;
const _0x789ghi = Math.random;
const _0xabcdef = Array.from;

const _encrypt_string = (str: string): string => {
  return str.split('').map(char => 
    _0x123abc(char.charCodeAt(0) + 3)
  ).join('');
};

const _decrypt_string = (str: string): string => {
  return str.split('').map(char => 
    _0x123abc(char.charCodeAt(0) - 3)
  ).join('');
};

export const _protected_calculations = {
  multiply: (a: number, b: number): number => a * b,
  validate: (input: string, expected: number): boolean => _0x456def(input) === expected,
  generate_question: (): { a: number, b: number, result: number } => {
    const a = Math.floor(_0x789ghi() * 10) + 1;
    const b = Math.floor(_0x789ghi() * 10) + 1;
    return { a, b, result: a * b };
  },
  check_time: (start: number): number => Date.now() - start,
  format_percentage: (correct: number, total: number): number => 
    Math.round((correct / total) * 100)
};

export const _ui_constants = {
  colors: {
    correct: '#10B981',
    error: '#EF4444', 
    corrected: '#F59E0B',
    empty: '#F3F4F6'
  },
  messages: {
    well_done: _encrypt_string('Parabéns!'),
    try_again: _encrypt_string('Tente novamente'),
    excellent: _encrypt_string('Excelente!')
  }
};

export const _decode_message = (key: keyof typeof _ui_constants.messages): string => {
  return _decrypt_string(_ui_constants.messages[key]);
};