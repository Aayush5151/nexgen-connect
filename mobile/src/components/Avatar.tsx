import { StyleSheet, Text, View, type ViewStyle, type StyleProp } from "react-native";
import { theme, primaryTint } from "@/theme";

/**
 * Avatar — 2-letter initials over a tonal-green circle. We don't
 * surface profile photos until BP §3.7a Rule W3 (two-sided opt-in),
 * so the initials chip is the canonical Phase 1+2 avatar.
 */

type Size = "xs" | "sm" | "md" | "lg";

type Props = {
  initials: string;
  size?: Size;
  /** Optional tint override; defaults to subtle green-on-black. */
  tone?: "default" | "primary" | "muted";
  style?: StyleProp<ViewStyle>;
};

const SIZE_PX: Record<Size, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
};

const FONT_SIZE: Record<Size, number> = {
  xs: 9,
  sm: 11,
  md: 13,
  lg: 18,
};

export function Avatar({ initials, size = "md", tone = "default", style }: Props) {
  const px = SIZE_PX[size];
  return (
    <View
      style={[
        styles.base,
        {
          width: px,
          height: px,
          borderRadius: px / 2,
          borderColor:
            tone === "primary"
              ? theme.colors.primary
              : tone === "muted"
                ? theme.colors.border
                : theme.colors.borderStrong,
          backgroundColor: tone === "primary" ? primaryTint(0.1) : theme.colors.surface,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            fontSize: FONT_SIZE[size],
            color: tone === "primary" ? theme.colors.primary : theme.colors.fg,
          },
        ]}
      >
        {initials.slice(0, 2).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: theme.fontFamily.mono,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
