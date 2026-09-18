import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import {
  phase2StoryContracts,
  phase2StorySources,
  storyTaxonomy,
} from '../src/design-system/stories/storyContract';
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

type StoryLike = {
  args?: Record<string, unknown>;
  render?: (args: Record<string, unknown>) => ReactElement;
};

const renderStory = (story: StoryLike, args = story.args ?? {}) => {
  if (!story.render) throw new Error('Story has no render function');
  return render(story.render(args));
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

    for (const exportName of ['Text', 'Stack', 'Inline', 'Surface', 'Pressable'] as const) {
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
      expect(meta.argTypes?.onPress).toBeUndefined();
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

  it('renders exact retained Penpot identity in every primitive Canonical story', () => {
    const canonicalStories = [
      ['Text', TextCanonical],
      ['Stack', LayoutCanonical],
      ['Inline', LayoutCanonical],
      ['Surface', SurfaceCanonical],
      ['Pressable', PressableCanonical],
    ] as const;

    for (const [exportName, story] of canonicalStories) {
      const screen = renderStory(story);
      const source = phase2StorySources[exportName];
      expect(
        screen.getByText(
          `Penpot ${source.fileId} / ${source.pageId} / revision ${source.revision} / source ${source.sourceId}`,
        ),
      ).toBeVisible();
      screen.unmount();
    }
  });

  it('renders constrained zero, one, many, Unicode wrapping, and explicit truncation witnesses', () => {
    const stories = [TextBoundaries, LayoutBoundaries, SurfaceBoundaries];
    for (const story of stories) {
      const screen = renderStory(story);
      expect(screen.getByTestId('boundary-zero')).toBeVisible();
      expect(screen.getByTestId('boundary-one')).toBeVisible();
      expect(screen.getByTestId('boundary-many')).toBeVisible();
      expect(screen.getByText(/Łucía 🚀／東京/)).toBeVisible();
      expect(screen.getByTestId('boundary-explicit-truncation')).toHaveProp(
        'numberOfLines',
        1,
      );
      screen.unmount();
    }
  });

  it('keeps Pressable interaction bounded, named, and action-backed', () => {
    const states = renderStory(PressableStates);
    expect(states.getByText('Enabled')).toBeVisible();
    expect(states.getByText('Pressed: hold the enabled control')).toBeVisible();
    expect(states.getByText('Focus demonstration')).toBeVisible();
    expect(states.getByText('Disabled')).toBeDisabled();
    expect(states.getByText('Loading')).toBeDisabled();
    states.unmount();

    const onPress = jest.fn();
    const interactive = renderStory(PressableInteractive, { onPress });
    const action = interactive.getByRole('button', { name: 'Activate example' });
    fireEvent.press(action);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(interactive.getByText('Activate example')).toBeVisible();
  });
});
