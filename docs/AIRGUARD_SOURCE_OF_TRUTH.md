# AirGuard Source Of Truth

## Product Goal

AirGuard answers one question for a smart home: is my home air safe, which room has a problem, and what should I do next?

## Current Architecture Decision

AirGuard is an Expo native MVP. The active app is `App.tsx` with supporting files in `src/`.

The project should not recreate the old web dashboard for the MVP. Next.js, Tailwind, browser storage, and web-only APIs are out of scope.

## Academic Mapping

Free Elective / ELEC:

- Smart home air quality monitoring.
- Room-based monitoring.
- Simulated sensor readings.
- Smoke, CO2, humidity, and temperature.
- Smart ventilation and purifier concept.
- Safety alerts.

Information Assurance and Security:

- Alert and incident response.
- Risk management.
- Activity and audit-style logs.
- Prototype account selection.
- Safety checklist and compliance readiness.
- Presentation-ready reports.

## MVP Scope

Must work for defense:

- Splash and account selection.
- Home safe state.
- Rooms and Kitchen detail.
- Smoke, High CO2, Offline, Ventilation, and Normal demo controls.
- Alerts and Alert Detail.
- Checking, Action Taken, and Resolved alert workflow.
- Devices, Risks, Activity, Safety Checklist, and Reports.
- AsyncStorage persistence.
- Reset Demo.

Out of scope for MVP:

- Real hardware integration.
- Production authentication.
- Cloud database or backend sync.
- Push notifications, SMS, or email.
- Next.js dashboard.
- Shared UI library.

## Storage

The Expo app stores local prototype state with AsyncStorage. Do not use `localStorage`, `window`, or `document`.

## Demo Flow

1. Open AirGuard.
2. Tap through Splash.
3. Choose a demo account.
4. Show Home in the safe state.
5. Trigger Smoke.
6. Show the Kitchen critical alert.
7. Open Alert Detail.
8. Start Checking.
9. Mark Action Taken.
10. Resolve the alert.
11. Review Activity and Reports.
12. Reset Demo before the next walkthrough.

## Dependency Policy

Expo SDK compatibility comes first. Moderate audit findings from Expo transitive dependencies are accepted for the MVP. Do not run `npm audit fix --force`.
