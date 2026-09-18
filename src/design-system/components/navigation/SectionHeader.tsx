import { StyleSheet, View } from 'react-native';

import { Pressable } from '../../primitives/Pressable';
import { Text } from '../../primitives/Text';

type SectionHeaderWithoutAction = Readonly<{
  actionLabel?: never;
  onActionPress?: never;
  title: string;
}>;

type SectionHeaderWithAction = Readonly<{
  actionLabel: string;
  onActionPress: () => void;
  title: string;
}>;

export type SectionHeaderProps =
  | SectionHeaderWithoutAction
  | SectionHeaderWithAction;

const supportedRuntimeProps = Object.freeze([
  'actionLabel',
  'onActionPress',
  'title',
] as const);

const unsupported = (value: unknown, supported: readonly unknown[]): never => {
  throw new Error(
    `Unsupported design-system value: ${String(value)}. Supported values: ${supported.join(', ')}`,
  );
};

function validateSectionHeaderProps(props: SectionHeaderProps) {
  const runtimeProps = props as Readonly<Record<string, unknown>>;
  for (const key of Object.keys(props)) {
    if (!supportedRuntimeProps.includes(key as (typeof supportedRuntimeProps)[number])) {
      unsupported(key, supportedRuntimeProps);
    }
  }
  if (typeof props.title !== 'string' || props.title.trim().length === 0) {
    unsupported(props.title, ['non-empty title']);
  }
  const hasLabel = typeof runtimeProps.actionLabel !== 'undefined';
  const hasCallback = typeof runtimeProps.onActionPress !== 'undefined';
  if (hasLabel !== hasCallback) {
    throw new Error('SectionHeader actionLabel and onActionPress must both be present or both be absent.');
  }
  if (hasLabel && (typeof runtimeProps.actionLabel !== 'string' || runtimeProps.actionLabel.trim().length === 0)) {
    unsupported(runtimeProps.actionLabel, ['non-empty action label']);
  }
  if (hasCallback && typeof runtimeProps.onActionPress !== 'function') {
    unsupported(runtimeProps.onActionPress, ['function']);
  }
}

export function SectionHeader(props: SectionHeaderProps) {
  validateSectionHeaderProps(props);
  const hasAction = typeof props.actionLabel === 'string';
  const actionProps = hasAction ? props as SectionHeaderWithAction : undefined;

  return (
    <View style={styles.clearanceWrapper} testID="section-header">
      <View style={styles.visualRow} testID="section-header-visual-row">
        <Text accessibilityRole="header" style={styles.title} variant="heading">
          {props.title}
        </Text>
        {hasAction ? (
          <Pressable
            accessibilityLabel={actionProps?.actionLabel}
            accessibilityRole="button"
            onPress={actionProps?.onActionPress}
            size="controlHeight40"
            style={styles.actionTarget}
          >
            <View style={styles.actionContent}>
              <Text color="muted" variant="label">
                {actionProps?.actionLabel}
              </Text>
            </View>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionContent: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  actionTarget: {
    flexShrink: 0,
    height: 40,
  },
  clearanceWrapper: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    overflow: 'visible',
    width: 354,
  },
  visualRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 28,
    justifyContent: 'space-between',
    overflow: 'visible',
    width: 350,
  },
  title: {
    flexShrink: 1,
    minWidth: 0,
  },
});
