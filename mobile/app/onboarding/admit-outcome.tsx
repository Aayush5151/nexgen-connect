import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Screen } from "@/components/Screen";
import { Heading } from "@/components/Heading";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { StepHeader } from "@/components/StepHeader";
import { LoadingScreen } from "@/components/LoadingScreen";
import { theme, typography, primaryTint } from "@/theme";
import { services } from "@/lib/services";
import { useSession } from "@/store/session";

/**
 * O11 Admit outcome — terminal screen of the auth+verify funnel.
 * Branches on the server's decision:
 *
 *   approved → success haptic, "you're in" headline, primary CTA
 *              hands off to the corridor home (Phase 2 surface).
 *
 *   rejected → warning haptic, the actual reason, the question
 *              "can I resubmit?" answered explicitly. CTA either
 *              goes back to upload (resubmit) or to support (manual
 *              path) depending on the rejection class.
 *
 * Phase 2's corridor home (CH1) doesn't exist yet, so the approved
 * CTA presently routes back to / (welcome). Once CH1 ships this
 * becomes router.replace("/(app)/corridor").
 */

export default function AdmitOutcomeScreen() {
  const router = useRouter();
  const markAdmitApproved = useSession((s) => s.markAdmitApproved);

  const status = useQuery({
    queryKey: ["verification.status"],
    queryFn: () => services.verification.status(),
  });

  const admit = status.data?.admit;
  const isApproved = admit?.state === "approved";
  const isRejected = admit?.state === "rejected";

  useEffect(() => {
    if (isApproved) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      markAdmitApproved();
    } else if (isRejected) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [isApproved, isRejected, markAdmitApproved]);

  if (!admit) {
    return <LoadingScreen label="Checking decision" />;
  }

  if (isApproved) {
    return (
      <Screen
        footer={
          <Button
            label="Open my corridor"
            onPress={() => router.replace("/(app)/corridor")}
            size="lg"
          />
        }
      >
        <StepHeader label="Step 6 of 6" step={5} showBack={false} />

        <Pill dot variant="primary">
          You&apos;re verified
        </Pill>

        <View style={styles.headingBlock}>
          <Heading level="h2" accent="three checks done.">
            You&apos;re in —
          </Heading>
        </View>

        <Text style={[typography.body, styles.subhead]}>
          Phone, identity, admit. Your corridor is ready, but DMs only open
          once 60 verified students share your home-city + destination +
          intake. We&apos;ll ping you the moment that lands.
        </Text>

        <View style={styles.summaryCard}>
          <SummaryRow label="Phone OTP" value="Verified" complete />
          <SummaryRow label="DigiLocker Aadhaar" value="Verified" complete />
          <SummaryRow label="Admit letter" value="Approved" complete />
        </View>

        <Text style={[typography.caption, styles.footnote]}>
          Welcome to the corridor.
        </Text>
      </Screen>
    );
  }

  // Rejected
  const reason =
    admit.state === "rejected" ? admit.reason : "Unknown reason.";
  const canResubmit = admit.state === "rejected" ? admit.canResubmit : false;

  return (
    <Screen
      footer={
        <View style={styles.footerCol}>
          {canResubmit ? (
            <Button
              label="Re-upload admit letter"
              onPress={() => router.replace("/onboarding/admit-upload")}
              size="lg"
            />
          ) : (
            <Button
              label="Talk to a human"
              onPress={() => router.replace("/")}
              size="lg"
            />
          )}
          <Button
            label="Back to home"
            variant="secondary"
            onPress={() => router.replace("/")}
            size="md"
          />
        </View>
      }
    >
      <StepHeader label="Step 6 of 6" step={5} showBack={false} />

      <Pill variant="neutral">Review came back</Pill>

      <View style={styles.headingBlock}>
        <Heading level="h2" accent="here's what's missing.">
          Almost there —
        </Heading>
      </View>

      <Text style={[typography.body, styles.subhead]}>
        Our reviewer flagged the following on your submission. No mark on
        your record — verification is built so you can re-try without losing
        anything.
      </Text>

      <View style={styles.reasonCard}>
        <Text style={[typography.mono, styles.reasonLabel]}>
          Reviewer note
        </Text>
        <Text style={typography.body}>{reason}</Text>
      </View>

      <Text style={[typography.caption, styles.footnote]}>
        {canResubmit
          ? "Re-upload the corrected file. Most resubmissions clear in under 24 hours."
          : "We'll route you to a named advisor who can sort this out manually within 4 hours."}
      </Text>
    </Screen>
  );
}

function SummaryRow({
  label,
  value,
  complete = false,
}: {
  label: string;
  value: string;
  complete?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <View
        style={[
          styles.summaryDot,
          complete ? styles.summaryDotOn : styles.summaryDotOff,
        ]}
      />
      <Text style={typography.body}>{label}</Text>
      <View style={{ flex: 1 }} />
      <Text
        style={[
          typography.bodyStrong,
          { color: complete ? theme.colors.primary : theme.colors.fgMuted },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headingBlock: { marginTop: theme.spacing[4] },
  subhead: {
    marginTop: theme.spacing[3],
    marginBottom: theme.spacing[8],
  },
  summaryCard: {
    gap: theme.spacing[4],
    paddingVertical: theme.spacing[6],
    paddingHorizontal: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: primaryTint(0.06),
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  summaryDotOn: { backgroundColor: theme.colors.primary },
  summaryDotOff: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  reasonCard: {
    padding: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.warning,
    backgroundColor: "rgba(244, 183, 64, 0.05)",
    gap: theme.spacing[2],
  },
  reasonLabel: {
    color: theme.colors.warning,
  },
  footnote: {
    marginTop: theme.spacing[6],
  },
  footerCol: {
    gap: theme.spacing[2],
  },
});
