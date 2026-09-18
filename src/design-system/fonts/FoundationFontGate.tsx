import { useFonts, type FontSource } from 'expo-font';
import type { PropsWithChildren } from 'react';
import { Text, View } from 'react-native';

import { fontAssets } from '../tokens/typography';

type FoundationFontGateProps = PropsWithChildren<{
  assets?: Readonly<Record<string, FontSource>>;
}>;

type LoadedFoundationFontGateProps = PropsWithChildren<{
  assets: Record<string, FontSource>;
}>;

function LoadedFoundationFontGate({
  assets,
  children,
}: LoadedFoundationFontGateProps) {
  const [loaded, error] = useFonts(assets);

  if (error) {
    return (
      <View
        accessible
        accessibilityLabel="Foundation fonts failed to load"
        accessibilityRole="alert"
      >
        <Text>Foundation fonts failed to load.</Text>
        {__DEV__ ? <Text>{error.message}</Text> : null}
      </View>
    );
  }

  if (!loaded) {
    return (
      <View
        accessible
        accessibilityLabel="Loading foundation fonts"
        accessibilityRole="progressbar"
        accessibilityState={{ busy: true }}
      >
        <Text>Loading foundation fonts…</Text>
      </View>
    );
  }

  return <>{children}</>;
}

export function FoundationFontGate({
  assets = fontAssets,
  children,
}: FoundationFontGateProps) {
  const entries = Object.entries(assets);

  if (entries.length === 0) {
    return <>{children}</>;
  }

  return (
    <LoadedFoundationFontGate assets={Object.fromEntries(entries)}>
      {children}
    </LoadedFoundationFontGate>
  );
}
