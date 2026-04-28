import { type ReactNode } from "react";
import { StyleSheet, Text, View, type ViewStyle, type StyleProp } from "react-native";
import { theme, typography, primaryTint } from "@/theme";

/**
 * Pill — small rounded label, used for editorial kickers ("Step 1 of 3"),
 * status indicators, and trust-marks. A pulsing dot is optional and
 * implemented as a static circle for now; a future polish pass can
 * replace with an animated `Animated.View` if it adds value.
 */

type Props = {
  children: ReactNode;
  /** primary = green-tinted (status active), neutral = surface tone. */
  variant?: "primary" | "neutral";
  /** Show a small leading dot. */
  dot?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Pill({ children, variant = "primary", dot = false, style }: Props) {
  return (
    <View
      style={[
        styles.base,
        variant === "primary" ? styles.primary : styles.neutral,
        style,
      ]}
    >
      {dot ? (
        <View
          style={[
            styles.dot,
            variant === "primary" ? styles.dotPrimary : styles.dotNeutral,
          ]}
        />
      ) : null}
      <Text
        style={[
          typography.mono,
          { color: variant === "primary" ? theme.colors.primary : theme.colors.fgMuted },
        ]}
      >
        {children}
      </Text>
    </View>
  );
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
  primary: {
    borderColor: theme.colors.primary,
    backgroundColor: primaryTint(0.08),
  },
  neutral: {
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotPrimary: { backgroundColor: theme.colors.primary },
  dotNeutral: { backgroundColor: theme.colors.fgMuted },
});
