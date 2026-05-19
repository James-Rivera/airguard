# Development Rules

## Project Layering

Use this flow:

```text
Screen
-> Store Action
-> Service
-> Supabase
-> Store Cache
-> Selector
-> Component
```

## Responsibilities

- Screens compose UI and call store actions.
- Store actions orchestrate loading, mutations, cache updates, loading state, and errors.
- Services own Supabase queries and mutations.
- Domain files define models, selectors, and demo templates.
- Components provide reusable UI.
- Theme files provide design tokens.

## No Hardcoded Primary Data

Hardcoded users, homes, rooms, devices, readings, alerts, and activity must not be the primary app state. `src/domain/seed.ts` may provide templates, reset data, development fallback, and demo generation helpers only.

## No Direct Supabase Calls In Screens

Screens under `src/app/` must not import the Supabase client. Add or update a service, call it from the store, and expose a store action to the screen.

## First Home Creation

Use `home-service.createHome`, which calls the `create_home_for_current_user` RPC. The first home cannot rely on existing home membership because membership is created as part of the transaction. Do not work around first-home RLS failures by disabling RLS or inserting directly from a screen.

## Adding Features

1. Inspect related screens, store actions, services, models, and migrations.
2. Update schema/RLS first if persistence changes.
3. Add service methods for Supabase access.
4. Add store actions/selectors.
5. Update screens/components.
6. Add or update docs.

## Keyboard-Safe Forms

All screens with text inputs must keep the focused field and typed value visible when the software keyboard opens.

- Prefer shared keyboard-aware wrappers (`AppScreen` or `OnboardingStepLayout`) for input screens.
- Custom form screens must use `KeyboardAvoidingView` plus a scrollable or compact keyboard-open state.
- Scrollable form containers should set `keyboardShouldPersistTaps="handled"`.
- Do not build static poster-style input screens unless they explicitly respond to keyboard open/close.
- Android must keep `softwareKeyboardLayoutMode` set to `resize` in Expo config.

## Updating Docs

Update AGENTS.md and relevant docs when architecture, schema, auth, flows, or important behavior changes.

## Validation Commands

- `npm run typecheck`
- `npx expo config --type public`

Run Expo Go or an emulator when possible for flow testing.
