import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Heading } from "@/components/Heading";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { StepHeader } from "@/components/StepHeader";
import { theme, typography } from "@/theme";
import type { DigiLockerFailureReason } from "@/lib/services";

/**
 * O7a/b/c/d Fallback — single screen, four reasons, route-param
 * driven. Each reason maps to a hold window (S27 7d, S28 14d, S29
 * 21d, S30 silent fix per Mobile Plan §4.2.2-§4.2.5) and a specific
 * remediation path. UI surfaces:
 *   - the human reason (no jargon, no error codes)
 *   - the hold-window so the user knows their slot is reserved
 *   - the next concrete action they can take today
 *   - an alternate "skip to admit-letter review" path so verification
 *     never feels stuck.
 *
 * For every reason we route to /onboarding/admit-intro on continue —
 * admit-letter review is the universal failover. The hold window is
 * configured server-side and surfaced here for transparency.
 */

type FallbackContent = {
  pill: string;
  heading: string;
  accent: string;
  body: string;
  hold: string;
  remediation: { title: string; steps: string[] };
};

const CONTENT: Record<DigiLockerFailureReason, FallbackContent> = {
  aadhaar_not_linked: {
    pill: "Aadhaar not linked",
    heading: "Aadhaar isn't linked",
    accent: "to your phone yet.",
    body: "DigiLocker couldn't reach a verified Aadhaar against this mobile. Roughly 2.4% of users see this. Your spot is held.",
    hold: "Held for 7 days",
    remediation: {
      title: "Two paths forward",
      steps: [
        "Link your Aadhaar to your current mobile via mAadhaar (~10 min).",
        "Or skip to admit-letter review — we'll verify identity through your university's letter.",
      ],
    },
  },
  mobile_changed: {
    pill: "Mobile recently changed",
    heading: "Mobile number",
    accent: "recently changed.",
    body: "Looks like the Aadhaar-linked mobile is different from the one you signed up with. Your spot is held while we sort this.",
    hold: "Held for 14 days",
    remediation: {
      title: "Two paths forward",
      steps: [
        "Update your Aadhaar-linked mobile via the UIDAI portal (~24h to propagate).",
        "Or skip to admit-letter review and continue on the held-spot path.",
      ],
    },
  },
  deactivated: {
    pill: "DigiLocker deactivated",
    heading: "DigiLocker account",
    accent: "needs reactivation.",
    body: "UIDAI flagged the linked DigiLocker account as deactivated. This usually means inactivity or a duplicate-account merge. Your spot is held.",
    hold: "Held for 21 days",
    remediation: {
      title: "Three paths forward",
      steps: [
        "Reactivate via digilocker.gov.in (~5 min via Aadhaar OTP).",
        "Open a fresh DigiLocker if reactivation fails.",
        "Or skip to admit-letter review and continue on the held-spot path.",
      ],
    },
  },
  invisible_character: {
    pill: "Name match issue",
    heading: "Your Aadhaar name",
    accent: "has a hidden character.",
    body: "DigiLocker returned a name that doesn't match the one on your admit letter byte-for-byte — usually an invisible Unicode character introduced during data entry. Our team will fix this silently.",
    hold: "Resolved silently — usually within 24h",
    remediation: {
      title: "What you can do",
      steps: [
        "Nothing for now — we're fixing this on our side.",
        "We'll ping you the moment your verification is unblocked.",
        "If you want to skip the wait, jump to admit-letter review now.",
      ],
    },
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
        <View style={styles.footerCol}>
          <Button
            label="Skip to admit-letter review"
            onPress={() => router.replace("/onboarding/admit-intro")}
            size="lg"
          />
          <Button
            label="Try DigiLocker again"
            variant="secondary"
            onPress={() => router.replace("/onboarding/digilocker")}
            size="md"
          />
        </View>
      }
    >
      <StepHeader label="Step 3 of 6" step={2} showBack={false} />

      <Pill variant="neutral">{content.pill}</Pill>

      <View style={styles.headingBlock}>
        <Heading level="h2" accent={content.accent}>
          {content.heading}
        </Heading>
      </View>

      <Text style={[typography.body, styles.subhead]}>{content.body}</Text>

      <View style={styles.holdCard}>
        <Text style={[typography.mono, styles.holdLabel]}>Spot status</Text>
        <Text style={typography.bodyStrong}>{content.hold}</Text>
      </View>

      <View style={styles.remediationCard}>
        <Text style={[typography.mono, styles.remediationLabel]}>
          {content.remediation.title}
        </Text>
        {content.remediation.steps.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{i + 1}</Text>
            </View>
            <Text style={[typography.body, styles.stepText]}>{step}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headingBlock: { marginTop: theme.spacing[4] },
  subhead: {
    marginTop: theme.spacing[3],
    marginBottom: theme.spacing[6],
  },
  holdCard: {
    padding: theme.spacing[4],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(0, 220, 130, 0.06)",
    gap: theme.spacing[1],
    marginBottom: theme.spacing[4],
  },
  holdLabel: {
    color: theme.colors.primary,
  },
  remediationCard: {
    padding: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing[3],
  },
  remediationLabel: {
    color: theme.colors.fgSubtle,
    marginBottom: theme.spacing[2],
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing[3],
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  stepNumberText: {
    color: theme.colors.primaryFg,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: theme.fontFamily.mono,
  },
  stepText: {
    flex: 1,
  },
  footerCol: {
    gap: theme.spacing[2],
  },
});
