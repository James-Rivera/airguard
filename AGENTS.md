# AirGuard Agent Guide

AirGuard is an Expo / React Native mobile MVP with simulated sensors. Keep the app focused on demo reliability and a realistic product experience.

## Platform Rules

- Do not add Next.js, App Router files, Tailwind, or web dashboard code.
- Do not use browser-only APIs such as `window`, `document`, or `localStorage`.
- Use React Native primitives such as `View`, `Text`, `Pressable`, `ScrollView`, `TextInput`, and `StyleSheet`.
- Use AsyncStorage for local demo session and app-state persistence.
- Keep platform logic in `src/` and use the native shared components/design tokens already in `src/`.

## MVP Priorities

- The primary demo must answer: "Is my home air safe, which room has a problem, and what should I do next?"
- Preserve the flow: Welcome, demo login, Home, Smoke demo, Kitchen alert, Alert Detail, Activity, Reports, Reset Demo.
- Prefer small, low-risk fixes over architecture work.
- Do not run `npm audit fix --force`; Expo SDK compatibility is more important for the MVP.
- Demo accounts are intentionally local and realistic. Do not add a real backend or real authentication system yet.
- Simulated sensor data is intentionally local. Do not connect real IoT hardware yet.
- Future versions may use real authentication, database sync, and ESP32/Arduino sensors.

## Validation

Before handing off meaningful changes, run:

```bash
npm run typecheck
npx expo config --type public
```

Also test the demo flow in Expo Go or the target emulator when possible.
