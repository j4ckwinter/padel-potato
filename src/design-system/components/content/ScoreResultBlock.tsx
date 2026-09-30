import { StyleSheet, View } from 'react-native';

import { Text } from '../../primitives/Text';
import { borders, colors, radii, sizing, spacing } from '../../tokens';

type ScoreResultTeamContent = Readonly<{
  initials: string;
  name: string;
}>;

type TwoSetScoreResultTeam = ScoreResultTeamContent &
  Readonly<{ scores: readonly [string, string] }>;
type ThreeSetScoreResultTeam = ScoreResultTeamContent &
  Readonly<{ scores: readonly [string, string, string] }>;
export type ScoreResultTeam = TwoSetScoreResultTeam | ThreeSetScoreResultTeam;

type ScoreTeams =
  | readonly [TwoSetScoreResultTeam, TwoSetScoreResultTeam]
  | readonly [ThreeSetScoreResultTeam, ThreeSetScoreResultTeam];
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

function validateTeam(value: unknown, index: number): 2 | 3 {
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
  if (
    !Array.isArray(team.scores) ||
    (team.scores.length !== 2 && team.scores.length !== 3)
  ) {
    unsupported(`team ${index + 1} requires two or three score strings`);
  }
  team.scores.forEach((score, scoreIndex) => {
    validateText(score, `team ${index + 1} set ${scoreIndex + 1}`);
    if (nonFiniteScoreText.test(String(score).trim())) {
      unsupported(
        `team ${index + 1} set ${scoreIndex + 1} must be finite display text`,
      );
    }
  });
  return team.scores.length === 2 ? 2 : 3;
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
  const scoreCounts = runtime.teams.map(validateTeam);
  if (scoreCounts[0] !== scoreCounts[1]) {
    unsupported('both teams must contain the same number of scores');
  }

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
    parts.push(team.name);
    team.scores.forEach((score, scoreIndex) => {
      parts.push(`set ${scoreIndex + 1} ${score}`);
    });
    parts.push(winnerIndex === index ? 'winner' : null);
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
      {team.scores.map((score, scoreIndex) => (
        <Text key={`set-${scoreIndex + 1}`} variant="label">
          {score}
        </Text>
      ))}
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
            {props.teams[0].scores.map((_score, scoreIndex) => (
              <Text color="muted" key={`set-${scoreIndex + 1}`} variant="micro">
                S{scoreIndex + 1}
              </Text>
            ))}
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
    borderRadius: radii.radius20,
    borderWidth: borders.borderDefault,
    paddingHorizontal: spacing.space16,
    paddingVertical: spacing.space12,
    width: '100%',
  },
  compact: { minHeight: sizing.size112 + spacing.space8 },
  content: { gap: spacing.space4 },
  full: { minHeight: sizing.size112 + sizing.size64 },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.space16,
  },
  teamName: { flex: 1 },
  teamRow: {
    alignItems: 'center',
    borderRadius: radii.radius8,
    flexDirection: 'row',
    gap: spacing.space16,
    minHeight: sizing.size24,
    paddingHorizontal: spacing.space4,
  },
  winner: { backgroundColor: colors.surfaceAccent },
});
