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
  ResponsiveLayout,
  Rhythm,
  Sizing,
  Opacity,
  Radii,
  Spacing,
  Typography,
} from '../src/design-system/foundations/FoundationGallery.stories';
import {
  borders,
  colors,
  dimensions,
  layoutWidths,
  opacity,
  radii,
  sizing,
  spacing,
  typography,
} from '../src/design-system/tokens';

const categoryCases: [FoundationCategory, string, string[]][] = [
  ['colors', 'Semantic colors', Object.keys(colors)],
  ['typography', 'Typography', Object.keys(typography)],
  ['spacing', 'Spacing', Object.keys(spacing)],
  ['radii', 'Radii', Object.keys(radii)],
  ['dimensions', 'Dimensions', Object.keys(dimensions)],
  ['sizing', 'Sizing', Object.keys(sizing)],
  ['layout', 'Responsive layout', Object.keys(layoutWidths)],
  ['rhythm', 'Four-point rhythm', Object.keys(spacing)],
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

      expect(
        within(section).getByRole('header', { name: heading }),
      ).toBeVisible();
      expect(within(section).getAllByTestId(/^foundation-token-/)).toHaveLength(
        tokenNames.length,
      );

      tokenNames.forEach((tokenName) => {
        expect(within(section).getAllByText(tokenName)[0]).toBeVisible();
      });
    },
  );

  it('fails explicitly for unsupported runtime input', () => {
    expect(() =>
      FoundationGallery({ category: '' as FoundationCategory }),
    ).toThrow(
      'Unsupported design-system value: . Supported values: colors, typography, spacing, radii, dimensions, sizing, layout, rhythm, borders, opacity',
    );
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
    Sizing,
    ResponsiveLayout,
    Rhythm,
    Borders,
    Opacity,
  };

  it('publishes the stable taxonomy and all foundation stories', () => {
    expect(galleryMeta.title).toBe('Foundations/Overview');
    expect(Object.keys(stories)).toEqual([
      'AllFoundations',
      'Colors',
      'Typography',
      'Spacing',
      'Radii',
      'Dimensions',
      'Sizing',
      'ResponsiveLayout',
      'Rhythm',
      'Borders',
      'Opacity',
    ]);
  });

  it.each(Object.entries(stories))(
    'renders the non-empty %s story through bounded gallery args',
    async (_name, story) => {
      const screen = await render(<FoundationGallery {...story.args} />);

      expect(screen.getByText('Padel Potato Foundations')).toBeVisible();
      expect(
        screen.getAllByTestId(/^foundation-token-/).length,
      ).toBeGreaterThan(0);
    },
  );

  it('accounts for every published foundation token in aggregate', async () => {
    const screen = await render(<FoundationGallery {...AllFoundations.args} />);

    expect(screen.getAllByTestId(/^foundation-token-/)).toHaveLength(
      categoryCases.reduce((count, [, , tokens]) => count + tokens.length, 0),
    );
  });
});
