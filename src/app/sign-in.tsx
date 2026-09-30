import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandLockupStacked } from '../design-system/assets';
import { Button } from '../design-system/components/actions';
import { BannerToast } from '../design-system/components/feedback';
import { Stack, Surface, Text } from '../design-system/primitives';
import { colors, spacing } from '../design-system/tokens';
import { useSession } from '../features/authentication/SessionContext';

export default function SignInScreen() {
  const { signInDemo } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [submissionFailed, setSubmissionFailed] = useState(false);

  const signIn = async () => {
    setSubmitting(true);
    setSubmissionFailed(false);
    const result = await signInDemo();
    if (result.status === 'storageError') {
      setSubmissionFailed(true);
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Stack gap="space32">
          <View style={styles.brand}>
            <BrandLockupStacked width={240} />
          </View>
          <Surface padding="space20" radius="radius20">
            <Stack gap="space20">
              <Stack gap="space8">
                <Text accessibilityRole="header" variant="title">
                  Welcome to Padel Potato
                </Text>
                <Text color="textSecondary" variant="body">
                  Organise games with friends and keep your match record in one
                  place.
                </Text>
              </Stack>
              {submissionFailed ? (
                <BannerToast
                  message="Your session could not be saved on this device."
                  onClose={() => setSubmissionFailed(false)}
                  style="error"
                  title="Could not sign in"
                  type="toast"
                />
              ) : null}
              {submitting ? (
                <Button
                  label="Continue with demo account"
                  loading
                  style="primary"
                />
              ) : (
                <Button
                  label="Continue with demo account"
                  onPress={() => void signIn()}
                  style="primary"
                />
              )}
              <Text color="muted" variant="caption">
                This local account keeps the app usable until an account
                provider is connected.
              </Text>
            </Stack>
          </Surface>
        </Stack>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  brand: {
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.space16,
  },
  safeArea: {
    backgroundColor: colors.canvas,
    flex: 1,
  },
});
