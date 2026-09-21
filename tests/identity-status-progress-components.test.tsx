import { describe, expect, it, jest } from '@jest/globals';
import { render, userEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import AvatarStories, {
  Boundaries,
  Canonical,
  Interactive,
  States,
  Variants,
} from '../src/design-system/components/identity/Avatar.stories';
import {
  Avatar,
  avatarPresences,
  avatarSizes,
  type AvatarPresence,
  type AvatarProps,
  type AvatarSize,
} from '../src/design-system/components/identity/Avatar';
import {
  avatarRecords,
  phase4SourceIdentity,
} from '../src/design-system/components/phase4SourceRegistry';
import AvatarGroupStories, {
  Boundaries as AvatarGroupBoundaries,
  Canonical as AvatarGroupCanonical,
  Interactive as AvatarGroupInteractive,
  States as AvatarGroupStates,
  Variants as AvatarGroupVariants,
} from '../src/design-system/components/identity/AvatarGroup.stories';
import {
  AvatarGroup,
  type AvatarGroupIdentity,
} from '../src/design-system/components/identity/AvatarGroup';
import AvatarPickerStories, {
  Boundaries as AvatarPickerBoundaries,
  Canonical as AvatarPickerCanonical,
  Interactive as AvatarPickerInteractive,
  States as AvatarPickerStates,
  Variants as AvatarPickerVariants,
} from '../src/design-system/components/identity/AvatarPicker.stories';
import {
  AvatarPicker,
  type AvatarPickerProps,
} from '../src/design-system/components/identity/AvatarPicker';
import StatusChipStories, {
  Boundaries as StatusChipBoundaries,
  Canonical as StatusChipCanonical,
  Interactive as StatusChipInteractive,
  States as StatusChipStates,
  Variants as StatusChipVariants,
} from '../src/design-system/components/status/StatusChip.stories';
import { StatusChip } from '../src/design-system/components/status/StatusChip';
import StepProgressStories, {
  Boundaries as StepProgressBoundaries,
  Canonical as StepProgressCanonical,
  Interactive as StepProgressInteractive,
  States as StepProgressStates,
  Variants as StepProgressVariants,
} from '../src/design-system/components/progress/StepProgress.stories';
import { StepProgress } from '../src/design-system/components/progress/StepProgress';

const flattenedStyle = (style: unknown) =>
  StyleSheet.flatten(
    style as Parameters<typeof StyleSheet.flatten>[0],
  ) as Record<string, unknown>;

const rejectedImageSources = [
  { uri: 'ftp://example.com/player.webp' },
  { uri: 'blob:https://example.com/player-id' },
  { uri: 'ws://example.com/player.webp' },
  { uri: '//example.com/player.webp' },
  { uri: 'player.webp' },
] as const;

describe('Avatar source contract', () => {
  it('retains the exact five authored tuples in revision-296 source order', () => {
    expect(phase4SourceIdentity).toEqual(expect.objectContaining({
      fileId: 'c514c1fb-1cda-8125-8008-a606253a77a3',
      pageId: '482a7222-5a3b-8086-8008-a6073072bbb1',
      revision: 296,
    }));
    expect(avatarSizes).toEqual([32, 40, 48, 56]);
    expect(avatarPresences).toEqual(['online', 'away', 'offline']);
    expect(avatarRecords.map(({ normalizedTuple }) => normalizedTuple)).toEqual([
      { size: 56, presence: 'online' },
      { size: 48, presence: 'offline' },
      { size: 48, presence: 'away' },
      { size: 40, presence: 'online' },
      { size: 32, presence: 'online' },
    ]);
    expect(avatarRecords.map(({ metrics }) => ({
      wrapper: metrics.normalized,
      visible: metrics.avatar.normalized,
    }))).toEqual([
      { wrapper: { width: 64, height: 64 }, visible: { width: 56, height: 56 } },
      { wrapper: { width: 64, height: 64 }, visible: { width: 48, height: 48 } },
      { wrapper: { width: 64, height: 64 }, visible: { width: 48, height: 48 } },
      { wrapper: { width: 64, height: 64 }, visible: { width: 40, height: 40 } },
      { wrapper: { width: 64, height: 64 }, visible: { width: 32, height: 32 } },
    ]);
  });
});

describe('Avatar runtime and semantic contract', () => {
  it.each([
    [32, 'online'],
    [40, 'online'],
    [48, 'away'],
    [48, 'offline'],
    [56, 'online'],
  ] as Array<[AvatarSize, AvatarPresence]>)('renders the authored %i/%s tuple at its named-child diameter', async (size, presence) => {
    const screen = await render(
      <Avatar {...({
        accessibilityLabel: `Alex Morgan, ${presence}`,
        initials: 'AM',
        presence,
        size,
      } as AvatarProps)} />,
    );

    const image = screen.getByRole('image', { name: `Alex Morgan, ${presence}` });
    expect(flattenedStyle(image.props.style)).toEqual(expect.objectContaining({
      borderRadius: size / 2,
      height: size,
      width: size,
    }));
    expect(screen.getByTestId('avatar-presence', { includeHiddenElements: true })).toBeTruthy();
  });

  it.each([
    [32, 'away'],
    [32, 'offline'],
    [40, 'away'],
    [40, 'offline'],
    [56, 'away'],
    [56, 'offline'],
  ] as Array<[32 | 40 | 56, 'away' | 'offline']>)('rejects the unauthored %i/%s tuple', (size, presence) => {
    expect(() => Avatar({
      accessibilityLabel: 'Unsupported avatar',
      initials: 'UA',
      presence,
      size,
    } as never)).toThrow(
      `Unsupported Avatar configuration: ${size}/${presence}. Supported configurations: 32/online, 40/online, 48/away, 48/offline, 56/online.`,
    );
  });

  it('rejects null identity content rather than inventing a fallback', () => {
    expect(() => Avatar({
      accessibilityLabel: 'Missing identity',
      initials: null,
      presence: 'online',
      size: 32,
    } as never)).toThrow(/Unsupported Avatar identity content/u);
  });

  it.each(rejectedImageSources)('rejects non-local image source %#', (source) => {
    expect(() => Avatar({
      accessibilityLabel: 'Remote identity',
      presence: 'online',
      size: 40,
      source,
    } as never)).toThrow(/bundled or local React Native image source/u);
  });

  it('exposes one image semantic when labelled and none when decorative', async () => {
    const labelled = await render(
      <Avatar
        accessibilityLabel="Alex Morgan, online"
        initials="AM"
        presence="online"
        size={40}
      />,
    );
    expect(labelled.getAllByRole('image')).toHaveLength(1);
    expect(labelled.getByText('AM', { includeHiddenElements: true })).toBeTruthy();

    const decorative = await render(
      <Avatar decorative initials="AM" presence="online" size={40} />,
    );
    expect(decorative.queryAllByRole('image')).toHaveLength(0);
  });
});

describe('Avatar Storybook contract', () => {
  it('accounts for the complete five-category Identity/Avatar taxonomy', () => {
    expect(AvatarStories.title).toBe('Identity/Avatar');
    expect([Canonical, Variants, States, Boundaries, Interactive]).toHaveLength(5);
    expect(Variants.render).toBeDefined();
    expect(Interactive.parameters).toEqual(expect.objectContaining({
      applicability: expect.stringMatching(/presentational/u),
    }));
  });
});

const groupPlayers = [
  { name: 'Alex Morgan', initials: 'AM', presence: 'online' },
  { name: 'Jamie Taylor', initials: 'JT', presence: 'online' },
  { name: 'Sam Kim', initials: 'SK', presence: 'online' },
  { name: 'Riley Brown', initials: 'RB', presence: 'online' },
] as const satisfies readonly AvatarGroupIdentity[];

describe('Avatar Group runtime and semantic contract', () => {
  type PopulatedAvatarGroupProps = Exclude<Parameters<typeof AvatarGroup>[0], { variant: 'empty' }>;
  it.each([
    ['2 players/default', { identities: [groupPlayers[0], groupPlayers[1]], variant: '2-players' }],
    ['3 players/default', { identities: [groupPlayers[0], groupPlayers[1], groupPlayers[2]], variant: '3-players' }],
    ['4 players/default', { identities: groupPlayers, variant: '4-players' }],
    ['4 players/overflow', { identities: groupPlayers, overflow: 3, variant: 'overflow' }],
  ] as Array<[string, PopulatedAvatarGroupProps]>)('renders the authored %s branch in supplied order', async (_tuple, props) => {
    const screen = await render(<AvatarGroup {...props} />);
    const group = screen.getByRole('summary');
    const expected = groupPlayers.slice(0, props.identities.length).map(({ name }) => name).join(', ');

    expect(group).toHaveAccessibilityValue({ text: 'overflow' in props ? `${expected}, plus 3 more` : expected });
    expect(screen.queryAllByRole('image')).toHaveLength(0);
    expect(screen.getAllByTestId('avatar-group-identity', { includeHiddenElements: true }))
      .toHaveLength(props.identities.length);
  });

  it('keeps two empty-slot actions independent', async () => {
    const onAddPlayer1 = jest.fn();
    const onAddPlayer2 = jest.fn();
    const screen = await render(
      <AvatarGroup
        onAddPlayer1={onAddPlayer1}
        onAddPlayer2={onAddPlayer2}
        variant="empty"
      />,
    );
    const user = userEvent.setup();

    await user.press(screen.getByRole('button', { name: 'Add player 1' }));
    expect(onAddPlayer1).toHaveBeenCalledTimes(1);
    expect(onAddPlayer2).not.toHaveBeenCalled();
    await user.press(screen.getByRole('button', { name: 'Add player 2' }));
    expect(onAddPlayer2).toHaveBeenCalledTimes(1);
  });

  it.each([
    { identities: [], variant: '2-players' },
    { identities: groupPlayers.slice(0, 1), variant: '2-players' },
    { identities: [...groupPlayers, groupPlayers[0]], variant: '4-players' },
    { identities: groupPlayers, overflow: 0, variant: 'overflow' },
    { identities: groupPlayers, overflow: -1, variant: 'overflow' },
    { identities: [groupPlayers[0], null], variant: '2-players' },
    {
      onAddPlayer1: jest.fn(),
      onAddPlayer2: jest.fn(),
      overflow: 2,
      variant: 'empty',
    },
    {
      identities: [groupPlayers[0], groupPlayers[1]],
      onAddPlayer1: jest.fn(),
      variant: '2-players',
    },
    {
      identities: groupPlayers,
      onAddPlayer2: jest.fn(),
      overflow: 2,
      variant: 'overflow',
    },
  ])('rejects an unsupported collection %#', (props) => {
    expect(() => AvatarGroup(props as never)).toThrow(/Unsupported Avatar Group/u);
  });

  it.each(rejectedImageSources)('rejects a non-local nested image source %#', (source) => {
    expect(() => AvatarGroup({
      identities: [
        { name: 'Remote player', presence: 'online', source },
        groupPlayers[1],
      ],
      variant: '2-players',
    } as never)).toThrow(/source must be bundled or local/u);
  });
});

describe('Avatar Picker runtime and semantic contract', () => {
  it.each([
    ['empty', 'Add a profile photo', 136],
    ['initials', 'Change profile photo', 136],
    ['photo', 'Change profile photo', 136],
    ['error', 'Add a profile photo', 160],
  ] as Array<['empty' | 'initials' | 'photo' | 'error', string, number]>)('renders the controlled %s branch as one named button', async (variant, name, height) => {
    const common = { onPress: jest.fn(), variant } as const;
    const props = variant === 'initials'
      ? { ...common, initials: 'AM' }
      : variant === 'photo'
        ? { ...common, source: { uri: 'file:///profile.webp' } }
        : common;
    const screen = await render(<AvatarPicker {...props as AvatarPickerProps} />);

    expect(screen.getByRole('button', { name })).toHaveStyle({ height });
    if (variant === 'error') {
      expect(screen.getByText('Choose a JPG or PNG under 5 MB')).toBeTruthy();
      expect(screen.getByRole('button', { name }).props.accessibilityHint)
        .toBe('Choose a JPG or PNG under 5 MB');
    }
  });

  it('emits intent without mutating its controlled content', async () => {
    const onPress = jest.fn();
    const screen = await render(<AvatarPicker onPress={onPress} variant="empty" />);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Add a profile photo' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Add a profile photo' })).toBeTruthy();
  });

  it.each([
    { initials: 'AM', onPress: jest.fn(), variant: 'empty' },
    { onPress: jest.fn(), source: { uri: 'https://example.com/photo.jpg' }, variant: 'photo' },
    { onPress: null, variant: 'empty' },
    { onPress: jest.fn(), variant: 'selected' },
  ])('rejects an unsupported picker configuration %#', (props) => {
    expect(() => AvatarPicker(props as never)).toThrow(/Unsupported Avatar Picker/u);
  });

  it.each([
    ...rejectedImageSources,
    'ftp://example.com/player.webp',
    'file:///bare-string.webp',
  ])('rejects a non-local or malformed picker source %#', (source) => {
    expect(() => AvatarPicker({
      onPress: jest.fn(),
      source,
      variant: 'photo',
    } as never)).toThrow(/bundled or local image source/u);
  });
});

describe('Avatar Group and Picker Storybook contracts', () => {
  it('accounts for all five story categories under exact Identity titles', () => {
    expect(AvatarGroupStories.title).toBe('Identity/Avatar Group');
    expect([
      AvatarGroupCanonical,
      AvatarGroupVariants,
      AvatarGroupStates,
      AvatarGroupBoundaries,
      AvatarGroupInteractive,
    ]).toHaveLength(5);
    expect(AvatarPickerStories.title).toBe('Identity/Avatar Picker');
    expect([
      AvatarPickerCanonical,
      AvatarPickerVariants,
      AvatarPickerStates,
      AvatarPickerBoundaries,
      AvatarPickerInteractive,
    ]).toHaveLength(5);
  });
});

describe('Status Chip runtime and semantic contract', () => {
  it.each(['neutral', 'success', 'warning', 'info', 'error'] as const)(
    'renders %s/default as static labelled content',
    async (style) => {
      const screen = await render(
        <StatusChip label={`${style} status`} style={style} variant="default" />,
      );
      expect(screen.getByText(`${style} status`)).toBeTruthy();
      expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
      expect(screen.queryAllByRole('button')).toHaveLength(0);
    },
  );

  it('emits the next selected value without changing controlled state', async () => {
    const onSelectedChange = jest.fn();
    const screen = await render(
      <StatusChip
        label="Confirmed"
        onSelectedChange={onSelectedChange}
        selected
        style="success"
        variant="selectable"
      />,
    );
    const chip = screen.getByRole('checkbox', { name: 'Confirmed' });
    expect(chip).toBeChecked();
    await userEvent.setup().press(chip);
    expect(onSelectedChange).toHaveBeenCalledWith(false);
    expect(chip).toBeChecked();
  });

  it('exposes the authored disabled branch and suppresses activation', async () => {
    const screen = await render(
      <StatusChip label="Unavailable" style="neutral" variant="disabled" />,
    );
    const chip = screen.getByRole('button', { name: 'Unavailable' });
    expect(chip).toBeDisabled();
    await userEvent.setup().press(chip);
    expect(chip).toBeDisabled();
  });

  it.each([
    { label: 'Wrong', style: 'warning', variant: 'selectable' },
    { label: 'Wrong', onSelectedChange: jest.fn(), selected: true, style: 'success', variant: 'default' },
    { label: 'Wrong', style: 'success', variant: 'disabled' },
    { label: '', style: 'neutral', variant: 'default' },
  ])('rejects an unsupported chip tuple %#', (props) => {
    expect(() => StatusChip(props as never)).toThrow(/Unsupported Status Chip/u);
  });
});

describe('Step Progress runtime and semantic contract', () => {
  it.each([
    [1, 'Step 1 of 3'],
    [2, 'Step 2 of 3'],
    [3, 'Step 3 of 3'],
  ] as Array<[1 | 2 | 3, string]>)('renders exact active step %i', async (value, label) => {
    const screen = await render(<StepProgress value={value} />);
    const progress = screen.getByRole('progressbar', { name: label });
    expect(progress).toHaveAccessibilityValue({ min: 1, max: 3, now: value, text: label });
    expect(screen.getByText(label)).toBeTruthy();
  });

  it('renders explicit completion text/value', async () => {
    const screen = await render(<StepProgress value="complete" />);
    const progress = screen.getByRole('progressbar', { name: 'Setup complete' });
    expect(progress).toHaveAccessibilityValue({ min: 1, max: 3, now: 3, text: 'Setup complete' });
    expect(screen.getByText('Setup complete')).toBeTruthy();
  });

  it.each([0, 4, null, undefined, '3', 'done'])('rejects arbitrary progress %p', (value) => {
    expect(() => StepProgress({ value } as never)).toThrow(/Unsupported Step Progress/u);
  });
});

describe('Status Chip and Step Progress Storybook contracts', () => {
  it('accounts for all five categories under exact titles', () => {
    expect(StatusChipStories.title).toBe('Status/Status Chip');
    expect([
      StatusChipCanonical,
      StatusChipVariants,
      StatusChipStates,
      StatusChipBoundaries,
      StatusChipInteractive,
    ]).toHaveLength(5);
    expect(StepProgressStories.title).toBe('Progress/Step Progress');
    expect([
      StepProgressCanonical,
      StepProgressVariants,
      StepProgressStates,
      StepProgressBoundaries,
      StepProgressInteractive,
    ]).toHaveLength(5);
    expect(StepProgressInteractive.parameters).toEqual(expect.objectContaining({
      applicability: expect.stringMatching(/read-only/u),
    }));
  });
});
