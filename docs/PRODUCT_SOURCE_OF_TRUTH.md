# AirGuard Product Source of Truth

## What AirGuard Is

AirGuard is a real smart home air safety mobile app. It helps households understand whether their home air is safe, which room needs attention, which device or reading changed, and what action to take next.

AirGuard is not a school prototype, generic Expo template, local fake-login MVP, or disconnected checklist app. The app uses Supabase-backed authentication and persisted home safety data. Hardware and device provisioning may still be simulated internally during development, but user-facing screens must feel production-ready.

## Target Users

- Homeowners who need a clear room-by-room answer to "Is my home air safe?"
- Safety officers or household safety users who need alert visibility and operational controls.
- Administrators who manage setup, maintenance, and reset flows.

## Core Flows

1. Welcome -> Login/Create Account -> Authenticated session.
2. Create Account -> Setup Intro -> Name Home -> Add Sensor Profile -> Assign Sensor to Room -> Review Setup -> Dashboard.
3. Login -> Bootstrap Supabase session/profile/home -> Onboarding or Dashboard.
4. Dashboard -> View home safety status -> Open room, device, or alert detail.
5. Alerts -> Open critical alert -> Start checking -> Review recommended action -> Resolve.
6. More/Settings -> Profile/settings/support/admin tools, with operational tools separated from normal homeowner UI.

## Main Data Concepts

- Home: the primary monitored household or residence.
- Rooms: monitored spaces inside a home, such as kitchen, bedroom, living room, bathroom, office, or nursery.
- Devices: sensors, smoke detectors, CO2 sensors, ventilation fans, alarms, and other safety hardware connected to rooms.
- Alerts: safety events that require attention, including warning and critical states.
- Activity: chronological history of setup, readings, alerts, and user actions.
- Checklist: readiness and safety tasks for the home.
- Reports: historical summaries of air safety, alerts, readings, and readiness.
- Risks: higher-level safety concerns derived from alerts/readings, such as smoke risk, CO2 risk, poor ventilation, or offline devices.
- User profile: authenticated user identity, role, onboarding state, and home membership.

## Authentication Rules

- Authentication is Supabase-backed.
- Users enter email and password in the normal login form.
- The app calls the real auth service.
- The app bootstraps the Supabase session and profile.
- Profile role is read from the profile source of truth, not hardcoded in UI.
- No frontend-only login bypass may be reachable from user-facing UI.
- Known test accounts must be created through seed/setup tooling, not fake UI auth.

## Setup and Onboarding Rules

- One purpose per onboarding screen.
- Every setup screen must explain the user benefit, not the internal data model.
- Setup state must route clearly: setup intro -> home name -> sensor profile -> assigned room -> review -> dashboard.
- MVP onboarding is software-first: create a home safety profile, choose a sensor profile, assign it to a room, then start monitoring.
- Onboarding must not present Bluetooth, Wi-Fi, QR, scan, or hardware initialization as active setup work until real provisioning exists.
- Review setup should summarize home location, assigned room, sensor profile, and readiness.

## Form UX Rules

- Users must always be able to see what they are typing.
- Any screen with text input must be keyboard-aware on Android and iOS.
- Inputs must not be hidden behind the software keyboard, bottom navigation, progress indicators, or pinned CTAs.
- Short fixed onboarding compositions may compact when the keyboard opens; longer forms should scroll.
- Users should never see implementation phrases like local, seed, fake, or simulated.

## Production Copy Rules

User-facing text should be calm, direct, and product-quality. It should answer:

- What is happening?
- Is the home safe?
- Which room/device is affected?
- What should the user do next?

Use product language such as:

- "Invalid email or password."
- "Create your AirGuard account."
- "Add sensor profile."
- "Assign sensor to room."
- "Recent home safety activity."
- "Ready to monitor."

## Blocked User-Facing Words and Copy

These words or phrases must not appear in app screens, alerts, empty states, buttons, cards, menus, or activity messages unless they are explicitly developer-only docs or internal identifiers:

- demo
- fake
- simulated
- mock
- prototype
- Supabase auth
- use your real email
- local demo
- test mode
- dev tool
- seed data
- reset demo
- paired locally
- hardware initialization
- smoke simulation

## What Must Never Appear In App UI

- Backend implementation details.
- Supabase setup instructions.
- Service role or seed guidance.
- "Use demo account" or "demo credentials."
- Developer/debug/test wording.
- Placeholder-looking icons, labels, or text abbreviations when a real icon or product label is expected.
- Dead menu items that do not route anywhere.

## User-Facing Product UI vs Developer/Internal Tooling

User-facing product UI is for households and safety users. It must be trustworthy, polished, and free of implementation details.

Developer/internal tooling may use terms like seed, simulation, Supabase, or demo in scripts, service names, and developer docs. If such tooling affects the app experience, it must be routed through a clearly designed admin or maintenance surface and must not appear as raw controls in normal More/Settings.

## Phase Plan

### Phase 1 - First Impression + Setup

Fix only:

1. Login mojibake and back chevron.
2. Welcome/auth visual consistency if needed.
3. Create Account alignment with login.
4. Onboarding intro/name home/add sensor profile/assign sensor to room/review setup.
5. Remove production-breaking user-facing copy like `Paired locally`.

### Phase 2 - Main App Shell + Navigation

Fix only:

1. Bottom tab placeholder icons.
2. Room/device placeholder text icons.
3. More/settings operational controls.
4. Dead More menu links.
5. Missing or hidden routes strategy.

### Phase 3 - Core Product Screens

Fix only:

1. Home dashboard hierarchy.
2. Data-driven SafetyStatusCard.
3. Rooms and room detail.
4. Devices and add/device detail.
5. Empty states.

### Phase 4 - Safety Experience

Fix only:

1. Alerts list.
2. Alert detail workflow.
3. Activity feed.
4. Reports/risks/checklist if kept in scope.
5. Safety-critical severity styling.

### Phase 5 - Polish Sweep

Fix only:

1. Typography consistency.
2. Spacing/radius/shadow consistency.
3. Loading/error states.
4. Copy cleanup.
5. Typecheck and regression pass.
