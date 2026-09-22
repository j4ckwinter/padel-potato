import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';

import {
  AppleProviderMark,
  FavouriteHeartArtwork,
  GoogleProviderMark,
} from '../src/design-system/assets/artwork/actionProviderArtwork';
import {
  HeaderMascot,
  type HeaderMascotName,
} from '../src/design-system/assets/artwork/headerMascots';

describe('action, provider, and header artwork', () => {
  it.each([
    ['heart', FavouriteHeartArtwork],
    ['google', GoogleProviderMark],
    ['apple', AppleProviderMark],
  ])('renders %s as fixed decorative vector artwork', async (name, Artwork) => {
    const screen = await render(<Artwork />);
    expect(screen.queryByRole('image')).toBeNull();
    const hidden = screen.getByTestId(`phase3-artwork-${name}`, { includeHiddenElements: true });
    expect(hidden).toHaveProp('accessible', false);
    expect(hidden).toHaveProp('importantForAccessibility', 'no-hide-descendants');
    await screen.unmount();
  });

  it.each(['wave', 'search', 'create', 'players', 'profile'] as const)(
    'renders the %s header mascot as fixed decorative artwork',
    async (name: HeaderMascotName) => {
      const screen = await render(<HeaderMascot name={name} />);
      expect(screen.queryByRole('image')).toBeNull();
      const hidden = screen.getByTestId(`phase3-artwork-${name}`, { includeHiddenElements: true });
      expect(hidden).toHaveProp('accessible', false);
      expect(hidden).toHaveProp('importantForAccessibility', 'no-hide-descendants');
      await screen.unmount();
    },
  );

  it('uses only fixed local media paths and DOM-safe vector props', () => {
    const vectorSource = readFileSync(
      join(process.cwd(), 'src/design-system/assets/artwork/actionProviderArtwork.tsx'),
      'utf8',
    );
    const mascotSource = readFileSync(
      join(process.cwd(), 'src/design-system/assets/artwork/headerMascots.tsx'),
      'utf8',
    );
    expect(`${vectorSource}${mascotSource}`).not.toMatch(
      /https?:|fetch\(|XMLHttpRequest|design-spec|design-source|data-penpot/iu,
    );
    expect(mascotSource.match(/require\('\.\.\/media\/mascot-[a-z]+\.webp'\)/gu)).toHaveLength(5);
    expect(vectorSource).toContain("'aria-hidden': true");
    expect(vectorSource.match(/<Svg \{\.\.\.decorativeVector\}/gu)).toHaveLength(3);
  });
});
