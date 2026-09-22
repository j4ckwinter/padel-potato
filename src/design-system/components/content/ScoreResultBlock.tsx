import { StyleSheet, View } from 'react-native';

import { Text } from '../../primitives/Text';
import { colors } from '../../tokens';

export type ScoreResultTeam = Readonly<{
  initials: string;
  name: string;
  scores: readonly [string, string];
}>;

type ScoreTeams = readonly [ScoreResultTeam, ScoreResultTeam];
type ScoreResultState = 'won' | 'lost' | 'live';

type ScoreResultLayout =
  | Readonly<{ title?: never; type: 'compact' }>
  | Readonly<{ title: string; type: 'full' }>;
type ScoreResultStatus =
  | Readonly<{ liveNote?: never; state: 'won' | 'lost' }>
  | Readonly<{ liveNote: string; state: 'live' }>;

export type ScoreResultBlockProps = Readonly<{
  teams: ScoreTeams;
}> &
  ScoreResultLayout &
  ScoreResultStatus;

const supportedRuntimeProps = Object.freeze([
  'liveNote',
  'state',
  'teams',
  'title',
  'type',
] as const);
const supportedTeamProps = Object.freeze([
  'initials',
  'name',
  'scores',
] as const);
const supportedTuples = Object.freeze([
  'compact/won',
  'compact/lost',
  'compact/live',
  'full/won',
  'full/lost',
  'full/live',
] as const);
const nonFiniteScoreText = /^(?:[+-]?infinity|nan)$/iu;

function unsupported(reason: string): never {
  throw new Error(
    `Unsupported Score Result Block configuration: ${reason}. Supported configurations: ${supportedTuples.join(', ')}.`,
  );
}

function validateText(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    unsupported(`${field} must be non-empty text`);
  }
}

function validateTeam(value: unknown, index: number) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    unsupported(`team ${index + 1} must be a fixed team record`);
  }
  const team = value as Record<string, unknown>;
  if (
    !Object.keys(team).every((key) => supportedTeamProps.includes(key as never))
  ) {
    unsupported(`team ${index + 1} contains an unsupported property`);
  }
  validateText(team.initials, `team ${index + 1} initials`);
  validateText(team.name, `team ${index + 1} name`);
  if (!Array.isArray(team.scores) || team.scores.length !== 2) {
    unsupported(`team ${index + 1} requires exactly two score strings`);
  }
  team.scores.forEach((score, scoreIndex) => {
    validateText(score, `team ${index + 1} set ${scoreIndex + 1}`);
    if (nonFiniteScoreText.test(String(score).trim())) {
      unsupported(
        `team ${index + 1} set ${scoreIndex + 1} must be finite display text`,
      );
    }
  });
}

function validateScoreResultBlockProps(props: ScoreResultBlockProps) {
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

  const tuple = `${String(runtime.type)}/${String(runtime.state)}`;
  if (!supportedTuples.includes(tuple as (typeof supportedTuples)[number]))
    unsupported(tuple);
  if (!Array.isArray(runtime.teams) || runtime.teams.length !== 2) {
    unsupported('teams must contain exactly two ordered records');
  }
  runtime.teams.forEach(validateTeam);

  if (runtime.type === 'full') validateText(runtime.title, 'full title');
  if (
    runtime.type === 'compact' &&
    Object.prototype.hasOwnProperty.call(runtime, 'title')
  ) {
    unsupported('compact has no title branch');
  }
  if (runtime.state === 'live') validateText(runtime.liveNote, 'liveNote');
  if (
    runtime.state !== 'live' &&
    Object.prototype.hasOwnProperty.call(runtime, 'liveNote')
  ) {
    unsupported('won and lost branches have no live note');
  }
}

const statusLabel: Readonly<Record<ScoreResultState, string>> = {
  live: 'LIVE',
  lost: 'FINAL',
  won: 'YOU WON',
};

function aggregateLabel(props: ScoreResultBlockProps) {
  const winnerIndex =
    props.state === 'won' ? 0 : props.state === 'lost' ? 1 : null;
  const parts = [
    statusLabel[props.state],
    props.state === 'lost' ? 'lost' : null,
    props.type === 'full' ? props.title : null,
  ];
  props.teams.forEach((team, index) => {
    parts.push(
      team.name,
      `set 1 ${team.scores[0]}`,
      `set 2 ${team.scores[1]}`,
      winnerIndex === index ? 'winner' : null,
    );
  });
  if (props.state === 'live') parts.push(props.liveNote);
  return parts.filter(Boolean).join(', ');
}

function TeamRow({
  full,
  team,
  winner,
}: Readonly<{
  full: boolean;
  team: ScoreResultTeam;
  winner: boolean;
}>) {
  return (
    <View style={[styles.teamRow, winner ? styles.winner : null]}>
      {full ? <Text variant="micro">{team.initials}</Text> : null}
      <Text numberOfLines={1} style={styles.teamName} variant="label">
        {team.name}
      </Text>
      <Text variant="label">{team.scores[0]}</Text>
      <Text variant="label">{team.scores[1]}</Text>
    </View>
  );
}

export function ScoreResultBlock(props: ScoreResultBlockProps) {
  validateScoreResultBlockProps(props);
  const full = props.type === 'full';
  const winnerIndex =
    props.state === 'won' ? 0 : props.state === 'lost' ? 1 : null;

  return (
    <View
      accessible
      accessibilityLabel={aggregateLabel(props)}
      accessibilityRole="summary"
      style={[styles.block, full ? styles.full : styles.compact]}
      testID="score-result-block"
    >
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.content}
      >
        <Text
          color={props.state === 'live' ? 'olive' : 'textSecondary'}
          variant="micro"
        >
          {statusLabel[props.state]}
        </Text>
        {full ? <Text variant="heading">{props.title}</Text> : null}
        {full ? (
          <View style={styles.headerRow}>
            <View style={styles.teamName} />
            <Text color="muted" variant="micro">
              S1
            </Text>
            <Text color="muted" variant="micro">
              S2
            </Text>
          </View>
        ) : null}
        <TeamRow full={full} team={props.teams[0]} winner={winnerIndex === 0} />
        <TeamRow full={full} team={props.teams[1]} winner={winnerIndex === 1} />
        {props.state === 'live' ? (
          <Text color="textSecondary" variant="caption">
            {props.liveNote}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: 352,
  },
  compact: { height: 120 },
  content: { gap: 4 },
  full: { height: 176 },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  teamName: { flex: 1 },
  teamRow: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 16,
    minHeight: 24,
    paddingHorizontal: 4,
  },
  winner: { backgroundColor: colors.surfaceAccent },
});
