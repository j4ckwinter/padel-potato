import { describe, expect, it, jest } from '@jest/globals';

import { flattenedStyle, invalidProps } from './helpers/componentTest';

import { render, userEvent } from '@testing-library/react-native';

import NotificationRowStories, {
  Boundaries as NotificationRowBoundaries,
  Canonical as NotificationRowCanonical,
  Interactive as NotificationRowInteractive,
  States as NotificationRowStates,
  Variants as NotificationRowVariants,
} from '../src/design-system/components/content/NotificationRow.stories';

import {
  NotificationRow,
  type NotificationRowProps,
} from '../src/design-system/components/content/NotificationRow';

const notificationContent = {
  message: 'Your activity has a new update',
  timestamp: '2m',
  title: 'Game update',
} as const;

describe('Notification Row public contract', () => {});

describe('Notification Row runtime and semantic contract', () => {
  it.each([
    [
      'game/unread',
      { ...notificationContent, onPress: jest.fn(), read: false, type: 'game' },
    ],
    [
      'booking/unread',
      {
        ...notificationContent,
        onPress: jest.fn(),
        read: false,
        type: 'booking',
      },
    ],
    [
      'social/unread',
      {
        ...notificationContent,
        onPress: jest.fn(),
        read: false,
        type: 'social',
      },
    ],
    [
      'warning/unread',
      {
        ...notificationContent,
        onPress: jest.fn(),
        read: false,
        type: 'warning',
      },
    ],
    [
      'game/read',
      { ...notificationContent, onPress: jest.fn(), read: true, type: 'game' },
    ],
    [
      'social/read',
      {
        ...notificationContent,
        onPress: jest.fn(),
        read: true,
        type: 'social',
      },
    ],
  ] as [string, NotificationRowProps][])(
    'renders the authored %s branch',
    async (_tuple, props) => {
      const screen = await render(<NotificationRow {...props} />);
      expect(
        flattenedStyle(screen.getByTestId('notification-row').props.style),
      ).toEqual(expect.objectContaining({ height: 92, width: 352 }));
    },
  );

  it('emits intent once while keeping read state controlled', async () => {
    const onPress = jest.fn();
    const screen = await render(
      <NotificationRow
        {...notificationContent}
        onPress={onPress}
        read={false}
        type="game"
      />,
    );
    const row = screen.getByRole('button', {
      name: 'Game update, Your activity has a new update, 2m, unread',
    });
    expect(screen.queryAllByRole('image')).toHaveLength(0);
    await userEvent.setup().press(row);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole('button', {
        name: 'Game update, Your activity has a new update, 2m, unread',
      }),
    ).toBeTruthy();

    await screen.rerender(
      <NotificationRow
        {...notificationContent}
        onPress={onPress}
        read
        type="game"
      />,
    );
    expect(
      screen.getByRole('button', {
        name: 'Game update, Your activity has a new update, 2m, read',
      }),
    ).toBeTruthy();
  });

  it.each([
    { ...notificationContent, onPress: jest.fn(), read: true, type: 'booking' },
    { ...notificationContent, onPress: jest.fn(), read: true, type: 'warning' },
    { ...notificationContent, onPress: jest.fn(), read: null, type: 'game' },
    { ...notificationContent, onPress: null, read: false, type: 'game' },
    {
      ...notificationContent,
      extra: true,
      onPress: jest.fn(),
      read: false,
      type: 'game',
    },
    {
      ...notificationContent,
      onPress: jest.fn(),
      read: false,
      type: 'unknown',
    },
    {
      ...notificationContent,
      message: '',
      onPress: jest.fn(),
      read: false,
      type: 'social',
    },
  ])('rejects an unsupported tuple or content contract %#', (props) => {
    expect(() => NotificationRow(invalidProps(props))).toThrow(
      /Unsupported Notification Row/u,
    );
  });

  it('retains complete long Unicode content in stable title/message/timestamp/read order', async () => {
    const screen = await render(
      <NotificationRow
        message="Łucía Nguyễn from 東京 has joined an exceptionally long Tuesday social padel game"
        onPress={jest.fn()}
        read={false}
        timestamp="2 minutes ago"
        title="A very long social update"
        type="social"
      />,
    );
    expect(
      screen.getByRole('button', {
        name: 'A very long social update, Łucía Nguyễn from 東京 has joined an exceptionally long Tuesday social padel game, 2 minutes ago, unread',
      }),
    ).toBeTruthy();
  });
});

describe('Notification Row Storybook contract', () => {
  it('accounts for all five categories under the exact Content title', () => {
    expect(NotificationRowStories.title).toBe('Content/Notification Row');
    expect([
      NotificationRowCanonical,
      NotificationRowVariants,
      NotificationRowStates,
      NotificationRowBoundaries,
      NotificationRowInteractive,
    ]).toHaveLength(5);
    expect(NotificationRowVariants.render).toBeDefined();
    expect(NotificationRowBoundaries.render).toBeDefined();
    expect(NotificationRowInteractive.render).toBeDefined();
  });
});
