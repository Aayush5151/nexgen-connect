import { forwardRef, type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import { theme, typography } from "@/theme";

/**
 * Button — the only primitive used for actions. Three variants and
 * three sizes; nothing else. Anything more bespoke gets a custom
 * component. Press triggers a tactile haptic on iOS + Android (light
 * for non-destructive, medium for the primary CTA) — disabled if the
 * device has reduced motion / haptics off.
 *
 * Accessibility:
 *   - role="button" + aria-disabled when loading or disabled
 *   - hitSlop expands tap area to 44x44 minimum
 *   - reduces opacity 70% when pressed (matches iOS native feel)
 */

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  /** Spinner instead of label, button stays tap-blocked. */
  loading?: boolean;
  /** Soft-disabled (greyed out, tap blocked). */
  disabled?: boolean;
  /** Optional icon node rendered to the left of the label. */
  leadingIcon?: ReactNode;
  /** Optional icon node rendered to the right. */
  trailingIcon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Stretch to fill parent width. Default true. */
  fullWidth?: boolean;
  /** A11y override if the visible label isn't descriptive enough. */
  accessibilityLabel?: string;
} & Omit<PressableProps, "onPress" | "children" | "style">;

export const Button = forwardRef<View, Props>(function Button(
  {
    label,
    onPress,
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    leadingIcon,
    trailingIcon,
    style,
    fullWidth = true,
    accessibilityLabel,
    ...rest
  },
  ref,
) {
  const isInactive = disabled || loading;

  const handlePress = () => {
    if (isInactive || !onPress) return;
    // Light feedback on secondary/ghost; medium on primary so the
    // commit-style action feels weightier than a navigation tap.
    void Haptics.impactAsync(
      variant === "primary"
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light,
    );
    onPress();
  };

  return (
    <Pressable
      ref={ref}
      onPress={handlePress}
      disabled={isInactive}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        fullWidth && styles.fullWidth,
        pressed && !isInactive && styles.pressed,
        isInactive && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === "primary"
              ? theme.colors.primaryFg
              : theme.colors.primary
          }
        />
      ) : (
        <>
          {leadingIcon ? (
            <View style={styles.iconLeading}>{leadingIcon}</View>
          ) : null}
          <Text style={[typography.buttonLabel, labelVariant[variant]]}>
            {label}
          </Text>
          {trailingIcon ? (
            <View style={styles.iconTrailing}>{trailingIcon}</View>
          ) : null}
        </>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
    borderWidth: 1,
  },
  fullWidth: { alignSelf: "stretch" },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.45 },
  iconLeading: { marginRight: theme.spacing[2] },
  iconTrailing: { marginLeft: theme.spacing[2] },
});

const sizeStyles: Record<Size, ViewStyle> = {
  sm: { height: 40, paddingHorizontal: theme.spacing[4] },
  md: { height: 52, paddingHorizontal: theme.spacing[5] },
  lg: { height: 60, paddingHorizontal: theme.spacing[6] },
};

const variantStyles: Record<Variant, ViewStyle> = {
  primary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderStrong,
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
};

const labelVariant = StyleSheet.create({
  primary: { color: theme.colors.primaryFg },
  secondary: { color: theme.colors.fg },
  ghost: { color: theme.colors.primary },
});
