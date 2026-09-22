import { describe, expect, it, jest } from '@jest/globals';

import { flattenedStyle, invalidProps } from './helpers/componentTest';

import { render, userEvent } from '@testing-library/react-native';

import { Children } from 'react';

import { StyleSheet } from 'react-native';

import BannerToastStories, {
  Boundaries as BannerToastBoundaries,
  Canonical as BannerToastCanonical,
  Interactive as BannerToastInteractive,
  States as BannerToastStates,
  Variants as BannerToastVariants,
  normalizeBannerToastStoryArgs,
} from '../src/design-system/components/feedback/BannerToast.stories';

import {
  BannerToast,
  type BannerToastProps,
} from '../src/design-system/components/feedback/BannerToast';

import EmptyStateStories, {
  Boundaries as EmptyStateBoundaries,
  Canonical as EmptyStateCanonical,
  Interactive as EmptyStateInteractive,
  States as EmptyStateStates,
  Variants as EmptyStateVariants,
  normalizeEmptyStateStoryArgs,
} from '../src/design-system/components/feedback/EmptyState.stories';

import {
  EmptyState,
  type EmptyStateProps,
} from '../src/design-system/components/feedback/EmptyState';

import * as FeedbackComponents from '../src/design-system/components/feedback';

import { bannerToastFixtures, emptyStateFixtures, illustratedCardFixtures } from '../src/design-system/stories/fixtures';

import IllustratedCardStories, {
  Boundaries as IllustratedCardBoundaries,
  Canonical as IllustratedCardCanonical,
  Interactive as IllustratedCardInteractive,
  States as IllustratedCardStates,
  Variants as IllustratedCardVariants,
  normalizeIllustratedCardStoryArgs,
} from '../src/design-system/components/cards/IllustratedCard.stories';

import {
  IllustratedCard,
  type IllustratedCardParticipant,
  type IllustratedCardProps,
} from '../src/design-system/components/cards/IllustratedCard';

import * as CardComponents from '../src/design-system/components/cards';

describe('Feedback family public boundary', () => {
  it('exports only the two feedback components and intentional runtime constants', () => {
    expect(Object.keys(FeedbackComponents).sort()).toEqual([
      'BannerToast',
      'EmptyState',
      'bannerToastStyles',
      'bannerToastTypes',
    ]);
  });
});
