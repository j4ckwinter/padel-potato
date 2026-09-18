import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import {
  phase2Backstops,
  phase2StoryContracts,
  phase2StorySources,
  storyTaxonomy,
} from '../src/design-system/stories/storyContract';
import brandMeta, {
  Boundaries as BrandBoundaries,
  Canonical as BrandCanonical,
  Variants as BrandVariants,
} from '../src/design-system/assets/Brand.stories';
import iconsMeta, {
  Boundaries as IconBoundaries,
  Canonical as IconCanonical,
  Variants as IconVariants,
} from '../src/design-system/assets/Icon.stories';
import { iconNames } from '../src/design-system/assets/generated/iconRegistry';
import layoutMeta, {
  Boundaries as LayoutBoundaries,
  Canonical as LayoutCanonical,
  Variants as LayoutVariants,
} from '../src/design-system/primitives/Layout.stories';
import pressableMeta, {
  Boundaries as PressableBoundaries,
  Canonical as PressableCanonical,
  Interactive as PressableInteractive,
  States as PressableStates,
  Variants as PressableVariants,
} from '../src/design-system/primitives/Pressable.stories';
import surfaceMeta, {
  Boundaries as SurfaceBoundaries,
  Canonical as SurfaceCanonical,
  Variants as SurfaceVariants,
} from '../src/design-system/primitives/Surface.stories';
import textMeta, {
  Boundaries as TextBoundaries,
  Canonical as TextCanonical,
  Variants as TextVariants,
} from '../src/design-system/primitives/Text.stories';
import { colors, spacing, typography } from '../src/design-system/tokens';

type StoryLike = { args?: unknown; render?: unknown };

const renderStory = async (story: StoryLike, args = story.args ?? {}) => {
  if (typeof story.render !== 'function') throw new Error('Story has no render function');
  const storyRender = story.render as (
    storyArgs: Record<string, unknown>,
    context: Record<string, never>,
  ) => ReactElement;
  return render(storyRender(args as Record<string, unknown>, {}));
};

describe('Phase 2 Storybook contract', () => {
  it('fixes the exact taxonomy and accounts for every primitive category', () => {
    expect(storyTaxonomy).toEqual([
      'Canonical',
      'Variants',
      'States',
      'Boundaries',
      'Interactive',
    ]);

    for (const exportName of [
      'Text',
      'Stack',
      'Inline',
      'Surface',
      'Pressable',
      'Icon',
      'BrandLockup',
      'BrandLockupStacked',
    ] as const) {
      const contract = phase2StoryContracts[exportName];
      expect(Object.keys(contract.categories)).toEqual(storyTaxonomy);

      for (const category of storyTaxonomy) {
        const entry = contract.categories[category];
        if (entry.status === 'inapplicable') {
          expect(entry.reason.trim().length).toBeGreaterThan(0);
        } else {
          expect(entry.story.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('uses exact primitive group titles and only closed registry controls', () => {
    expect(textMeta.title).toBe('Primitives/Text');
    expect(layoutMeta.title).toBe('Primitives/Layout');
    expect(surfaceMeta.title).toBe('Primitives/Surface');
    expect(pressableMeta.title).toBe('Primitives/Pressable');

    expect(textMeta.argTypes?.variant?.options).toEqual(Object.keys(typography));
    expect(textMeta.argTypes?.color?.options).toEqual(Object.keys(colors));
    expect(layoutMeta.argTypes?.gap?.options).toEqual(Object.keys(spacing));
    expect(layoutMeta.argTypes?.padding?.options).toEqual(Object.keys(spacing));
    expect(surfaceMeta.argTypes?.background?.options).toEqual(Object.keys(colors));
    expect(pressableMeta.argTypes?.size?.options).toEqual([
      'controlHeight40',
      'controlHeight44',
      'controlHeight48',
    ]);

    const metas = [textMeta, layoutMeta, surfaceMeta];
    for (const meta of metas) {
      expect('onPress' in (meta.argTypes ?? {})).toBe(false);
      for (const argType of Object.values(meta.argTypes ?? {})) {
        expect(argType).not.toHaveProperty('control', 'object');
        expect(argType).not.toHaveProperty('control', 'number');
        expect(argType).not.toHaveProperty('control', 'color');
      }
    }
    expect(pressableMeta.argTypes?.onPress).toEqual({ action: 'pressed' });
  });

  it('publishes deterministic primitive stories for applicable categories', () => {
    expect([
      TextCanonical,
      TextVariants,
      TextBoundaries,
      LayoutCanonical,
      LayoutVariants,
      LayoutBoundaries,
      SurfaceCanonical,
      SurfaceVariants,
      SurfaceBoundaries,
      PressableCanonical,
      PressableVariants,
      PressableStates,
      PressableBoundaries,
      PressableInteractive,
    ].every((story) => typeof story.render === 'function')).toBe(true);
  });

  it('renders exact retained Penpot identity in every primitive Canonical story', async () => {
    const canonicalStories = [
      ['Text', TextCanonical],
      ['Stack', LayoutCanonical],
      ['Inline', LayoutCanonical],
      ['Surface', SurfaceCanonical],
      ['Pressable', PressableCanonical],
    ] as const;

    for (const [exportName, story] of canonicalStories) {
      const screen = await renderStory(story);
      const source = phase2StorySources[exportName];
      expect(
        screen.getByText(
          `Penpot ${source.fileId} / ${source.pageId} / revision ${source.revision} / source ${source.sourceId}`,
        ),
      ).toBeVisible();
      await screen.unmount();
    }
  });

  it('renders constrained zero, one, many, Unicode wrapping, and explicit truncation witnesses', async () => {
    const stories = [TextBoundaries, LayoutBoundaries, SurfaceBoundaries];
    for (const story of stories) {
      const screen = await renderStory(story);
      expect(screen.getByTestId('boundary-zero')).toBeVisible();
      expect(screen.getByTestId('boundary-one')).toBeVisible();
      expect(screen.getByTestId('boundary-many')).toBeVisible();
      expect(screen.getAllByText(/Łucía 🚀／東京/).length).toBeGreaterThan(0);
      expect(screen.getByTestId('boundary-explicit-truncation')).toHaveProp(
        'numberOfLines',
        1,
      );
      await screen.unmount();
    }
  });

  it('keeps Pressable interaction bounded, named, and action-backed', async () => {
    const states = await renderStory(PressableStates);
    expect(states.getByText('Enabled')).toBeVisible();
    expect(states.getByText('Pressed: hold the enabled control')).toBeVisible();
    expect(states.getByText('Focus demonstration')).toBeVisible();
    expect(states.getByText('Disabled')).toBeDisabled();
    expect(states.getByText('Loading')).toBeDisabled();
    await states.unmount();

    const onPress = jest.fn();
    const interactive = await renderStory(PressableInteractive, { onPress });
    const action = interactive.getByRole('button', { name: 'Activate example' });
    fireEvent.press(action);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(interactive.getByText('Activate example')).toBeVisible();
  });

  it('publishes the complete ordered icon gallery with closed controls', async () => {
    expect(iconsMeta.title).toBe('Assets/Icons');
    expect(iconsMeta.argTypes?.name?.options).toEqual(iconNames);
    expect(iconsMeta.argTypes?.color?.options).toEqual(Object.keys(colors));
    expect(iconsMeta.argTypes?.size?.options).toEqual(['iconSize20']);

    const screen = await renderStory(IconVariants);
    expect(
      screen
        .getAllByTestId(/^icon-gallery-/)
        .map((node) => node.props.testID.replace('icon-gallery-', '')),
    ).toEqual(iconNames);
  });

  it('renders both authored lockups with fixed ratios and no content or colour controls', async () => {
    expect(brandMeta.title).toBe('Assets/Brand');
    expect(brandMeta.argTypes).toEqual({});

    const screen = await renderStory(BrandVariants);
    expect(screen.getByTestId('brand-lockup-horizontal')).toHaveStyle({
      height: 72,
      width: 300,
    });
    expect(screen.getByTestId('brand-lockup-stacked')).toHaveStyle({
      height: 56,
      width: 300,
    });
    expect(screen.getAllByRole('image', { name: 'Padel Potato' })).toHaveLength(2);
  });

  it('renders exact retained Penpot identity in both asset Canonical stories', async () => {
    const iconScreen = await renderStory(IconCanonical);
    const iconSource = phase2StorySources.Icon;
    expect(
      iconScreen.getByText(
        `Penpot ${iconSource.fileId} / ${iconSource.pageId} / revision ${iconSource.revision} / source ${iconSource.sourceId}`,
      ),
    ).toBeVisible();
    await iconScreen.unmount();

    const brandScreen = await renderStory(BrandCanonical);
    for (const exportName of ['BrandLockup', 'BrandLockupStacked'] as const) {
      const source = phase2StorySources[exportName];
      expect(
        brandScreen.getByText(
          `Penpot ${source.fileId} / ${source.pageId} / revision ${source.revision} / source ${source.sourceId}`,
        ),
      ).toBeVisible();
    }
  });

  it('distinguishes decorative and labelled icons and scales local assets by authored ratios', async () => {
    const icons = await renderStory(IconBoundaries);
    expect(icons.getByRole('image', { name: 'Labelled icon' })).toBeVisible();
    expect(
      icons.getByTestId('decorative-icon', { includeHiddenElements: true }),
    ).toBeVisible();
    await icons.unmount();

    const brands = await renderStory(BrandBoundaries);
    expect(brands.getByTestId('brand-boundary-horizontal')).toHaveStyle({
      height: 28.8,
      width: 120,
    });
    expect(brands.getByTestId('brand-boundary-stacked')).toHaveStyle({
      height: 22.4,
      width: 120,
    });
  });

  it('keeps both UI backstops machine-detectable without claiming native proof', () => {
    expect(phase2Backstops.overflow).toEqual({
      exports: ['Text', 'Stack', 'Inline', 'Surface'],
      constrainedWidthRendered: true,
      renderedWitness: 'boundary-constrained-width',
      requiredContentWitness: 'boundary-required-content',
      status: 'host-contract',
    });
    expect(phase2Backstops.longText).toEqual({
      exports: ['Text', 'Pressable'],
      constrainedWidthRendered: true,
      preservedAccessibleName: 'Activate example',
      reachableActionWitness: 'boundary-long-text-action',
      requiresNative200PercentReview: true,
      nativeStatus: 'deferred-to-phase-5',
      status: 'host-contract',
    });
  });
});
