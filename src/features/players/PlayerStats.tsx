import { StyleSheet, View } from 'react-native';

import { StatTile } from '../../design-system/components/content';
import { Stack, Text } from '../../design-system/primitives';
import { spacing } from '../../design-system/tokens';

export type PlayerStatsProps = Readonly<{
  gamesPlayed: string;
  rating: string;
  winRate: string;
}>;

export function PlayerStats({
  gamesPlayed,
  rating,
  winRate,
}: PlayerStatsProps) {
  return (
    <Stack gap="space12">
      <Text accessibilityRole="header" variant="heading">
        Player stats
      </Text>
      <StatTile
        content="rating"
        label="Rating"
        state="positive"
        supportingText="Current player rating"
        type="featured"
        value={rating}
      />
      <View style={styles.row}>
        <StatTile
          content="gamesPlayed"
          label="Games"
          state="neutral"
          supportingText="Games played"
          type="compact"
          value={gamesPlayed}
        />
        <StatTile
          content="winRate"
          label="Win rate"
          state="positive"
          supportingText="All-time win rate"
          type="compact"
          value={winRate}
        />
      </View>
    </Stack>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.space12,
  },
});
