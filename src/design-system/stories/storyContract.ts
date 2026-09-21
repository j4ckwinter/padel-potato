import { phase3SourceEvidence } from '../components/sourceRegistry';
import { phase4SourceEvidence } from '../components/phase4SourceRegistry';

export const storyTaxonomy = Object.freeze([
  'Canonical',
  'Variants',
  'States',
  'Boundaries',
  'Interactive',
] as const);

export type StoryCategory = (typeof storyTaxonomy)[number];
export type Phase2PublicExport =
  | 'Text'
  | 'Stack'
  | 'Inline'
  | 'Surface'
  | 'Pressable'
  | 'Icon'
  | 'BrandLockup'
  | 'BrandLockupStacked';

type ApplicableStory = Readonly<{
  status: 'story';
  story: string;
}>;

type InapplicableStory = Readonly<{
  status: 'inapplicable';
  reason: string;
}>;

export type StoryApplicability = ApplicableStory | InapplicableStory;

export type StorySourceIdentity = Readonly<{
  fileId: string;
  pageId: string;
  revision: 292;
  sourceId: string;
}>;

const story = (storyName: string): ApplicableStory =>
  Object.freeze({ status: 'story', story: storyName });
const inapplicable = (reason: string): InapplicableStory =>
  Object.freeze({ status: 'inapplicable', reason });

const categories = (
  canonical: StoryApplicability,
  variants: StoryApplicability,
  states: StoryApplicability,
  boundaries: StoryApplicability,
  interactive: StoryApplicability,
) =>
  Object.freeze({
    Canonical: canonical,
    Variants: variants,
    States: states,
    Boundaries: boundaries,
    Interactive: interactive,
  }) satisfies Readonly<Record<StoryCategory, StoryApplicability>>;

const noState = (name: string) =>
  inapplicable(
    `${name} is presentational and has no authored transient state.`,
  );
const noInteraction = (name: string) =>
  inapplicable(`${name} exposes no callback or product interaction.`);

export const phase2StoryContracts = Object.freeze({
  Text: Object.freeze({
    group: 'Primitives/Text',
    categories: categories(
      story('Canonical'),
      story('Variants'),
      noState('Text'),
      story('Boundaries'),
      noInteraction('Text'),
    ),
  }),
  Stack: Object.freeze({
    group: 'Primitives/Layout',
    categories: categories(
      story('Canonical'),
      story('Variants'),
      noState('Stack'),
      story('Boundaries'),
      noInteraction('Stack'),
    ),
  }),
  Inline: Object.freeze({
    group: 'Primitives/Layout',
    categories: categories(
      story('Canonical'),
      story('Variants'),
      noState('Inline'),
      story('Boundaries'),
      noInteraction('Inline'),
    ),
  }),
  Surface: Object.freeze({
    group: 'Primitives/Surface',
    categories: categories(
      story('Canonical'),
      story('Variants'),
      noState('Surface'),
      story('Boundaries'),
      noInteraction('Surface'),
    ),
  }),
  Pressable: Object.freeze({
    group: 'Primitives/Pressable',
    categories: categories(
      story('Canonical'),
      story('Variants'),
      story('States'),
      story('Boundaries'),
      story('Interactive'),
    ),
  }),
  Icon: Object.freeze({
    group: 'Assets/Icons',
    categories: categories(
      story('Canonical'),
      story('Variants'),
      noState('Icon'),
      story('Boundaries'),
      noInteraction('Icon'),
    ),
  }),
  BrandLockup: Object.freeze({
    group: 'Assets/Brand',
    categories: categories(
      story('Canonical'),
      story('Variants'),
      inapplicable(
        'BrandLockup is synchronous fixed local artwork with no loading, empty, or transient state.',
      ),
      story('Boundaries'),
      noInteraction('BrandLockup'),
    ),
  }),
  BrandLockupStacked: Object.freeze({
    group: 'Assets/Brand',
    categories: categories(
      story('Canonical'),
      story('Variants'),
      inapplicable(
        'BrandLockupStacked is synchronous fixed local artwork with no loading, empty, or transient state.',
      ),
      story('Boundaries'),
      noInteraction('BrandLockupStacked'),
    ),
  }),
} as const satisfies Readonly<
  Record<
    Phase2PublicExport,
    Readonly<{
      group: string;
      categories: Readonly<Record<StoryCategory, StoryApplicability>>;
    }>
  >
>);

const foundationsPageId = '482a7222-5a3b-8086-8008-a6072bd7e924';
const componentsPageId = '482a7222-5a3b-8086-8008-a6073072bbb1';
const fileId = 'c514c1fb-1cda-8125-8008-a606253a77a3';
const source = (pageId: string, sourceId: string): StorySourceIdentity =>
  Object.freeze({ fileId, pageId, revision: 292, sourceId });

export const phase2StorySources = Object.freeze({
  Text: source(foundationsPageId, '482a7222-5a3b-8086-8008-a6072b69005a'),
  Stack: source(foundationsPageId, '482a7222-5a3b-8086-8008-a6072bc42252'),
  Inline: source(foundationsPageId, '482a7222-5a3b-8086-8008-a6072bc0bac7'),
  Surface: source(foundationsPageId, '482a7222-5a3b-8086-8008-a6072babe9c2'),
  Pressable: source(foundationsPageId, '482a7222-5a3b-8086-8008-a60e5e62fb1e'),
  Icon: source(componentsPageId, '482a7222-5a3b-8086-8008-a60e7bbc99e5'),
  BrandLockup: source(componentsPageId, '482a7222-5a3b-8086-8008-a61e9426c83d'),
  BrandLockupStacked: source(
    componentsPageId,
    '482a7222-5a3b-8086-8008-a62b8a2c0f47',
  ),
} as const satisfies Readonly<Record<Phase2PublicExport, StorySourceIdentity>>);

export function formatStorySourceIdentity(sourceIdentity: StorySourceIdentity) {
  return `Penpot ${sourceIdentity.fileId} / ${sourceIdentity.pageId} / revision ${sourceIdentity.revision} / source ${sourceIdentity.sourceId}`;
}

export const phase2Backstops = Object.freeze({
  overflow: Object.freeze({
    exports: Object.freeze(['Text', 'Stack', 'Inline', 'Surface'] as const),
    constrainedWidthRendered: true,
    renderedWitness: 'boundary-constrained-width',
    requiredContentWitness: 'boundary-required-content',
    status: 'host-contract',
  }),
  longText: Object.freeze({
    exports: Object.freeze(['Text', 'Pressable'] as const),
    constrainedWidthRendered: true,
    preservedAccessibleName: 'Long-content action',
    reachableActionWitness: 'boundary-long-text-action',
    requiresNative200PercentReview: true,
    nativeStatus: 'deferred-to-phase-5',
    status: 'host-contract',
  }),
} as const);

export type Phase3PublicExport =
  | 'Button'
  | 'IconButton'
  | 'Favourite'
  | 'Field'
  | 'ChoiceChip'
  | 'Checkbox'
  | 'DayTimeSelector'
  | 'SocialSignInButton'
  | 'AuthDivider'
  | 'BottomNavigation'
  | 'SegmentedControl'
  | 'AppHeader'
  | 'SectionHeader';

export type Phase3StorySourceIdentity = Readonly<{
  fileId: string;
  pageId: string;
  revision: 296;
  sourceId: string;
}>;

const allStories = categories(
  story('Canonical'),
  story('Variants'),
  story('States'),
  story('Boundaries'),
  story('Interactive'),
);

const phase3Definitions = Object.freeze([
  ['Button', 'button', 'Actions/Button', ['style', 'size', 'disabled', 'loading'], ['onPress']],
  ['IconButton', 'iconButton', 'Actions/Icon Button', ['size', 'icon', 'disabled'], ['onPress']],
  ['Favourite', 'favourite', 'Actions/Favourite', ['checked', 'disabled'], ['onCheckedChange']],
  ['Field', 'field', 'Forms/Field', ['type', 'disabled', 'readOnly', 'status'], ['onChangeText', 'onPress', 'onDecrement', 'onIncrement']],
  ['ChoiceChip', 'choiceChip', 'Forms/Choice Chip', ['type', 'selected', 'disabled'], ['onSelectedChange']],
  ['Checkbox', 'checkbox', 'Forms/Checkbox', ['checked', 'disabled'], ['onCheckedChange']],
  ['DayTimeSelector', 'dayTimeSelector', 'Forms/Day Time Selector', ['type', 'selected', 'disabled'], ['onSelect']],
  ['SocialSignInButton', 'socialSignInButton', 'Authentication/Social Sign-In Button', ['provider', 'disabled'], ['onPress']],
  ['AuthDivider', 'authDivider', 'Authentication/Auth Divider', ['label'], []],
  ['BottomNavigation', 'bottomNavigation', 'Navigation/Bottom Navigation', ['activeDestination'], ['onDestinationPress']],
  ['SegmentedControl', 'segmentedControl', 'Navigation/Segmented Control', ['options', 'value', 'disabled'], ['onValueChange']],
  ['AppHeader', 'appHeader', 'Navigation/App Header', ['page', 'favouriteChecked'], ['onNotificationPress', 'onBackPress', 'onFavouriteChange']],
  ['SectionHeader', 'sectionHeader', 'Navigation/Section Header', ['title', 'actionLabel'], ['onActionPress']],
] as const);

const phase3Family = (familyKey: string) => {
  const family = phase3SourceEvidence.families.find(({ key }) => key === familyKey);
  if (!family) throw new Error(`Missing Phase 3 source family: ${familyKey}`);
  return family;
};

export const phase3StoryContracts = Object.freeze(
  Object.fromEntries(phase3Definitions.map(([exportName, familyKey, title, controls, actions]) => {
    const family = phase3Family(familyKey);
    return [exportName, Object.freeze({
      exportName,
      familyKey,
      title,
      categories: exportName === 'AuthDivider'
        ? categories(
            story('Canonical'), story('Variants'),
            inapplicable('AuthDivider is static readable content with no authored transient state.'),
            story('Boundaries'),
            inapplicable('AuthDivider exposes no callback or product interaction.'),
          )
        : allStories,
      controls: Object.freeze([...controls]),
      actions: Object.freeze([...actions]),
      recordIds: Object.freeze(family.records.map(({ id }) => id)),
    })];
  })),
) as Readonly<Record<Phase3PublicExport, Readonly<{
  exportName: Phase3PublicExport;
  familyKey: string;
  title: string;
  categories: Readonly<Record<StoryCategory, StoryApplicability>>;
  controls: readonly string[];
  actions: readonly string[];
  recordIds: readonly string[];
}>>>;

export const phase3StorySources = Object.freeze(
  Object.fromEntries(phase3Definitions.map(([exportName, familyKey]) => {
    const family = phase3Family(familyKey);
    return [exportName, Object.freeze({
      fileId: phase3SourceEvidence.source.fileId,
      pageId: phase3SourceEvidence.source.pageId,
      revision: 296 as const,
      sourceId: family.sourceId,
    })];
  })),
) as Readonly<Record<Phase3PublicExport, Phase3StorySourceIdentity>>;

export const phase3Backstops = Object.freeze({
  emptyField: Object.freeze({ witness: 'field-boundary-empty', status: 'host-contract' }),
  longContent: Object.freeze({
    witnesses: Object.freeze(['field-boundary-long-content', 'header-boundary-long-content']),
    nativeStatus: 'deferred-to-phase-5',
    status: 'host-contract',
  }),
  compositeOrder: Object.freeze({
    bottomNavigation: Object.freeze(['home', 'games', 'create', 'players', 'profile']),
    witness: 'bottom-navigation',
    status: 'host-contract',
  }),
  segmentCardinality: Object.freeze({
    counts: Object.freeze([2, 3, 4] as const),
    equalAllocation: true,
    witness: 'segmented-control',
    status: 'host-contract',
  }),
  targetClearance: Object.freeze({
    minimumEffectiveTarget: 44,
    witness: 'boundary-adjacent-targets',
    status: 'host-contract',
  }),
  nativeReview: Object.freeze({
    ios: 'deferred-to-phase-5',
    android: 'deferred-to-phase-5',
    fontScale200: 'deferred-to-phase-5',
    voiceOver: 'deferred-to-phase-5',
    talkBack: 'deferred-to-phase-5',
  }),
} as const);

export type Phase4PublicExport =
  | 'Avatar'
  | 'AvatarGroup'
  | 'AvatarPicker'
  | 'StatusChip'
  | 'StepProgress'
  | 'PlayerItem'
  | 'GameCard'
  | 'NotificationRow'
  | 'SettingsRow'
  | 'StatTile'
  | 'ScoreResultBlock'
  | 'PlayerPreferencesCard'
  | 'BannerToast'
  | 'EmptyState'
  | 'IllustratedCard';

export type Phase4StorySourceIdentity = Readonly<{
  fileId: string;
  pageId: string;
  revision: 296;
  sourceId: string;
}>;

const phase4Definitions = Object.freeze([
  ['Avatar', 'avatar', 'Identity/Avatar', ['size', 'presence', 'accessibilityLabel'], []],
  ['AvatarGroup', 'avatarGroup', 'Identity/Avatar Group', ['variant'], ['onAddPlayer1', 'onAddPlayer2']],
  ['AvatarPicker', 'avatarPicker', 'Identity/Avatar Picker', ['variant'], ['onPress']],
  ['StatusChip', 'statusChip', 'Status/Status Chip', ['style', 'variant', 'selected'], ['onSelectedChange']],
  ['StepProgress', 'stepProgress', 'Progress/Step Progress', ['value'], []],
  ['PlayerItem', 'playerItem', 'Content/Player Item', ['variant', 'selected', 'disabled'], ['onSelectedChange', 'onViewPlayer', 'onInvite']],
  ['GameCard', 'gameCard', 'Content/Game Card', ['variant', 'full'], ['onViewGame', 'onViewResults']],
  ['NotificationRow', 'notificationRow', 'Content/Notification Row', ['type', 'read'], ['onPress']],
  ['SettingsRow', 'settingsRow', 'Content/Settings Row', ['variant', 'icon', 'checked', 'disabled'], ['onPress', 'onCheckedChange']],
  ['StatTile', 'statTile', 'Content/Stat Tile', ['type', 'content', 'state'], []],
  ['ScoreResultBlock', 'scoreResultBlock', 'Content/Score Result Block', ['type', 'state'], []],
  ['PlayerPreferencesCard', 'playerPreferencesCard', 'Content/Player Preferences Card', ['content'], []],
  ['BannerToast', 'bannerToast', 'Feedback/Banner Toast', ['style'], ['onClose', 'onViewBookingUpdate', 'onViewGameDetails']],
  ['EmptyState', 'emptyState', 'Feedback/Empty State', ['content'], ['onCreateGame', 'onInvitePlayers']],
  ['IllustratedCard', 'illustratedCard', 'Cards/Illustrated Card', ['type'], ['onViewGame', 'onViewResults', 'onInvitePlayers', 'onShareGame']],
] as const);

const phase4Family = (familyKey: string) => {
  const family = phase4SourceEvidence.families.find(({ key }) => key === familyKey);
  if (!family) throw new Error(`Missing Phase 4 source family: ${familyKey}`);
  return family;
};

const phase4Categories = (exportName: Phase4PublicExport) => {
  if (
    exportName === 'Avatar'
    || exportName === 'StepProgress'
    || exportName === 'StatTile'
    || exportName === 'ScoreResultBlock'
    || exportName === 'PlayerPreferencesCard'
  ) {
    return categories(
      story('Canonical'),
      story('Variants'),
      story('States'),
      story('Boundaries'),
      inapplicable(`${exportName} is presentational and exposes no callback or product interaction.`),
    );
  }
  return allStories;
};

export const phase4StoryContracts = Object.freeze(
  Object.fromEntries(
    phase4Definitions.map(([exportName, familyKey, title, controls, actions]) => {
      const family = phase4Family(familyKey);
      return [exportName, Object.freeze({
        exportName,
        familyKey,
        title,
        categories: phase4Categories(exportName),
        controls: Object.freeze([...controls]),
        actions: Object.freeze([...actions]),
        recordIds: Object.freeze(family.records.map(({ id }) => id)),
      })];
    }),
  ),
) as Readonly<Record<Phase4PublicExport, Readonly<{
  exportName: Phase4PublicExport;
  familyKey: string;
  title: string;
  categories: Readonly<Record<StoryCategory, StoryApplicability>>;
  controls: readonly string[];
  actions: readonly string[];
  recordIds: readonly string[];
}>>>;

export const phase4StorySources = Object.freeze(
  Object.fromEntries(phase4Definitions.map(([exportName, familyKey]) => {
    const family = phase4Family(familyKey);
    return [exportName, Object.freeze({
      fileId: phase4SourceEvidence.source.fileId,
      pageId: phase4SourceEvidence.source.pageId,
      revision: 296 as const,
      sourceId: family.sourceId,
    })];
  })),
) as Readonly<Record<Phase4PublicExport, Phase4StorySourceIdentity>>;

export const phase4Backstops = Object.freeze({
  longContent: Object.freeze({
    witnesses: Object.freeze([
      'tests/identity-status-progress-components.test.tsx',
      'tests/content-components.test.tsx',
      'tests/feedback-card-components.test.tsx',
      'tests/phase4-story-contracts.test.tsx',
    ]),
    nativeStatus: 'deferred-to-phase-5',
    status: 'host-contract',
  }),
  overflow: Object.freeze({
    witness: 'tests/phase4-story-contracts.test.tsx#preserves overflow meaning and stable identity order',
    status: 'host-contract',
  }),
  cardinality: Object.freeze({
    witness: 'tests/phase4-story-contracts.test.tsx#rejects unauthored singleton cardinality rather than filling a slot',
    status: 'host-contract',
  }),
  targetClearance: Object.freeze({
    minimumEffectiveTarget: 44,
    witness: 'tests/phase4-story-contracts.test.tsx#retains separate 44-point empty-slot targets',
    status: 'host-contract',
  }),
  readOrder: Object.freeze({
    witness: 'tests/phase4-story-contracts.test.tsx#preserves caller-formatted score precision and deterministic team/set order',
    status: 'host-contract',
  }),
  nativeReview: Object.freeze({
    ios: 'deferred-to-phase-5',
    android: 'deferred-to-phase-5',
    fontScale200: 'deferred-to-phase-5',
    voiceOver: 'deferred-to-phase-5',
    talkBack: 'deferred-to-phase-5',
  }),
} as const);
