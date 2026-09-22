export const storyTaxonomy = Object.freeze([
  'Canonical',
  'Variants',
  'States',
  'Boundaries',
  'Interactive',
] as const);

export type StoryCategory = (typeof storyTaxonomy)[number];
export type FoundationPublicExport =
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

const foundationStoryContractsSeed = Object.freeze({
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
    FoundationPublicExport,
    Readonly<{
      group: string;
      categories: Readonly<Record<StoryCategory, StoryApplicability>>;
    }>
  >
>);

const foundationBackstopsSeed = Object.freeze({
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
    nativeStatus: 'deferred-to-native-review',
    status: 'host-contract',
  }),
} as const);

export type InteractivePublicExport =
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

const allStories = categories(
  story('Canonical'),
  story('Variants'),
  story('States'),
  story('Boundaries'),
  story('Interactive'),
);

const interactiveDefinitions = Object.freeze([
  [
    'Button',
    'button',
    'Actions/Button',
    ['style', 'size', 'disabled', 'loading'],
    ['onPress'],
  ],
  [
    'IconButton',
    'iconButton',
    'Actions/Icon Button',
    ['size', 'icon', 'disabled'],
    ['onPress'],
  ],
  [
    'Favourite',
    'favourite',
    'Actions/Favourite',
    ['checked', 'disabled'],
    ['onCheckedChange'],
  ],
  [
    'Field',
    'field',
    'Forms/Field',
    ['type', 'disabled', 'readOnly', 'status'],
    ['onChangeText', 'onPress', 'onDecrement', 'onIncrement'],
  ],
  [
    'ChoiceChip',
    'choiceChip',
    'Forms/Choice Chip',
    ['type', 'selected', 'disabled'],
    ['onSelectedChange'],
  ],
  [
    'Checkbox',
    'checkbox',
    'Forms/Checkbox',
    ['checked', 'disabled'],
    ['onCheckedChange'],
  ],
  [
    'DayTimeSelector',
    'dayTimeSelector',
    'Forms/Day Time Selector',
    ['type', 'selected', 'disabled'],
    ['onSelect'],
  ],
  [
    'SocialSignInButton',
    'socialSignInButton',
    'Authentication/Social Sign-In Button',
    ['provider', 'disabled'],
    ['onPress'],
  ],
  ['AuthDivider', 'authDivider', 'Authentication/Auth Divider', ['label'], []],
  [
    'BottomNavigation',
    'bottomNavigation',
    'Navigation/Bottom Navigation',
    ['activeDestination'],
    ['onDestinationPress'],
  ],
  [
    'SegmentedControl',
    'segmentedControl',
    'Navigation/Segmented Control',
    ['options', 'value', 'disabled'],
    ['onValueChange'],
  ],
  [
    'AppHeader',
    'appHeader',
    'Navigation/App Header',
    ['page', 'favouriteChecked'],
    ['onNotificationPress', 'onBackPress', 'onFavouriteChange'],
  ],
  [
    'SectionHeader',
    'sectionHeader',
    'Navigation/Section Header',
    ['title', 'actionLabel'],
    ['onActionPress'],
  ],
] as const);

const interactiveStoryContractsSeed = Object.freeze(
  Object.fromEntries(
    interactiveDefinitions.map(
      ([exportName, fixtureKey, title, controls, actions]) => {
        return [
          exportName,
          Object.freeze({
            exportName,
            fixtureKey,
            title,
            categories:
              exportName === 'AuthDivider'
                ? categories(
                    story('Canonical'),
                    story('Variants'),
                    inapplicable(
                      'AuthDivider is static readable content with no authored transient state.',
                    ),
                    story('Boundaries'),
                    inapplicable(
                      'AuthDivider exposes no callback or product interaction.',
                    ),
                  )
                : allStories,
            controls: Object.freeze([...controls]),
            actions: Object.freeze([...actions]),
          }),
        ];
      },
    ),
  ),
) as Readonly<
  Record<
    InteractivePublicExport,
    Readonly<{
      exportName: InteractivePublicExport;
      fixtureKey: string;
      title: string;
      categories: Readonly<Record<StoryCategory, StoryApplicability>>;
      controls: readonly string[];
      actions: readonly string[];
    }>
  >
>;

const interactiveBackstopsSeed = Object.freeze({
  emptyField: Object.freeze({
    witness: 'field-boundary-empty',
    status: 'host-contract',
  }),
  longContent: Object.freeze({
    witnesses: Object.freeze([
      'field-boundary-long-content',
      'header-boundary-long-content',
    ]),
    nativeStatus: 'deferred-to-native-review',
    status: 'host-contract',
  }),
  compositeOrder: Object.freeze({
    bottomNavigation: Object.freeze([
      'home',
      'games',
      'create',
      'players',
      'profile',
    ]),
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
    ios: 'deferred-to-native-review',
    android: 'deferred-to-native-review',
    fontScale200: 'deferred-to-native-review',
    voiceOver: 'deferred-to-native-review',
    talkBack: 'deferred-to-native-review',
  }),
} as const);

export type ContentPublicExport =
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

const contentDefinitions = Object.freeze([
  ['Avatar', 'avatar', 'Identity/Avatar', ['configuration'], []],
  [
    'AvatarGroup',
    'avatarGroup',
    'Identity/Avatar Group',
    ['variant'],
    ['onAddPlayer1', 'onAddPlayer2'],
  ],
  [
    'AvatarPicker',
    'avatarPicker',
    'Identity/Avatar Picker',
    ['variant'],
    ['onPress'],
  ],
  [
    'StatusChip',
    'statusChip',
    'Status/Status Chip',
    ['configuration'],
    ['onSelectedChange'],
  ],
  ['StepProgress', 'stepProgress', 'Progress/Step Progress', ['value'], []],
  [
    'PlayerItem',
    'playerItem',
    'Content/Player Item',
    ['configuration'],
    ['onSelectedChange', 'onViewPlayer', 'onInvite'],
  ],
  [
    'GameCard',
    'gameCard',
    'Content/Game Card',
    ['configuration'],
    ['onViewGame', 'onViewResults'],
  ],
  [
    'NotificationRow',
    'notificationRow',
    'Content/Notification Row',
    ['configuration'],
    ['onPress'],
  ],
  [
    'SettingsRow',
    'settingsRow',
    'Content/Settings Row',
    ['configuration'],
    ['onPress', 'onCheckedChange'],
  ],
  ['StatTile', 'statTile', 'Content/Stat Tile', ['configuration'], []],
  [
    'ScoreResultBlock',
    'scoreResultBlock',
    'Content/Score Result Block',
    ['type', 'state'],
    [],
  ],
  [
    'PlayerPreferencesCard',
    'playerPreferencesCard',
    'Content/Player Preferences Card',
    ['content'],
    [],
  ],
  [
    'BannerToast',
    'bannerToast',
    'Feedback/Banner Toast',
    ['style'],
    ['onClose', 'onViewBookingUpdate', 'onViewGameDetails'],
  ],
  [
    'EmptyState',
    'emptyState',
    'Feedback/Empty State',
    ['content'],
    ['onCreateGame', 'onInvitePlayers'],
  ],
  [
    'IllustratedCard',
    'illustratedCard',
    'Cards/Illustrated Card',
    ['type'],
    ['onViewGame', 'onViewResults', 'onInvitePlayers', 'onShareGame'],
  ],
] as const);

const contentCategories = (exportName: ContentPublicExport) => {
  if (
    exportName === 'Avatar' ||
    exportName === 'StepProgress' ||
    exportName === 'StatTile' ||
    exportName === 'ScoreResultBlock' ||
    exportName === 'PlayerPreferencesCard'
  ) {
    return categories(
      story('Canonical'),
      story('Variants'),
      story('States'),
      story('Boundaries'),
      inapplicable(
        `${exportName} is presentational and exposes no callback or product interaction.`,
      ),
    );
  }
  return allStories;
};

const contentStoryContractsSeed = Object.freeze(
  Object.fromEntries(
    contentDefinitions.map(
      ([exportName, fixtureKey, title, controls, actions]) => {
        return [
          exportName,
          Object.freeze({
            exportName,
            fixtureKey,
            title,
            categories: contentCategories(exportName),
            controls: Object.freeze([...controls]),
            actions: Object.freeze([...actions]),
          }),
        ];
      },
    ),
  ),
) as Readonly<
  Record<
    ContentPublicExport,
    Readonly<{
      exportName: ContentPublicExport;
      fixtureKey: string;
      title: string;
      categories: Readonly<Record<StoryCategory, StoryApplicability>>;
      controls: readonly string[];
      actions: readonly string[];
    }>
  >
>;

const contentBackstopsSeed = Object.freeze({
  longContent: Object.freeze({
    witnesses: Object.freeze([
      'tests/identity-status-progress-components.test.tsx',
      'tests/content-components.test.tsx',
      'tests/feedback-card-components.test.tsx',
      'tests/identity-content-feedback-story-contracts.test.tsx',
    ]),
    nativeStatus: 'deferred-to-native-review',
    status: 'host-contract',
  }),
  overflow: Object.freeze({
    witness:
      'tests/identity-content-feedback-story-contracts.test.tsx#preserves overflow meaning and stable identity order',
    status: 'host-contract',
  }),
  cardinality: Object.freeze({
    witness:
      'tests/identity-content-feedback-story-contracts.test.tsx#rejects unauthored singleton cardinality rather than filling a slot',
    status: 'host-contract',
  }),
  targetClearance: Object.freeze({
    minimumEffectiveTarget: 44,
    witness:
      'tests/identity-content-feedback-story-contracts.test.tsx#retains separate 44-point empty-slot targets',
    status: 'host-contract',
  }),
  readOrder: Object.freeze({
    witness:
      'tests/identity-content-feedback-story-contracts.test.tsx#preserves caller-formatted score precision and deterministic team/set order',
    status: 'host-contract',
  }),
  nativeReview: Object.freeze({
    ios: 'deferred-to-native-review',
    android: 'deferred-to-native-review',
    fontScale200: 'deferred-to-native-review',
    voiceOver: 'deferred-to-native-review',
    talkBack: 'deferred-to-native-review',
  }),
} as const);

export type StoryContractName =
  FoundationPublicExport | InteractivePublicExport | ContentPublicExport;

export type StoryContract = Readonly<{
  exportName: StoryContractName;
  fixtureKey?: string;
  title: string;
  categories: Readonly<Record<StoryCategory, StoryApplicability>>;
  controls: readonly string[];
  actions: readonly string[];
}>;

const foundationStoryContracts = Object.fromEntries(
  Object.entries(foundationStoryContractsSeed).map(([exportName, contract]) => [
    exportName,
    Object.freeze({
      exportName,
      title: contract.group,
      categories: contract.categories,
      controls: Object.freeze([]),
      actions: Object.freeze([]),
    }),
  ]),
);

export const storyContracts = Object.freeze({
  ...foundationStoryContracts,
  ...interactiveStoryContractsSeed,
  ...contentStoryContractsSeed,
}) as Readonly<Record<StoryContractName, StoryContract>>;

export const storybookBackstops = Object.freeze({
  foundations: foundationBackstopsSeed,
  interactiveComponents: interactiveBackstopsSeed,
  contentComponents: contentBackstopsSeed,
});
