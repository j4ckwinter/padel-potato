import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../design-system/components/actions';
import { BannerToast } from '../../design-system/components/feedback';
import {
  ChoiceChip,
  DayTimeSelector,
} from '../../design-system/components/forms';
import { StepProgress } from '../../design-system/components/progress';
import {
  availabilityDayOptions,
  availabilityTimeOptions,
  availabilityFrequencyOptions,
  type AvailabilityDraft,
} from '../../design-system/configuration/availability';

import { Inline, Stack, Text } from '../../design-system/primitives';
import { colors, layoutWidths, spacing } from '../../design-system/tokens';

type AvailabilityStepScreenProps = Readonly<{
  initialDraft: AvailabilityDraft;
  onDraftChange: (draft: AvailabilityDraft) => void;
  onBack: () => void;
  onFinish: (draft: AvailabilityDraft) => Promise<void>;
}>;

type SubmissionState =
  | Readonly<{ status: 'idle' | 'saving' | 'saved' }>
  | Readonly<{ status: 'error' }>;

export function AvailabilityStepScreen({
  initialDraft,
  onDraftChange,
  onBack,
  onFinish,
}: AvailabilityStepScreenProps) {
  const [draft, setDraft] = useState(initialDraft);
  const [submission, setSubmission] = useState<SubmissionState>({
    status: 'idle',
  });
  const [validated, setValidated] = useState(false);
  const busy = submission.status === 'saving';

  const edit = (changes: Partial<AvailabilityDraft>) => {
    if (busy) return;
    const nextDraft = { ...draft, ...changes };
    setDraft(nextDraft);
    onDraftChange(nextDraft);
    setSubmission({ status: 'idle' });
  };

  const continueSetup = async () => {
    if (busy) return;
    setValidated(true);
    if (
      draft.days.length === 0 ||
      draft.times.length === 0 ||
      draft.frequency === null
    )
      return;
    setSubmission({ status: 'saving' });
    try {
      await onFinish(draft);
      setSubmission({ status: 'saved' });
    } catch {
      setSubmission({ status: 'error' });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Stack gap="space24">
            <StepProgress value={3} />
            <Stack gap="space8">
              <Text accessibilityRole="header" variant="title">
                When you play
              </Text>
              <Text color="textSecondary" variant="body">
                Choose your usual availability so we can surface better game
                matches.
              </Text>
            </Stack>
            {submission.status === 'error' ? (
              <BannerToast
                message="Your availability could not be saved. Try again."
                onClose={() => setSubmission({ status: 'idle' })}
                style="error"
                title="Could not save availability"
                type="toast"
              />
            ) : null}
            <View
              pointerEvents={busy ? 'none' : 'auto'}
              accessibilityElementsHidden={busy}
              importantForAccessibility={busy ? 'no-hide-descendants' : 'auto'}
            >
              <Stack gap="space24">
                <Stack gap="space12">
                  <Text accessibilityRole="header" variant="bodyStrong">
                    Days that work
                  </Text>
                  <Text color="textSecondary" variant="caption">
                    Select every day you’re normally free.
                  </Text>
                  <Inline gap="space8" wrap>
                    {availabilityDayOptions.map((option) => (
                      <DayTimeSelector
                        key={option.value}
                        type="day"
                        day={option.label}
                        date={option.hint}
                        selectionMode="multiple"
                        selected={draft.days.includes(option.value)}
                        onSelect={() =>
                          edit({
                            days: draft.days.includes(option.value)
                              ? draft.days.filter((day) => day !== option.value)
                              : [...draft.days, option.value],
                          })
                        }
                      />
                    ))}
                  </Inline>
                  {validated && draft.days.length === 0 ? (
                    <Text
                      accessibilityLiveRegion="assertive"
                      color="danger"
                      variant="caption"
                    >
                      Choose at least one day.
                    </Text>
                  ) : null}
                </Stack>
                <Stack gap="space12">
                  <Text accessibilityRole="header" variant="bodyStrong">
                    Best times
                  </Text>
                  <Text color="textSecondary" variant="caption">
                    Choose the windows that suit you most.
                  </Text>
                  <Inline gap="space8" wrap>
                    {availabilityTimeOptions.map((option) => (
                      <DayTimeSelector
                        key={option.value}
                        type="time"
                        time={option.label}
                        availability={option.hint}
                        selectionMode="multiple"
                        selected={draft.times.includes(option.value)}
                        onSelect={() =>
                          edit({
                            times: draft.times.includes(option.value)
                              ? draft.times.filter(
                                  (time) => time !== option.value,
                                )
                              : [...draft.times, option.value],
                          })
                        }
                      />
                    ))}
                  </Inline>
                  {validated && draft.times.length === 0 ? (
                    <Text
                      accessibilityLiveRegion="assertive"
                      color="danger"
                      variant="caption"
                    >
                      Choose at least one time window.
                    </Text>
                  ) : null}
                </Stack>
                <Stack gap="space12">
                  <Text accessibilityRole="header" variant="bodyStrong">
                    How often?
                  </Text>
                  <Text color="textSecondary" variant="caption">
                    Your ideal number of games each week.
                  </Text>
                  <Inline gap="space8" wrap>
                    {availabilityFrequencyOptions.map((option) => (
                      <ChoiceChip
                        key={option.value}
                        label={option.label}
                        type="option"
                        onSelectedChange={(selected) => {
                          if (selected) edit({ frequency: option.value });
                        }}
                        {...(draft.frequency === option.value
                          ? {
                              selected: true as const,
                              icon: 'leading' as const,
                            }
                          : {
                              selected: false as const,
                              icon: 'none' as const,
                            })}
                      />
                    ))}
                  </Inline>
                  {validated && draft.frequency === null ? (
                    <Text
                      accessibilityLiveRegion="assertive"
                      color="danger"
                      variant="caption"
                    >
                      Choose how often you want to play.
                    </Text>
                  ) : null}
                </Stack>
              </Stack>
            </View>
            {submission.status === 'saved' ? (
              <Text
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
                variant="body"
              >
                Availability saved. You’re ready to play.
              </Text>
            ) : null}
          </Stack>
          <View style={styles.footer}>
            <Stack gap="space12">
              <View style={styles.actions}>
                <View
                  style={styles.action}
                  pointerEvents={busy ? 'none' : 'auto'}
                  accessibilityElementsHidden={busy}
                  importantForAccessibility={
                    busy ? 'no-hide-descendants' : 'auto'
                  }
                >
                  <Button
                    label="Back"
                    onPress={() => {
                      if (!busy) onBack();
                    }}
                    style="secondary"
                  />
                </View>
                <View style={styles.action}>
                  <Button
                    label="Finish"
                    onPress={() => void continueSetup()}
                    style="primary"
                    {...(busy
                      ? { loading: true as const }
                      : { loading: false as const })}
                  />
                </View>
              </View>
              <Text color="muted" style={styles.centeredText} variant="caption">
                You can change availability any time.
              </Text>
            </Stack>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  action: { flex: 1, minWidth: 0 },
  actions: { flexDirection: 'row', gap: spacing.space12 },
  centeredText: { textAlign: 'center' },
  content: {
    alignSelf: 'center',
    flexGrow: 1,
    maxWidth: layoutWidths.content,
    width: '100%',
  },
  footer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingTop: spacing.space32,
  },
  safeArea: { backgroundColor: colors.canvas, flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.space20,
    paddingVertical: spacing.space24,
  },
});
