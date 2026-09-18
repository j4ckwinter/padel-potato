import { StyleSheet, type StyleProp } from 'react-native';

type NamedValues = Readonly<Record<string, unknown>>;

const own = (record: NamedValues, key: PropertyKey) =>
  Object.prototype.hasOwnProperty.call(record, key);

const unsupported = (value: unknown, supportedValues: readonly string[]): never => {
  throw new Error(
    `Unsupported design-system value: ${String(value)}. Supported values: ${supportedValues.join(', ')}`,
  );
};

export const resolveDesignToken = <
  Values extends NamedValues,
  Token extends keyof Values,
>(
  values: Values,
  token: Token,
): Values[Token] => {
  const supportedValues = Object.keys(values);

  if (typeof token !== 'string' || !own(values, token)) {
    return unsupported(token, supportedValues);
  }

  return values[token];
};

export const guardStyle = <Style extends object>(
  style: StyleProp<Style> | undefined,
  reservedKeys: readonly string[],
  supportedKeys: readonly string[],
) => {
  if (style == null || process.env.NODE_ENV === 'production') return;

  const flattened = StyleSheet.flatten(style) as Record<string, unknown> | undefined;
  if (flattened == null) return;

  for (const key of Object.keys(flattened)) {
    if (reservedKeys.includes(key) || !supportedKeys.includes(key)) {
      unsupported(key, supportedKeys);
    }
  }
};
