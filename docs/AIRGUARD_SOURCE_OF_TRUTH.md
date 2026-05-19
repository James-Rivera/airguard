# AirGuard Source Of Truth

## Product Goal

AirGuard answers one question for a smart home: is my home air safe, which room has a problem, and what should I do next?

## Current Architecture Decision

AirGuard is an Expo / React Native mobile MVP. The active app is `App.tsx` with supporting platform logic in `src/`.

The MVP uses demo accounts, AsyncStorage, and simulated sensor data. It does not use a real backend or real authentication system yet, and it does not connect to real IoT hardware yet.

Next.js, Tailwind, browser storage, browser-only APIs, and web dashboard work are out of scope.

## Demo Accounts

Demo accounts are local MVP credentials:

- Homeowner: `homeowner@airguard.demo` / `airguard123`
- Safety Officer: `safety@airguard.demo` / `airguard123`
- Administrator: `admin@airguard.demo` / `airguard123`

Successful login stores a local demo session at AsyncStorage key `airguard.session`.

## MVP Scope

Must work for defense:

- Native welcome screen and realistic demo login.
- Home safe state.
- Rooms and Kitchen detail.
- Normal Reading, High CO2, Smoke Detected, Sensor Offline, and Poor Ventilation simulation tools.
- Alerts and Alert Detail.
- New, Checking, Action Taken, and Resolved alert workflow.
- Devices, Risks, Activity, Safety Checklist, Reports, Simulation Tools, and Settings.
- AsyncStorage persistence.
- Logout and Reset Demo Data.
- Role differences for Homeowner, Safety Officer, and Administrator.

Out of scope for MVP:

- Real hardware integration.
- Production authentication.
- Cloud database or backend sync.
- Push notifications, SMS, or email.
- Next.js dashboard.
- External shared UI packages.

## Storage

The Expo app stores local demo state with AsyncStorage. Use React Native primitives and do not use `localStorage`, `window`, or `document`.

## Demo Flow

1. Open AirGuard.
2. Tap Get Started.
3. Log in with a demo account.
4. Show Home in the safe state.
5. Open More, then Simulation Tools as Safety Officer or Administrator.
6. Trigger Smoke Detected.
7. Show the Kitchen critical alert.
8. Open Alert Detail.
9. Start Checking.
10. Add an action note.
11. Mark Action Taken.
12. Resolve the alert.
13. Review Activity and Reports.
14. Reset Demo Data before the next review as Administrator.

## Future Direction

Future versions may add real authentication, database sync, push notifications, and ESP32 or Arduino sensor integration.

## Dependency Policy

Expo SDK compatibility comes first. Do not run `npm audit fix --force`.
