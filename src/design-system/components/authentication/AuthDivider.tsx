import { StyleSheet, View } from 'react-native';

import { Text } from '../../primitives/Text';
import { colors, sizing, spacing } from '../../tokens';
import {
  assertOnlyKeys,
  isNonEmptyString,
  unsupportedValue,
} from '../../internal/validation';

export type AuthDividerProps = Readonly<{
  label?: string;
}>;

const supportedRuntimeProps = Object.freeze(['label'] as const);

export function AuthDivider(props: AuthDividerProps = {}) {
  assertOnlyKeys(props, supportedRuntimeProps);
  const { label = 'or' } = props;
  if (!isNonEmptyString(label)) {
    unsupportedValue(label, ['non-empty label']);
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
    gap: spacing.space12,
    minHeight: sizing.size24,
    width: '100%',
  },
  rule: {
    backgroundColor: colors.border,
    flex: 1,
    height: sizing.size4 / spacing.space4,
  },
});
