import { StyleSheet, View } from 'react-native';

import { Icon } from '../../assets/Icon';
import { Pressable } from '../../primitives/Pressable';
import { Text } from '../../primitives/Text';
import { colors } from '../../tokens';

export type SettingsRowProps =
  | Readonly<{
      disabled: boolean;
      icon: 'profile';
      label: string;
      onPress: () => void;
      variant: 'navigation';
    }>
  | Readonly<{
      disabled: false;
      icon: 'court';
      label: string;
      onPress: () => void;
      variant: 'navigation';
    }>
  | Readonly<{
      icon: 'location';
      label: string;
      onPress: () => void;
      value: string;
      variant: 'value';
    }>
  | Readonly<{
      checked: boolean;
      disabled: boolean;
      icon: 'notification';
      label: string;
      onCheckedChange: (checked: boolean) => void;
      variant: 'toggle';
    }>
  | Readonly<{
      icon: 'close';
      onPress: () => void;
      variant: 'destructive';
    }>;

const supportedRuntimeProps = Object.freeze([
  'checked',
  'disabled',
  'icon',
  'label',
  'onCheckedChange',
  'onPress',
  'value',
  'variant',
] as const);
const supportedTuples = Object.freeze([
  'navigation/default/profile',
  'navigation/pressed/profile (native transient)',
  'navigation/disabled/profile',
  'navigation/default/court',
  'value/default/location',
  'toggle/off/notification',
  'toggle/on/notification',
  'toggle/disabled/notification',
  'destructive/default/close',
] as const);

function unsupported(reason: string): never {
  throw new Error(
    `Unsupported Settings Row configuration: ${reason}. Supported configurations: ${supportedTuples.join(', ')}.`,
  );
}

function validateText(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    unsupported(`${field} must be non-empty text`);
  }
}

function hasOnly(runtime: Record<string, unknown>, keys: readonly string[]) {
  return Object.keys(runtime).every((key) => keys.includes(key));
}

function validateSettingsRowProps(props: SettingsRowProps) {
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

  if (runtime.variant === 'navigation') {
    if (
      !hasOnly(runtime, ['disabled', 'icon', 'label', 'onPress', 'variant'])
    ) {
      unsupported('navigation contains an unsupported callback or property');
    }
    validateText(runtime.label, 'label');
    if (typeof runtime.disabled !== 'boolean')
      unsupported('navigation requires explicit disabled state');
    if (typeof runtime.onPress !== 'function')
      unsupported('navigation requires onPress');
    if (runtime.icon !== 'profile' && runtime.icon !== 'court') {
      unsupported('navigation requires the profile or court icon');
    }
    if (runtime.icon === 'court' && runtime.disabled) {
      unsupported('court navigation has no authored disabled branch');
    }
    return;
  }

  if (runtime.variant === 'value') {
    if (!hasOnly(runtime, ['icon', 'label', 'onPress', 'value', 'variant'])) {
      unsupported('value contains an unsupported callback or property');
    }
    if (runtime.icon !== 'location')
      unsupported('value requires the location icon');
    validateText(runtime.label, 'label');
    validateText(runtime.value, 'value');
    if (typeof runtime.onPress !== 'function')
      unsupported('value requires onPress');
    return;
  }

  if (runtime.variant === 'toggle') {
    if (
      !hasOnly(runtime, [
        'checked',
        'disabled',
        'icon',
        'label',
        'onCheckedChange',
        'variant',
      ])
    ) {
      unsupported('toggle contains an unsupported callback or property');
    }
    if (runtime.icon !== 'notification')
      unsupported('toggle requires the notification icon');
    validateText(runtime.label, 'label');
    if (typeof runtime.checked !== 'boolean')
      unsupported('toggle requires controlled checked state');
    if (typeof runtime.disabled !== 'boolean')
      unsupported('toggle requires explicit disabled state');
    if (typeof runtime.onCheckedChange !== 'function')
      unsupported('toggle requires onCheckedChange');
    if (runtime.disabled && runtime.checked)
      unsupported('toggle/disabled is authored only as off');
    return;
  }

  if (runtime.variant === 'destructive') {
    if (!hasOnly(runtime, ['icon', 'onPress', 'variant'])) {
      unsupported('destructive accepts only its fixed icon and callback');
    }
    if (runtime.icon !== 'close')
      unsupported('destructive requires the close icon');
    if (typeof runtime.onPress !== 'function')
      unsupported('destructive requires onPress');
    return;
  }

  unsupported(`unknown variant ${String(runtime.variant)}`);
}

function ToggleVisual({ checked }: Readonly<{ checked: boolean }>) {
  return (
    <View
      style={[
        styles.switchTrack,
        checked ? styles.switchTrackChecked : undefined,
      ]}
    >
      <View
        style={[
          styles.switchThumb,
          checked ? styles.switchThumbChecked : undefined,
        ]}
      />
    </View>
  );
}

export function SettingsRow(props: SettingsRowProps) {
  validateSettingsRowProps(props);
  const destructive = props.variant === 'destructive';
  const toggle = props.variant === 'toggle';
  const disabled = (props.variant === 'navigation' || toggle) && props.disabled;
  const label = destructive ? 'Sign out' : props.label.trim();
  const accessibilityLabel =
    props.variant === 'value' ? `${label}, ${props.value.trim()}` : label;
  const onPress = toggle
    ? () => props.onCheckedChange(!props.checked)
    : props.onPress;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={toggle ? 'switch' : 'button'}
      accessibilityState={toggle ? { checked: props.checked } : undefined}
      disabled={disabled}
      onPress={onPress}
      size="controlHeight44"
      style={styles.target}
      testID="settings-row"
    >
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.content, destructive ? styles.destructive : undefined]}
      >
        <View
          style={[
            styles.iconWell,
            destructive ? styles.destructiveIcon : undefined,
          ]}
        >
          <Icon name={props.icon} />
        </View>
        <View style={styles.copy}>
          <Text
            color={destructive ? 'textSecondary' : 'ink'}
            numberOfLines={1}
            variant="bodyStrong"
          >
            {label}
          </Text>
        </View>
        {props.variant === 'value' ? (
          <View style={styles.trailingValue}>
            <Text color="textSecondary" numberOfLines={1} variant="body">
              {props.value.trim()}
            </Text>
            <Icon name="chevron" />
          </View>
        ) : toggle ? (
          <ToggleVisual checked={props.checked} />
        ) : props.variant === 'navigation' ? (
          <Icon name="chevron" />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    height: 64,
    paddingHorizontal: 12,
    width: 352,
  },
  copy: { flex: 1, minWidth: 0 },
  destructive: { backgroundColor: colors.danger },
  destructiveIcon: { backgroundColor: colors.surface },
  iconWell: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  switchThumb: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    height: 20,
    transform: [{ translateX: 0 }],
    width: 20,
  },
  switchThumbChecked: { transform: [{ translateX: 16 }] },
  switchTrack: {
    backgroundColor: colors.muted,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 4,
    height: 28,
    width: 44,
  },
  switchTrackChecked: { backgroundColor: colors.deep },
  target: { height: 64, width: 352 },
  trailingValue: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    maxWidth: 176,
  },
});
