# AirGuard Project Brief

## What AirGuard Is

AirGuard is an Expo React Native smart home air safety app backed by Supabase. It lets users create real accounts, set up homes, add rooms, add simulated devices, monitor air safety readings, respond to alerts, and review activity logs.

## Current MVP Status

The MVP has Supabase Auth, Supabase Postgres persistence, RLS, profile creation, onboarding state, homes, memberships, rooms, devices, readings, alerts, and activity logs. The mobile UI uses a Figma-inspired design system implemented with React Native primitives and Expo Router.

## Real vs Simulated

Real now:

- Supabase Auth sessions
- profile records and onboarding state
- homes and home membership
- room, device, reading, alert, and activity log records
- RLS-backed database access
- store/service data flow

Simulated for now:

- physical sensor hardware input
- device pairing discovery/provisioning
- smoke and CO2 events triggered by demo/admin controls

## Current Tech Stack

- Expo
- Expo Router
- React Native
- TypeScript
- Supabase Auth
- Supabase Postgres
- Row Level Security
- AsyncStorage only as the Supabase session storage adapter and temporary UI cache support

## Architecture Summary

The expected app path is:

```text
Screen
-> Store Action
-> Service
-> Supabase
-> Store Cache
-> Selector
-> Component
```

Screens live under `src/app/`, state orchestration lives in `src/state/airguard-store.tsx`, Supabase queries live in `src/services/`, shared models/selectors live in `src/domain/`, and UI primitives live in `src/components/` and `src/theme/`.

## Source Of Truth

Supabase is the source of truth. Hardware signals are simulated for now, but generated readings, alerts, and activity are saved as real Supabase records.

