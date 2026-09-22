import type { GestureResponderEvent } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { Pressable } from '../../primitives/Pressable';
import { Text } from '../../primitives/Text';
import { colors } from '../../tokens';
import { assertOnlyKeys, isCallback, unsupportedValue } from '../../internal/validation';
import {
  AppleProviderMark,
  GoogleProviderMark,
} from '../../assets/artwork/actionProviderArtwork';

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
    Artwork: AppleProviderMark,
    backgroundColor: colors.deep,
    label: 'Continue with Apple',
    textColor: 'surface' as const,
  }),
  google: Object.freeze({
    Artwork: GoogleProviderMark,
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

function validateProps(props: SocialSignInButtonProps) {
  assertOnlyKeys(props, supportedRuntimeProps);
  if (!socialSignInProviders.includes(props.provider)) {
    unsupportedValue(props.provider, socialSignInProviders);
  }
  if (typeof props.disabled !== 'undefined' && typeof props.disabled !== 'boolean') {
    unsupportedValue(props.disabled, [true, false]);
  }
  if (typeof props.onPress !== 'undefined' && !isCallback(props.onPress)) {
    unsupportedValue(props.onPress, ['function']);
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
