import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors, fontAssets } from '../design-system/tokens';
import {
  SessionProvider,
  useSession,
} from '../features/authentication/SessionContext';

export { ErrorBoundary } from 'expo-router';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  return (
    <SessionProvider>
      <RootNavigator fontError={fontError} fontsLoaded={fontsLoaded} />
    </SessionProvider>
  );
}

function RootNavigator({
  fontError,
  fontsLoaded,
}: Readonly<{ fontError: Error | null; fontsLoaded: boolean }>) {
  const { state } = useSession();
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
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.canvas },
          headerShown: false,
        }}
      >
        <Stack.Protected guard={state.status === 'signedIn'}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="settings" />
        </Stack.Protected>
        <Stack.Protected guard={state.status === 'signedOut'}>
          <Stack.Screen name="sign-in" />
        </Stack.Protected>
      </Stack>
    </SafeAreaProvider>
  );
}
