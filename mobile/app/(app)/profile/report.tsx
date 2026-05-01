import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { StepHeader } from "@/components/StepHeader";
import { CardSurface } from "@/components/CardSurface";
import { IconChip } from "@/components/IconChip";
import { KickerLabel } from "@/components/KickerLabel";
import { BigStat } from "@/components/BigStat";
import { theme, typography } from "@/theme";
import { services, type ReportInput } from "@/lib/services";
import { track, trackScreen } from "@/lib/analytics";
import { offlineQueue } from "@/lib/offline";

/**
 * TS1 Report. Redesign: hero + 4 category tiles + textarea + SLA
 * grid card. Confirmation as a celebration check screen.
 */

const CATEGORIES: {
  key: string;
  glyph: string;
  label: string;
  sub: string;
}[] = [
  { key: "harassment", glyph: "🛡", label: "Harassment", sub: "DMs · channels" },
  { key: "scam", glyph: "⚠", label: "Scam / fake", sub: "Off-platform $ · agent" },
  { key: "imminent", glyph: "🆘", label: "Imminent harm", sub: "30-min outreach" },
  { key: "other", glyph: "·", label: "Something else", sub: "In your words" },
];

export default function ReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    channelId?: string;
    channelTitle?: string;
    messageId?: string;
    /** HN1 triage pre-fill (v6 §3.4 / Q3). One of "harassment" / "scam"
     *  / "hard_time" / "other" — matches HN1's TriageCategory union. */
    category?: string;
  }>();

  // v6 §15 / Q3 — read pre-fill category from HN1 triage route param.
  const initialCategory =
    typeof params.category === "string" && params.category.length > 0
      ? params.category
      : "harassment";
  const [category, setCategory] = useState<string>(initialCategory);
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState<{
    id: string;
    eta: string;
    ack: string;
  } | null>(null);

  useEffect(() => {
    trackScreen("ts1_report");
  }, []);

  const submit = useMutation({
    mutationFn: (input: ReportInput) => services.trustSafety.report(input),
    onSuccess: (r) => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      track({
        name: "ts_report_filed",
        properties: { category, channelId: params.channelId },
      });
      setSubmitted({
        id: r.reportId,
        eta: r.firstResponseBy,
        ack: r.ackText,
      });
    },
    onError: () => {
      // v6 §15 offline branch — queue the report for replay when network
      // returns. T&S advisor SLA timer starts from enqueue ts.
      void offlineQueue.enqueue("trustSafety.report", {
        category,
        reason: reason.trim(),
        channelId: params.channelId,
        messageId: params.messageId,
      });
    },
  });

  const onSubmit = () => {
    if (!reason.trim()) return;
    submit.mutate({
      reason: `[${category}] ${reason.trim()}`,
      context: {
        channelId: params.channelId,
        messageId: params.messageId,
      },
    });
  };

  if (submitted) {
    return (
      <Screen
        footer={
          <View style={{ gap: theme.spacing[2] }}>
            <Button
              label="Track this report"
              onPress={() =>
                router.replace({
                  pathname: "/(app)/profile/report-status",
                  params: { reportId: submitted.id },
                })
              }
              size="lg"
              variant="glow"
            />
            <Button
              label="Back to profile"
              onPress={() => router.back()}
              variant="ghost"
              size="md"
            />
          </View>
        }
      >
        <StepHeader label="Submitted" step={0} total={1} showBack={false} />

        <View style={styles.celebrate}>
          <IconChip glyph="✓" tone="primary" size="lg" />
        </View>

        <Hero
          title="Routed."
          accent="A human is on it."
          align="center"
          size="lg"
          style={styles.heroBlock}
        />

        <CardSurface variant="accent" rail style={styles.confirmCard}>
          <KickerLabel tone="primary">Report ID</KickerLabel>
          <Text style={styles.reportId}>{submitted.id}</Text>
          <View style={{ marginTop: theme.spacing[3] }}>
            <KickerLabel tone="muted">First response by</KickerLabel>
            <Text style={[typography.bodyStrong, { marginTop: 4 }]}>{submitted.eta}</Text>
          </View>
          <Text style={[typography.caption, { marginTop: theme.spacing[3] }]}>{submitted.ack}</Text>
        </CardSurface>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <Button
          label="Submit report"
          onPress={onSubmit}
          loading={submit.isPending}
          disabled={!reason.trim()}
          size="lg"
        />
      }
    >
      <StepHeader label="Report" step={0} total={1} />

      <Hero title="Tell us." accent="A human reads this." size="lg" />

      {params.channelTitle ? (
        <View style={{ marginTop: theme.spacing[5] }}>
          <Pill variant="subtle">From: {params.channelTitle}</Pill>
        </View>
      ) : null}

      <View style={styles.section}>
        <KickerLabel tone="muted">What happened?</KickerLabel>
        <View style={styles.catGrid}>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c.key}
              onPress={() => setCategory(c.key)}
              style={({ pressed }) => [
                styles.catTile,
                category === c.key && styles.catTileActive,
                pressed && { opacity: 0.6 },
              ]}
            >
              <IconChip
                glyph={c.glyph}
                tone={c.key === "imminent" ? "danger" : category === c.key ? "primary" : "default"}
                size="sm"
              />
              <View style={{ flex: 1 }}>
                <Text style={typography.bodyStrong}>{c.label}</Text>
                <Text style={typography.caption}>{c.sub}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <KickerLabel tone="muted">In your words</KickerLabel>
        <TextInput
          value={reason}
          onChangeText={setReason}
          placeholder="What did you see? What worried you?"
          placeholderTextColor={theme.colors.fgPlaceholder}
          multiline
          maxLength={1000}
          style={styles.textarea}
        />
      </View>

      <View style={styles.slaRow}>
        <CardSurface variant="default" style={styles.slaCard}>
          <BigStat value="4" label="Hours · biz" size="md" />
        </CardSurface>
        <CardSurface variant="default" style={styles.slaCard}>
          <BigStat value="1" label="Hour · prem" size="md" />
        </CardSurface>
        <CardSurface variant="warning" rail style={styles.slaCard}>
          <BigStat value="30" label="Min · imm" size="md" />
        </CardSurface>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: theme.spacing[6],
    gap: theme.spacing[3],
  },
  catGrid: {
    gap: theme.spacing[2],
  },
  catTile: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    padding: theme.spacing[4],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  catTileActive: {
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(0,220,130,0.05)",
  },
  textarea: {
    minHeight: 120,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    color: theme.colors.fg,
    fontFamily: theme.fontFamily.body,
    fontSize: 15,
    textAlignVertical: "top",
  },
  slaRow: {
    flexDirection: "row",
    gap: theme.spacing[2],
    marginTop: theme.spacing[6],
  },
  slaCard: {
    flex: 1,
  },
  celebrate: {
    alignItems: "center",
    marginTop: theme.spacing[8],
    marginBottom: theme.spacing[4],
  },
  heroBlock: {
    marginBottom: theme.spacing[6],
  },
  confirmCard: {
    gap: theme.spacing[1],
  },
  reportId: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 18,
    color: theme.colors.fg,
    letterSpacing: 1.2,
    marginTop: 4,
  },
});
