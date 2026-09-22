import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, test } from '@jest/globals';
import { render } from '@testing-library/react-native';

import * as designSystemExports from '../src/design-system';
import * as assetExports from '../src/design-system/assets';
import {
  BrandLockup,
  type BrandLockupProps,
} from '../src/design-system/assets/BrandLockup';
import {
  BrandLockupStacked,
  type BrandLockupStackedProps,
} from '../src/design-system/assets/BrandLockupStacked';
import { Icon, type IconProps } from '../src/design-system/assets/Icon';
import {
  iconDefinitions,
  iconNames,
} from '../src/design-system/assets/iconDefinitions';
import { colors, dimensions } from '../src/design-system/tokens';

const expectedIconNames = [
  'add',
  'back',
  'calendar',
  'check',
  'chevron',
  'clock',
  'close',
  'court',
  'eye',
  'filter',
  'home',
  'location',
  'notification',
  'overflow',
  'players',
  'profile',
  'search',
  'warning',
] as const;

describe('Icon asset contract', () => {
  test('publishes the exact immutable runtime icon set without metadata', () => {
    expect(iconNames).toEqual(expectedIconNames);
    expect(Object.keys(iconDefinitions)).toEqual(expectedIconNames);
    for (const name of iconNames) {
      expect(iconDefinitions[name]).toContain('currentColor');
      expect(iconDefinitions[name]).not.toMatch(
        /data-penpot|<(?:script|foreignObject)|on\w+=/iu,
      );
    }
    expect(Object.isFrozen(iconDefinitions)).toBe(true);
    expect(Object.isFrozen(iconNames)).toBe(true);
  });

  test.each(expectedIconNames)(
    'renders %s with exact token paint and dimensions',
    async (name) => {
      const screen = await render(
        <Icon
          testID={`${name}-icon`}
          name={name}
          color="accent"
          size="iconSize20"
        />,
      );
      const icon = screen.getByTestId(`${name}-icon`, {
        includeHiddenElements: true,
      });
      expect(icon).toHaveProp('color', colors.accent);
      expect(icon).toHaveProp('width', dimensions.iconSize20);
      expect(icon).toHaveProp('height', dimensions.iconSize20);
      await screen.unmount();
    },
  );

  test('is decorative by default and labelled only when requested', async () => {
    const decorative = await render(
      <Icon testID="decorative-icon" name="home" />,
    );
    expect(decorative.queryByRole('image')).toBeNull();
    await decorative.unmount();
    const labelled = await render(
      <Icon name="court" accessibilityLabel="Next court" />,
    );
    expect(labelled.getByRole('image', { name: 'Next court' })).toBeTruthy();
  });

  test.each([
    { name: 'missing' },
    { name: null },
    { name: 'home', color: 'magenta' },
    { name: 'home', size: 'controlHeight40' },
    { name: 'home', style: { width: 40 } },
  ] as Record<string, unknown>[])(
    'rejects unsupported runtime input %#',
    async (props) => {
      await expect(
        render(<Icon {...(props as unknown as IconProps)} />),
      ).rejects.toThrow(/Unsupported design-system value/u);
    },
  );
});

describe('brand lockup asset contracts', () => {
  test('uses component-local media with exact public sizing ratios', async () => {
    const horizontal = await render(
      <BrandLockup testID="horizontal-lockup" width={250} />,
    );
    expect(horizontal.getByRole('image', { name: 'Padel Potato' })).toHaveStyle(
      { height: 60, width: 250 },
    );
    await horizontal.unmount();
    const stacked = await render(<BrandLockupStacked width={150} />);
    expect(stacked.getByRole('image', { name: 'Padel Potato' })).toHaveStyle({
      height: 28,
      width: 150,
    });
    expect(
      readFileSync(
        join(process.cwd(), 'src/design-system/assets/media/brand-lockup.png'),
      ).length,
    ).toBeGreaterThan(0);
    expect(
      readFileSync(
        join(
          process.cwd(),
          'src/design-system/assets/media/brand-lockup-stacked.png',
        ),
      ).length,
    ).toBeGreaterThan(0);
  });

  test.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, null, '300'])(
    'rejects invalid width %p',
    async (width) => {
      await expect(
        render(<BrandLockup width={width as number} />),
      ).rejects.toThrow(/finite positive width/u);
      await expect(
        render(<BrandLockupStacked width={width as number} />),
      ).rejects.toThrow(/finite positive width/u);
    },
  );

  test('publishes narrow asset and root barrel identities', () => {
    const horizontalProps: BrandLockupProps = { width: 300 };
    const stackedProps: BrandLockupStackedProps = { width: 300 };
    expect(horizontalProps.width + stackedProps.width).toBe(600);
    expect(assetExports.BrandLockup).toBe(BrandLockup);
    expect(assetExports.BrandLockupStacked).toBe(BrandLockupStacked);
    expect(assetExports.Icon).toBe(Icon);
    expect(designSystemExports.Icon).toBe(Icon);
  });
});
