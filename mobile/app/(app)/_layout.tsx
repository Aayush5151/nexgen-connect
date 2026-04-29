import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { theme, typography } from "@/theme";
import { useSession, useSessionHydrated } from "@/store/session";

/**
 * Authed app shell. Four tabs along the bottom:
 *   1. Corridor — your verified group (CH1, CH5, G2, sub-circles, G3)
 *   2. Chat     — channels list + DMs (CT1, CT2, CT3) + MH-A inline
 *   3. Profile  — settings, Premium, parent view, report (Y1-Y5, PR1-PR4, PV1-PV5, TS1-TS3)
 *   4. Help     — HN1 triage + folded SCM-A "Read before you need it"
 *                 (v15 BP §3.4 / Q3 — Safety folds into Help; was 5 tabs
 *                  pre-v6 with separate Safety tab, now 4)
 *
 * Auth-gate: any cold deep-link to /(app)/* without a session token
 * bounces back to / where the user runs the standard onboarding
 * funnel. Without this, a deep link to /(app)/corridor would render
 * the tab shell with empty data — fine in mock, but in prod a
 * token-less request would 401 every query and crash the surface.
 *
 * Tab styling: floating black bar with hairline top, primary green
 * label + dot for the active tab. No tab icons — labels carry the
 * meaning, fewer pixels of chrome.
 */

export default function AppLayout() {
  const hydrated = useSessionHydrated();
  const sessionToken = useSession((s) => s.sessionToken);

  // Wait for secure-store to hydrate before deciding what to render.
  // Without this, a deep link to /(app)/corridor flashes the auth-
  // redirect for one frame on cold start even when the user is signed
  // in.
  if (!hydrated) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  // Auth-gate. We use Redirect (declarative) rather than router.replace
  // (imperative) so the redirect happens before any tab screen mounts
  // a query — avoiding wasted fetch + 401 noise in prod.
  if (!sessionToken) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarLabelStyle: typography.mono,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.fgSubtle,
        tabBarItemStyle: styles.tabItem,
        sceneStyle: { backgroundColor: theme.colors.bg },
      }}
    >
      <Tabs.Screen
        name="corridor"
        options={{
          title: "Group",
          tabBarIcon: ({ focused }) => <Dot focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ focused }) => <Dot focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => <Dot focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: "Help",
          tabBarIcon: ({ focused }) => <Dot focused={focused} />,
        }}
      />
    </Tabs>
  );
}

function Dot({ focused }: { focused: boolean }) {
  return (
    <View
      style={[
        styles.dot,
        { backgroundColor: focused ? theme.colors.primary : "transparent" },
        !focused && { borderColor: theme.colors.fgSubtle, borderWidth: 1 },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.colors.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    height: 84,
    paddingBottom: 24,
    paddingTop: 10,
  },
  tabItem: {
    paddingTop: 4,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  splash: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
});
