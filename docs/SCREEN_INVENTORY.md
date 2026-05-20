# AirGuard Screen Inventory

This inventory converts the UI/UX audit into a repo-native screen list. It should be updated whenever routes or major UX responsibilities change.

| Screen | Route/path | File path | Purpose | Current UI quality | Data source | Severity | Refactor priority | Notes |
|---|---|---|---|---|---|---|---|---|
| Welcome | `/` | `src/app/index.tsx` | Branded first impression and auth entry | Improved but still needs responsive/status-bar polish | Auth/session state, image asset | Medium | Phase 1 | Full-screen Figma direction; lockup is hand-built and may need `AirGuardWordmark`. |
| Login | `/auth/login` | `src/app/auth/login.tsx` | Supabase-backed sign-in | Figma-like, but has critical mojibake | Supabase auth via `useSession().signIn` | Critical | Phase 1 | Visible `â€¹` and `Iâ€™m`; back behavior needs fallback. |
| Create Account | `/auth/create-account` | `src/app/auth/create-account.tsx` | Account creation | Generic AppScreen form, diverges from login | Supabase signup/profile creation | High | Phase 1 | Needs auth-system visual alignment and safe error copy. |
| Onboarding Intro | `/onboarding` | `src/app/onboarding/index.tsx` | Explain setup and route to next setup step | Plain step dots/card, wireframe feel | Store state: home/rooms/devices | High | Phase 1 | Needs one-purpose polished setup milestone layout. |
| Create Home | `/onboarding/create-home` | `src/app/onboarding/create-home.tsx` | Create monitored home | Generic form | Supabase home service via store | Medium | Phase 1 | Needs more product context and consistent form styling. |
| Add Rooms | `/onboarding/add-rooms` | `src/app/onboarding/add-rooms.tsx` | Add initial monitored rooms | Stacked buttons/plain list | Store rooms + static suggestions | High | Phase 1 | Suggested rooms should be chips/cards with icons. |
| Add First Device | `/onboarding/add-first-device` | `src/app/onboarding/add-first-device.tsx` | Pair first device | Shortcut-like, not real pairing UX | Store state + device action | High | Phase 1 | `Use Smoke Detector` silently creates a device. |
| Review Setup | `/onboarding/review-setup` | `src/app/onboarding/review-setup.tsx` | Confirm setup before dashboard | Thin summary, problematic copy | Store home/rooms/devices | High | Phase 1 | `Paired locally` must be removed; summary needs real details. |
| Home Dashboard | `/tabs/home` | `src/app/tabs/home.tsx` | At-a-glance safety dashboard | Promising but weak hierarchy | Selectors over store/Supabase data | High | Phase 3 | Needs active alert priority, better room/reading selection, empty state. |
| Rooms | `/tabs/rooms` | `src/app/tabs/rooms.tsx` | Room list and room navigation | Placeholder add button and text icons | Selectors over store/Supabase rooms/readings | High | Phase 2/3 | Tiny absolute `+`; no empty state. |
| Room Detail | `/rooms/[roomId]` | `src/app/rooms/[roomId].tsx` | Room readings/devices/alerts | Basic stack | Selectors over store/Supabase data | Medium | Phase 3 | Hardcoded kitchen subtitle; empty sections render blank. |
| Devices | `/tabs/devices` | `src/app/tabs/devices.tsx` | Device list and summary | Placeholder add button, static stat | Selectors over store/Supabase devices | High | Phase 2/3 | `+2 this week` is hardcoded; list slices to 5. |
| Add Device | `/setup/add-device` | `src/app/setup/add-device.tsx` | Add/pair device | Looks like data form, not pairing | Store actions + local form state | High | Phase 3 | Instantly starts/finishes pairing; needs pairing states. |
| Alerts | `/tabs/alerts` | `src/app/tabs/alerts.tsx` | Alert list/filter | Generic cards, weak urgency | Selectors over store/Supabase alerts | High | Phase 4 | Needs severity-first styling and empty state. |
| Alert Detail | `/alerts/[alertId]` | `src/app/alerts/[alertId].tsx` | Alert workflow/action | Workflow too shallow | Selector + store actions | High | Phase 4 | Resolve available too easily; not-found/empty related devices are weak. |
| Activity | `/activity` | `src/app/activity.tsx` | Safety activity history | Plain chronological cards | Store/Supabase activity logs | Medium | Phase 4 | Needs grouped feed, icons, severity markers. |
| More/Settings | `/tabs/more` | `src/app/tabs/more.tsx` | Profile/settings/navigation/actions | Critical product feel issues | Profile role + static `menuItems` | Critical | Phase 2 | Operational controls mixed into More; dead links; letter icons. |

## Missing Screens and Routes

| Missing screen | Expected purpose | Current state | Severity | Priority |
|---|---|---|---|---|
| Forgot Password | Real auth recovery | Not present | High | Phase 1 or Phase 2 |
| Device Detail | Inspect/manage one device | Not present | Medium | Phase 3 |
| Home Settings | Home name/address/member settings | Menu item exists, no route | High | Phase 2 |
| Safety Checklist | Readiness tasks | Menu item exists, no route | High | Phase 2/4 |
| Reports | Historical safety summaries | Referenced in product expectations, no route | Medium | Phase 4 |
| Risks | Higher-level risk view | Referenced in product expectations, no route | Medium | Phase 4 |
| Maintenance Tools | Role-gated operational/admin actions | Raw actions in More | Critical | Phase 2 |

## Shared Components Affecting Many Screens

| Component | File | Current issue | Priority |
|---|---|---|---|
| AppScreen | `src/components/ui/AppScreen.tsx` | Plain headers, text back icon, no per-screen status bar strategy | Phase 2/5 |
| BottomTabBar | `src/components/ui/BottomTabBar.tsx` | Placeholder letter icons | Phase 2 |
| AppCard | `src/components/ui/AppCard.tsx` | Same hierarchy for all cards | Phase 5 |
| AppButton | `src/components/ui/AppButton.tsx` | Needs icon support and consistent Figma radius rules | Phase 5 |
| EmptyState | `src/components/ui/EmptyState.tsx` | Generic plus icon for all contexts | Phase 3/5 |
| TextField | `src/components/ui/TextField.tsx` | Boxed fields diverge from auth underline inputs | Phase 1/5 |
| StatusBadge | `src/components/ui/StatusBadge.tsx` | Critical states too soft | Phase 4/5 |
| SafetyStatusCard | `src/components/airguard/SafetyStatusCard.tsx` | Hardcoded room/alert copy | Phase 3 |
| RoomCard | `src/components/airguard/RoomCard.tsx` | Text abbreviations instead of icons | Phase 2/3 |
| DeviceCard | `src/components/airguard/DeviceCard.tsx` | Text abbreviations instead of icons | Phase 2/3 |
| AlertCard | `src/components/airguard/AlertCard.tsx` | Generic card for urgent safety event | Phase 4 |

## Phase Plan

### Phase 1 - First Impression + Setup

Fix only:

1. Login mojibake and back chevron.
2. Welcome/auth visual consistency if needed.
3. Create Account alignment with login.
4. Onboarding intro/create home/add rooms/add first device/review setup.
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
