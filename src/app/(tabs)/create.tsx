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
import { Inline, Stack, Surface, Text } from '../../design-system/primitives';
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
import { useAppServices } from '../../features/services/AppServicesContext';

function CreateGameForm() {
  const router = useRouter();
  const { games } = useAppServices();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const {
    draft,
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
  const firstAvailableDate = days[0]?.date ?? null;
  const times = useMemo(
    () => upcomingScheduleTimes(selectedDate ?? firstAvailableDate, now),
    [firstAvailableDate, now, selectedDate],
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
      const game = await games.create(draft);
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
        <Stack gap="space16">
          <Surface
            background="surfaceAccent"
            padding="space20"
            radius="radius20"
            testID="game-name-summary"
          >
            <Stack gap="space4">
              <Text color="deep" variant="label">
                Game name
              </Text>
              <Text accessibilityRole="header" variant="section">
                {gameDraftName(draft)}
              </Text>
              <Text color="textSecondary" variant="body">
                Updates automatically from your selected day and start time.
              </Text>
            </Stack>
          </Surface>
          <Field
            label="Venue"
            onChangeText={updateVenueQuery}
            placeholder="Search venues or clubs"
            required
            type="search"
            value={draft.venueQuery}
          />
          <Surface
            padding="space16"
            radius="radius20"
            testID="schedule-controls"
          >
            <Stack gap="space20">
              <Stack gap="space8">
                <Text color="textSecondary" variant="label">
                  Day
                </Text>
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
                <Text color="textSecondary" variant="label">
                  Start time
                </Text>
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
            </Stack>
          </Surface>
          <Surface
            padding="space16"
            radius="radius20"
            testID="game-setup-controls"
          >
            <Stack gap="space20">
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
              <Stack gap="space8">
                <Text color="textSecondary" variant="label">
                  Game type
                </Text>
                <SegmentedControl
                  onValueChange={(value) => {
                    setSubmissionFailed(false);
                    selectFormat(
                      value === 'Social game'
                        ? 'Social game'
                        : 'Competitive game',
                    );
                  }}
                  options={['Social game', 'Competitive game']}
                  value={draft.setup.format}
                />
              </Stack>
            </Stack>
          </Surface>
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
    gap: spacing.space16,
    paddingHorizontal: spacing.space16,
    paddingTop: spacing.space16,
  },
  safeArea: {
    backgroundColor: colors.canvas,
    flex: 1,
  },
});
