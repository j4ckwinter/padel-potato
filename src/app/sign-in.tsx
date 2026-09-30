import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandLockupStacked } from '../design-system/assets';
import { SocialSignInButton } from '../design-system/components/authentication';
import { BannerToast } from '../design-system/components/feedback';
import { Stack, Surface, Text } from '../design-system/primitives';
import { colors, spacing } from '../design-system/tokens';
import { useSession } from '../features/authentication/SessionContext';
import type { AuthProvider } from '../features/authentication/authGateway';

export default function SignInScreen() {
  const { signIn } = useSession();
  const [submitting, setSubmitting] = useState<AuthProvider | null>(null);
  const [submissionFailed, setSubmissionFailed] = useState(false);

  const continueWith = async (provider: AuthProvider) => {
    setSubmitting(provider);
    setSubmissionFailed(false);
    const result = await signIn(provider);
    if (result.status === 'error') {
      setSubmissionFailed(true);
    }
    setSubmitting(null);
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
                  message="Check your connection and try again."
                  onClose={() => setSubmissionFailed(false)}
                  style="error"
                  title="Could not sign in"
                  type="toast"
                />
              ) : null}
              <Stack gap="space12">
                <SocialSignInButton
                  disabled={submitting !== null}
                  onPress={() => void continueWith('apple')}
                  provider="apple"
                />
                <SocialSignInButton
                  disabled={submitting !== null}
                  onPress={() => void continueWith('google')}
                  provider="google"
                />
              </Stack>
              <Text color="muted" variant="caption">
                Continue to organise games and keep your match history synced.
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
