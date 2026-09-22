import { StyleSheet, View } from 'react-native';

import { Text } from '../../primitives/Text';
import { colors } from '../../tokens';
import { assertOnlyKeys, isNonEmptyString, unsupportedValue } from '../../internal/validation';

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
