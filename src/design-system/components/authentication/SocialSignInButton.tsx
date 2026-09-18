import type { GestureResponderEvent } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { Pressable } from '../../primitives/Pressable';
import { Text } from '../../primitives/Text';
import { colors } from '../../tokens';
import {
  AppleProviderArtwork,
  GoogleProviderArtwork,
} from '../generated/phase3Artwork';

export const socialSignInProviders = Object.freeze(['google', 'apple'] as const);

export type SocialSignInProvider = (typeof socialSignInProviders)[number];

export type SocialSignInButtonProps = Readonly<{
  disabled?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  provider: SocialSignInProvider;
}>;

const supportedRuntimeProps = Object.freeze([
  'disabled',
  'onPress',
  'provider',
] as const);

const providerContent = Object.freeze({
  apple: Object.freeze({
    Artwork: AppleProviderArtwork,
    backgroundColor: colors.deep,
    label: 'Continue with Apple',
    textColor: 'surface' as const,
  }),
  google: Object.freeze({
    Artwork: GoogleProviderArtwork,
    backgroundColor: colors.surface,
    label: 'Continue with Google',
    textColor: 'ink' as const,
  }),
} satisfies Readonly<Record<SocialSignInProvider, {
  Artwork: () => React.ReactElement;
  backgroundColor: string;
  label: string;
  textColor: 'ink' | 'surface';
}>>);

function unsupported(value: unknown, supported: readonly unknown[]): never {
  throw new Error(
    `Unsupported design-system value: ${String(value)}. Supported values: ${supported.join(', ')}`,
  );
}

function validateProps(props: SocialSignInButtonProps) {
  for (const key of Object.keys(props)) {
    if (!supportedRuntimeProps.includes(key as (typeof supportedRuntimeProps)[number])) {
      unsupported(key, supportedRuntimeProps);
    }
  }
  if (!socialSignInProviders.includes(props.provider)) {
    unsupported(props.provider, socialSignInProviders);
  }
  if (typeof props.disabled !== 'undefined' && typeof props.disabled !== 'boolean') {
    unsupported(props.disabled, [true, false]);
  }
  if (typeof props.onPress !== 'undefined' && typeof props.onPress !== 'function') {
    unsupported(props.onPress, ['function']);
  }
}

export function SocialSignInButton(props: SocialSignInButtonProps) {
  validateProps(props);
  const { disabled = false, onPress, provider } = props;
  const { Artwork, backgroundColor, label, textColor } = providerContent[provider];

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      size="controlHeight48"
      style={styles.target}
    >
      {({ pressed }) => (
        <View
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[
            styles.content,
            {
              backgroundColor:
                pressed && provider === 'google'
                  ? colors.surfaceMuted
                  : backgroundColor,
            },
          ]}
        >
          <Artwork />
          <Text color={textColor} variant="bodyStrong">
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    alignSelf: 'stretch',
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
    width: 352,
  },
  target: {
    height: 48,
    width: 352,
  },
});
