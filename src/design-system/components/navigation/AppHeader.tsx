import { StyleSheet, View } from 'react-native';

import {
  HeaderMascot,
  type HeaderMascotName,
} from '../../assets/artwork/headerMascots';
import { unsupportedValue as unsupported } from '../../internal/validation';
import { Text } from '../../primitives/Text';
import { colors, radii, sizing, spacing } from '../../tokens';
import { Favourite } from '../actions/Favourite';
import { IconButton } from '../actions/IconButton';

export const appHeaderPages = Object.freeze([
  'home',
  'games',
  'create',
  'players',
  'profile',
  'notifications',
  'gameDetails',
  'playerDetails',
  'settings',
] as const);

export type AppHeaderPage = (typeof appHeaderPages)[number];

type CopyProps = Readonly<{
  subtitle?: string;
  title?: string;
}>;

type NotificationPage = CopyProps &
  Readonly<{
    onNotificationPress: () => void;
    page: 'home' | 'games' | 'create' | 'players';
  }>;

type ProfilePage = CopyProps &
  Readonly<{
    page: 'profile';
  }>;

type BackPage = CopyProps &
  Readonly<{
    onBackPress: () => void;
    page: 'notifications' | 'gameDetails' | 'settings';
  }>;

type PlayerDetailsPage = CopyProps &
  Readonly<{
    favouriteChecked: boolean;
    onBackPress: () => void;
    onFavouriteChange: (checked: boolean) => void;
    page: 'playerDetails';
  }>;

export type AppHeaderProps =
  NotificationPage | ProfilePage | BackPage | PlayerDetailsPage;

type HeaderConfig = Readonly<{
  mascot?: HeaderMascotName;
  subtitle: string;
  title: string;
}>;

const configs: Readonly<Record<AppHeaderPage, HeaderConfig>> = Object.freeze({
  home: Object.freeze({
    mascot: 'wave',
    subtitle: 'Ready for your next match?',
    title: 'Hi, Alex',
  }),
  games: Object.freeze({
    mascot: 'search',
    subtitle: 'Find your next match',
    title: 'Games',
  }),
  create: Object.freeze({
    mascot: 'create',
    subtitle: 'Set up your next match',
    title: 'Create game',
  }),
  players: Object.freeze({
    mascot: 'players',
    subtitle: 'Find your next partner',
    title: 'Players',
  }),
  profile: Object.freeze({
    mascot: 'profile',
    subtitle: 'Manage your account',
    title: 'Profile',
  }),
  notifications: Object.freeze({
    subtitle: 'Updates and activity',
    title: 'Notifications',
  }),
  gameDetails: Object.freeze({
    subtitle: 'Open game · 1 spot left',
    title: 'Game details',
  }),
  playerDetails: Object.freeze({
    subtitle: 'Player details and form',
    title: 'Player profile',
  }),
  settings: Object.freeze({
    subtitle: 'Manage your account',
    title: 'Settings',
  }),
});

const baseKeys = ['page', 'subtitle', 'title'] as const;
const actionKeys = Object.freeze({
  notification: Object.freeze([...baseKeys, 'onNotificationPress'] as const),
  profile: Object.freeze(baseKeys),
  back: Object.freeze([...baseKeys, 'onBackPress'] as const),
  playerDetails: Object.freeze([
    ...baseKeys,
    'favouriteChecked',
    'onBackPress',
    'onFavouriteChange',
  ] as const),
});

const notificationPages = ['home', 'games', 'create', 'players'] as const;
const backPages = ['notifications', 'gameDetails', 'settings'] as const;

function validateNonEmptyCopy(value: unknown, name: 'title' | 'subtitle') {
  if (
    typeof value !== 'undefined' &&
    (typeof value !== 'string' || value.trim().length === 0)
  ) {
    unsupported(value, [`non-empty ${name}`]);
  }
}

function validateAppHeaderProps(props: AppHeaderProps) {
  if (!appHeaderPages.includes(props.page))
    unsupported(props.page, appHeaderPages);
  const page = props.page;
  const keys = notificationPages.includes(
    page as (typeof notificationPages)[number],
  )
    ? actionKeys.notification
    : backPages.includes(page as (typeof backPages)[number])
      ? actionKeys.back
      : page === 'playerDetails'
        ? actionKeys.playerDetails
        : actionKeys.profile;
  for (const key of Object.keys(props)) {
    if (!(keys as readonly string[]).includes(key)) unsupported(key, keys);
  }
  validateNonEmptyCopy(props.title, 'title');
  validateNonEmptyCopy(props.subtitle, 'subtitle');
  if (notificationPages.includes(page as (typeof notificationPages)[number])) {
    if (typeof (props as NotificationPage).onNotificationPress !== 'function') {
      unsupported((props as NotificationPage).onNotificationPress, [
        'function',
      ]);
    }
  } else if (backPages.includes(page as (typeof backPages)[number])) {
    if (typeof (props as BackPage).onBackPress !== 'function') {
      unsupported((props as BackPage).onBackPress, ['function']);
    }
  } else if (page === 'playerDetails') {
    const playerProps = props as PlayerDetailsPage;
    if (typeof playerProps.onBackPress !== 'function') {
      unsupported(playerProps.onBackPress, ['function']);
    }
    if (typeof playerProps.favouriteChecked !== 'boolean') {
      unsupported(playerProps.favouriteChecked, [true, false]);
    }
    if (typeof playerProps.onFavouriteChange !== 'function') {
      unsupported(playerProps.onFavouriteChange, ['function']);
    }
  }
}

export function AppHeader(props: AppHeaderProps) {
  validateAppHeaderProps(props);
  const config = configs[props.page];
  const mascot = config.mascot;
  const title = props.title ?? config.title;
  const subtitle = props.subtitle ?? config.subtitle;
  const hasBack =
    backPages.includes(props.page as (typeof backPages)[number]) ||
    props.page === 'playerDetails';

  return (
    <View style={styles.container} testID="app-header">
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.leading}
      >
        {mascot ? <HeaderMascot name={mascot} /> : null}
      </View>
      {hasBack ? (
        <View style={styles.backAction}>
          <IconButton
            accessibilityLabel="Back"
            icon="back"
            onPress={(props as BackPage | PlayerDetailsPage).onBackPress}
            size={40}
          />
        </View>
      ) : null}
      <View style={styles.copy}>
        <Text accessibilityRole="header" variant="heading">
          {title}
        </Text>
        <Text color="textSecondary" variant="body">
          {subtitle}
        </Text>
      </View>
      {notificationPages.includes(
        props.page as (typeof notificationPages)[number],
      ) ? (
        <IconButton
          accessibilityLabel="Notifications"
          icon="notification"
          onPress={(props as NotificationPage).onNotificationPress}
          size={44}
        />
      ) : props.page === 'playerDetails' ? (
        <Favourite
          accessibilityLabel="Favourite player"
          checked={props.favouriteChecked}
          onCheckedChange={props.onFavouriteChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  backAction: {
    marginRight: spacing.space4,
  },
  container: {
    alignItems: 'center',
    backgroundColor: colors.canvas,
    borderRadius: radii.radius20,
    flexDirection: 'row',
    gap: spacing.space12,
    minHeight: sizing.size112,
    overflow: 'visible',
    paddingHorizontal: spacing.space16,
    width: '100%',
  },
  copy: {
    flex: 1,
    flexShrink: 1,
    gap: spacing.space4,
    minWidth: 0,
  },
  leading: {
    alignItems: 'center',
    height: sizing.size64,
    justifyContent: 'center',
    width: sizing.size64,
  },
});
