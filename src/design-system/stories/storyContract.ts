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
  inapplicable(`${name} is presentational and has no authored transient state.`);
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
      inapplicable('BrandLockup is synchronous fixed local artwork with no loading, empty, or transient state.'),
      story('Boundaries'),
      noInteraction('BrandLockup'),
    ),
  }),
  BrandLockupStacked: Object.freeze({
    group: 'Assets/Brand',
    categories: categories(
      story('Canonical'),
      story('Variants'),
      inapplicable('BrandLockupStacked is synchronous fixed local artwork with no loading, empty, or transient state.'),
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
  BrandLockupStacked: source(componentsPageId, '482a7222-5a3b-8086-8008-a62b8a2c0f47'),
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
    preservedAccessibleName: 'Activate example',
    reachableActionWitness: 'boundary-long-text-action',
    requiresNative200PercentReview: true,
    nativeStatus: 'deferred-to-phase-5',
    status: 'host-contract',
  }),
} as const);

