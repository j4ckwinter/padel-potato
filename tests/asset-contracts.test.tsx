import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { describe, expect, test } from '@jest/globals';
import { render } from '@testing-library/react-native';
import { SvgXml } from 'react-native-svg';

import {
  BrandLockup,
  type BrandLockupProps,
} from '../src/design-system/assets/BrandLockup';
import {
  BrandLockupStacked,
  type BrandLockupStackedProps,
} from '../src/design-system/assets/BrandLockupStacked';
import { Icon, type IconProps } from '../src/design-system/assets/Icon';
import { iconNames, iconRegistry } from '../src/design-system/assets/generated/iconRegistry';
import { colors, dimensions } from '../src/design-system/tokens';
import * as assetExports from '../src/design-system/assets';
import * as designSystemExports from '../src/design-system';

const expectedIconNames = [
  'add', 'back', 'calendar', 'check', 'chevron', 'clock', 'close', 'court', 'eye',
  'filter', 'home', 'location', 'notification', 'overflow', 'players', 'profile',
  'search', 'warning',
] as const;

const root = path.resolve(__dirname, '..');
const invalidIconInputs: [Record<string, unknown>, RegExp][] = [
  [{ name: 'missing' }, /Unsupported design-system value: missing\. Supported values:/u],
  [{ name: null }, /Unsupported design-system value: null\. Supported values:/u],
  [{ name: 'home', color: 'magenta' }, /Unsupported design-system value: magenta\. Supported values:/u],
  [{ name: 'home', color: null }, /Unsupported design-system value: null\. Supported values:/u],
  [{ name: 'home', size: 'controlHeight40' }, /Unsupported design-system value: controlHeight40\. Supported values: iconSize20/u],
  [{ name: 'home', style: { width: 40 } }, /Unsupported design-system value: style\. Supported values:/u],
  [{ name: 'home', width: 40 }, /Unsupported design-system value: width\. Supported values:/u],
  [{ name: 'home', xml: '<svg />' }, /Unsupported design-system value: xml\. Supported values:/u],
];

describe('Penpot asset evidence', () => {
  test('retains the exact revision-292 icon inventory in Penpot order', () => {
    expect(iconNames).toEqual(expectedIconNames);
    expect(Object.keys(iconRegistry)).toEqual(expectedIconNames);
    for (const name of expectedIconNames) {
      const record = iconRegistry[name];
      expect(record.fileId).toBe('c514c1fb-1cda-8125-8008-a606253a77a3');
      expect(record.pageId).toBe('482a7222-5a3b-8086-8008-a6073072bbb1');
      expect(record.revision).toBe(292);
      expect(record.viewBox).toHaveLength(4);
      expect(record.viewBox.slice(2)).toEqual([20, 20]);
      expect(record.rawSha256).toMatch(/^[a-f0-9]{64}$/);
      expect(record.normalizedSha256).toMatch(/^[a-f0-9]{64}$/);
      expect(record.xml).toContain('stroke-width="1.75"');
      expect(record.xml).toContain('currentColor');
      expect(record.xml).not.toMatch(/(?:href|src)="https?:|<script|foreignObject|on\w+=/i);
    }
  });

  test('retains both authored lockup ratios and local reference evidence', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'design-spec/assets/penpot-assets.json'), 'utf8'));
    expect(manifest.brands.map((brand: { name: string }) => brand.name)).toEqual(['brand-lockup', 'brand-lockup-stacked']);
    expect(manifest.brands.map((brand: { width: number; height: number }) => [brand.width, brand.height])).toEqual([[300, 72], [300, 56]]);
    for (const brand of manifest.brands) {
      expect(fs.existsSync(path.join(root, brand.rawPath))).toBe(true);
      expect(fs.existsSync(path.join(root, brand.normalizedPath))).toBe(true);
      expect(fs.existsSync(path.join(root, brand.referencePath))).toBe(true);
    }
  });

  test('renders normalized local geometry through react-native-svg with semantic paint', async () => {
    const { getByTestId, unmount } = await render(
      <SvgXml testID="add-icon" xml={iconRegistry.add.xml} color="#0e1716" width={20} height={20} />,
    );
    expect(getByTestId('add-icon')).toHaveProp('color', '#0e1716');
    expect(iconRegistry.add.xml.replaceAll('currentColor', '#0e1716')).toContain('stroke="#0e1716"');
    await unmount();
  });

  test('validator runs controlled tamper rejections and deterministic regeneration', () => {
    const result = spawnSync(process.execPath, ['scripts/validate-penpot-assets.mjs'], { cwd: root, encoding: 'utf8' });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('controlled rejections and deterministic regeneration passed');
  });

  test('generator derives normalized geometry only from raw Penpot bytes', () => {
    const exporter = fs.readFileSync(path.join(root, 'scripts/export-penpot-assets.mjs'), 'utf8');
    const profile = fs.readFileSync(path.join(root, 'scripts/penpot-svg-profile.mjs'), 'utf8');

    expect(exporter).toContain('normalizeRawSvg(raw.toString');
    expect(exporter).toContain('normalized bytes are not the deterministic paint-only transform');
    expect(profile).toContain('source-node attribute changed');
    expect(profile).toContain('unsupported authored paint');
  });
});

describe('Icon asset contract', () => {
  test.each(expectedIconNames)(
    'renders %s from the source-ordered local registry with exact token paint',
    async (name) => {
      const { getByTestId, unmount } = await render(
        <Icon testID={`${name}-icon`} name={name} color="accent" size="iconSize20" />,
      );
      const icon = getByTestId(`${name}-icon`, { includeHiddenElements: true });

      expect(icon).toHaveProp('color', colors.accent);
      expect(icon).toHaveProp('width', dimensions.iconSize20);
      expect(icon).toHaveProp('height', dimensions.iconSize20);
      expect(iconRegistry[name].name).toBe(name);
      expect(iconRegistry[name].xml).toContain('currentColor');
      await unmount();
    },
  );

  test('is decorative by default and becomes an image only with an explicit label', async () => {
    const decorative = await render(<Icon testID="decorative-icon" name="home" />);
    expect(decorative.queryByRole('image')).toBeNull();
    expect(decorative.getByTestId('decorative-icon', { includeHiddenElements: true })).toHaveProp(
      'importantForAccessibility',
      'no-hide-descendants',
    );
    await decorative.unmount();

    const label = 'Next court — 球場';
    const labelled = await render(<Icon name="court" accessibilityLabel={label} />);
    expect(labelled.getByRole('image', { name: label })).toBeTruthy();
    await labelled.unmount();
  });

  test.each(invalidIconInputs)(
    'rejects unsupported runtime input %# instead of falling back',
    async (props, message) => {
      await expect(render(<Icon {...(props as unknown as IconProps)} />)).rejects.toThrow(message);
    },
  );

  test('keeps every name bound to its own immutable registry record', () => {
    expect(new Set(iconNames.map((name) => iconRegistry[name])).size).toBe(iconNames.length);
    for (const name of iconNames) {
      expect(iconRegistry[name].name).toBe(name);
    }
  });

  test('has no Penpot, network, evidence-manifest, or remote asset runtime path', () => {
    const source = fs.readFileSync(
      path.join(root, 'src/design-system/assets/Icon.tsx'),
      'utf8',
    );
    expect(source).not.toMatch(/https?:|fetch\(|XMLHttpRequest|penpot-assets\.json|design-spec/u);
  });
});

describe('brand lockup asset contracts', () => {
  test('derives exact authored ratios from the sole public sizing axis', async () => {
    const horizontal = await render(
      <BrandLockup testID="horizontal-lockup" width={250} />,
    );
    expect(horizontal.getByRole('image', { name: 'Padel Potato' })).toHaveStyle({
      height: 60,
      width: 250,
    });
    await horizontal.unmount();

    const stacked = await render(
      <BrandLockupStacked testID="stacked-lockup" width={150} />,
    );
    expect(stacked.getByRole('image', { name: 'Padel Potato' })).toHaveStyle({
      height: 28,
      width: 150,
    });
    await stacked.unmount();
  });

  test('passes a contextual accessible name through without changing authored media', async () => {
    const label = 'Padel Potato home — 主頁';
    const horizontal = await render(
      <BrandLockup width={125} accessibilityLabel={label} />,
    );
    expect(horizontal.getByRole('image', { name: label })).toBeTruthy();
    await horizontal.unmount();

    const stacked = await render(
      <BrandLockupStacked width={75} accessibilityLabel={label} />,
    );
    expect(stacked.getByRole('image', { name: label })).toBeTruthy();
    await stacked.unmount();
  });

  test.each([
    0,
    -1,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    null,
    '300',
  ])('rejects invalid lockup width %p explicitly', async (width) => {
    await expect(
      render(<BrandLockup width={width as number} />),
    ).rejects.toThrow(/Unsupported design-system value: .*Supported values: finite positive width/u);
    await expect(
      render(<BrandLockupStacked width={width as number} />),
    ).rejects.toThrow(/Unsupported design-system value: .*Supported values: finite positive width/u);
  });

  test.each(['height', 'style', 'color', 'source', 'image', 'copy', 'ratio']) (
    'rejects the unsupported %s override',
    async (key) => {
      const props = { width: 300, [key]: 'override' } as unknown as BrandLockupProps;
      const stackedProps = {
        width: 300,
        [key]: 'override',
      } as unknown as BrandLockupStackedProps;
      await expect(
        render(<BrandLockup {...props} />),
      ).rejects.toThrow(
        new RegExp(`Unsupported design-system value: ${key}\\. Supported values:`),
      );
      await expect(
        render(<BrandLockupStacked {...stackedProps} />),
      ).rejects.toThrow(
        new RegExp(`Unsupported design-system value: ${key}\\. Supported values:`),
      );
    },
  );

  test('uses only the two retained synchronous local lockup files', () => {
    for (const file of ['BrandLockup.tsx', 'BrandLockupStacked.tsx']) {
      const source = fs.readFileSync(
        path.join(root, 'src/design-system/assets', file),
        'utf8',
      );
      expect(source).toMatch(/design-spec\/assets\/normalized\/brand-lockup/u);
      expect(source).not.toMatch(/https?:|fetch\(|XMLHttpRequest|loading|placeholder|penpot-assets\.json/u);
    }
  });

  test('publishes narrow asset and root barrel identities', () => {
    const horizontalProps: BrandLockupProps = { width: 300 };
    const stackedProps: BrandLockupStackedProps = { width: 300 };

    expect(horizontalProps.width).toBe(300);
    expect(stackedProps.width).toBe(300);
    expect(assetExports.BrandLockup).toBe(BrandLockup);
    expect(assetExports.BrandLockupStacked).toBe(BrandLockupStacked);
    expect(assetExports.Icon).toBe(Icon);
    expect(designSystemExports.BrandLockup).toBe(BrandLockup);
    expect(designSystemExports.BrandLockupStacked).toBe(BrandLockupStacked);
    expect(designSystemExports.Icon).toBe(Icon);
  });
});
