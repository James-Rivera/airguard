# AirGuard Reference App Patterns

Reference apps are pattern inputs only. AirGuard must keep its own brand anchors: deep navy text, AirGuard blue buttons, green safety/air accent, white/soft gray backgrounds, rounded cards, and smart-home safety clarity.

| Reference | Pattern | AirGuard Screen | Why It Helps | Adaptation |
|---|---|---|---|---|
| Google Home | Home, Devices, Activity, and Settings structure with room/device grouping and at-a-glance controls | Home Dashboard, Rooms, Devices, Activity, Tab Bar | Helps AirGuard stop feeling like disconnected screens and become a coherent home monitoring app | Keep AirGuard tabs, but use stronger grouping, device status summaries, and useful Activity history |
| Google Home | Favorites/current state first, then room/device organization | Home Dashboard | Users need the fastest possible answer to "is my home safe?" | Put home safety, active alert, and rooms needing attention above routine readings |
| Apple Home | Category-level home overview, grouped rooms/accessories, clean system-like hierarchy | Home Dashboard, Rooms, Devices | Supports polished smart-home organization without clutter | Adapt categories to Air Safety, Smoke/CO, Ventilation, Offline Devices, and Rooms |
| Arlo Secure | Chronological Feed and emergency/safety actions separated from normal settings | Alerts, Alert Detail, Activity, More/Settings | Safety products need trust, urgency, and a clear history | Move operational controls out of More; use a timeline/feed for alert and safety activity |
| Nest Protect | Safety history with green/yellow/red/gray daily status cues | Reports, Activity, Alerts | Air safety history should make trends and past risk easy to understand | Use AirGuard status colors for daily/weekly report summaries and alert history |
| Tesla app | Single-object status dashboard with direct, high-priority controls | Home Dashboard, Device Detail | Strong model for "what is happening now" and direct actions without busy UI | Use a status-first hero for home safety and device/room-specific action cards |
| Home Assistant | Dense but scannable cards for sensors, status, and controls | Sensor readings, Room Detail, Dashboard | AirGuard needs multiple readings without feeling like a generic card pile | Use compact `SensorCard`s with icons, values, status, and timestamps |
| Tapo/Govee/Aqara-style device apps | Device tiles with type icons, connection state, battery/power, and room | Devices, Add Device, Room Detail | Makes devices feel real and inspectable | Replace text abbreviations with icons and add device health metadata |
| Konektado onboarding discipline | One purpose per screen, clear state routing, polished cards, no raw developer controls | Onboarding Intro, Create Home, Add Rooms, Add First Device, Review Setup | Stops setup from feeling like a shortcut/demo flow | Keep AirGuard branding, but make each setup screen purposeful and state-driven |
| Modern fintech onboarding | Clear progress, minimal copy, one primary CTA, trustworthy inputs | Create Account, Login, Setup | Auth/setup should feel production-grade and secure | Align create-account with login, normalize errors, and keep copy user-safe |
| Health/safety app onboarding | Contextual safety benefit before requesting setup details | Onboarding and First Device | Users need to understand why rooms/devices matter | Explain safety value per step without implementation details |

## What AirGuard Should Not Copy

- Do not clone Google Home, Apple Home, Ring, Arlo, Tesla, or Home Assistant visual branding.
- Do not use another app's icon set, layouts, or copy verbatim.
- Do not replace AirGuard's blue/green/navy identity.

## Reference-Informed Priority

1. Google Home/Apple Home patterns for app shell, rooms, and devices.
2. Arlo/Nest Protect patterns for alerts, safety history, and urgency.
3. Konektado/modern onboarding discipline for setup.
4. Home Assistant/device-app patterns for sensor/device density.
5. Tesla-style hierarchy for status-first dashboard polish.

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
