import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';

import {
  AppleProviderArtwork, CreateHeaderMascot, GoogleProviderArtwork, HeartArtwork,
  PlayersHeaderMascot, ProfileHeaderMascot, SearchHeaderMascot, WaveHeaderMascot,
} from '../src/design-system/components/generated/phase3Artwork';

describe('Phase 3 runtime artwork', () => {
  it.each([
    ['heart', HeartArtwork], ['google', GoogleProviderArtwork], ['apple', AppleProviderArtwork],
    ['wave', WaveHeaderMascot], ['search', SearchHeaderMascot], ['create', CreateHeaderMascot],
    ['players', PlayersHeaderMascot], ['profile', ProfileHeaderMascot],
  ])('renders %s as fixed decorative artwork', async (name, Artwork) => {
    const screen = await render(<Artwork />);
    expect(screen.queryByRole('image')).toBeNull();
    const hidden = screen.getByTestId(`phase3-artwork-${name}`, { includeHiddenElements: true });
    expect(hidden).toHaveProp('accessible', false);
    expect(hidden).toHaveProp('importantForAccessibility', 'no-hide-descendants');
    await screen.unmount();
  });

  it('uses only fixed local media paths and DOM-safe vector props', () => {
    const source = readFileSync(join(process.cwd(), 'src/design-system/components/generated/phase3Artwork.tsx'), 'utf8');
    expect(source).not.toMatch(/https?:|fetch\(|XMLHttpRequest|design-spec|design-source|data-penpot/iu);
    expect(source.match(/require\('\.\.\/\.\.\/assets\/media\/mascot-[a-z]+\.webp'\)/gu)).toHaveLength(5);
    expect(source).toContain("'aria-hidden': true");
    expect(source.match(/<Svg \{\.\.\.decorativeVector\}/gu)).toHaveLength(3);
  });
});
