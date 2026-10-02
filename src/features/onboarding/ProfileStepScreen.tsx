import { useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../design-system/components/actions';
import { BannerToast } from '../../design-system/components/feedback';
import { Field } from '../../design-system/components/forms';
import { AvatarPicker } from '../../design-system/components/identity';
import { StepProgress } from '../../design-system/components/progress';
import { profileFieldLimits } from '../../design-system/configuration/profile';
import { Stack, Text } from '../../design-system/primitives';
import { colors, layoutWidths, spacing } from '../../design-system/tokens';

export type ProfileStepDraft = Readonly<{
  displayName: string;
  homeLocation: string;
  photoUri: string | null;
}>;

type ProfileStepScreenProps = Readonly<{
  initialDraft: ProfileStepDraft;
  onContinue: (draft: ProfileStepDraft) => void | Promise<void>;
  onPickPhoto: () => Promise<string | null>;
}>;

type SubmissionState =
  | Readonly<{ status: 'idle' | 'picking' | 'saving' | 'saved' }>
  | Readonly<{ status: 'error'; message: string }>;

export function ProfileStepScreen({
  initialDraft,
  onContinue,
  onPickPhoto,
}: ProfileStepScreenProps) {
  const [draft, setDraft] = useState(initialDraft);
  const [submission, setSubmission] = useState<SubmissionState>({
    status: 'idle',
  });
  const [validated, setValidated] = useState(false);
  const saving = useRef(false);
  const busy =
    submission.status === 'picking' || submission.status === 'saving';
  const displayName = draft.displayName.trim();
  const homeLocation = draft.homeLocation.trim();
  const nameError =
    displayName.length === 0
      ? 'Enter your display name.'
      : displayName.length > profileFieldLimits.displayName
        ? `Use ${profileFieldLimits.displayName} characters or fewer.`
        : null;
  const locationError =
    homeLocation.length === 0
      ? 'Enter your home location.'
      : homeLocation.length > profileFieldLimits.homeLocation
        ? `Use ${profileFieldLimits.homeLocation} characters or fewer.`
        : null;

  const edit = (changes: Partial<ProfileStepDraft>) => {
    setDraft((current) => ({ ...current, ...changes }));
    setSubmission({ status: 'idle' });
  };

  const pickPhoto = async () => {
    if (busy) return;
    setSubmission({ status: 'picking' });
    try {
      const photoUri = await onPickPhoto();
      if (photoUri !== null) edit({ photoUri });
      else setSubmission({ status: 'idle' });
    } catch (error) {
      setSubmission({
        status: 'error',
        message:
          error instanceof Error && error.message.trim().length > 0
            ? error.message
            : 'Your photo could not be selected. Try again.',
      });
    }
  };

  const continueSetup = async () => {
    if (busy || saving.current) return;
    Keyboard.dismiss();
    setValidated(true);
    if (nameError || locationError) return;
    const nextDraft = { ...draft, displayName, homeLocation };
    saving.current = true;
    try {
      const result = onContinue(nextDraft);
      if (result !== undefined) {
        setSubmission({ status: 'saving' });
        await result;
      }
      setDraft(nextDraft);
      setSubmission({ status: 'saved' });
    } catch {
      setSubmission({
        status: 'error',
        message: 'Your profile details could not be saved. Try again.',
      });
    } finally {
      saving.current = false;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoiding}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Stack gap="space24">
              <StepProgress value={1} />
              <Stack gap="space8">
                <Text accessibilityRole="header" variant="title">
                  Your profile
                </Text>
                <Text color="textSecondary" variant="body">
                  Help your friends recognise you on court.
                </Text>
              </Stack>
              {submission.status === 'error' ? (
                <BannerToast
                  message={submission.message}
                  onClose={() => setSubmission({ status: 'idle' })}
                  style="error"
                  title="Could not update profile"
                  type="toast"
                />
              ) : null}
              <Stack gap="space8">
                <View
                  pointerEvents={busy ? 'none' : 'auto'}
                  accessibilityElementsHidden={busy}
                  importantForAccessibility={
                    busy ? 'no-hide-descendants' : 'auto'
                  }
                >
                  {draft.photoUri === null ? (
                    <AvatarPicker
                      onPress={() => void pickPhoto()}
                      variant="empty"
                    />
                  ) : (
                    <AvatarPicker
                      onPress={() => void pickPhoto()}
                      source={{ uri: draft.photoUri }}
                      variant="photo"
                    />
                  )}
                </View>
                <Text color="muted" variant="caption">
                  Profile photo is optional.
                </Text>
              </Stack>
              <Field
                disabled={busy}
                label="Display name"
                placeholder="Jamie Wilson"
                onChangeText={(value) => edit({ displayName: value })}
                required
                type="text"
                value={draft.displayName}
                {...(validated && nameError
                  ? { status: 'error' as const, message: nameError }
                  : { status: 'default' as const })}
              />
              <Field
                disabled={busy}
                label="Home location"
                onChangeText={(value) => edit({ homeLocation: value })}
                placeholder="City or area"
                required
                type="text"
                value={draft.homeLocation}
                {...(validated && locationError
                  ? { status: 'error' as const, message: locationError }
                  : { status: 'default' as const })}
              />
              <Text color="textSecondary" variant="caption">
                Your home location stays private in this draft.
              </Text>
              {submission.status === 'saved' ? (
                <Text
                  accessibilityLiveRegion="polite"
                  accessibilityRole="alert"
                  variant="body"
                >
                  Profile details saved. Ready for step 2.
                </Text>
              ) : null}
            </Stack>
            <View style={styles.footer}>
              <Stack gap="space12">
                <Button
                  label="Continue"
                  onPress={() => void continueSetup()}
                  style="primary"
                  {...(submission.status === 'saving'
                    ? { loading: true as const }
                    : { disabled: busy, loading: false as const })}
                />
                <Text
                  color="muted"
                  style={styles.centeredText}
                  variant="caption"
                >
                  You can edit these details later.
                </Text>
              </Stack>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  keyboardAvoiding: { flex: 1 },
  safeArea: { backgroundColor: colors.canvas, flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.space20,
    paddingVertical: spacing.space24,
  },
});
