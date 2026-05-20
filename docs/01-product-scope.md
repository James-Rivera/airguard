# Product Scope

## MVP Included Features

- Supabase sign up, login, logout, and session persistence.
- Profile loading and onboarding completion.
- Home creation and owner membership.
- Room creation and room list/detail views.
- Simulated device setup with final device records saved to Supabase.
- Dashboard readings loaded from Supabase.
- Demo/admin controls that generate readings and alerts.
- Alert status workflow from active to checking to resolved.
- Activity logs saved to Supabase.

## Excluded Features

- Direct physical IoT hardware ingestion.
- Production device provisioning.
- Push notifications.
- Realtime subscriptions.
- Advanced household role administration.

## Future Features

- ESP32/Arduino or production sensor integration.
- Supabase realtime updates.
- Push notification delivery.
- Production-grade device provisioning.
- Advanced household roles and invitations.

## Real Backend Features

Supabase owns auth, profiles, homes, memberships, rooms, devices, readings, alerts, activity logs, persistence, and RLS.

## Simulated IoT/Demo Features

Physical sensor values, pairing discovery, smoke events, and CO2 scenarios are simulated by UI controls and service helpers. Their generated records persist to Supabase.

