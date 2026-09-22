import type { ImageSourcePropType } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { Pressable } from '../../primitives/Pressable';
import { Text } from '../../primitives/Text';
import { colors } from '../../tokens';
import { AvatarGroup, type AvatarGroupIdentity } from '../identity/AvatarGroup';
import { isLocalImageSource } from '../../internal/validation';

type ParticipantBase = Readonly<{
  name: string;
  presence: 'online';
  slot: 1 | 2 | 3 | 4;
}>;

type InitialsParticipant = ParticipantBase &
  Readonly<{
    initials: string;
    source?: never;
  }>;

type PhotoParticipant = ParticipantBase &
  Readonly<{
    initials?: never;
    source: ImageSourcePropType;
  }>;

export type GameCardParticipant = InitialsParticipant | PhotoParticipant;

type Trio = readonly [
  GameCardParticipant,
  GameCardParticipant,
  GameCardParticipant,
];
type Quartet = readonly [
  GameCardParticipant,
  GameCardParticipant,
  GameCardParticipant,
  GameCardParticipant,
];

type FullContent = Readonly<{
  time: string;
  title: string;
  venue: string;
}>;

export type GameCardProps =
  | (FullContent &
      Readonly<{
        onViewGame: () => void;
        participants: Quartet;
        variant: 'next';
      }>)
  | (FullContent &
      Readonly<{
        full: false;
        onViewGame: () => void;
        participants: Trio;
        variant: 'open';
      }>)
  | (FullContent &
      Readonly<{
        full: true;
        onViewGame: () => void;
        participants: Quartet;
        variant: 'open';
      }>)
  | Readonly<{
      title: string;
      venue: string;
      variant: 'compact';
    }>
  | (FullContent &
      Readonly<{
        onViewResults: () => void;
        participants: Quartet;
        variant: 'completed';
      }>);

const supportedRuntimeProps = Object.freeze([
  'full',
  'onViewGame',
  'onViewResults',
  'participants',
  'time',
  'title',
  'variant',
  'venue',
] as const);
const supportedTuples = Object.freeze([
  'next/default',
  'open/default',
  'compact/default',
  'completed/default',
  'open/full',
] as const);

function unsupported(reason: string): never {
  throw new Error(
    `Unsupported Game Card configuration: ${reason}. Supported configurations: ${supportedTuples.join(', ')}.`,
  );
}

function validateText(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    unsupported(`${field} must be non-empty text`);
  }
}

function validateParticipant(
  value: unknown,
  index: number,
): asserts value is GameCardParticipant {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    unsupported(`participant ${index + 1} must be an identity`);
  }
  const participant = value as Record<string, unknown>;
  if (
    Object.keys(participant).some(
      (key) =>
        !['initials', 'name', 'presence', 'slot', 'source'].includes(key),
    )
  ) {
    unsupported(`participant ${index + 1} contains an unsupported property`);
  }
  validateText(participant.name, `participant ${index + 1} name`);
  if (participant.presence !== 'online') {
    unsupported(
      `participant ${index + 1} must use the authored 40/online Avatar tuple`,
    );
  }
  if (participant.slot !== index + 1) {
    unsupported(
      `participant ${index + 1} must retain source slot ${index + 1}`,
    );
  }
  const hasInitials = Object.prototype.hasOwnProperty.call(
    participant,
    'initials',
  );
  const hasSource = Object.prototype.hasOwnProperty.call(participant, 'source');
  if (hasInitials === hasSource)
    unsupported(`participant ${index + 1} requires exactly one visual source`);
  if (
    hasInitials &&
    (typeof participant.initials !== 'string' ||
      participant.initials.trim().length < 1 ||
      participant.initials.trim().length > 3)
  )
    unsupported(
      `participant ${index + 1} initials must contain one to three characters`,
    );
  if (hasSource && !isLocalImageSource(participant.source)) {
    unsupported(`participant ${index + 1} source must be bundled or local`);
  }
}

function validateParticipants(value: unknown, expected: 3 | 4) {
  if (!Array.isArray(value) || value.length !== expected) {
    unsupported(
      `participant collection must contain exactly ${expected} ordered identities`,
    );
  }
  value.forEach(validateParticipant);
}

function validateGameCardProps(props: GameCardProps) {
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
  validateText(runtime.title, 'title');
  validateText(runtime.venue, 'venue');

  if (runtime.variant === 'compact') {
    if (
      Object.keys(runtime).some(
        (key) => !['title', 'variant', 'venue'].includes(key),
      )
    ) {
      unsupported(
        'compact/default cannot expose time, participants, or an action',
      );
    }
    return;
  }

  validateText(runtime.time, 'time');

  if (runtime.variant === 'next') {
    validateParticipants(runtime.participants, 4);
    if (typeof runtime.onViewGame !== 'function')
      unsupported('next/default requires onViewGame');
    if (
      Object.keys(runtime).some(
        (key) =>
          ![
            'onViewGame',
            'participants',
            'time',
            'title',
            'variant',
            'venue',
          ].includes(key),
      )
    ) {
      unsupported('next/default contains an unsupported callback or property');
    }
    return;
  }

  if (runtime.variant === 'open') {
    if (typeof runtime.full !== 'boolean')
      unsupported('open requires explicit full state');
    validateParticipants(runtime.participants, runtime.full ? 4 : 3);
    if (typeof runtime.onViewGame !== 'function')
      unsupported('open requires onViewGame');
    if (
      Object.keys(runtime).some(
        (key) =>
          ![
            'full',
            'onViewGame',
            'participants',
            'time',
            'title',
            'variant',
            'venue',
          ].includes(key),
      )
    ) {
      unsupported('open contains an unsupported callback or property');
    }
    return;
  }

  if (runtime.variant === 'completed') {
    validateParticipants(runtime.participants, 4);
    if (typeof runtime.onViewResults !== 'function')
      unsupported('completed/default requires onViewResults');
    if (
      Object.keys(runtime).some(
        (key) =>
          ![
            'onViewResults',
            'participants',
            'time',
            'title',
            'variant',
            'venue',
          ].includes(key),
      )
    ) {
      unsupported(
        'completed/default contains an unsupported callback or property',
      );
    }
    return;
  }

  unsupported(`unknown variant ${String(runtime.variant)}`);
}

function asAvatarIdentity(
  participant: GameCardParticipant,
): AvatarGroupIdentity {
  return 'source' in participant && participant.source !== undefined
    ? { name: participant.name, presence: 'online', source: participant.source }
    : {
        initials: participant.initials,
        name: participant.name,
        presence: 'online',
      };
}

function CardAction({
  label,
  onPress,
  visibleLabel,
}: Readonly<{
  label: 'View game' | 'View results';
  onPress: () => void;
  visibleLabel: 'View' | 'Results';
}>) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      size="controlHeight44"
      style={styles.actionTarget}
    >
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.actionVisual}
      >
        <Text variant="label">{visibleLabel}</Text>
      </View>
    </Pressable>
  );
}

export function GameCard(props: GameCardProps) {
  validateGameCardProps(props);

  const compact = props.variant === 'compact';
  const next = props.variant === 'next';
  const status = next
    ? 'Your next game'
    : props.variant === 'completed'
      ? 'Completed'
      : 'Open game';

  return (
    <View
      style={[
        styles.card,
        compact ? styles.compact : styles.full,
        next ? styles.next : undefined,
      ]}
      testID="game-card"
    >
      <Text color={next ? 'surfaceAccent' : 'textSecondary'} variant="label">
        {status}
      </Text>
      <Text
        color={next ? 'surface' : 'ink'}
        numberOfLines={1}
        variant="heading"
      >
        {props.title.trim()}
      </Text>
      <Text
        color={next ? 'surface' : 'textSecondary'}
        numberOfLines={1}
        variant="body"
      >
        {props.venue.trim()}
      </Text>
      {!compact ? (
        <>
          <Text color={next ? 'surface' : 'textSecondary'} variant="body">
            {props.time.trim()}
          </Text>
          <View style={styles.footer}>
            {props.participants.length === 3 ? (
              <AvatarGroup
                identities={
                  props.participants.map(
                    asAvatarIdentity,
                  ) as unknown as readonly [
                    AvatarGroupIdentity,
                    AvatarGroupIdentity,
                    AvatarGroupIdentity,
                  ]
                }
                variant="3-players"
              />
            ) : (
              <AvatarGroup
                identities={
                  props.participants.map(
                    asAvatarIdentity,
                  ) as unknown as readonly [
                    AvatarGroupIdentity,
                    AvatarGroupIdentity,
                    AvatarGroupIdentity,
                    AvatarGroupIdentity,
                  ]
                }
                variant="4-players"
              />
            )}
            {props.variant === 'completed' ? (
              <CardAction
                label="View results"
                onPress={props.onViewResults}
                visibleLabel="Results"
              />
            ) : (
              <CardAction
                label="View game"
                onPress={props.onViewGame}
                visibleLabel="View"
              />
            )}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actionTarget: { height: 44, width: 72 },
  actionVisual: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 72,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    gap: 4,
    padding: 16,
    width: 352,
  },
  compact: { height: 112 },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  full: { height: 176 },
  next: { backgroundColor: colors.deep },
});
