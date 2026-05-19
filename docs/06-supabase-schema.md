# Supabase Schema

## Migration Path

- `supabase/migrations/202605190001_airguard_mvp.sql`

## Environment Variables

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Never use the Supabase service role key in the mobile app.

## Tables

- `profiles`
- `homes`
- `home_members`
- `rooms`
- `devices`
- `readings`
- `alerts`
- `activity_logs`

## Relationships

Profiles mirror auth users. Homes are created by profiles. Home membership grants access. Rooms, devices, readings, alerts, and activity logs belong to homes.

## Triggers

- `set_updated_at` updates `updated_at` for profiles, homes, rooms, and devices.
- `handle_new_user` creates or updates a profile after auth user creation.
- `handle_new_home` creates owner membership after home insertion.

## RLS Summary

RLS is enabled on all app tables. Users can read/update their own profile. Home-owned records are readable or mutable when `public.is_home_member(home_id)` returns true. Homes can be inserted only by their creator.

## Onboarding Database Writes

Onboarding writes home, membership, room, device, initial reading, activity log, and profile `onboarding_complete` data to Supabase.

Home creation uses the `public.create_home_for_current_user(home_name, address_label)` RPC. The function is `security definer`, requires `auth.uid()`, requires an existing profile row, inserts the home with `created_by = auth.uid()`, and ensures owner membership. This keeps RLS enabled while making the first-home creation transaction reliable before membership exists.

## Reading/Alert Database Writes

Simulation controls insert real `readings` rows. Critical smoke simulation inserts real `alerts` rows and related `activity_logs`.
