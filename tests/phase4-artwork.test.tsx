import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';

import {
  GameCreatedIllustratedCardArtwork, InvitePlayersIllustratedCardArtwork,
  MatchResultIllustratedCardArtwork, NextGameIllustratedCardArtwork,
  NoGamesEmptyStateArtwork, NoNotificationsEmptyStateArtwork, NoPlayersEmptyStateArtwork,
} from '../src/design-system/components/generated/phase4Artwork';

describe('Phase 4 runtime artwork', () => {
  it.each([
    ['empty-state-no-games', 96, NoGamesEmptyStateArtwork],
    ['empty-state-no-notifications', 96, NoNotificationsEmptyStateArtwork],
    ['empty-state-no-players', 96, NoPlayersEmptyStateArtwork],
    ['illustrated-card-next-game', 80, NextGameIllustratedCardArtwork],
    ['illustrated-card-match-result', 80, MatchResultIllustratedCardArtwork],
    ['illustrated-card-invite-players', 80, InvitePlayersIllustratedCardArtwork],
    ['illustrated-card-game-created', 80, GameCreatedIllustratedCardArtwork],
  ])('renders %s at %ipx as fixed decorative artwork', async (name, size, Artwork) => {
    const screen = await render(<Artwork />);
    expect(screen.queryByRole('image')).toBeNull();
    const hidden = screen.getByTestId(`phase4-artwork-${name}`, { includeHiddenElements: true });
    expect(hidden).toHaveProp('accessible', false);
    expect(hidden).toHaveStyle({ height: size, width: size });
    await screen.unmount();
  });

  it('uses literal component-local media paths and exposes no configurable artwork API', () => {
    const source = readFileSync(join(process.cwd(), 'src/design-system/components/generated/phase4Artwork.tsx'), 'utf8');
    expect(source).not.toMatch(/https?:|fetch\(|XMLHttpRequest|design-spec|design-source|data-penpot/iu);
    expect(source).not.toMatch(/export (?:type|interface|const)|export function \w+\([^)]{1,}\)/u);
    expect(source.match(/require\('\.\.\/\.\.\/assets\/media\/mascot-[a-z-]+\.webp'\)/gu)).toHaveLength(7);
  });
});
