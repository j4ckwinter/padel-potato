import { describe, expect, it, jest } from '@jest/globals';
import { render, userEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import {
  BannerToast,
  type BannerToastProps,
} from '../src/design-system/components/feedback/BannerToast';
import { phase4Families } from '../src/design-system/components/phase4SourceRegistry';

const bannerToastRecords = phase4Families[12].records;

const flattenedStyle = (style: unknown) => StyleSheet.flatten(
  style as Parameters<typeof StyleSheet.flatten>[0],
) as Record<string, unknown>;

const examples = {
  error: {
    message: 'Please try again in a moment.',
    onClose: jest.fn(),
    style: 'error',
    title: 'Something went wrong',
    type: 'toast',
  },
  info: {
    message: 'Court details have changed.',
    onViewBookingUpdate: jest.fn(),
    style: 'info',
    title: 'Booking update',
    type: 'banner',
  },
  success: {
    message: 'Your game is ready to share.',
    onClose: jest.fn(),
    style: 'success',
    title: 'Game created',
    type: 'toast',
  },
  warning: {
    message: 'One player still needs to confirm.',
    onViewGameDetails: jest.fn(),
    style: 'warning',
    title: 'Check game details',
    type: 'banner',
  },
} as const satisfies Record<string, BannerToastProps>;

describe('Banner Toast source contract', () => {
  it('retains the four authored tuples and exact 352x72/88 geometry in source order', () => {
    expect(bannerToastRecords.map(({ normalizedTuple }) => normalizedTuple)).toEqual([
      { style: 'error', type: 'toast' },
      { style: 'warning', type: 'banner' },
      { style: 'info', type: 'banner' },
      { style: 'success', type: 'toast' },
    ]);
    expect(bannerToastRecords.map(({ metrics }) => metrics.normalized)).toEqual([
      { height: 72, width: 352 },
      { height: 88, width: 352 },
      { height: 88, width: 352 },
      { height: 72, width: 352 },
    ]);
  });
});

describe('Banner Toast runtime and announcement contract', () => {
  it.each(Object.entries(examples))('renders the exact %s branch', async (_name, props) => {
    const screen = await render(<BannerToast {...props} />);
    const rootStyle = flattenedStyle(screen.getByTestId('banner-toast').props.style);
    expect(rootStyle).toEqual(expect.objectContaining({
      minHeight: props.type === 'toast' ? 72 : 88,
      width: 352,
    }));
    expect(screen.getByRole('alert', {
      name: `${props.title}. ${props.message}`,
    })).toBeTruthy();
    expect(screen.queryAllByRole('image')).toHaveLength(0);
  });

  it.each([
    ['error', examples.error, 'Close error message'],
    ['success', examples.success, 'Close success message'],
    ['info', examples.info, 'View booking update'],
    ['warning', examples.warning, 'View game details'],
  ] as const)('emits the %s branch intent once from a named 44-point target', async (
    _name,
    props,
    actionName,
  ) => {
    const screen = await render(<BannerToast {...props} />);
    const action = screen.getByRole('button', { name: actionName });
    expect(flattenedStyle(action.props.style)).toEqual(expect.objectContaining({
      minHeight: 44,
      minWidth: 44,
    }));
    await userEvent.setup().press(action);
    const callback = props.type === 'toast'
      ? props.onClose
      : props.style === 'info'
        ? props.onViewBookingUpdate
        : props.onViewGameDetails;
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('preserves one stable announcement boundary and content across unrelated rerenders', async () => {
    const onClose = jest.fn();
    const screen = await render(<BannerToast {...examples.success} onClose={onClose} />);
    const before = screen.getByTestId('banner-toast-announcement');
    expect(before.props.accessibilityLiveRegion).toBe('polite');
    expect(before.props.accessibilityLabel).toBe(
      'Game created. Your game is ready to share.',
    );

    await screen.rerender(<BannerToast {...examples.success} onClose={onClose} />);
    const after = screen.getByTestId('banner-toast-announcement');
    expect(after).toBe(before);
    expect(after.props.accessibilityLabel).toBe(before.props.accessibilityLabel);
  });

  it.each([
    { ...examples.info, message: '' },
    { ...examples.info, message: null },
    { ...examples.info, onViewBookingUpdate: null },
    { ...examples.info, onViewGameDetails: jest.fn() },
    { ...examples.warning, onViewBookingUpdate: jest.fn() },
    { ...examples.success, onViewBookingUpdate: jest.fn() },
    { ...examples.error, onClose: undefined },
    { ...examples.error, style: 'error', type: 'banner' },
    { ...examples.success, style: 'success', type: 'banner' },
    { ...examples.warning, style: 'warning', type: 'toast' },
    { ...examples.info, extra: true },
    { ...examples.info, style: 'unknown' },
  ])('rejects unsupported content, callbacks, properties, or tuples %#', (props) => {
    expect(() => BannerToast(props as never)).toThrow(/Unsupported Banner Toast/u);
  });

  it('retains complete long Unicode announcement content and a reachable action', async () => {
    const title = 'Booking update for Łucía, Nguyễn, and 東京';
    const message = 'Court details have changed for an exceptionally long Tuesday evening social game, including the entrance instructions.';
    const screen = await render(
      <BannerToast
        message={message}
        onViewBookingUpdate={jest.fn()}
        style="info"
        title={title}
        type="banner"
      />,
    );
    expect(screen.getByRole('alert', { name: `${title}. ${message}` })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'View booking update' })).toBeTruthy();
    expect(screen.getByTestId('banner-toast-copy').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ flexShrink: 1 })]),
    );
  });
});
