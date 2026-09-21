import { StyleSheet, View } from 'react-native';

import { Icon } from '../../assets/Icon';
import { Text } from '../../primitives/Text';
import { colors } from '../../tokens';

export type StepProgressValue = 1 | 2 | 3 | 'complete';
export type StepProgressProps = Readonly<{ value: StepProgressValue }>;

const supportedValues = Object.freeze([1, 2, 3, 'complete'] as const);

function unsupported(value: unknown): never {
  throw new Error(
    `Unsupported Step Progress configuration: ${String(value)}. Supported configurations: 1/active, 2/active, 3/active, complete/complete.`,
  );
}

function validateStepProgressProps(props: StepProgressProps) {
  const runtime = props as unknown as Record<string, unknown>;
  const keys = Object.keys(runtime);
  if (keys.length !== 1 || keys[0] !== 'value') unsupported(`properties ${keys.join(', ')}`);
  if (!supportedValues.includes(runtime.value as StepProgressValue)) unsupported(runtime.value);
}

export function StepProgress(props: StepProgressProps) {
  validateStepProgressProps(props);
  const complete = props.value === 'complete';
  const now = complete ? 3 : props.value;
  const label = complete ? 'Setup complete' : `Step ${props.value} of 3`;

  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      accessibilityValue={{ max: 3, min: 1, now, text: label }}
      accessible
      style={styles.container}
    >
      <View style={styles.labelRow}>
        <Text variant="label">{label}</Text>
        {complete ? <Icon name="check" /> : null}
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${(now / 3) * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    height: 48,
    justifyContent: 'center',
    width: 352,
  },
  fill: {
    backgroundColor: colors.accent,
    borderRadius: 4,
    height: 8,
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  track: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 4,
    height: 8,
    overflow: 'hidden',
    width: 352,
  },
});
