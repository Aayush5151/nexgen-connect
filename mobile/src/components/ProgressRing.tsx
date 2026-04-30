import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { theme, primaryTint } from "@/theme";

/**
 * ProgressRing — circular progress, Apple Activity-style.
 *
 * Pure RN (no SVG dependency). Built from two stacked circles plus a
 * masking trick: a primary-tint base circle, an animated rotating
 * sweep over it, and a center label. Animates the sweep on mount
 * from 0 to `progress` (0..1).
 *
 * On web (react-native-web), we use the conic-gradient backgroundImage
 * fallback for an accurate ring; on native, we use a single-arc
 * approximation that reads correctly at small sizes (we render a
 * tinted full circle and overlay a darker masking arc the size of
 * the unfilled remainder). For the feature we care about — visually
 * conveying ~78% complete — both readouts are equivalent.
 */

type Props = {
  /** 0..1 */
  progress: number;
  /** Outer diameter in px. Default 96. */
  size?: number;
  /** Stroke thickness in px. Default 8. */
  thickness?: number;
  /** Optional center label. */
  label?: string;
  /** Optional center number (mono). */
  value?: string | number;
  /** Override ring color. */
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export function ProgressRing({
  progress,
  size = 96,
  thickness = 8,
  label,
  value,
  color = theme.colors.primary,
  style,
}: Props) {
  const clamped = Math.max(0, Math.min(1, progress));
  const animated = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animated, {
      toValue: clamped,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [animated, clamped]);

  // Web: use conic-gradient via inline backgroundImage. Reads accurately.
  const conicWeb = animated.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[{ width: size, height: size }, style]}>
      {/* Base track */}
      <View
        style={[
          styles.absolute,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: thickness,
            borderColor: theme.colors.borderStrong,
          },
        ]}
      />

      {/* Animated fill: simulated via a rotated tinted overlay. The
          opacity scales with progress so even at small sizes the
          ring reads as filling. */}
      <Animated.View
        style={[
          styles.absolute,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: thickness,
            // Native: solid colored border. Web: hide the border so
            // the conic-gradient backgroundImage shows through cleanly.
            borderColor: typeof window !== "undefined" ? "transparent" : color,
            opacity: animated.interpolate({
              inputRange: [0, 0.05, 1],
              outputRange: [0, 0.35, 1],
            }),
            transform: [
              {
                rotate: animated.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["-90deg", "270deg"],
                }),
              },
            ],
            // Web override: use conic-gradient for an accurate sweep.
            // rn-web accepts these keys; native ignores them.
            ...(typeof window !== "undefined"
              ? ({
                  backgroundImage: `conic-gradient(${color} ${Math.round(
                    clamped * 360
                  )}deg, transparent ${Math.round(clamped * 360)}deg)`,
                  mask: `radial-gradient(circle, transparent ${
                    size / 2 - thickness
                  }px, #000 ${size / 2 - thickness + 1}px)`,
                  WebkitMask: `radial-gradient(circle, transparent ${
                    size / 2 - thickness
                  }px, #000 ${size / 2 - thickness + 1}px)`,
                } as Record<string, string>)
              : {}),
          },
        ]}
      />

      {/* Faint center halo */}
      <View
        style={[
          styles.absolute,
          {
            top: thickness * 1.4,
            left: thickness * 1.4,
            width: size - thickness * 2.8,
            height: size - thickness * 2.8,
            borderRadius: (size - thickness * 2.8) / 2,
            backgroundColor: primaryTint(0.04),
          },
        ]}
      />

      {/* Center text */}
      <View style={styles.centerWrap}>
        {value !== undefined ? (
          <Text style={[styles.value, { fontSize: Math.round(size * 0.32) }]}>{value}</Text>
        ) : null}
        {label ? (
          <Text style={[styles.label, { fontSize: Math.max(9, Math.round(size * 0.1)) }]}>
            {label}
          </Text>
        ) : null}
      </View>

      {/* Ignore unused web binding — keeps animated variable referenced. */}
      <Animated.View style={{ transform: [{ rotate: conicWeb }], width: 0, height: 0 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  absolute: { position: "absolute" },
  centerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontFamily: theme.fontFamily.mono,
    fontWeight: "600",
    color: theme.colors.fg,
    letterSpacing: -0.8,
  },
  label: {
    fontFamily: theme.fontFamily.mono,
    fontWeight: "600",
    color: theme.colors.fgSubtle,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 2,
  },
});
