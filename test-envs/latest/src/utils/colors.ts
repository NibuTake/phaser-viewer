export const COLORS = {
  primary: 0x4CAF50,
  secondary: 0x2196F3,
  accent: 0xFF5722,
  warning: 0xFF9800,
  error: 0xF44336,
  success: 0x8BC34A,
  dark: 0x212121,
  light: 0xFAFAFA
} as const;

export type ColorName = keyof typeof COLORS;