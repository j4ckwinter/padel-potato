import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { Button } from '../../../design-system/components/actions';
import { BannerToast } from '../../../design-system/components/feedback';
import { ChoiceChip, Field } from '../../../design-system/components/forms';
import { AppHeader } from '../../../design-system/components/navigation';
import { Stack, Surface, Text } from '../../../design-system/primitives';
import { colors, sizing, spacing } from '../../../design-system/tokens';
import { demoCurrentGamePlayer } from '../../../features/demo/demoData';
import {
  createGameResult,
  gameTeams,
  gameTeamsForPartner,
  playerOrganisesGame,
  type Game,
  type GameSetScore,
  type GameTeams,
} from '../../../features/games/game';
import {
  findGameById,
  transitionGameLifecycle,
} from '../../../features/games/gameRepository';

type ResultLoadState =
  | Readonly<{ status: 'loading' }>
  | Readonly<{ status: 'notFound' }>
  | Readonly<{ status: 'unavailable' }>
  | Readonly<{ game: Game; teams: GameTeams; status: 'ready' }>;

type SetIndex = 0 | 1;
type TeamIndex = 0 | 1;
type ResultScores = readonly [GameSetScore, GameSetScore];

const initialScores: ResultScores = [
  [6, 4],
  [6, 4],
];
const scoreIndexes: readonly (0 | 1)[] = [0, 1];

function teamName(team: GameTeams[TeamIndex]) {
  return team.map((player) => player.name).join(' & ');
}

function updateSetScore(
  score: GameSetScore,
  teamIndex: TeamIndex,
  amount: -1 | 1,
): GameSetScore {
  const nextScore = Math.max(0, Math.min(7, score[teamIndex] + amount));
  return teamIndex === 0 ? [nextScore, score[1]] : [score[0], nextScore];
}

export default function GameResultScreen() {
  const router = useRouter();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const gameId = typeof params.gameId === 'string' ? params.gameId : null;
  const [loadState, setLoadState] = useState<ResultLoadState>({
    status: 'loading',
  });
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [scores, setScores] = useState<ResultScores>(initialScores);
  const [submissionFailed, setSubmissionFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (gameId === null) {
      return undefined;
    }

    let active = true;
    void findGameById(gameId).then((game) => {
      if (!active) return;
      if (game === null) {
        setLoadState({ status: 'notFound' });
        return;
      }

      const teams = gameTeams(game);
      if (
        (game.lifecycle.status !== 'scheduled' &&
          game.lifecycle.status !== 'awaitingResult') ||
        teams === null ||
        !playerOrganisesGame(game, demoCurrentGamePlayer.id)
      ) {
        setLoadState({ status: 'unavailable' });
        return;
      }

      setPartnerId(teams[0][1].id);
      setLoadState({ game, status: 'ready', teams });
    });

    return () => {
      active = false;
    };
  }, [gameId]);
  const displayedState: ResultLoadState =
    gameId === null ? { status: 'notFound' } : loadState;
  const selectedTeams =
    displayedState.status === 'ready'
      ? gameTeamsForPartner(
          displayedState.game,
          partnerId ?? displayedState.teams[0][1].id,
        )
      : null;

  const returnToGame = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (gameId !== null) {
      router.replace({
        params: { gameId },
        pathname: '/games/[gameId]',
      });
      return;
    }
    router.replace('/games');
  };

  const changeScore = (
    setIndex: SetIndex,
    teamIndex: TeamIndex,
    amount: -1 | 1,
  ) => {
    setSubmissionFailed(false);
    setScores((current) =>
      setIndex === 0
        ? [updateSetScore(current[0], teamIndex, amount), current[1]]
        : [current[0], updateSetScore(current[1], teamIndex, amount)],
    );
  };

  const submitResult = async (game: Game, teams: GameTeams) => {
    const result = createGameResult({ game, sets: scores, teams });
    if (result === null) {
      setSubmissionFailed(true);
      return;
    }

    setSubmitting(true);
    setSubmissionFailed(false);
    try {
      if (game.lifecycle.status === 'scheduled') {
        const awaitingResult = await transitionGameLifecycle(game.id, {
          at: new Date().toISOString(),
          type: 'finish',
        });
        if (awaitingResult.status !== 'transitioned') {
          setSubmissionFailed(true);
          return;
        }
      }

      const transition = await transitionGameLifecycle(game.id, {
        at: new Date().toISOString(),
        result,
        type: 'recordResult',
      });
      if (transition.status !== 'transitioned') {
        setSubmissionFailed(true);
        return;
      }

      router.dismissTo({
        params: {
          gameId: game.id,
          resultRecorded: 'true',
          returnTo: 'games',
        },
        pathname: '/games/[gameId]',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: sizing.size112 + bottomInset },
        ]}
      >
        <AppHeader
          onBackPress={returnToGame}
          page="gameDetails"
          subtitle={
            displayedState.status === 'ready'
              ? displayedState.game.name
              : 'Add the final score'
          }
          title="Enter result"
        />
        {submissionFailed ? (
          <BannerToast
            message="Each set needs a valid 6-x, 7-5, or 7-6 score, with the same team winning both sets."
            onClose={() => setSubmissionFailed(false)}
            style="error"
            title="Check the score"
            type="toast"
          />
        ) : null}
        {displayedState.status === 'loading' ? (
          <Surface padding="space20" radius="radius20">
            <Text color="textSecondary" variant="body">
              Loading game...
            </Text>
          </Surface>
        ) : displayedState.status === 'notFound' ? (
          <Surface padding="space20" radius="radius20">
            <Text variant="heading">Game not found</Text>
          </Surface>
        ) : displayedState.status === 'unavailable' ? (
          <Surface padding="space20" radius="radius20">
            <Stack gap="space8">
              <Text variant="heading">Result entry unavailable</Text>
              <Text color="textSecondary" variant="body">
                Only the organiser can add a result for a finished four-player
                game.
              </Text>
            </Stack>
          </Surface>
        ) : selectedTeams === null ? (
          <Surface padding="space20" radius="radius20">
            <Text variant="heading">Team selection unavailable</Text>
          </Surface>
        ) : (
          <Stack gap="space16">
            <Surface padding="space16" radius="radius20">
              <Stack gap="space12">
                <Stack gap="space4">
                  <Text accessibilityRole="header" variant="heading">
                    Choose your partner
                  </Text>
                  <Text color="textSecondary" variant="body">
                    The other two players will form the opposing team.
                  </Text>
                </Stack>
                <Stack accessibilityRole="radiogroup" gap="space8">
                  {[
                    displayedState.teams[0][1],
                    displayedState.teams[1][0],
                    displayedState.teams[1][1],
                  ].map((player) =>
                    selectedTeams[0][1].id === player.id ? (
                      <ChoiceChip
                        icon="leading"
                        key={player.id}
                        label={player.name}
                        onSelectedChange={() => setPartnerId(player.id)}
                        selected
                        type="option"
                      />
                    ) : (
                      <ChoiceChip
                        icon="none"
                        key={player.id}
                        label={player.name}
                        onSelectedChange={() => setPartnerId(player.id)}
                        selected={false}
                        type="option"
                      />
                    ),
                  )}
                </Stack>
              </Stack>
            </Surface>
            <Surface
              background="surfaceAccent"
              padding="space20"
              radius="radius20"
            >
              <Stack gap="space8">
                <Text color="textSecondary" variant="label">
                  Teams
                </Text>
                <Text variant="bodyStrong">{teamName(selectedTeams[0])}</Text>
                <Text color="textSecondary" variant="caption">
                  versus
                </Text>
                <Text variant="bodyStrong">{teamName(selectedTeams[1])}</Text>
              </Stack>
            </Surface>
            {scoreIndexes.map((setIndex) => (
              <Surface
                key={`set-${setIndex + 1}`}
                padding="space16"
                radius="radius20"
              >
                <Stack gap="space16">
                  <Text accessibilityRole="header" variant="heading">
                    Set {setIndex + 1}
                  </Text>
                  {scoreIndexes.map((teamIndex) => (
                    <Field
                      decrementDisabled={scores[setIndex][teamIndex] === 0}
                      incrementDisabled={scores[setIndex][teamIndex] === 7}
                      key={`set-${setIndex + 1}-team-${teamIndex + 1}`}
                      label={teamName(selectedTeams[teamIndex])}
                      onDecrement={() => changeScore(setIndex, teamIndex, -1)}
                      onIncrement={() => changeScore(setIndex, teamIndex, 1)}
                      type="stepper"
                      value={String(scores[setIndex][teamIndex])}
                    />
                  ))}
                </Stack>
              </Surface>
            ))}
            {submitting ? (
              <Button label="Save result" loading style="primary" />
            ) : (
              <Button
                label="Save result"
                onPress={() =>
                  void submitResult(displayedState.game, selectedTeams)
                }
                style="primary"
              />
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
