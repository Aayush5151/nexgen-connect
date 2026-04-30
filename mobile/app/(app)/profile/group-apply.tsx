import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import type { GroupApplySubmission } from "@/lib/services";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { Avatar } from "@/components/Avatar";
import { StepHeader } from "@/components/StepHeader";
import { CardSurface } from "@/components/CardSurface";
import { IconChip } from "@/components/IconChip";
import { KickerLabel } from "@/components/KickerLabel";
import { BigStat } from "@/components/BigStat";
import { theme, typography } from "@/theme";
import { services } from "@/lib/services";
import { trackScreen } from "@/lib/analytics";

/**
 * GA1-4 Group-apply housing. Redesign: hero + visual phase
 * timeline + member rail + partner card. Each phase reads as a
 * clean dashboard, not a wall of text.
 */

export default function GroupApplyScreen() {
  const router = useRouter();
  const qc = useQueryClient();

  useEffect(() => {
    trackScreen("ga1_group_apply");
  }, []);

  const cluster = useQuery({
    queryKey: ["groupApply.myCluster"],
    queryFn: () => services.groupApply.myCluster(),
    refetchInterval: 8_000,
  });

  const form = useMutation({
    mutationFn: () => services.groupApply.formCluster(),
    onSuccess: () => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      qc.invalidateQueries({ queryKey: ["groupApply.myCluster"] });
    },
  });

  // Capture the submit-mutation result so we can surface trackingRef +
  // respondBy on the SUBMITTED phase. The cluster type itself doesn't
  // hold these — they live on the GroupApplySubmission record.
  const [submission, setSubmission] = useState<GroupApplySubmission | null>(null);

  const submit = useMutation({
    mutationFn: (clusterId: string) => services.groupApply.submit({ clusterId }),
    onSuccess: (result) => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSubmission(result);
      qc.invalidateQueries({ queryKey: ["groupApply.myCluster"] });
    },
  });

  const leave = useMutation({
    mutationFn: (clusterId: string) => services.groupApply.leaveCluster({ clusterId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groupApply.myCluster"] }),
  });

  const onLeave = (clusterId: string) => {
    Alert.alert("Leave the cluster?", "Verified roommates stay. You can re-form any time.", [
      { text: "Stay", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: () => leave.mutate(clusterId),
      },
    ]);
  };

  const data = cluster.data;

  /* INTRO */
  if (!data) {
    return (
      <Screen
        footer={
          <Button
            label="Form a cluster"
            onPress={() => form.mutate()}
            loading={form.isPending}
            size="lg"
            variant="primary"
          />
        }
      >
        <StepHeader label="Premium · group-apply" step={0} total={4} />

        <Pill variant="primary" dot>
          3–6 students · one app
        </Pill>

        <Hero title="Roommates, bundled." accent="One signature." size="lg" style={styles.hero} />

        <View style={styles.timeline}>
          <TimelineRow n="1" title="We pull verified roommates" sub="From your sub-circle" />
          <TimelineRow n="2" title="Both sides re-confirm" sub="Aadhaar + admit" />
          <TimelineRow n="3" title="One signed app" sub="To the PBSA partner" last />
        </View>

        <CardSurface variant="default" rail style={styles.contractCard}>
          <KickerLabel tone="primary">No money flows through us</KickerLabel>
          <Text style={[typography.body, { marginTop: theme.spacing[2] }]}>
            Deposits go directly to the partner. Either side can opt out before submit.
          </Text>
        </CardSurface>
      </Screen>
    );
  }

  /* FORMING */
  if (data.phase === "forming") {
    return (
      <Screen
        footer={
          <View style={{ gap: theme.spacing[2] }}>
            <Button
              label="Submit cluster"
              onPress={() => submit.mutate(data.id)}
              loading={submit.isPending}
              size="lg"
              variant="primary"
            />
            <Button
              label="Leave cluster"
              variant="tertiary"
              onPress={() => onLeave(data.id)}
              size="md"
            />
          </View>
        }
      >
        <StepHeader label="Phase 2 of 4 · forming" step={1} total={4} />

        <Pill variant="primary" dot>
          Cluster · ready
        </Pill>

        <Hero title="The cluster." accent="Locked in." size="lg" style={styles.hero} />

        <CardSurface variant="accent" rail style={styles.partnerCard}>
          <KickerLabel tone="primary">Partner</KickerLabel>
          <Text style={[typography.bodyStrong, styles.partnerName]}>
            {data.partner ?? "aparto · Binary Hub"}
          </Text>
          <Text style={typography.caption}>{data.city ?? "Dublin"}</Text>
        </CardSurface>

        <View style={styles.section}>
          <KickerLabel tone="muted">{data.members.length} members</KickerLabel>
          <View style={styles.memberRail}>
            {data.members.map((m) => (
              <View key={m.id} style={styles.memberTile}>
                <Avatar initials={m.initials} size="md" tone="primary" />
                <Text style={typography.bodyStrong} numberOfLines={1}>
                  {m.firstName}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <CardSurface variant="default" style={styles.safetyCard}>
          <KickerLabel tone="muted">Safety</KickerLabel>
          <SafetyRow text="Both sides re-confirm Aadhaar + admit." />
          <SafetyRow text="No NexGen money flow. Direct to partner." />
          <SafetyRow text="Either side opts out before submit." />
        </CardSurface>
      </Screen>
    );
  }

  /* SUBMITTED */
  if (data.phase === "submitted") {
    return (
      <Screen
        footer={
          <Button
            label="Back to profile"
            variant="secondary"
            onPress={() => router.back()}
            size="lg"
          />
        }
      >
        <StepHeader label="Phase 3 of 4 · submitted" step={2} total={4} />

        <Pill variant="warning" dot>
          With the partner
        </Pill>

        <Hero title="In their hands." accent="Tracking live." size="lg" style={styles.hero} />

        <CardSurface variant="warning" rail style={styles.refCard}>
          <KickerLabel tone="warning">Ref</KickerLabel>
          <Text style={styles.refValue}>{submission?.trackingRef ?? "—"}</Text>
          <Text style={[typography.caption, { marginTop: theme.spacing[2] }]}>
            Response by {submission?.respondBy ? formatDate(submission.respondBy) : "—"}
          </Text>
        </CardSurface>
      </Screen>
    );
  }

  /* ACCEPTED */
  if (data.phase === "accepted") {
    return (
      <Screen
        footer={
          <Button
            label="Open in chat"
            onPress={() => router.push("/(app)/chat")}
            size="lg"
            variant="primary"
          />
        }
      >
        <StepHeader label="Phase 4 of 4 · accepted" step={3} total={4} />

        <View style={styles.celebrate}>
          <IconChip glyph="✓" tone="primary" size="lg" />
        </View>

        <View style={{ alignItems: "center" }}>
          <Pill dot variant="primary">
            Booked
          </Pill>
        </View>

        <Hero
          title="You're in."
          accent="Move-in window set."
          size="xl"
          align="center"
          style={styles.hero}
        />

        <CardSurface variant="accent" rail style={styles.moveCard}>
          <KickerLabel tone="primary">Move-in</KickerLabel>
          <BigStat
            value={data.moveInDate ? formatDate(data.moveInDate) : "Sept 2026"}
            label="Date"
            accent
            size="md"
            style={{ marginTop: theme.spacing[2] }}
          />
        </CardSurface>
      </Screen>
    );
  }

  /* DECLINED */
  return (
    <Screen
      footer={
        <Button
          label="Re-form a cluster"
          onPress={() => form.mutate()}
          loading={form.isPending}
          size="lg"
        />
      }
    >
      <StepHeader label="Cluster declined" step={0} total={4} />

      <Pill variant="warning" dot>
        Declined · re-cluster ready
      </Pill>

      <Hero title="Not this time." accent="One reason." size="lg" style={styles.hero} />

      <CardSurface variant="warning" rail>
        <KickerLabel tone="warning">Reason</KickerLabel>
        <Text style={[typography.body, { marginTop: theme.spacing[2] }]}>
          Capacity reached for the requested room type.
        </Text>
      </CardSurface>
    </Screen>
  );
}

function TimelineRow({
  n,
  title,
  sub,
  last,
}: {
  n: string;
  title: string;
  sub: string;
  last?: boolean;
}) {
  return (
    <View style={styles.tlRow}>
      <View style={styles.tlLeft}>
        <IconChip glyph={n} tone="primary" size="sm" />
        {last ? null : <View style={styles.tlConnector} />}
      </View>
      <View style={styles.tlBody}>
        <Text style={typography.bodyStrong}>{title}</Text>
        <Text style={[typography.caption, { marginTop: 2 }]}>{sub}</Text>
      </View>
    </View>
  );
}

function formatDate(iso: string): string {
  // Soft-fail to the raw string if Date can't parse it. Keeps the
  // UI rendering even on malformed mock data.
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function SafetyRow({ text }: { text: string }) {
  return (
    <View style={styles.safetyRow}>
      <IconChip glyph="✓" tone="primary" size="sm" />
      <Text style={[typography.body, { flex: 1 }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[6],
  },
  timeline: {
    gap: theme.spacing[1],
  },
  tlRow: {
    flexDirection: "row",
    gap: theme.spacing[4],
  },
  tlLeft: {
    width: 32,
    alignItems: "center",
  },
  tlConnector: {
    width: 1,
    flex: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 4,
  },
  tlBody: {
    flex: 1,
    paddingVertical: theme.spacing[2],
    paddingBottom: theme.spacing[5],
  },
  contractCard: {
    marginTop: theme.spacing[4],
  },
  partnerCard: {
    marginBottom: theme.spacing[5],
  },
  partnerName: {
    fontSize: 22,
    color: theme.colors.fg,
    marginTop: theme.spacing[2],
  },
  section: {
    marginBottom: theme.spacing[5],
    gap: theme.spacing[3],
  },
  memberRail: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[3],
  },
  memberTile: {
    width: 80,
    alignItems: "center",
    gap: 4,
  },
  safetyCard: {
    gap: theme.spacing[3],
  },
  safetyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
  },
  refCard: {},
  refValue: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 18,
    color: theme.colors.fg,
    letterSpacing: 1.4,
    marginTop: 4,
  },
  celebrate: {
    alignItems: "center",
    marginTop: theme.spacing[6],
    marginBottom: theme.spacing[4],
  },
  moveCard: {},
});
