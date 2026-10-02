import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../design-system/components/actions';
import { BannerToast } from '../design-system/components/feedback';
import {
  Stack as LayoutStack,
  Surface,
  Text,
} from '../design-system/primitives';
import { colors, fontAssets } from '../design-system/tokens';
import {
  SessionProvider,
  useSession,
} from '../features/authentication/SessionContext';
import {
  SessionAppServicesProvider,
  useAppServicesLoadState,
} from '../features/services/AppServicesContext';

export { ErrorBoundary } from 'expo-router';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  return (
    <SessionProvider>
      <SessionAppServicesProvider>
        <RootNavigator fontError={fontError} fontsLoaded={fontsLoaded} />
      </SessionAppServicesProvider>
    </SessionProvider>
  );
}

function RootNavigator({
  fontError,
  fontsLoaded,
}: Readonly<{ fontError: Error | null; fontsLoaded: boolean }>) {
  const { signOut, state } = useSession();
  const appServices = useAppServicesLoadState();
  const ready =
    (fontsLoaded || fontError !== null) && state.status !== 'loading';

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) return null;

  if (fontError) {
    throw fontError;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {state.status === 'signedIn' &&
      (appServices.state.status === 'inactive' ||
        appServices.state.status === 'loading') ? (
        <AccountLoading />
      ) : state.status === 'signedIn' &&
        appServices.state.status === 'profileMissing' ? (
        <AccountUnavailable
          message="Your signed-in account does not have a player profile yet."
          onSignOut={signOut}
          title="Profile not found"
        />
      ) : state.status === 'signedIn' &&
        appServices.state.status === 'error' ? (
        <AccountUnavailable
          message="Check your connection and try loading your account again."
          onRetry={appServices.retry}
          onSignOut={signOut}
          title="Could not load account"
        />
      ) : (
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: colors.canvas },
            headerShown: false,
          }}
        >
          <Stack.Protected
            guard={
              state.status === 'signedIn' &&
              appServices.state.status === 'ready'
            }
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="onboarding" />
          </Stack.Protected>
          <Stack.Protected guard={state.status === 'signedOut'}>
            <Stack.Screen name="sign-in" />
          </Stack.Protected>
        </Stack>
      )}
    </SafeAreaProvider>
  );
}

function AccountLoading() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centered}>
        <Surface background="canvas" padding="space16">
          <Text color="textSecondary" variant="body">
            Loading account...
          </Text>
        </Surface>
      </View>
    </SafeAreaView>
  );
}

function AccountUnavailable({
  message,
  onRetry,
  onSignOut,
  title,
}: Readonly<{
  message: string;
  onRetry?: () => void;
  onSignOut: () => Promise<
    | Readonly<{ status: 'success' | 'cancelled' }>
    | Readonly<{ message: string; status: 'error' }>
  >;
  title: string;
}>) {
  const [signOutFailed, setSignOutFailed] = useState(false);
  const signOut = async () => {
    setSignOutFailed(false);
    const result = await onSignOut();
    if (result.status === 'error') setSignOutFailed(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centered}>
        <Surface background="canvas" padding="space16">
          <LayoutStack gap="space16">
            <LayoutStack gap="space8">
              <Text accessibilityRole="header" variant="title">
                {title}
              </Text>
              <Text color="textSecondary" variant="body">
                {message}
              </Text>
            </LayoutStack>
            {signOutFailed ? (
              <BannerToast
                message="Your account could not be signed out."
                onClose={() => setSignOutFailed(false)}
                style="error"
                title="Could not sign out"
                type="toast"
              />
            ) : null}
            {onRetry ? (
              <Button label="Try again" onPress={onRetry} style="primary" />
            ) : null}
            <Button
              label="Sign out"
              onPress={() => void signOut()}
              style="secondary"
            />
          </LayoutStack>
        </Surface>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
  },
  safeArea: {
    backgroundColor: colors.canvas,
    flex: 1,
  },
});
