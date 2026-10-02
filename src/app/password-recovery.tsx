import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isNewPassword } from '../design-system/configuration/authentication';
import { Button } from '../design-system/components/actions';
import { BannerToast } from '../design-system/components/feedback';
import { Field } from '../design-system/components/forms';
import { Stack, Text } from '../design-system/primitives';
import { colors, spacing } from '../design-system/tokens';
import { useSession } from '../features/authentication/SessionContext';

export default function PasswordRecoveryScreen() {
  const { updatePassword, signOut } = useSession();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await updatePassword(password);
      if (result.status === 'error') setError(result.message);
    } catch {
      setError('Could not update your password. Try again.');
    } finally {
      setSubmitting(false);
    }
  };
  const cancel = async () => {
    setSubmitting(true);
    try {
      const result = await signOut();
      if (result.status === 'error') setError('Could not sign out. Try again.');
    } catch {
      setError('Could not sign out. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Stack gap="space16">
        <Text accessibilityRole="header" variant="title">
          Choose a new password
        </Text>
        <Text variant="body">Use at least 8 characters.</Text>
        {error ? (
          <BannerToast
            message={error}
            onClose={() => setError(null)}
            style="error"
            title="Password reset"
            type="toast"
          />
        ) : null}
        <Field
          disabled={submitting}
          label="New password"
          type="password"
          value={password}
          onChangeText={setPassword}
        />
        <Field
          disabled={submitting}
          label="Confirm password"
          type="password"
          value={confirmation}
          onChangeText={setConfirmation}
        />
        <Button
          {...(submitting
            ? { loading: true as const }
            : {
                disabled: !isNewPassword(password) || password !== confirmation,
                loading: false as const,
              })}
          label="Save new password"
          style="primary"
          onPress={() => void save()}
        />
        {!submitting ? (
          <Button
            label="Cancel and sign out"
            style="ghost"
            onPress={() => void cancel()}
          />
        ) : null}
      </Stack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
    padding: spacing.space20,
    justifyContent: 'center',
  },
});
