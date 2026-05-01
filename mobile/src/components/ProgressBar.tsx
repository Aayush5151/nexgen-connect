import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { theme, primaryTint } from "@/theme";

/**
 * ProgressBar — refined linear progress. 4px thick by default with
 * a translucent fill behind the leading edge so even an empty bar
 * reads as a track with a hint of color. Animates fill on mount.
 */

type Props = {
  /** 0..1 */
  progress: number;
  /** Track height in px. Default 4. */
  height?: number;
  /** Override fill color. */
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export function ProgressBar({ progress, height = 4, color = theme.colors.primary, style }: Props) {
  const clamped = Math.max(0, Math.min(1, progress));
  const animated = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animated, {
      toValue: clamped,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [animated, clamped]);

  const widthPct = animated.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }, style]}>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: primaryTint(0.08),
          borderRadius: height / 2,
        }}
      />
      <Animated.View
        style={{
          height,
          width: widthPct,
          backgroundColor: color,
          borderRadius: height / 2,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: theme.colors.borderStrong,
    overflow: "hidden",
  },
});
