# AirGuard

AirGuard is an Expo React Native smart home air safety application backed by Supabase. It allows users to create an account, set up a home, add rooms, add simulated air safety devices, monitor readings, respond to alerts, and review activity.

## Current MVP Status

Implemented:

- Supabase Auth
- Supabase Postgres database
- Row Level Security
- user profiles
- onboarding state
- homes
- home_members
- rooms
- devices
- readings
- alerts
- activity logs
- computed risks, reports, and setup readiness screens
- Figma-inspired mobile UI

Simulated for now:

- physical sensor signals
- device pairing process
- smoke/CO2 events from demo/admin controls

Planned:

- real IoT hardware integration
- realtime subscriptions
- push notifications
- production device provisioning
- advanced household roles

## Source of Truth

Supabase is the primary source of truth.

The app may cache data locally for UI/session convenience, but persistent app data belongs in Supabase.

Data flow:

```text
Screen
-> Store Action
-> Service
-> Supabase
-> Store Cache
-> Component
```

## Tech Stack

- Expo
- Expo Router
- React Native
- TypeScript
- Supabase Auth
- Supabase Postgres
- RLS
- Figma-inspired design system

## Supabase Database

Migration path:

- `supabase/migrations/202605190001_airguard_mvp.sql`

Tables:

- `profiles`
- `homes`
- `home_members`
- `rooms`
- `devices`
- `readings`
- `alerts`
- `activity_logs`

## Environment Variables

Create a local `.env` with:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Never put the Supabase service role key in the mobile app. Never commit real secrets.

## Setup

Install dependencies:

```bash
npm install
```

Validate the app:

```bash
npm run typecheck
npx expo config --type public
```

Start Expo:

```bash
npm run start
```

Supabase setup:

```bash
supabase init
supabase link --project-ref <your-project-ref>
supabase db push
```

Install the Supabase CLI first if `supabase` is not available. The project also exposes `npm run supabase -- --help`.

Seed the known test users once per Supabase project with a service-role key:

```bash
SUPABASE_URL=<your-supabase-url> SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key> npm run seed:demo-users
```

In PowerShell:

```powershell
$env:SUPABASE_URL="<your-supabase-url>"
$env:SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"
npm run seed:demo-users
```

Known test accounts:

| Role | Email | Password |
| --- | --- | --- |
| Homeowner | `homeowner@airguard.demo` | `airguard123` |
| Safety Officer | `safety@airguard.demo` | `airguard123` |
| Administrator | `admin@airguard.demo` | `airguard123` |

## App Flow

1. User opens app.
2. User signs up or logs in through Supabase Auth.
3. App loads profile.
4. If onboarding is incomplete or no home exists, user enters onboarding.
5. User creates home.
6. User chooses a sensor profile.
7. User assigns the sensor profile to a room.
8. User reviews setup and starts monitoring.
9. Dashboard loads database-backed home data.
10. User adds rooms/devices.
11. Simulated readings create reading records.
12. Critical readings create alerts.
13. User starts checking and resolves alerts.
14. Activity logs are saved.
15. User logs out/logs in and data persists.

## Defense Demo Flow

1. Start app.
2. Sign up or log in.
3. Create home if needed.
4. Name the home.
5. Add a sensor profile and assign it to a room.
6. Review setup and start monitoring.
7. Open dashboard.
8. Trigger simulated smoke alert.
9. Open alert detail.
10. Start Checking.
11. Resolve alert.
12. Review Activity.
13. Log out and log back in to prove persistence.

## Documentation

- `AGENTS.md`
- `docs/00-project-brief.md`
- `docs/09-development-rules.md`
- `docs/10-ai-instructions.md`
- `docs/11-decision-log.md`

## Current Limitations

- No real IoT hardware yet.
- Sensor values are simulated.
- Device pairing is simulated.
- Push notifications are not implemented.
- Realtime subscriptions are planned.
- Some flows may still need manual Supabase testing.
