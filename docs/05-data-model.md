# Data Model

## Profile/User

Source of truth: Supabase Auth plus `profiles`.
Fields include id, name, email, role, and `onboarding_complete`. Profiles are owned by the authenticated user id.

## Home

Source of truth: `homes`.
Homes represent user-created monitored households. `created_by` references the creating profile.

## HomeMember

Source of truth: `home_members`.
Membership connects users to homes and controls access. A home creation trigger inserts the owner membership.

## Room

Source of truth: `rooms`.
Rooms belong to homes and include name, type, and safety status.

## Device

Source of truth: `devices`.
Devices belong to homes and optionally rooms. Physical pairing is simulated, but final devices are real records.
Device setup must create or find the persisted device row first and use that real device id for any initial readings or activity that follows. Device removal deletes the real device record through normal RLS-protected client access.

## Reading

Source of truth: `readings`.
Readings belong to homes, rooms, and optionally devices. Values are simulated until hardware integration, but each generated value is a database record.
The store keeps both latest deduped readings for current UI tiles and recent reading history for reports.
When a reading includes a device id, the device must belong to the same home and room before the reading is inserted.

## Alert

Source of truth: `alerts`.
Alerts belong to homes and rooms, with optional device linkage. Status values include active, checking, and resolved.

## ActivityLog

Source of truth: `activity_logs`.
Activity logs belong to homes and optionally users. Store actions create logs after meaningful events.
Scenario runs are recorded as activity logs with category/type `demo` until a dedicated `scenario_runs` table is needed.

## Relationships

- `profiles.id` references `auth.users.id`.
- `homes.created_by` references `profiles.id`.
- `home_members.home_id` references `homes.id`.
- `home_members.user_id` references `profiles.id`.
- `rooms.home_id`, `devices.home_id`, `readings.home_id`, `alerts.home_id`, and `activity_logs.home_id` reference `homes.id`.
- `devices.room_id`, `readings.room_id`, and `alerts.room_id` reference `rooms.id`.
- `readings.device_id` and `alerts.device_id` reference `devices.id`.

## Ownership Rules

Supabase owns persistent data. Store state is a cache of the active user's current Supabase-backed home data.

