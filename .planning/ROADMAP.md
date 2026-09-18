# Roadmap: Padel Potato

## Overview

This milestone establishes Padel Potato's React Native design system as a dependable future screen-building kit. Work starts with the Penpot Foundations screen in Storybook, then builds reusable primitives and components in dependency order, and closes with native catalogue validation and a coverage audit. Product screens, app navigation, and game flows remain deferred.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundations Storybook** - Build the Penpot Foundations screen in React Native/Expo and expose it in Storybook without app integration. (completed 2026-09-18)
- [ ] **Phase 2: Primitives, Assets, and Component Contracts** - Establish the reusable assets, primitives, typed states, stories, tests, and accessibility rules components need.
- [ ] **Phase 3: Actions, Forms, and Navigation Components** - Deliver the first dependency-ordered reusable component families in Storybook.
- [ ] **Phase 4: Identity, Content, and Feedback Components** - Complete the remaining reusable Penpot component families in Storybook.
- [ ] **Phase 5: Native Catalogue Validation and Coverage Audit** - Prove the completed catalogue on native platforms and retain final coverage evidence.

## Phase Details

### Phase 1: Foundations Storybook

**Goal**: Developers can review the Penpot-derived Padel Potato foundations as a faithful React Native/Expo Storybook screen, without product-app integration.
**Depends on**: Nothing (first phase)
**Requirements**: WORK-01, WORK-04, WORK-06, PNPT-01, PNPT-02, PNPT-03, PNPT-04, FNDT-01, FNDT-02, FNDT-03, FNDT-04, FNDT-05, FNDT-06
**Success Criteria** (what must be TRUE):

  1. A developer can install the Expo/React Native TypeScript workspace, pass its Expo health check, and launch Storybook locally.
  2. Storybook contains a Foundations screen that faithfully reproduces the authoritative Penpot Foundations design.
  3. The screen presents the complete semantic colour palette, typography specimens, spacing scale, and radius values shown in Penpot.
  4. Foundation values and intentional deviations remain traceable to Penpot MCP data and reference renders.
  5. No product screens, app navigation, backend behavior, or runtime app integration are introduced.

**Plans**: 7/7 plans executed
Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Approve package legitimacy and select a clean Expo/Storybook compatibility matrix.

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — Prove the Expo/Storybook/browser tracer and automated health gates.
- [x] 01-03-PLAN.md — Capture and validate authoritative Penpot evidence and reference renders.

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-04-PLAN.md — Implement exact color, typography, and font-readiness contracts.

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 01-05-PLAN.md — Implement all remaining foundation scales and the public token barrel.

**Wave 5** *(blocked on Wave 4 completion)*

- [x] 01-06-PLAN.md — Build complete token-driven Foundation specimens and stories.

**Wave 6** *(blocked on Wave 5 completion)*

- [x] 01-07-PLAN.md — Prove local Expo-web navigation and close comparison evidence.

**UI hint**: yes

### Phase 2: Primitives, Assets, and Component Contracts

**Goal**: Developers have the reusable visual assets, primitives, typed states, story conventions, tests, and accessibility rules needed to build Penpot components consistently.
**Depends on**: Phase 1
**Requirements**: PRIM-01, PRIM-02, PRIM-03, PRIM-04, QUAL-01, QUAL-02, QUAL-03, QUAL-04, QUAL-05, QUAL-06, QUAL-07
**Success Criteria** (what must be TRUE):

  1. Developers can compose token-backed text, layout, surface, icon, interaction, and brand primitives from the approved Penpot assets.
  2. Public component contracts can express only supported Penpot variants and states.
  3. Stories follow one consistent taxonomy for canonical, variant, state, boundary, and interactive examples.
  4. The shared test harness verifies semantic roles, labels, values, states, target sizes, and interaction behavior.
  5. Representative primitives remain usable with large text and native assistive technology.

**Plans**: TBD
**UI hint**: yes

### Phase 3: Actions, Forms, and Navigation Components

**Goal**: Developers can use the designed action, form, authentication, and navigation components from Storybook with every supported variant and state.
**Depends on**: Phase 2
**Requirements**: ACTN-01, ACTN-02, ACTN-03, FORM-01, FORM-02, FORM-03, FORM-04, AUTH-01, AUTH-02, NAVG-01, NAVG-02, NAVG-03, NAVG-04
**Success Criteria** (what must be TRUE):

  1. Storybook exposes Button, Icon Button, Favourite, Field, Choice Chip, Checkbox, Day Time Selector, Social Sign-In Button, and Auth Divider in every designed variant and state.
  2. Storybook exposes Bottom Navigation, Segmented Control, App Header, and Section Header in every designed configuration.
  3. Each component uses the shared tokens, primitives, bounded typed API, and accessibility contract.
  4. Each component includes canonical, variant, state, boundary, and relevant interactive stories plus semantic and interaction tests.

**Plans**: TBD
**UI hint**: yes

### Phase 4: Identity, Content, and Feedback Components

**Goal**: Developers can use every remaining reusable Penpot component and supported state from the Storybook catalogue.
**Depends on**: Phase 3
**Requirements**: IDEN-01, IDEN-02, IDEN-03, STAT-01, PROG-01, CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07, FDBK-01, FDBK-02, CARD-01
**Success Criteria** (what must be TRUE):

  1. Storybook exposes Avatar, Avatar Group, Avatar Picker, Status Chip, and Step Progress in every designed configuration.
  2. Storybook exposes all designed player, game, notification, settings, statistics, score-result, and preference components.
  3. Storybook exposes Banner Toast, Empty State, and Illustrated Card in every designed type and state.
  4. Each component includes its bounded typed API, navigable stories, semantic and interaction tests, and Penpot traceability.
  5. Reviewers can inspect every component without product screens, app navigation, or live data.

**Plans**: TBD
**UI hint**: yes

### Phase 5: Native Catalogue Validation and Coverage Audit

**Goal**: Reviewers can establish that the completed Storybook catalogue is complete, native-ready, comparable to Penpot, and safe to integrate into future product screens.
**Depends on**: Phase 4
**Requirements**: WORK-02, WORK-03, WORK-05, VRFY-01, VRFY-02, VRFY-03, VRFY-04, VRFY-05
**Success Criteria** (what must be TRUE):

  1. The completed catalogue launches on iOS and Android without being integrated into product navigation or flows.
  2. Production-mode app builds exclude Storybook code.
  3. Every component family has iOS and Android Penpot comparison evidence, with corrections or approved deviations recorded.
  4. A coverage audit accounts for every Penpot foundation, component, variant, and designed state.
  5. Shared stories pass the local browser smoke review and the final evidence pack records platforms, conditions, results, and approved deviations.

**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Native Workbench and Validation Seams | 7/7 | Complete    | 2026-09-18 |
| 2. Penpot Provenance, Foundations, and Assets | 0/TBD | Not started | - |
| 3. Interaction and Accessibility Contracts | 0/TBD | Not started | - |
| 4. Verified Component Families | 0/TBD | Not started | - |
| 5. Catalogue Coverage and Evidence Audit | 0/TBD | Not started | - |
