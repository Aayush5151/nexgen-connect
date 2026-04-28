import { forwardRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
  type StyleProp,
} from "react-native";
import { theme, typography } from "@/theme";

/**
 * TextField — labelled input with built-in focus / error states.
 *
 * Three visual states:
 *   - idle:    border = border-strong (#2E2E2E)
 *   - focused: border = primary, soft glow
 *   - error:   border = danger, glow in red
 *
 * Composition contract: the parent owns `value` + `onChangeText` so
 * validation lives in the screen, not the input. We keep a small
 * focus-state internally for visual feedback only.
 */

type Props = {
  label: string;
  /** Optional helper line below the input — supplanted by error if any. */
  helperText?: string;
  errorText?: string;
  /** Optional kicker above the label, e.g., country dial code prefix. */
  prefix?: string;
  containerStyle?: StyleProp<ViewStyle>;
} & Omit<TextInputProps, "style">;

export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, helperText, errorText, prefix, containerStyle, onFocus, onBlur, ...inputProps },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const showError = Boolean(errorText);

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={typography.inputLabel}>{label}</Text>

      <View
        style={[
          styles.row,
          focused && styles.rowFocused,
          showError && styles.rowError,
        ]}
      >
        {prefix ? (
          <View style={styles.prefixWrap}>
            <Text style={styles.prefix}>{prefix}</Text>
          </View>
        ) : null}

        <TextInput
          ref={ref}
          {...inputProps}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          placeholderTextColor={theme.colors.fgPlaceholder}
          selectionColor={theme.colors.primary}
          style={styles.input}
        />
      </View>

      {showError ? (
        <Text style={typography.errorText}>{errorText}</Text>
      ) : helperText ? (
        <Text style={typography.caption}>{helperText}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing[2],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing[4],
    height: 60,
  },
  rowFocused: {
    borderColor: theme.colors.primary,
  },
  rowError: {
    borderColor: theme.colors.danger,
  },
  prefixWrap: {
    paddingRight: theme.spacing[3],
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    marginRight: theme.spacing[3],
    height: "60%",
    justifyContent: "center",
  },
  prefix: {
    color: theme.colors.fgMuted,
    fontFamily: theme.fontFamily.body,
    fontSize: 18,
    fontWeight: theme.fontWeight.medium,
  },
  input: {
    flex: 1,
    color: theme.colors.fg,
    fontFamily: theme.fontFamily.body,
    fontSize: 18,
    height: "100%",
  },
});
