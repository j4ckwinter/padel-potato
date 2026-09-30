import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { PlayerItem } from '../../../design-system/components/content';
import { Field } from '../../../design-system/components/forms';
import {
  AppHeader,
  SectionHeader,
  SegmentedControl,
} from '../../../design-system/components/navigation';
import { Stack, Surface, Text } from '../../../design-system/primitives';
import { colors, sizing, spacing } from '../../../design-system/tokens';
import type { PlayerDirectoryEntry } from '../../../features/players/player';
import { useAppServices } from '../../../features/services/AppServicesContext';

const collectionOptions = ['My players', 'Discover'] as const;
type CollectionOption = (typeof collectionOptions)[number];

function initialCollection(
  view: string | string[] | undefined,
): CollectionOption {
  return view === 'discover' ? 'Discover' : 'My players';
}

function PlayerList({
  onViewPlayer,
  players,
}: Readonly<{
  onViewPlayer: (playerId: string) => void;
  players: readonly PlayerDirectoryEntry[];
}>) {
  return (
    <Stack gap="space8">
      {players.map((player) => (
        <PlayerItem
          identity={player.identity}
          key={player.id}
          onViewPlayer={() => onViewPlayer(player.id)}
          variant="profile-link"
        />
      ))}
    </Stack>
  );
}

function NoPlayersFound() {
  return (
    <Surface padding="space20" radius="radius20">
      <Stack gap="space4">
        <Text variant="heading">No players found</Text>
        <Text color="textSecondary" variant="body">
          Try searching for a different name.
        </Text>
      </Stack>
    </Surface>
  );
}

export default function PlayersScreen() {
  const router = useRouter();
  const { players: playerRepository } = useAppServices();
  const params = useLocalSearchParams();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const [collection, setCollection] = useState<CollectionOption>(() =>
    initialCollection(params.view),
  );
  const [playerQuery, setPlayerQuery] = useState('');
  const [players, setPlayers] = useState<
    readonly PlayerDirectoryEntry[] | null
  >(null);

  useEffect(() => {
    let active = true;
    void playerRepository.list().then((availablePlayers) => {
      if (active) setPlayers(availablePlayers);
    });
    return () => {
      active = false;
    };
  }, [playerRepository]);

  const matchingPlayers = useMemo(() => {
    const normalizedQuery = playerQuery.trim().toLocaleLowerCase();
    return (players ?? []).filter(
      (player) =>
        normalizedQuery.length === 0 ||
        player.identity.name.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [playerQuery, players]);
  const favouritePlayers = matchingPlayers.filter((player) => player.favourite);
  const recentPlayers = matchingPlayers.filter(
    (player) => player.recentlyPlayedWith && !player.favourite,
  );
  const discoverPlayers = matchingPlayers.filter(
    (player) => !player.favourite && !player.recentlyPlayedWith,
  );

  const openPlayer = (playerId: string) =>
    router.push({ pathname: '/players/[playerId]', params: { playerId } });

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: sizing.size112 + bottomInset },
        ]}
        keyboardShouldPersistTaps="handled"
        testID="players-scroll"
      >
        <AppHeader
          onNotificationPress={() => router.push('/notifications')}
          page="players"
        />
        <SegmentedControl
          onValueChange={(value) => {
            if (value === 'My players' || value === 'Discover') {
              setCollection(value);
            }
          }}
          options={collectionOptions}
          value={collection}
        />
        <Field
          label="Player"
          onChangeText={setPlayerQuery}
          placeholder="Search by name"
          type="search"
          value={playerQuery}
        />
        {players === null ? (
          <Surface padding="space20" radius="radius20">
            <Text color="textSecondary" variant="body">
              Loading players...
            </Text>
          </Surface>
        ) : collection === 'My players' ? (
          favouritePlayers.length + recentPlayers.length > 0 ? (
            <Stack gap="space20">
              {favouritePlayers.length > 0 ? (
                <Stack gap="space12">
                  <SectionHeader title="Favourites" />
                  <PlayerList
                    onViewPlayer={openPlayer}
                    players={favouritePlayers}
                  />
                </Stack>
              ) : null}
              {recentPlayers.length > 0 ? (
                <Stack gap="space12">
                  <SectionHeader title="Recently played with" />
                  <PlayerList
                    onViewPlayer={openPlayer}
                    players={recentPlayers}
                  />
                </Stack>
              ) : null}
            </Stack>
          ) : (
            <NoPlayersFound />
          )
        ) : (
          <Stack gap="space12">
            <SectionHeader title="Find players" />
            {discoverPlayers.length > 0 ? (
              <PlayerList onViewPlayer={openPlayer} players={discoverPlayers} />
            ) : (
              <NoPlayersFound />
            )}
          </Stack>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.space16,
    paddingHorizontal: spacing.space16,
    paddingTop: spacing.space16,
  },
  safeArea: {
    backgroundColor: colors.canvas,
    flex: 1,
  },
});
