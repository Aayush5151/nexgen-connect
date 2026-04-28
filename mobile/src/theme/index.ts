/**
 * Mobile theme bridge.
 *
 * Re-exports the canonical tokens from @nexgen-connect/shared so the
 * mobile app has a single import path for "the design system" — and
 * adds a few RN-only conveniences that don't belong in the shared
 * package (StyleSheet helpers, common type-style presets, hitSlop
 * defaults). If a value can be shared with web, it lives in
 * packages/shared/theme.ts; if it's RN-only, it lives here.
 */

import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";
import { theme as base } from "@nexgen-connect/shared";

export { theme } from "@nexgen-connect/shared";

/**
 * Common hitSlop. RN's default tap target is the rendered area —
 * accessibility minimum is 44x44pt. Apply this to any touchable that's
 * smaller than that on screen.
 */
export const HIT_SLOP_44 = { top: 12, right: 12, bottom: 12, left: 12 };

/**
 * Derived primary-color tint for backgrounds. Replaces the dozens of
 * hand-typed `rgba(0, 220, 130, X)` strings that used to litter the
 * codebase — if the brand primary ever changes from #00DC82 the
 * derivation in `@nexgen-connect/shared` is the single edit point and
 * every tinted surface follows automatically.
 *
 * Common opacities: 0.04 (subtle card), 0.05 (filled-state), 0.06
 * (active toggle), 0.08 (pressed pill), 0.10 (highlight ring).
 */
export function primaryTint(opacity: number): string {
  // Parse #RRGGBB → r, g, b once. Module-level eval would be cleaner
  // but RN bundlers fold it the same way at build time.
  const hex = base.colors.primary.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Type-style presets that compose font family + size + weight + line
 * height in one shot. Replace ad-hoc {fontFamily, fontSize, ...} with
 * a single `style={typography.h1}`.
 */
export const typography = StyleSheet.create({
  h1: {
    color: base.colors.fg,
    fontFamily: base.fontFamily.heading,
    fontSize: 44,
    fontWeight: base.fontWeight.semibold,
    letterSpacing: -1.5,
    lineHeight: 46,
  } satisfies TextStyle,

  h2: {
    color: base.colors.fg,
    fontFamily: base.fontFamily.heading,
    fontSize: 32,
    fontWeight: base.fontWeight.semibold,
    letterSpacing: -1,
    lineHeight: 36,
  } satisfies TextStyle,

  h3: {
    color: base.colors.fg,
    fontFamily: base.fontFamily.heading,
    fontSize: 22,
    fontWeight: base.fontWeight.semibold,
    letterSpacing: -0.5,
    lineHeight: 28,
  } satisfies TextStyle,

  /** Editorial italic accent — used for the brand serif emphasis. */
  serifAccent: {
    color: base.colors.primary,
    fontFamily: base.fontFamily.serif,
    fontSize: 22,
    fontStyle: "italic",
    lineHeight: 28,
  } satisfies TextStyle,

  body: {
    color: base.colors.fgMuted,
    fontFamily: base.fontFamily.body,
    fontSize: 16,
    fontWeight: base.fontWeight.regular,
    lineHeight: 24,
  } satisfies TextStyle,

  bodyStrong: {
    color: base.colors.fg,
    fontFamily: base.fontFamily.body,
    fontSize: 16,
    fontWeight: base.fontWeight.semibold,
    lineHeight: 24,
  } satisfies TextStyle,

  caption: {
    color: base.colors.fgSubtle,
    fontFamily: base.fontFamily.body,
    fontSize: 13,
    fontWeight: base.fontWeight.regular,
    lineHeight: 18,
  } satisfies TextStyle,

  /** Mono kicker. Uppercase + tracking applied via component, not
   *  here, so we can flex it case-by-case without burning a variant. */
  mono: {
    color: base.colors.fgSubtle,
    fontFamily: base.fontFamily.mono,
    fontSize: 11,
    fontWeight: base.fontWeight.semibold,
    letterSpacing: 1.6,
    lineHeight: 14,
    textTransform: "uppercase",
  } satisfies TextStyle,

  buttonLabel: {
    color: base.colors.primaryFg,
    fontFamily: base.fontFamily.body,
    fontSize: 15,
    fontWeight: base.fontWeight.semibold,
    letterSpacing: -0.1,
  } satisfies TextStyle,

  inputLabel: {
    color: base.colors.fgSubtle,
    fontFamily: base.fontFamily.mono,
    fontSize: 11,
    fontWeight: base.fontWeight.semibold,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  } satisfies TextStyle,

  inputValue: {
    color: base.colors.fg,
    fontFamily: base.fontFamily.body,
    fontSize: 18,
    fontWeight: base.fontWeight.regular,
  } satisfies TextStyle,

  errorText: {
    color: base.colors.danger,
    fontFamily: base.fontFamily.body,
    fontSize: 13,
    fontWeight: base.fontWeight.medium,
    lineHeight: 18,
  } satisfies TextStyle,
});

/**
 * Common border styles. RN doesn't have CSS variables so a
 * StyleSheet.create call captures the recurring 1px hairline pattern.
 */
export const borders = StyleSheet.create({
  hairline: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: base.colors.border,
  } satisfies ViewStyle,
  hairlineBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: base.colors.border,
  } satisfies ViewStyle,
});
