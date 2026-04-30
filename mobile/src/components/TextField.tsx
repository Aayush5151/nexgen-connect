import { forwardRef, useState, type ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
  type StyleProp,
} from "react-native";
import { theme, textStyles } from "@/theme";

/**
 * TextField — single labelled input primitive. All input variants
 * (search, password, email, etc.) compose through this with props.
 *
 * Build Prompt §Components: "Standardize TextField to one component
 * with prop-driven states. No SearchField, no PasswordField as
 * separate components — those are TextField with prefixIcon and
 * secureTextEntry."
 *
 * States:
 *   - idle:    border = borderStrong
 *   - focused: border = Pulse
 *   - error:   border = Halt
 *
 * Composition contract: the parent owns `value` + `onChangeText` so
 * validation lives in the screen, not the input. The internal focus
 * flag is visual feedback only.
 *
 * v6 build §6 / Build Prompt Bucket 2.
 */

type Props = {
  label: string;
  /** Optional helper line below the input — replaced by error if any. */
  helperText?: string;
  errorText?: string;
  /** Optional kicker text inside the field, e.g., country dial code "+91". */
  prefix?: string;
  /** Optional leading icon node (e.g., search glyph, lock for password). */
  prefixIcon?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
} & Omit<TextInputProps, "style">;

export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, helperText, errorText, prefix, prefixIcon, containerStyle, onFocus, onBlur, ...inputProps },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const showError = Boolean(errorText);

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={textStyles.inputLabel}>{label}</Text>

      <View
        style={[
          styles.row,
          focused && styles.rowFocused,
          showError && styles.rowError,
        ]}
      >
        {prefixIcon ? <View style={styles.prefixIconWrap}>{prefixIcon}</View> : null}
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
        <Text style={textStyles.errorText}>{errorText}</Text>
      ) : helperText ? (
        <Text style={textStyles.caption}>{helperText}</Text>
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
  prefixIconWrap: {
    marginRight: theme.spacing[2],
    alignItems: "center",
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
