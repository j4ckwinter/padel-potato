import { Image } from 'react-native';

const supportedProps = ['width', 'accessibilityLabel', 'testID'] as const;

const unsupported = (value: unknown, supportedValues: readonly string[]): never => {
  throw new Error(
    `Unsupported design-system value: ${String(value)}. Supported values: ${supportedValues.join(', ')}`,
  );
};

export type BrandLockupStackedProps = {
  accessibilityLabel?: string;
  testID?: string;
  width: number;
};

export function BrandLockupStacked(props: BrandLockupStackedProps) {
  for (const key of Object.keys(props)) {
    if (!supportedProps.includes(key as (typeof supportedProps)[number])) {
      unsupported(key, supportedProps);
    }
  }
  if (typeof props.width !== 'number' || !Number.isFinite(props.width) || props.width <= 0) {
    unsupported(props.width, ['finite positive width']);
  }
  if (
    props.accessibilityLabel !== undefined &&
    (typeof props.accessibilityLabel !== 'string' || props.accessibilityLabel.trim().length === 0)
  ) {
    unsupported(props.accessibilityLabel, ['non-empty accessibility label']);
  }

  return (
    <Image
      accessibilityLabel={props.accessibilityLabel ?? 'Padel Potato'}
      accessibilityRole="image"
      accessible
      resizeMode="contain"
      source={require('../../../design-spec/assets/normalized/brand-lockup-stacked.png')}
      style={{ height: props.width * (14 / 75), width: props.width }}
      testID={props.testID}
    />
  );
}
