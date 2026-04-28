import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Heading } from "@/components/Heading";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { StepHeader } from "@/components/StepHeader";
import { theme, typography } from "@/theme";
import { services, type AdmitStatus } from "@/lib/services";
import { ADMIT_REVIEW_SLA_HOURS } from "@nexgen-connect/shared";

/**
 * O10 Admit pending — the holding screen between upload and review
 * decision. Polls /verification/status every 8 seconds; once the
 * server flips to approved or rejected, advances to O11. The polling
 * cadence is conservative because the decision is a 48h human SLA in
 * production — fast polling here is just for the mock's auto-flip
 * after 30s.
 *
 * Two affordances on this screen:
 *   1. "Carry on for now" — primary CTA, takes the user to the
 *      corridor preview surface even before approval lands. Phase 1
 *      treats the corridor as held and DM-locked until admit
 *      approves; this lets users explore the empty corridor home and
 *      see the trust mechanics for themselves.
 *   2. "Edit submission" — secondary, takes them back to upload.
 *      Used if they realised they sent the wrong file.
 */

export default function AdmitPendingScreen() {
  const router = useRouter();
  const [now, setNow] = useState(Date.now());

  const status = useQuery({
    queryKey: ["verification.status"],
    queryFn: () => services.verification.status(),
    refetchInterval: 8_000,
  });

  // Update relative-time display every second.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Advance to O11 once review lands.
  useEffect(() => {
    const admit = status.data?.admit;
    if (!admit) return;
    if (admit.state === "approved" || admit.state === "rejected") {
      router.replace("/onboarding/admit-outcome");
    }
  }, [status.data, router]);

  const admit: AdmitStatus | undefined = status.data?.admit;
  const queuePosition =
    admit && admit.state === "pending" ? admit.queuePosition : undefined;
  const reviewBy =
    admit && admit.state === "pending" ? admit.reviewBy : undefined;

  return (
    <Screen
      footer={
        <View style={styles.footerCol}>
          <Button
            label="Carry on for now"
            onPress={() => router.replace("/")}
            size="lg"
          />
          <Button
            label="Edit submission"
            variant="secondary"
            onPress={() => router.replace("/onboarding/admit-upload")}
            size="md"
          />
        </View>
      }
    >
      <StepHeader label="Step 5 of 6" step={4} showBack={false} />

      <Pill dot variant="primary">
        Submitted · pending review
      </Pill>

      <View style={styles.headingBlock}>
        <Heading level="h2" accent="reads it next.">
          A real human
        </Heading>
      </View>

      <Text style={[typography.body, styles.subhead]}>
        We&apos;ve received your admit letter and routed it to a Trust &amp;
        Safety reviewer. They&apos;ll come back to you within{" "}
        <Text style={typography.bodyStrong}>{ADMIT_REVIEW_SLA_HOURS} hours</Text>.
      </Text>

      <View style={styles.statusCard}>
        <StatusRow label="Queue position" value={queuePosition?.toString() ?? "—"} />
        <StatusRow
          label="Decision by"
          value={reviewBy ? formatRelative(reviewBy, now) : "calculating…"}
        />
        <StatusRow label="On breach" value="₹100 credit + fast-path review" tone="primary" />
      </View>

      <Text style={[typography.caption, styles.footnote]}>
        We&apos;ll push a notification the moment the decision lands. The
        PDF is deleted from our servers within 60 minutes of the decision.
      </Text>
    </Screen>
  );
}

function StatusRow({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "primary";
}) {
  return (
    <View style={styles.row}>
      <Text style={[typography.mono, styles.rowLabel]}>{label}</Text>
      <Text
        style={[
          typography.bodyStrong,
          tone === "primary" && { color: theme.colors.primary },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function formatRelative(iso: string, now: number): string {
  const ms = new Date(iso).getTime() - now;
  if (ms <= 0) return "any moment now";
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  if (hours >= 24) return `~${Math.round(hours / 24)} day(s)`;
  if (hours >= 1) return `~${hours}h ${minutes}m`;
  return `~${minutes}m`;
}

const styles = StyleSheet.create({
  headingBlock: { marginTop: theme.spacing[4] },
  subhead: {
    marginTop: theme.spacing[3],
    marginBottom: theme.spacing[8],
  },
  statusCard: {
    gap: theme.spacing[4],
    paddingVertical: theme.spacing[6],
    paddingHorizontal: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  row: { gap: theme.spacing[1] },
  rowLabel: { color: theme.colors.fgSubtle },
  footnote: {
    marginTop: theme.spacing[6],
  },
  footerCol: {
    gap: theme.spacing[2],
  },
});
