import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { theme } from "@/theme";

/** Single-pixel divider — pure visual, not interactive. */
export function Hairline({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.line, style]} />;
}

const styles = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border,
    width: "100%",
  },
});
