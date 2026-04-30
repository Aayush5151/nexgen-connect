import { type ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { theme } from "@/theme";

/**
 * Row — horizontal layout primitive. Children laid out left-to-right
 * with `gap` from the spacing scale between them.
 *
 * Pair with Stack (vertical sibling) — between them they replace
 * almost every flex-row / flex-column View in the codebase.
 *
 * Build Prompt §Components: see Stack docstring.
 *
 * v6 build §6 / Build Prompt Bucket 2.
 */

type Props = {
  children: ReactNode;
  /** Horizontal gap between children. Default: 3 (12pt). */
  gap?: keyof typeof theme.spacing;
  /** Cross-axis (vertical) alignment. */
  align?: "stretch" | "flex-start" | "center" | "flex-end" | "baseline";
  /** Main-axis (horizontal) alignment. */
  justify?: "flex-start" | "center" | "flex-end" | "space-between" | "space-around";
  /** Wrap onto new lines when content overflows. Default: false. */
  wrap?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Row({
  children,
  gap = 3,
  align = "center",
  justify = "flex-start",
  wrap = false,
  style,
}: Props) {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          flexWrap: wrap ? "wrap" : "nowrap",
          gap: theme.spacing[gap],
          alignItems: align,
          justifyContent: justify,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
