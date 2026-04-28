import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Screen } from "@/components/Screen";
import { Heading } from "@/components/Heading";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { Avatar } from "@/components/Avatar";
import { Hairline } from "@/components/Hairline";
import { StepHeader } from "@/components/StepHeader";
import { theme, typography, primaryTint } from "@/theme";
import { services } from "@/lib/services";

/**
 * GA1-4 Group-apply housing — single screen, four phases driven by
 * server-side `cluster.phase` plus a "no cluster yet" intro state.
 *
 *   GA1 INTRO            cluster === null
 *     - Pitch: "3 to 6 verified students, one signature flow."
 *     - "Form a cluster" → mock immediately fills with 4 verified
 *       roommate-sub-circle members.
 *
 *   GA2 FORMING          cluster.phase === "forming"
 *     - Show the 4 cluster members (initials + first name)
 *     - Show the PBSA partner (e.g. aparto · Binary Hub)
 *     - "Submit to partner" CTA + "Leave cluster" secondary
 *     - Safety contract (BP §3.7a R9): no NexGen-mediated money flow,
 *       both-sides Aadhaar + admit re-confirmed, in-app safety contract.
 *
 *   GA3 SUBMITTED        cluster.phase === "submitted"
 *     - Tracking ref, respond-by date, what happens next.
 *     - Mock auto-flips to accepted after 25s.
 *
 *   GA4 ACCEPTED         cluster.phase === "accepted"
 *     - Confirmed booking. Move-in window highlighted.
 *     - "Open in chat" → bounces to roommate-sub-circle channel.
 *
 *   GA  DECLINED         cluster.phase === "declined" (rare)
 *     - Surfaces the reason. Doesn't dead-end — offers re-cluster.
 */

export default function GroupApplyScreen() {
  const router = useRouter();
  const qc = useQueryClient();

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

  const submit = useMutation({
    mutationFn: (clusterId: string) =>
      services.groupApply.submit({ clusterId }),
    onSuccess: () => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      qc.invalidateQueries({ queryKey: ["groupApply.myCluster"] });
    },
  });

  const leave = useMutation({
    mutationFn: (clusterId: string) =>
      services.groupApply.leaveCluster({ clusterId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groupApply.myCluster"] }),
  });

  const onLeave = (clusterId: string) => {
    Alert.alert(
      "Leave the cluster?",
      "Your verified roommates stay. You can re-form a new cluster any time.",
      [
        { text: "Stay", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => leave.mutate(clusterId),
        },
      ],
    );
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
          />
        }
      >
        <StepHeader label="Premium · group-apply" step={0} total={4} />

        <Pill variant="neutral">3 to 6 students · one application</Pill>

        <View style={{ marginTop: theme.spacing[4] }}>
          <Heading level="h2" accent="one signature flow.">
            Verified roommates,
          </Heading>
        </View>

        <Text style={[typography.body, styles.subhead]}>
          Forming a cluster auto-pulls verified members from your roommate
          sub-circle. Both sides re-confirm Aadhaar + admit. The PBSA
          partner gets a single, signed application.
        </Text>

        <View style={styles.contract}>
          <ContractRow
            label="Who's eligible"
            value="Verified roommate-sub-circle members at the same destination city."
          />
          <ContractRow
            label="What we send"
            value="One application bundling 3-6 students, with names, IDs, intake."
          />
          <ContractRow
            label="What we don't"
            value="No NexGen-mediated money flow. Deposits go directly to the partner."
            tone="primary"
          />
          <ContractRow
            label="Safety contract"
            value="Both sides re-confirm before submission. Either side can opt out at any time."
          />
        </View>
      </Screen>
    );
  }

  /* FORMING */
  if (data.phase === "forming") {
    return (
      <Screen
        footer={
          <View style={styles.footerCol}>
            <Button
              label="Submit cluster to partner"
              onPress={() => submit.mutate(data.id)}
              loading={submit.isPending}
              size="lg"
            />
            <Button
              label="Leave cluster"
              variant="secondary"
              onPress={() => onLeave(data.id)}
              size="md"
            />
          </View>
        }
      >
        <StepHeader label="Step 2 of 4 · forming" step={1} total={4} />

        <Pill dot variant="primary">
          Forming · {data.members.length} of 6
        </Pill>

        <View style={{ marginTop: theme.spacing[4] }}>
          <Heading level="h2">{data.partner}</Heading>
        </View>

        <Text style={[typography.body, styles.subhead]}>
          Move-in {formatDate(data.moveInDate)} · {data.city}.
          Cluster auto-shifts to the partner once everyone re-confirms.
        </Text>

        <Text style={[typography.mono, styles.kicker]}>The cluster</Text>
        <View style={styles.membersList}>
          {data.members.map((m, i) => (
            <View key={m.id}>
              {i > 0 ? <Hairline /> : null}
              <View style={styles.memberRow}>
                <Avatar
                  initials={m.initials}
                  size="sm"
                  tone={m.firstName === "You" ? "primary" : "default"}
                />
                <View style={{ flex: 1 }}>
                  <Text style={typography.bodyStrong}>
                    {m.firstName}
                    {m.firstName === "You" ? "  ·  You" : ""}
                  </Text>
                  <Text style={typography.caption}>
                    Aadhaar verified · Admit verified · Same intake
                  </Text>
                </View>
                <View style={styles.tickDot} />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.assurance}>
          <Text style={[typography.mono, styles.assuranceLabel]}>
            What "submit" means
          </Text>
          <BulletLine text="One PDF application, signed by all 4 of you." />
          <BulletLine text="Partner responds within 72 hours." />
          <BulletLine text="No deposit released until they accept." />
          <BulletLine text="Either side can opt out before submission." />
        </View>
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
        <StepHeader label="Step 3 of 4 · submitted" step={2} total={4} />

        <Pill dot variant="primary">
          Submitted · awaiting decision
        </Pill>

        <View style={{ marginTop: theme.spacing[4] }}>
          <Heading level="h2" accent="reads it next.">
            {data.partner}
          </Heading>
        </View>

        <Text style={[typography.body, styles.subhead]}>
          Your cluster is in the partner's queue. They typically respond
          within 72 hours. We&apos;ll push you the decision the moment it
          lands.
        </Text>

        <View style={styles.statusCard}>
          <StatusRow label="Cluster size" value={`${data.members.length} students`} />
          <Hairline />
          <StatusRow label="Move-in target" value={formatDate(data.moveInDate)} />
          <Hairline />
          <StatusRow label="Decision by" value="~72 hours" tone="primary" />
        </View>

        <Text style={[typography.caption, styles.footnote]}>
          Mock auto-accepts in 25 seconds for the demo. The mock-flip
          mechanism is removed in prod where the partner's queue is real.
        </Text>
      </Screen>
    );
  }

  /* ACCEPTED */
  if (data.phase === "accepted") {
    return (
      <Screen
        footer={
          <Button
            label="Open roommate chat"
            onPress={() => router.push("/(app)/chat")}
            size="lg"
          />
        }
      >
        <StepHeader label="Step 4 of 4 · accepted" step={3} total={4} showBack={false} />

        <Pill dot variant="primary">
          Accepted · move-in confirmed
        </Pill>

        <View style={{ marginTop: theme.spacing[4] }}>
          <Heading level="h2" accent="confirmed.">
            You&apos;re housed —
          </Heading>
        </View>

        <Text style={[typography.body, styles.subhead]}>
          {data.partner} accepted your cluster. Your move-in window is{" "}
          <Text style={typography.bodyStrong}>{formatDate(data.moveInDate)}</Text>.
        </Text>

        <View style={styles.successCard}>
          <SuccessRow label="Cluster" value={`${data.members.length} verified students`} />
          <Hairline />
          <SuccessRow label="Partner" value={data.partner} />
          <Hairline />
          <SuccessRow label="City" value={data.city} />
          <Hairline />
          <SuccessRow label="Move-in" value={formatDate(data.moveInDate)} tone="primary" />
        </View>

        <Text style={[typography.caption, styles.footnote]}>
          Lease, deposit, and move-in coordination happen directly with the
          partner. Your roommate sub-circle stays open in chat for the next
          steps.
        </Text>
      </Screen>
    );
  }

  /* DECLINED — rare, but graceful */
  return (
    <Screen
      footer={
        <Button
          label="Re-cluster with a different partner"
          onPress={() => leave.mutate(data.id)}
          size="lg"
        />
      }
    >
      <StepHeader label="Cluster declined" step={3} total={4} showBack={false} />

      <Pill variant="neutral">Declined · this won&apos;t dead-end you</Pill>

      <View style={{ marginTop: theme.spacing[4] }}>
        <Heading level="h2">Partner couldn&apos;t accept</Heading>
      </View>

      <Text style={[typography.body, styles.subhead]}>
        {data.partner} couldn&apos;t take this cluster — usually a capacity
        cap. We&apos;ll re-form against a different partner. No deposit was
        ever released.
      </Text>
    </Screen>
  );
}

function ContractRow({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "primary";
}) {
  return (
    <View style={styles.contractRow}>
      <Text style={[typography.mono, { color: theme.colors.fgSubtle }]}>{label}</Text>
      <Text
        style={[
          typography.body,
          tone === "primary" && { color: theme.colors.primary },
        ]}
      >
        {value}
      </Text>
    </View>
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
    <View style={styles.statusRow}>
      <Text style={[typography.mono, { color: theme.colors.fgSubtle }]}>{label}</Text>
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

function SuccessRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "primary";
}) {
  return (
    <View style={styles.statusRow}>
      <Text style={[typography.mono, { color: theme.colors.fgSubtle }]}>{label}</Text>
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

function BulletLine({ text }: { text: string }) {
  return (
    <View style={styles.bulletLine}>
      <View style={styles.bulletDot} />
      <Text style={[typography.body, { flex: 1 }]}>{text}</Text>
    </View>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const styles = StyleSheet.create({
  subhead: {
    marginTop: theme.spacing[3],
    marginBottom: theme.spacing[6],
  },
  kicker: {
    color: theme.colors.fgSubtle,
    marginBottom: theme.spacing[3],
  },
  contract: {
    paddingVertical: theme.spacing[6],
    paddingHorizontal: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing[4],
  },
  contractRow: { gap: theme.spacing[1] },
  membersList: {
    paddingHorizontal: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing[6],
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    paddingVertical: theme.spacing[3],
  },
  tickDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  assurance: {
    padding: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: primaryTint(0.04),
    gap: theme.spacing[2],
  },
  assuranceLabel: {
    color: theme.colors.primary,
    marginBottom: theme.spacing[2],
  },
  bulletLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing[2],
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
    marginTop: 9,
  },
  statusCard: {
    paddingHorizontal: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing[4],
  },
  successCard: {
    paddingHorizontal: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: primaryTint(0.05),
  },
  footerCol: {
    gap: theme.spacing[2],
  },
  footnote: {
    marginTop: theme.spacing[6],
  },
});
