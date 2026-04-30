import { useEffect, useRef } from "react";
import { StyleSheet, Text, TextInput, View, type StyleProp, type ViewStyle } from "react-native";
import { theme, primaryTint } from "@/theme";

/**
 * OtpField — six discrete boxes that act as one input.
 *
 * Mechanics:
 *   - One hidden TextInput captures the actual input (autocomplete +
 *     SMS auto-fill on iOS / Android).
 *   - Six visible boxes mirror the typed digits.
 *   - Tapping anywhere on the visible row focuses the hidden input.
 *   - We DON'T render six TextInputs because then SMS auto-fill drops
 *     the OTP only into the first box on iOS (RN issue #29183).
 *   - autoComplete="one-time-code" + textContentType="oneTimeCode"
 *     enables the iOS QuickType bar to surface the OTP from the SMS.
 *
 * The parent owns the value. Pass `length` (default 6) and
 * `onComplete` to auto-advance once the code is filled.
 */

type Props = {
  value: string;
  onChangeText: (next: string) => void;
  /** Fires when length === full length. Useful for auto-submit. */
  onComplete?: (code: string) => void;
  length?: number;
  autoFocus?: boolean;
  hasError?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export function OtpField({
  value,
  onChangeText,
  onComplete,
  length = 6,
  autoFocus = true,
  hasError = false,
  containerStyle,
}: Props) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (autoFocus) {
      // Small delay so focus lands AFTER the screen-transition
      // animation completes — pre-completion focus on iOS triggers
      // a janky double-keyboard pop.
      const t = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [autoFocus]);

  useEffect(() => {
    if (value.length === length) onComplete?.(value);
  }, [value, length, onComplete]);

  const focusInput = () => inputRef.current?.focus();

  return (
    <View
      style={[styles.container, containerStyle]}
      onTouchEnd={focusInput}
      accessibilityLabel="Six digit verification code"
    >
      <View style={styles.boxes}>
        {Array.from({ length }).map((_, i) => {
          const ch = value[i] ?? "";
          const isCursor = i === value.length;
          return (
            <View
              key={i}
              style={[
                styles.box,
                ch ? styles.boxFilled : null,
                isCursor ? styles.boxCursor : null,
                hasError ? styles.boxError : null,
              ]}
            >
              {ch ? <Text style={styles.boxText}>{ch}</Text> : null}
            </View>
          );
        })}
      </View>

      {/* Hidden input — receives all actual input. */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(next) => {
          const clean = next.replace(/[^0-9]/g, "").slice(0, length);
          onChangeText(clean);
        }}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={length}
        caretHidden
        style={styles.hiddenInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  boxes: {
    flexDirection: "row",
    gap: theme.spacing[2],
  },
  box: {
    flex: 1,
    height: 64,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  boxFilled: {
    borderColor: theme.colors.primary,
    // Same dark-green tint pattern used everywhere else for filled
    // primary surfaces. Derived from theme.colors.primary at 0.06.
    backgroundColor: primaryTint(0.06),
  },
  boxCursor: {
    borderColor: theme.colors.primary,
  },
  boxError: {
    borderColor: theme.colors.danger,
  },
  boxText: {
    color: theme.colors.fg,
    fontSize: 24,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  hiddenInput: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    height: 64,
    color: "transparent",
    fontSize: 1,
  },
});
