import { describe, expect, it } from '@jest/globals';
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
import { AvatarPicker } from '../src/design-system/components/identity/AvatarPicker';

const flattenedStyle = (style: unknown) =>
  StyleSheet.flatten(
    style as Parameters<typeof StyleSheet.flatten>[0],
  ) as Record<string, unknown>;

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
  it.each([
    ['2 players/default', { identities: groupPlayers.slice(0, 2), variant: '2-players' }],
    ['3 players/default', { identities: groupPlayers.slice(0, 3), variant: '3-players' }],
    ['4 players/default', { identities: groupPlayers, variant: '4-players' }],
    ['4 players/overflow', { identities: groupPlayers, overflow: 3, variant: 'overflow' }],
  ] as const)('renders the authored %s branch in supplied order', async (_tuple, props) => {
    const screen = await render(<AvatarGroup {...props as never} />);
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
  ])('rejects an unsupported collection %#', (props) => {
    expect(() => AvatarGroup(props as never)).toThrow(/Unsupported Avatar Group/u);
  });
});

describe('Avatar Picker runtime and semantic contract', () => {
  it.each([
    ['empty', 'Add a profile photo', 136],
    ['initials', 'Change profile photo', 136],
    ['photo', 'Change profile photo', 136],
    ['error', 'Add a profile photo', 160],
  ] as const)('renders the controlled %s branch as one named button', async (variant, name, height) => {
    const common = { onPress: jest.fn(), variant } as const;
    const props = variant === 'initials'
      ? { ...common, initials: 'AM' }
      : variant === 'photo'
        ? { ...common, source: require('../design-spec/assets/phase-3/mascot-profile.webp') }
        : common;
    const screen = await render(<AvatarPicker {...props as never} />);

    expect(screen.getByRole('button', { name })).toHaveStyle({ height });
    if (variant === 'error') {
      expect(screen.getByText('Choose a JPG or PNG under 5 MB')).toBeTruthy();
      expect(screen.getByRole('button', { name })).toHaveAccessibilityHint(
        'Choose a JPG or PNG under 5 MB',
      );
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
