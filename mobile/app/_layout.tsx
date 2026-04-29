import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import * as SystemUI from "expo-system-ui";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { theme } from "@/theme";

/**
 * Root layout. Sits above every screen in the app/ tree. Owns:
 *   - SafeAreaProvider so screens can read insets.
 *   - GestureHandlerRootView for swipe-back / future gesture-driven UI.
 *   - QueryClient for server-state caching (auth + verification status).
 *   - System UI background — eliminates the white flash between
 *     splash and first frame on Android by setting the root view's
 *     bg to black ahead of mount.
 *   - Stack navigator with the brand-default header style. Most
 *     screens hide the header outright via their own options; this
 *     just sets the fallback for any that don't.
 *   - StatusBar style="light" — content text is white on black.
 *
 * Keep this file tight. Anything provider-shaped goes here; anything
 * screen-shaped goes in app/index.tsx or app/onboarding/*.
 */

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.colors.bg);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.colors.bg },
              animation: "slide_from_right",
              animationDuration: 220,
              gestureEnabled: true,
            }}
          />
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
