import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { Button } from '../../../design-system/components/actions';
import {
  useSocialRefresh,
  useSocialResource,
  useSocialMutationState,
} from '../../../features/players/useSocialRefresh';
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
  onInvite,
  sentIds,
  busy,
}: Readonly<{
  onViewPlayer: (playerId: string) => void;
  players: readonly PlayerDirectoryEntry[];
  onInvite?: (id: string) => void;
  sentIds?: ReadonlySet<string>;
  busy?: string | null;
}>) {
  return (
    <Stack gap="space8">
      {players.map((player) => (
        <Stack key={player.id} gap="space8">
          <PlayerItem
            identity={player.identity}
            key={player.id}
            onViewPlayer={() => onViewPlayer(player.id)}
            variant="profile-link"
          />
          {onInvite ? (
            <Button
              style="primary"
              size={48}
              loading={false}
              label={
                sentIds?.has(player.id)
                  ? `Invited ${player.identity.name}`
                  : `Invite ${player.identity.name}`
              }
              {...(sentIds?.has(player.id) || busy != null
                ? { disabled: true as const }
                : {})}
              onPress={() => onInvite(player.id)}
            />
          ) : null}
        </Stack>
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
  const {
    players: playerRepository,
    invitations,
    games,
    currentUser,
  } = useAppServices();
  const params = useLocalSearchParams();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const [collection, setCollection] = useState<CollectionOption>(() =>
    initialCollection(params.view),
  );
  const gameId = typeof params.gameId === 'string' ? params.gameId : null;
  const { version, refresh } = useSocialRefresh();
  const requestScope = useRef({ version: 0 });
  useEffect(() => {
    const scope = requestScope.current;
    scope.version++;
    return () => {
      scope.version++;
    };
  }, [invitations, gameId]);
  const [busy, setBusy] = useSocialMutationState<string | null>(
    invitations,
    gameId ?? '',
    null,
  );
  const [feedback, setFeedback] = useSocialMutationState<string | null>(
    invitations,
    gameId ?? '',
    null,
  );
  const [playerQuery, setPlayerQuery] = useState('');
  const load = useCallback(async () => {
    const [players, game, sent] = await Promise.all([
      playerRepository.list(),
      gameId ? games.findById(gameId) : Promise.resolve(null),
      gameId ? invitations.listSent(gameId) : Promise.resolve([]),
    ]);
    return { players, game, sent };
  }, [playerRepository, games, invitations, gameId]);
  const resource = useSocialResource(load, version);
  const players = resource.status === 'ready' ? resource.value.players : null;
  const game = resource.status === 'ready' ? resource.value.game : null;
  const sent = resource.status === 'ready' ? resource.value.sent : [];
  const error =
    resource.status === 'error'
      ? 'Could not load players. Please try again.'
      : null;
  const canInvite =
    game?.lifecycle.status === 'scheduled' &&
    game.participants[0].player.id === currentUser.id &&
    game.participants.length < 4;
  const sentIds = new Set(
    sent
      .filter((invitation) => invitation.status === 'pending')
      .map((invitation) => invitation.inviteeId),
  );
  const invite = async (id: string) => {
    if (!gameId || busy || !canInvite) return;
    const scope = requestScope.current.version;
    setBusy(id);
    setFeedback(null);
    try {
      await invitations.send(gameId, id);
      if (scope !== requestScope.current.version) return;
      setFeedback('Invitation sent.');
      refresh();
    } catch (cause) {
      if (scope !== requestScope.current.version) return;
      setFeedback(
        cause instanceof Error
          ? cause.message
          : 'Could not send invitation. Please try again.',
      );
    } finally {
      if (scope === requestScope.current.version) setBusy(null);
    }
  };

  const matchingPlayers = useMemo(() => {
    const normalizedQuery = playerQuery.trim().toLocaleLowerCase();
    return (players ?? []).filter(
      (player) =>
        (!gameId ||
          !game?.participants.some(
            (participant) => participant.player.id === player.id,
          )) &&
        (normalizedQuery.length === 0 ||
          player.identity.name.toLocaleLowerCase().includes(normalizedQuery)),
    );
  }, [playerQuery, players, game, gameId]);
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
        {gameId ? (
          <Text variant="body">
            {game
              ? `Invite players to ${game.name}`
              : resource.status === 'loading'
                ? 'Loading invitation game...'
                : 'This game is no longer available.'}
          </Text>
        ) : null}
        {gameId && game && !canInvite ? (
          <Text variant="body">
            This game is not available for invitations.
          </Text>
        ) : null}
        {sentIds.size > 0 ? (
          <Stack gap="space8">
            <SectionHeader title="Pending invitations" />
            <Text variant="body">
              {sent
                .filter((invitation) => invitation.status === 'pending')
                .map((invitation) => invitation.inviteeName)
                .join(', ')}
            </Text>
          </Stack>
        ) : null}
        {feedback ? (
          <Text accessibilityRole="alert" variant="body">
            {feedback}
          </Text>
        ) : null}
        {error ? (
          <Stack gap="space8">
            <Text accessibilityRole="alert" variant="body">
              {error}
            </Text>
            <Button
              style="primary"
              size={48}
              loading={false}
              label="Retry"
              onPress={refresh}
            />
          </Stack>
        ) : players === null ? (
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
                    onInvite={gameId && canInvite ? invite : undefined}
                    sentIds={sentIds}
                    busy={busy}
                    onViewPlayer={openPlayer}
                    players={favouritePlayers}
                  />
                </Stack>
              ) : null}
              {recentPlayers.length > 0 ? (
                <Stack gap="space12">
                  <SectionHeader title="Recently played with" />
                  <PlayerList
                    onInvite={gameId && canInvite ? invite : undefined}
                    sentIds={sentIds}
                    busy={busy}
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
              <PlayerList
                onInvite={gameId && canInvite ? invite : undefined}
                sentIds={sentIds}
                busy={busy}
                onViewPlayer={openPlayer}
                players={discoverPlayers}
              />
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
