import { type ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { theme, primaryTint } from "@/theme";

/**
 * IconChip — circular surface for a glyph or short string. Used as
 * a section icon, a sub-circle topic indicator, a verification
 * badge, etc. The "glyph" is text-based (emoji or single character)
 * because the project doesn't depend on an icon library yet — every
 * chip can swap to an SVG later without changing call sites.
 */

type Tone = "default" | "primary" | "warning" | "danger";
type Size = "sm" | "md" | "lg";

type Props = {
  /** A single glyph: emoji, character, or 2-letter code. */
  glyph?: string;
  /** Or a child node (e.g., a custom SVG). */
  children?: ReactNode;
  tone?: Tone;
  size?: Size;
  style?: StyleProp<ViewStyle>;
};

const SIZE: Record<Size, number> = { sm: 32, md: 44, lg: 56 };
const FONT: Record<Size, number> = { sm: 14, md: 18, lg: 24 };

export function IconChip({ glyph, children, tone = "default", size = "md", style }: Props) {
  const px = SIZE[size];
  const fg =
    tone === "primary"
      ? theme.colors.primary
      : tone === "warning"
        ? theme.colors.warning
        : tone === "danger"
          ? theme.colors.danger
          : theme.colors.fg;
  const bg =
    tone === "primary"
      ? primaryTint(0.1)
      : tone === "warning"
        ? "rgba(255,176,32,0.10)"
        : tone === "danger"
          ? "rgba(255,84,76,0.10)"
          : theme.colors.surface;
  const border =
    tone === "primary"
      ? theme.colors.primary
      : tone === "warning"
        ? theme.colors.warning
        : tone === "danger"
          ? theme.colors.danger
          : theme.colors.borderStrong;

  return (
    <View
      style={[
        styles.base,
        {
          width: px,
          height: px,
          borderRadius: px / 2,
          backgroundColor: bg,
          borderColor: border,
        },
        style,
      ]}
    >
      {children ?? (
        <Text
          style={{
            fontSize: FONT[size],
            color: fg,
            fontFamily: theme.fontFamily.mono,
            fontWeight: "600",
            lineHeight: FONT[size] + 2,
          }}
        >
          {glyph}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});
