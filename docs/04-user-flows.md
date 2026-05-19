# User Flows

## Signup

Entry screen: create account.
User action: enter name, email, and password.
App behavior: screen calls store action; store calls auth/profile services.
Supabase tables affected: `auth.users`, `profiles`.
Expected result: authenticated user exists and profile is available in app state.

## Login

Entry screen: login.
User action: enter Supabase credentials.
App behavior: store signs in, bootstraps session, profile, and active home.
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
Expected result: selected sensor profile exists as a real database record after onboarding completion.

## Dashboard

Entry screen: home tab.
User action: open app or return from setup.
App behavior: store loads home, rooms, devices, readings, alerts, and activity.
Supabase tables affected: read from `homes`, `rooms`, `devices`, `readings`, `alerts`, `activity_logs`.
Expected result: dashboard reflects database-backed home state.

## Add Device

Entry screen: setup/add-device or devices tab.
User action: choose device details and finish simulated pairing.
App behavior: store calls device and reading services.
Supabase tables affected: `devices`, `readings`, `activity_logs`.
Expected result: new simulated device persists after logout/login.

## Trigger Smoke Alert

Entry screen: demo/admin control surface.
User action: trigger smoke alert.
App behavior: store calls reading and alert services.
Supabase tables affected: `readings`, `alerts`, `activity_logs`.
Expected result: critical reading and alert records are created.

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
