import { Stack } from "expo-router";
import { theme } from "@/theme";

export default function CorridorStack() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.bg },
        animation: "slide_from_right",
      }}
    />
  );
}
