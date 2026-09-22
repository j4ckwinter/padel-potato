import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import { execFileSync } from 'node:child_process';
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
import {
  storybookBackstops,
  storyContracts,
  storyTaxonomy,
} from '../src/design-system/stories/storyContract';

function verifyStorybookActionEnhancer(
  callback: string,
  actionName: string,
  initialArgs: Readonly<Record<string, unknown>>,
) {
  const probe = String.raw`
    import { composeStory, INTERNAL_DEFAULT_PROJECT_ANNOTATIONS } from '@storybook/react';
    import { EVENT_ID } from 'storybook/actions';
    import { getCoreAnnotations } from 'storybook/internal/csf';
    import { addons, composeConfigs, mockChannel } from 'storybook/preview-api';

    const { actionName, callback, initialArgs } = JSON.parse(process.env.PADEL_STORYBOOK_ACTION_CASE);
    const channel = mockChannel();
    const events = [];
    addons.setChannel(channel);
    channel.on(EVENT_ID, (event) => events.push(event));
    const projectAnnotations = composeConfigs([
      ...getCoreAnnotations(),
      INTERNAL_DEFAULT_PROJECT_ANNOTATIONS,
    ]);
    const ComposedStory = composeStory(
      { args: initialArgs, render: () => null },
      { argTypes: { [callback]: { action: actionName } }, title: 'Interaction probe' },
      projectAnnotations,
      'Interactive',
    );
    ComposedStory.args[callback]();
    process.stdout.write(JSON.stringify({
      eventName: events[0]?.data.name,
      isAction: ComposedStory.args[callback].isAction === true,
      resolvedType: typeof ComposedStory.args[callback],
    }));
  `;
  return JSON.parse(
    execFileSync(process.execPath, ['--input-type=module', '-e', probe], {
      encoding: 'utf8',
      env: {
        ...process.env,
        PADEL_STORYBOOK_ACTION_CASE: JSON.stringify({
          actionName,
          callback,
          initialArgs,
        }),
      },
    }),
  ) as Readonly<{ eventName: string; isAction: boolean; resolvedType: string }>;
}

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
  [
    'PlayerPreferencesCard',
    'playerPreferencesCard',
    'Content/Player Preferences Card',
  ],
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

const componentStoryFiles = [
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

const componentStoryContracts = Object.fromEntries(
  expectedDefinitions.map(([name]) => [name, storyContracts[name]]),
);

describe('identity, content, and feedback Storybook catalogue contract', () => {
  it('publishes exactly the 15 component family contracts and titles', () => {
    const expectedExports = expectedDefinitions.map(
      ([exportName]) => exportName,
    );
    expect(Object.keys(componentStoryContracts)).toEqual(expectedExports);
    expect(
      Object.values(componentStoryContracts).map(({ title }) => title),
    ).toEqual(expectedDefinitions.map(([, , title]) => title));
    for (const name of expectedExports) {
      expect(designSystem[name]).toEqual(expect.any(Function));
    }
  });

  it('matches every real story module to the exact title and five named exports', () => {
    storyModules.forEach((module, index) => {
      expect(module.default.title).toBe(expectedDefinitions[index][2]);
      for (const category of storyTaxonomy)
        expect(module[category]).toBeDefined();
    });
  });

  it('accounts for the ordered taxonomy with a story or an inherent non-empty reason', () => {
    expect(storyTaxonomy).toEqual([
      'Canonical',
      'Variants',
      'States',
      'Boundaries',
      'Interactive',
    ]);
    for (const contract of Object.values(componentStoryContracts)) {
      expect(Object.keys(contract.categories)).toEqual(storyTaxonomy);
      for (const entry of Object.values(contract.categories)) {
        expect(
          entry.status === 'story' ? entry.story : entry.reason,
        ).not.toHaveLength(0);
      }
    }
    for (const name of [
      'Avatar',
      'StepProgress',
      'StatTile',
      'ScoreResultBlock',
      'PlayerPreferencesCard',
    ] as const) {
      expect(storyContracts[name].categories.Interactive).toMatchObject({
        status: 'inapplicable',
      });
    }
  });

  it('permits only bounded persistent controls and callbacks owned by real branches', () => {
    const prohibited = [
      'pressed',
      'focused',
      'color',
      'width',
      'height',
      'artwork',
      'children',
      'router',
      'route',
      'timer',
      'remoteSource',
      'upload',
      'storage',
      'persistence',
    ];
    for (const contract of Object.values(componentStoryContracts)) {
      expect(
        contract.controls.every((control) => !prohibited.includes(control)),
      ).toBe(true);
      expect(contract.actions.every((action) => action.startsWith('on'))).toBe(
        true,
      );
    }
    expect(storyContracts.EmptyState.actions).toEqual([
      'onCreateGame',
      'onInvitePlayers',
    ]);
    expect(storyContracts.StepProgress.actions).toEqual([]);
    expect(storyContracts.IllustratedCard.controls).toEqual(['type']);
    for (const name of [
      'Avatar',
      'StatusChip',
      'PlayerItem',
      'GameCard',
      'NotificationRow',
      'SettingsRow',
      'StatTile',
    ] as const) {
      expect(storyContracts[name].controls).toEqual(['configuration']);
    }
  });

  it('maps every selectable sparse-family configuration to the same authored tuple', () => {
    const expectConfigurationControl = (
      storyModule: Readonly<{
        default: Readonly<{ argTypes?: Record<string, unknown> }>;
      }>,
      configurations: readonly string[],
    ) => {
      const argTypes = storyModule.default.argTypes ?? {};
      expect((argTypes.configuration as { control: string }).control).toBe(
        'select',
      );
      expect(
        (argTypes.configuration as { options: readonly string[] }).options,
      ).toEqual(configurations);
      for (const [name, argType] of Object.entries(argTypes)) {
        if (name !== 'configuration')
          expect(argType).toEqual(
            expect.objectContaining({ action: expect.any(String) }),
          );
      }
    };

    expectConfigurationControl(
      AvatarStories,
      AvatarStories.avatarStoryConfigurations,
    );
    for (const configuration of AvatarStories.avatarStoryConfigurations) {
      const props = AvatarStories.normalizeAvatarStoryArgs({ configuration });
      expect(`${props.size}/${props.presence}`).toBe(configuration);
    }

    expectConfigurationControl(
      StatusChipStories,
      StatusChipStories.statusChipStoryConfigurations,
    );
    for (const configuration of StatusChipStories.statusChipStoryConfigurations) {
      const props = StatusChipStories.normalizeStatusChipStoryArgs({
        configuration,
      });
      const state =
        props.variant === 'selectable'
          ? 'selected'
          : props.variant === 'disabled'
            ? 'disabled'
            : 'default';
      expect(`${props.style}/${state}`).toBe(configuration);
    }

    expectConfigurationControl(
      PlayerItemStories,
      PlayerItemStories.playerItemStoryConfigurations,
    );
    for (const configuration of PlayerItemStories.playerItemStoryConfigurations) {
      const props = PlayerItemStories.normalizePlayerItemStoryArgs({
        configuration,
      });
      const tuple =
        props.variant === 'list'
          ? `list/${props.selected ? 'selected' : 'default'}`
          : props.variant === 'game-slot'
            ? 'gameSlot/default'
            : props.variant === 'empty-game-slot'
              ? 'gameSlot/empty'
              : `inviteResult/${props.disabled ? 'disabled' : 'default'}`;
      expect(tuple).toBe(configuration);
    }

    expectConfigurationControl(
      GameCardStories,
      GameCardStories.gameCardStoryConfigurations,
    );
    for (const configuration of GameCardStories.gameCardStoryConfigurations) {
      const props = GameCardStories.normalizeGameCardStoryArgs({
        configuration,
      });
      expect(
        `${props.variant}/${props.variant === 'open' && props.full ? 'full' : 'default'}`,
      ).toBe(configuration);
    }

    expectConfigurationControl(
      NotificationRowStories,
      NotificationRowStories.notificationRowStoryConfigurations,
    );
    for (const configuration of NotificationRowStories.notificationRowStoryConfigurations) {
      const props = NotificationRowStories.normalizeNotificationRowStoryArgs({
        configuration,
      });
      expect(`${props.type}/${props.read ? 'read' : 'unread'}`).toBe(
        configuration,
      );
    }

    expectConfigurationControl(
      SettingsRowStories,
      SettingsRowStories.settingsRowStoryConfigurations,
    );
    for (const configuration of SettingsRowStories.settingsRowStoryConfigurations) {
      const props = SettingsRowStories.normalizeSettingsRowStoryArgs({
        configuration,
      });
      const state =
        props.variant === 'toggle'
          ? props.disabled
            ? 'disabled'
            : props.checked
              ? 'on'
              : 'off'
          : props.variant === 'navigation' && props.disabled
            ? 'disabled'
            : 'default';
      expect(`${props.variant}/${props.icon}/${state}`).toBe(configuration);
    }

    expectConfigurationControl(
      StatTileStories,
      StatTileStories.statTileStoryConfigurations,
    );
    for (const configuration of StatTileStories.statTileStoryConfigurations) {
      const props = StatTileStories.normalizeStatTileStoryArgs({
        configuration,
      });
      expect(`${props.type}/${props.content}/${props.state}`).toBe(
        configuration,
      );
    }
  });

  it('fails closed for non-selectable story configurations and scopes branch actions', () => {
    expect(() =>
      AvatarStories.normalizeAvatarStoryArgs({ configuration: '32/away' }),
    ).toThrow();
    expect(() =>
      StatusChipStories.normalizeStatusChipStoryArgs({
        configuration: 'warning/selected',
      }),
    ).toThrow();
    expect(() =>
      PlayerItemStories.normalizePlayerItemStoryArgs({
        configuration: 'list/disabled',
      }),
    ).toThrow();
    expect(() =>
      GameCardStories.normalizeGameCardStoryArgs({
        configuration: 'compact/full',
      }),
    ).toThrow();
    expect(() =>
      NotificationRowStories.normalizeNotificationRowStoryArgs({
        configuration: 'booking/read',
      }),
    ).toThrow();
    expect(() =>
      SettingsRowStories.normalizeSettingsRowStoryArgs({
        configuration: 'value/profile/default',
      }),
    ).toThrow();
    expect(() =>
      StatTileStories.normalizeStatTileStoryArgs({
        configuration: 'featured/gamesPlayed/neutral',
      }),
    ).toThrow();

    expect(StatusChipStories.default.argTypes?.onSelectedChange?.if).toEqual({
      arg: 'configuration',
      eq: 'success/selected',
    });
    expect(PlayerItemStories.default.argTypes).not.toHaveProperty('onAction');
    expect(GameCardStories.default.argTypes).not.toHaveProperty('onAction');
    expect(SettingsRowStories.default.argTypes).not.toHaveProperty('onAction');

    expect(EmptyStateStories.default.argTypes?.onCreateGame?.if).toEqual({
      arg: 'content',
      eq: 'noGames',
    });
    expect(EmptyStateStories.default.argTypes?.onInvitePlayers?.if).toEqual({
      arg: 'content',
      eq: 'noPlayers',
    });
    expect(IllustratedCardStories.default.argTypes?.onViewGame?.if).toEqual({
      arg: 'type',
      eq: 'nextGame',
    });
    expect(IllustratedCardStories.default.argTypes?.onViewResults?.if).toEqual({
      arg: 'type',
      eq: 'matchResult',
    });
    expect(
      IllustratedCardStories.default.argTypes?.onInvitePlayers?.if,
    ).toEqual({ arg: 'type', eq: 'invitePlayers' });
    expect(IllustratedCardStories.default.argTypes?.onShareGame?.if).toEqual({
      arg: 'type',
      eq: 'gameCreated',
    });
  });

  it.each([
    {
      actionName: 'selected changed',
      callback: 'onSelectedChange',
      name: 'Player Item list',
      role: 'checkbox',
      story: PlayerItemStories.Interactive,
    },
    {
      actionName: 'view player',
      callback: 'onViewPlayer',
      name: 'Player Item game slot',
      role: 'button',
      story: PlayerItemStories.ViewPlayerInteraction,
    },
    {
      actionName: 'invite player',
      callback: 'onInvite',
      name: 'Player Item empty slot',
      role: 'button',
      story: PlayerItemStories.InviteInteraction,
    },
    {
      actionName: 'view game',
      callback: 'onViewGame',
      name: 'Game Card game',
      role: 'button',
      story: GameCardStories.Interactive,
    },
    {
      actionName: 'view results',
      callback: 'onViewResults',
      name: 'Game Card results',
      role: 'button',
      story: GameCardStories.ViewResultsInteraction,
    },
    {
      actionName: 'checked changed',
      callback: 'onCheckedChange',
      name: 'Settings Row toggle',
      role: 'switch',
      story: SettingsRowStories.Interactive,
    },
    {
      actionName: 'settings row pressed',
      callback: 'onPress',
      name: 'Settings Row press',
      role: 'button',
      story: SettingsRowStories.PressInteraction,
    },
  ])(
    'wires the $name action enhancer through the composed Storybook callback',
    async ({ actionName, callback, role, story }) => {
      expect(story.parameters?.controls?.include).toEqual([callback]);
      expect(story.args).not.toHaveProperty(callback);
      expect(
        verifyStorybookActionEnhancer(callback, actionName, story.args ?? {}),
      ).toEqual({
        eventName: actionName,
        isAction: true,
        resolvedType: 'function',
      });

      const forwardedAction = jest.fn();
      const element = story.render?.(
        { ...story.args, [callback]: forwardedAction } as never,
        {} as never,
      );
      const screen = await render(element as React.ReactElement);
      fireEvent.press(screen.getByRole(role));
      expect(forwardedAction).toHaveBeenCalledTimes(1);
    },
  );

  it('uses only the declared spacing scale in catalogue composition', () => {
    for (const storyFile of componentStoryFiles) {
      const source = fs.readFileSync(
        path.resolve('src/design-system/components', storyFile),
        'utf8',
      );
      expect(source).not.toMatch(/gap="space(?:12|20|40)"/u);
    }
  });

  it('retains host backstops and explicitly defers every native acceptance lane', () => {
    expect(storybookBackstops.contentComponents).toMatchObject({
      longContent: {
        status: 'host-contract',
        nativeStatus: 'deferred-to-native-review',
      },
      overflow: { status: 'host-contract' },
      cardinality: { status: 'host-contract' },
      targetClearance: { minimumEffectiveTarget: 44, status: 'host-contract' },
      readOrder: { status: 'host-contract' },
      nativeReview: {
        ios: 'deferred-to-native-review',
        android: 'deferred-to-native-review',
        fontScale200: 'deferred-to-native-review',
        voiceOver: 'deferred-to-native-review',
        talkBack: 'deferred-to-native-review',
      },
    });
  });
});

describe('identity, content, and feedback rendered edge witnesses', () => {
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
      <designSystem.AvatarGroup
        identities={players}
        overflow={3}
        variant="overflow"
      />,
    );
    expect(screen.getByRole('summary')).toHaveAccessibilityValue({
      text: 'Alex, Bea, Cam, Dev, plus 3 more',
    });
  });

  it('keeps long semantic copy and the action reachable at the constrained boundary', async () => {
    const title =
      'An exceptionally long international game update for every invited player';
    const message =
      'The venue and court assignment changed while preserving the complete announcement.';
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
    expect(
      screen.getByRole('button', {
        name: `${title}, ${message}, 2 minutes ago, unread`,
      }),
    ).toBeTruthy();
  });

  it('preserves caller-formatted score precision and deterministic team/set order', async () => {
    const screen = await render(
      <designSystem.ScoreResultBlock
        state="won"
        teams={teams}
        type="compact"
      />,
    );
    expect(
      screen.getByRole('summary', {
        name: 'YOU WON, Alex and Bea, set 1 6.000, set 2 0006, winner, Cam and Dev, set 1 04, set 2 3.0',
      }),
    ).toBeTruthy();
  });

  it('rejects unauthored singleton cardinality rather than filling a slot', () => {
    expect(() =>
      designSystem.AvatarGroup({
        identities: [players[0]],
        variant: '2-players',
      } as never),
    ).toThrow(/Unsupported Avatar Group/u);
  });

  it('retains separate 44-point empty-slot targets', async () => {
    const screen = await render(
      <designSystem.AvatarGroup
        onAddPlayer1={jest.fn()}
        onAddPlayer2={jest.fn()}
        variant="empty"
      />,
    );
    for (const name of ['Add player 1', 'Add player 2']) {
      const action = screen.getByRole('button', { name });
      expect(StyleSheet.flatten(action.props.style)).toEqual(
        expect.objectContaining({ height: 44, width: 44 }),
      );
    }
  });
});
