import { Tabs } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { theme, typography } from "@/theme";

/**
 * Authed app shell. Three tabs along the bottom:
 *   1. Corridor — your verified group (CH1, CH5, G2, sub-circles)
 *   2. Chat     — channels list + DMs (CT1, CT2, CT3)
 *   3. Profile  — settings, Premium, parent view, report
 *
 * Tab styling: floating black bar with hairline top, primary green
 * label + dot for the active tab. No tab icons — labels carry the
 * meaning, fewer pixels of chrome.
 */

export default function AppLayout() {
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
          title: "Corridor",
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
    height: 70,
    paddingBottom: 16,
    paddingTop: 6,
  },
  tabItem: {
    paddingTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
