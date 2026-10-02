import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../design-system/components/actions';
import { BannerToast } from '../../design-system/components/feedback';
import { ChoiceChip } from '../../design-system/components/forms';
import { StepProgress } from '../../design-system/components/progress';
import {
  playLevelOptions,
  playSideOptions,
  playVibeOptions,
} from '../../design-system/configuration/playPreferences';
import { Inline, Stack, Text } from '../../design-system/primitives';
import { colors, layoutWidths, spacing } from '../../design-system/tokens';

export type PlayStepDraft = Readonly<{
  level: (typeof playLevelOptions)[number]['value'] | null;
  side: (typeof playSideOptions)[number]['value'] | null;
  vibe: (typeof playVibeOptions)[number]['value'] | null;
}>;

export type CompletePlayStepDraft = Readonly<{
  [Key in keyof PlayStepDraft]: NonNullable<PlayStepDraft[Key]>;
}>;

type PlayStepScreenProps = Readonly<{
  initialDraft: PlayStepDraft;
  onDraftChange: (draft: PlayStepDraft) => void;
  onBack: () => void;
  onContinue: (draft: CompletePlayStepDraft) => Promise<void>;
}>;

type SubmissionState =
  | Readonly<{ status: 'idle' | 'saving' | 'saved' }>
  | Readonly<{ status: 'error' }>;

type ChoiceOption<Value extends string> = Readonly<{
  value: Value;
  label: string;
}>;

function ChoiceGroup<Value extends string>({
  title,
  hint,
  options,
  value,
  onChange,
  busy,
  invalid,
}: Readonly<{
  title: string;
  hint: string;
  options: readonly ChoiceOption<Value>[];
  value: Value | null;
  onChange: (value: Value) => void;
  busy: boolean;
  invalid: boolean;
}>) {
  return (
    <Stack gap="space12">
      <Text accessibilityRole="header" variant="bodyStrong">
        {title}
      </Text>
      <Text color="textSecondary" variant="caption">
        {hint}
      </Text>
      <View
        pointerEvents={busy ? 'none' : 'auto'}
        accessibilityElementsHidden={busy}
        importantForAccessibility={busy ? 'no-hide-descendants' : 'auto'}
      >
        <Inline gap="space8" wrap>
          {options.map((option) => (
            <ChoiceChip
              key={option.value}
              label={option.label}
              onSelectedChange={(selected) => {
                if (selected && !busy) onChange(option.value);
              }}
              type="option"
              {...(value === option.value
                ? { selected: true as const, icon: 'leading' as const }
                : { selected: false as const, icon: 'none' as const })}
            />
          ))}
        </Inline>
      </View>
      {invalid ? (
        <Text
          accessibilityLiveRegion="assertive"
          color="danger"
          variant="caption"
        >
          Choose an option for {title.toLowerCase()}.
        </Text>
      ) : null}
    </Stack>
  );
}

export function PlayStepScreen({
  initialDraft,
  onDraftChange,
  onBack,
  onContinue,
}: PlayStepScreenProps) {
  const [draft, setDraft] = useState(initialDraft);
  const [submission, setSubmission] = useState<SubmissionState>({
    status: 'idle',
  });
  const [validated, setValidated] = useState(false);
  const busy = submission.status === 'saving';

  const edit = (changes: Partial<PlayStepDraft>) => {
    if (busy) return;
    const nextDraft = { ...draft, ...changes };
    setDraft(nextDraft);
    onDraftChange(nextDraft);
    setSubmission({ status: 'idle' });
  };

  const continueSetup = async () => {
    if (busy) return;
    setValidated(true);
    const { level, side, vibe } = draft;
    if (level === null || side === null || vibe === null) return;
    setSubmission({ status: 'saving' });
    try {
      await onContinue({ level, side, vibe });
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
            <StepProgress value={2} />
            <Stack gap="space8">
              <Text accessibilityRole="header" variant="title">
                How you play
              </Text>
              <Text color="textSecondary" variant="body">
                Tell us about your game and what you enjoy on court.
              </Text>
            </Stack>
            {submission.status === 'error' ? (
              <BannerToast
                message="Your play preferences could not be saved. Try again."
                onClose={() => setSubmission({ status: 'idle' })}
                style="error"
                title="Could not save preferences"
                type="toast"
              />
            ) : null}
            <ChoiceGroup
              title="Your level"
              hint="Choose the closest fit. You can update it later."
              options={playLevelOptions}
              value={draft.level}
              onChange={(level) => edit({ level })}
              busy={busy}
              invalid={validated && draft.level === null}
            />
            <ChoiceGroup
              title="Preferred side"
              hint="Either means you are happy playing both sides."
              options={playSideOptions}
              value={draft.side}
              onChange={(side) => edit({ side })}
              busy={busy}
              invalid={validated && draft.side === null}
            />
            <ChoiceGroup
              title="Game vibe"
              hint="What are you usually looking for in a game?"
              options={playVibeOptions}
              value={draft.vibe}
              onChange={(vibe) => edit({ vibe })}
              busy={busy}
              invalid={validated && draft.vibe === null}
            />
            {submission.status === 'saved' ? (
              <Text
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
                variant="body"
              >
                Play preferences saved. Ready for step 3.
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
                    label="Continue"
                    onPress={() => void continueSetup()}
                    style="primary"
                    {...(busy
                      ? { loading: true as const }
                      : { loading: false as const })}
                  />
                </View>
              </View>
              <Text color="muted" style={styles.centeredText} variant="caption">
                You can change these preferences later.
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
