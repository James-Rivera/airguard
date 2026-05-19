# AirGuard Agent Guide

AirGuard is an Expo native MVP. Keep the app focused on demo reliability.

## Platform Rules

- Do not add Next.js, App Router files, Tailwind, or web dashboard code.
- Do not use browser-only APIs such as `window`, `document`, or `localStorage`.
- Use React Native primitives such as `View`, `Text`, `Pressable`, `ScrollView`, `TextInput`, and `StyleSheet`.
- Use AsyncStorage for local prototype persistence.
- Keep platform logic in `src/` and avoid introducing shared UI abstractions before the defense.

## MVP Priorities

- The primary demo must answer: "Is my home air safe, which room has a problem, and what should I do next?"
- Preserve the flow: Splash, Accounts, Home, Smoke demo, Kitchen alert, Alert Detail, Activity, Reports, Reset Demo.
- Prefer small, low-risk fixes over architecture work.
- Do not run `npm audit fix --force`; Expo SDK compatibility is more important for the MVP.

## Validation

Before handing off meaningful changes, run:

```bash
npm run typecheck
npx expo config --type public
```

Also test the demo flow in Expo Go or the target emulator when possible.
