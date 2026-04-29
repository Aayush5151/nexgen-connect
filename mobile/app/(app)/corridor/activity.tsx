import { FlatList, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Heading } from "@/components/Heading";
import { Avatar } from "@/components/Avatar";
import { StepHeader } from "@/components/StepHeader";
import { LoadingScreen } from "@/components/LoadingScreen";
import { theme, typography, primaryTint } from "@/theme";
import { services } from "@/lib/services";
import type { CorridorMember, SubCircle } from "@/lib/services";

/**
 * CH5 Activity feed — chronological pulse of the corridor:
 * verifications + sub-circle activity + chat heat. Reads like a soft
 * Twitter feed but never re-renders chats inline (those live in the
 * Chat tab). Three event kinds:
 *
 *   - "Verified just now" — a new corridor member.
 *   - "Sub-circle picking up" — sub-circle has new members in the
 *     last hour.
 *   - "Day-1 prompt seeded" — system event when a sub-circle hits 4+
 *     members (unlocks the roommate-cluster mechanic).
 *
 * Activity is derived client-side from corridor.members + subCircles
 * — no separate event endpoint in Phase 2 mock. Real impl will
 * stream events from Supabase Realtime.
 */

type ActivityEvent =
  | {
      kind: "verified";
      timestamp: string;
      member: CorridorMember;
    }
  | {
      kind: "subcircle_active";
      timestamp: string;
      subCircle: SubCircle;
    };

export default function ActivityFeedScreen() {
  const members = useQuery({
    queryKey: ["corridor.members"],
    queryFn: () => services.corridor.members(),
  });
  const subCircles = useQuery({
    queryKey: ["corridor.subCircles"],
    queryFn: () => services.corridor.subCircles(),
  });

  const events = buildEvents(members.data ?? [], subCircles.data ?? []);

  if ((members.isLoading && !members.data) || (subCircles.isLoading && !subCircles.data)) {
    return <LoadingScreen label="Loading activity" />;
  }

  return (
    <Screen scroll={false}>
      <StepHeader label="Live · pulse of the corridor" step={0} total={1} />
      <Heading level="h2">Activity</Heading>
      <Text style={[typography.body, styles.subhead]}>
        Verifications and sub-circle pulse. Chat lives in the Chat tab.
      </Text>

      <FlatList
        data={events}
        keyExtractor={(e, i) => `${e.kind}_${i}`}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={typography.body}>
            Nothing happening yet. Refresh in a few minutes.
          </Text>
        }
        renderItem={({ item }) => <EventRow item={item} />}
      />
    </Screen>
  );
}

function buildEvents(
  members: CorridorMember[],
  subCircles: SubCircle[],
): ActivityEvent[] {
  const recentVerifications: ActivityEvent[] = members
    .slice(0, 8)
    .map((m) => ({
      kind: "verified" as const,
      timestamp: m.verifiedAt,
      member: m,
    }));

  const subActivity: ActivityEvent[] = subCircles
    .filter((sc) => sc.count >= 4)
    .map((sc) => ({
      kind: "subcircle_active" as const,
      timestamp: sc.lastActivityAt,
      subCircle: sc,
    }));

  return [...recentVerifications, ...subActivity].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

function EventRow({ item }: { item: ActivityEvent }) {
  if (item.kind === "verified") {
    const m = item.member;
    return (
      <View style={styles.row}>
        <Avatar initials={m.initials} size="sm" tone="primary" />
        <View style={{ flex: 1 }}>
          <Text style={typography.body}>
            <Text style={typography.bodyStrong}>{m.name.split(" ")[0]}</Text>{" "}
            verified · {m.uni}
          </Text>
          <Text style={typography.caption}>{relativeTime(item.timestamp)}</Text>
        </View>
      </View>
    );
  }

  // subcircle_active
  const topicLabel: Record<SubCircle["topic"], string> = {
    housing: "Housing",
    airport: "Airport to Dublin",
    food: "Food + dietary",
    roommates: "Roommates",
  };

  const sc = item.subCircle;
  return (
    <View style={styles.row}>
      <View style={styles.activityIcon}>
        <Text style={styles.activityIconText}>↑</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={typography.body}>
          <Text style={typography.bodyStrong}>{topicLabel[sc.topic]}</Text>{" "}
          sub-circle picking up — {sc.count} active
        </Text>
        <Text style={typography.caption}>{relativeTime(item.timestamp)}</Text>
      </View>
    </View>
  );
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

const styles = StyleSheet.create({
  subhead: {
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[6],
  },
  list: {
    paddingBottom: theme.spacing[10],
  },
  sep: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    paddingVertical: theme.spacing[4],
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: primaryTint(0.08),
    alignItems: "center",
    justifyContent: "center",
  },
  activityIconText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});
