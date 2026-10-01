import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WelcomeMascot } from '../design-system/assets';
import { SocialSignInButton } from '../design-system/components/authentication';
import { BannerToast } from '../design-system/components/feedback';
import { Stack, Text } from '../design-system/primitives';
import { colors, layoutWidths, spacing } from '../design-system/tokens';
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Stack gap="space32">
            <Stack gap="space8">
              <Text style={styles.centeredText} variant="title">
                Padel Potato
              </Text>
              <Text
                color="textSecondary"
                style={styles.centeredText}
                variant="body"
              >
                Ready for your next match?
              </Text>
            </Stack>
            <View style={styles.mascot}>
              <WelcomeMascot />
            </View>
            <Stack gap="space12">
              <Text
                accessibilityRole="header"
                style={styles.centeredText}
                variant="display"
              >
                Find your next padel game
              </Text>
              <Text
                color="textSecondary"
                style={styles.centeredText}
                variant="body"
              >
                Join games, meet players and keep your padel life in one place.
              </Text>
            </Stack>
            <Stack gap="space12">
              {submissionFailed ? (
                <BannerToast
                  message="Check your connection and try again."
                  onClose={() => setSubmissionFailed(false)}
                  style="error"
                  title="Could not sign in"
                  type="toast"
                />
              ) : null}
              <SocialSignInButton
                disabled={submitting !== null}
                onPress={() => void continueWith('google')}
                provider="google"
              />
              <SocialSignInButton
                disabled={submitting !== null}
                onPress={() => void continueWith('apple')}
                provider="apple"
              />
            </Stack>
          </Stack>
          <View style={styles.footer}>
            <Text color="muted" style={styles.centeredText} variant="caption">
              Sign in or create your profile with Apple or Google.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centeredText: {
    textAlign: 'center',
  },
  content: {
    alignSelf: 'center',
    flexGrow: 1,
    maxWidth: layoutWidths.content,
    width: '100%',
  },
  footer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingTop: spacing.space40,
  },
  mascot: {
    alignItems: 'center',
  },
  safeArea: {
    backgroundColor: colors.canvas,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.space20,
    paddingVertical: spacing.space32,
  },
});
