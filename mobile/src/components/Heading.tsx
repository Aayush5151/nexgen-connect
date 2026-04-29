import { type ReactNode } from "react";
import { Text, View, StyleSheet, type TextStyle, type ViewStyle, type StyleProp } from "react-native";
import { theme, typography } from "@/theme";

/**
 * Heading — H1 with an optional serif-italic accent on the second
 * line. This is the brand-defining typographic move from the web; we
 * mirror it on mobile so a returning user feels they're on the same
 * surface.
 *
 * Usage:
 *   <Heading>Find your people</Heading>
 *   <Heading accent="before you land.">Find your people</Heading>
 */

type Props = {
  children: ReactNode;
  /** Optional serif-italic line rendered below the main heading. */
  accent?: string;
  /** h1 (default) | h2 | h3 — picks the matching size from typography. */
  level?: "h1" | "h2" | "h3";
  style?: StyleProp<ViewStyle>;
  align?: "left" | "center";
};

export function Heading({
  children,
  accent,
  level = "h1",
  style,
  align = "left",
}: Props) {
  return (
    <View style={[align === "center" && styles.center, style]}>
      <Text style={typography[level]}>{children}</Text>
      {accent ? (
        <Text style={[typography.serifAccent, styles.accent]}>{accent}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center" },
  accent: { marginTop: theme.spacing[1] } satisfies TextStyle,
});
