import { type ReactNode } from "react";
import { StyleSheet, Text, View, type ViewStyle, type StyleProp } from "react-native";
import { theme, typography, primaryTint } from "@/theme";

/**
 * Pill — small rounded label. Variants:
 *   primary   green-tinted, status active (live, verified)
 *   neutral   surface tone, status inactive (building, queued)
 *   warning   amber, status alerting (24h to review, late)
 *   danger    red, status broken (failed, blocked)
 *   subtle    transparent border-only, low-emphasis kicker
 *
 * Composition:
 *   [optional dot] [LABEL or children]
 */

type Variant = "primary" | "neutral" | "warning" | "danger" | "subtle";

type Props = {
  children: ReactNode;
  variant?: Variant;
  /** Show a small leading dot. */
  dot?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Pill({ children, variant = "primary", dot = false, style }: Props) {
  const palette = paletteFor(variant);
  return (
    <View style={[styles.base, palette.box, style]}>
      {dot ? <View style={[styles.dot, palette.dot]} /> : null}
      <Text style={[typography.mono, palette.text]}>{children}</Text>
    </View>
  );
}

function paletteFor(v: Variant): {
  box: ViewStyle;
  text: { color: string };
  dot: ViewStyle;
} {
  switch (v) {
    case "warning":
      return {
        box: {
          borderColor: theme.colors.warning,
          backgroundColor: "rgba(255,176,32,0.1)",
        },
        text: { color: theme.colors.warning },
        dot: { backgroundColor: theme.colors.warning },
      };
    case "danger":
      return {
        box: {
          borderColor: theme.colors.danger,
          backgroundColor: "rgba(255,84,76,0.1)",
        },
        text: { color: theme.colors.danger },
        dot: { backgroundColor: theme.colors.danger },
      };
    case "neutral":
      return {
        box: {
          borderColor: theme.colors.borderStrong,
          backgroundColor: theme.colors.surface,
        },
        text: { color: theme.colors.fgMuted },
        dot: { backgroundColor: theme.colors.fgMuted },
      };
    case "subtle":
      return {
        box: {
          borderColor: theme.colors.border,
          backgroundColor: "transparent",
        },
        text: { color: theme.colors.fgSubtle },
        dot: { backgroundColor: theme.colors.fgSubtle },
      };
    default:
      return {
        box: {
          borderColor: theme.colors.primary,
          backgroundColor: primaryTint(0.08),
        },
        text: { color: theme.colors.primary },
        dot: { backgroundColor: theme.colors.primary },
      };
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    paddingVertical: 6,
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.radius.full,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
