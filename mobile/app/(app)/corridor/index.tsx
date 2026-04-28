import { StyleSheet, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Heading } from "@/components/Heading";
import { Pill } from "@/components/Pill";
import { Avatar } from "@/components/Avatar";
import { Hairline } from "@/components/Hairline";
import { LoadingScreen } from "@/components/LoadingScreen";
import { theme, typography, primaryTint } from "@/theme";
import { services, devTools } from "@/lib/services";
import type { SubCircle } from "@/lib/services";

/**
 * CH1 Corridor home — the post-auth landing surface. Two states
 * driven by `corridor.unlocked`:
 *
 *   LOCKED  (verifiedCount < 60)
 *     - Big progress card: "47 of 60 verified"
 *     - Live activity strip: last 6 verified avatars
 *     - 4 sub-circle tiles (housing / airport / food / roommates) —
 *       opt-in pre-unlock so worry-shaped conversations start early
 *     - Quiet "what unlocks at 60" explainer
 *
 *   UNLOCKED (verifiedCount >= 60)
 *     - "Live for X hours" pill at the top
 *     - Same sub-circles but now joinable freely
 *     - Pivot CTA: "Open chat" → /(app)/chat
 *
 * Dev shortcut: long-press the heading to flip lock state via
 * devTools (mock only). Not visible in production.
 */

const SUB_CIRCLE_LABEL: Record<SubCircle["topic"], string> = {
  housing: "Housing",
  airport: "Airport to Dublin",
  food: "Food + dietary",
  roommates: "Roommates",
};

const SUB_CIRCLE_PROMPT: Record<SubCircle["topic"], string> = {
  housing: "What your parents asked you to figure out.",
  airport: "Same arrival window? Pair up for the ride.",
  food: "Jain, kosher, Halal, paneer — coordinate before you fly.",
  roommates: "Sleep schedules, deal-breakers, lease window.",
};

export default function CorridorHomeScreen() {
  const router = useRouter();
  const qc = useQueryClient();

  const corridor = useQuery({
    queryKey: ["corridor.me"],
    queryFn: () => services.corridor.me(),
    refetchInterval: 30_000,
  });
  const members = useQuery({
    queryKey: ["corridor.members"],
    queryFn: () => services.corridor.members(),
  });
  const subCircles = useQuery({
    queryKey: ["corridor.subCircles"],
    queryFn: () => services.corridor.subCircles(),
  });

  const toggle = useMutation({
    mutationFn: (subCircleId: string) =>
      services.corridor.toggleSubCircle({ subCircleId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["corridor.subCircles"] }),
  });

  const onDevToggle = () => {
    if (!__DEV__) return;
    if (corridor.data?.unlocked) {
      devTools.relockCorridor();
    } else {
      devTools.unlockCorridor();
    }
    qc.invalidateQueries({ queryKey: ["corridor.me"] });
  };

  const unlocked = corridor.data?.unlocked ?? false;
  const count = corridor.data?.verifiedCount ?? 0;
  const threshold = corridor.data?.unlockThreshold ?? 60;
  const progress = Math.min(1, count / threshold);

  // First-paint loading: show spinner until the corridor query lands.
  // Members + sub-circles loading in the background is OK — corridor
  // is the source of truth for the locked/unlocked layout above.
  if (corridor.isLoading && !corridor.data) {
    return <LoadingScreen label="Loading your corridor" />;
  }

  return (
    <Screen
      scroll
      footer={
        unlocked ? (
          <Pressable
            onPress={() => router.push("/(app)/chat")}
            accessibilityRole="button"
            accessibilityLabel="Open corridor chat"
            style={({ pressed }) => [
              styles.unlockedCta,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[typography.buttonLabel, { color: theme.colors.primaryFg }]}>
              Open corridor chat
            </Text>
          </Pressable>
        ) : null
      }
    >
      {/* Sticky-ish header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          {unlocked ? (
            <Pill dot variant="primary">
              Live · {timeAgo(corridor.data?.unlockedAt ?? null)}
            </Pill>
          ) : (
            <Pill variant="neutral">Building · {count} of {threshold} verified</Pill>
          )}

          <View style={{ marginTop: theme.spacing[3] }}>
            <Pressable onLongPress={onDevToggle} delayLongPress={600}>
              <Heading level="h2">
                {corridor.data?.homeCity ?? "Pune"} → {corridor.data?.destination ?? "Dublin"}
              </Heading>
            </Pressable>
            <Text style={[typography.body, { marginTop: theme.spacing[1] }]}>
              {corridor.data?.intakeMonth ?? "September 2026"}
            </Text>
          </View>
        </View>
      </View>

      {/* Progress card */}
      {!unlocked ? (
        <View style={styles.progressCard}>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={typography.caption}>
              <Text style={typography.bodyStrong}>{threshold - count}</Text>{" "}
              more to unlock group DMs
            </Text>
            <Text style={typography.caption}>
              <Text style={typography.bodyStrong}>{count}</Text> verified
            </Text>
          </View>
        </View>
      ) : null}

      {/* CH4 Day-1 prompt — surfaces only when corridor JUST unlocked AND
          the user hasn't picked a sub-circle yet. The §3.7a synchronous
          fanout moment: "Pick where to start, six-person sub-circles
          form from there." Dismisses itself the moment any sub-circle
          gets joined. */}
      {unlocked && (subCircles.data ?? []).every((s) => !s.joined) ? (
        <View style={styles.day1Card}>
          <Text style={[typography.mono, styles.day1Kicker]}>
            Day 1 · pick where to start
          </Text>
          <Text style={[typography.bodyStrong, styles.day1Heading]}>
            Four worry-shaped circles. Six people each. Tap one to land.
          </Text>
          <Text style={typography.caption}>
            The first hour is the hardest. Pick the worry that's loudest
            in your head and say one thing.
          </Text>
        </View>
      ) : null}

      {/* Activity feed link */}
      <Pressable
        onPress={() => router.push("/(app)/corridor/activity")}
        accessibilityRole="button"
        accessibilityLabel="Open activity feed"
        accessibilityHint="Verifications and sub-circle pulse"
        style={({ pressed }) => [styles.activityLink, pressed && { opacity: 0.6 }]}
      >
        <View style={styles.activityDot} />
        <View style={{ flex: 1 }}>
          <Text style={typography.bodyStrong}>Activity feed</Text>
          <Text style={typography.caption}>
            Verifications + sub-circle pulse · live
          </Text>
        </View>
        <Text style={[typography.bodyStrong, { color: theme.colors.fgSubtle }]}>›</Text>
      </Pressable>

      {/* Member preview strip */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={typography.mono}>Verified · last {Math.min(6, members.data?.length ?? 0)}</Text>
          <Pressable
            onPress={() => router.push("/(app)/corridor/members")}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="See all verified members"
          >
            <Text style={[typography.bodyStrong, { color: theme.colors.primary }]}>
              See all
            </Text>
          </Pressable>
        </View>

        <View style={styles.avatarStrip}>
          {(members.data ?? []).slice(0, 6).map((m) => (
            <Pressable
              key={m.id}
              style={styles.avatarTile}
              accessibilityRole="button"
              accessibilityLabel={`${m.name}, verified ${m.uni}`}
            >
              <Avatar initials={m.initials} size="md" tone="primary" />
              <Text
                style={[typography.caption, styles.avatarName]}
                numberOfLines={1}
              >
                {m.name.split(" ")[0]}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Hairline />

      {/* Sub-circles */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={typography.mono}>Sub-circles · pre-unlock</Text>
        </View>
        <Text style={[typography.body, styles.sectionIntro]}>
          Worry-shaped conversations that start before the corridor unlocks.
          Six per circle. You can join more than one.
        </Text>

        <View style={styles.subCircleGrid}>
          {(subCircles.data ?? []).map((sc) => (
            <Pressable
              key={sc.id}
              onPress={() => toggle.mutate(sc.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: sc.joined }}
              accessibilityLabel={`${SUB_CIRCLE_LABEL[sc.topic]} sub-circle, ${sc.count} ${sc.count === 1 ? "person" : "people"}`}
              accessibilityHint={
                sc.joined
                  ? "Double tap to leave"
                  : "Double tap to join"
              }
              style={({ pressed }) => [
                styles.subCircleCard,
                sc.joined && styles.subCircleCardJoined,
                pressed && { opacity: 0.6 },
              ]}
            >
              <View style={styles.subCircleHeader}>
                <Text style={[typography.bodyStrong, { color: theme.colors.fg }]}>
                  {SUB_CIRCLE_LABEL[sc.topic]}
                </Text>
                {sc.joined ? (
                  <View style={styles.subCircleBadge}>
                    <Text style={styles.subCircleBadgeText}>JOINED</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[typography.caption, styles.subCirclePrompt]}>
                {SUB_CIRCLE_PROMPT[sc.topic]}
              </Text>
              <View style={styles.subCircleFooter}>
                <Text style={typography.caption}>
                  {sc.count} {sc.count === 1 ? "person" : "people"} · last
                  active {timeAgo(sc.lastActivityAt)}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {!unlocked ? (
        <>
          <Hairline />
          <View style={styles.unlockExplainer}>
            <Text style={[typography.mono, { color: theme.colors.primary }]}>
              What unlocks at {threshold}
            </Text>
            <UnlockBullet text="Group DMs across all 60 verified students." />
            <UnlockBullet text="Uni subgroups auto-spawn for any HEI with 20+ verified." />
            <UnlockBullet text="Day-1 prompt seeds a thread within seconds." />
            <UnlockBullet text="Roommate clusters form from sub-circles." />
          </View>
        </>
      ) : null}

      {__DEV__ ? (
        <View style={styles.devNote}>
          <Text style={typography.caption}>
            Long-press the heading to flip lock state.
          </Text>
        </View>
      ) : null}
    </Screen>
  );
}

function UnlockBullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <Text style={[typography.body, styles.bulletText]}>{text}</Text>
    </View>
  );
}

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  const sec = Math.max(0, Math.floor(ms / 1000));
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing[6],
  },
  progressCard: {
    padding: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: primaryTint(0.04),
    gap: theme.spacing[3],
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.borderStrong,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    backgroundColor: theme.colors.primary,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  section: {
    marginTop: theme.spacing[8],
    marginBottom: theme.spacing[4],
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing[4],
  },
  sectionIntro: {
    marginBottom: theme.spacing[5],
  },
  avatarStrip: {
    flexDirection: "row",
    gap: theme.spacing[3],
  },
  avatarTile: {
    alignItems: "center",
    gap: theme.spacing[2],
    width: 50,
  },
  avatarName: {
    color: theme.colors.fgMuted,
  },
  subCircleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[3],
  },
  subCircleCard: {
    flexBasis: "48%",
    flexGrow: 1,
    padding: theme.spacing[4],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing[2],
    minHeight: 120,
  },
  subCircleCardJoined: {
    borderColor: theme.colors.primary,
    backgroundColor: primaryTint(0.05),
  },
  subCircleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subCircleBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  subCircleBadgeText: {
    color: theme.colors.primaryFg,
    fontSize: 9,
    fontWeight: "700",
    fontFamily: theme.fontFamily.mono,
    letterSpacing: 0.8,
  },
  subCirclePrompt: {
    color: theme.colors.fgMuted,
  },
  subCircleFooter: {
    marginTop: "auto",
  },
  unlockExplainer: {
    marginTop: theme.spacing[8],
    padding: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing[3],
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing[3],
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
    marginTop: 9,
  },
  bulletText: { flex: 1 },
  unlockedCta: {
    height: 60,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  day1Card: {
    marginTop: theme.spacing[5],
    padding: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: primaryTint(0.06),
    gap: theme.spacing[2],
  },
  day1Kicker: {
    color: theme.colors.primary,
  },
  day1Heading: {
    fontSize: 17,
    lineHeight: 24,
    marginVertical: theme.spacing[2],
  },
  activityLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    marginTop: theme.spacing[5],
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  devNote: {
    marginTop: theme.spacing[8],
    padding: theme.spacing[3],
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.colors.border,
  },
});
