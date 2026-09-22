import { StyleSheet, View } from 'react-native';

import { Text } from '../../primitives/Text';
import { colors } from '../../tokens';
import { Button } from '../actions/Button';
import {
  NoGamesEmptyStateArtwork,
  NoNotificationsEmptyStateArtwork,
  NoPlayersEmptyStateArtwork,
} from '../../assets/artwork/feedbackArtwork';

export type EmptyStateProps =
  | Readonly<{ content: 'noGames'; onCreateGame: () => void }>
  | Readonly<{ content: 'noNotifications' }>
  | Readonly<{ content: 'noPlayers'; onInvitePlayers: () => void }>;

const supportedRuntimeProps = Object.freeze([
  'content',
  'onCreateGame',
  'onInvitePlayers',
] as const);
const supportedTuples = Object.freeze([
  'noPlayers/withAction',
  'noNotifications/noAction',
  'noGames/withAction',
] as const);
const approvedCopy = Object.freeze({
  noGames: Object.freeze({
    body: 'You don\u2019t have any games scheduled yet.',
    heading: 'No games',
  }),
  noNotifications: Object.freeze({
    body: 'You\u2019re all caught up. New updates will appear here.',
    heading: 'No notifications',
  }),
  noPlayers: Object.freeze({
    body: 'Invite friends to start building your padel group.',
    heading: 'No players',
  }),
});

function unsupported(reason: string): never {
  throw new Error(
    `Unsupported Empty State configuration: ${reason}. Supported configurations: ${supportedTuples.join(', ')}.`,
  );
}

function validateEmptyStateProps(props: EmptyStateProps) {
  const runtime = props as unknown as Record<string, unknown>;
  for (const key of Object.keys(runtime)) {
    if (!supportedRuntimeProps.includes(key as (typeof supportedRuntimeProps)[number])) {
      unsupported(`unsupported property ${key}`);
    }
  }
  if (!Object.hasOwn(approvedCopy, String(runtime.content))) {
    unsupported(`unknown content ${String(runtime.content)}`);
  }
  const callbackKey = runtime.content === 'noGames'
    ? 'onCreateGame'
    : runtime.content === 'noPlayers'
      ? 'onInvitePlayers'
      : undefined;
  if (callbackKey && typeof runtime[callbackKey] !== 'function') {
    unsupported(`${callbackKey} must be a function for ${String(runtime.content)}`);
  }
  for (const key of ['onCreateGame', 'onInvitePlayers'] as const) {
    if (key !== callbackKey && typeof runtime[key] !== 'undefined') {
      unsupported(`${key} is not available for ${String(runtime.content)}`);
    }
  }
}

function Artwork({ content }: Pick<EmptyStateProps, 'content'>) {
  switch (content) {
    case 'noGames': return <NoGamesEmptyStateArtwork />;
    case 'noNotifications': return <NoNotificationsEmptyStateArtwork />;
    case 'noPlayers': return <NoPlayersEmptyStateArtwork />;
  }
}

export function EmptyState(props: EmptyStateProps) {
  validateEmptyStateProps(props);
  const copy = approvedCopy[props.content];
  return (
    <View style={styles.root} testID="empty-state">
      <Text style={styles.copy} variant="heading">{copy.heading}</Text>
      <Text color="textSecondary" style={styles.copy} variant="body">{copy.body}</Text>
      <Artwork content={props.content} />
      {props.content === 'noGames' ? (
        <Button label="Create game" onPress={props.onCreateGame} size={40} style="primary" />
      ) : props.content === 'noPlayers' ? (
        <Button label="Invite players" onPress={props.onInvitePlayers} size={40} style="primary" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  copy: { maxWidth: 288, textAlign: 'center' },
  root: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    gap: 4,
    justifyContent: 'center',
    minHeight: 220,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: 352,
  },
});
