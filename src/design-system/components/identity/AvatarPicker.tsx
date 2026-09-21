import type { ImageSourcePropType } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { Icon } from '../../assets/Icon';
import { Pressable } from '../../primitives/Pressable';
import { Text } from '../../primitives/Text';
import { colors } from '../../tokens';
import { isLocalImageSource } from '../localImageSource';
import { Avatar } from './Avatar';

export type AvatarPickerProps =
  | Readonly<{ onPress: () => void; variant: 'empty' }>
  | Readonly<{ initials: string; onPress: () => void; variant: 'initials' }>
  | Readonly<{ onPress: () => void; source: ImageSourcePropType; variant: 'photo' }>
  | Readonly<{ onPress: () => void; variant: 'error' }>;

const errorMessage = 'Choose a JPG or PNG under 5 MB';
const supportedProps = Object.freeze(['initials', 'onPress', 'source', 'variant'] as const);
const variants = Object.freeze(['empty', 'initials', 'photo', 'error'] as const);

function unsupported(reason: string): never {
  throw new Error(
    `Unsupported Avatar Picker configuration: ${reason}. Supported configurations: empty/default, initials/default, photo/selected, empty/error.`,
  );
}

function validateAvatarPickerProps(props: AvatarPickerProps) {
  const runtime = props as unknown as Record<string, unknown>;
  for (const key of Object.keys(runtime)) {
    if (!supportedProps.includes(key as (typeof supportedProps)[number])) {
      unsupported(`unsupported property ${key}`);
    }
  }
  if (!variants.includes(runtime.variant as (typeof variants)[number])) {
    unsupported(`unknown variant ${String(runtime.variant)}`);
  }
  if (typeof runtime.onPress !== 'function') unsupported('onPress must be a function');
  if (runtime.variant === 'initials') {
    if (
      typeof runtime.initials !== 'string'
      || runtime.initials.trim().length < 1
      || runtime.initials.trim().length > 3
      || Object.prototype.hasOwnProperty.call(runtime, 'source')
    ) unsupported('initials/default requires one to three initials only');
  } else if (runtime.variant === 'photo') {
    if (!isLocalImageSource(runtime.source) || Object.prototype.hasOwnProperty.call(runtime, 'initials')) {
      unsupported('photo/selected requires one bundled or local image source only');
    }
  } else if (
    Object.prototype.hasOwnProperty.call(runtime, 'initials')
    || Object.prototype.hasOwnProperty.call(runtime, 'source')
  ) unsupported(`${String(runtime.variant)} cannot contain identity content`);
}

export function AvatarPicker(props: AvatarPickerProps) {
  validateAvatarPickerProps(props);
  const selected = props.variant === 'initials' || props.variant === 'photo';
  const label = selected ? 'Change profile photo' : 'Add a profile photo';
  const isError = props.variant === 'error';

  return (
    <Pressable
      accessibilityHint={isError ? errorMessage : undefined}
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={props.onPress}
      size="controlHeight44"
      style={[styles.target, isError ? styles.errorTarget : undefined]}
    >
      <View
        accessible={false}
        style={[styles.content, isError ? styles.errorContent : undefined]}
      >
        <View style={[styles.avatarWell, isError ? styles.avatarWellError : undefined]}>
          {props.variant === 'initials' ? (
            <Avatar decorative initials={props.initials} presence="online" size={56} />
          ) : props.variant === 'photo' ? (
            <Avatar decorative presence="online" size={56} source={props.source} />
          ) : (
            <Icon name="add" />
          )}
        </View>
        <Text variant="label">{label}</Text>
        {isError ? <Text color="muted" variant="caption">{errorMessage}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatarWell: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  avatarWellError: {
    backgroundColor: colors.danger,
  },
  content: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    height: 136,
    justifyContent: 'center',
    width: 352,
  },
  errorContent: { height: 160 },
  target: { height: 136, width: 352 },
  errorTarget: { height: 160 },
});
