import { type ReactNode } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { theme, primaryTint } from "@/theme";

/**
 * CardSurface — the unified card container. Replaces the dozen
 * inline `borderRadius / borderWidth / padding / backgroundColor`
 * blocks scattered across screens. Every card on the app is built
 * from this primitive so densities and spacings stay coherent.
 *
 * Variants:
 *   default    — subtle border, surface background
 *   elevated   — slightly stronger border + tint
 *   accent     — primary border + tint (used for live state, success)
 *   warning    — warning border + tint
 *   danger     — danger border + tint
 *
 * If `rail` is true, a 3px primary-green vertical bar runs down the
 * left edge. Used on the trust card / day-1 prompt / live banner.
 */

type Variant = "default" | "elevated" | "accent" | "warning" | "danger";

type Props = {
  children: ReactNode;
  variant?: Variant;
  /** Vertical green bar on the left edge. */
  rail?: boolean;
  /** Tappable surface — shows a subtle press state. */
  onPress?: () => void;
  padding?: number;
  /** Set to false to remove inner padding (e.g. for headers). */
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function CardSurface({
  children,
  variant = "default",
  rail = false,
  onPress,
  padding = theme.spacing[5],
  padded = true,
  style,
}: Props) {
  const palette = paletteFor(variant);
  const cardStyle: StyleProp<ViewStyle> = [
    styles.base,
    {
      backgroundColor: palette.bg,
      borderColor: palette.border,
      paddingVertical: padded ? padding : 0,
      paddingLeft: padded ? (rail ? padding + 6 : padding) : rail ? 6 : 0,
      paddingRight: padded ? padding : 0,
    },
    style,
  ];

  const inner = (
    <>
      {rail ? <View style={[styles.rail, { backgroundColor: palette.rail }]} /> : null}
      {children}
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [cardStyle, pressed && styles.pressed]}>
        {inner}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{inner}</View>;
}

function paletteFor(v: Variant): { bg: string; border: string; rail: string } {
  switch (v) {
    case "elevated":
      return {
        bg: theme.colors.surfaceElevated ?? theme.colors.surface,
        border: theme.colors.borderStrong,
        rail: theme.colors.primary,
      };
    case "accent":
      return {
        bg: primaryTint(0.06),
        border: theme.colors.primary,
        rail: theme.colors.primary,
      };
    case "warning":
      return {
        bg: "rgba(255,176,32,0.06)",
        border: theme.colors.warning,
        rail: theme.colors.warning,
      };
    case "danger":
      return {
        bg: "rgba(255,84,76,0.06)",
        border: theme.colors.danger,
        rail: theme.colors.danger,
      };
    default:
      return {
        bg: theme.colors.surface,
        border: theme.colors.border,
        rail: theme.colors.primary,
      };
  }
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: theme.radius.md,
    overflow: "hidden",
  },
  rail: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  pressed: { opacity: 0.7 },
});
