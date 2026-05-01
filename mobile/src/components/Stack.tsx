import { type ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { theme } from "@/theme";

/**
 * Stack — vertical layout primitive. Children are stacked top-to-bottom
 * with `gap` from the spacing scale between them.
 *
 * Replaces the marginTop / marginBottom hack scattered across screens
 * (`{ marginTop: theme.spacing[3] }` on every-other-element). With
 * Stack, the gap lives on the parent and reads obviously.
 *
 * Build Prompt §Components: "Add a Stack primitive (vertical) and Row
 * primitive (horizontal) that handle spacing via the gap prop. Replace
 * marginTop / marginBottom style hacks across screens."
 *
 * v6 build §6 / Build Prompt Bucket 2.
 */

type Props = {
  children: ReactNode;
  /** Vertical gap between children. Default: 4 (16pt). */
  gap?: keyof typeof theme.spacing;
  /** Cross-axis (horizontal) alignment. */
  align?: "stretch" | "flex-start" | "center" | "flex-end";
  /** Main-axis (vertical) alignment. */
  justify?: "flex-start" | "center" | "flex-end" | "space-between";
  style?: StyleProp<ViewStyle>;
};

export function Stack({ children, gap = 4, align = "stretch", justify = "flex-start", style }: Props) {
  return (
    <View
      style={[
        {
          flexDirection: "column",
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
