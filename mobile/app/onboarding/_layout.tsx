import { Stack } from "expo-router";
import { theme } from "@/theme";

/**
 * Onboarding stack. Every screen in onboarding/ inherits these
 * defaults. We hide the system header — each screen renders its own
 * compact step indicator + back affordance — and slide-in from the
 * right so the funnel feels directional. Gesture-back is enabled so
 * the iOS swipe edge gesture works without ceremony.
 */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.bg },
        animation: "slide_from_right",
        animationDuration: 220,
        gestureEnabled: true,
      }}
    />
  );
}
