import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { unsupportedValue as unsupported } from '../internal/validation';
import {
  layoutWidths,
  responsiveWidths,
  sizing,
  spacing,
  type LayoutWidthToken,
  type ResponsiveWidthToken,
  type SizingToken,
  type SpacingToken,
} from '../tokens';

type NamedValues = Readonly<Record<string, unknown>>;

const own = (record: NamedValues, key: PropertyKey) =>
  Object.prototype.hasOwnProperty.call(record, key);

export const containerLayoutStyleKeys = [
  'alignSelf',
  'bottom',
  'flex',
  'flexBasis',
  'flexGrow',
  'flexShrink',
  'left',
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

type StructuralInset = 0 | `${number}%`;

export type ContainerLayoutStyle = Pick<
  ViewStyle,
  'alignSelf' | 'flex' | 'flexBasis' | 'flexGrow' | 'flexShrink' | 'position'
> & {
  bottom?: StructuralInset;
  left?: StructuralInset;
  right?: StructuralInset;
  top?: StructuralInset;
  minWidth?: 0;
  width?: 0 | '100%' | 'auto';
};

type WidthToken = LayoutWidthToken | ResponsiveWidthToken | SizingToken;

export type LayoutTokenProps = {
  height?: SizingToken;
  margin?: SpacingToken;
  marginBottom?: SpacingToken;
  marginHorizontal?: SpacingToken;
  marginLeft?: SpacingToken;
  marginRight?: SpacingToken;
  marginTop?: SpacingToken;
  marginVertical?: SpacingToken;
  maxHeight?: SizingToken;
  maxWidth?: WidthToken;
  minHeight?: SizingToken;
  minWidth?: SizingToken;
  width?: WidthToken;
};

type ResolvedLayoutStyle = Pick<ViewStyle, keyof LayoutTokenProps>;

const resolveWidth = (token: WidthToken) => {
  if (Object.prototype.hasOwnProperty.call(responsiveWidths, token)) {
    return resolveDesignToken(responsiveWidths, token as ResponsiveWidthToken);
  }
  if (Object.prototype.hasOwnProperty.call(layoutWidths, token)) {
    return resolveDesignToken(layoutWidths, token as LayoutWidthToken);
  }
  return resolveDesignToken(sizing, token as SizingToken);
};

export const resolveLayoutTokenProps = ({
  height,
  margin,
  marginBottom,
  marginHorizontal,
  marginLeft,
  marginRight,
  marginTop,
  marginVertical,
  maxHeight,
  maxWidth,
  minHeight,
  minWidth,
  width,
}: LayoutTokenProps): ResolvedLayoutStyle => ({
  ...(height === undefined
    ? undefined
    : { height: resolveDesignToken(sizing, height) }),
  ...(margin === undefined
    ? undefined
    : { margin: resolveDesignToken(spacing, margin) }),
  ...(marginBottom === undefined
    ? undefined
    : { marginBottom: resolveDesignToken(spacing, marginBottom) }),
  ...(marginHorizontal === undefined
    ? undefined
    : { marginHorizontal: resolveDesignToken(spacing, marginHorizontal) }),
  ...(marginLeft === undefined
    ? undefined
    : { marginLeft: resolveDesignToken(spacing, marginLeft) }),
  ...(marginRight === undefined
    ? undefined
    : { marginRight: resolveDesignToken(spacing, marginRight) }),
  ...(marginTop === undefined
    ? undefined
    : { marginTop: resolveDesignToken(spacing, marginTop) }),
  ...(marginVertical === undefined
    ? undefined
    : { marginVertical: resolveDesignToken(spacing, marginVertical) }),
  ...(maxHeight === undefined
    ? undefined
    : { maxHeight: resolveDesignToken(sizing, maxHeight) }),
  ...(maxWidth === undefined
    ? undefined
    : { maxWidth: resolveWidth(maxWidth) }),
  ...(minHeight === undefined
    ? undefined
    : { minHeight: resolveDesignToken(sizing, minHeight) }),
  ...(minWidth === undefined
    ? undefined
    : { minWidth: resolveDesignToken(sizing, minWidth) }),
  ...(width === undefined ? undefined : { width: resolveWidth(width) }),
});

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

export const guardStructuralStyle = <Style extends object>(
  style: StyleProp<Style> | undefined,
  reservedKeys: readonly string[],
  supportedKeys: readonly string[],
) => {
  guardStyle(style, reservedKeys, supportedKeys);
  if (style == null || process.env.NODE_ENV === 'production') return;

  const flattened = StyleSheet.flatten(style) as
    Record<string, unknown> | undefined;
  if (flattened == null) return;

  for (const [key, value] of Object.entries(flattened)) {
    if (['bottom', 'left', 'right', 'top'].includes(key)) {
      if (value !== 0 && !(typeof value === 'string' && value.endsWith('%'))) {
        unsupported(value, ['0', 'percentage']);
      }
    }
    if (
      key === 'width' &&
      value !== 0 &&
      value !== '100%' &&
      value !== 'auto'
    ) {
      unsupported(value, ['0', '100%', 'auto']);
    }
    if (key === 'minWidth' && value !== 0) {
      unsupported(value, ['0']);
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
