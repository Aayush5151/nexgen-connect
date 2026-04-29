import { type ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { theme, typography, primaryTint } from "@/theme";

/**
 * KickerLabel — the small mono uppercase label that titles a section
 * or sits as an editorial header above a heading. Replaces the
 * `<Text style={typography.mono}>...</Text>` boilerplate scattered
 * across every screen, and adds an optional leading dot for status
 * variants (live, pending, idle).
 */

type Tone = "muted" | "primary" | "warning" | "danger";

type Props = {
  children: ReactNode;
  /** Tone of the text + dot. */
  tone?: Tone;
  /** Show a small leading status dot. */
  dot?: boolean;
  /** Animate the dot (live state). */
  pulse?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function KickerLabel({
  children,
  tone = "muted",
  dot = false,
  pulse = false,
  style,
}: Props) {
  const color =
    tone === "primary"
      ? theme.colors.primary
      : tone === "warning"
        ? theme.colors.warning
        : tone === "danger"
          ? theme.colors.danger
          : theme.colors.fgSubtle;

  return (
    <View style={[styles.row, style]}>
      {dot ? (
        <View style={styles.dotWrap}>
          {pulse ? (
            <View
              style={[styles.pulseHalo, { backgroundColor: color, opacity: 0.25 }]}
            />
          ) : null}
          <View style={[styles.dot, { backgroundColor: color }]} />
        </View>
      ) : null}
      <Text style={[typography.mono, { color }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  dotWrap: {
    width: 8,
    height: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pulseHalo: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
  },
});

// Re-export for ergonomic imports.
export const _primaryTint = primaryTint;
