import { describe, expect, it } from '@jest/globals';
import { render, within } from '@testing-library/react-native';

import {
  FoundationGallery,
  type FoundationCategory,
} from '../src/design-system/foundations/FoundationGallery';
import galleryMeta, {
  AllFoundations,
  Borders,
  Colors,
  Dimensions,
  Opacity,
  Radii,
  Spacing,
  Typography,
} from '../src/design-system/foundations/FoundationGallery.stories';
import {
  borders,
  colors,
  dimensions,
  opacity,
  radii,
  spacing,
  typography,
} from '../src/design-system/tokens';

const categoryCases: Array<[FoundationCategory, string, string[]]> = [
  ['colors', 'Semantic colors', Object.keys(colors)],
  ['typography', 'Typography', Object.keys(typography)],
  ['spacing', 'Spacing', Object.keys(spacing)],
  ['radii', 'Radii', Object.keys(radii)],
  ['dimensions', 'Dimensions', Object.keys(dimensions)],
  ['borders', 'Borders', Object.keys(borders)],
  ['opacity', 'Opacity', Object.keys(opacity)],
];

describe('FoundationGallery', () => {
  it('renders every foundation category in the retained section order', async () => {
    const screen = await render(<FoundationGallery />);
    const gallery = screen.getByTestId('foundation-gallery');

    expect(
      within(gallery)
        .getAllByRole('header')
        .map((heading) => heading.props.children),
    ).toEqual([
      'Padel Potato Foundations',
      ...categoryCases.map(([, heading]) => heading),
    ]);
  });

  it.each(categoryCases)(
    'renders the complete %s category with standalone specimens',
    async (category, heading, tokenNames) => {
      const screen = await render(<FoundationGallery category={category} />);
      const section = screen.getByTestId(`foundation-section-${category}`);

      expect(within(section).getByRole('header', { name: heading })).toBeVisible();
      expect(within(section).getAllByTestId(/^foundation-token-/)).toHaveLength(
        tokenNames.length,
      );

      tokenNames.forEach((tokenName) => {
        expect(within(section).getByText(tokenName)).toBeVisible();
      });
    },
  );

  it('fails explicitly for unsupported runtime input', () => {
    expect(() =>
      FoundationGallery({ category: '' as FoundationCategory }),
    ).toThrow('Unsupported foundation category: ""');
  });
});

describe('Foundations/Overview stories', () => {
  const stories = {
    AllFoundations,
    Colors,
    Typography,
    Spacing,
    Radii,
    Dimensions,
    Borders,
    Opacity,
  };

  it('publishes the stable taxonomy and all eight named stories', () => {
    expect(galleryMeta.title).toBe('Foundations/Overview');
    expect(Object.keys(stories)).toEqual([
      'AllFoundations',
      'Colors',
      'Typography',
      'Spacing',
      'Radii',
      'Dimensions',
      'Borders',
      'Opacity',
    ]);
  });

  it.each(Object.entries(stories))(
    'renders the non-empty %s story through bounded gallery args',
    async (_name, story) => {
      const screen = await render(<FoundationGallery {...story.args} />);

      expect(screen.getByText('Padel Potato Foundations')).toBeVisible();
      expect(screen.getAllByTestId(/^foundation-token-/).length).toBeGreaterThan(0);
    },
  );

  it('accounts for all 45 authored manifest records in aggregate', async () => {
    const screen = await render(<FoundationGallery {...AllFoundations.args} />);

    expect(screen.getAllByTestId(/^foundation-token-/)).toHaveLength(45);
  });
});
