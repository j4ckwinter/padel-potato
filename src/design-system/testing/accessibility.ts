import { expect } from '@jest/globals';
import type { RenderResult } from '@testing-library/react-native';
import type {
  AccessibilityRole,
  AccessibilityState,
  AccessibilityValue,
} from 'react-native';
import { StyleSheet } from 'react-native';
import type { TestInstance } from 'test-renderer';

type RoleQueries = Pick<RenderResult, 'getByRole' | 'queryByRole'>;
type TestIdQueries = Pick<RenderResult, 'getByTestId'>;
type PressUser = {
  press: (element: TestInstance) => Promise<void>;
};
type CallTracker = {
  mock: { calls: readonly unknown[][] };
};

const flattenedStyle = (element: TestInstance) =>
  StyleSheet.flatten(
    element.props.style as Parameters<typeof StyleSheet.flatten>[0],
  ) as Record<string, unknown>;

export function expectRoleAndName(
  queries: RoleQueries,
  role: AccessibilityRole,
  name: string,
) {
  expect(name.length).toBeGreaterThan(0);
  const element = queries.getByRole(role, { name });
  expect(element).toHaveAccessibleName(name);
  return element;
}

export function expectRoleAbsent(
  queries: RoleQueries,
  role: AccessibilityRole,
) {
  expect(queries.queryByRole(role)).toBeNull();
}

export function expectNoAccessibleName(element: TestInstance) {
  expect(element).not.toHaveAccessibleName();
}

export function expectAccessibilityValue(
  element: TestInstance,
  value: AccessibilityValue,
) {
  expect(element).toHaveAccessibilityValue(value);
}

export function expectAccessibilityState(
  element: TestInstance,
  state: AccessibilityState,
) {
  expect(element.props.accessibilityState).toEqual(
    expect.objectContaining({ ...state }),
  );
}

export async function expectPressContract(
  user: PressUser,
  element: TestInstance,
  callback: CallTracker,
  expectedPresses: 0 | 1,
) {
  const callsBefore = callback.mock.calls.length;
  await user.press(element);
  expect(callback.mock.calls.length - callsBefore).toBe(expectedPresses);
}

/**
 * Asserts declared host geometry only. This does not prove native layout,
 * parent-bound hitSlop clipping, or overlapping sibling target behavior.
 */
export function expectTouchTargetContract(
  element: TestInstance,
  visualSize: 40 | 44 | 48,
) {
  const expansion = Math.max(0, (44 - visualSize) / 2);
  const style = flattenedStyle(element);

  expect(style.minWidth).toBe(visualSize);
  expect(style.minHeight).toBe(visualSize);
  expect(element.props.hitSlop).toEqual({
    bottom: expansion,
    left: expansion,
    right: expansion,
    top: expansion,
  });
  expect(visualSize + expansion * 2).toBeGreaterThanOrEqual(44);
}

export function expectTokenStyle(
  element: TestInstance,
  expectedStyle: Readonly<Record<string, unknown>>,
) {
  expect(flattenedStyle(element)).toEqual(
    expect.objectContaining(expectedStyle),
  );
}

export function expectReservedStyleRejected(
  renderCase: () => unknown,
  reservedKey: string,
) {
  expect(renderCase).toThrow(
    new RegExp(
      `Unsupported design-system value: ${reservedKey}\\. Supported values:`,
      'u',
    ),
  );
}

export function expectDecorativeIconHidden(
  queries: TestIdQueries,
  testId: string,
) {
  const element = queries.getByTestId(testId, {
    includeHiddenElements: true,
  });
  expect(element.props.accessible).toBe(false);
  expect(element.props.accessibilityElementsHidden).toBe(true);
  expect(element.props.accessibilityRole).toBeUndefined();
  expect(element.props.importantForAccessibility).toBe('no-hide-descendants');
}

export function expectLabelledIconImage(queries: RoleQueries, name: string) {
  if (name.length === 0) {
    throw new Error('A labelled asset requires a non-empty expected name.');
  }

  const element = expectRoleAndName(queries, 'image', name);
  expect(element.props.accessible).toBe(true);
  expect(element.props.accessibilityElementsHidden).toBe(false);
  expect(element.props.importantForAccessibility).toBe('yes');
  return element;
}
