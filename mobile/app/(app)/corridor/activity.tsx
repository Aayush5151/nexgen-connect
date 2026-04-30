import { FlatList, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { Avatar } from "@/components/Avatar";
import { StepHeader } from "@/components/StepHeader";
import { LoadingScreen } from "@/components/LoadingScreen";
import { IconChip } from "@/components/IconChip";
import { KickerLabel } from "@/components/KickerLabel";
import { theme, typography } from "@/theme";
import { services } from "@/lib/services";
import type { CorridorMember, SubCircle } from "@/lib/services";

/**
 * CH5 Activity feed. Redesign: hero + grouped event rows with
 * IconChip-led visual hierarchy. Mono timestamps as right chips.
 */

type ActivityEvent =
  | { kind: "verified"; timestamp: string; member: CorridorMember }
  | { kind: "subcircle_active"; timestamp: string; subCircle: SubCircle };

const TOPIC_GLYPH: Record<SubCircle["topic"], string> = {
  housing: "🏠",
  airport: "✈",
  food: "🍴",
  roommates: "🤝",
};

const TOPIC_LABEL: Record<SubCircle["topic"], string> = {
  housing: "Housing",
  airport: "Airport",
  food: "Food",
  roommates: "Roommates",
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
      <StepHeader label={`${events.length} events`} step={0} total={1} />
      <Hero title="Pulse." accent="Live." size="lg" />

      <View style={styles.kickerRow}>
        <KickerLabel tone="primary" dot pulse>
          Streaming
        </KickerLabel>
      </View>

      <FlatList
        data={events}
        keyExtractor={(e, i) => `${e.kind}_${i}`}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={[typography.body, { marginTop: theme.spacing[8] }]}>Quiet for now.</Text>
        }
        renderItem={({ item }) => <EventRow item={item} />}
      />
    </Screen>
  );
}

function buildEvents(members: CorridorMember[], subCircles: SubCircle[]): ActivityEvent[] {
  const recentVerifications: ActivityEvent[] = members.slice(0, 8).map((m) => ({
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
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

function EventRow({ item }: { item: ActivityEvent }) {
  if (item.kind === "verified") {
    const m = item.member;
    return (
      <View style={styles.row}>
        <Avatar initials={m.initials} size="sm" tone="primary" />
        <View style={styles.body}>
          <Text style={typography.body}>
            <Text style={typography.bodyStrong}>{m.name.split(" ")[0]}</Text> verified
          </Text>
          <Text style={typography.caption}>{m.uni}</Text>
        </View>
        <Text style={styles.timeChip}>{relativeTime(item.timestamp)}</Text>
      </View>
    );
  }

  const sc = item.subCircle;
  return (
    <View style={styles.row}>
      <IconChip glyph={TOPIC_GLYPH[sc.topic]} tone="primary" size="sm" />
      <View style={styles.body}>
        <Text style={typography.body}>
          <Text style={typography.bodyStrong}>{TOPIC_LABEL[sc.topic]}</Text> picking up
        </Text>
        <Text style={typography.caption}>{sc.count} members active</Text>
      </View>
      <Text style={styles.timeChip}>{relativeTime(item.timestamp)}</Text>
    </View>
  );
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "now";
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  return `${Math.floor(hr / 24)}d`;
}

const styles = StyleSheet.create({
  kickerRow: {
    marginTop: theme.spacing[5],
    marginBottom: theme.spacing[3],
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
  body: { flex: 1, gap: 2 },
  timeChip: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 11,
    color: theme.colors.fgSubtle,
    letterSpacing: 0.6,
  },
});
