import {
  Image,
  type ImageSourcePropType,
  StyleSheet,
  View,
} from 'react-native';

import { Text } from '../../primitives/Text';
import { colors } from '../../tokens';
import { isLocalImageSource } from '../localImageSource';

export const avatarSizes = Object.freeze([32, 40, 48, 56] as const);
export const avatarPresences = Object.freeze(['online', 'away', 'offline'] as const);

export type AvatarSize = (typeof avatarSizes)[number];
export type AvatarPresence = (typeof avatarPresences)[number];

type AvatarTuple =
  | Readonly<{ size: 32; presence: 'online' }>
  | Readonly<{ size: 40; presence: 'online' }>
  | Readonly<{ size: 48; presence: 'away' | 'offline' }>
  | Readonly<{ size: 56; presence: 'online' }>;

type AvatarIdentity =
  | Readonly<{ initials: string; source?: never }>
  | Readonly<{ initials?: never; source: ImageSourcePropType }>;

type AvatarSemantics =
  | Readonly<{ accessibilityLabel: string; decorative?: false }>
  | Readonly<{ accessibilityLabel?: never; decorative: true }>;

export type AvatarProps = AvatarTuple & AvatarIdentity & AvatarSemantics;

const supportedRuntimeProps = Object.freeze([
  'accessibilityLabel',
  'decorative',
  'initials',
  'presence',
  'size',
  'source',
] as const);

const supportedTuples = Object.freeze([
  '32/online',
  '40/online',
  '48/away',
  '48/offline',
  '56/online',
] as const);

const avatarConfigurations = Object.freeze({
  '32/online': Object.freeze({ diameter: 32, indicatorDiameter: 8, indicatorOffset: 25 }),
  '40/online': Object.freeze({ diameter: 40, indicatorDiameter: 10, indicatorOffset: 31 }),
  '48/away': Object.freeze({ diameter: 48, indicatorDiameter: 12, indicatorOffset: 37 }),
  '48/offline': Object.freeze({ diameter: 48, indicatorDiameter: 12, indicatorOffset: 37 }),
  '56/online': Object.freeze({ diameter: 56, indicatorDiameter: 12, indicatorOffset: 45 }),
} as const);

const presenceColors = Object.freeze({
  away: colors.warning,
  offline: colors.muted,
  online: colors.accent,
} as const);

function unsupportedConfiguration(tuple: string): never {
  throw new Error(
    `Unsupported Avatar configuration: ${tuple}. Supported configurations: ${supportedTuples.join(', ')}.`,
  );
}

function unsupportedIdentity(reason: string): never {
  throw new Error(`Unsupported Avatar identity content: ${reason}.`);
}

function validateAvatarProps(props: AvatarProps) {
  const runtimeProps = props as unknown as Record<string, unknown>;
  for (const key of Object.keys(runtimeProps)) {
    if (!supportedRuntimeProps.includes(key as (typeof supportedRuntimeProps)[number])) {
      unsupportedIdentity(`unsupported property ${key}`);
    }
  }

  const tuple = `${String(runtimeProps.size)}/${String(runtimeProps.presence)}`;
  if (!supportedTuples.includes(tuple as (typeof supportedTuples)[number])) {
    unsupportedConfiguration(tuple);
  }

  const hasInitials = Object.prototype.hasOwnProperty.call(runtimeProps, 'initials');
  const hasSource = Object.prototype.hasOwnProperty.call(runtimeProps, 'source');
  if (hasInitials === hasSource) {
    unsupportedIdentity('provide exactly one of initials or source');
  }
  if (hasInitials) {
    if (
      typeof runtimeProps.initials !== 'string'
      || runtimeProps.initials.trim().length < 1
      || runtimeProps.initials.trim().length > 3
    ) {
      unsupportedIdentity('initials must contain one to three visible characters');
    }
  } else if (!isLocalImageSource(runtimeProps.source)) {
    unsupportedIdentity('source must be a bundled or local React Native image source');
  }

  if (runtimeProps.decorative === true) {
    if (typeof runtimeProps.accessibilityLabel !== 'undefined') {
      unsupportedIdentity('decorative avatars cannot expose an accessibility label');
    }
  } else if (
    runtimeProps.decorative !== undefined
    || typeof runtimeProps.accessibilityLabel !== 'string'
    || runtimeProps.accessibilityLabel.trim().length === 0
  ) {
    unsupportedIdentity('labelled avatars require a non-empty accessibility label');
  }
}

export function Avatar(props: AvatarProps) {
  validateAvatarProps(props);
  const { presence, size } = props;
  const tuple = `${size}/${presence}` as keyof typeof avatarConfigurations;
  const configuration = avatarConfigurations[tuple];
  if (!configuration) unsupportedConfiguration(tuple);

  const { diameter, indicatorDiameter, indicatorOffset } = configuration;
  const backgroundColor = colors.info;
  const indicatorColor = presenceColors[presence];
  const decorative = props.decorative === true;

  return (
    <View
      accessibilityElementsHidden={decorative || undefined}
      accessibilityLabel={decorative ? undefined : props.accessibilityLabel}
      accessibilityRole={decorative ? undefined : 'image'}
      accessible={!decorative}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'yes'}
      style={{
        borderRadius: diameter / 2,
        height: diameter,
        position: 'relative',
        width: diameter,
      }}
    >
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{
          alignItems: 'center',
          backgroundColor,
          borderRadius: diameter / 2,
          height: diameter,
          justifyContent: 'center',
          overflow: 'hidden',
          width: diameter,
        }}
      >
        {'source' in props ? (
          <Image
            accessibilityElementsHidden
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            resizeMode="cover"
            source={props.source}
            style={{ height: diameter, width: diameter }}
          />
        ) : (
          <Text
            accessible={false}
            maxFontSizeMultiplier={2}
            variant={size <= 40 ? 'micro' : 'label'}
          >
            {props.initials.trim()}
          </Text>
        )}
      </View>
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          styles.presence,
          {
            backgroundColor: indicatorColor,
            borderColor: colors.surface,
            borderRadius: indicatorDiameter / 2,
            borderWidth: 2,
            height: indicatorDiameter,
            left: indicatorOffset,
            top: indicatorOffset,
            width: indicatorDiameter,
          },
        ]}
        testID="avatar-presence"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  presence: {
    position: 'absolute',
  },
});
