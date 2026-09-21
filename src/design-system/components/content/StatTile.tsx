import { StyleSheet, View } from 'react-native';

import { Icon } from '../../assets/Icon';
import { Text } from '../../primitives/Text';
import { colors } from '../../tokens';

type StatTileContent = 'gamesPlayed' | 'winRate' | 'rating' | 'streak';
type StatTileState = 'neutral' | 'positive';
type StatTileType = 'compact' | 'featured';

type StatTileCopy = Readonly<{
  label: string;
  supportingText: string;
  value: string;
}>;

export type StatTileProps = StatTileCopy & (
  | Readonly<{ content: 'gamesPlayed'; state: 'neutral'; type: 'compact' }>
  | Readonly<{ content: 'winRate'; state: 'positive'; type: 'compact' }>
  | Readonly<{ content: 'rating'; state: 'neutral'; type: 'compact' }>
  | Readonly<{ content: 'streak'; state: 'positive'; type: 'compact' }>
  | Readonly<{ content: 'rating'; state: 'positive'; type: 'featured' }>
  | Readonly<{ content: 'streak'; state: 'positive'; type: 'featured' }>
);

const supportedRuntimeProps = Object.freeze([
  'content',
  'label',
  'state',
  'supportingText',
  'type',
  'value',
] as const);
const supportedTuples = Object.freeze([
  'compact/gamesPlayed/neutral',
  'compact/winRate/positive',
  'compact/rating/neutral',
  'compact/streak/positive',
  'featured/rating/positive',
  'featured/streak/positive',
] as const);

function unsupported(reason: string): never {
  throw new Error(
    `Unsupported Stat Tile configuration: ${reason}. Supported configurations: ${supportedTuples.join(', ')}.`,
  );
}

function validateText(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    unsupported(`${field} must be non-empty text`);
  }
}

function validateStatTileProps(props: StatTileProps) {
  const runtime = props as unknown as Record<string, unknown>;
  for (const key of Object.keys(runtime)) {
    if (!supportedRuntimeProps.includes(key as (typeof supportedRuntimeProps)[number])) {
      unsupported(`unsupported property ${key}`);
    }
  }

  validateText(runtime.label, 'label');
  validateText(runtime.value, 'value');
  validateText(runtime.supportingText, 'supportingText');

  const tuple = `${String(runtime.type)}/${String(runtime.content)}/${String(runtime.state)}`;
  if (!supportedTuples.includes(tuple as (typeof supportedTuples)[number])) {
    unsupported(tuple);
  }
}

export function StatTile(props: StatTileProps) {
  validateStatTileProps(props);
  const positive = props.state === 'positive';
  const accessibilityLabel = [
    props.label,
    props.value,
    props.supportingText,
    positive ? 'positive trend' : null,
  ].filter(Boolean).join(', ');

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="summary"
      style={[
        styles.tile,
        props.type === 'featured' ? styles.featured : styles.compact,
        positive ? styles.positive : styles.neutral,
      ]}
      testID="stat-tile"
    >
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.content}
      >
        <Text color="textSecondary" variant="label">{props.label}</Text>
        <Text variant={props.type === 'featured' ? 'display' : 'title'}>{props.value}</Text>
        <View style={styles.supportingRow}>
          {positive ? <Icon name="check" /> : null}
          <Text color="textSecondary" variant="caption">{props.supportingText}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  compact: { width: 160 },
  content: { gap: 4 },
  featured: { width: 328 },
  neutral: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  positive: {
    backgroundColor: colors.surfaceAccent,
    borderColor: colors.surfaceAccent,
  },
  supportingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  tile: {
    borderRadius: 20,
    borderWidth: 1,
    height: 112,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
});
