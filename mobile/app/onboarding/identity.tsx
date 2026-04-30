import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { Button } from "@/components/Button";
import { StepHeader } from "@/components/StepHeader";
import { CardSurface } from "@/components/CardSurface";
import { KickerLabel } from "@/components/KickerLabel";
import { IconChip } from "@/components/IconChip";
import { theme, typography } from "@/theme";
import { services } from "@/lib/services";
import { track, trackScreen } from "@/lib/analytics";

/**
 * O4 Identity intro. Redesign: hero + 3-tile see/never/where card
 * with icon chips + collapsible fallback panel. Less prose, more
 * icons.
 */

export default function IdentityScreen() {
  const router = useRouter();
  const [showWhatIf, setShowWhatIf] = useState(false);

  useEffect(() => {
    trackScreen("o4_identity_intro");
  }, []);

  const start = useMutation({
    mutationFn: async () => services.verification.startDigiLocker(),
    onMutate: () => track({ name: "digilocker_started" }),
    onSuccess: () => router.push("/onboarding/digilocker"),
  });

  return (
    <Screen
      footer={
        <Button
          label="Continue with DigiLocker"
          onPress={() => start.mutate()}
          loading={start.isPending}
          size="lg"
        />
      }
    >
      <StepHeader step={5} total={9} />

      <Hero
        title="Identity, anchored."
        accent="Not your Aadhaar."
        size="lg"
      />

      <View style={styles.cardStack}>
        <CardSurface variant="default">
          <View style={styles.cardRow}>
            <IconChip glyph="✓" tone="primary" size="md" />
            <View style={styles.cardBody}>
              <KickerLabel tone="primary">We see</KickerLabel>
              <Text style={typography.bodyStrong}>
                Your name. Your year of birth.
              </Text>
            </View>
          </View>
        </CardSurface>

        <CardSurface variant="default">
          <View style={styles.cardRow}>
            <IconChip glyph="✕" tone="default" size="md" />
            <View style={styles.cardBody}>
              <KickerLabel tone="muted">We never see</KickerLabel>
              <Text style={typography.bodyStrong}>
                Your Aadhaar number. Or your photo.
              </Text>
            </View>
          </View>
        </CardSurface>
      </View>

      <Pressable
        onPress={() => setShowWhatIf((v) => !v)}
        hitSlop={8}
        style={styles.whatIfToggle}
      >
        <Text style={[typography.bodyStrong, { color: theme.colors.primary }]}>
          {showWhatIf ? "Hide ↑" : "If DigiLocker can't reach you →"}
        </Text>
      </Pressable>

      {showWhatIf ? (
        <CardSurface variant="elevated" rail style={styles.whatIfPanel}>
          <KickerLabel tone="primary">Your spot is held</KickerLabel>
          <FallbackRow n="1" reason="Aadhaar not linked to your phone" />
          <FallbackRow n="2" reason="You changed your number recently" />
          <FallbackRow n="3" reason="DigiLocker account deactivated" />
          <FallbackRow n="4" reason="Name match issue" />
          <Text style={[typography.caption, styles.whatIfFooter]}>
            21 days · no restart
          </Text>
        </CardSurface>
      ) : null}
    </Screen>
  );
}

function FallbackRow({ n, reason }: { n: string; reason: string }) {
  return (
    <View style={styles.fbRow}>
      <IconChip glyph={n} tone="primary" size="sm" />
      <Text style={[typography.body, { flex: 1 }]}>{reason}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardStack: {
    marginTop: theme.spacing[8],
    gap: theme.spacing[3],
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[4],
  },
  cardBody: {
    flex: 1,
    gap: theme.spacing[1],
  },
  whatIfToggle: {
    marginTop: theme.spacing[6],
    alignSelf: "flex-start",
  },
  whatIfPanel: {
    marginTop: theme.spacing[3],
    gap: theme.spacing[3],
  },
  fbRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    paddingVertical: theme.spacing[2],
  },
  fbCode: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.primary,
    letterSpacing: 1,
    width: 40,
  },
  whatIfFooter: {
    marginTop: theme.spacing[2],
    color: theme.colors.fgSubtle,
  },
});
