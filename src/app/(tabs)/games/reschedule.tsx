import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../design-system/components/actions';
import { DayTimeSelector } from '../../../design-system/components/forms';
import { Inline, Stack, Text } from '../../../design-system/primitives';
import { spacing } from '../../../design-system/tokens';
import {
  initialGameDraft,
  selectGameDay,
  selectGameTime,
} from '../../../features/game-creation/gameDraft';
import {
  upcomingScheduleDays,
  upcomingScheduleTimes,
} from '../../../features/game-creation/scheduleOptions';
import { useAppServices } from '../../../features/services/AppServicesContext';

export default function RescheduleGameScreen() {
  const router = useRouter();
  const { gameId } = useLocalSearchParams();
  const { games, currentPlayer } = useAppServices();
  const [draft, setDraft] = useState(initialGameDraft);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const now = useMemo(() => new Date(), []);
  const days = upcomingScheduleDays(now);
  const date = draft.schedule.status === 'empty' ? null : draft.schedule.date;
  const time =
    draft.schedule.status === 'complete' ? draft.schedule.time : null;
  const account = useRef<string | null>(currentPlayer.id);
  useLayoutEffect(() => {
    account.current = currentPlayer.id;
    return () => {
      account.current = null;
    };
  }, [currentPlayer.id]);
  const save = async () => {
    if (
      pending ||
      typeof gameId !== 'string' ||
      draft.schedule.status !== 'complete'
    )
      return;
    const playerId = currentPlayer.id;
    setPending(true);
    setFeedback(null);
    try {
      const result = await games.reschedule(gameId, draft.schedule);
      if (account.current !== playerId) return;
      if (result.status === 'rescheduled')
        router.replace({ pathname: '/games/[gameId]', params: { gameId } });
      else
        setFeedback(
          result.status === 'playersJoined'
            ? 'Another player has joined. Cancel and create a new game to agree a different time.'
            : 'This game can no longer be rescheduled.',
        );
    } catch {
      if (account.current === playerId)
        setFeedback('Could not reschedule. Please try again.');
    } finally {
      if (account.current === playerId) setPending(false);
    }
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: spacing.space16 }}>
        <Stack gap="space16">
          <Text accessibilityRole="header" variant="title">
            Reschedule game
          </Text>
          <Text variant="body">
            Choose a new time before other players join. Pending invitations
            will close. Invite your friends again after saving.
          </Text>
          <ScrollView horizontal>
            <Inline gap="space8" accessibilityRole="radiogroup">
              {days.map((day) => (
                <DayTimeSelector
                  key={day.date}
                  type="day"
                  date={day.dateLabel}
                  day={day.dayLabel}
                  {...(pending
                    ? { disabled: true as const, selected: false as const }
                    : { selected: date === day.date })}
                  onSelect={() => setDraft(selectGameDay(draft, day.date))}
                />
              ))}
            </Inline>
          </ScrollView>
          <ScrollView horizontal>
            <Inline gap="space8" accessibilityRole="radiogroup">
              {upcomingScheduleTimes(date, now).map((value) => (
                <DayTimeSelector
                  key={value}
                  type="time"
                  time={value}
                  availability={time === value ? 'Selected' : 'Available'}
                  {...(pending || date === null
                    ? { disabled: true as const, selected: false as const }
                    : { selected: time === value })}
                  onSelect={() => setDraft(selectGameTime(draft, value))}
                />
              ))}
            </Inline>
          </ScrollView>
          {feedback ? (
            <Text accessibilityRole="alert" variant="body">
              {feedback}
            </Text>
          ) : null}
          <Button
            label="Save new time"
            style="primary"
            {...(pending || draft.schedule.status !== 'complete'
              ? { disabled: true as const }
              : { disabled: false as const })}
            onPress={() => void save()}
          />
          <Button
            label="Back"
            style="secondary"
            onPress={() => router.back()}
          />
        </Stack>
      </ScrollView>
    </SafeAreaView>
  );
}
