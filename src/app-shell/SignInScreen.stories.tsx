import type { Meta, StoryObj } from '@storybook/react-native';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SignInScreen from '../app/sign-in';
import { layoutWidths, sizing } from '../design-system/tokens';
import { SessionProvider } from '../features/authentication/SessionContext';
import type { AuthGateway } from '../features/authentication/authGateway';

const gateway: AuthGateway = {
  signUp: async () => ({ status: 'confirmationRequired' }),
  requestPasswordReset: async () => ({ status: 'success' }),
  updatePassword: async () => ({ status: 'success' }),
  handleEmailCallback: async () => ({ status: 'success' }),
  restoreSession: async () => null,
  signIn: async () => ({ status: 'cancelled' }),
  signOut: async () => ({ status: 'success' }),
  subscribe: () => () => undefined,
};

const failureGateway: AuthGateway = {
  ...gateway,
  signIn: async () => ({ message: 'Provider unavailable', status: 'error' }),
};

function WelcomeHarness({
  compact = false,
  failure = false,
}: Readonly<{ compact?: boolean; failure?: boolean }>) {
  return (
    <View style={[styles.viewport, compact && styles.compact]}>
      <SafeAreaProvider
        initialMetrics={{
          frame: {
            height: compact ? 568 : 844,
            width: compact ? layoutWidths.compact : layoutWidths.viewport,
            x: 0,
            y: 0,
          },
          insets: {
            bottom: sizing.size32,
            left: 0,
            right: 0,
            top: sizing.size48,
          },
        }}
      >
        <SessionProvider gateway={failure ? failureGateway : gateway}>
          <SignInScreen />
        </SessionProvider>
      </SafeAreaProvider>
    </View>
  );
}

const meta = {
  title: 'Screens/Welcome',
  component: WelcomeHarness,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof WelcomeHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Canonical: Story = {};
export const Compact: Story = { args: { compact: true } };
export const SignInFailure: Story = { args: { failure: true } };

const styles = StyleSheet.create({
  compact: { maxHeight: 568, maxWidth: layoutWidths.compact },
  viewport: { alignSelf: 'center', flex: 1, width: '100%' },
});
