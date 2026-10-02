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

export function isAvatarImageSource(
  value: unknown,
): value is ImageSourcePropType {
  if (isLocalImageSource(value)) return true;
  if (Array.isArray(value))
    return value.length > 0 && value.every(isAvatarImageSource);
  if (!value || typeof value !== 'object') return false;
  const uri = (value as { uri?: unknown }).uri;
  if (typeof uri !== 'string') return false;
  try {
    const url = new URL(uri);
    return (
      (url.protocol === 'https:' ||
        (url.protocol === 'http:' &&
          ['localhost', '127.0.0.1'].includes(url.hostname))) &&
      url.hostname.length > 0 &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}
