import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '../../assets/Icon';
import { Pressable } from '../../primitives/Pressable';
import { Text } from '../../primitives/Text';
import { colors, type ColorToken } from '../../tokens';

export type StatusChipStyle =
  'neutral' | 'success' | 'warning' | 'info' | 'error';

type StaticStatusChipProps = Readonly<{
  label: string;
  style: StatusChipStyle;
  variant: 'default';
}>;
type SelectableStatusChipProps = Readonly<{
  label: string;
  onSelectedChange: (selected: boolean) => void;
  selected: boolean;
  style: 'success';
  variant: 'selectable';
}>;
type DisabledStatusChipProps = Readonly<{
  label: string;
  style: 'neutral';
  variant: 'disabled';
}>;

export type StatusChipProps =
  StaticStatusChipProps | SelectableStatusChipProps | DisabledStatusChipProps;

const supportedProps = Object.freeze([
  'label',
  'onSelectedChange',
  'selected',
  'style',
  'variant',
] as const);
const styles = Object.freeze([
  'neutral',
  'success',
  'warning',
  'info',
  'error',
] as const);
const tuples = Object.freeze([
  'neutral/default',
  'success/default',
  'warning/default',
  'info/default',
  'error/default',
  'success/selected',
  'neutral/disabled',
] as const);

function unsupported(reason: string): never {
  throw new Error(
    `Unsupported Status Chip configuration: ${reason}. Supported configurations: ${tuples.join(', ')}.`,
  );
}

function validateStatusChipProps(props: StatusChipProps) {
  const runtime = props as unknown as Record<string, unknown>;
  for (const key of Object.keys(runtime)) {
    if (!supportedProps.includes(key as (typeof supportedProps)[number])) {
      unsupported(`unsupported property ${key}`);
    }
  }
  if (typeof runtime.label !== 'string' || runtime.label.trim().length === 0) {
    unsupported('label must be non-empty');
  }
  if (!styles.includes(runtime.style as StatusChipStyle)) {
    unsupported(`unknown style ${String(runtime.style)}`);
  }
  if (runtime.variant === 'selectable') {
    if (
      runtime.style !== 'success' ||
      typeof runtime.selected !== 'boolean' ||
      typeof runtime.onSelectedChange !== 'function'
    )
      unsupported(
        'selectable requires success style, selected boolean, and callback',
      );
    return;
  }
  if (runtime.variant === 'disabled') {
    if (
      runtime.style !== 'neutral' ||
      Object.prototype.hasOwnProperty.call(runtime, 'selected') ||
      Object.prototype.hasOwnProperty.call(runtime, 'onSelectedChange')
    )
      unsupported('disabled is the callback-free neutral branch');
    return;
  }
  if (runtime.variant !== 'default')
    unsupported(`unknown variant ${String(runtime.variant)}`);
  if (
    Object.prototype.hasOwnProperty.call(runtime, 'selected') ||
    Object.prototype.hasOwnProperty.call(runtime, 'onSelectedChange')
  )
    unsupported('default branches are static');
}

const presentation: Readonly<
  Record<
    StatusChipStyle,
    {
      background: ColorToken;
      icon: IconName;
      text: string;
    }
  >
> = {
  neutral: { background: 'surfaceMuted', icon: 'profile', text: 'Neutral' },
  success: { background: 'surfaceAccent', icon: 'check', text: 'Success' },
  warning: { background: 'warning', icon: 'warning', text: 'Warning' },
  info: { background: 'info', icon: 'notification', text: 'Info' },
  error: { background: 'danger', icon: 'close', text: 'Error' },
};

function Content({
  label,
  style,
}: Readonly<{ label: string; style: StatusChipStyle }>) {
  const visual = presentation[style];
  return (
    <View
      accessible={false}
      style={[
        stylesSheet.content,
        { backgroundColor: colors[visual.background] },
      ]}
      testID="status-chip-content"
    >
      <Icon name={visual.icon} />
      <Text numberOfLines={1} variant="label">
        {label}
      </Text>
      <Text style={stylesSheet.semanticText} variant="micro">
        {visual.text}
      </Text>
    </View>
  );
}

export function StatusChip(props: StatusChipProps) {
  validateStatusChipProps(props);
  if (props.variant === 'default') {
    return <Content label={props.label} style={props.style} />;
  }
  if (props.variant === 'disabled') {
    return (
      <Pressable
        accessibilityLabel={props.label}
        accessibilityRole="button"
        disabled
        size="controlHeight40"
        style={stylesSheet.target}
      >
        <Content label={props.label} style="neutral" />
      </Pressable>
    );
  }
  return (
    <Pressable
      accessibilityLabel={props.label}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: props.selected }}
      onPress={() => props.onSelectedChange(!props.selected)}
      size="controlHeight40"
      style={stylesSheet.target}
    >
      <Content label={props.label} style="success" />
    </Pressable>
  );
}

const stylesSheet = StyleSheet.create({
  content: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 8,
    width: 132,
  },
  semanticText: {
    height: 1,
    position: 'absolute',
    width: 1,
  },
  target: { width: 132 },
});
