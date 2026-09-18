import { StyleSheet, View } from 'react-native';

import { Icon } from '../../assets/Icon';
import { Pressable } from '../../primitives/Pressable';
import { Text } from '../../primitives/Text';
import { colors } from '../../tokens';

export const choiceChipTypes = Object.freeze(['option', 'filter'] as const);
export const choiceChipIcons = Object.freeze(['none', 'leading', 'trailing'] as const);

export type ChoiceChipType = (typeof choiceChipTypes)[number];
export type ChoiceChipIcon = (typeof choiceChipIcons)[number];

type ChoiceChipCommonProps = Readonly<{
  label: string;
  onSelectedChange: (selected: boolean) => void;
}>;

type AvailableChoiceChipProps = ChoiceChipCommonProps & (
  | Readonly<{ type: 'option'; icon: 'none'; selected: false; disabled?: false }>
  | Readonly<{ type: 'option'; icon: 'leading'; selected: true; disabled?: false }>
  | Readonly<{ type: 'filter'; icon: 'trailing'; selected: false; disabled?: false }>
  | Readonly<{ type: 'filter'; icon: 'leading'; selected: true; disabled?: false }>
);

type DisabledChoiceChipProps = ChoiceChipCommonProps & (
  | Readonly<{ type: 'option'; icon: 'none'; selected: false; disabled: true }>
  | Readonly<{ type: 'filter'; icon: 'trailing'; selected: false; disabled: true }>
);

export type ChoiceChipProps = AvailableChoiceChipProps | DisabledChoiceChipProps;

const supportedRuntimeProps = Object.freeze([
  'disabled',
  'icon',
  'label',
  'onSelectedChange',
  'selected',
  'type',
] as const);

const supportedTuples = Object.freeze([
  'option/none/default',
  'option/none/disabled',
  'option/leading/selected',
  'filter/trailing/default',
  'filter/trailing/disabled',
  'filter/leading/selected',
] as const);

function unsupported(value: unknown, supported: readonly unknown[]): never {
  throw new Error(
    `Unsupported design-system value: ${String(value)}. Supported values: ${supported.join(', ')}`,
  );
}

function validateChoiceChipProps(props: ChoiceChipProps) {
  const runtimeProps = props as unknown as Record<string, unknown>;
  for (const key of Object.keys(props)) {
    if (!supportedRuntimeProps.includes(key as (typeof supportedRuntimeProps)[number])) {
      unsupported(key, supportedRuntimeProps);
    }
  }
  if (!choiceChipTypes.includes(runtimeProps.type as ChoiceChipType)) {
    unsupported(runtimeProps.type, choiceChipTypes);
  }
  if (!choiceChipIcons.includes(runtimeProps.icon as ChoiceChipIcon)) {
    unsupported(runtimeProps.icon, choiceChipIcons);
  }
  if (typeof runtimeProps.label !== 'string' || runtimeProps.label.trim().length === 0) {
    unsupported(runtimeProps.label, ['non-empty label']);
  }
  if (typeof runtimeProps.selected !== 'boolean') {
    unsupported(runtimeProps.selected, [true, false]);
  }
  if (typeof runtimeProps.disabled !== 'undefined' && typeof runtimeProps.disabled !== 'boolean') {
    unsupported(runtimeProps.disabled, [true, false]);
  }
  if (typeof runtimeProps.onSelectedChange !== 'function') {
    unsupported(runtimeProps.onSelectedChange, ['function']);
  }

  const state = runtimeProps.disabled
    ? 'disabled'
    : runtimeProps.selected
      ? 'selected'
      : 'default';
  const tuple = `${String(runtimeProps.type)}/${String(runtimeProps.icon)}/${state}`;
  if (!supportedTuples.includes(tuple as (typeof supportedTuples)[number])) {
    unsupported(tuple, supportedTuples);
  }
}

export function ChoiceChip(props: ChoiceChipProps) {
  validateChoiceChipProps(props);
  const { disabled = false, icon, label, onSelectedChange, selected, type } = props;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole={type === 'option' ? 'radio' : 'checkbox'}
      accessibilityState={{ checked: selected }}
      disabled={disabled}
      onPress={() => onSelectedChange(!selected)}
      size="controlHeight40"
      style={styles.target}
    >
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          styles.content,
          {
            backgroundColor: disabled
              ? colors.surfaceMuted
              : selected
                ? colors.accent
                : colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
          },
        ]}
        testID="choice-chip-content"
      >
        {icon === 'leading' ? <Icon name="check" /> : null}
        <Text variant="label">{label}</Text>
        {icon === 'trailing' ? <Icon name="chevron" /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 8,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
    width: 148,
  },
  target: {
    height: 40,
    width: 148,
  },
});
