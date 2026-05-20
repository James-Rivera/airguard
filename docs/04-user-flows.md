# User Flows

## Signup

Entry screen: create account.
User action: enter name, email, and password.
App behavior: screen calls store action; store calls auth/profile services.
Supabase tables affected: `auth.users`, `profiles`.
Expected result: if Supabase returns an active session, the profile is available immediately. If email confirmation is required, the user is routed to the verification code screen before setup.
Clean account rule: a brand-new user has no rooms, devices, readings, or alerts until they explicitly create setup data.

## Verify Signup Code

Entry screen: verify code.
User action: enter the 6-digit code sent by email.
App behavior: store calls Supabase OTP verification, then creates or loads the profile.
Supabase tables affected: auth session read/write, `profiles`.
Expected result: authenticated user reaches home setup with a clean account.

## Login

Entry screen: login.
User action: enter Supabase credentials.
App behavior: store signs in, bootstraps session, profile, accessible homes, and active home.
Supabase tables affected: auth session read, `profiles`, `home_members`, `homes`.
Expected result: user reaches onboarding or dashboard based on persisted data.

## Onboarding

Entry screen: onboarding index.
User action: proceed through setup.
App behavior: app routes to setup intro, name home, add sensor profile, assign sensor to room, and review.
Supabase tables affected: `profiles`, `homes`, `home_members`, `rooms`, `devices`, `readings`, `activity_logs`.
Expected result: setup state is persisted and dashboard can load Supabase data.

## Create Home

Entry screen: create home.
User action: enter home name/address.
App behavior: store calls `home-service.createHome`.
Supabase tables affected: `homes`, `home_members`, `activity_logs`.
Expected result: home exists and current user is an owner/member.

## Assign Sensor To Room

Entry screen: assign sensor to room.
User action: choose an existing room option or enter a custom room name.
App behavior: store keeps the selected room in setup state; final setup creates the room when needed and lets the room service infer the icon for custom names.
Supabase tables affected: `rooms`, `activity_logs`.
Expected result: rooms appear in dashboard and room screens after reload.

## Add Sensor Profile

Entry screen: add sensor profile.
User action: select Air Quality Sensor, Smoke Sensor, or CO2 Sensor.
App behavior: store keeps the selected sensor profile in setup state; final setup inserts the device and initial reading.
Supabase tables affected: `devices`, `readings`, `activity_logs`.
Expected result: selected sensor profile exists as a real database record after onboarding completion. Repeating the flow must not create duplicate devices for the same home, room, name, and type.

## Dashboard

Entry screen: home tab.
User action: open app or return from setup.
App behavior: store loads home, rooms, devices, readings, alerts, and activity. Pull-to-refresh calls the same store reload path to fetch the latest Supabase-backed state.
Supabase tables affected: read from `homes`, `rooms`, `devices`, `readings`, `alerts`, `activity_logs`.
Expected result: dashboard reflects database-backed home state.

## Room Detail

Entry screen: rooms tab or dashboard room card.
User action: tap a room card.
App behavior: app routes to `/rooms/[roomId]` and renders room-level status, readings, trends, active alert context, and devices from store selectors.
Supabase tables affected: none directly; data is read from the store cache loaded through services.
Expected result: room detail is a room overview. Device cards in the room route open device detail.

## Device Detail

Entry screen: devices tab, room detail, or related device card.
User action: tap a device card.
App behavior: app routes to `/devices/[deviceId]` and renders the selected sensor/device status, readings, trend chart, and device actions from store selectors.
Supabase tables affected: none directly; data is read from the store cache loaded through services.
Expected result: device detail is the Air Sensor detail surface. Tapping a room must not open this route.

## Add Device

Entry screen: setup/add-device or devices tab.
User action: choose device details and finish simulated pairing.
App behavior: store calls device and reading services.
Supabase tables affected: `devices`, `readings`, `activity_logs`.
Expected result: new simulated device persists after logout/login.
If no rooms exist yet, the user is routed toward adding a room first.

## Home Settings

Entry screen: More -> Home Settings.
User action: update home name or address label.
App behavior: screen calls store action; store calls `home-service.updateHome`.
Supabase tables affected: `homes`, `activity_logs`.
Expected result: home settings persist and reload from Supabase.

## Safety Checklist

Entry screen: More -> Safety Checklist.
User action: review setup readiness and jump to rooms, devices, alerts, activity, or home settings.
App behavior: checklist is generated from current store selectors and routes to existing screens.
Supabase tables affected: none directly unless the user follows an action.
Expected result: checklist reflects real current home state.

## Trigger Smoke Event

Entry screen: sensor operations console.
User action: trigger smoke alert.
App behavior: store calls `runDemoScenario("smoke-detected")`, which calls the scenario service and Supabase-backed reading, alert, room, device, and activity services.
Supabase tables affected: `rooms`, `devices`, `readings`, `alerts`, `activity_logs`.
Expected result: critical reading and alert records are created.

## Run Sensor Event

Entry screen: `/simulator` web sensor console.
User action: choose Normal Reading, High CO2 / Poor Ventilation, Smoke Detected, Sensor Offline, Humidity or Temperature Warning, or Reset to Normal.
App behavior: screen calls the store `runDemoScenario(type, target)` action with the selected room/device. The store requires an authenticated current user and an active member home loaded through membership-protected services, calls the shared scenario service, then reloads home data from Supabase.
Supabase tables affected: `rooms`, `devices`, `readings`, `alerts`, `activity_logs`.
Expected result: dashboard, rooms, alerts, and activity reflect the event from backend state. If the mobile app is already open, the user can pull to refresh the home dashboard, rooms, room detail, devices, alerts, or activity screens to load the latest data.

## Start Checking

Entry screen: alert detail.
User action: tap Start Checking.
App behavior: store calls `alert-service.startCheckingAlert`.
Supabase tables affected: `alerts`, `activity_logs`.
Expected result: alert status changes to `checking`.

## Resolve Alert

Entry screen: alert detail.
User action: resolve alert.
App behavior: store calls alert and reading services.
Supabase tables affected: `alerts`, `readings`, `activity_logs`.
Expected result: alert status changes to `resolved` and `resolved_at` is set.

## Activity Log

Entry screen: activity.
User action: review activity.
App behavior: store loads recent activity.
Supabase tables affected: read from `activity_logs`.
Expected result: database-backed event history is visible.

## Logout/Login Persistence

Entry screen: more/login.
User action: log out, then log back in.
App behavior: Supabase session ends and later restores data from database.
Supabase tables affected: auth session; reads from app tables.
Expected result: same home data persists from Supabase.
