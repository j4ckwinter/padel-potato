import { StyleSheet } from 'react-native';

import {
  borders,
  colors,
  opacity,
  radii,
  sizing,
  spacing,
  typography,
} from '../../../tokens';

export const fieldStyles = StyleSheet.create({
  control: {
    alignItems: 'center',
    borderRadius: radii.radius12,
    flexDirection: 'row',
    minHeight: sizing.size52,
    overflow: 'hidden',
    width: '100%',
  },
  disabled: { opacity: opacity.opacityDisabled },
  field: { maxWidth: '100%', width: '100%' },
  input: {
    color: colors.ink,
    flex: 1,
    minHeight: sizing.size52,
    paddingHorizontal: spacing.space16,
    paddingVertical: spacing.space0,
    ...typography.body,
  },
  inputWithAction: { paddingRight: spacing.space8 },
  labelRow: { justifyContent: 'center', marginBottom: spacing.space8 },
  supportingRow: { justifyContent: 'center', marginTop: spacing.space4 },
  stepperActionContent: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.radiusFull,
    height: sizing.size44,
    justifyContent: 'center',
    width: sizing.size44,
  },
  stepperActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.space4,
  },
  stepperControl: {
    backgroundColor: colors.surface,
    borderWidth: borders.borderDefault,
    paddingLeft: spacing.space16,
    paddingRight: spacing.space4,
  },
  stepperValue: { flex: 1, justifyContent: 'center' },
  triggerContent: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.radius12,
    borderWidth: borders.borderDefault,
    flexDirection: 'row',
    minHeight: sizing.size52,
    paddingHorizontal: spacing.space16,
    width: '100%',
  },
  triggerText: { flex: 1 },
});
