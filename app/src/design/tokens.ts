import type { TextStyle } from 'react-native';

export const colors = {
  canvas: '#FFFDFC',
  surface: '#FFFFFF',
  surfaceSoft: '#F8F5F3',
  ink: '#252223',
  body: '#4E494B',
  muted: '#777174',
  hairline: '#E9E3E1',
  primary: '#E85D75',
  primaryPressed: '#D94B65',
  primarySoft: '#FDECEF',
  onPrimary: '#FFFFFF',
  positive: '#3E8A68',
  warning: '#A86D22',
  danger: '#B94343',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  xl: 20,
  lg: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radius = {
  input: 12,
  button: 12,
  card: 16,
  sheet: 24,
  full: 999,
} as const;

const text = (fontSize: number, lineHeight: number, fontWeight: TextStyle['fontWeight']) => ({
  fontSize,
  lineHeight,
  fontWeight,
} satisfies TextStyle);

export const typography = {
  display: text(28, 36, '700'),
  titleLarge: text(22, 30, '600'),
  title: text(18, 26, '600'),
  body: text(16, 24, '400'),
  bodySmall: text(14, 20, '400'),
  label: text(14, 20, '600'),
  caption: text(12, 18, '500'),
} as const;
