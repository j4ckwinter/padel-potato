import { StyleSheet } from 'react-native';

import { borders, colors, opacity, radii, typography } from '../../../tokens';

export const fieldStyles = StyleSheet.create({
  control: {
    alignItems: 'center',
    borderRadius: radii.radius12,
    flexDirection: 'row',
    height: 52,
    overflow: 'hidden',
    width: '100%',
  },
  disabled: { opacity: opacity.opacityDisabled },
  field: { maxWidth: '100%', width: 350 },
  fieldWithSupportingText: { minHeight: 100 },
  fieldWithoutSupportingText: { minHeight: 84 },
  input: {
    color: colors.ink,
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    paddingVertical: 0,
    ...typography.body,
  },
  inputWithAction: { paddingRight: 8 },
  labelRow: { height: 18, justifyContent: 'center', marginBottom: 6 },
  supportingRow: { justifyContent: 'center', marginTop: 4, minHeight: 16 },
  stepperAction: { height: 44, width: 44 },
  stepperActionContent: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  stepperActions: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  stepperControl: {
    backgroundColor: colors.surface,
    borderWidth: borders.borderDefault,
    paddingLeft: 16,
    paddingRight: 4,
  },
  stepperValue: { flex: 1, justifyContent: 'center' },
  trigger: { height: 52, width: '100%' },
  triggerContent: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.radius12,
    borderWidth: borders.borderDefault,
    flexDirection: 'row',
    height: 52,
    paddingHorizontal: 16,
    width: '100%',
  },
  triggerText: { flex: 1 },
});
