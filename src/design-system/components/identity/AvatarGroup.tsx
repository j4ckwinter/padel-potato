import type { ImageSourcePropType } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { Icon } from '../../assets/Icon';
import { Pressable } from '../../primitives/Pressable';
import { Text } from '../../primitives/Text';
import { colors } from '../../tokens';
import { isLocalImageSource } from '../../internal/validation';
import { Avatar } from './Avatar';

type InitialsIdentity = Readonly<{
  initials: string;
  name: string;
  presence: 'online';
  source?: never;
}>;

type PhotoIdentity = Readonly<{
  initials?: never;
  name: string;
  presence: 'online';
  source: ImageSourcePropType;
}>;

export type AvatarGroupIdentity = InitialsIdentity | PhotoIdentity;

type Pair = readonly [AvatarGroupIdentity, AvatarGroupIdentity];
type Trio = readonly [
  AvatarGroupIdentity,
  AvatarGroupIdentity,
  AvatarGroupIdentity,
];
type Quartet = readonly [
  AvatarGroupIdentity,
  AvatarGroupIdentity,
  AvatarGroupIdentity,
  AvatarGroupIdentity,
];

export type AvatarGroupProps =
  | Readonly<{ identities: Pair; variant: '2-players' }>
  | Readonly<{ identities: Trio; variant: '3-players' }>
  | Readonly<{ identities: Quartet; variant: '4-players' }>
  | Readonly<{ identities: Quartet; overflow: number; variant: 'overflow' }>
  | Readonly<{
      onAddPlayer1: () => void;
      onAddPlayer2: () => void;
      variant: 'empty';
    }>;

const supportedRuntimeProps = Object.freeze([
  'identities',
  'onAddPlayer1',
  'onAddPlayer2',
  'overflow',
  'variant',
] as const);
const supportedVariants = Object.freeze([
  '2-players',
  '3-players',
  '4-players',
  'overflow',
  'empty',
] as const);

function unsupported(reason: string): never {
  throw new Error(
    `Unsupported Avatar Group configuration: ${reason}. Supported configurations: 2 players/default, 3 players/default, 4 players/default, 4 players/overflow, 2 slots/empty.`,
  );
}

function validateIdentity(
  value: unknown,
  index: number,
): asserts value is AvatarGroupIdentity {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    unsupported(`identity ${index + 1} must be a player identity`);
  }
  const identity = value as Record<string, unknown>;
  const keys = Object.keys(identity);
  if (
    keys.some(
      (key) => !['initials', 'name', 'presence', 'source'].includes(key),
    )
  ) {
    unsupported(`identity ${index + 1} contains an unsupported property`);
  }
  if (typeof identity.name !== 'string' || identity.name.trim().length === 0) {
    unsupported(`identity ${index + 1} requires a non-empty name`);
  }
  if (identity.presence !== 'online') {
    unsupported(
      `identity ${index + 1} must use the authored 40/online Avatar tuple`,
    );
  }
  const hasInitials = Object.prototype.hasOwnProperty.call(
    identity,
    'initials',
  );
  const hasSource = Object.prototype.hasOwnProperty.call(identity, 'source');
  if (hasInitials === hasSource)
    unsupported(`identity ${index + 1} requires exactly one visual source`);
  if (
    hasInitials &&
    (typeof identity.initials !== 'string' ||
      identity.initials.trim().length < 1 ||
      identity.initials.trim().length > 3)
  )
    unsupported(
      `identity ${index + 1} initials must contain one to three characters`,
    );
  if (hasSource && !isLocalImageSource(identity.source)) {
    unsupported(`identity ${index + 1} source must be bundled or local`);
  }
}

function validateAvatarGroupProps(props: AvatarGroupProps) {
  const runtime = props as unknown as Record<string, unknown>;
  for (const key of Object.keys(runtime)) {
    if (
      !supportedRuntimeProps.includes(
        key as (typeof supportedRuntimeProps)[number],
      )
    ) {
      unsupported(`unsupported property ${key}`);
    }
  }
  if (
    !supportedVariants.includes(
      runtime.variant as (typeof supportedVariants)[number],
    )
  ) {
    unsupported(`unknown variant ${String(runtime.variant)}`);
  }
  const keys = Object.keys(runtime).sort();
  const expectedKeys =
    runtime.variant === 'empty'
      ? ['onAddPlayer1', 'onAddPlayer2', 'variant']
      : runtime.variant === 'overflow'
        ? ['identities', 'overflow', 'variant']
        : ['identities', 'variant'];
  if (keys.join('|') !== expectedKeys.join('|')) {
    unsupported(
      `${String(runtime.variant)} contains branch-incompatible properties`,
    );
  }
  if (runtime.variant === 'empty') {
    if (
      typeof runtime.onAddPlayer1 !== 'function' ||
      typeof runtime.onAddPlayer2 !== 'function'
    ) {
      unsupported('empty slots require two independently named callbacks');
    }
    return;
  }
  if (!Array.isArray(runtime.identities))
    unsupported(`${String(runtime.variant)} requires identities`);
  const identities = runtime.identities as unknown[];
  const expected =
    runtime.variant === '2-players'
      ? 2
      : runtime.variant === '3-players'
        ? 3
        : 4;
  if (identities.length !== expected)
    unsupported(`${String(runtime.variant)} requires ${expected} identities`);
  identities.forEach(validateIdentity);
  if (runtime.variant === 'overflow') {
    if (
      !Number.isInteger(runtime.overflow) ||
      (runtime.overflow as number) <= 0
    ) {
      unsupported('overflow must be a positive integer');
    }
  }
}

function EmptySlot({
  label,
  onPress,
}: Readonly<{ label: string; onPress: () => void }>) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      size="controlHeight44"
      style={styles.emptyTarget}
    >
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.emptyVisual}
      >
        <Icon name="add" />
      </View>
    </Pressable>
  );
}

export function AvatarGroup(props: AvatarGroupProps) {
  validateAvatarGroupProps(props);

  if (props.variant === 'empty') {
    return (
      <View style={styles.group}>
        <EmptySlot label="Add player 1" onPress={props.onAddPlayer1} />
        <EmptySlot label="Add player 2" onPress={props.onAddPlayer2} />
      </View>
    );
  }

  const names = props.identities.map(({ name }) => name.trim()).join(', ');
  const description =
    props.variant === 'overflow'
      ? `${names}, plus ${props.overflow} more`
      : names;

  return (
    <View
      accessibilityRole="summary"
      accessibilityValue={{ text: description }}
      accessible
      style={styles.group}
    >
      {props.identities.map((identity, index) => (
        <View
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          key={`${identity.name}-${index}`}
          style={[styles.identity, index > 0 ? styles.overlap : undefined]}
          testID="avatar-group-identity"
        >
          {'source' in identity && identity.source !== undefined ? (
            <Avatar
              decorative
              presence="online"
              size={40}
              source={identity.source}
            />
          ) : (
            <Avatar
              decorative
              initials={identity.initials}
              presence="online"
              size={40}
            />
          )}
        </View>
      ))}
      {props.variant === 'overflow' ? (
        <View
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[styles.overflow, styles.overlap]}
        >
          <Text variant="micro">{`+${props.overflow}`}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyTarget: { height: 44, width: 44 },
  emptyVisual: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  group: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 56,
    width: 190,
  },
  identity: {
    borderColor: colors.surface,
    borderRadius: 22,
    borderWidth: 2,
  },
  overflow: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.surface,
    borderRadius: 22,
    borderWidth: 2,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  overlap: { marginLeft: -12 },
});
