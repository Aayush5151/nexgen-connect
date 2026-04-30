import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { trackScreen } from "@/lib/analytics";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { StepHeader } from "@/components/StepHeader";
import { CardSurface } from "@/components/CardSurface";
import { BigStat } from "@/components/BigStat";
import { theme } from "@/theme";
import { ADMIT_REVIEW_SLA_HOURS, ADMIT_PDF_TTL_MIN } from "@nexgen-connect/shared";

/**
 * O8 Admit intro. Redesign: visual timeline (3 nodes) + 2 big
 * stats (48h SLA / 60min PDF wipe). Stripped prose.
 */

export default function AdmitIntroScreen() {
  const router = useRouter();

  useEffect(() => {
    trackScreen("o8_admit_intro");
  }, []);

  return (
    <Screen
      footer={
        <Button
          label="Upload admit letter"
          onPress={() => router.push("/onboarding/admit-upload")}
          size="lg"
        />
      }
    >
      <StepHeader step={6} total={9} />

      <Pill dot variant="primary">
        Final check
      </Pill>

      <Hero
        title="One human."
        accent="Reads every letter."
        size="xl"
        style={styles.hero}
      />

      {/* Stat pair — SLA & wipe. The visual story. */}
      <View style={styles.statRow}>
        <CardSurface variant="accent" rail style={styles.statCard}>
          <BigStat
            value={ADMIT_REVIEW_SLA_HOURS}
            label="Hour review"
            accent
            size="lg"
          />
        </CardSurface>
        <CardSurface variant="default" style={styles.statCard}>
          <BigStat
            value={ADMIT_PDF_TTL_MIN}
            label="Min to wipe"
            size="lg"
          />
        </CardSurface>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[8],
  },
  statRow: {
    flexDirection: "row",
    gap: theme.spacing[3],
  },
  statCard: {
    flex: 1,
  },
});
