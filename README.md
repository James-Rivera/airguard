# AirGuard Expo MVP

AirGuard is a native Expo prototype for smart indoor air monitoring. The app is built for the mobile Figma direction: native splash feel, account selection, phone-sized screens, rounded cards, and pill-style bottom navigation.

## What This Prototype Does

- Shows the AirGuard splash screen with the exact shield/leaf logo drawn in native SVG.
- Uses demo accounts instead of role-only login.
- Stores mock app state with AsyncStorage.
- Simulates smart-home hardware events: Smoke, High CO2, Offline, Ventilation, and Normal.
- Supports Home, Rooms, Kitchen detail, Alerts, Alert Detail, Devices, More, Risks, Activity, Safety Checklist, and Reports.
- Keeps the alert workflow: New, Checking, Action Taken, Resolved.

## Run

```bash
npm install
npm start
```

Then open the project with Expo Go, an emulator, or a development build.

## Useful Commands

```bash
npm run android
npm run ios
npm run web
npm run typecheck
npx expo config --type public
```

## Defense Demo Flow

1. Open the app and tap the splash screen.
2. Choose a demo account.
3. Show the Home screen in the safe state.
4. Trigger the Smoke demo control.
5. Open the critical Kitchen alert.
6. Mark the alert as Checking.
7. Add an action note or use the default action note.
8. Resolve the alert.
9. Review Activity and Reports to show the response history.
10. Use Reset Demo from More when preparing for another walkthrough.

## Prototype Notes

- No real ESP32, Arduino, cloud database, push notification, or production authentication is connected yet.
- Demo accounts are for presentation only.
- Mock readings, alerts, devices, activity, risks, and checklist state are saved locally on the device.
- Moderate npm audit findings currently come from the Expo dependency tree. Do not run `npm audit fix --force` for the MVP because it can break Expo SDK compatibility.
