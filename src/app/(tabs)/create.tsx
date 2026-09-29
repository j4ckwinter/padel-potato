import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { Button } from '../../design-system/components/actions';
import { BannerToast } from '../../design-system/components/feedback';
import { DayTimeSelector, Field } from '../../design-system/components/forms';
import {
  AppHeader,
  SegmentedControl,
} from '../../design-system/components/navigation';
import { Inline, Stack, Text } from '../../design-system/primitives';
import { colors, sizing, spacing } from '../../design-system/tokens';
import {
  GameDraftProvider,
  useGameDraft,
} from '../../features/game-creation/GameDraftContext';
import { gameDraftName } from '../../features/game-creation/gameDraft';
import {
  upcomingScheduleDays,
  upcomingScheduleTimes,
} from '../../features/game-creation/scheduleOptions';
import { demoParticipantsForCount } from '../../features/demo/demoData';
import { createGame } from '../../features/games/gameRepository';

function CreateGameForm() {
  const router = useRouter();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const {
    decrementCurrentPlayers,
    draft,
    incrementCurrentPlayers,
    resetDraft,
    selectDay,
    selectDuration,
    selectFormat,
    selectTime,
    setVenueQuery,
  } = useGameDraft();
  const [submissionFailed, setSubmissionFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const now = useMemo(() => new Date(), []);
  const days = useMemo(() => upcomingScheduleDays(now), [now]);
  const schedule = draft.schedule;
  const selectedDate = schedule.status === 'empty' ? null : schedule.date;
  const selectedTime = schedule.status === 'complete' ? schedule.time : null;
  const times = useMemo(
    () => upcomingScheduleTimes(selectedDate, now),
    [now, selectedDate],
  );
  const canCreate =
    draft.venueQuery.trim().length > 0 && schedule.status === 'complete';

  const updateVenueQuery = (value: string) => {
    setSubmissionFailed(false);
    setVenueQuery(value);
  };

  const submitGame = async () => {
    setSubmitting(true);
    setSubmissionFailed(false);
    try {
      const game = await createGame({
        draft,
        participants: demoParticipantsForCount(draft.setup.currentPlayerCount),
      });
      resetDraft();
      router.replace({
        params: { created: 'true', gameId: game.id },
        pathname: '/games/[gameId]',
      });
    } catch {
      setSubmissionFailed(true);
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
        keyboardShouldPersistTaps="handled"
        testID="create-game-scroll"
      >
        <AppHeader
          onNotificationPress={() => router.push('/notifications')}
          page="create"
        />
        {submissionFailed ? (
          <BannerToast
            message="Your details are still here. Please try again."
            onClose={() => setSubmissionFailed(false)}
            style="error"
            title="Game not created"
            type="toast"
          />
        ) : null}
        <Stack gap="space20">
          <Field
            label="Generated game name"
            onChangeText={() => undefined}
            readOnly
            type="text"
            value={gameDraftName(draft)}
          />
          <Field
            label="Venue"
            onChangeText={updateVenueQuery}
            placeholder="Search venues or clubs"
            required
            type="search"
            value={draft.venueQuery}
          />
          <Stack gap="space8">
            <Text variant="label">Day</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Inline accessibilityRole="radiogroup" gap="space8">
                {days.map((day) => (
                  <DayTimeSelector
                    date={day.dateLabel}
                    day={day.dayLabel}
                    key={day.date}
                    onSelect={() => {
                      setSubmissionFailed(false);
                      selectDay(day.date);
                    }}
                    selected={selectedDate === day.date}
                    type="day"
                  />
                ))}
              </Inline>
            </ScrollView>
          </Stack>
          <Stack gap="space8">
            <Text variant="label">Start time</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Inline accessibilityRole="radiogroup" gap="space8">
                {times.map((time) =>
                  selectedDate === null ? (
                    <DayTimeSelector
                      availability="Available"
                      disabled
                      key={time}
                      onSelect={() => selectTime(time)}
                      selected={false}
                      time={time}
                      type="time"
                    />
                  ) : (
                    <DayTimeSelector
                      availability={
                        selectedTime === time ? 'Selected' : 'Available'
                      }
                      key={time}
                      onSelect={() => {
                        setSubmissionFailed(false);
                        selectTime(time);
                      }}
                      selected={selectedTime === time}
                      time={time}
                      type="time"
                    />
                  ),
                )}
              </Inline>
            </ScrollView>
          </Stack>
          <Stack gap="space8">
            <Text color="textSecondary" variant="label">
              Duration
            </Text>
            <SegmentedControl
              onValueChange={(value) => {
                setSubmissionFailed(false);
                selectDuration(value === '60 minutes' ? 60 : 90);
              }}
              options={['60 minutes', '90 minutes']}
              value={`${draft.setup.durationMinutes} minutes`}
            />
          </Stack>
          <Field
            decrementDisabled={draft.setup.currentPlayerCount === 1}
            incrementDisabled={draft.setup.currentPlayerCount === 4}
            label="Current players"
            onDecrement={() => {
              setSubmissionFailed(false);
              decrementCurrentPlayers();
            }}
            onIncrement={() => {
              setSubmissionFailed(false);
              incrementCurrentPlayers();
            }}
            type="stepper"
            value={
              draft.setup.currentPlayerCount === 1
                ? '1 player'
                : `${draft.setup.currentPlayerCount} players`
            }
          />
          <Stack gap="space8">
            <Text color="textSecondary" variant="label">
              Game type
            </Text>
            <SegmentedControl
              onValueChange={(value) => {
                setSubmissionFailed(false);
                selectFormat(
                  value === 'Social game' ? 'Social game' : 'Competitive game',
                );
              }}
              options={['Social game', 'Competitive game']}
              value={draft.setup.format}
            />
          </Stack>
          {submitting ? (
            <Button label="Create game" loading style="primary" />
          ) : canCreate ? (
            <Button
              label="Create game"
              onPress={() => void submitGame()}
              style="primary"
            />
          ) : (
            <Button disabled label="Create game" style="primary" />
          )}
        </Stack>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function CreateGameScreen() {
  return (
    <GameDraftProvider>
      <CreateGameForm />
    </GameDraftProvider>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.space24,
    paddingHorizontal: spacing.space16,
    paddingTop: spacing.space16,
  },
  safeArea: {
    backgroundColor: colors.canvas,
    flex: 1,
  },
});
