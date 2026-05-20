# AirGuard UI Audit Report

This audit reflects the UI-only Figma matching pass against the AirGuard Figma strip. Figma remains the visual source of truth, but fixed frame dimensions were converted into responsive React Native layouts.

## Shared Design System

| Area | Mismatch found | Component/file responsible | Fix applied |
| --- | --- | --- | --- |
| Bottom navigation | Bar felt oversized, could overlap content, and icons previously read like letter placeholders. A recovery audit found the selected tab was constrained by the custom tab bar wrapper instead of the shell's inner content area. | `src/components/ui/BottomTabBar.tsx`, `src/theme/spacing.ts`, `src/theme/shadows.ts` | Rebuilt as an 88px safe-area-aware tab region with a centered 72px pill, real SVG icons, fixed-height active pill, Figma-aligned widths, and reduced duplicate scroll padding. |
| Card shadows | Cards, nav, and summary surfaces used inconsistent elevation. | `src/theme/shadows.ts`, `src/components/ui/AppCard.tsx` | Added subtle card and bottom-nav shadow tokens and applied them to list cards, summaries, rooms, devices, and menu rows. |
| Colors | Several Figma colors were repeated inline or missing from tokens. | `src/theme/colors.ts` | Added navigation, reading border, ink, and graphite tokens for Figma-aligned surfaces and text. |
| Typography | Screen titles and compact card labels did not consistently match the Figma hierarchy. | `src/theme/typography.ts`, `src/components/ui/AppScreen.tsx`, shared cards | Standardized 32px screen titles, 20px section headers, Poppins card labels, and compact 12px metadata. |
| Icons | Rooms, devices, More menu, and empty states used text abbreviations. | `src/components/ui/AppIcon.tsx`, `RoomCard`, `DeviceCard`, `MenuItemCard`, `EmptyState` | Replaced text placeholders with reusable SVG icons and semantic menu icon names. |

## Screen Audit

| Screen | Mismatch found | Component/file responsible | Fix applied |
| --- | --- | --- | --- |
| Welcome / Get Started | Existing screen already followed the Figma image-first welcome direction from the prior pass. | `src/app/index.tsx` | No new code change in this pass; kept responsive max-width welcome layout. |
| Login | Existing login already used the Figma underline auth layout from the prior pass. | `src/app/auth/login.tsx` | No new code change in this pass; verified it remains keyboard-aware. |
| Auth forms | Android keyboard could cover focused fields and following inputs on login/create-account. | `src/app/auth/login.tsx`, `src/app/auth/create-account.tsx` | Added explicit keyboard-open compact spacing, Android `KeyboardAvoidingView` behavior, focus scrolling, and keyboard-height bottom inset so typed values remain visible. |
| Signup verification | Create Account treated Supabase email confirmation as a failed signup because no active session existed yet. | `src/services/auth-service.ts`, `src/state/airguard-store.tsx`, `src/app/auth/create-account.tsx`, `src/app/auth/verify-code.tsx` | Added a 6-digit email verification flow that completes the Supabase signup before creating/loading the profile and continuing to setup. |
| Home | Live readings needed a strict 2x2 responsive grid and reading labels closer to Figma. | `src/app/tabs/home.tsx`, `ReadingCard`, `SafetyStatusCard`, `RoomCard` | Kept responsive 2x2 width calculation, aligned card colors to tokens, mapped smoke tile copy to `PM2.5`, and improved the home room preview card. |
| Rooms | Cards were vertically stretched/one-column on the emulator and the add action was absolutely positioned. | `src/app/tabs/rooms.tsx`, `RoomCard` | Converted to responsive 2-column grid using `(contentWidth - gap) / 2`, moved add action into the header, and replaced text room badges with real room icons. |
| Room Detail / Kitchen | Readings wrapped unevenly and the screen lacked the Figma-style room status summary/trend structure. | `src/app/rooms/[roomId].tsx` | Added room hero card, status badge, responsive 2x2 current readings, lightweight trends panel, and empty state for room devices. |
| Alerts | Alert cards were generic and filters could wrap awkwardly. | `src/app/tabs/alerts.tsx`, `AlertCard`, `FilterPill` | Tightened filter chips, added empty state, aligned card height/padding/shadow, and made the primary action copy closer to the Figma safety workflow. |
| Devices | Header add action was fixed/absolute, device icons were text, and list was silently sliced. | `src/app/tabs/devices.tsx`, `DeviceCard`, `SummaryCard` | Moved add action into the header, replaced text icons with device SVG icons, showed all devices, and removed the hardcoded `+2 this week` metric. |
| More | Profile/menu cards were visually close but icons were letters and logout/admin tools cluttered the screen. | `src/app/tabs/more.tsx`, `MenuItemCard`, `src/domain/seed.ts` | Replaced menu letters with icons, tightened profile/menu card sizing, made Logout a prominent red button, and grouped operational tools below the main settings surface. |
| Activity | Existing route is functional but simpler than the Figma-adjacent More flow. | `src/app/activity.tsx` | No major code change in this pass; menu routing remains functional. |
| Risks | Figma has a risks screen reference, but no real app route exists yet. | `src/navigation/routes.ts` | Documented as missing; no fake screen was added in this UI-only pass. |
| Reports | Figma has a reports screen reference, but no real app route exists yet. | `src/navigation/routes.ts` | Documented as missing; no fake screen was added in this UI-only pass. |
| Safety Checklist | More references a checklist, but no real checklist route exists yet. | `src/domain/seed.ts`, `src/app/tabs/more.tsx` | Kept the menu row visually consistent but did not invent a placeholder route. |
| Home Settings / profile | More references home settings, but no real settings route exists yet. | `src/domain/seed.ts`, `src/app/tabs/more.tsx` | Kept the row visually consistent and documented the missing route. |

## Validation Notes

- TypeScript validation passed with `npm run typecheck`.
- Expo config validation passed with `npx expo config --type public`.
- Expo was not started because `AGENTS.md` says not to run Expo; runtime visual QA should be done by the project owner on the target emulator/device.

## Recovery Audit Addendum

| Area | Root cause found | Fix applied | Remaining risk |
| --- | --- | --- | --- |
| New account data | Onboarding and reset paths had fallbacks that could create default room/device data without a fully explicit current choice. | Onboarding now requires a selected sensor profile and selected/custom room before creating records. Signup/bootstrap keep blank state until the user creates setup data. | Existing backend rows created before this fix may still exist unless the account is cleaned or exact duplicate cleanup removes them. |
| Duplicate devices | Device inserts were not idempotent at the service layer and checked stale store state. | Added service-level `findOrCreateDevice`, `findOrCreateRoom`, and exact duplicate device cleanup by home/room/name/type. Store actions now use idempotent APIs. | No database unique index was added in this pass to avoid migration failure against dirty existing data. |
| Demo/sample data | Reset and simulation helpers were available as store actions without a shared authorization guard. | Demo tools now require a known demo email or administrator/member role before creating sample readings, alerts, rooms, or devices. | Runtime testing should verify the intended defense-demo account has access to operational tools. |
| Dead menu rows | More rendered Home Settings and Safety Checklist with no route. | Added route-backed Home Settings and Safety Checklist screens and wired More menu actions to them. | Device detail remains a future route; device cards are informational for this pass. |
