import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';

import {
  AppleProviderArtwork,
  CreateHeaderMascot,
  GoogleProviderArtwork,
  HeartArtwork,
  PlayersHeaderMascot,
  ProfileHeaderMascot,
  SearchHeaderMascot,
  WaveHeaderMascot,
} from '../src/design-system/components/generated/phase3Artwork';

type ArtworkEntry = {
  key: string;
  path: string;
  sha256: string;
  source: Record<string, unknown>;
  profile: Record<string, unknown>;
};

type HeaderReference = {
  key: string;
  mascot: string;
  path: string;
  screenId: string;
  headerInstanceId: string;
  imageInstanceId: string;
};

type ArtworkManifest = {
  source: {
    fileId: string;
    pageId: string;
    productPageId: string;
    revision: number;
  };
  vectors: ArtworkEntry[];
  mascots: ArtworkEntry[];
  appHeaderReferences: HeaderReference[];
};

const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, 'design-spec/assets/phase-3/artwork-manifest.json'), 'utf8'),
) as ArtworkManifest;

describe('Phase 3 artwork evidence', () => {
  it('pins the exact revision-296 identity and eight retained files', () => {
    expect(manifest.source).toEqual({
      fileId: 'c514c1fb-1cda-8125-8008-a606253a77a3',
      pageId: '482a7222-5a3b-8086-8008-a6073072bbb1',
      productPageId: '482a7222-5a3b-8086-8008-a608ebaf11cd',
      revision: 296,
    });
    expect([...manifest.vectors, ...manifest.mascots].map((entry) => entry.path)).toEqual([
      'design-spec/assets/phase-3/heart.svg',
      'design-spec/assets/phase-3/google.svg',
      'design-spec/assets/phase-3/apple.svg',
      'design-spec/assets/phase-3/mascot-wave.webp',
      'design-spec/assets/phase-3/mascot-search.webp',
      'design-spec/assets/phase-3/mascot-create.webp',
      'design-spec/assets/phase-3/mascot-players.webp',
      'design-spec/assets/phase-3/mascot-profile.webp',
    ]);
    for (const entry of [...manifest.vectors, ...manifest.mascots]) {
      expect(entry.sha256).toMatch(/^[a-f0-9]{64}$/u);
      expect(entry.source).not.toEqual({});
      expect(entry.profile).not.toEqual({});
    }
  });

  it('records six full App Header references over five outputs and explicit Games reuse', () => {
    expect(manifest.appHeaderReferences).toHaveLength(6);
    expect(new Set(manifest.appHeaderReferences.map((reference) => reference.path)).size).toBe(5);
    expect(manifest.appHeaderReferences.map((reference) => reference.key)).toEqual([
      'home',
      'gamesDiscover',
      'gamesMyGames',
      'create',
      'players',
      'profile',
    ]);
    for (const reference of manifest.appHeaderReferences) {
      expect(reference.screenId).toMatch(/^[a-f0-9-]{36}$/u);
      expect(reference.headerInstanceId).toMatch(/^[a-f0-9-]{36}$/u);
      expect(reference.imageInstanceId).toMatch(/^[a-f0-9-]{36}$/u);
    }
    expect(manifest.appHeaderReferences.filter((reference) => reference.key.startsWith('games')))
      .toEqual([
        expect.objectContaining({ mascot: 'search', path: 'design-spec/assets/phase-3/mascot-search.webp' }),
        expect.objectContaining({ mascot: 'search', path: 'design-spec/assets/phase-3/mascot-search.webp' }),
      ]);
  });
});

describe('closed Phase 3 runtime artwork', () => {
  it.each([
    ['heart', HeartArtwork],
    ['google', GoogleProviderArtwork],
    ['apple', AppleProviderArtwork],
    ['wave', WaveHeaderMascot],
    ['search', SearchHeaderMascot],
    ['create', CreateHeaderMascot],
    ['players', PlayersHeaderMascot],
    ['profile', ProfileHeaderMascot],
  ])('renders %s as fixed decorative artwork', async (_name, Artwork) => {
    const screen = await render(<Artwork />);
    expect(screen.queryByRole('image')).toBeNull();
    const hidden = screen.getByTestId(`phase3-artwork-${_name}`, { includeHiddenElements: true });
    expect(hidden).toHaveProp('accessible', false);
    expect(hidden).toHaveProp('accessibilityElementsHidden', true);
    expect(hidden).toHaveProp('importantForAccessibility', 'no-hide-descendants');
    await screen.unmount();
  });

  it('keeps the generated surface fixed, local, and family-only', () => {
    const source = fs.readFileSync(
      path.join(root, 'src/design-system/components/generated/phase3Artwork.tsx'),
      'utf8',
    );
    expect(source).not.toMatch(/https?:|fetch\(|XMLHttpRequest|Penpot|penpot|IconName|theme|token/u);
    expect(source).not.toMatch(/export type|props[:),]|source\s*[:=]\s*\w|uri\s*:/u);
    expect(source.match(/require\('\.\.\/\.\.\/\.\.\/\.\.\/design-spec\/assets\/phase-3\/mascot-[a-z]+\.webp'\)/gu))
      .toHaveLength(5);
  });
});

describe('Phase 3 artwork integrity validator', () => {
  it('passes clean retained evidence deterministically offline', () => {
    const result = spawnSync(process.execPath, ['scripts/validate-phase-3-artwork.mjs'], {
      cwd: root,
      encoding: 'utf8',
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Phase 3 artwork validation passed');
  });

  it('uses isolated fixtures to reject every controlled drift and unsafe surface', () => {
    const result = spawnSync(
      process.execPath,
      ['scripts/validate-phase-3-artwork.mjs', '--self-test'],
      { cwd: root, encoding: 'utf8' },
    );
    expect(result.status).toBe(0);
    for (const label of [
      'file identity',
      'page identity',
      'revision',
      'changed hash',
      'unsafe traversal path',
      'unsafe absolute path',
      'remote path',
      'unsupported profile',
      'changed source id',
      'missing inventory entry',
      'extra inventory entry',
      'changed header mapping',
      'remote runtime reference',
      'runtime source access',
      'generic artwork export',
      'swapped vector paths',
      'changed path ownership',
    ]) {
      expect(result.stdout).toContain(`rejected ${label}`);
    }
    expect(result.stdout).toContain('17 controlled rejections passed');
  });
});
