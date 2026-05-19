# Design System

## Colors

Use tokens from `src/theme/colors.ts`:

- primary blue `#0266F4`
- cyan `#049CE0`
- accent `#0ACAC5`
- success `#22C55E`
- warning `#EAB308`
- critical `#EF4444`
- app background `#F6FAFC`
- surface `#FFFFFF`
- title text `#06264A`
- body text `#475569`
- muted text `#94A3B8`
- borders `#E2E8F0`

## Typography

Use `src/theme/typography.ts`. Current styles include brand, screenTitle, title, subtitle, body, bodyStrong, caption, captionStrong, and metric.

## Spacing

Use `src/theme/spacing.ts`: xxs 4, xs 8, sm 12, md 16, lg 20, xl 25, xxl 32. Screen padding is 25.

## Radius

Use `src/theme/radius.ts`: cards use 24, summary cards use 22, pills use 999.

## Shadows

Use `src/theme/shadows.ts` for soft card and button elevation.

Cards should use the subtle card shadow for repeated list/grid items, the stronger card shadow for hero surfaces, and the bottom-nav shadow token only for the floating tab pill.

## Buttons

Primary CTAs should be visually clear, usually brand blue, and use existing `AppButton` patterns.

## Cards

Cards should use white surfaces, large radius, soft shadows, and readable hierarchy.

## Badges

Use pill badges for safety and workflow states. Map good/warning/critical/offline and alert statuses through existing status colors/surfaces.

## Bottom Navigation

Use the existing consistent bottom tab navigation. Preserve predictable access to Home, Rooms, Alerts, Devices, and More.
The bottom navigation uses a safe-area-aware floating rounded pill with real SVG icons, not letter placeholders. The shell is 72px tall, the active tab gets a wider soft-blue pill, and inactive tabs stay compact with muted blue-gray labels. Screen content must reserve enough bottom padding so cards never hide behind the tab bar.

## Dashboard

The home dashboard follows the Figma reference closely: brand/greeting and Add Device share the top row, the safety hero uses the blue-to-teal gradient card, and Live Readings are always arranged as a responsive 2x2 grid within the 25px page gutters.

For 2-column grids, calculate card width from available screen width and gap instead of hardcoding a Figma frame width. Use `layout.maxPhoneWidth`, `layout.screenPadding`, and the current window width.

## Rooms, Devices, And Menu Cards

Room cards, device cards, More menu rows, and empty states should use semantic `AppIcon` icons rather than text abbreviations. Repeated cards should keep Figma-inspired 20-24px radii, white surfaces, muted borders, and soft shadows.

## Forms

Use existing text field and button components. Forms should be clear, mobile-first, and avoid visual clutter.

Input screens must keep the focused value visible when the software keyboard is open. Pinned onboarding footers should collapse while typing, and scroll containers should use keyboard-aware tap handling.

For small option sets, prefer visible selectable chips or cards over dropdowns. For custom room creation during onboarding, prefer a focused text input and let the room service infer the room icon from the typed name. Avoid repeating the preset room cards as icon choices inside the custom form.

## Empty States

Empty states should be useful and point users toward the next action, such as creating rooms or adding devices.

## Safety Hierarchy

Critical alerts and unsafe readings must be visible, actionable, and easier to notice than neutral content.
