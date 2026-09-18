import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
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
