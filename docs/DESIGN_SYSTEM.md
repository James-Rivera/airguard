# AirGuard Design System

## Design Direction

AirGuard should feel like a polished smart home safety app: calm, trustworthy, quick to scan, and action-oriented when safety changes. Figma is the brand/reference direction for welcome and auth, but repo docs are the source of truth for broader app screens.

Brand anchors:

- Deep navy text.
- AirGuard blue primary buttons.
- Green safety/air accent.
- White and soft gray backgrounds.
- Rounded cards.
- Clean smart-home safety feel.
- Strong visual separation between normal status and urgent alerts.

## Colors

Use existing tokens in `src/theme/colors.ts` as the current baseline:

- Brand blue: `#0266F4`
- Cyan: `#049CE0`
- Air/safety accent: `#0ACAC5`
- Success: `#22C55E`
- Warning: `#EAB308`
- Critical: `#EF4444`
- Background: `#FFFFFF`
- App background: `#F6FAFC`
- Surface: `#FFFFFF`
- Icon surface: `#EAF3FF`
- Text primary: `#06264A`
- Text secondary: `#475569`
- Muted text: `#94A3B8`
- Border: `#E2E8F0`

Rules:

- Critical alert surfaces need stronger hierarchy than regular cards.
- Blue should mark primary action, not every decorative surface.
- Green should communicate safety/clear/healthy state.
- Warning and critical states should never look like neutral list items.

## Typography

Use existing `src/theme/typography.ts` as baseline, but improve consistency:

- Hero/welcome wordmark: large, bold, Figma-aligned.
- Screen titles: strong, predictable, not oversized inside compact screens.
- Card titles: 15-18px with clear weight.
- Metrics: large enough to scan but not decorative.
- Captions: only for metadata and secondary context.

Rules:

- Avoid nested `AppText` when it resets typography unexpectedly.
- Keep copy concise.
- Avoid developer/system-model copy.

## Spacing

Baseline spacing comes from `src/theme/spacing.ts`: 4, 8, 12, 16, 20, 25, 32.

Rules:

- Screens should use consistent horizontal padding.
- Onboarding should have generous vertical rhythm and one clear CTA.
- Dense dashboards can use tighter cards, but must remain scannable.
- Alert detail screens should prioritize actions and recommended guidance.

## Radius

Current baseline:

- Small: 14
- Medium/buttons: 18
- Large: 20
- Cards: 24
- Pills: 999

Rules:

- Use radius intentionally; avoid every element feeling equally soft.
- Primary Figma auth/welcome buttons use an 18px radius.
- Repeated cards should stay rounded but not visually bloated.

## Shadows and Elevation

Use subtle card and button shadows. Elevation should separate surfaces without creating a toy-like UI.

Rules:

- Strongest shadows belong to primary buttons and important surfaces.
- Alert cards can use border/color hierarchy more than shadow.
- Avoid stacking too many shadowed cards on one screen.

## Buttons

- Primary: AirGuard blue, 48px height, 18px radius.
- Secondary: white surface with border, used for non-primary actions.
- Danger: critical red, only for safety/irreversible/critical actions.
- Buttons may include icons when the action is clearer with a symbol.

Rules:

- One primary CTA per setup screen.
- Operational/test-like actions must not appear as raw buttons in More.
- Disabled states must remain readable.

## Inputs

- Auth screens use Figma-style underline inputs with icons.
- Setup/product forms may use boxed fields, but should be visually reconciled with auth.
- Error messages should be user-safe.

Rules:

- Do not expose raw Supabase errors.
- Use icons for email, password, room/device where useful.
- Password fields need show/hide controls.

## Cards

Cards should communicate hierarchy:

- Dashboard hero/status card.
- Alert banner/card.
- Room/device status card.
- Reading/sensor card.
- Menu/settings card.

Rules:

- Alerts must not look like ordinary summary cards.
- Room/device cards need real icons.
- Summary cards must not use fake/static stats.

## Status Badges

Statuses:

- Good
- Warning
- Critical
- Offline
- Online
- Pairing
- Active
- Checking
- Resolved

Rules:

- Critical badges must have stronger contrast and presence.
- Badges should be consistent across room, device, reading, and alert contexts.
- Do not overload "Good" vs "Online"; use each for the right entity type.

## Alert Severity Styles

- Critical: strong red surface/border/icon, clear title, immediate action.
- Warning: amber/yellow surface, guidance but lower urgency.
- Resolved: calm green/neutral state with timestamp.
- Checking: active workflow state with clear next action.

Rules:

- Urgent alerts should visually separate from routine cards.
- Alert detail must guide action before resolution.
- Resolve should not be equal-weight beside Start Checking without context.

## Empty States

Required variants:

- Rooms empty state.
- Devices empty state.
- Alerts empty state.
- Activity empty state.
- Setup empty state.

Rules:

- No generic plus icon for every empty state.
- Use specific icon/illustration and a direct next action.
- Copy must sound product-ready.

## Loading States

- Auth bootstrap needs a clear loading state.
- Dashboard/home loading should avoid flash of empty content.
- Setup submit states should prevent double submit.

## Error States

- Login: `Invalid email or password.`
- Setup actions: user-safe actionable errors.
- Missing detail routes: helpful not-found message with a route back.

Rules:

- Never show service-role, Supabase setup, RLS, seed, or raw backend error details to users.

## Tab Bar Rules

- Use real icons, not letters.
- Tabs: Home, Rooms, Alerts, Devices, More.
- Alerts tab can show a badge count.
- Active tab should be obvious but not oversized enough to shift layout awkwardly.

## Safe-Area Rules

- Every screen must respect iOS and Android safe areas.
- Full-image welcome screens should set appropriate status bar style.
- Bottom-tab screens need enough bottom padding for the floating tab bar.

## Onboarding Layout Rules

- One purpose per screen.
- Clear step/progress state.
- One primary CTA.
- No shortcut/demo-looking setup buttons.
- Review screen must summarize saved setup.

## Dashboard Layout Rules

- Top priority: current home safety.
- Next: active/critical alerts.
- Next: rooms needing attention.
- Next: latest readings and devices.
- Recent activity can be lower on the page or in Activity.

## Alert and Detail Screen Rules

- Alert list must be severity-first and timeline-friendly.
- Alert detail must show room, severity, readings, recommended action, related devices, and workflow status.
- Critical alerts should not be buried in generic cards.

## Room and Device Card Rules

- Use real room/device icons.
- Show status, key reading or device health, and last updated/battery when relevant.
- Avoid text abbreviations like `Kit`, `AQ`, or `Smk` as icons.

## More and Settings Organization Rules

- More is for profile, home settings, support, app settings, and account actions.
- Operational/safety tools must be in a designed role-gated screen, not raw buttons in More.
- Every menu item must route somewhere or be removed.

## Recommended Reusable Components

- `AirGuardWordmark`: shared logo/wordmark with responsive sizing.
- `ScreenHeader`: title, subtitle, back/action icons, safe-area-aware.
- `AppIcon`: centralized icon component or icon mapping.
- `SensorCard`: reading value, sensor type, status, timestamp/trend.
- `RoomStatusCard`: room icon, status, primary reading, alert/device count.
- `DeviceStatusCard`: device type icon, online/offline, battery/power, last seen.
- `AlertBanner`: high-priority current alert surface.
- `AlertTimelineItem`: activity/feed item for alert events.
- `SetupStepCard`: onboarding step, status, description, CTA.
- `MaintenanceToolsScreen`: role-gated operational/admin tools.
- Empty state variants for rooms/devices/alerts/activity/setup.

## Phase Plan

Use the phase plan in `PRODUCT_SOURCE_OF_TRUTH.md` for implementation sequencing.
