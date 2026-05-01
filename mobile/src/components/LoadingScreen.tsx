import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme, typography } from "@/theme";

/**
 * LoadingScreen — full-bleed black surface with a centered spinner
 * and an optional one-line label. Used as the first-paint state on
 * screens that depend on a network query, so a slow cold-load on 3G
 * doesn't show the user an empty surface for 2 seconds.
 *
 * Pattern at every call-site:
 *
 *   if (someQuery.isLoading) return <LoadingScreen label="…" />;
 *
 * Returns the same chrome (safe-area, bg) as <Screen> so swapping
 * doesn't shift layout when the data lands.
 */

type Props = {
  /** Optional one-line label rendered below the spinner. */
  label?: string;
};

export function LoadingScreen({ label }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ActivityIndicator color={theme.colors.primary} />
      {label ? <Text style={[typography.caption, styles.label]}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    marginTop: theme.spacing[3],
    color: theme.colors.fgMuted,
  },
});
