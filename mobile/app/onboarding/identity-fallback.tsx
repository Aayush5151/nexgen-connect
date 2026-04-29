import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { StepHeader } from "@/components/StepHeader";
import { CardSurface } from "@/components/CardSurface";
import { KickerLabel } from "@/components/KickerLabel";
import { IconChip } from "@/components/IconChip";
import { theme, typography } from "@/theme";
import type { DigiLockerFailureReason } from "@/lib/services";

/**
 * O7a-d Fallback. Redesign: hero accent + held-spot card +
 * numbered remediation chips. One sentence per step.
 */

type Content = {
  pill: string;
  title: string;
  accent: string;
  hold: string;
  steps: string[];
};

const CONTENT: Record<DigiLockerFailureReason, Content> = {
  aadhaar_not_linked: {
    pill: "Spot held",
    title: "Aadhaar not linked.",
    accent: "Two paths.",
    hold: "7 days",
    steps: [
      "Link Aadhaar to your mobile in mAadhaar.",
      "Or skip to admit-letter review.",
    ],
  },
  mobile_changed: {
    pill: "Spot held",
    title: "Number changed.",
    accent: "Two paths.",
    hold: "14 days",
    steps: [
      "Update your Aadhaar mobile via UIDAI.",
      "Or skip to admit-letter review.",
    ],
  },
  deactivated: {
    pill: "Spot held",
    title: "Reactivate DigiLocker.",
    accent: "Three paths.",
    hold: "21 days",
    steps: [
      "Reactivate at digilocker.gov.in.",
      "Or open a fresh DigiLocker.",
      "Or skip to admit-letter review.",
    ],
  },
  invisible_character: {
    pill: "We're on it",
    title: "We'll handle this.",
    accent: "Stay put.",
    hold: "~24h · silent",
    steps: [
      "Nothing on your side.",
      "We'll ping you when it's unblocked.",
      "Or jump to admit-letter review.",
    ],
  },
};

export default function IdentityFallbackScreen() {
  const router = useRouter();
  const { reason } = useLocalSearchParams<{ reason: DigiLockerFailureReason }>();
  const content =
    (reason && CONTENT[reason as DigiLockerFailureReason]) ??
    CONTENT.aadhaar_not_linked;

  return (
    <Screen
      footer={
        <View style={{ gap: theme.spacing[2] }}>
          <Button
            label="Skip to admit-letter review"
            onPress={() => router.replace("/onboarding/admit-intro")}
            size="lg"
          />
          <Button
            label="Try DigiLocker again"
            variant="ghost"
            onPress={() => router.replace("/onboarding/digilocker")}
            size="md"
          />
        </View>
      }
    >
      <StepHeader step={5} total={9} showBack={false} />

      <Pill variant="warning" dot>
        {content.pill}
      </Pill>

      <Hero
        title={content.title}
        accent={content.accent}
        size="lg"
        style={styles.hero}
      />

      <CardSurface variant="warning" rail style={styles.holdCard}>
        <KickerLabel tone="warning" dot pulse>
          Spot held
        </KickerLabel>
        <Text style={[typography.bodyStrong, { marginTop: theme.spacing[1] }]}>
          {content.hold}
        </Text>
      </CardSurface>

      <View style={styles.steps}>
        <KickerLabel tone="muted">Paths forward</KickerLabel>
        {content.steps.map((step, i) => (
          <View
            key={`${reason ?? "default"}-${i}`}
            style={styles.stepRow}
          >
            <IconChip glyph={String(i + 1)} tone="primary" size="sm" />
            <Text style={[typography.body, styles.stepText]}>{step}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: theme.spacing[4],
  },
  holdCard: {
    marginTop: theme.spacing[6],
  },
  steps: {
    marginTop: theme.spacing[6],
    gap: theme.spacing[3],
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    paddingVertical: theme.spacing[1],
  },
  stepText: {
    flex: 1,
  },
});
