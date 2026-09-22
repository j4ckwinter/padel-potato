import type { ImageSourcePropType } from 'react-native';

const localImageUriPattern = /^(?:file|content|asset|ph):/iu;

export function unsupportedValue(
  value: unknown,
  supported: readonly unknown[],
): never {
  throw new Error(
    `Unsupported design-system value: ${String(value)}. Supported values: ${supported.join(', ')}`,
  );
}

export function assertOnlyKeys(
  value: object,
  supported: readonly string[],
  reportUnsupported: (key: string) => never = (key) =>
    unsupportedValue(key, supported),
) {
  for (const key of Object.keys(value)) {
    if (!supported.includes(key)) reportUnsupported(key);
  }
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isCallback(
  value: unknown,
): value is (...args: never[]) => unknown {
  return typeof value === 'function';
}

export function isLocalImageSource(
  value: unknown,
): value is ImageSourcePropType {
  if (typeof value === 'number') return Number.isInteger(value) && value > 0;
  if (Array.isArray(value))
    return value.length > 0 && value.every(isLocalImageSource);
  if (!value || typeof value !== 'object') return false;

  const uri = (value as { uri?: unknown }).uri;
  return typeof uri === 'string' && localImageUriPattern.test(uri.trim());
}
