import {
  Image,
  type ImageSourcePropType,
  StyleSheet,
  View,
} from 'react-native';

import { Text } from '../../primitives/Text';
import {
  avatarPresences,
  avatarRecords,
  avatarSizes,
} from '../phase4SourceRegistry';
import { isLocalImageSource } from '../localImageSource';

export { avatarPresences, avatarSizes };

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
  const record = avatarRecords.find(
    ({ normalizedTuple }) => normalizedTuple.size === size
      && normalizedTuple.presence === presence,
  );
  if (!record) unsupportedConfiguration(`${size}/${presence}`);

  const diameter = record.metrics.avatar.normalized.width;
  const indicatorDiameter = record.metrics.presence.normalized.width;
  const backgroundColor = record.metrics.avatar.fills[0]?.fillColor;
  const indicatorColor = record.metrics.presence.fills[0]?.fillColor;
  const indicatorStroke = record.metrics.presence.strokes[0];
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
            borderColor: indicatorStroke?.strokeColor,
            borderRadius: indicatorDiameter / 2,
            borderWidth: indicatorStroke?.strokeWidth ?? 0,
            height: indicatorDiameter,
            left: record.metrics.presence.offsetFromAvatar.x,
            top: record.metrics.presence.offsetFromAvatar.y,
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
