# Feature Map

## Auth

Supabase Auth handles sign up, email code verification, login, logout, and session restoration. The app stores the Supabase session through the client storage adapter.

## Onboarding

Onboarding checks profile `onboarding_complete` and whether the user has a home membership. Users start setup, name a home, select a sensor profile, assign it to a room, review the setup, and start monitoring.

## Home Setup

`homes` records are inserted through `home-service`. The migration trigger creates owner membership in `home_members`.

## Room Management

Rooms are inserted into `rooms` through `room-service` and loaded into the store cache.
Room cards route to room detail, which is a room overview for status, readings, trends, active alert context, and the devices assigned to that room.

## Device Setup

The main onboarding path is software-first and does not present Bluetooth, Wi-Fi, QR, scan, or hardware initialization. Starting monitoring inserts only the explicitly selected sensor profile and assigned room through idempotent store/service actions.
Device cards route to device detail, which owns the Air Sensor detail surface, device status, readings, trend chart, and device actions.

## Readings

Readings are inserted into `readings` through `reading-service`. Controlled sensor events generate normal, high CO2, smoke, offline, humidity, temperature, and reset readings through the shared scenario service.

## Alerts

Alerts are loaded and updated through `alert-service`. Scenario warnings and critical events insert real alert records, and reset-to-normal resolves active alerts.

## Activity Logs

Activity is inserted into `activity_logs` through `activity-service` after important user and scenario actions. Scenario runs are recorded as `demo` activity entries.

## More/Admin

More is for homeowner/profile navigation. Authenticated users can open the AirGuard Sensor Console, which runs only against the active home loaded through membership-protected data.

## Sensor Operations Controls

Sensor operations controls call the shared `runDemoScenario(type)` store action. They do not replace Supabase as the data source, and Phase 1 access is limited to authenticated users operating on their own active home data.

## Web Sensor Console

The `/simulator` route provides a browser-friendly AirGuard Sensor Console for controlled sensor events. It uses shared scenario metadata for previews and calls the same store action/scenario service as the rest of the app, so event output is saved to Supabase and later read by the mobile app.

## Home Settings And Checklist

More routes to real Home Settings and Safety Checklist screens. Home Settings updates the current Supabase-backed home record through the store/service flow. Safety Checklist is generated from current home, rooms, devices, alerts, and activity state rather than hardcoded screen data.

## Future IoT/Realtime/Push

Real hardware ingestion, realtime subscriptions, and push notifications are planned future layers.
