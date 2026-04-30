import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import * as SystemUI from "expo-system-ui";
import { useFonts } from "expo-font";
import Constants from "expo-constants";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { theme } from "@/theme";
import { externalClients } from "@/lib/services";

/**
 * Root layout. Sits above every screen in the app/ tree. Owns:
 *   - Font loading via expo-font (Satoshi + Noto Sans Devanagari +
 *     JetBrains Mono — see mobile/docs/design-system.md §Typography).
 *   - SafeAreaProvider so screens can read insets.
 *   - GestureHandlerRootView for swipe-back / future gesture-driven UI.
 *   - QueryClient for server-state caching.
 *   - System UI background — eliminates the white flash on Android.
 *   - Stack navigator with the brand-default header style.
 *   - Web-only: phone-shaped frame so the desktop preview reads as a
 *     phone instead of a stretched-out webpage.
 *   - Web-only: brand fonts injected via Fontshare CDN.
 *
 * Bucket 2: switched fonts from v5's Inter / Inter Tight / Instrument
 * Serif to Satoshi (B1 decision). Native loads via expo-font; web via
 * Fontshare CSS @import.
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
 * Web-only: inject Fontshare Satoshi + Google Noto Sans Devanagari +
 * JetBrains Mono CSS. Idempotent — fast-refresh re-mounts don't double-
 * inject.
 *
 * Why CSS @import on web instead of next/font: this is RN-Web running
 * an Expo app, not a Next.js app. The marketing site uses next/font
 * separately. Bundle size is comparable; the @import is loaded async
 * and falls back to system-ui until ready.
 */
function useWebChromeOnce() {
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (typeof document === "undefined") return;
    if (document.getElementById("nx-web-chrome")) return;

    const style = document.createElement("style");
    style.id = "nx-web-chrome";
    style.textContent = `
      @import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

      html, body, #root {
        height: 100%;
        margin: 0;
        background: ${theme.colors.bg};
        font-family: 'Satoshi', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
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
 * v15 BP §22 (Sentry crash reporting) + §21 (PostHog telemetry).
 */
function useObservabilityInitOnce() {
  useEffect(() => {
    const env =
      (Constants.expoConfig?.extra?.environment as string | undefined) ?? "development";

    const sentryDsn =
      (Constants.expoConfig?.extra?.sentryDsn as string | undefined) ?? "";
    if (sentryDsn || __DEV__) {
      externalClients.sentry.init({ dsn: sentryDsn, environment: env });
    }

    const posthogKey =
      (Constants.expoConfig?.extra?.posthogKey as string | undefined) ?? "";
    if (posthogKey || __DEV__) {
      externalClients.analytics.init({
        apiKey: posthogKey,
        host: "https://app.posthog.com",
      });
    }
  }, []);
}

export default function RootLayout() {
  // Native: load brand fonts before any screen renders. Web uses CSS
  // @import (handled in useWebChromeOnce) so this hook is a no-op on
  // web because the .ttf paths don't exist there.
  const [fontsLoaded, fontError] = useFonts(
    Platform.OS === "web"
      ? {}
      : {
          // Satoshi — three weights cover regular / medium / bold use.
          // semibold (600) falls back to medium (500) on render.
          "Satoshi-Variable": require("../assets/fonts/Satoshi-Regular.ttf"),
          "Satoshi-Medium": require("../assets/fonts/Satoshi-Medium.ttf"),
          "Satoshi-Bold": require("../assets/fonts/Satoshi-Bold.ttf"),
          // Variable Devanagari — handles weight via fontWeight prop.
          "NotoSansDevanagari-Variable": require("../assets/fonts/NotoSansDevanagari-Variable.ttf"),
          // Monospace for tabular numerals + IDs.
          JetBrainsMono: require("../assets/fonts/JetBrainsMono-Regular.ttf"),
          "JetBrainsMono-Bold": require("../assets/fonts/JetBrainsMono-Bold.ttf"),
        },
  );

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.colors.bg);
  }, []);

  useObservabilityInitOnce();
  useWebChromeOnce();

  // Native: hold first-frame render until fonts are in. Without this,
  // the welcome screen flashes in the iOS system font for a frame
  // before Satoshi loads.
  if (Platform.OS !== "web" && !fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.bg }} />;
  }

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
              // Build Prompt §Motion: 240ms transition for sheet/modal/
              // tab change. Stack pushes use this same value.
              animationDuration: theme.duration.transition,
              gestureEnabled: true,
            }}
          />
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );

  if (Platform.OS !== "web") {
    return tree;
  }

  // Web: wrap the tree in a phone-shaped column so the desktop preview
  // reads as a device. Dimensions (390x844) match an iPhone 14 viewport.
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
    backgroundColor: theme.colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
  },
  phoneFrame: {
    width: 390,
    height: 844,
    borderRadius: 44,
    backgroundColor: "#000",
    padding: 6,
    // Soft elevation + faint Pulse halo so the device sits in the dark
    // backdrop without disappearing.
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 24 },
    // rn-web supports boxShadow; native ignores.
    boxShadow: `0 24px 80px ${theme.colors.primary}1A, 0 0 0 1px ${theme.colors.borderStrong}`,
  },
  phoneScreen: {
    flex: 1,
    borderRadius: 38,
    overflow: "hidden",
    backgroundColor: theme.colors.bg,
  },
});
