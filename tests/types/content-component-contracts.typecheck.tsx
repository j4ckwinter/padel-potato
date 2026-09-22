import {
  Avatar,
  AvatarGroup,
  AvatarPicker,
  BannerToast,
  EmptyState,
  GameCard,
  IllustratedCard,
  NotificationRow,
  PlayerItem,
  PlayerPreferencesCard,
  ScoreResultBlock,
  SettingsRow,
  StatTile,
  StatusChip,
  StepProgress,
  type AvatarGroupIdentity,
  type AvatarGroupProps,
  type AvatarPickerProps,
  type AvatarProps,
  type BannerToastProps,
  type EmptyStateProps,
  type GameCardParticipant,
  type GameCardProps,
  type IllustratedCardParticipant,
  type IllustratedCardProps,
  type NotificationRowProps,
  type PlayerItemIdentity,
  type PlayerItemProps,
  type PlayerPreferencesCardProps,
  type ScoreResultBlockProps,
  type ScoreResultTeam,
  type SettingsRowProps,
  type StatTileProps,
  type StatusChipProps,
  type StepProgressProps,
} from '../../src/design-system';
import * as DesignSystem from '../../src/design-system';

const noop = () => undefined;
const noopBoolean = (_value: boolean) => undefined;

const contentPublicFamilies = [
  'Avatar',
  'AvatarGroup',
  'AvatarPicker',
  'StatusChip',
  'StepProgress',
  'PlayerItem',
  'GameCard',
  'NotificationRow',
  'SettingsRow',
  'StatTile',
  'ScoreResultBlock',
  'PlayerPreferencesCard',
  'BannerToast',
  'EmptyState',
  'IllustratedCard',
] as const satisfies readonly (keyof typeof DesignSystem)[];

// @ts-expect-error Generated artwork renderers remain private.
const privateArtworkRenderer = DesignSystem.NextGameIllustratedCardArtwork;
// @ts-expect-error Story-only fixture helpers remain private.
const privateStoryFixtures = DesignSystem.internalStoryFixtures;

const avatarIdentity = {
  initials: 'AP',
  name: 'Alex Potato',
  presence: 'online',
} as const satisfies AvatarGroupIdentity;
const playerIdentity = {
  initials: 'AP',
  name: 'Alex Potato',
  presence: 'away',
  supportingText: 'Intermediate',
} as const satisfies PlayerItemIdentity;
const participant1 = {
  initials: 'AP',
  name: 'Alex Potato',
  presence: 'online',
  slot: 1,
} as const satisfies GameCardParticipant;
const participant2 = {
  ...participant1,
  initials: 'BP',
  name: 'Bea Potato',
  slot: 2,
} as const;
const participant3 = {
  ...participant1,
  initials: 'CP',
  name: 'Cam Potato',
  slot: 3,
} as const;
const participant4 = {
  ...participant1,
  initials: 'DP',
  name: 'Dev Potato',
  slot: 4,
} as const;
const illustrated1 = {
  initials: 'AP',
  name: 'Alex Potato',
  slot: 1,
} as const satisfies IllustratedCardParticipant;
const illustrated2 = {
  ...illustrated1,
  initials: 'BP',
  name: 'Bea Potato',
  slot: 2,
} as const;
const illustrated3 = {
  ...illustrated1,
  initials: 'CP',
  name: 'Cam Potato',
  slot: 3,
} as const;
const illustrated4 = {
  ...illustrated1,
  initials: 'DP',
  name: 'Dev Potato',
  slot: 4,
} as const;
const team1 = {
  initials: 'AP/BP',
  name: 'Alex and Bea',
  scores: ['6', '6'],
} as const satisfies ScoreResultTeam;
const team2 = {
  initials: 'CP/DP',
  name: 'Cam and Dev',
  scores: ['4', '3'],
} as const satisfies ScoreResultTeam;

const validContracts = [
  <Avatar
    accessibilityLabel="Alex, online"
    initials="AP"
    presence="online"
    size={32}
  />,
  <AvatarGroup
    identities={[avatarIdentity, avatarIdentity]}
    variant="2-players"
  />,
  <AvatarPicker onPress={noop} variant="empty" />,
  <StatusChip label="Confirmed" style="success" variant="default" />,
  <StepProgress value={1} />,
  <PlayerItem
    identity={playerIdentity}
    onSelectedChange={noopBoolean}
    selected={false}
    variant="list"
  />,
  <GameCard
    onViewGame={noop}
    participants={[participant1, participant2, participant3, participant4]}
    time="18:30"
    title="Friday padel"
    variant="next"
    venue="Canary Wharf"
  />,
  <NotificationRow
    message="Court confirmed"
    onPress={noop}
    read={false}
    timestamp="Now"
    title="Game update"
    type="game"
  />,
  <SettingsRow
    disabled={false}
    icon="profile"
    label="Profile"
    onPress={noop}
    variant="navigation"
  />,
  <StatTile
    content="gamesPlayed"
    label="Games"
    state="neutral"
    supportingText="This month"
    type="compact"
    value="8"
  />,
  <ScoreResultBlock state="won" teams={[team1, team2]} type="compact" />,
  <PlayerPreferencesCard
    content="profile"
    days="Weekdays"
    side="Right"
    timeOfDay="Evening"
  />,
  <BannerToast
    message="Ready to share"
    onClose={noop}
    style="success"
    title="Game created"
    type="toast"
  />,
  <EmptyState content="noNotifications" />,
  <IllustratedCard
    detailPrimary="Friday, 18:30"
    detailSecondary="Canary Wharf"
    eyebrow="Next game"
    onViewGame={noop}
    participants={[illustrated1, illustrated2, illustrated3, illustrated4]}
    title="Padel night"
    type="nextGame"
  />,
];

// Avatar: reject unauthored tuple and contradictory semantics.
// @ts-expect-error 32/away is not authored.
const invalidAvatarTuple: AvatarProps = {
  accessibilityLabel: 'Alex',
  initials: 'AP',
  presence: 'away',
  size: 32,
};
// @ts-expect-error Decorative avatars cannot also expose a label.
const invalidAvatarSemantics: AvatarProps = {
  accessibilityLabel: 'Alex',
  decorative: true,
  initials: 'AP',
  presence: 'online',
  size: 32,
};

// Avatar Group: reject invalid cardinality and callbacks on populated groups.
// @ts-expect-error Two-player branch requires exactly two identities.
const invalidAvatarGroupCardinality: AvatarGroupProps = {
  identities: [avatarIdentity],
  variant: '2-players',
};
// @ts-expect-error Populated branches do not expose empty-slot callbacks.
const invalidAvatarGroupCallback: AvatarGroupProps = {
  identities: [avatarIdentity, avatarIdentity],
  onAddPlayer1: noop,
  variant: '2-players',
};

// Avatar Picker: reject branch-incompatible content and missing action.
// @ts-expect-error Empty branch cannot contain initials.
const invalidAvatarPickerContent: AvatarPickerProps = {
  initials: 'AP',
  onPress: noop,
  variant: 'empty',
};
// @ts-expect-error Every picker branch requires its action callback.
const invalidAvatarPickerCallback: AvatarPickerProps = { variant: 'error' };

// Status Chip: reject unsupported persistent state and callback placement.
// @ts-expect-error Only success/selectable owns selected state.
const invalidStatusTuple: StatusChipProps = {
  label: 'Warning',
  onSelectedChange: noopBoolean,
  selected: true,
  style: 'warning',
  variant: 'selectable',
};
// @ts-expect-error Static chips cannot expose selection callbacks.
const invalidStatusCallback: StatusChipProps = {
  label: 'Ready',
  onSelectedChange: noopBoolean,
  style: 'success',
  variant: 'default',
};

// Step Progress: reject missing and unauthored progress values.
// @ts-expect-error Step four is not authored.
const invalidProgressTuple: StepProgressProps = { value: 4 };
// @ts-expect-error Progress value is required.
const invalidProgressMissing: StepProgressProps = {};

// Player Item: reject branch-incompatible callbacks and null identity.
// @ts-expect-error List branch owns selection, not player navigation.
const invalidPlayerItemCallback: PlayerItemProps = {
  identity: playerIdentity,
  onViewPlayer: noop,
  selected: false,
  variant: 'list',
};
// @ts-expect-error Populated branches require a non-null identity.
const invalidPlayerItemNull: PlayerItemProps = {
  identity: null,
  onViewPlayer: noop,
  variant: 'game-slot',
};

// Game Card: reject fixed-cardinality and compact-action expansion.
// @ts-expect-error Next card requires exactly four ordered participants.
const invalidGameCardCardinality: GameCardProps = {
  onViewGame: noop,
  participants: [participant1, participant2, participant3],
  time: '18:30',
  title: 'Game',
  variant: 'next',
  venue: 'Court',
};
// @ts-expect-error Compact card has no authored callback or time content.
const invalidGameCardContent: GameCardProps = {
  onViewGame: noop,
  time: '18:30',
  title: 'Game',
  variant: 'compact',
  venue: 'Court',
};

// Notification Row: reject unauthored read tuples and missing callbacks.
// @ts-expect-error Booking notifications have no authored read branch.
const invalidNotificationTuple: NotificationRowProps = {
  message: 'Updated',
  onPress: noop,
  read: true,
  timestamp: 'Now',
  title: 'Booking',
  type: 'booking',
};
// @ts-expect-error Notification rows always emit their authored intent.
const invalidNotificationCallback: NotificationRowProps = {
  message: 'Updated',
  read: false,
  timestamp: 'Now',
  title: 'Game',
  type: 'game',
};

// Settings Row: reject invalid icon/branch combinations and callbacks.
// @ts-expect-error Value branch is source-authored only with location.
const invalidSettingsTuple: SettingsRowProps = {
  icon: 'profile',
  label: 'Location',
  onPress: noop,
  value: 'London',
  variant: 'value',
};
// @ts-expect-error Toggle branch owns onCheckedChange rather than onPress.
const invalidSettingsCallback: SettingsRowProps = {
  checked: false,
  disabled: false,
  icon: 'notification',
  label: 'Notifications',
  onPress: noop,
  variant: 'toggle',
};

// Stat Tile: reject unauthored combinations and missing content.
// @ts-expect-error Featured games-played neutral is not authored.
const invalidStatTuple: StatTileProps = {
  content: 'gamesPlayed',
  label: 'Games',
  state: 'neutral',
  supportingText: 'Month',
  type: 'featured',
  value: '8',
};
// @ts-expect-error Visible supporting content is required.
const invalidStatMissing: StatTileProps = {
  content: 'gamesPlayed',
  label: 'Games',
  state: 'neutral',
  type: 'compact',
  value: '8',
};

// Score Result Block: reject invalid cardinality and state-only content.
// @ts-expect-error Scores require exactly two ordered teams.
const invalidScoreCardinality: ScoreResultBlockProps = {
  state: 'won',
  teams: [team1],
  type: 'compact',
};
// @ts-expect-error Won/lost branches cannot contain live-only copy.
const invalidScoreContent: ScoreResultBlockProps = {
  liveNote: 'Second set',
  state: 'won',
  teams: [team1, team2],
  type: 'compact',
};

// Player Preferences Card: reject branch-incompatible and missing content.
// @ts-expect-error Profile branch omits level.
const invalidPreferencesContent: PlayerPreferencesCardProps = {
  content: 'profile',
  days: 'Weekdays',
  level: 'Intermediate',
  side: 'Right',
  timeOfDay: 'Evening',
};
// @ts-expect-error Full branch requires level.
const invalidPreferencesMissing: PlayerPreferencesCardProps = {
  content: 'full',
  days: 'Weekdays',
  side: 'Right',
  timeOfDay: 'Evening',
};

// Banner Toast: reject unsupported tuple and callback leakage.
// @ts-expect-error Info is authored as a banner, not a toast.
const invalidBannerTuple: BannerToastProps = {
  message: 'Updated',
  onClose: noop,
  style: 'info',
  title: 'Booking',
  type: 'toast',
};
// @ts-expect-error Info banner requires its branch-specific booking callback.
const invalidBannerCallback: BannerToastProps = {
  message: 'Updated',
  onViewGameDetails: noop,
  style: 'info',
  title: 'Booking',
  type: 'banner',
};

// Empty State: reject action leakage and missing actions.
// @ts-expect-error No-notifications branch cannot expose an action.
const invalidEmptyStateCallback: EmptyStateProps = {
  content: 'noNotifications',
  onCreateGame: noop,
};
// @ts-expect-error No-games branch requires its authored action.
const invalidEmptyStateMissing: EmptyStateProps = { content: 'noGames' };

// Illustrated Card: reject fixed-cardinality and callback mismatch.
// @ts-expect-error Next-game card requires exactly four participants.
const invalidIllustratedCardCardinality: IllustratedCardProps = {
  detailPrimary: 'Friday',
  detailSecondary: 'Court',
  eyebrow: 'Next',
  onViewGame: noop,
  participants: [illustrated1, illustrated2],
  title: 'Game',
  type: 'nextGame',
};
// @ts-expect-error Match-result branch owns onViewResults only.
const invalidIllustratedCardCallback: IllustratedCardProps = {
  detailPrimary: 'Won',
  detailSecondary: '6-4, 6-3',
  eyebrow: 'Result',
  onViewGame: noop,
  participants: [illustrated1, illustrated2, illustrated3, illustrated4],
  title: 'Victory',
  type: 'matchResult',
};

void validContracts;
void contentPublicFamilies;
void [privateArtworkRenderer, privateStoryFixtures];
void [
  invalidAvatarTuple,
  invalidAvatarSemantics,
  invalidAvatarGroupCardinality,
  invalidAvatarGroupCallback,
  invalidAvatarPickerContent,
  invalidAvatarPickerCallback,
  invalidStatusTuple,
  invalidStatusCallback,
  invalidProgressTuple,
  invalidProgressMissing,
  invalidPlayerItemCallback,
  invalidPlayerItemNull,
  invalidGameCardCardinality,
  invalidGameCardContent,
  invalidNotificationTuple,
  invalidNotificationCallback,
  invalidSettingsTuple,
  invalidSettingsCallback,
  invalidStatTuple,
  invalidStatMissing,
  invalidScoreCardinality,
  invalidScoreContent,
  invalidPreferencesContent,
  invalidPreferencesMissing,
  invalidBannerTuple,
  invalidBannerCallback,
  invalidEmptyStateCallback,
  invalidEmptyStateMissing,
  invalidIllustratedCardCardinality,
  invalidIllustratedCardCallback,
];
