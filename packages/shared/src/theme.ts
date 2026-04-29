/**
 * NexGen Connect — design tokens, single source of truth.
 *
 * Canonical: this file is the SOURCE for all visual tokens used by web
 * and mobile. The web app's globals.css mirrors these values verbatim
 * via CSS custom properties; the mobile app's NativeWind / theme
 * provider consumes these constants directly. If a token changes here,
 * it must be reflected in:
 *   1. web/src/app/globals.css  (CSS variables under @theme inline)
 *   2. mobile/src/theme/...     (NativeWind config + StyleSheet
 *                                 fallback — wired up in mobile/src/
 *                                 theme/applyTheme.ts)
 *
 * A check-script in tools/check-theme-sync.ts (TODO once mobile lands)
 * will diff this file against globals.css and fail CI if they drift.
 *
 * Source aesthetic: editorial dark — pure-black canvas, electric
 * emerald accent, hairline borders, serif italic for emphasis. No
 * gradients on foundation surfaces. Brand-defining choices live here
 * verbatim so any reader of this file can reproduce the marketing
 * site's chrome on a fresh device.
 */

/* ------------------------------------------------------------------ */
/* COLOR — pure neutrals, single accent.                              */
/* ------------------------------------------------------------------ */

export const colors = {
  /** Foundation. */
  bg: "#000000",
  surface: "#0A0A0A",
  surfaceElevated: "#121212",
  border: "#1F1F1F",
  borderStrong: "#2E2E2E",

  /** Content. Hierarchy via lightness, no tint. */
  fg: "#FAFAFA",
  fgMuted: "#A1A1A1",
  fgSubtle: "#6E6E6E",
  fgPlaceholder: "#4A4A4A",

  /** Accent — electric emerald. The earlier lime was too yellow-tinted;
   *  this is the green the brand was built around. Foreground stays
   *  true black for the signature green-on-black CTA look. */
  primary: "#00DC82",
  primaryHover: "#4AFCAE",
  primaryPressed: "#00B36B",
  primaryFg: "#000000",

  /** Status. Success is the same green — never introduce a second
   *  positive accent. Warning + danger are reserved for inline error
   *  states only, never for foundation surfaces. */
  success: "#00DC82",
  warning: "#F4B740",
  danger: "#F87171",
} as const;

export type ColorToken = keyof typeof colors;

/* ------------------------------------------------------------------ */
/* TYPOGRAPHY — four families, one usage per family.                  */
/* ------------------------------------------------------------------ */

/**
 * Font families. The CSS-variable bridge (--font-body etc.) is set up
 * by next/font on web. On mobile, expo-font loads the matching .ttf
 * files at app boot; the raw family name then matches what's set by
 * `expo-font` so consumers can use `theme.fontFamily.body` directly in
 * a StyleSheet.
 */
export const fontFamily = {
  body: "Inter",
  heading: "Inter Tight",
  serif: "Instrument Serif",
  mono: "JetBrains Mono",
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

/**
 * Font-size scale. Values are in pixels, rendered as `${n}px` on web
 * and as numbers on RN. RN auto-scales to platform density; web font
 * sizes are clamp()-driven elsewhere, so consumers should treat these
 * as base values for components that don't already use clamp().
 */
export const fontSize = {
  xs: 11,
  sm: 12.5,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  "2xl": 22,
  "3xl": 28,
  "4xl": 34,
  "5xl": 44,
  "6xl": 56,
  "7xl": 72,
} as const;

/* ------------------------------------------------------------------ */
/* SPACING — geometric scale, base 4px.                                */
/* ------------------------------------------------------------------ */

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
  40: 160,
} as const;

/* ------------------------------------------------------------------ */
/* RADII.                                                              */
/* ------------------------------------------------------------------ */

export const radius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

/* ------------------------------------------------------------------ */
/* MOTION — durations + curves.                                        */
/* ------------------------------------------------------------------ */

export const duration = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

/**
 * Cubic-bezier curves. Mobile consumers should pass these to
 * `Easing.bezier(...spread)` from react-native-reanimated.
 */
export const easing = {
  out: [0.2, 0.8, 0.2, 1] as const,
  inOut: [0.4, 0, 0.2, 1] as const,
} as const;

/* ------------------------------------------------------------------ */
/* SHADOWS — neutral, no colored glows.                                */
/* ------------------------------------------------------------------ */

export const shadow = {
  sm: {
    web: "0 1px 2px rgba(0, 0, 0, 0.1)",
    rn: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
  },
  md: {
    web: "0 4px 12px rgba(0, 0, 0, 0.14)",
    rn: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.14,
      shadowRadius: 12,
      elevation: 4,
    },
  },
  lg: {
    web: "0 8px 24px rgba(0, 0, 0, 0.18)",
    rn: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 24,
      elevation: 8,
    },
  },
} as const;

/* ------------------------------------------------------------------ */
/* THEME — single export consumers reach for.                          */
/* ------------------------------------------------------------------ */

export const theme = {
  colors,
  fontFamily,
  fontWeight,
  fontSize,
  spacing,
  radius,
  duration,
  easing,
  shadow,
} as const;

export type Theme = typeof theme;
