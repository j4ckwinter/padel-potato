import { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  isAuthEmail,
  isNewPassword,
} from '../design-system/configuration/authentication';
import { WelcomeMascot } from '../design-system/assets';
import {
  AuthDivider,
  SocialSignInButton,
} from '../design-system/components/authentication';
import { Button } from '../design-system/components/actions';
import { Field } from '../design-system/components/forms';
import { BannerToast } from '../design-system/components/feedback';
import { Stack, Text } from '../design-system/primitives';
import { colors, layoutWidths, spacing } from '../design-system/tokens';
import { useSession } from '../features/authentication/SessionContext';
import type {
  AuthProvider,
  AuthSignInRequest,
} from '../features/authentication/authGateway';

export default function SignInScreen() {
  const { signIn, signUp, requestPasswordReset, callbackError } = useSession();
  const [mode, setMode] = useState<'signIn' | 'register' | 'reset'>('signIn');
  const [dismissedCallbackError, setDismissedCallbackError] = useState<
    string | null
  >(null);
  const visibleCallbackError =
    callbackError !== dismissedCallbackError ? callbackError : null;
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<AuthProvider | 'email' | null>(
    null,
  );
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const continueWith = async (request: AuthSignInRequest) => {
    if (submitting !== null) return;
    Keyboard.dismiss();
    const method = typeof request === 'string' ? request : request.method;
    setSubmitting(method);
    setSubmissionError(null);
    const message =
      method === 'email'
        ? 'Check your email and password and try again.'
        : 'Check your connection and try again.';
    try {
      const result =
        typeof request === 'string' || mode === 'signIn'
          ? await signIn(request)
          : mode === 'register'
            ? await signUp({ email: request.email, password: request.password })
            : await requestPasswordReset(request.email);
      if (result.status === 'error')
        setSubmissionError(
          mode === 'signIn' || typeof request === 'string'
            ? message
            : result.message,
        );
      if (result.status === 'confirmationRequired')
        setNotice(
          'If this address can receive an account email, check your inbox to confirm it. You can then sign in.',
        );
      if (mode === 'reset' && result.status === 'success')
        setNotice(
          'If an account exists for this email, you will receive a password reset link.',
        );
    } catch {
      setSubmissionError(message);
    } finally {
      setSubmitting(null);
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
                  Join games, meet players and keep your padel life in one
                  place.
                </Text>
              </Stack>
              <Stack gap="space12">
                {notice ? (
                  <Text accessibilityRole="alert" variant="body">
                    {notice}
                  </Text>
                ) : null}
                {submissionError || visibleCallbackError ? (
                  <BannerToast
                    message={submissionError ?? visibleCallbackError ?? ''}
                    onClose={() => {
                      setSubmissionError(null);
                      setDismissedCallbackError(callbackError);
                    }}
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
                <AuthDivider />
                <Field
                  disabled={submitting !== null}
                  label="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={setEmail}
                  type="text"
                  value={email}
                />
                {mode !== 'reset' ? (
                  <Field
                    disabled={submitting !== null}
                    label="Password"
                    onChangeText={setPassword}
                    type="password"
                    value={password}
                  />
                ) : null}
                <Button
                  {...(submitting === 'email'
                    ? { loading: true as const }
                    : {
                        disabled:
                          submitting !== null ||
                          !isAuthEmail(email) ||
                          (mode !== 'reset' &&
                            (mode === 'register'
                              ? !isNewPassword(password)
                              : password.length === 0)),
                        loading: false as const,
                      })}
                  label={
                    mode === 'register'
                      ? 'Create account'
                      : mode === 'reset'
                        ? 'Send password reset link'
                        : 'Sign in with email'
                  }
                  onPress={() =>
                    void continueWith({
                      method: 'email',
                      email: email.trim(),
                      password,
                    })
                  }
                  style="primary"
                />
                {mode === 'register' ? (
                  <Text color="textSecondary" variant="caption">
                    Use at least 8 characters for your password.
                  </Text>
                ) : null}
                {submitting === null ? (
                  <>
                    <Button
                      label={
                        mode === 'signIn'
                          ? 'Create an account'
                          : 'Back to sign in'
                      }
                      style="ghost"
                      onPress={() => {
                        setMode(mode === 'signIn' ? 'register' : 'signIn');
                        setNotice(null);
                        setSubmissionError(null);
                        setPassword('');
                      }}
                    />
                    {mode === 'signIn' ? (
                      <Button
                        label="Forgot password?"
                        style="ghost"
                        onPress={() => {
                          setMode('reset');
                          setNotice(null);
                          setSubmissionError(null);
                          setPassword('');
                        }}
                      />
                    ) : null}
                  </>
                ) : null}
              </Stack>
            </Stack>
            <View style={styles.footer}>
              <Text color="muted" style={styles.centeredText} variant="caption">
                Sign in or create an account with email, Apple or Google.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardAvoiding: {
    flex: 1,
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
