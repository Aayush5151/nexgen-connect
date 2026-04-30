import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { Button } from "@/components/Button";
import { CardSurface } from "@/components/CardSurface";
import { KickerLabel } from "@/components/KickerLabel";
import { Pill } from "@/components/Pill";
import { theme, typography } from "@/theme";
import { useCopy } from "@/lib/copy";
import { trackScreen } from "@/lib/analytics";

/**
 * O11a — Hybrid-programme warning.
 *
 * Conditionally surfaced when admit-letter review flags the user's
 * programme as "hybrid" AND destination = Germany. Inspired by the
 * Berlin IU 2025 visa scandal: students enrolled in hybrid programmes
 * had German student-visa applications mass-rejected post-arrival
 * because the visa class requires in-person attendance. We don't
 * silently route those users into a corridor without naming the risk.
 *
 * Two-card decision:
 *   - Continue at risk    — user acknowledges, proceeds to corridor.
 *   - Withdraw + refund   — exit funnel, full refund per refund matrix
 *                           (BP §16 M-series).
 *
 * Choice + timestamp will be persisted to session via a follow-up
 * field add (`hybridProgrammeChoice`) when the admit-outcome
 * conditional trigger lands. For now: local state, route-on-tap.
 *
 * Wiring TODO (follow-up commit):
 *   - admit-outcome.tsx detects hybrid + Germany on admit metadata
 *     and conditionally router.replace("/onboarding/hybrid-warning")
 *     instead of routing straight to /(app)/corridor.
 *   - Service layer: AdmitStatus shape extends to expose
 *     `programmeFormat: "in_person" | "hybrid" | "online"`.
 *   - Session store: add hybridProgrammeChoice field +
 *     setHybridProgrammeChoice setter (analogous to setScariestThing).
 *
 * v15 BP §3.7 honest-naming brand promise — we name the risk before
 * the user pays for it.
 */

type Choice = "continue_at_risk" | "withdraw_refund" | null;

export default function HybridWarningScreen() {
  const router = useRouter();
  const [choice, setChoice] = useState<Choice>(null);
  const t = useCopy("onboarding");

  useEffect(() => {
    trackScreen("o11a_hybrid_warning");
  }, []);

  const onContinue = () => {
    setChoice("continue_at_risk");
    // TODO: persist choice + ISO timestamp to session.hybridProgrammeChoice
    // when the field is added in the follow-up commit.
    router.replace("/(app)/corridor");
  };

  const onWithdraw = () => {
    setChoice("withdraw_refund");
    // TODO: persist + route to refund flow when that surface lands.
    // For now route to a placeholder; in production this triggers the
    // Razorpay refund + admit-letter retraction.
    router.replace("/onboarding/admit-outcome");
  };

  return (
    <Screen>
      <Pill variant="warning">⚠ Hybrid programme detected</Pill>

      <Hero
        title={t("hybrid.heading")}
        accent={t("hybrid.accent")}
        size="lg"
        style={styles.hero}
      />

      <Text style={[typography.body, styles.intro]}>{t("hybrid.body")}</Text>

      <CardSurface variant="default" rail style={styles.optionCard}>
        <KickerLabel tone="muted">Option 1</KickerLabel>
        <Text style={[typography.bodyStrong, styles.optionTitle]}>
          {t("hybrid.continue.title")}
        </Text>
        <Text style={[typography.body, styles.optionBody]}>
          {t("hybrid.continue.body")}
        </Text>
        <Pressable
          onPress={onContinue}
          accessibilityRole="button"
          accessibilityLabel="Continue at risk"
          style={({ pressed }) => [
            styles.optionPressable,
            pressed && { opacity: 0.6 },
          ]}
        >
          <Text style={styles.optionLink}>{t("hybrid.continue.cta")} →</Text>
        </Pressable>
      </CardSurface>

      <CardSurface variant="accent" rail style={styles.optionCard}>
        <KickerLabel tone="primary">Option 2 (recommended)</KickerLabel>
        <Text style={[typography.bodyStrong, styles.optionTitle]}>
          {t("hybrid.withdraw.title")}
        </Text>
        <Text style={[typography.body, styles.optionBody]}>
          {t("hybrid.withdraw.body")}
        </Text>
        <Button
          label={t("hybrid.withdraw.cta")}
          onPress={onWithdraw}
          variant="primary"
          size="md"
        />
      </CardSurface>

      <Text style={[typography.caption, styles.footer]}>
        {t("hybrid.footer")}
      </Text>

      {choice ? (
        <Text style={[typography.caption, styles.choiceDebug]}>
          Choice: {choice}
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: theme.spacing[3],
    marginBottom: theme.spacing[4],
  },
  intro: {
    color: theme.colors.fgMuted,
    marginBottom: theme.spacing[5],
    lineHeight: 22,
  },
  optionCard: {
    gap: theme.spacing[2],
    marginBottom: theme.spacing[4],
  },
  optionTitle: {
    marginTop: theme.spacing[1],
  },
  optionBody: {
    color: theme.colors.fgMuted,
    marginBottom: theme.spacing[3],
  },
  optionPressable: {
    paddingVertical: theme.spacing[2],
  },
  optionLink: {
    color: theme.colors.fgMuted,
    fontFamily: theme.fontFamily.body,
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    color: theme.colors.fgSubtle,
    textAlign: "center",
    marginTop: theme.spacing[4],
  },
  choiceDebug: {
    color: theme.colors.fgSubtle,
    textAlign: "center",
    fontFamily: theme.fontFamily.mono,
    marginTop: theme.spacing[2],
  },
});
