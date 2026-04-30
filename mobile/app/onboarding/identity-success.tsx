import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { StepHeader } from "@/components/StepHeader";
import { IconChip } from "@/components/IconChip";
import { theme } from "@/theme";
import { trackScreen } from "@/lib/analytics";

/**
 * O6 Identity success. Pure celebration. Animated check, pill,
 * hero, glow CTA. No technical detail surfaced — the user just
 * won, the screen reflects that.
 */

export default function IdentitySuccessScreen() {
  const router = useRouter();
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    trackScreen("o6_identity_success");
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.parallel([
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(checkOpacity, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [checkScale, checkOpacity]);

  return (
    <Screen
      footer={
        <Button
          label="Continue"
          onPress={() => router.replace("/onboarding/admit-intro")}
          size="lg"
          variant="glow"
        />
      }
    >
      <StepHeader step={5} total={9} showBack={false} />

      <View style={styles.celebrate}>
        <Animated.View
          style={{
            transform: [{ scale: checkScale }],
            opacity: checkOpacity,
          }}
        >
          <IconChip glyph="✓" tone="primary" size="lg" />
        </Animated.View>
      </View>

      <View style={styles.pillRow}>
        <Pill dot variant="primary">
          Identity verified
        </Pill>
      </View>

      <Hero
        title="That's you."
        accent="Anchored."
        size="xl"
        align="center"
        style={styles.hero}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  celebrate: {
    alignItems: "center",
    marginTop: theme.spacing[10],
    marginBottom: theme.spacing[6],
  },
  pillRow: {
    alignItems: "center",
  },
  hero: {
    marginTop: theme.spacing[6],
  },
});
