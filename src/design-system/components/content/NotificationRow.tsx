import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '../../assets/Icon';
import { Pressable } from '../../primitives/Pressable';
import { Text } from '../../primitives/Text';
import { borders, colors, radii, sizing, spacing } from '../../tokens';

type NotificationContent = Readonly<{
  message: string;
  onPress: () => void;
  timestamp: string;
  title: string;
}>;

export type NotificationRowProps = NotificationContent &
  (
    | Readonly<{ read: boolean; type: 'game' | 'social' | 'warning' }>
    | Readonly<{ read: false; type: 'booking' }>
  );

const supportedRuntimeProps = Object.freeze([
  'message',
  'onPress',
  'read',
  'timestamp',
  'title',
  'type',
] as const);
const supportedTuples = Object.freeze([
  'game/unread',
  'booking/unread',
  'social/unread',
  'warning/unread',
  'game/read',
  'social/read',
  'warning/read',
] as const);
const iconByType = Object.freeze({
  booking: 'court',
  game: 'calendar',
  social: 'profile',
  warning: 'warning',
} satisfies Record<NotificationRowProps['type'], IconName>);

function unsupported(reason: string): never {
  throw new Error(
    `Unsupported Notification Row configuration: ${reason}. Supported configurations: ${supportedTuples.join(', ')}.`,
  );
}

function validateText(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    unsupported(`${field} must be non-empty text`);
  }
}

function validateNotificationRowProps(props: NotificationRowProps) {
  const runtime = props as unknown as Record<string, unknown>;
  for (const key of Object.keys(runtime)) {
    if (
      !supportedRuntimeProps.includes(
        key as (typeof supportedRuntimeProps)[number],
      )
    ) {
      unsupported(`unsupported property ${key}`);
    }
  }
  validateText(runtime.title, 'title');
  validateText(runtime.message, 'message');
  validateText(runtime.timestamp, 'timestamp');
  if (typeof runtime.onPress !== 'function')
    unsupported('onPress must be a function');
  if (typeof runtime.read !== 'boolean')
    unsupported('read must be an explicit boolean');
  if (
    typeof runtime.type !== 'string' ||
    !Object.prototype.hasOwnProperty.call(iconByType, runtime.type)
  ) {
    unsupported(`unknown type ${String(runtime.type)}`);
  }
  const tuple = `${String(runtime.type)}/${runtime.read ? 'read' : 'unread'}`;
  if (!supportedTuples.includes(tuple as (typeof supportedTuples)[number])) {
    unsupported(`unauthored tuple ${tuple}`);
  }
}

export function NotificationRow(props: NotificationRowProps) {
  validateNotificationRowProps(props);
  const title = props.title.trim();
  const message = props.message.trim();
  const timestamp = props.timestamp.trim();
  const readMeaning = props.read ? 'read' : 'unread';

  return (
    <Pressable
      accessibilityLabel={`${title}, ${message}, ${timestamp}, ${readMeaning}`}
      accessibilityRole="button"
      onPress={props.onPress}
      minHeight="size92"
      size="controlHeight44"
      width="fill"
      testID="notification-row"
    >
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.content, props.read ? undefined : styles.unread]}
      >
        <View style={styles.iconWell}>
          <Icon name={iconByType[props.type]} />
        </View>
        <View style={styles.copy}>
          <Text numberOfLines={1} variant="bodyStrong">
            {title}
          </Text>
          <Text color="textSecondary" numberOfLines={2} variant="caption">
            {message}
          </Text>
        </View>
        <View style={styles.meta}>
          <Text color="textSecondary" variant="caption">
            {timestamp}
          </Text>
          {!props.read ? <View style={styles.unreadDot} /> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.radius16,
    borderWidth: borders.borderDefault,
    flexDirection: 'row',
    gap: spacing.space12,
    minHeight: sizing.size92,
    paddingHorizontal: spacing.space16,
    width: '100%',
  },
  copy: { flex: 1, gap: spacing.space4, minWidth: 0 },
  iconWell: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.radiusFull,
    height: sizing.size40,
    justifyContent: 'center',
    width: sizing.size40,
  },
  meta: { alignItems: 'flex-end', gap: spacing.space8 },
  unread: { borderColor: colors.accent, borderWidth: borders.focusRingWidth },
  unreadDot: {
    backgroundColor: colors.accent,
    borderRadius: radii.radiusFull,
    height: sizing.size8,
    width: sizing.size8,
  },
});
