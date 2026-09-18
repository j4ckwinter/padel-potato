import { describe, expect, it } from '@jest/globals';
import { render, within } from '@testing-library/react-native';

import {
  FoundationGallery,
  type FoundationCategory,
} from '../src/design-system/foundations/FoundationGallery';
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
  ['colors', 'Colors', Object.keys(colors)],
  ['typography', 'Typography', Object.keys(typography)],
  ['spacing', 'Spacing', Object.keys(spacing)],
  ['radii', 'Radii', Object.keys(radii)],
  ['dimensions', 'Dimensions', Object.keys(dimensions)],
  ['borders', 'Borders', Object.keys(borders)],
  ['opacity', 'Opacity', Object.keys(opacity)],
];

describe('FoundationGallery', () => {
  it('renders every category in the retained Penpot section order', async () => {
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
    'renders the complete %s category with provenance-backed specimens',
    async (category, heading, tokenNames) => {
      const screen = await render(<FoundationGallery category={category} />);
      const section = screen.getByTestId(`foundation-section-${category}`);

      expect(within(section).getByRole('header', { name: heading })).toBeVisible();
      expect(within(section).getAllByTestId(/^foundation-token-/)).toHaveLength(
        tokenNames.length,
      );

      tokenNames.forEach((tokenName) => {
        expect(within(section).getByText(tokenName)).toBeVisible();
        expect(
          within(section).getByTestId(`foundation-source-${category}-${tokenName}`),
        ).toBeVisible();
      });
    },
  );

  it('fails explicitly for unsupported runtime input', () => {
    expect(() =>
      FoundationGallery({ category: '' as FoundationCategory }),
    ).toThrow('Unsupported foundation category: ""');
  });
});
