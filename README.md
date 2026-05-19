# AirGuard Expo MVP

AirGuard is an Expo / React Native mobile MVP for smart home air safety.

AirGuard is an official-feeling MVP with simulated sensors, local demo accounts, and local MVP storage. The mobile flow is designed to feel production-style without connecting to real services yet.

## What The MVP Does

- Shows a native welcome screen and realistic demo login flow.
- Persists a local demo session with AsyncStorage key `airguard.session`.
- Stores local app state, alerts, activity, checklist, reports, rooms, and devices with AsyncStorage.
- Uses simulated but believable sensor data for Rivera Residence in Sto. Tomas, Batangas.
- Simulates Normal Reading, High CO2, Smoke Detected, Sensor Offline, and Poor Ventilation.
- Supports Home, Rooms, Kitchen detail, Alerts, Alert Detail, Devices, More, Risks, Activity, Safety Checklist, Reports, Simulation Tools, and Settings.
- Keeps the alert workflow: New, Checking, Action Taken, Resolved.

## Demo Accounts

All accounts are local demo credentials for the MVP.

| Role | Email | Password |
| --- | --- | --- |
| Homeowner | `homeowner@airguard.demo` | `airguard123` |
| Safety Officer | `safety@airguard.demo` | `airguard123` |
| Administrator | `admin@airguard.demo` | `airguard123` |

## Run

```bash
npm install
npm start
```

Then open the project with Expo Go, an emulator, or a development build.

## Useful Commands

```bash
npm run typecheck
npx expo config --type public
```

## Defense Demo Flow

1. Open the app and tap Get Started.
2. Log in with a demo account or use a quick-fill demo account.
3. Show Home in the safe state.
4. Open More, then Simulation Tools as Safety Officer or Administrator.
5. Trigger Smoke Detected.
6. Open the critical Kitchen alert.
7. Start Checking.
8. Add an action note and mark Action Taken.
9. Resolve the alert.
10. Review Activity and Reports.
11. Use Reset Demo Data from More as Administrator when preparing for another review.

## Current Limitations

- AirGuard does not use a real backend or real authentication system yet.
- AirGuard does not connect to real IoT hardware yet.
- Hardware readings are simulated for the MVP.
- Future versions may add real authentication, database sync, push notifications, and ESP32 or Arduino sensor integration.
- Do not run `npm audit fix --force`; Expo SDK compatibility is more important for the MVP.
