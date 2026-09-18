# Requirements: Padel Potato

**Defined:** 2026-09-17
**Core Value:** Create a faithful, reusable mobile component system from the Penpot source of truth so future product screens can be assembled consistently and confidently.

## v1 Requirements

### Workbench

- [x] **WORK-01**: Developer can install and run the version-locked Expo/React Native TypeScript project.
- [ ] **WORK-02**: Developer can launch the component catalogue in native Storybook on iOS.
- [ ] **WORK-03**: Developer can launch the component catalogue in native Storybook on Android.
- [x] **WORK-04**: Developer can browse the shared Storybook stories locally through Expo web.
- [ ] **WORK-05**: Production-mode app builds exclude Storybook code.
- [x] **WORK-06**: Developer can validate dependency compatibility through automated Expo health checks.

### Penpot Provenance

- [x] **PNPT-01**: Developer can generate a versioned manifest of Penpot foundations, components, variant axes, states, and source IDs through the Penpot MCP.
- [x] **PNPT-02**: Every implemented token and component is traceable to its authoritative Penpot source.
- [x] **PNPT-03**: Developer can export and retain Penpot reference renders used for visual verification.
- [x] **PNPT-04**: Every intentional implementation difference is recorded with its source, platform, reason, and disposition.

### Foundations

- [x] **FNDT-01**: Developer can use all 15 Penpot colors through named design tokens.
- [x] **FNDT-02**: Developer can use all 9 Penpot typography styles through reusable typed styles.
- [x] **FNDT-03**: Developer can use all Penpot spacing, radius, dimension, border-width, and opacity values through named tokens.
- [x] **FNDT-04**: Components consume semantic tokens rather than embedding unexplained design literals.
- [x] **FNDT-05**: Fonts render with the intended families, weights, and metrics on iOS and Android.
- [x] **FNDT-06**: Storybook contains navigable foundation stories showing colors, typography, spacing, radii, dimensions, borders, and opacity.

### Primitives and Assets

- [x] **PRIM-01**: Developer can build components from token-backed text, layout, surface, and icon primitives.
- [x] **PRIM-02**: Interactive primitives provide consistent press, disabled, loading, focus, and accessibility behavior.
- [x] **PRIM-03**: Developer can use both Penpot brand lockups as reusable assets.
- [x] **PRIM-04**: Developer can use the complete Penpot icon set through a consistent typed interface.

### Actions and Forms

- [x] **ACTN-01**: Developer can use Button with every designed style, size, and state.
- [ ] **ACTN-02**: Developer can use Icon Button with every designed size, icon, and state.
- [x] **ACTN-03**: Developer can use Favourite with every designed state.
- [ ] **FORM-01**: Developer can use Field with every designed type and state.
- [ ] **FORM-02**: Developer can use Choice Chip with every designed type, icon option, and state.
- [ ] **FORM-03**: Developer can use Checkbox with every designed state.
- [ ] **FORM-04**: Developer can use Day Time Selector with every designed type and state.
- [x] **AUTH-01**: Developer can use Social Sign-In Button with every designed provider and state.
- [ ] **AUTH-02**: Developer can use Auth Divider as designed.

### Navigation and Structure

- [ ] **NAVG-01**: Developer can use Bottom Navigation with every designed active destination.
- [ ] **NAVG-02**: Developer can use Segmented Control with every designed option count and state.
- [x] **NAVG-03**: Developer can use App Header with every designed page configuration.
- [ ] **NAVG-04**: Developer can use Section Header as designed.

### Identity, Status, and Progress

- [ ] **IDEN-01**: Developer can use Avatar with every designed size and presence state.
- [ ] **IDEN-02**: Developer can use Avatar Group with every designed content and state combination.
- [ ] **IDEN-03**: Developer can use Avatar Picker with every designed content and state.
- [ ] **STAT-01**: Developer can use Status Chip with every designed style and state.
- [ ] **PROG-01**: Developer can use Step Progress with every designed step and state.

### Content Components

- [ ] **CONT-01**: Developer can use Player Item with every designed type and state.
- [ ] **CONT-02**: Developer can use Game Card with every designed type and state.
- [ ] **CONT-03**: Developer can use Notification Row with every designed type and read state.
- [ ] **CONT-04**: Developer can use Settings Row with every designed type, icon, and state.
- [ ] **CONT-05**: Developer can use Stat Tile with every designed type, content, and state.
- [ ] **CONT-06**: Developer can use Score Result Block with every designed type and result state.
- [ ] **CONT-07**: Developer can use Player Preferences Card with every designed content state.

### Feedback and Illustrated Content

- [ ] **FDBK-01**: Developer can use Banner Toast with every designed style and type.
- [ ] **FDBK-02**: Developer can use Empty State with every designed content and action state.
- [ ] **CARD-01**: Developer can use Illustrated Card with every designed type and state.

### Story, Test, and Accessibility Coverage

- [x] **QUAL-01**: Every public component has typed props constrained to its supported Penpot variants.
- [x] **QUAL-02**: Every component has canonical, variant, state, and relevant content-boundary stories.
- [x] **QUAL-03**: Interactive stories expose useful controls and actions without inventing unsupported prop combinations.
- [x] **QUAL-04**: Every interactive component has semantic and interaction tests.
- [x] **QUAL-05**: Components expose appropriate React Native roles, labels, values, and states.
- [x] **QUAL-06**: Interactive targets meet the project's native touch-target rule.
- [x] **QUAL-07**: Representative components remain usable with large text and native assistive technology.

### Verification and Completion

- [ ] **VRFY-01**: Every component family is visually compared with Penpot references on iOS.
- [ ] **VRFY-02**: Every component family is visually compared with Penpot references on Android.
- [ ] **VRFY-03**: Shared stories pass a local Expo-web discovery and render smoke check.
- [ ] **VRFY-04**: A coverage audit proves every Penpot foundation, reusable component, variant, and designed state is implemented or explicitly dispositioned.
- [ ] **VRFY-05**: The final evidence pack records platforms, devices, capture conditions, results, and approved deviations.

## v2 Requirements

### Product Screens

- **SCRN-01**: User can navigate product screens assembled exclusively from the validated design system.
- **SCRN-02**: User can complete the designed sign-up and onboarding experience.
- **SCRN-03**: User can view the designed home, game, player, notification, and profile experiences.

### Game Lifecycle

- **GAME-01**: User can create a game with a date, time, and venue.
- **GAME-02**: User can invite friends and track responses until four players are confirmed.
- **GAME-03**: User can record a score after a match.
- **GAME-04**: Invited players can confirm the recorded result.
- **GAME-05**: User can receive relevant game and result notifications.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Product screens in v1 | The design system must be completed and verified before screens consume it. |
| App navigation and live game flows in v1 | These belong to the subsequent product implementation milestone. |
| Authentication services, backend APIs, and persistence in v1 | The Storybook design-system milestone does not require application data or infrastructure. |
| Hosted Storybook | Local native and browser review is sufficient for the first milestone. |
| Pixel-perfect web parity | iOS and Android are the authoritative product platforms; web is a secondary smoke-review lane. |
| Automated visual-diff CI from day one | Deterministic stories, fonts, devices, and approved references must exist before reliable automation. |
| Unspecified themes or component variants | Penpot is the source of truth; v1 will not invent unsupported design language. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| WORK-01 | Phase 1 | Complete |
| WORK-02 | Phase 5 | Pending |
| WORK-03 | Phase 5 | Pending |
| WORK-04 | Phase 1 | Complete |
| WORK-05 | Phase 5 | Pending |
| WORK-06 | Phase 1 | Complete |
| PNPT-01 | Phase 1 | Complete |
| PNPT-02 | Phase 1 | Complete |
| PNPT-03 | Phase 1 | Complete |
| PNPT-04 | Phase 1 | Complete |
| FNDT-01 | Phase 1 | Complete |
| FNDT-02 | Phase 1 | Complete |
| FNDT-03 | Phase 1 | Complete |
| FNDT-04 | Phase 1 | Complete |
| FNDT-05 | Phase 1 | Complete |
| FNDT-06 | Phase 1 | Complete |
| PRIM-01 | Phase 2 | Complete |
| PRIM-03 | Phase 2 | Complete |
| PRIM-04 | Phase 2 | Complete |
| PRIM-02 | Phase 2 | Complete |
| QUAL-01 | Phase 2 | Complete |
| QUAL-02 | Phase 2 | Complete |
| QUAL-03 | Phase 2 | Complete |
| QUAL-04 | Phase 2 | Complete |
| QUAL-05 | Phase 2 | Complete |
| QUAL-06 | Phase 2 | Complete |
| QUAL-07 | Phase 2 | Complete |
| ACTN-01 | Phase 3 | Complete |
| ACTN-02 | Phase 3 | Pending |
| ACTN-03 | Phase 3 | Complete |
| FORM-01 | Phase 3 | Pending |
| FORM-02 | Phase 3 | Pending |
| FORM-03 | Phase 3 | Pending |
| FORM-04 | Phase 3 | Pending |
| AUTH-01 | Phase 3 | Complete |
| AUTH-02 | Phase 3 | Pending |
| NAVG-01 | Phase 3 | Pending |
| NAVG-02 | Phase 3 | Pending |
| NAVG-03 | Phase 3 | Complete |
| NAVG-04 | Phase 3 | Pending |
| IDEN-01 | Phase 4 | Pending |
| IDEN-02 | Phase 4 | Pending |
| IDEN-03 | Phase 4 | Pending |
| STAT-01 | Phase 4 | Pending |
| PROG-01 | Phase 4 | Pending |
| CONT-01 | Phase 4 | Pending |
| CONT-02 | Phase 4 | Pending |
| CONT-03 | Phase 4 | Pending |
| CONT-04 | Phase 4 | Pending |
| CONT-05 | Phase 4 | Pending |
| CONT-06 | Phase 4 | Pending |
| CONT-07 | Phase 4 | Pending |
| FDBK-01 | Phase 4 | Pending |
| FDBK-02 | Phase 4 | Pending |
| CARD-01 | Phase 4 | Pending |
| VRFY-01 | Phase 5 | Pending |
| VRFY-02 | Phase 5 | Pending |
| VRFY-03 | Phase 5 | Pending |
| VRFY-04 | Phase 5 | Pending |
| VRFY-05 | Phase 5 | Pending |

**Coverage:**

- v1 requirements: 60 total
- Mapped to phases: 60
- Unmapped: 0

---
*Requirements defined: 2026-09-17*
*Last updated: 2026-09-17 after initial definition*
