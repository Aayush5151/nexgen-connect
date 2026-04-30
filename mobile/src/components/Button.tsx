import { forwardRef, useEffect, useRef, type ReactNode } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import { theme, typography, primaryTint } from "@/theme";

/**
 * Button — single primitive for every action. Variants:
 *   primary    solid green, Apple-style commit action
 *   secondary  surface + border, navigation-weight tap
 *   ghost      transparent, link-weight tap
 *   glow       primary + soft pulsing halo + boxShadow on web. The
 *              hero CTA used on welcome / outcome / unlock screens.
 *
 * Sizes:
 *   sm  40h    inline / chip
 *   md  52h    default
 *   lg  60h    primary CTA on most screens
 *   xl  68h    hero CTA on onboarding entry / unlock celebration
 */

type Variant = "primary" | "secondary" | "ghost" | "glow";
type Size = "sm" | "md" | "lg" | "xl";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
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
  ref
) {
  const isInactive = disabled || loading;
  const haloAnim = useRef(new Animated.Value(0)).current;

  // The glow variant runs a 2.4s pulse on the halo behind the
  // button, mirroring the O1 hero CTA. We loop indefinitely while
  // the button is mounted; native driver keeps it cheap.
  useEffect(() => {
    if (variant !== "glow") return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(haloAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(haloAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [variant, haloAnim]);

  const handlePress = () => {
    if (isInactive || !onPress) return;
    void Haptics.impactAsync(
      variant === "primary" || variant === "glow"
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light
    );
    onPress();
  };

  const halo =
    variant === "glow" ? (
      <Animated.View
        pointerEvents="none"
        style={[
          styles.halo,
          {
            opacity: haloAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.18, 0.34],
            }),
            transform: [
              {
                scale: haloAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.05],
                }),
              },
            ],
          },
        ]}
      />
    ) : null;

  const buttonNode = (
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
            variant === "primary" || variant === "glow"
              ? theme.colors.primaryFg
              : theme.colors.primary
          }
        />
      ) : (
        <>
          {leadingIcon ? <View style={styles.iconLeading}>{leadingIcon}</View> : null}
          <Text
            style={[typography.buttonLabel, labelVariant[variant], size === "xl" && styles.xlLabel]}
          >
            {label}
          </Text>
          {trailingIcon ? <View style={styles.iconTrailing}>{trailingIcon}</View> : null}
        </>
      )}
    </Pressable>
  );

  if (variant === "glow") {
    return (
      <View style={[fullWidth && styles.fullWidth, styles.glowWrap]}>
        {halo}
        {buttonNode}
      </View>
    );
  }

  return buttonNode;
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
  xlLabel: { fontSize: 17, fontWeight: "600" },
  glowWrap: {
    position: "relative",
  },
  halo: {
    position: "absolute",
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    // Web: soft glow extending beyond the bounds.
    ...(Platform.OS === "web"
      ? // react-native-web supports boxShadow as a style key
        ({ boxShadow: "0 18px 48px rgba(0, 220, 130, 0.42)" } as ViewStyle)
      : {}),
  },
});

const sizeStyles: Record<Size, ViewStyle> = {
  sm: { height: 40, paddingHorizontal: theme.spacing[4] },
  md: { height: 52, paddingHorizontal: theme.spacing[5] },
  lg: { height: 60, paddingHorizontal: theme.spacing[6] },
  xl: { height: 68, paddingHorizontal: 28 },
};

const variantStyles: Record<Variant, ViewStyle> = {
  primary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  glow: {
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
  glow: { color: theme.colors.primaryFg },
  secondary: { color: theme.colors.fg },
  ghost: { color: theme.colors.primary },
});

// Re-export tint helper so call sites that need the same tinted
// background (e.g. accent overlays) can use it without a second
// import.
export const _primaryTint = primaryTint;
