import type { GestureResponderEvent } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { Pressable } from '../../primitives/Pressable';
import { Text } from '../../primitives/Text';
import { borders, colors, radii, sizing, spacing } from '../../tokens';
import {
  assertOnlyKeys,
  isCallback,
  unsupportedValue,
} from '../../internal/validation';
import {
  AppleProviderMark,
  GoogleProviderMark,
} from '../../assets/artwork/actionProviderArtwork';

export const socialSignInProviders = Object.freeze([
  'google',
  'apple',
] as const);

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
} satisfies Readonly<
  Record<
    SocialSignInProvider,
    {
      Artwork: () => React.ReactElement;
      backgroundColor: string;
      label: string;
      textColor: 'ink' | 'surface';
    }
  >
>);

function validateProps(props: SocialSignInButtonProps) {
  assertOnlyKeys(props, supportedRuntimeProps);
  if (!socialSignInProviders.includes(props.provider)) {
    unsupportedValue(props.provider, socialSignInProviders);
  }
  if (
    typeof props.disabled !== 'undefined' &&
    typeof props.disabled !== 'boolean'
  ) {
    unsupportedValue(props.disabled, [true, false]);
  }
  if (typeof props.onPress !== 'undefined' && !isCallback(props.onPress)) {
    unsupportedValue(props.onPress, ['function']);
  }
}

export function SocialSignInButton(props: SocialSignInButtonProps) {
  validateProps(props);
  const { disabled = false, onPress, provider } = props;
  const { Artwork, backgroundColor, label, textColor } =
    providerContent[provider];

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      size="controlHeight48"
      width="fill"
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
          <View style={styles.artworkSlot}>
            {provider === 'apple' ? (
              <View style={styles.appleMark}>
                <Artwork />
              </View>
            ) : (
              <Artwork />
            )}
          </View>
          <Text color={textColor} style={styles.label} variant="bodyStrong">
            {label}
          </Text>
          <View style={styles.artworkSlot} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  appleMark: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.radiusFull,
    height: sizing.size32,
    justifyContent: 'center',
    width: sizing.size32,
  },
  artworkSlot: {
    alignItems: 'center',
    flexShrink: 0,
    justifyContent: 'center',
    width: sizing.size32,
  },
  content: {
    alignItems: 'center',
    alignSelf: 'stretch',
    borderColor: colors.border,
    borderRadius: radii.radiusFull,
    borderWidth: borders.borderDefault,
    flexDirection: 'row',
    gap: spacing.space8,
    minHeight: sizing.size48,
    justifyContent: 'center',
    paddingHorizontal: spacing.space16,
    paddingVertical: spacing.space4,
    width: '100%',
  },
  label: {
    flex: 1,
    minWidth: 0 as const,
    textAlign: 'center',
  },
});
