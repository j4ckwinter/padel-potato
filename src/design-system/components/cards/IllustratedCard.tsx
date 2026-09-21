import { StyleSheet, View } from 'react-native';

import { Pressable } from '../../primitives/Pressable';
import { Text } from '../../primitives/Text';
import { colors } from '../../tokens';
import {
  GameCreatedIllustratedCardArtwork,
  InvitePlayersIllustratedCardArtwork,
  MatchResultIllustratedCardArtwork,
  NextGameIllustratedCardArtwork,
} from '../generated/phase4Artwork';

export type IllustratedCardParticipant = Readonly<{
  initials: string;
  name: string;
  slot: 1 | 2 | 3 | 4;
}>;

type TwoParticipants = readonly [IllustratedCardParticipant, IllustratedCardParticipant];
type FourParticipants = readonly [
  IllustratedCardParticipant,
  IllustratedCardParticipant,
  IllustratedCardParticipant,
  IllustratedCardParticipant,
];
type Content = Readonly<{
  detailPrimary: string;
  detailSecondary: string;
  eyebrow: string;
  title: string;
}>;

export type IllustratedCardProps = Content & (
  | Readonly<{ onViewGame: () => void; participants: FourParticipants; type: 'nextGame' }>
  | Readonly<{ onViewResults: () => void; participants: FourParticipants; type: 'matchResult' }>
  | Readonly<{ onInvitePlayers: () => void; participants: TwoParticipants; type: 'invitePlayers' }>
  | Readonly<{ onShareGame: () => void; participants: TwoParticipants; type: 'gameCreated' }>
);

const supportedRuntimeProps = Object.freeze([
  'detailPrimary',
  'detailSecondary',
  'eyebrow',
  'onInvitePlayers',
  'onShareGame',
  'onViewGame',
  'onViewResults',
  'participants',
  'title',
  'type',
] as const);
const supportedTypes = Object.freeze([
  'gameCreated',
  'invitePlayers',
  'matchResult',
  'nextGame',
] as const);
const supportedTuples = Object.freeze([
  'gameCreated/default',
  'invitePlayers/default',
  'matchResult/default',
  'nextGame/default',
] as const);

function unsupported(reason: string): never {
  throw new Error(
    `Unsupported Illustrated Card configuration: ${reason}. Supported configurations: ${supportedTuples.join(', ')}.`,
  );
}

function validateText(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    unsupported(`${field} must be non-empty text`);
  }
}

function validateInitials(value: unknown, field: string) {
  if (
    typeof value !== 'string'
    || value.trim().length < 1
    || Array.from(value.trim()).length > 3
  ) {
    unsupported(`${field} must contain one to three visible characters`);
  }
}

function validateIllustratedCardProps(props: IllustratedCardProps) {
  const runtime = props as unknown as Record<string, unknown>;
  for (const key of Object.keys(runtime)) {
    if (!supportedRuntimeProps.includes(key as (typeof supportedRuntimeProps)[number])) {
      unsupported(`unsupported property ${key}`);
    }
  }
  if (!supportedTypes.includes(runtime.type as IllustratedCardProps['type'])) {
    unsupported(`unknown type ${String(runtime.type)}`);
  }
  for (const field of ['detailPrimary', 'detailSecondary', 'eyebrow', 'title'] as const) {
    validateText(runtime[field], field);
  }

  const expectedSlots = runtime.type === 'nextGame' || runtime.type === 'matchResult'
    ? [1, 2, 3, 4]
    : [1, 2];
  if (!Array.isArray(runtime.participants) || runtime.participants.length !== expectedSlots.length) {
    unsupported(`${String(runtime.type)} participants must occupy slots ${expectedSlots.join(', ')}`);
  }
  (runtime.participants as unknown[]).forEach((value, index) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      unsupported(`participant ${index + 1} must be an object`);
    }
    const participant = value as Record<string, unknown>;
    const keys = Object.keys(participant);
    if (keys.length !== 3 || !['initials', 'name', 'slot'].every((key) => keys.includes(key))) {
      unsupported(`participant ${index + 1} must contain only initials, name, and slot`);
    }
    validateInitials(participant.initials, `participant ${index + 1} initials`);
    validateText(participant.name, `participant ${index + 1} name`);
    if (participant.slot !== expectedSlots[index]) {
      unsupported(`participant order must occupy slots ${expectedSlots.join(', ')}`);
    }
  });

  const callbackKey = runtime.type === 'nextGame'
    ? 'onViewGame'
    : runtime.type === 'matchResult'
      ? 'onViewResults'
      : runtime.type === 'invitePlayers'
        ? 'onInvitePlayers'
        : 'onShareGame';
  if (typeof runtime[callbackKey] !== 'function') {
    unsupported(`${callbackKey} must be a function for ${String(runtime.type)}`);
  }
  for (const key of ['onInvitePlayers', 'onShareGame', 'onViewGame', 'onViewResults'] as const) {
    if (key !== callbackKey && typeof runtime[key] !== 'undefined') {
      unsupported(`${key} is not available for ${String(runtime.type)}`);
    }
  }
}

function Artwork({ type }: Pick<IllustratedCardProps, 'type'>) {
  switch (type) {
    case 'gameCreated': return <GameCreatedIllustratedCardArtwork />;
    case 'invitePlayers': return <InvitePlayersIllustratedCardArtwork />;
    case 'matchResult': return <MatchResultIllustratedCardArtwork />;
    case 'nextGame': return <NextGameIllustratedCardArtwork />;
  }
}

function CardAction({
  accessibilityLabel,
  onPress,
  visibleLabel,
}: Readonly<{ accessibilityLabel: string; onPress: () => void; visibleLabel: string }>) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
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

function ParticipantSummary({ participants }: Readonly<{
  participants: readonly IllustratedCardParticipant[];
}>) {
  return (
    <View
      accessibilityLabel={`Players: ${participants.map(({ name }) => name.trim()).join(', ')}`}
      accessible
    >
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.participants}
        testID="illustrated-card-participant-decoration"
      >
        {participants.map(({ initials, slot }) => (
          <View key={slot} style={styles.participant}>
            <Text variant="caption">{initials.trim()}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function IllustratedCard(props: IllustratedCardProps) {
  validateIllustratedCardProps(props);
  const nextGame = props.type === 'nextGame';
  const action = props.type === 'nextGame'
    ? { label: 'View game', onPress: props.onViewGame, visible: 'View' }
    : props.type === 'matchResult'
      ? { label: 'View results', onPress: props.onViewResults, visible: 'Results' }
      : props.type === 'invitePlayers'
        ? { label: 'Invite players', onPress: props.onInvitePlayers, visible: 'Invite' }
        : { label: 'Share game', onPress: props.onShareGame, visible: 'Share' };

  return (
    <View style={[styles.root, nextGame ? styles.nextGame : undefined]} testID="illustrated-card">
      <View style={styles.copy}>
        <Text color={nextGame ? 'accent' : 'textSecondary'} variant="label">
          {props.eyebrow.trim()}
        </Text>
        <Text color={nextGame ? 'surface' : 'ink'} variant="heading">{props.title.trim()}</Text>
        <Text color={nextGame ? 'surface' : 'textSecondary'} variant="body">
          {props.detailPrimary.trim()}
        </Text>
        <Text color={nextGame ? 'surface' : 'textSecondary'} variant="body">
          {props.detailSecondary.trim()}
        </Text>
      </View>
      <View style={styles.artwork}><Artwork type={props.type} /></View>
      <View style={styles.footer}>
        <ParticipantSummary participants={props.participants} />
        <CardAction
          accessibilityLabel={action.label}
          onPress={action.onPress}
          visibleLabel={action.visible}
        />
      </View>
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
  artwork: { position: 'absolute', right: 16, top: 16 },
  copy: { gap: 4, maxWidth: 224 },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  nextGame: { backgroundColor: colors.deep, borderWidth: 0 },
  participant: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    height: 32,
    justifyContent: 'center',
    marginRight: -8,
    width: 32,
  },
  participants: { flexDirection: 'row', paddingRight: 8 },
  root: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'space-between',
    minHeight: 176,
    padding: 16,
    width: 352,
  },
});
