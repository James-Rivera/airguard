# Feature Map

## Auth

Supabase Auth handles sign up, login, logout, and session restoration. The app stores the Supabase session through the client storage adapter.

## Onboarding

Onboarding checks profile `onboarding_complete` and whether the user has a home membership. Users start setup, name a home, select a sensor profile, assign it to a room, review the setup, and start monitoring.

## Home Setup

`homes` records are inserted through `home-service`. The migration trigger creates owner membership in `home_members`.

## Room Management

Rooms are inserted into `rooms` through `room-service` and loaded into the store cache.

## Device Setup

The main onboarding path is software-first and does not present Bluetooth, Wi-Fi, QR, scan, or hardware initialization. Starting monitoring inserts the selected sensor profile into `devices` through `device-service`.

## Readings

Readings are inserted into `readings` through `reading-service`. Demo controls generate simulated normal, warning, and critical reading records.

## Alerts

Alerts are loaded and updated through `alert-service`. Critical smoke simulation inserts real alert records.

## Activity Logs

Activity is inserted into `activity_logs` through `activity-service` after important user and demo actions.

## More/Admin

More/admin surfaces can expose reset templates and simulation controls. Demo controls must persist generated data to Supabase.

## Demo Controls

Demo controls simulate sensor events only. They should not replace Supabase as the data source.

## Future IoT/Realtime/Push

Real hardware ingestion, realtime subscriptions, and push notifications are planned future layers.
