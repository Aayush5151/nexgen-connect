import { type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "@/theme";

/**
 * Screen — the standard outer wrapper for every onboarding / app
 * screen. Handles three things every screen needs and we'd otherwise
 * forget on at least one of them:
 *   1. Safe-area padding (notch + home indicator on iOS, gesture nav
 *      bar on Android).
 *   2. Keyboard avoidance — pushes content above the keyboard so
 *      inputs aren't covered. iOS uses padding, Android uses height
 *      because Android's softInput resizes the window for us.
 *   3. Black background, full bleed, with consistent horizontal
 *      gutter (24px). Override via `padded={false}` for screens that
 *      want full-bleed (e.g., a video / image hero).
 *
 * `scroll` defaults to true. Set scroll={false} for screens with a
 * fixed footer button that should always be reachable without scroll.
 */

type Props = {
  children: ReactNode;
  /** Add 24px horizontal padding. Default true. */
  padded?: boolean;
  /** Make the body scrollable. Default true. */
  scroll?: boolean;
  /** Optional content rendered fixed at the bottom (CTA buttons). */
  footer?: ReactNode;
  /** Custom outer style override. */
  style?: StyleProp<ViewStyle>;
};

export function Screen({
  children,
  padded = true,
  scroll = true,
  footer,
  style,
}: Props) {
  const insets = useSafeAreaInsets();

  const containerStyle: StyleProp<ViewStyle> = [
    styles.container,
    {
      paddingTop: insets.top,
      paddingBottom: footer ? 0 : insets.bottom,
    },
    style,
  ];

  const innerStyle: StyleProp<ViewStyle> = [
    scroll ? styles.scrollContent : styles.staticContent,
    padded && styles.padded,
  ];

  const Body = scroll ? (
    <ScrollView
      contentContainerStyle={innerStyle}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[innerStyle, styles.flex]}>{children}</View>
  );

  return (
    <KeyboardAvoidingView
      style={containerStyle}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {Body}
      {footer ? (
        <View
          style={[
            styles.footer,
            padded && styles.padded,
            { paddingBottom: 16 + insets.bottom },
          ]}
        >
          {footer}
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingTop: theme.spacing[6],
    paddingBottom: theme.spacing[10],
  },
  staticContent: {
    paddingTop: theme.spacing[6],
  },
  padded: {
    paddingHorizontal: theme.spacing[6],
  },
  footer: {
    paddingTop: theme.spacing[3],
    backgroundColor: theme.colors.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
});
