import { StyleSheet, View } from 'react-native';

import { Text } from '../../primitives/Text';
import { colors } from '../../tokens';
import { StatusChip, type StatusChipStyle } from '../status/StatusChip';

type SharedPreferences = Readonly<{
  days: string;
  side: string;
  timeOfDay: string;
}>;

export type PlayerPreferencesCardProps = SharedPreferences & (
  | Readonly<{ content: 'full'; level: string }>
  | Readonly<{ content: 'profile'; level?: never }>
);

const supportedRuntimeProps = Object.freeze([
  'content',
  'days',
  'level',
  'side',
  'timeOfDay',
] as const);
const supportedTuples = Object.freeze(['full', 'profile'] as const);

function unsupported(reason: string): never {
  throw new Error(
    `Unsupported Player Preferences Card configuration: ${reason}. Supported configurations: ${supportedTuples.join(', ')}.`,
  );
}

function validateText(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    unsupported(`${field} must be non-empty text`);
  }
}

function validatePlayerPreferencesCardProps(props: PlayerPreferencesCardProps) {
  const runtime = props as unknown as Record<string, unknown>;
  for (const key of Object.keys(runtime)) {
    if (!supportedRuntimeProps.includes(key as (typeof supportedRuntimeProps)[number])) {
      unsupported(`unsupported property ${key}`);
    }
  }
  if (!supportedTuples.includes(runtime.content as never)) {
    unsupported(`unknown content ${String(runtime.content)}`);
  }
  validateText(runtime.side, 'side');
  validateText(runtime.days, 'days');
  validateText(runtime.timeOfDay, 'timeOfDay');
  if (runtime.content === 'full') validateText(runtime.level, 'full level');
  if (runtime.content === 'profile' && Object.prototype.hasOwnProperty.call(runtime, 'level')) {
    unsupported('profile omits the level preference');
  }
}

function StaticPreference({ label, style }: Readonly<{
  label: string;
  style: StatusChipStyle;
}>) {
  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <StatusChip label={label} style={style} variant="default" />
    </View>
  );
}

export function PlayerPreferencesCard(props: PlayerPreferencesCardProps) {
  validatePlayerPreferencesCardProps(props);
  const heading = props.content === 'full' ? 'Your preferences' : 'Playing preferences';
  const labels = props.content === 'full'
    ? [props.level, props.side, props.days, props.timeOfDay]
    : [props.side, props.days, props.timeOfDay];

  return (
    <View
      accessible
      accessibilityLabel={[heading, ...labels].join(', ')}
      accessibilityRole="summary"
      style={styles.card}
      testID="player-preferences-card"
    >
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.content}
      >
        <Text variant="heading">{heading}</Text>
        <View style={styles.preferences}>
          {props.content === 'full'
            ? <StaticPreference label={props.level} style="success" />
            : null}
          <StaticPreference label={props.side} style="neutral" />
          <StaticPreference label={props.days} style="info" />
          <StaticPreference label={props.timeOfDay} style="warning" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    height: 152,
    padding: 16,
    width: 350,
  },
  content: { gap: 12 },
  preferences: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
