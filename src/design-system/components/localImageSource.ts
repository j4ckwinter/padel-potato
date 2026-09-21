import type { ImageSourcePropType } from 'react-native';

const localUriPattern = /^(?:file|content|asset|ph):/iu;

export function isLocalImageSource(value: unknown): value is ImageSourcePropType {
  if (typeof value === 'number') return Number.isInteger(value) && value > 0;
  if (Array.isArray(value)) return value.length > 0 && value.every(isLocalImageSource);
  if (!value || typeof value !== 'object') return false;

  const uri = (value as { uri?: unknown }).uri;
  return typeof uri === 'string' && localUriPattern.test(uri.trim());
}
