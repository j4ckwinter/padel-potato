import type { ImageSourcePropType } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { Icon } from '../../assets/Icon';
import { Pressable } from '../../primitives/Pressable';
import { Text } from '../../primitives/Text';
import { borders, colors, radii, sizing, spacing } from '../../tokens';
import { Avatar } from '../identity/Avatar';
import { isLocalImageSource } from '../../internal/validation';

type InitialsIdentity = Readonly<{
  initials: string;
  name: string;
  presence: 'away' | 'offline';
  source?: never;
  supportingText: string;
}>;

type PhotoIdentity = Readonly<{
  initials?: never;
  name: string;
  presence: 'away' | 'offline';
  source: ImageSourcePropType;
  supportingText: string;
}>;

export type PlayerItemIdentity = InitialsIdentity | PhotoIdentity;

export type PlayerItemProps =
  | Readonly<{
      identity: PlayerItemIdentity;
      onSelectedChange: (selected: boolean) => void;
      selected: boolean;
      variant: 'list';
    }>
  | Readonly<{
      identity: PlayerItemIdentity;
      onViewPlayer: () => void;
      variant: 'game-slot';
    }>
  | Readonly<{
      onInvite: () => void;
      variant: 'empty-game-slot';
    }>
  | Readonly<{
      disabled: false;
      identity: PlayerItemIdentity;
      onInvite: () => void;
      variant: 'invite-result';
    }>
  | Readonly<{
      disabled: true;
      identity: PlayerItemIdentity;
      onInvite?: () => void;
      variant: 'invite-result';
    }>;

const supportedRuntimeProps = Object.freeze([
  'disabled',
  'identity',
  'onInvite',
  'onSelectedChange',
  'onViewPlayer',
  'selected',
  'variant',
] as const);

const supportedTuples = Object.freeze([
  'list/default',
  'list/selected',
  'game slot/default',
  'game slot/empty',
  'invite result/default',
  'invite result/disabled',
] as const);

function unsupported(reason: string): never {
  throw new Error(
    `Unsupported Player Item configuration: ${reason}. Supported configurations: ${supportedTuples.join(', ')}.`,
  );
}

function validateIdentity(value: unknown): asserts value is PlayerItemIdentity {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    unsupported('identity must be a player identity');
  }
  const identity = value as Record<string, unknown>;
  const keys = Object.keys(identity);
  if (
    keys.some(
      (key) =>
        !['initials', 'name', 'presence', 'source', 'supportingText'].includes(
          key,
        ),
    )
  ) {
    unsupported('identity contains an unsupported property');
  }
  if (typeof identity.name !== 'string' || identity.name.trim().length === 0) {
    unsupported('identity requires a non-empty name');
  }
  if (
    typeof identity.supportingText !== 'string' ||
    identity.supportingText.trim().length === 0
  ) {
    unsupported('identity requires non-empty supporting text');
  }
  if (identity.presence !== 'away' && identity.presence !== 'offline') {
    unsupported(
      'identity must use an authored 48/away or 48/offline Avatar tuple',
    );
  }
  const hasInitials = Object.prototype.hasOwnProperty.call(
    identity,
    'initials',
  );
  const hasSource = Object.prototype.hasOwnProperty.call(identity, 'source');
  if (hasInitials === hasSource)
    unsupported('identity requires exactly one visual source');
  if (
    hasInitials &&
    (typeof identity.initials !== 'string' ||
      identity.initials.trim().length < 1 ||
      identity.initials.trim().length > 3)
  )
    unsupported('identity initials must contain one to three characters');
  if (hasSource && !isLocalImageSource(identity.source)) {
    unsupported('identity source must be bundled or local');
  }
}

function validatePlayerItemProps(props: PlayerItemProps) {
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

  if (runtime.variant === 'empty-game-slot') {
    if (
      Object.keys(runtime).some((key) => !['onInvite', 'variant'].includes(key))
    ) {
      unsupported('game slot/empty accepts only its invitation callback');
    }
    if (typeof runtime.onInvite !== 'function')
      unsupported('game slot/empty requires onInvite');
    return;
  }

  validateIdentity(runtime.identity);

  if (runtime.variant === 'list') {
    if (typeof runtime.selected !== 'boolean')
      unsupported('list requires controlled selected state');
    if (typeof runtime.onSelectedChange !== 'function')
      unsupported('list requires onSelectedChange');
    if (
      Object.keys(runtime).some(
        (key) =>
          !['identity', 'onSelectedChange', 'selected', 'variant'].includes(
            key,
          ),
      )
    ) {
      unsupported('list contains an unsupported callback or property');
    }
    return;
  }

  if (runtime.variant === 'game-slot') {
    if (typeof runtime.onViewPlayer !== 'function')
      unsupported('game slot/default requires onViewPlayer');
    if (
      Object.keys(runtime).some(
        (key) => !['identity', 'onViewPlayer', 'variant'].includes(key),
      )
    ) {
      unsupported(
        'game slot/default contains an unsupported callback or property',
      );
    }
    return;
  }

  if (runtime.variant === 'invite-result') {
    if (typeof runtime.disabled !== 'boolean')
      unsupported('invite result requires explicit disabled state');
    if (!runtime.disabled && typeof runtime.onInvite !== 'function') {
      unsupported('invite result/default requires onInvite');
    }
    if (
      runtime.onInvite !== undefined &&
      typeof runtime.onInvite !== 'function'
    ) {
      unsupported('invite result onInvite must be a function when supplied');
    }
    if (
      Object.keys(runtime).some(
        (key) => !['disabled', 'identity', 'onInvite', 'variant'].includes(key),
      )
    ) {
      unsupported('invite result contains an unsupported callback or property');
    }
    return;
  }

  unsupported(`unknown variant ${String(runtime.variant)}`);
}

function IdentityVisual({
  identity,
}: Readonly<{ identity: PlayerItemIdentity }>) {
  return 'source' in identity && identity.source !== undefined ? (
    <Avatar
      decorative
      presence={identity.presence}
      size={48}
      source={identity.source}
    />
  ) : (
    <Avatar
      decorative
      initials={identity.initials}
      presence={identity.presence}
      size={48}
    />
  );
}

function EmptyVisual() {
  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.emptyAvatar}
    >
      <Text color="muted" variant="heading">
        +
      </Text>
    </View>
  );
}

export function PlayerItem(props: PlayerItemProps) {
  validatePlayerItemProps(props);

  const empty = props.variant === 'empty-game-slot';
  const selected = props.variant === 'list' && props.selected;
  const disabled = props.variant === 'invite-result' && props.disabled;
  const name =
    props.variant === 'empty-game-slot'
      ? 'Open player slot'
      : props.identity.name.trim();
  const supportingText =
    props.variant === 'empty-game-slot'
      ? 'Invite someone to join'
      : props.identity.supportingText.trim();
  const accessibilityLabel =
    props.variant === 'list'
      ? `${name}, ${supportingText}, ${selected ? 'selected' : 'not selected'}`
      : props.variant === 'game-slot'
        ? `View ${name}, ${supportingText}`
        : empty
          ? 'Invite player to open slot'
          : `Invite ${name}, ${supportingText}`;
  const onPress =
    props.variant === 'list'
      ? () => props.onSelectedChange(!props.selected)
      : props.variant === 'game-slot'
        ? props.onViewPlayer
        : props.onInvite;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={props.variant === 'list' ? 'checkbox' : 'button'}
      accessibilityState={
        props.variant === 'list' ? { checked: selected } : undefined
      }
      disabled={disabled}
      onPress={onPress}
      minHeight="size80"
      size="controlHeight44"
      width="fill"
      testID="player-item"
    >
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.content, selected ? styles.selected : undefined]}
      >
        {props.variant === 'empty-game-slot' ? (
          <EmptyVisual />
        ) : (
          <IdentityVisual identity={props.identity} />
        )}
        <View style={styles.copy}>
          <Text numberOfLines={1} variant="bodyStrong">
            {name}
          </Text>
          <Text color="textSecondary" numberOfLines={1} variant="caption">
            {supportingText}
          </Text>
        </View>
        <View
          style={[styles.action, selected ? styles.selectedAction : undefined]}
        >
          <Icon
            name={
              selected
                ? 'check'
                : empty || props.variant === 'invite-result'
                  ? 'add'
                  : 'chevron'
            }
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.radiusFull,
    height: sizing.size40,
    justifyContent: 'center',
    width: sizing.size40,
  },
  content: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.radius16,
    borderWidth: borders.borderDefault,
    flexDirection: 'row',
    gap: spacing.space16,
    minHeight: sizing.size80,
    paddingHorizontal: spacing.space16,
    width: '100%',
  },
  copy: {
    flex: 1,
    gap: spacing.space4,
    minWidth: 0,
  },
  emptyAvatar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.radiusFull,
    height: sizing.size48,
    justifyContent: 'center',
    width: sizing.size48,
  },
  selected: {
    backgroundColor: colors.surfaceAccent,
    borderColor: colors.accent,
    borderWidth: borders.focusRingWidth,
  },
  selectedAction: { backgroundColor: colors.accent },
});
