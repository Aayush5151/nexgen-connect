import { forwardRef, useRef, type ReactNode } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import { theme, textStyles } from "@/theme";

/**
 * Button — single primitive for every action.
 *
 * Build Prompt §Components: "Standardize Button to four variants only:
 *   primary (Pulse fill), secondary (Ink outline), tertiary (text only),
 *   destructive (Halt fill). Drop ghost. Drop link. Drop tonal."
 *
 * Tap feedback: 0.97 scale transform + light haptic on every press
 * (Build Prompt §Motion). No ripple, no underglow. The halo treatment
 * the v5 `glow` variant provided is a welcome-screen-only effect now;
 * screens that need it wrap a primary button in a halo View at the
 * screen level.
 *
 * Sizes:
 *   sm  40h    inline / chip
 *   md  52h    default
 *   lg  60h    primary CTA on most screens
 *   xl  68h    hero CTA on onboarding entry
 *
 * Touch target: minimum height matches Apple HIG (44pt) on sm; md+
 * exceeds it. hitSlop adds 6pt on all sides for touchable comfort.
 *
 * v6 build §6 / Build Prompt Bucket 2.
 */

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  accessibilityLabel?: string;
} & Omit<PressableProps, "onPress" | "children" | "style">;

const PRESS_SCALE = 0.97; // Build Prompt §Motion — tap feedback.

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
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (isInactive) return;
    Animated.spring(scale, {
      toValue: PRESS_SCALE,
      stiffness: theme.spring.stiffness,
      damping: theme.spring.damping,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      stiffness: theme.spring.stiffness,
      damping: theme.spring.damping,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (isInactive || !onPress) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const labelColor = labelVariant[variant].color as string;

  return (
    <Animated.View
      style={[
        fullWidth && styles.fullWidth,
        { transform: [{ scale }] },
      ]}
    >
      <Pressable
        ref={ref}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={isInactive}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled: isInactive, busy: loading }}
        style={({ pressed: _pressed }) => [
          styles.base,
          sizeStyles[size],
          variantStyles[variant],
          fullWidth && styles.fullWidth,
          isInactive && styles.disabled,
          style,
        ]}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator size="small" color={labelColor} />
        ) : (
          <>
            {leadingIcon ? <View style={styles.iconLeading}>{leadingIcon}</View> : null}
            <Text style={[textStyles.buttonLabel, { color: labelColor }]}>{label}</Text>
            {trailingIcon ? <View style={styles.iconTrailing}>{trailingIcon}</View> : null}
          </>
        )}
      </Pressable>
    </Animated.View>
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
  disabled: { opacity: 0.45 },
  iconLeading: { marginRight: theme.spacing[2] },
  iconTrailing: { marginLeft: theme.spacing[2] },
});

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: { height: 40, paddingHorizontal: theme.spacing[4] },
  md: { height: 52, paddingHorizontal: theme.spacing[5] },
  lg: { height: 60, paddingHorizontal: theme.spacing[6] },
  xl: { height: 68, paddingHorizontal: 28 },
};

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: "transparent",
    borderColor: theme.colors.borderStrong,
  },
  tertiary: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  destructive: {
    backgroundColor: theme.colors.danger,
    borderColor: theme.colors.danger,
  },
};

const labelVariant = {
  primary: { color: theme.colors.primaryFg },
  secondary: { color: theme.colors.fg },
  tertiary: { color: theme.colors.primary },
  destructive: { color: theme.colors.dangerFg },
} as const;
