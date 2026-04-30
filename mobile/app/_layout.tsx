import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import * as SystemUI from "expo-system-ui";
import Constants from "expo-constants";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { theme } from "@/theme";
import { externalClients } from "@/lib/services";

/**
 * Root layout. Sits above every screen in the app/ tree. Owns:
 *   - SafeAreaProvider so screens can read insets.
 *   - GestureHandlerRootView for swipe-back / future gesture-driven UI.
 *   - QueryClient for server-state caching (auth + verification status).
 *   - System UI background — eliminates the white flash between
 *     splash and first frame on Android by setting the root view's
 *     bg to black ahead of mount.
 *   - Stack navigator with the brand-default header style.
 *   - Web-only: phone-shaped frame so the desktop preview reads as a
 *     phone instead of a stretched-out webpage. Native skips the
 *     wrapper.
 *   - Web-only: brand fonts injected via Google Fonts CSS so the type
 *     reads correctly (Inter / Inter Tight / Instrument Serif /
 *     JetBrains Mono). Native ships with these via expo-font bundle.
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

/**
 * Web-only side effect: inject the Google Fonts stylesheet + a tiny
 * dark-mode body fix so the phone-shaped frame sits on a charcoal
 * desktop backdrop instead of the browser's default white. Idempotent
 * — if a hot reload re-mounts the layout we don't double-inject.
 */
function useWebChromeOnce() {
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (typeof document === "undefined") return;
    if (document.getElementById("nx-web-chrome")) return;

    const style = document.createElement("style");
    style.id = "nx-web-chrome";
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@500;600;700&family=Instrument+Serif:ital,wght@0,400;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap');

      html, body, #root {
        height: 100%;
        margin: 0;
        background: #0A0A0A;
        font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      }
      body {
        display: flex;
        align-items: stretch;
        justify-content: center;
      }
    `;
    document.head.appendChild(style);
  }, []);
}

/**
 * v15 BP §22 (Sentry crash reporting) + §21 (PostHog telemetry)
 * — initialise both clients once at app startup. DSN + API key come
 * from EXPO_PUBLIC_* env vars; mocks no-op gracefully when env is empty.
 *
 * Idempotent: re-mounting RootLayout on fast-refresh won't double-init
 * because both mock clients track an `_isInitialized()` flag.
 */
function useObservabilityInitOnce() {
  useEffect(() => {
    const env = (Constants.expoConfig?.extra?.environment as string | undefined) ?? "development";

    const sentryDsn = (Constants.expoConfig?.extra?.sentryDsn as string | undefined) ?? "";
    if (sentryDsn || __DEV__) {
      externalClients.sentry.init({ dsn: sentryDsn, environment: env });
    }

    const posthogKey = (Constants.expoConfig?.extra?.posthogKey as string | undefined) ?? "";
    if (posthogKey || __DEV__) {
      externalClients.analytics.init({
        apiKey: posthogKey,
        host: "https://app.posthog.com",
      });
    }
  }, []);
}

export default function RootLayout() {
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.colors.bg);
  }, []);

  useObservabilityInitOnce();
  useWebChromeOnce();

  const tree = (
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

  // Native: render the tree at full bleed.
  if (Platform.OS !== "web") {
    return tree;
  }

  // Web: wrap the tree in a phone-shaped column so the desktop
  // preview reads as a device, not a stretched-out website. The
  // dimensions (390x844) match an iPhone 14 viewport. Light shadow
  // + 36px corner radius mimic native chrome without being
  // skeuomorphic.
  return (
    <View style={webStyles.desktopBackdrop}>
      <View style={webStyles.phoneFrame}>
        <View style={webStyles.phoneScreen}>{tree}</View>
      </View>
    </View>
  );
}

const webStyles = StyleSheet.create({
  desktopBackdrop: {
    flex: 1,
    minHeight: "100%",
    backgroundColor: "#0A0A0A",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  phoneFrame: {
    width: 390,
    height: 844,
    borderRadius: 44,
    backgroundColor: "#000",
    padding: 6,
    // Soft elevation + a faint primary halo behind the frame so the
    // device sits in the dark backdrop without disappearing.
    shadowColor: "#00DC82",
    shadowOpacity: 0.08,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 24 },
    // Web-only — RN ignores this on native; rn-web supports it.
    boxShadow: "0 24px 80px rgba(0, 220, 130, 0.10), 0 0 0 1px #1F1F1F",
  },
  phoneScreen: {
    flex: 1,
    borderRadius: 38,
    overflow: "hidden",
    backgroundColor: theme.colors.bg,
  },
});
