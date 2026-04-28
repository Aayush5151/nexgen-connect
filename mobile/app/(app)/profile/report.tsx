import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Screen } from "@/components/Screen";
import { Heading } from "@/components/Heading";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { Hairline } from "@/components/Hairline";
import { StepHeader } from "@/components/StepHeader";
import { theme, typography } from "@/theme";
import { services, type ReportInput } from "@/lib/services";
import {
  TS_SLA_BUSINESS_MIN,
  TS_SLA_OVERNIGHT_MIN,
  TS_SLA_PREMIUM_MIN,
  TS_SLA_IMMINENT_MIN,
} from "@nexgen-connect/shared";

/**
 * TS1 Report — the one-tap "tell us what happened" surface. Phase 1
 * touch-point for Trust & Safety; the full TS1-3 + AD4-5 admin
 * inbox + dialogue lands in Phase 4.
 *
 * The screen makes the SLA legible up front so the user knows
 * exactly when a human will reach them. We surface the four-tier
 * grade in one card so there's no ambiguity:
 *
 *   - Free, business hours IST    → 4h
 *   - Free, overnight IST          → 12h
 *   - Premium, 24/7                → 1h
 *   - Imminent harm, any tier      → 30 min
 *
 * Submit posts to services.trustSafety.report and shows the
 * confirmation surface with the report ID + first-response ETA.
 * Identity-anchored ban architecture means a banned user can't
 * sock-puppet back, which is the load-bearing reassurance for the
 * person reporting.
 */

const CATEGORIES: Array<{ key: string; label: string; sub: string }> = [
  {
    key: "harassment",
    label: "Harassment or abusive behaviour",
    sub: "DMs, channel messages, or unwelcome contact.",
  },
  {
    key: "scam",
    label: "Suspected scam or fake account",
    sub: "Off-platform money requests, fake admit, agent activity.",
  },
  {
    key: "imminent",
    label: "Imminent harm — to me or someone I know",
    sub: "Self-harm, threats, immediate-safety concerns. 30-min outreach.",
  },
  {
    key: "other",
    label: "Something else",
    sub: "Tell us in your own words.",
  },
];

export default function ReportScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<string>("harassment");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState<{ id: string; eta: string; ack: string } | null>(null);

  const submit = useMutation({
    mutationFn: (input: ReportInput) => services.trustSafety.report(input),
    onSuccess: (r) => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSubmitted({ id: r.reportId, eta: r.firstResponseBy, ack: r.ackText });
    },
  });

  const onSubmit = () => {
    if (!reason.trim()) return;
    submit.mutate({
      reason: `[${category}] ${reason.trim()}`,
    });
  };

  if (submitted) {
    return (
      <Screen
        footer={
          <Button
            label="Back to profile"
            onPress={() => router.back()}
            size="lg"
          />
        }
      >
        <StepHeader label="Report submitted" step={0} total={1} showBack={false} />

        <Pill dot variant="primary">
          Routed to a named advisor
        </Pill>

        <View style={styles.headingBlock}>
          <Heading level="h2" accent="will reach you.">
            A real human
          </Heading>
        </View>

        <Text style={[typography.body, styles.subhead]}>{submitted.ack}</Text>

        <View style={styles.confirmCard}>
          <ConfirmRow label="Report ID" value={submitted.id} mono />
          <Hairline />
          <ConfirmRow label="First-response by" value={formatLocal(submitted.eta)} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <View style={styles.footerCol}>
          <Button
            label="Send report"
            onPress={onSubmit}
            disabled={!reason.trim()}
            loading={submit.isPending}
            size="lg"
          />
          <Text style={[typography.caption, styles.footerNote]}>
            We send your report to a named Trust & Safety advisor. No bot
            triage on harassment.
          </Text>
        </View>
      }
    >
      <StepHeader label="Report a concern" step={0} total={1} />

      <Heading level="h2">Tell us what happened</Heading>
      <Text style={[typography.body, styles.subhead]}>
        Anything you share goes straight to a human. We&apos;ll respond
        within the SLA below — every tier, every time-of-day.
      </Text>

      <View style={styles.slaCard}>
        <Text style={[typography.mono, { color: theme.colors.fgSubtle, marginBottom: theme.spacing[2] }]}>
          First-response SLA
        </Text>
        <SlaRow label="Free · business IST (08:00–22:00)" mins={TS_SLA_BUSINESS_MIN} />
        <SlaRow label="Free · overnight IST" mins={TS_SLA_OVERNIGHT_MIN} />
        <SlaRow label="Premium · 24/7" mins={TS_SLA_PREMIUM_MIN} primary />
        <SlaRow label="Imminent harm · any tier" mins={TS_SLA_IMMINENT_MIN} primary />
      </View>

      <Text style={[typography.mono, styles.label]}>What kind of concern</Text>
      <View style={styles.categoryList}>
        {CATEGORIES.map((c, i) => (
          <View key={c.key}>
            {i > 0 ? <Hairline /> : null}
            <Pressable
              onPress={() => setCategory(c.key)}
              style={({ pressed }) => [
                styles.categoryRow,
                pressed && { opacity: 0.6 },
              ]}
            >
              <View
                style={[
                  styles.categoryRadio,
                  category === c.key && styles.categoryRadioActive,
                ]}
              />
              <View style={{ flex: 1 }}>
                <Text style={typography.bodyStrong}>{c.label}</Text>
                <Text style={typography.caption}>{c.sub}</Text>
              </View>
            </Pressable>
          </View>
        ))}
      </View>

      <Text style={[typography.mono, styles.label]}>What happened</Text>
      <View
        style={[
          styles.reasonInputWrap,
          reason.length > 0 && { borderColor: theme.colors.primary },
        ]}
      >
        <TextInput
          value={reason}
          onChangeText={setReason}
          multiline
          placeholder="Tell us. Names, dates, what you'd want a friend to know."
          placeholderTextColor={theme.colors.fgPlaceholder}
          style={styles.reasonInput}
          maxLength={2000}
        />
      </View>
      <Text style={[typography.caption, styles.charCount]}>
        {reason.length} / 2000
      </Text>

      <View style={styles.assurance}>
        <Text style={typography.caption}>
          Identity-tied bans mean a removed user can&apos;t come back with a
          new phone, a new email, or a new Aadhaar VID. The ban is anchored
          to a stable composite hash — see /how on the website for the full
          flow.
        </Text>
      </View>
    </Screen>
  );
}

function SlaRow({
  label,
  mins,
  primary = false,
}: {
  label: string;
  mins: number;
  primary?: boolean;
}) {
  return (
    <View style={styles.slaRow}>
      <Text style={[typography.body, primary && { color: theme.colors.primary }]}>{label}</Text>
      <Text
        style={[
          typography.bodyStrong,
          { color: primary ? theme.colors.primary : theme.colors.fg },
        ]}
      >
        {formatMinutes(mins)}
      </Text>
    </View>
  );
}

function ConfirmRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <View style={styles.confirmRow}>
      <Text style={[typography.mono, { color: theme.colors.fgSubtle }]}>{label}</Text>
      <Text
        style={[
          typography.bodyStrong,
          mono && { fontFamily: theme.fontFamily.mono, fontSize: 13 },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function formatMinutes(mins: number): string {
  if (mins >= 60) {
    const h = Math.round(mins / 60);
    return `${h}h`;
  }
  return `${mins}m`;
}

function formatLocal(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} · ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

const styles = StyleSheet.create({
  headingBlock: { marginTop: theme.spacing[4] },
  subhead: {
    marginTop: theme.spacing[3],
    marginBottom: theme.spacing[6],
  },
  slaCard: {
    padding: theme.spacing[4],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing[6],
  },
  slaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: theme.spacing[2],
  },
  label: {
    color: theme.colors.fgSubtle,
    marginBottom: theme.spacing[3],
  },
  categoryList: {
    paddingHorizontal: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing[6],
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing[3],
    paddingVertical: theme.spacing[4],
  },
  categoryRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    marginTop: 2,
  },
  categoryRadioActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  reasonInputWrap: {
    minHeight: 140,
    padding: theme.spacing[3],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  reasonInput: {
    flex: 1,
    minHeight: 120,
    color: theme.colors.fg,
    fontFamily: theme.fontFamily.body,
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: "top",
  },
  charCount: {
    marginTop: theme.spacing[2],
    textAlign: "right",
  },
  assurance: {
    marginTop: theme.spacing[6],
    padding: theme.spacing[4],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  confirmCard: {
    paddingHorizontal: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(0, 220, 130, 0.04)",
  },
  confirmRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing[4],
  },
  footerCol: {
    gap: theme.spacing[3],
  },
  footerNote: {
    textAlign: "center",
  },
});
