/**
 * useReducedMotion — reactive wrapper around AccessibilityInfo.
 *
 * Build Prompt §Motion: "Honor AccessibilityInfo.isReduceMotionEnabled()
 * — fall back to instant cross-fades for users with reduced-motion
 * preference."
 *
 * Returns `true` when the user has the OS-level Reduce Motion
 * accessibility setting on. Re-renders subscribers when the setting
 * changes (rare but possible — e.g., user toggles in Settings while
 * the app is foregrounded).
 *
 * Usage:
 *   const reduce = useReducedMotion();
 *   const duration = reduce ? 0 : theme.duration.hero;
 *   Animated.timing(value, { toValue: 1, duration, useNativeDriver: true }).start();
 *
 * Or for spring config:
 *   if (reduce) {
 *     Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }).start();
 *   } else {
 *     Animated.spring(scale, { toValue: 1, ...theme.spring, useNativeDriver: true }).start();
 *   }
 *
 * v15 BP §16 / v6 build §19 / Build Prompt Bucket 7.
 */
import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduced(value);
    });

    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", (value) => {
      if (mounted) setReduced(value);
    });

    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return reduced;
}
