import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { StyleSheet } from 'react-native';

type StoryLike = Readonly<{
  args?: unknown;
  render?: unknown;
}>;

export const flattenedStyle = (style: unknown) =>
  StyleSheet.flatten(
    style as Parameters<typeof StyleSheet.flatten>[0],
  ) as Record<string, unknown>;

export function invalidProps<T>(value: Record<string, unknown>): T {
  return value as T;
}

export async function renderStory(
  story: StoryLike,
  args: Record<string, unknown> = {},
) {
  if (typeof story.render !== 'function')
    throw new Error('Story has no render function');
  const storyRender = story.render as (
    storyArgs: Record<string, unknown>,
    context: Record<string, never>,
  ) => ReactElement;
  return render(
    storyRender(
      { ...((story.args as Record<string, unknown>) ?? {}), ...args },
      {},
    ),
  );
}
