import type { AccessibilityProps } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { colors, dimensions, type ColorToken } from '../tokens';
import { iconDefinitions, iconNames, type IconName } from './iconDefinitions';

const own = (record: object, key: PropertyKey) =>
  Object.prototype.hasOwnProperty.call(record, key);

const unsupported = (
  value: unknown,
  supportedValues: readonly string[],
): never => {
  throw new Error(
    `Unsupported design-system value: ${String(value)}. Supported values: ${supportedValues.join(', ')}`,
  );
};

const forbiddenRuntimeProps = [
  'height',
  'path',
  'style',
  'viewBox',
  'width',
  'xml',
] as const;

type InherentIconAccessibilityProps =
  | 'accessibilityElementsHidden'
  | 'accessibilityLabel'
  | 'accessibilityRole'
  | 'accessible'
  | 'importantForAccessibility';

export type IconProps = Omit<
  AccessibilityProps,
  InherentIconAccessibilityProps
> & {
  accessibilityLabel?: string;
  color?: ColorToken;
  name: IconName;
  size?: 'iconSize20';
  testID?: string;
};

export function Icon(props: IconProps) {
  for (const key of forbiddenRuntimeProps) {
    if (own(props, key)) unsupported(key, []);
  }

  const {
    accessibilityLabel,
    color = 'ink',
    name,
    size = 'iconSize20',
    ...accessibilityProps
  } = props;

  if (typeof name !== 'string' || !own(iconDefinitions, name)) {
    unsupported(name, iconNames);
  }
  if (typeof color !== 'string' || !own(colors, color)) {
    unsupported(color, Object.keys(colors));
  }
  if (size !== 'iconSize20') unsupported(size, ['iconSize20']);
  if (
    accessibilityLabel !== undefined &&
    (typeof accessibilityLabel !== 'string' ||
      accessibilityLabel.trim().length === 0)
  ) {
    unsupported(accessibilityLabel, ['non-empty accessibility label']);
  }

  const labelled = accessibilityLabel !== undefined;
  return (
    <SvgXml
      {...accessibilityProps}
      accessibilityElementsHidden={!labelled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={labelled ? 'image' : undefined}
      accessible={labelled}
      color={colors[color]}
      height={dimensions.iconSize20}
      importantForAccessibility={labelled ? 'yes' : 'no-hide-descendants'}
      width={dimensions.iconSize20}
      xml={iconDefinitions[name]}
    />
  );
}

export type { IconName } from './iconDefinitions';
