export const colors = Object.freeze({
  accent: '#ade533',
  accentDisabledLayer: 'rgba(173, 229, 51, 0.8)',
  border: '#edede8',
  canvas: '#fbf8f0',
  danger: '#ffd6d6',
  deep: '#384540',
  info: '#d6edfa',
  ink: '#0e1716',
  muted: '#636b6e',
  olive: '#636657',
  surface: '#ffffff',
  surfaceAccent: '#d1f28a',
  surfaceMuted: '#f0f0eb',
  textSecondary: '#3b4742',
  transparent: 'transparent',
  warning: '#ffeb9e',
  focusRing: '#ADE533',
} as const);

export type ColorToken = keyof typeof colors;
