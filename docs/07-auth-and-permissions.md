# Auth And Permissions

## Supabase Auth

AirGuard uses Supabase Auth for real sign up, 6-digit email code verification, login, logout, and session restoration. `src/lib/supabase.ts` configures the Supabase client with AsyncStorage for auth session support.

## Profile Creation

The database migration defines `handle_new_user`, which creates a profile after auth user creation. The app also calls profile service upsert helpers to ensure a profile exists after the user has an active verified session.

## Onboarding Complete

`profiles.onboarding_complete` controls whether the user has completed setup. A user may also be routed to onboarding when no home membership exists.

## Home Members Access Model

`home_members` grants access to homes. A user should only read or mutate home-owned data for homes where they are a member.

Initial home creation is handled by `public.create_home_for_current_user(home_name, address_label)`. The RPC requires an authenticated user and an existing profile, creates the home as that user, and creates owner membership in the same transaction. Do not bypass this by disabling RLS or inserting homes from screens.

## RLS Rules

RLS policies use `auth.uid()` and `public.is_home_member(home_id)` to protect home data. Fix permission bugs in policies or service flow; do not disable RLS.

## What Not To Do

- Do not call Supabase directly from screens.
- Do not hardcode primary users/homes/rooms/devices.
- Do not treat seed templates as the app database.
- Do not bypass membership checks in client code and assume that is security.
- Do not store persistent app data primarily in AsyncStorage.

## Operations Data Isolation

New real accounts must start clean. Template rooms, devices, readings, alerts, and event runs may be created only when the authenticated user explicitly completes setup or applies a controlled sensor event for an active home they can access. Normal homeowner accounts should not receive global seed data.

The web sensor console must run as an authenticated, RLS-protected client. Authenticated users can apply sensor events only against homes returned through `home_members` membership, with optional room/device targets resolved by the shared scenario service. Scenario services still use the normal anon client, so Supabase RLS prevents users from mutating homes they do not belong to. The console must not expose a Supabase service role key in browser or mobile code.

## Service Role Key

Never use the Supabase service role key in the mobile app. Only the public anon key belongs in Expo public environment variables.
