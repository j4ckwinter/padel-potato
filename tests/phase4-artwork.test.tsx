import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';

import {
  GameCreatedIllustratedCardArtwork,
  InvitePlayersIllustratedCardArtwork,
  MatchResultIllustratedCardArtwork,
  NextGameIllustratedCardArtwork,
  NoGamesEmptyStateArtwork,
  NoNotificationsEmptyStateArtwork,
  NoPlayersEmptyStateArtwork,
} from '../src/design-system/components/generated/phase4Artwork';

type MediaEntry = {
  key: string;
  path: string;
  disposition: 'phase4-extracted' | 'phase3-reused';
  sha256: string;
  bytes: number;
  source: { mediaRecordId: string; mediaId: string; mediaName: string };
  profile: { local: boolean; mime: string; width: number; height: number };
};

type PlacementEntry = {
  key: string;
  family: string;
  variant: Record<string, string>;
  renderSize: { width: number; height: number };
  media: string;
  path: string;
  source: { componentId: string; mainInstanceId: string; imageShapeId: string };
};

type ArtworkManifest = {
  source: { fileId: string; pageId: string; revision: number };
  media: MediaEntry[];
  placements: PlacementEntry[];
};

const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'design-spec/assets/phase-4/artwork-manifest.json'), 'utf8')) as ArtworkManifest;
const sha256 = (bytes: Buffer) => crypto.createHash('sha256').update(bytes).digest('hex');

describe('Phase 4 artwork evidence', () => {
  it('pins six exact local media records across seven authored placements', () => {
    expect(manifest.source).toEqual({
      fileId: 'c514c1fb-1cda-8125-8008-a606253a77a3',
      pageId: '482a7222-5a3b-8086-8008-a6073072bbb1',
      revision: 296,
    });
    expect(manifest.media).toHaveLength(6);
    expect(manifest.placements).toHaveLength(7);
    expect(new Set(manifest.media.map((entry) => entry.source.mediaRecordId)).size).toBe(6);
    expect(manifest.placements.map((entry) => entry.key)).toEqual([
      'emptyStateNoGames',
      'emptyStateNoNotifications',
      'emptyStateNoPlayers',
      'illustratedCardNextGame',
      'illustratedCardMatchResult',
      'illustratedCardInvitePlayers',
      'illustratedCardGameCreated',
    ]);
  });

  it('retains exactly three new files and reuses exact Phase 3 paths', () => {
    expect(manifest.media.filter((entry) => entry.disposition === 'phase4-extracted').map((entry) => entry.path)).toEqual([
      'design-spec/assets/phase-4/mascot-no-games.webp',
      'design-spec/assets/phase-4/mascot-match-result.webp',
      'design-spec/assets/phase-4/mascot-game-created.webp',
    ]);
    expect(manifest.media.filter((entry) => entry.disposition === 'phase3-reused').map((entry) => entry.path)).toEqual([
      'design-spec/assets/phase-3/mascot-wave.webp',
      'design-spec/assets/phase-3/mascot-search.webp',
      'design-spec/assets/phase-3/mascot-profile.webp',
    ]);
    for (const entry of manifest.media) {
      const bytes = fs.readFileSync(path.join(root, entry.path));
      expect(bytes).toHaveLength(entry.bytes);
      expect(sha256(bytes)).toBe(entry.sha256);
      expect(entry.profile).toEqual({ local: true, mime: 'image/webp', width: 1254, height: 1254 });
    }
  });
});

describe('closed Phase 4 runtime artwork', () => {
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
    expect(hidden).toHaveProp('accessibilityElementsHidden', true);
    expect(hidden).toHaveProp('importantForAccessibility', 'no-hide-descendants');
    expect(hidden).toHaveStyle({ height: size, width: size });
    await screen.unmount();
  });

  it('keeps literal local requires and a zero-argument family-only surface', () => {
    const source = fs.readFileSync(path.join(root, 'src/design-system/components/generated/phase4Artwork.tsx'), 'utf8');
    expect(source).not.toMatch(/https?:|fetch\(|XMLHttpRequest|\.penpot|artwork-manifest|\buri\s*:|IconName|theme|token/u);
    expect(source).not.toMatch(/export (?:type|interface|const)|export function \w+\([^)]{1,}\)/u);
    expect(source.match(/require\('\.\.\/\.\.\/\.\.\/\.\.\/design-spec\/assets\/phase-[34]\/mascot-[a-z-]+\.webp'\)/gu)).toHaveLength(7);
  });
});

describe('Phase 4 artwork integrity validator', () => {
  it('passes clean retained evidence deterministically offline', () => {
    const result = spawnSync(process.execPath, ['scripts/validate-phase-4-artwork.mjs'], { cwd: root, encoding: 'utf8' });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Phase 4 artwork validation passed');
  });

  it('uses isolated fixtures to reject every controlled drift and unsafe surface', () => {
    const result = spawnSync(process.execPath, ['scripts/validate-phase-4-artwork.mjs', '--self-test'], { cwd: root, encoding: 'utf8' });
    expect(result.status).toBe(0);
    for (const label of [
      'file identity', 'page identity', 'revision', 'changed media id', 'changed hash',
      'changed byte size', 'changed profile', 'missing media', 'extra media', 'missing placement',
      'extra placement', 'reordered placement', 'unsafe traversal path', 'unsafe absolute path',
      'remote manifest path', 'changed reused path', 'remote runtime reference', 'dynamic runtime require',
      'generalized runtime props', 'changed runtime geometry', 'accessible runtime artwork',
    ]) expect(result.stdout).toContain(`rejected ${label}`);
    expect(result.stdout).toContain('21 controlled rejections passed');
  });
});
