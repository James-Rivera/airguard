# Decision Log

## 2026-05-19 — Figma is visual reference, not the product limit

Context:
AirGuard started from Figma screens, but the app needs to behave like a real product.
Decision:
Use Figma as visual/product reference, not as a static screen limit.
Reason:
A real app needs onboarding, setup, data persistence, and working flows.
Impact:
Screens must be extended into true user journeys.
Status:
Accepted.

## 2026-05-19 — AirGuard must be a real Supabase-backed app

Context:
The app should not be local-only or hardcoded.
Decision:
Supabase Auth and Supabase Postgres are the real backend/source of truth.
Reason:
AirGuard should be closer to Konektado's real app architecture.
Impact:
Auth, profiles, homes, rooms, devices, readings, alerts, and activity logs persist in Supabase.
Status:
Accepted.

## 2026-05-19 — Hardware signals are simulated until IoT integration

Context:
Real ESP32/Arduino hardware is not integrated yet.
Decision:
Only physical sensor input and pairing are simulated for now.
Reason:
The app can be real before hardware integration is complete.
Impact:
Demo controls generate readings/alerts that are saved to Supabase.
Status:
Accepted.

## 2026-05-19 — seed.ts is not primary app state

Context:
Seed data is useful but should not define the real app.
Decision:
seed.ts is only for templates, reset, fallback, or demo generation.
Reason:
Real app data belongs in Supabase.
Impact:
Screens/store must not rely on hardcoded seed data as primary state.
Status:
Accepted.

## 2026-05-19 — RLS must remain enabled

Context:
Supabase data must be protected per user/home membership.
Decision:
RLS remains enabled and policies must enforce access.
Reason:
Mobile apps must not rely on client-only authorization.
Impact:
Any RLS issue must be fixed with policies, not by disabling security.
Status:
Accepted.

## 2026-05-19 — Services separate Supabase from screens

Context:
Direct Supabase calls in screens create messy architecture.
Decision:
Screens call store actions; store actions call services; services call Supabase.
Reason:
Keeps UI thin and data flow maintainable.
Impact:
Future features must follow the architecture.
Status:
Accepted.

## 2026-05-19 — AGENTS.md and docs are project memory

Context:
Future AI agents may lose context when switching accounts/tools.
Decision:
AGENTS.md and docs/ are the official source of truth.
Reason:
Prevents guessing and architecture regressions.
Impact:
Agents must read AGENTS.md and relevant docs before coding.
Status:
Accepted.

