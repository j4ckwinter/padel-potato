import { StyleSheet, View } from 'react-native';

import { Text } from '../../primitives/Text';
import { colors } from '../../tokens';

export type AuthDividerProps = Readonly<{
  label?: string;
}>;

const supportedRuntimeProps = Object.freeze(['label'] as const);

function unsupported(value: unknown, supported: readonly unknown[]): never {
  throw new Error(
    `Unsupported design-system value: ${String(value)}. Supported values: ${supported.join(', ')}`,
  );
}

export function AuthDivider(props: AuthDividerProps = {}) {
  for (const key of Object.keys(props)) {
    if (!supportedRuntimeProps.includes(key as (typeof supportedRuntimeProps)[number])) {
      unsupported(key, supportedRuntimeProps);
    }
  }
  const { label = 'or' } = props;
  if (typeof label !== 'string' || label.trim().length === 0) {
    unsupported(label, ['non-empty label']);
  }

  return (
    <View style={styles.container} testID="auth-divider">
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.rule}
        testID="auth-divider-rule-start"
      />
      <Text color="muted" variant="caption">
        {label}
      </Text>
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.rule}
        testID="auth-divider-rule-end"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    height: 24,
    width: 352,
  },
  rule: {
    backgroundColor: colors.border,
    flex: 1,
    height: 1,
  },
});
