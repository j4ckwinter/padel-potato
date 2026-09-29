import type { ImageSourcePropType } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { Pressable } from '../../primitives/Pressable';
import { Text } from '../../primitives/Text';
import { colors, radii, sizing, spacing } from '../../tokens';
import {
  GameCreatedIllustratedCardArtwork,
  InvitePlayersIllustratedCardArtwork,
  MatchResultIllustratedCardArtwork,
  NextGameIllustratedCardArtwork,
} from '../../assets/artwork/feedbackArtwork';
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

type Solo = readonly [GameCardParticipant];
type Pair = readonly [GameCardParticipant, GameCardParticipant];
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
type PartialGroup = Solo | Pair | Trio;

type FullContent = Readonly<{
  time: string;
  title: string;
  venue: string;
}>;

type IllustratedContent = Readonly<{
  detailPrimary: string;
  detailSecondary: string;
  eyebrow: string;
  title: string;
  variant: 'illustrated';
}>;

export type GameCardIllustration =
  'gameCreated' | 'invitePlayers' | 'matchResult' | 'nextGame';

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
        participants: PartialGroup;
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
      }>)
  | (IllustratedContent &
      Readonly<{
        illustration: 'nextGame';
        onViewGame: () => void;
        participants: Quartet;
      }>)
  | (IllustratedContent &
      Readonly<{
        illustration: 'matchResult';
        onViewResults: () => void;
        participants: Quartet;
      }>)
  | (IllustratedContent &
      Readonly<{
        illustration: 'invitePlayers';
        onInvitePlayers: () => void;
        participants: Pair;
      }>)
  | (IllustratedContent &
      Readonly<{
        illustration: 'gameCreated';
        onShareGame: () => void;
        participants: Pair;
      }>);

const supportedRuntimeProps = Object.freeze([
  'full',
  'detailPrimary',
  'detailSecondary',
  'eyebrow',
  'illustration',
  'onInvitePlayers',
  'onShareGame',
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
  'illustrated/gameCreated',
  'illustrated/invitePlayers',
  'illustrated/matchResult',
  'illustrated/nextGame',
] as const);

const supportedIllustrations = Object.freeze([
  'gameCreated',
  'invitePlayers',
  'matchResult',
  'nextGame',
] as const satisfies readonly GameCardIllustration[]);

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

function validateParticipants(value: unknown, expected: 2 | 3 | 4) {
  if (!Array.isArray(value) || value.length !== expected) {
    unsupported(
      `participant collection must contain exactly ${expected} ordered identities`,
    );
  }
  value.forEach(validateParticipant);
}

function validatePartialParticipants(value: unknown) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 3) {
    unsupported(
      'open participant collection must contain one to three ordered identities',
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

  if (runtime.variant === 'illustrated') {
    if (
      !supportedIllustrations.includes(
        runtime.illustration as GameCardIllustration,
      )
    ) {
      unsupported(`unknown illustration ${String(runtime.illustration)}`);
    }
    validateText(runtime.detailPrimary, 'detailPrimary');
    validateText(runtime.detailSecondary, 'detailSecondary');
    validateText(runtime.eyebrow, 'eyebrow');

    const expectedParticipants =
      runtime.illustration === 'nextGame' ||
      runtime.illustration === 'matchResult'
        ? 4
        : 2;
    validateParticipants(runtime.participants, expectedParticipants);

    const callbackKey =
      runtime.illustration === 'nextGame'
        ? 'onViewGame'
        : runtime.illustration === 'matchResult'
          ? 'onViewResults'
          : runtime.illustration === 'invitePlayers'
            ? 'onInvitePlayers'
            : 'onShareGame';
    if (typeof runtime[callbackKey] !== 'function') {
      unsupported(
        `${callbackKey} must be a function for ${String(runtime.illustration)}`,
      );
    }
    const allowedKeys = [
      'detailPrimary',
      'detailSecondary',
      'eyebrow',
      'illustration',
      callbackKey,
      'participants',
      'title',
      'variant',
    ];
    if (Object.keys(runtime).some((key) => !allowedKeys.includes(key))) {
      unsupported(
        `illustrated/${String(runtime.illustration)} contains an unsupported callback or property`,
      );
    }
    return;
  }

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
    if (runtime.full) validateParticipants(runtime.participants, 4);
    else validatePartialParticipants(runtime.participants);
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
  label: 'Invite players' | 'Share game' | 'View game' | 'View results';
  onPress: () => void;
  visibleLabel: 'Invite' | 'Results' | 'Share' | 'View';
}>) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      size="controlHeight44"
      width="size72"
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

function ParticipantGroup({
  participants,
}: Readonly<{ participants: PartialGroup | Quartet }>) {
  if (participants.length === 1) {
    return (
      <AvatarGroup
        identities={[asAvatarIdentity(participants[0])]}
        variant="partial"
      />
    );
  }
  if (participants.length === 2) {
    return (
      <AvatarGroup
        identities={[
          asAvatarIdentity(participants[0]),
          asAvatarIdentity(participants[1]),
        ]}
        variant="partial"
      />
    );
  }
  if (participants.length === 3) {
    return (
      <AvatarGroup
        identities={[
          asAvatarIdentity(participants[0]),
          asAvatarIdentity(participants[1]),
          asAvatarIdentity(participants[2]),
        ]}
        variant="partial"
      />
    );
  }
  return (
    <AvatarGroup
      identities={[
        asAvatarIdentity(participants[0]),
        asAvatarIdentity(participants[1]),
        asAvatarIdentity(participants[2]),
        asAvatarIdentity(participants[3]),
      ]}
      variant="4-players"
    />
  );
}

function Artwork({
  illustration,
}: Readonly<{ illustration: GameCardIllustration }>) {
  switch (illustration) {
    case 'gameCreated':
      return <GameCreatedIllustratedCardArtwork />;
    case 'invitePlayers':
      return <InvitePlayersIllustratedCardArtwork />;
    case 'matchResult':
      return <MatchResultIllustratedCardArtwork />;
    case 'nextGame':
      return <NextGameIllustratedCardArtwork />;
  }
}

function Action({
  props,
}: Readonly<{ props: Exclude<GameCardProps, { variant: 'compact' }> }>) {
  if (props.variant === 'completed') {
    return (
      <CardAction
        label="View results"
        onPress={props.onViewResults}
        visibleLabel="Results"
      />
    );
  }
  if (props.variant === 'illustrated') {
    switch (props.illustration) {
      case 'gameCreated':
        return (
          <CardAction
            label="Share game"
            onPress={props.onShareGame}
            visibleLabel="Share"
          />
        );
      case 'invitePlayers':
        return (
          <CardAction
            label="Invite players"
            onPress={props.onInvitePlayers}
            visibleLabel="Invite"
          />
        );
      case 'matchResult':
        return (
          <CardAction
            label="View results"
            onPress={props.onViewResults}
            visibleLabel="Results"
          />
        );
      case 'nextGame':
        return (
          <CardAction
            label="View game"
            onPress={props.onViewGame}
            visibleLabel="View"
          />
        );
    }
  }
  return (
    <CardAction
      label="View game"
      onPress={props.onViewGame}
      visibleLabel="View"
    />
  );
}

export function GameCard(props: GameCardProps) {
  validateGameCardProps(props);

  const compact = props.variant === 'compact';
  const illustrated = props.variant === 'illustrated';
  const deep =
    props.variant === 'next' ||
    (illustrated && props.illustration === 'nextGame');
  const status = illustrated
    ? props.eyebrow
    : props.variant === 'next'
      ? 'Your next game'
      : props.variant === 'completed'
        ? 'Completed'
        : 'Open game';
  const primaryDetail = illustrated ? props.detailPrimary : props.venue;

  return (
    <View
      style={[
        styles.card,
        compact ? styles.compact : styles.full,
        deep ? styles.next : undefined,
      ]}
      testID="game-card"
    >
      <Text color={deep ? 'surfaceAccent' : 'textSecondary'} variant="label">
        {status}
      </Text>
      <Text
        color={deep ? 'surface' : 'ink'}
        numberOfLines={1}
        variant="heading"
      >
        {props.title.trim()}
      </Text>
      <Text
        color={deep ? 'surface' : 'textSecondary'}
        numberOfLines={1}
        variant="body"
      >
        {primaryDetail.trim()}
      </Text>
      {!compact ? (
        <>
          <Text color={deep ? 'surface' : 'textSecondary'} variant="body">
            {(illustrated ? props.detailSecondary : props.time).trim()}
          </Text>
          {illustrated ? (
            <View
              accessible={false}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={styles.artwork}
            >
              <Artwork illustration={props.illustration} />
            </View>
          ) : null}
          <View style={styles.footer}>
            <ParticipantGroup participants={props.participants} />
            <Action props={props} />
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actionVisual: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radii.radiusFull,
    height: sizing.size40,
    justifyContent: 'center',
    width: sizing.size72,
  },
  artwork: {
    position: 'absolute',
    right: spacing.space16,
    top: spacing.space16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.radius20,
    gap: spacing.space4,
    padding: spacing.space16,
    width: '100%',
  },
  compact: { minHeight: sizing.size112 },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.space4,
  },
  full: { minHeight: sizing.size112 + sizing.size64 },
  next: { backgroundColor: colors.deep },
});
