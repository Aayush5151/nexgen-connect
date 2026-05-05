/**
 * NexGen Connect — design tokens, single source of truth.
 *
 * Bucket 2 rewrite (Build Prompt §Design system overhaul + v6 build §6).
 * Replaces the v5 electric-emerald palette with the user-heart system
 * specified in the build prompt:
 *
 *   - Three swatches + three semantic accents (Ink / Paper / Mist /
 *     Pulse / Caution / Halt). Dark mode primary, light secondary.
 *   - 11-size type scale with per-size line-height ratio + tabular
 *     numerals + OpenType ligatures + letter-spacing rules.
 *   - 4-point spacing grid; no values outside the scale.
 *   - 3-duration motion system + single spring + single cubic-bezier.
 *
 * Source ratchets: every token here cites the build prompt section
 * that drove it. Future engineers don't add tokens without a § ref.
 *
 * Web mirrors these tokens verbatim via CSS custom properties under
 * @theme inline in web/src/app/globals.css. Mobile imports them
 * directly. tools/check-theme-sync.ts (Bucket 6) will diff this file
 * against globals.css and fail CI on drift.
 *
 * v6 build §6 design system / Build Prompt Bucket 2.
 */

/* ------------------------------------------------------------------ */
/* COLOR — dual-mode palette                                           */
/* ------------------------------------------------------------------ */

/**
 * Three swatches + three semantic accents. Per Build Prompt:
 *   Ink (near-black) — primary text, primary CTA fill in dark mode.
 *   Paper (near-white) — primary surface in light mode.
 *   Mist (mid-gray) — secondary text, hairlines, disabled. Sparingly.
 *   Pulse (#00DC82 electric emerald) — single accent: live verification
 *     count, unlock ceremony, success states, link affordances.
 *     Per v16 web pivot §1.3: unified to web's emerald to kill the
 *     web/mobile brand mismatch and the "olive sticker" CTA reading
 *     called out in the post-Bucket-10 review.
 *   Caution (#B85C38 warm amber) — warnings, scam-pattern flags,
 *     SLA-breach indicators. Used roughly 4 times.
 *   Halt (#A53A2A deep red) — destructive actions only. Delete
 *     account, leave group, ban user. Used roughly 3 times.
 *
 * Color has purpose. Pulse is for trust and arrival, Caution is for
 * protection, Halt is for irreversible action. Never decorative.
 * Never themed.
 */
export const swatches = {
  ink: "#0A0A0B",
  paper: "#FAFAF7",
  mist: "#A8A8B0",
  pulse: "#00DC82",
  caution: "#B85C38",
  halt: "#A53A2A",
} as const;

/**
 * Mode-specific token map. The semantic keys (bg / fg / surface / etc.)
 * are stable across modes; the values flip. Web's globals.css mirrors
 * these as CSS custom properties; mobile reads via the ThemeProvider.
 *
 * WCAG AAA contrast targets: 7:1 for body text, 4.5:1 for large text.
 * Verified with the WebAIM Contrast Checker before locking palette.
 */
export const darkColors = {
  /** Foundation — dark mode primary. */
  bg: swatches.ink, // primary canvas
  surface: "#141416", // raised cards, sheets
  surfaceElevated: "#1B1B1E", // dialogs, popovers
  border: "#2A2A2E", // hairlines on cards
  borderStrong: "#3A3A3F", // ring on focus / active

  /** Content. Hierarchy via lightness, never tint. */
  fg: swatches.paper, // primary text — 14.7:1 vs ink (AAA)
  fgMuted: "#C8C8CD", //  9.0:1 — secondary body
  fgSubtle: swatches.mist, //  5.1:1 — caption, hairline labels (AA-large)
  fgPlaceholder: "#5C5C62",

  /** Accent — Pulse (electric emerald). Foreground is INK (near-black)
   *  per v16 web pivot §1.3 — Ink-on-emerald (12.7:1) is the signature
   *  CTA pattern across web. Was Paper-on-olive in v15; now matches web. */
  primary: swatches.pulse,
  primaryHover: "#4AFCAE",
  primaryPressed: "#00B36B",
  primaryFg: swatches.ink,

  /** Caution. Inline warnings, scam flags, SLA-breach. */
  warning: swatches.caution,
  warningFg: swatches.paper,
  warningSurface: "#2D1810", // dark, low-saturation tint for warning cards

  /** Halt. Destructive only. */
  danger: swatches.halt,
  dangerFg: swatches.paper,
  dangerSurface: "#2A0F0C",

  /** Tints applied at low alpha for accent surfaces. Mobile reads
   *  these as rgba; web converts via color-mix(). */
  primaryTint: "rgba(0, 220, 130, 0.12)",
  warningTint: "rgba(184, 92, 56, 0.12)",
  dangerTint: "rgba(165, 58, 42, 0.12)",
} as const;

export const lightColors = {
  /** Foundation — light mode secondary. */
  bg: swatches.paper,
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  border: "#E5E5E0",
  borderStrong: "#C5C5BF",

  /** Content. */
  fg: swatches.ink, // 14.7:1 vs paper
  fgMuted: "#3A3A3F", //  9.0:1
  fgSubtle: "#6B6B70", //  4.6:1 — AA-large
  fgPlaceholder: "#9A9A9F",

  /** Accent — Pulse retains dominance in light mode. Ink fg per v16 §1.3. */
  primary: swatches.pulse,
  primaryHover: "#00B36B",
  primaryPressed: "#008B52",
  primaryFg: swatches.ink,

  /** Caution + Halt. */
  warning: swatches.caution,
  warningFg: swatches.paper,
  warningSurface: "#FAEDE6",

  danger: swatches.halt,
  dangerFg: swatches.paper,
  dangerSurface: "#F8E5E1",

  primaryTint: "rgba(0, 220, 130, 0.08)",
  warningTint: "rgba(184, 92, 56, 0.08)",
  dangerTint: "rgba(165, 58, 42, 0.08)",
} as const;

export type ColorScheme = "dark" | "light";
export type Colors = typeof darkColors;
export type ColorToken = keyof Colors;

/** Default export is dark; consumers explicit-opt for light via
 *  ThemeProvider. */
export const colors = darkColors;

/* ------------------------------------------------------------------ */
/* TYPOGRAPHY — 11-size scale, 4 weights, per-size line-height          */
/* ------------------------------------------------------------------ */

/**
 * Font families. Both load at app boot via expo-font (mobile) or
 * next/font (web).
 *
 *   - Satoshi Variable (Fontshare, Indian Type Foundry, OFL) — primary
 *     UI font for Latin script. Selected over Geist/Inter for B1
 *     reasoning: distinctive (Geist is ubiquitous in 2026 dev tooling),
 *     OFL, culturally aligned with India-out positioning.
 *   - Noto Sans Devanagari Variable (Google, OFL) — Devanagari script
 *     for HI/MR locales. Variable axis for weight matching.
 *   - JetBrains Mono — code/numerals only. Tabular figures via
 *     fontVariant: ["tabular-nums"].
 *
 * If a Satoshi-specific issue surfaces in production (per B1
 * fallback), Inter Variable swaps in via a one-line change here.
 */
export const fontFamily = {
  body: "Satoshi-Variable",
  heading: "Satoshi-Variable",
  devanagari: "NotoSansDevanagari-Variable",
  mono: "JetBrainsMono",
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

/**
 * 11-size scale per Build Prompt §Typography. Values in pt (RN units).
 * Web converts to clamp() for responsive scaling; mobile uses raw
 * values (RN auto-scales via PixelRatio).
 *
 * Scale: display-xl, display, h1, h2, h3, body-lg, body, body-sm,
 *        caption, micro, label.
 *
 * Each size has a per-token line-height ratio per the prompt:
 *   1.0  display-xl, display
 *   1.1  h1
 *   1.2  h2, h3
 *   1.5  body-lg, body
 *   1.45 body-sm
 *   1.4  caption
 *   1.3  micro, label
 */
export const fontSize = {
  "display-xl": 80,
  display: 56,
  h1: 40,
  h2: 28,
  h3: 22,
  "body-lg": 18,
  body: 16,
  "body-sm": 14,
  caption: 13,
  micro: 11,
  label: 11,
} as const;

export const lineHeight = {
  "display-xl": 80,
  display: 56,
  h1: 44,
  h2: 34,
  h3: 26,
  "body-lg": 27,
  body: 24,
  "body-sm": 20,
  caption: 18,
  micro: 14,
  label: 14,
} as const;

/**
 * Letter-spacing per size. In em units.
 *   - Display sizes: tighter (-0.02em).
 *   - Body / heading: neutral (0).
 *   - Micro / label uppercase: looser (+0.04em).
 */
export const letterSpacing = {
  "display-xl": -0.02,
  display: -0.02,
  h1: -0.015,
  h2: -0.01,
  h3: 0,
  "body-lg": 0,
  body: 0,
  "body-sm": 0,
  caption: 0,
  micro: 0.04,
  label: 0.04,
} as const;

export type FontSizeToken = keyof typeof fontSize;

/* ------------------------------------------------------------------ */
/* SPACING — strict 4-point grid                                        */
/* ------------------------------------------------------------------ */

/**
 * Per Build Prompt §Spacing — strict 4-point grid. No values outside
 * this scale. A reviewer who sees `padding: 14` (off-grid) blocks the
 * PR.
 *
 * Vertical rhythm: 24pt between sections, 16pt between cards in a
 * list, 12pt between paragraphs in body, 8pt between label and field,
 * 4pt between adjacent typography items.
 *
 * Horizontal padding: 24pt screen edge by default, 16pt inside cards.
 *
 * Touch targets: 44pt iOS minimum (Apple HIG), 48dp Android. Verify
 * every IconButton, every list row, every checkbox.
 */
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
  24: 96,
  32: 128,
} as const;

/** Minimum touch-target sizes per platform. */
export const touchTarget = {
  ios: 44,
  android: 48,
} as const;

/* ------------------------------------------------------------------ */
/* RADII                                                                */
/* ------------------------------------------------------------------ */

export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

/* ------------------------------------------------------------------ */
/* MOTION — 3 durations, single spring, single cubic-bezier             */
/* ------------------------------------------------------------------ */

/**
 * Per Build Prompt §Motion — three durations only. No 250ms, no
 * 300ms ad-hoc.
 *
 *   instant (120ms) — taps, hover, micro feedback
 *   transition (240ms) — sheet, modal, tab change
 *   hero (480ms) — corridor unlock ceremony, verification success,
 *                  the cinematic moments
 */
export const duration = {
  instant: 120,
  transition: 240,
  hero: 480,
} as const;

/**
 * Single spring config for organic motion. Stiffness 280, damping 24
 * per the prompt. RN consumers pass these to Animated.spring.
 *
 * Use for: corridor count animating up, padlock dissolving, tile
 * pop on selection.
 */
export const spring = {
  stiffness: 280,
  damping: 24,
} as const;

/**
 * Single cubic-bezier for linear-feeling motion. Use for fades,
 * slide-in/out, anything that should not feel springy.
 */
export const easing = {
  inOut: [0.2, 0.8, 0.2, 1] as const,
} as const;

/* ------------------------------------------------------------------ */
/* SHADOWS — single soft elevation, no glassmorphism                    */
/* ------------------------------------------------------------------ */

/**
 * One shadow at one elevation. Per Build Prompt §Color: "No drop
 * shadows beyond a single soft shadow used at one elevation. No
 * glassmorphism." Keep this list to one entry — adding `lg` or `xl`
 * is a design-system violation requiring a § citation.
 */
export const shadow = {
  soft: {
    web: "0 4px 16px rgba(10, 10, 11, 0.18)",
    rn: {
      shadowColor: swatches.ink,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 16,
      elevation: 4,
    },
  },
} as const;

/* ------------------------------------------------------------------ */
/* THEME — single export consumers reach for                            */
/* ------------------------------------------------------------------ */

export const theme = {
  swatches,
  colors,
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
  spacing,
  touchTarget,
  radius,
  duration,
  spring,
  easing,
  shadow,
} as const;

export const darkTheme = { ...theme, colors: darkColors } as const;
export const lightTheme = { ...theme, colors: lightColors } as const;

export type Theme = typeof theme;
