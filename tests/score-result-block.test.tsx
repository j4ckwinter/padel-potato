import { describe, expect, it, jest } from '@jest/globals';

import { flattenedStyle, invalidProps } from './helpers/componentTest';

import { render } from '@testing-library/react-native';

import ScoreResultBlockStories, {
  Boundaries as ScoreResultBlockBoundaries,
  Canonical as ScoreResultBlockCanonical,
  Interactive as ScoreResultBlockInteractive,
  States as ScoreResultBlockStates,
  Variants as ScoreResultBlockVariants,
} from '../src/design-system/components/content/ScoreResultBlock.stories';

import {
  ScoreResultBlock,
  type ScoreResultBlockProps,
  type ScoreResultTeam,
} from '../src/design-system/components/content/ScoreResultBlock';

const scoreTeams = [
  { initials: 'AM', name: 'Alex & Jamie', scores: ['6', '6'] },
  { initials: 'RB', name: 'Riley & Sam', scores: ['4', '3'] },
] as const satisfies readonly [ScoreResultTeam, ScoreResultTeam];

describe('Score Result Block public contract', () => {});

describe('Score Result Block runtime and semantic contract', () => {
  it.each([
    ['compact/won', { state: 'won', teams: scoreTeams, type: 'compact' }],
    ['compact/lost', { state: 'lost', teams: scoreTeams, type: 'compact' }],
    [
      'compact/live',
      {
        liveNote: 'Set 2 in progress',
        state: 'live',
        teams: scoreTeams,
        type: 'compact',
      },
    ],
    [
      'full/won',
      {
        state: 'won',
        teams: scoreTeams,
        title: 'Tuesday Social Padel',
        type: 'full',
      },
    ],
    [
      'full/lost',
      {
        state: 'lost',
        teams: scoreTeams,
        title: 'Tuesday Social Padel',
        type: 'full',
      },
    ],
    [
      'full/live',
      {
        liveNote: 'Set 2 in progress',
        state: 'live',
        teams: scoreTeams,
        title: 'Tuesday Social Padel',
        type: 'full',
      },
    ],
  ] as [string, ScoreResultBlockProps][])(
    'renders the authored %s branch',
    async (_tuple, props) => {
      const screen = await render(<ScoreResultBlock {...props} />);
      expect(
        flattenedStyle(screen.getByTestId('score-result-block').props.style),
      ).toEqual(
        expect.objectContaining({
          minHeight: props.type === 'full' ? 176 : 120,
          width: '100%',
        }),
      );
    },
  );

  it('announces explicit won state, fixed team/set order, and winner without colour-only meaning', async () => {
    const screen = await render(
      <ScoreResultBlock
        state="won"
        teams={scoreTeams}
        title="Tuesday Social Padel"
        type="full"
      />,
    );
    expect(
      screen.getByRole('summary', {
        name: 'YOU WON, Tuesday Social Padel, Alex & Jamie, set 1 6, set 2 6, winner, Riley & Sam, set 1 4, set 2 3',
      }),
    ).toBeTruthy();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('preserves live state and note without owning a timer', async () => {
    const intervalSpy = jest.spyOn(global, 'setInterval');
    const screen = await render(
      <ScoreResultBlock
        liveNote="Set 2 in progress"
        state="live"
        teams={scoreTeams}
        type="compact"
      />,
    );
    expect(
      screen.getByRole('summary', {
        name: 'LIVE, Alex & Jamie, set 1 6, set 2 6, Riley & Sam, set 1 4, set 2 3, Set 2 in progress',
      }),
    ).toBeTruthy();
    expect(intervalSpy).not.toHaveBeenCalled();
    intervalSpy.mockRestore();
  });

  it.each([
    { state: 'won', teams: [scoreTeams[0]], type: 'compact' },
    { state: 'won', teams: [...scoreTeams, scoreTeams[0]], type: 'compact' },
    {
      state: 'won',
      teams: [{ ...scoreTeams[0], name: '' }, scoreTeams[1]],
      type: 'compact',
    },
    {
      state: 'won',
      teams: [{ ...scoreTeams[0], scores: ['6'] }, scoreTeams[1]],
      type: 'compact',
    },
    {
      state: 'won',
      teams: [{ ...scoreTeams[0], scores: ['6', 'NaN'] }, scoreTeams[1]],
      type: 'compact',
    },
    {
      state: 'won',
      teams: [
        { ...scoreTeams[0], scores: ['6', Number.POSITIVE_INFINITY] },
        scoreTeams[1],
      ],
      type: 'compact',
    },
    {
      liveNote: 'Set 2 in progress',
      state: 'won',
      teams: scoreTeams,
      type: 'compact',
    },
    { state: 'live', teams: scoreTeams, type: 'compact' },
    { state: 'lost', teams: scoreTeams, title: 'Unexpected', type: 'compact' },
    { state: 'won', teams: scoreTeams, type: 'full' },
    { state: 'won', teams: scoreTeams, type: 'unknown' },
    { onPress: jest.fn(), state: 'won', teams: scoreTeams, type: 'compact' },
  ])(
    'rejects malformed fixed structures, non-finite values, and branch contradictions %#',
    (props) => {
      expect(() => ScoreResultBlock(invalidProps(props))).toThrow(
        /Unsupported Score Result Block/u,
      );
    },
  );

  it('keeps caller-formatted score precision textual and stable in aggregate order', async () => {
    const preciseTeams = [
      {
        initials: 'ŁN',
        name: 'Łucía Nguyễn & 東京',
        scores: ['6.000', '0006'],
      },
      {
        initials: 'RS',
        name: 'Riley & Sam with a very long team name',
        scores: ['04', '3.0'],
      },
    ] as const satisfies readonly [ScoreResultTeam, ScoreResultTeam];
    const screen = await render(
      <ScoreResultBlock state="won" teams={preciseTeams} type="compact" />,
    );
    expect(
      screen.getByRole('summary', {
        name: 'YOU WON, Łucía Nguyễn & 東京, set 1 6.000, set 2 0006, winner, Riley & Sam with a very long team name, set 1 04, set 2 3.0',
      }),
    ).toBeTruthy();
  });
});

describe('Score Result Block Storybook contract', () => {
  it('accounts for all five categories under the exact Content title', () => {
    expect(ScoreResultBlockStories.title).toBe('Content/Score Result Block');
    expect([
      ScoreResultBlockCanonical,
      ScoreResultBlockVariants,
      ScoreResultBlockStates,
      ScoreResultBlockBoundaries,
      ScoreResultBlockInteractive,
    ]).toHaveLength(5);
    expect(ScoreResultBlockVariants.render).toBeDefined();
    expect(ScoreResultBlockBoundaries.render).toBeDefined();
    expect(ScoreResultBlockInteractive.parameters?.applicability).toMatch(
      /presentational|inapplicable/iu,
    );
  });
});
