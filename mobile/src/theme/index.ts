/**
 * Mobile theme bridge.
 *
 * Re-exports the canonical tokens from @nexgen-connect/shared so the
 * mobile app has a single import path for "the design system" — and
 * adds the RN-only conveniences:
 *   - textStyles: StyleSheet covering all 11 type-scale tokens
 *   - typography: backward-compat alias for v5 callers (will drop
 *     in Bucket 10 once consumers migrate)
 *   - HIT_SLOP_44: standard tap-target padding for sub-44pt UI
 *   - primaryTint: alpha tint of the Pulse accent
 *   - borders: the hairline pattern in StyleSheet form
 *
 * Bucket 2 / v6 build §6.
 */

import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";
import { theme as base } from "@nexgen-connect/shared";

export { theme, swatches, darkColors, lightColors, darkTheme, lightTheme } from "@nexgen-connect/shared";

/** Standard 44×44pt tap-target slop applied to small touchables. */
export const HIT_SLOP_44 = { top: 12, right: 12, bottom: 12, left: 12 };

/**
 * Alpha tint of the Pulse accent. Pulse is `#00DC82` (electric emerald)
 * post-v16 web pivot §1.3 — was `#4F7942` olive in v15. Common opacities:
 *   0.04  subtle card background
 *   0.08  pressed pill / hovered tile
 *   0.12  active selection ring
 *
 * Replaces hand-typed rgba strings — primary changes here, every
 * tinted surface follows.
 */
export function primaryTint(opacity: number): string {
  const hex = base.colors.primary.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/* ------------------------------------------------------------------ */
/* TEXTSTYLES — the 11-size type scale as named exports                */
/* ------------------------------------------------------------------ */

/**
 * The full type-scale exposed as named StyleSheet entries. Use these
 * everywhere — `<Text style={textStyles.h1}>` — instead of ad-hoc
 * { fontSize, fontWeight, ... } props. Components should not hand-roll
 * type styles.
 *
 * Tabular numerals are applied via fontVariant on numeric-display
 * styles (display, h1, h2 — the corridor count, prices, timers).
 *
 * Build Prompt §Components: "Every TextField, every error message,
 * every toast, every notification — every text surface uses the type
 * scale. Zero ad-hoc font sizes."
 */
const tabular = ["tabular-nums"] as const;

export const textStyles = StyleSheet.create({
  /* Display sizes — the corridor count, the headline pricing. */
  "display-xl": {
    color: base.colors.fg,
    fontFamily: base.fontFamily.heading,
    fontSize: base.fontSize["display-xl"],
    fontWeight: base.fontWeight.bold,
    letterSpacing: base.fontSize["display-xl"] * base.letterSpacing["display-xl"],
    lineHeight: base.lineHeight["display-xl"],
    fontVariant: tabular as unknown as TextStyle["fontVariant"],
  } satisfies TextStyle,

  display: {
    color: base.colors.fg,
    fontFamily: base.fontFamily.heading,
    fontSize: base.fontSize.display,
    fontWeight: base.fontWeight.bold,
    letterSpacing: base.fontSize.display * base.letterSpacing.display,
    lineHeight: base.lineHeight.display,
    fontVariant: tabular as unknown as TextStyle["fontVariant"],
  } satisfies TextStyle,

  /* Headings. */
  h1: {
    color: base.colors.fg,
    fontFamily: base.fontFamily.heading,
    fontSize: base.fontSize.h1,
    fontWeight: base.fontWeight.semibold,
    letterSpacing: base.fontSize.h1 * base.letterSpacing.h1,
    lineHeight: base.lineHeight.h1,
  } satisfies TextStyle,

  h2: {
    color: base.colors.fg,
    fontFamily: base.fontFamily.heading,
    fontSize: base.fontSize.h2,
    fontWeight: base.fontWeight.semibold,
    letterSpacing: base.fontSize.h2 * base.letterSpacing.h2,
    lineHeight: base.lineHeight.h2,
  } satisfies TextStyle,

  h3: {
    color: base.colors.fg,
    fontFamily: base.fontFamily.heading,
    fontSize: base.fontSize.h3,
    fontWeight: base.fontWeight.semibold,
    letterSpacing: base.fontSize.h3 * base.letterSpacing.h3,
    lineHeight: base.lineHeight.h3,
  } satisfies TextStyle,

  /* Body. */
  "body-lg": {
    color: base.colors.fgMuted,
    fontFamily: base.fontFamily.body,
    fontSize: base.fontSize["body-lg"],
    fontWeight: base.fontWeight.regular,
    lineHeight: base.lineHeight["body-lg"],
  } satisfies TextStyle,

  body: {
    color: base.colors.fgMuted,
    fontFamily: base.fontFamily.body,
    fontSize: base.fontSize.body,
    fontWeight: base.fontWeight.regular,
    lineHeight: base.lineHeight.body,
  } satisfies TextStyle,

  bodyStrong: {
    color: base.colors.fg,
    fontFamily: base.fontFamily.body,
    fontSize: base.fontSize.body,
    fontWeight: base.fontWeight.semibold,
    lineHeight: base.lineHeight.body,
  } satisfies TextStyle,

  "body-sm": {
    color: base.colors.fgMuted,
    fontFamily: base.fontFamily.body,
    fontSize: base.fontSize["body-sm"],
    fontWeight: base.fontWeight.regular,
    lineHeight: base.lineHeight["body-sm"],
  } satisfies TextStyle,

  /* Caption — secondary metadata. */
  caption: {
    color: base.colors.fgSubtle,
    fontFamily: base.fontFamily.body,
    fontSize: base.fontSize.caption,
    fontWeight: base.fontWeight.regular,
    lineHeight: base.lineHeight.caption,
  } satisfies TextStyle,

  /* Micro / label — uppercase tracking, mono kickers, button labels. */
  micro: {
    color: base.colors.fgSubtle,
    fontFamily: base.fontFamily.body,
    fontSize: base.fontSize.micro,
    fontWeight: base.fontWeight.semibold,
    letterSpacing: base.fontSize.micro * base.letterSpacing.micro,
    lineHeight: base.lineHeight.micro,
    textTransform: "uppercase",
  } satisfies TextStyle,

  label: {
    color: base.colors.fgSubtle,
    fontFamily: base.fontFamily.body,
    fontSize: base.fontSize.label,
    fontWeight: base.fontWeight.semibold,
    letterSpacing: base.fontSize.label * base.letterSpacing.label,
    lineHeight: base.lineHeight.label,
    textTransform: "uppercase",
  } satisfies TextStyle,

  /* Mono — code, IDs, timestamps. */
  mono: {
    color: base.colors.fgSubtle,
    fontFamily: base.fontFamily.mono,
    fontSize: base.fontSize.micro,
    fontWeight: base.fontWeight.semibold,
    letterSpacing: base.fontSize.micro * base.letterSpacing.micro,
    lineHeight: base.lineHeight.micro,
    textTransform: "uppercase",
    fontVariant: tabular as unknown as TextStyle["fontVariant"],
  } satisfies TextStyle,

  /* Domain-specific. */
  buttonLabel: {
    color: base.colors.primaryFg,
    fontFamily: base.fontFamily.body,
    fontSize: base.fontSize["body-sm"],
    fontWeight: base.fontWeight.semibold,
    letterSpacing: base.fontSize["body-sm"] * 0,
    lineHeight: base.lineHeight["body-sm"],
  } satisfies TextStyle,

  inputLabel: {
    color: base.colors.fgSubtle,
    fontFamily: base.fontFamily.body,
    fontSize: base.fontSize.label,
    fontWeight: base.fontWeight.semibold,
    letterSpacing: base.fontSize.label * base.letterSpacing.label,
    lineHeight: base.lineHeight.label,
    textTransform: "uppercase",
  } satisfies TextStyle,

  inputValue: {
    color: base.colors.fg,
    fontFamily: base.fontFamily.body,
    fontSize: base.fontSize["body-lg"],
    fontWeight: base.fontWeight.regular,
    lineHeight: base.lineHeight["body-lg"],
  } satisfies TextStyle,

  errorText: {
    color: base.colors.danger,
    fontFamily: base.fontFamily.body,
    fontSize: base.fontSize.caption,
    fontWeight: base.fontWeight.medium,
    lineHeight: base.lineHeight.caption,
  } satisfies TextStyle,

  /**
   * Italic-Pulse accent. The brand "second-line" treatment under hero
   * headings. Was Instrument Serif italic in v5; v6 uses Satoshi italic
   * because the new system has no serif (Build Prompt §Typography lists
   * Satoshi + Noto Devanagari + JetBrains Mono only).
   */
  accent: {
    color: base.colors.primary,
    fontFamily: base.fontFamily.heading,
    fontSize: base.fontSize.h3,
    fontStyle: "italic",
    fontWeight: base.fontWeight.regular,
    letterSpacing: base.fontSize.h3 * base.letterSpacing.h3,
    lineHeight: base.lineHeight.h3,
  } satisfies TextStyle,

  /** Backward-compat alias for v5 callers. Same style as `accent`. */
  serifAccent: {
    color: base.colors.primary,
    fontFamily: base.fontFamily.heading,
    fontSize: base.fontSize.h3,
    fontStyle: "italic",
    fontWeight: base.fontWeight.regular,
    letterSpacing: base.fontSize.h3 * base.letterSpacing.h3,
    lineHeight: base.lineHeight.h3,
  } satisfies TextStyle,
});

/**
 * Backward-compat alias for the v5 callers. `typography` proxies to
 * `textStyles` keys that have a 1:1 mapping. Bucket 10 will codemod
 * consumers from `typography.x` → `textStyles.x` and drop this alias.
 *
 * `serifAccent` was the v5 Instrument-Serif italic emphasis — dropped
 * in Bucket 2 because the new system has no serif. Consumers using
 * it will type-error at the new location and move to a heading style
 * + Pulse color.
 */
export const typography = textStyles;

/* ------------------------------------------------------------------ */
/* BORDERS                                                              */
/* ------------------------------------------------------------------ */

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
