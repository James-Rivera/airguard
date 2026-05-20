# AI Instructions

## Inspect Before Coding

Read AGENTS.md, README.md, and relevant docs before editing. Inspect affected files and verify the current data flow. Do not rely on stale prompt memory.

## Work In Phases

1. Audit the current state.
2. Explain what is true now.
3. Propose a focused plan when the work is substantial.
4. Implement minimal safe changes.
5. Run validation.
6. Update docs.
7. Summarize changes and remaining risks.

## Avoid Regressions

Preserve the Supabase-backed architecture. Avoid unrelated refactors. Keep changes small unless the task explicitly asks for a broader rewrite.

## Preserve Supabase Source Of Truth

Supabase Auth and Supabase Postgres are real now. AsyncStorage is not the primary app database. Seed templates are not the app state.

Good change: a screen calls a store action that calls a service to insert a reading.
Bad change: a screen imports `supabase` directly or creates fake readings only in local state.

## Preserve RLS

RLS must stay enabled. Fix access bugs with correct policies, membership records, or service flow. Do not solve mobile bugs by weakening database security.

## Preserve Design Language

Use existing components and tokens. Keep the white, blue, soft-card, safety-first mobile visual language.

## Update Docs

When schema, auth, services, flows, or major behavior changes, update the matching docs file and AGENTS.md if future agents need the rule.

## Validate Flows

For meaningful changes, run typecheck and Expo config. When possible, manually test sign up/login, onboarding, dashboard loading, simulated alert, alert resolution, activity, and logout/login persistence.

