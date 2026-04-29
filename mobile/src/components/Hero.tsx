import { type ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { theme } from "@/theme";

/**
 * Hero — the editorial heading block lifted from the redesigned O1.
 * Big Inter Tight semibold H1 + smaller Instrument Serif italic
 * accent in primary green. Used as the dominant heading on every
 * onboarding screen + the section openers across the app.
 *
 * Sizes track the Apple/Vercel/Linear convention: keep the H1
 * dominant, the accent half its size, the body two-thirds the
 * accent. The accent is optional — pass undefined for screens that
 * just want the big H1 alone (e.g. settings).
 */

type Size = "lg" | "xl" | "2xl";

type Props = {
  title: string;
  /** The serif italic accent line (in primary green). */
  accent?: string;
  /** Optional eyebrow node above the title (e.g., a Pill). */
  eyebrow?: ReactNode;
  /** Optional body line below the accent. */
  body?: string;
  size?: Size;
  align?: "left" | "center";
  style?: StyleProp<ViewStyle>;
};

const SIZE: Record<
  Size,
  {
    h1: number;
    h1Line: number;
    h1Track: number;
    accent: number;
    accentLine: number;
    body: number;
    bodyLine: number;
  }
> = {
  // lg = the default for onboarding / app screens. Tightened in v3
  // because 40pt+ heads on every transactional screen made the
  // funnel feel like a billboard, not an app. Apple / Linear /
  // Vercel app surfaces sit at 26-30pt for transactional headers.
  lg: {
    h1: 28,
    h1Line: 32,
    h1Track: -0.8,
    accent: 18,
    accentLine: 22,
    body: 15,
    bodyLine: 22,
  },
  // xl = celebration moments (you're in, anchored, premium-active).
  // Bigger than transactional, smaller than the marquee.
  xl: {
    h1: 40,
    h1Line: 42,
    h1Track: -1.4,
    accent: 24,
    accentLine: 28,
    body: 16,
    bodyLine: 24,
  },
  // 2xl = the welcome marquee only.
  "2xl": {
    h1: 56,
    h1Line: 56,
    h1Track: -2,
    accent: 32,
    accentLine: 36,
    body: 16,
    bodyLine: 24,
  },
};

export function Hero({
  title,
  accent,
  eyebrow,
  body,
  size = "lg",
  align = "left",
  style,
}: Props) {
  const cfg = SIZE[size];
  return (
    <View style={[align === "center" && styles.center, style]}>
      {eyebrow ? <View style={styles.eyebrow}>{eyebrow}</View> : null}
      <Text
        style={[
          styles.h1,
          {
            fontSize: cfg.h1,
            lineHeight: cfg.h1Line,
            letterSpacing: cfg.h1Track,
            textAlign: align,
          },
        ]}
      >
        {title}
      </Text>
      {accent ? (
        <Text
          style={[
            styles.accent,
            {
              fontSize: cfg.accent,
              lineHeight: cfg.accentLine,
              textAlign: align,
            },
          ]}
        >
          {accent}
        </Text>
      ) : null}
      {body ? (
        <Text
          style={[
            styles.body,
            {
              fontSize: cfg.body,
              lineHeight: cfg.bodyLine,
              textAlign: align,
            },
          ]}
        >
          {body}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center" },
  eyebrow: { marginBottom: theme.spacing[3] },
  h1: {
    color: theme.colors.fg,
    fontFamily: theme.fontFamily.heading,
    fontWeight: "600",
  },
  accent: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.serif,
    fontStyle: "italic",
    fontWeight: "400",
    letterSpacing: -0.4,
    marginTop: 2,
  },
  body: {
    color: theme.colors.fgMuted,
    fontFamily: theme.fontFamily.body,
    fontWeight: "400",
    letterSpacing: -0.1,
    marginTop: theme.spacing[3],
  },
});
