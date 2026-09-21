import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import fs from 'node:fs';
import path from 'node:path';
import { StyleSheet } from 'react-native';

import * as designSystem from '../src/design-system';
import * as AvatarStories from '../src/design-system/components/identity/Avatar.stories';
import * as AvatarGroupStories from '../src/design-system/components/identity/AvatarGroup.stories';
import * as AvatarPickerStories from '../src/design-system/components/identity/AvatarPicker.stories';
import * as StatusChipStories from '../src/design-system/components/status/StatusChip.stories';
import * as StepProgressStories from '../src/design-system/components/progress/StepProgress.stories';
import * as PlayerItemStories from '../src/design-system/components/content/PlayerItem.stories';
import * as GameCardStories from '../src/design-system/components/content/GameCard.stories';
import * as NotificationRowStories from '../src/design-system/components/content/NotificationRow.stories';
import * as SettingsRowStories from '../src/design-system/components/content/SettingsRow.stories';
import * as StatTileStories from '../src/design-system/components/content/StatTile.stories';
import * as ScoreResultBlockStories from '../src/design-system/components/content/ScoreResultBlock.stories';
import * as PlayerPreferencesCardStories from '../src/design-system/components/content/PlayerPreferencesCard.stories';
import * as BannerToastStories from '../src/design-system/components/feedback/BannerToast.stories';
import * as EmptyStateStories from '../src/design-system/components/feedback/EmptyState.stories';
import * as IllustratedCardStories from '../src/design-system/components/cards/IllustratedCard.stories';
import { phase4SourceEvidence } from '../src/design-system/components/phase4SourceRegistry';
import {
  phase4Backstops,
  phase4StoryContracts,
  phase4StorySources,
  storyTaxonomy,
} from '../src/design-system/stories/storyContract';

const expectedDefinitions = [
  ['Avatar', 'avatar', 'Identity/Avatar'],
  ['AvatarGroup', 'avatarGroup', 'Identity/Avatar Group'],
  ['AvatarPicker', 'avatarPicker', 'Identity/Avatar Picker'],
  ['StatusChip', 'statusChip', 'Status/Status Chip'],
  ['StepProgress', 'stepProgress', 'Progress/Step Progress'],
  ['PlayerItem', 'playerItem', 'Content/Player Item'],
  ['GameCard', 'gameCard', 'Content/Game Card'],
  ['NotificationRow', 'notificationRow', 'Content/Notification Row'],
  ['SettingsRow', 'settingsRow', 'Content/Settings Row'],
  ['StatTile', 'statTile', 'Content/Stat Tile'],
  ['ScoreResultBlock', 'scoreResultBlock', 'Content/Score Result Block'],
  ['PlayerPreferencesCard', 'playerPreferencesCard', 'Content/Player Preferences Card'],
  ['BannerToast', 'bannerToast', 'Feedback/Banner Toast'],
  ['EmptyState', 'emptyState', 'Feedback/Empty State'],
  ['IllustratedCard', 'illustratedCard', 'Cards/Illustrated Card'],
] as const;

const storyModules = [
  AvatarStories,
  AvatarGroupStories,
  AvatarPickerStories,
  StatusChipStories,
  StepProgressStories,
  PlayerItemStories,
  GameCardStories,
  NotificationRowStories,
  SettingsRowStories,
  StatTileStories,
  ScoreResultBlockStories,
  PlayerPreferencesCardStories,
  BannerToastStories,
  EmptyStateStories,
  IllustratedCardStories,
] as const;

const phase4StoryFiles = [
  'identity/Avatar.stories.tsx',
  'identity/AvatarGroup.stories.tsx',
  'identity/AvatarPicker.stories.tsx',
  'status/StatusChip.stories.tsx',
  'progress/StepProgress.stories.tsx',
  'content/PlayerItem.stories.tsx',
  'content/GameCard.stories.tsx',
  'content/NotificationRow.stories.tsx',
  'content/SettingsRow.stories.tsx',
  'content/StatTile.stories.tsx',
  'content/ScoreResultBlock.stories.tsx',
  'content/PlayerPreferencesCard.stories.tsx',
  'feedback/BannerToast.stories.tsx',
  'feedback/EmptyState.stories.tsx',
  'cards/IllustratedCard.stories.tsx',
] as const;

type EdgeProbe = Readonly<{
  id: string;
  requirement: string;
  probeClass: string;
  statement: string;
  disposition: 'resolved' | 'backstop' | 'flagged-assumption';
  checkPath?: string;
  rationale: string;
}>;

const edgeLedger = JSON.parse(
  fs.readFileSync(path.resolve('design-spec/phase-4-edge-coverage.json'), 'utf8'),
) as Readonly<{ source: Readonly<{ revision: number; expectedProbeCount: number }>; probes: EdgeProbe[] }>;

describe('Phase 4 Storybook catalogue contract', () => {
  it('publishes exactly the 15 source-backed family contracts and titles', () => {
    const expectedExports = expectedDefinitions.map(([exportName]) => exportName);
    expect(Object.keys(phase4StoryContracts)).toEqual(expectedExports);
    expect(Object.values(phase4StoryContracts).map(({ title }) => title)).toEqual(
      expectedDefinitions.map(([, , title]) => title),
    );
    for (const name of expectedExports) {
      expect(designSystem[name]).toEqual(expect.any(Function));
    }
  });

  it('matches every real story module to the exact title and five named exports', () => {
    storyModules.forEach((module, index) => {
      expect(module.default.title).toBe(expectedDefinitions[index][2]);
      for (const category of storyTaxonomy) expect(module[category]).toBeDefined();
    });
  });

  it('accounts for the ordered taxonomy with a story or an inherent non-empty reason', () => {
    expect(storyTaxonomy).toEqual(['Canonical', 'Variants', 'States', 'Boundaries', 'Interactive']);
    for (const contract of Object.values(phase4StoryContracts)) {
      expect(Object.keys(contract.categories)).toEqual(storyTaxonomy);
      for (const entry of Object.values(contract.categories)) {
        expect(entry.status === 'story' ? entry.story : entry.reason).not.toHaveLength(0);
      }
    }
    for (const name of ['Avatar', 'StepProgress', 'StatTile', 'ScoreResultBlock', 'PlayerPreferencesCard'] as const) {
      expect(phase4StoryContracts[name].categories.Interactive).toMatchObject({
        status: 'inapplicable',
      });
    }
  });

  it('binds visible revision-296 provenance and all 76 active records once in source order', () => {
    expect(phase4SourceEvidence.recordCount).toBe(76);
    expect(Object.keys(phase4StorySources)).toEqual(expectedDefinitions.map(([name]) => name));
    for (const [exportName, familyKey] of expectedDefinitions) {
      const family = phase4SourceEvidence.families.find(({ key }) => key === familyKey);
      const contract = phase4StoryContracts[exportName];
      expect(family).toBeDefined();
      expect(contract.recordIds).toEqual(family?.records.map(({ id }) => id));
      expect(phase4StorySources[exportName]).toEqual({
        fileId: phase4SourceEvidence.source.fileId,
        pageId: phase4SourceEvidence.source.pageId,
        revision: 296,
        sourceId: family?.sourceId,
      });
    }
    const recordIds = Object.values(phase4StoryContracts).flatMap(({ recordIds }) => recordIds);
    expect(recordIds).toHaveLength(76);
    expect(new Set(recordIds).size).toBe(76);
  });

  it('permits only bounded persistent controls and callbacks owned by real branches', () => {
    const prohibited = [
      'pressed', 'focused', 'color', 'width', 'height', 'artwork', 'children',
      'router', 'route', 'timer', 'remoteSource', 'upload', 'storage', 'persistence',
    ];
    for (const contract of Object.values(phase4StoryContracts)) {
      expect(contract.controls.every((control) => !prohibited.includes(control))).toBe(true);
      expect(contract.actions.every((action) => action.startsWith('on'))).toBe(true);
    }
    expect(phase4StoryContracts.EmptyState.actions).toEqual(['onCreateGame', 'onInvitePlayers']);
    expect(phase4StoryContracts.StepProgress.actions).toEqual([]);
    expect(phase4StoryContracts.IllustratedCard.controls).toEqual(['type']);
    for (const name of [
      'Avatar',
      'StatusChip',
      'PlayerItem',
      'GameCard',
      'NotificationRow',
      'SettingsRow',
      'StatTile',
    ] as const) {
      expect(phase4StoryContracts[name].controls).toEqual(['configuration']);
    }
  });

  it('maps every selectable sparse-family configuration to the same authored tuple', () => {
    const expectConfigurationControl = (
      storyModule: Readonly<{ default: Readonly<{ argTypes?: Record<string, unknown> }> }>,
      configurations: readonly string[],
    ) => {
      const argTypes = storyModule.default.argTypes ?? {};
      expect((argTypes.configuration as { control: string }).control).toBe('select');
      expect((argTypes.configuration as { options: readonly string[] }).options)
        .toEqual(configurations);
      for (const [name, argType] of Object.entries(argTypes)) {
        if (name !== 'configuration') expect(argType).toEqual(expect.objectContaining({ action: expect.any(String) }));
      }
    };

    expectConfigurationControl(AvatarStories, AvatarStories.avatarStoryConfigurations);
    for (const configuration of AvatarStories.avatarStoryConfigurations) {
      const props = AvatarStories.normalizeAvatarStoryArgs({ configuration });
      expect(`${props.size}/${props.presence}`).toBe(configuration);
    }

    expectConfigurationControl(StatusChipStories, StatusChipStories.statusChipStoryConfigurations);
    for (const configuration of StatusChipStories.statusChipStoryConfigurations) {
      const props = StatusChipStories.normalizeStatusChipStoryArgs({ configuration });
      const state = props.variant === 'selectable'
        ? 'selected'
        : props.variant === 'disabled' ? 'disabled' : 'default';
      expect(`${props.style}/${state}`).toBe(configuration);
    }

    expectConfigurationControl(PlayerItemStories, PlayerItemStories.playerItemStoryConfigurations);
    for (const configuration of PlayerItemStories.playerItemStoryConfigurations) {
      const props = PlayerItemStories.normalizePlayerItemStoryArgs({ configuration });
      const tuple = props.variant === 'list'
        ? `list/${props.selected ? 'selected' : 'default'}`
        : props.variant === 'game-slot'
          ? 'gameSlot/default'
          : props.variant === 'empty-game-slot'
            ? 'gameSlot/empty'
            : `inviteResult/${props.disabled ? 'disabled' : 'default'}`;
      expect(tuple).toBe(configuration);
    }

    expectConfigurationControl(GameCardStories, GameCardStories.gameCardStoryConfigurations);
    for (const configuration of GameCardStories.gameCardStoryConfigurations) {
      const props = GameCardStories.normalizeGameCardStoryArgs({ configuration });
      expect(`${props.variant}/${props.variant === 'open' && props.full ? 'full' : 'default'}`)
        .toBe(configuration);
    }

    expectConfigurationControl(
      NotificationRowStories,
      NotificationRowStories.notificationRowStoryConfigurations,
    );
    for (const configuration of NotificationRowStories.notificationRowStoryConfigurations) {
      const props = NotificationRowStories.normalizeNotificationRowStoryArgs({ configuration });
      expect(`${props.type}/${props.read ? 'read' : 'unread'}`).toBe(configuration);
    }

    expectConfigurationControl(SettingsRowStories, SettingsRowStories.settingsRowStoryConfigurations);
    for (const configuration of SettingsRowStories.settingsRowStoryConfigurations) {
      const props = SettingsRowStories.normalizeSettingsRowStoryArgs({ configuration });
      const state = props.variant === 'toggle'
        ? props.disabled ? 'disabled' : props.checked ? 'on' : 'off'
        : props.variant === 'navigation' && props.disabled ? 'disabled' : 'default';
      expect(`${props.variant}/${props.icon}/${state}`).toBe(configuration);
    }

    expectConfigurationControl(StatTileStories, StatTileStories.statTileStoryConfigurations);
    for (const configuration of StatTileStories.statTileStoryConfigurations) {
      const props = StatTileStories.normalizeStatTileStoryArgs({ configuration });
      expect(`${props.type}/${props.content}/${props.state}`).toBe(configuration);
    }
  });

  it('fails closed for non-selectable story configurations and scopes branch actions', () => {
    expect(() => AvatarStories.normalizeAvatarStoryArgs({ configuration: '32/away' })).toThrow();
    expect(() => StatusChipStories.normalizeStatusChipStoryArgs({ configuration: 'warning/selected' })).toThrow();
    expect(() => PlayerItemStories.normalizePlayerItemStoryArgs({ configuration: 'list/disabled' })).toThrow();
    expect(() => GameCardStories.normalizeGameCardStoryArgs({ configuration: 'compact/full' })).toThrow();
    expect(() => NotificationRowStories.normalizeNotificationRowStoryArgs({ configuration: 'booking/read' })).toThrow();
    expect(() => SettingsRowStories.normalizeSettingsRowStoryArgs({ configuration: 'value/profile/default' })).toThrow();
    expect(() => StatTileStories.normalizeStatTileStoryArgs({ configuration: 'featured/gamesPlayed/neutral' })).toThrow();

    expect(StatusChipStories.default.argTypes?.onSelectedChange?.if).toEqual({
      arg: 'configuration',
      eq: 'success/selected',
    });
    expect(PlayerItemStories.default.argTypes).not.toHaveProperty('onAction');
    expect(GameCardStories.default.argTypes).not.toHaveProperty('onAction');
    expect(SettingsRowStories.default.argTypes).not.toHaveProperty('onAction');

    expect(EmptyStateStories.default.argTypes?.onCreateGame?.if).toEqual({ arg: 'content', eq: 'noGames' });
    expect(EmptyStateStories.default.argTypes?.onInvitePlayers?.if).toEqual({ arg: 'content', eq: 'noPlayers' });
    expect(IllustratedCardStories.default.argTypes?.onViewGame?.if).toEqual({ arg: 'type', eq: 'nextGame' });
    expect(IllustratedCardStories.default.argTypes?.onViewResults?.if).toEqual({ arg: 'type', eq: 'matchResult' });
    expect(IllustratedCardStories.default.argTypes?.onInvitePlayers?.if).toEqual({ arg: 'type', eq: 'invitePlayers' });
    expect(IllustratedCardStories.default.argTypes?.onShareGame?.if).toEqual({ arg: 'type', eq: 'gameCreated' });
  });

  it.each([
    { callback: 'onSelectedChange', configuration: 'list/default', name: 'Player Item list', role: 'checkbox', story: PlayerItemStories.Interactive },
    { callback: 'onViewPlayer', configuration: 'gameSlot/default', name: 'Player Item game slot', role: 'button', story: PlayerItemStories.ViewPlayerInteraction },
    { callback: 'onInvite', configuration: 'gameSlot/empty', name: 'Player Item empty slot', role: 'button', story: PlayerItemStories.InviteInteraction },
    { callback: 'onViewGame', configuration: 'next/default', name: 'Game Card game', role: 'button', story: GameCardStories.Interactive },
    { callback: 'onViewResults', configuration: 'completed/default', name: 'Game Card results', role: 'button', story: GameCardStories.ViewResultsInteraction },
    { callback: 'onCheckedChange', configuration: 'toggle/notification/off', name: 'Settings Row toggle', role: 'switch', story: SettingsRowStories.Interactive },
    { callback: 'onPress', configuration: 'navigation/profile/default', name: 'Settings Row press', role: 'button', story: SettingsRowStories.PressInteraction },
  ])(
    'forwards the $name Storybook action through the real component callback',
    async ({ configuration, callback, role, story }) => {
      const action = jest.fn();
      const args = { configuration, [callback]: action };
      expect(story.parameters?.controls?.include).toEqual([callback]);
      const element = story.render?.(args as never, {} as never);
      const screen = await render(element as React.ReactElement);
      fireEvent.press(screen.getByRole(role));
      expect(action).toHaveBeenCalledTimes(1);
    },
  );

  it('uses only the declared Phase 4 spacing scale in catalogue composition', () => {
    for (const storyFile of phase4StoryFiles) {
      const source = fs.readFileSync(
        path.resolve('src/design-system/components', storyFile),
        'utf8',
      );
      expect(source).not.toMatch(/gap="space(?:12|20|40)"/u);
    }
  });

  it('retains host backstops and explicitly defers every native acceptance lane', () => {
    expect(phase4Backstops).toMatchObject({
      longContent: { status: 'host-contract', nativeStatus: 'deferred-to-phase-5' },
      overflow: { status: 'host-contract' },
      cardinality: { status: 'host-contract' },
      targetClearance: { minimumEffectiveTarget: 44, status: 'host-contract' },
      readOrder: { status: 'host-contract' },
      nativeReview: {
        ios: 'deferred-to-phase-5',
        android: 'deferred-to-phase-5',
        fontScale200: 'deferred-to-phase-5',
        voiceOver: 'deferred-to-phase-5',
        talkBack: 'deferred-to-phase-5',
      },
    });
  });
});

describe('Phase 4 rendered edge witnesses', () => {
  const players = [
    { initials: 'AP', name: 'Alex', presence: 'online' },
    { initials: 'BP', name: 'Bea', presence: 'online' },
    { initials: 'CP', name: 'Cam', presence: 'online' },
    { initials: 'DP', name: 'Dev', presence: 'online' },
  ] as const;
  const teams = [
    { initials: 'AP/BP', name: 'Alex and Bea', scores: ['6.000', '0006'] },
    { initials: 'CP/DP', name: 'Cam and Dev', scores: ['04', '3.0'] },
  ] as const;

  it('preserves overflow meaning and stable identity order', async () => {
    const screen = await render(
      <designSystem.AvatarGroup identities={players} overflow={3} variant="overflow" />,
    );
    expect(screen.getByRole('summary')).toHaveAccessibilityValue({
      text: 'Alex, Bea, Cam, Dev, plus 3 more',
    });
  });

  it('keeps long semantic copy and the action reachable at the constrained boundary', async () => {
    const title = 'An exceptionally long international game update for every invited player';
    const message = 'The venue and court assignment changed while preserving the complete announcement.';
    const screen = await render(
      <designSystem.NotificationRow
        message={message}
        onPress={jest.fn()}
        read={false}
        timestamp="2 minutes ago"
        title={title}
        type="game"
      />,
    );
    expect(screen.getByRole('button', {
      name: `${title}, ${message}, 2 minutes ago, unread`,
    })).toBeTruthy();
  });

  it('preserves caller-formatted score precision and deterministic team/set order', async () => {
    const screen = await render(
      <designSystem.ScoreResultBlock state="won" teams={teams} type="compact" />,
    );
    expect(screen.getByRole('summary', {
      name: 'YOU WON, Alex and Bea, set 1 6.000, set 2 0006, winner, Cam and Dev, set 1 04, set 2 3.0',
    })).toBeTruthy();
  });

  it('rejects unauthored singleton cardinality rather than filling a slot', () => {
    expect(() => designSystem.AvatarGroup({ identities: [players[0]], variant: '2-players' } as never))
      .toThrow(/Unsupported Avatar Group/u);
  });

  it('retains separate 44-point empty-slot targets', async () => {
    const screen = await render(
      <designSystem.AvatarGroup onAddPlayer1={jest.fn()} onAddPlayer2={jest.fn()} variant="empty" />,
    );
    for (const name of ['Add player 1', 'Add player 2']) {
      const action = screen.getByRole('button', { name });
      expect(StyleSheet.flatten(action.props.style)).toEqual(
        expect.objectContaining({ height: 44, width: 44 }),
      );
    }
  });
});

describe('Phase 4 deterministic edge ledger', () => {
  it('accounts for exactly 47 stable, unique probes from revision 296', () => {
    expect(edgeLedger.source).toMatchObject({ revision: 296, expectedProbeCount: 47 });
    expect(edgeLedger.probes).toHaveLength(47);
    expect(new Set(edgeLedger.probes.map(({ id }) => id)).size).toBe(47);
    expect(edgeLedger.probes.map(({ id }) => id)).toEqual(
      [...edgeLedger.probes.map(({ id }) => id)].sort(),
    );
  });

  it('uses only named classes and honest resolved/backstop/assumption dispositions', () => {
    const classes = ['adjacency', 'empty', 'singleton', 'null', 'stable-order', 'boundary', 'precision', 'ties'];
    const dispositions = ['resolved', 'backstop', 'flagged-assumption'];
    for (const probe of edgeLedger.probes) {
      expect(probe.requirement).toMatch(/^(?:IDEN|STAT|PROG|CONT|FDBK|CARD)-\d{2}$/u);
      expect(classes).toContain(probe.probeClass);
      expect(dispositions).toContain(probe.disposition);
      expect(probe.statement).not.toHaveLength(0);
      expect(probe.rationale).not.toHaveLength(0);
      if (probe.disposition === 'flagged-assumption') {
        expect(probe.checkPath).toBeUndefined();
      } else {
        expect(probe.checkPath).toMatch(/^(?:tests|src)\//u);
      }
    }
    expect(edgeLedger.probes.some(({ disposition }) => disposition === 'resolved')).toBe(true);
    expect(edgeLedger.probes.some(({ disposition }) => disposition === 'backstop')).toBe(true);
    expect(edgeLedger.probes.some(({ disposition }) => disposition === 'flagged-assumption')).toBe(true);
  });
});
