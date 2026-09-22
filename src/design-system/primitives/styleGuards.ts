import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

type NamedValues = Readonly<Record<string, unknown>>;

const own = (record: NamedValues, key: PropertyKey) =>
  Object.prototype.hasOwnProperty.call(record, key);

const unsupported = (
  value: unknown,
  supportedValues: readonly string[],
): never => {
  throw new Error(
    `Unsupported design-system value: ${String(value)}. Supported values: ${supportedValues.join(', ')}`,
  );
};

export const containerLayoutStyleKeys = [
  'alignSelf',
  'bottom',
  'flex',
  'flexBasis',
  'flexGrow',
  'flexShrink',
  'height',
  'left',
  'margin',
  'marginBottom',
  'marginEnd',
  'marginHorizontal',
  'marginLeft',
  'marginRight',
  'marginStart',
  'marginTop',
  'marginVertical',
  'maxHeight',
  'maxWidth',
  'minHeight',
  'minWidth',
  'position',
  'right',
  'top',
  'width',
] as const satisfies readonly (keyof ViewStyle)[];

export const containerOwnedStyleKeys = [
  'alignItems',
  'flexDirection',
  'flexWrap',
  'gap',
  'justifyContent',
  'padding',
  'paddingBottom',
  'paddingEnd',
  'paddingHorizontal',
  'paddingLeft',
  'paddingRight',
  'paddingStart',
  'paddingTop',
  'paddingVertical',
] as const satisfies readonly (keyof ViewStyle)[];

export type ContainerLayoutStyle = Pick<
  ViewStyle,
  (typeof containerLayoutStyleKeys)[number]
>;

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

  const flattened = StyleSheet.flatten(style) as
    Record<string, unknown> | undefined;
  if (flattened == null) return;

  for (const key of Object.keys(flattened)) {
    if (reservedKeys.includes(key) || !supportedKeys.includes(key)) {
      unsupported(key, supportedKeys);
    }
  }
};

export const resolveBooleanDesignValue = <TrueValue, FalseValue>(
  value: boolean,
  trueValue: TrueValue,
  falseValue: FalseValue,
) => {
  if (typeof value !== 'boolean') {
    return unsupported(value, ['true', 'false']);
  }

  return value ? trueValue : falseValue;
};
