import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { Button } from "@/components/Button";
import { CardSurface } from "@/components/CardSurface";
import { KickerLabel } from "@/components/KickerLabel";
import { Pill } from "@/components/Pill";
import { theme, typography } from "@/theme";

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
        title="This is the Berlin IU"
        accent="2025 risk pattern."
        size="lg"
        style={styles.hero}
      />

      <Text style={[typography.body, styles.intro]}>
        Your admit letter shows a hybrid programme at a German HEI.
        Germany&apos;s student-visa class requires in-person attendance.
        Hybrid programmes have been mass-rejected post-arrival in
        2025-2026 — students lost their tuition AND were deported.
      </Text>

      <CardSurface variant="default" rail style={styles.optionCard}>
        <KickerLabel tone="muted">Option 1</KickerLabel>
        <Text style={[typography.bodyStrong, styles.optionTitle]}>
          Continue at risk
        </Text>
        <Text style={[typography.body, styles.optionBody]}>
          Proceed to your corridor. We&apos;ll surface visa-status check
          early. You accept the rejection risk.
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
          <Text style={styles.optionLink}>I understand · continue →</Text>
        </Pressable>
      </CardSurface>

      <CardSurface variant="accent" rail style={styles.optionCard}>
        <KickerLabel tone="primary">Option 2 (recommended)</KickerLabel>
        <Text style={[typography.bodyStrong, styles.optionTitle]}>
          Withdraw + full refund
        </Text>
        <Text style={[typography.body, styles.optionBody]}>
          We refund anything you&apos;ve paid us in full. We don&apos;t
          earn from you taking a bad bet.
        </Text>
        <Button
          label="Withdraw + refund"
          onPress={onWithdraw}
          variant="primary"
          size="md"
        />
      </CardSurface>

      <Text style={[typography.caption, styles.footer]}>
        v15 BP §3.7 · We name the risk before you pay for it.
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
