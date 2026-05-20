# AirGuard AI Agent Instructions

## Project Summary

AirGuard is an Expo React Native smart home air safety app backed by Supabase. It lets users create accounts, set up homes, add rooms, add simulated devices, monitor air safety readings, respond to alerts, and review activity logs.

AirGuard is not a local-only demo. The app backend is real. Supabase Auth and Supabase Postgres are the source of truth. The hardware/sensor layer is simulated until real IoT integration is added.

DO NOT RUN EXPO LET ME RUN IT

## Required Reading Before Coding

Before making code changes, read:

1. docs/00-project-brief.md
2. docs/09-development-rules.md
3. docs/10-ai-instructions.md
4. docs/11-decision-log.md
5. README.md

If changing database, auth, RLS, services, store, or data flow, also read:

6. docs/05-data-model.md
7. docs/06-supabase-schema.md
8. docs/07-auth-and-permissions.md

## Non-Negotiable Rules

- Do not guess architecture.
- Inspect code before editing.
- Supabase is the source of truth.
- Do not describe AirGuard as local-only.
- Do not use hardcoded users/homes/rooms/devices as primary app data.
- seed.ts is only for templates/reset/dev fallback.
- Do not call Supabase directly from screens.
- Screens call store actions.
- Store actions call services.
- Services own Supabase queries.
- Do not disable RLS to "fix" bugs.
- Never use the Supabase service role key in the mobile app.
- Do not put everything in App.tsx.
- Preserve AirGuard's Figma-inspired design language.
- Use existing components and theme tokens.
- Update docs when architecture, database schema, flows, or major behavior changes.

## Architecture Rules

Expected layering:

```text
Screen
-> Store Action
-> Service
-> Supabase
-> Store Cache
-> Selector
-> Component
```

Responsibilities:

- screens: UI composition and user actions
- store: app state, cache, loading/error state, orchestration
- services: Supabase queries/mutations
- domain: models, selectors, shared business types
- components: reusable UI
- theme: design tokens

## Supabase Rules

- Auth handles real users.
- profiles stores user profile and onboarding status.
- homes stores user-created homes.
- home_members controls access.
- rooms/devices/readings/alerts/activity_logs belong to homes.
- RLS must protect user data.
- A user should only access homes where they are a member.

## Design Rules

Preserve:

- white backgrounds
- #0266F4 primary blue
- #06264A title text
- #475569 body text
- muted blue-gray borders/text
- 22-24px card radius
- soft shadows
- pill badges
- safety-first hierarchy
- clear primary CTA per screen
- useful empty states
- consistent bottom navigation

## Form UX Rules

- Users must always be able to see what they are typing.
- Any screen with text input must be keyboard-aware on Android and iOS.
- Inputs must not be hidden behind the software keyboard, bottom navigation, progress indicators, or pinned CTAs.
- Use shared keyboard-aware wrappers for form screens, or add an explicit keyboard-open compact/scroll behavior for custom layouts.

## Working Style For AI Agents

Work in phases:

1. Audit first.
2. Explain current state.
3. Propose plan.
4. Implement minimal safe changes.
5. Run validation.
6. Update docs.
7. Summarize files changed.

## Before Coding Checklist

- Read AGENTS.md.
- Read the relevant docs.
- Inspect affected files.
- Identify current data flow.
- Check if Supabase schema/RLS is affected.
- Check if docs need updating.

## After Coding Checklist

- Run typecheck.
- Run Expo config check if applicable.
- Confirm affected user journey.
- Check for hardcoded primary data.
- Check for direct Supabase calls in screens.
- Update docs if needed.
- Summarize changes.

## Current MVP Boundaries

Real:

- Supabase Auth
- profiles
- homes
- home_members
- rooms
- devices
- readings
- alerts
- activity logs
- database persistence
- RLS

Simulated:

- physical sensor hardware
- device pairing process
- smoke/CO2 events from demo controls

Future:

- real IoT hardware
- realtime updates
- push notifications
- production device provisioning
- advanced household roles

## Important Commands

- `npm install`
- `npm run start`
- `npm run android`
- `npm run ios`
- `npm run web`
- `npm run typecheck`
- `npx expo config --type public`
- `npm run supabase -- --help`
- `supabase db push`
