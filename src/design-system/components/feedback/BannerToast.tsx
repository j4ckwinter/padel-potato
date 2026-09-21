import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '../../assets/Icon';
import { Pressable } from '../../primitives/Pressable';
import { Text } from '../../primitives/Text';
import { colors } from '../../tokens';
import { IconButton } from '../actions/IconButton';

type BannerToastContent = Readonly<{
  message: string;
  title: string;
}>;

type ToastProps = BannerToastContent & (
  | Readonly<{ onClose: () => void; style: 'error'; type: 'toast' }>
  | Readonly<{ onClose: () => void; style: 'success'; type: 'toast' }>
);

type BannerProps = BannerToastContent & (
  | Readonly<{
      onViewBookingUpdate: () => void;
      style: 'info';
      type: 'banner';
    }>
  | Readonly<{
      onViewGameDetails: () => void;
      style: 'warning';
      type: 'banner';
    }>
);

export type BannerToastProps = ToastProps | BannerProps;

export const bannerToastStyles = Object.freeze([
  'error',
  'warning',
  'info',
  'success',
] as const);
export const bannerToastTypes = Object.freeze(['toast', 'banner'] as const);

const supportedRuntimeProps = Object.freeze([
  'message',
  'onClose',
  'onViewBookingUpdate',
  'onViewGameDetails',
  'style',
  'title',
  'type',
] as const);
const supportedTuples = Object.freeze([
  'error/toast',
  'warning/banner',
  'info/banner',
  'success/toast',
] as const);
const presentationByStyle = Object.freeze({
  error: { backgroundColor: colors.danger, icon: 'warning' },
  info: { backgroundColor: colors.info, icon: 'notification' },
  success: { backgroundColor: colors.surfaceAccent, icon: 'check' },
  warning: { backgroundColor: colors.warning, icon: 'warning' },
} satisfies Record<BannerToastProps['style'], {
  backgroundColor: string;
  icon: IconName;
}>);

function unsupported(reason: string): never {
  throw new Error(
    `Unsupported Banner Toast configuration: ${reason}. Supported configurations: ${supportedTuples.join(', ')}.`,
  );
}

function validateText(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    unsupported(`${field} must be non-empty text`);
  }
}

function validateBannerToastProps(props: BannerToastProps) {
  const runtime = props as unknown as Record<string, unknown>;
  for (const key of Object.keys(runtime)) {
    if (!supportedRuntimeProps.includes(key as (typeof supportedRuntimeProps)[number])) {
      unsupported(`unsupported property ${key}`);
    }
  }
  validateText(runtime.title, 'title');
  validateText(runtime.message, 'message');
  if (!bannerToastStyles.includes(runtime.style as BannerToastProps['style'])) {
    unsupported(`unknown style ${String(runtime.style)}`);
  }
  if (!bannerToastTypes.includes(runtime.type as BannerToastProps['type'])) {
    unsupported(`unknown type ${String(runtime.type)}`);
  }
  const tuple = `${String(runtime.style)}/${String(runtime.type)}`;
  if (!supportedTuples.includes(tuple as (typeof supportedTuples)[number])) {
    unsupported(`unauthored tuple ${tuple}`);
  }

  const callbackKey = runtime.type === 'toast'
    ? 'onClose'
    : runtime.style === 'info'
      ? 'onViewBookingUpdate'
      : 'onViewGameDetails';
  if (typeof runtime[callbackKey] !== 'function') {
    unsupported(`${callbackKey} must be a function for ${tuple}`);
  }
  for (const key of ['onClose', 'onViewBookingUpdate', 'onViewGameDetails'] as const) {
    if (key !== callbackKey && typeof runtime[key] !== 'undefined') {
      unsupported(`${key} is not available for ${tuple}`);
    }
  }
}

function BannerAction({
  accessibilityLabel,
  onPress,
}: Readonly<{ accessibilityLabel: string; onPress: () => void }>) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      size="controlHeight44"
      style={styles.bannerAction}
    >
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.bannerActionContent}
      >
        <Text variant="label">View</Text>
      </View>
    </Pressable>
  );
}

export function BannerToast(props: BannerToastProps) {
  validateBannerToastProps(props);
  const title = props.title.trim();
  const message = props.message.trim();
  const presentation = presentationByStyle[props.style];
  const announcement = `${title}. ${message}`;

  return (
    <View
      style={[
        styles.root,
        props.type === 'toast' ? styles.toast : styles.banner,
        { backgroundColor: presentation.backgroundColor },
      ]}
      testID="banner-toast"
    >
      <View
        accessibilityLabel={announcement}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        accessible
        style={styles.announcement}
        testID="banner-toast-announcement"
      >
        <View
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.iconWell}
        >
          <Icon name={presentation.icon} />
        </View>
        <View
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[styles.copy]}
          testID="banner-toast-copy"
        >
          <Text variant="bodyStrong">{title}</Text>
          <Text color="textSecondary" variant="caption">{message}</Text>
        </View>
      </View>

      {props.type === 'toast' ? (
        <IconButton
          accessibilityLabel={`Close ${props.style} message`}
          icon="close"
          onPress={props.onClose}
          size={44}
        />
      ) : props.style === 'info' ? (
        <BannerAction
          accessibilityLabel="View booking update"
          onPress={props.onViewBookingUpdate}
        />
      ) : (
        <BannerAction
          accessibilityLabel="View game details"
          onPress={props.onViewGameDetails}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  announcement: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    minWidth: 0,
  },
  banner: { minHeight: 88 },
  bannerAction: { height: 44, width: 48 },
  bannerActionContent: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 48,
  },
  copy: { flex: 1, flexShrink: 1, gap: 4, minWidth: 0 },
  iconWell: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  root: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 352,
  },
  toast: { minHeight: 72 },
});
