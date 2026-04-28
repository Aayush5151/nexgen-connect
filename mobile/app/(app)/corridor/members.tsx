import { StyleSheet, Text, View } from "react-native";
import { FlatList } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Heading } from "@/components/Heading";
import { Avatar } from "@/components/Avatar";
import { StepHeader } from "@/components/StepHeader";
import { theme, typography } from "@/theme";
import { services } from "@/lib/services";
import type { CorridorMember } from "@/lib/services";

/**
 * G2 Member list — every verified person in the corridor, with
 * three signals per row:
 *   - initials avatar
 *   - first name (last-initial only — last names hidden until DM)
 *   - destination uni + relative time of verification
 *
 * The list is intentionally quiet — no follow buttons, no "send a
 * hello" affordance. Rapport in the corridor builds in sub-circles
 * and channels, not 1:1 from a member list.
 */

export default function MembersScreen() {
  const members = useQuery({
    queryKey: ["corridor.members"],
    queryFn: () => services.corridor.members(),
  });

  return (
    <Screen scroll={false}>
      <StepHeader label="Verified · in the corridor" step={0} total={1} />

      <Heading level="h2">Verified students</Heading>
      <Text style={[typography.body, styles.subhead]}>
        Last names stay hidden until you connect 1:1.
      </Text>

      <FlatList
        data={members.data ?? []}
        keyExtractor={(m) => m.id}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <MemberRow item={item} />}
      />
    </Screen>
  );
}

function MemberRow({ item }: { item: CorridorMember }) {
  const firstName = item.name.split(" ")[0] ?? item.name;
  const lastInitial = (item.name.split(" ")[1] ?? "")[0] ?? "";

  return (
    <View style={styles.row}>
      <Avatar initials={item.initials} size="md" tone={item.isYou ? "primary" : "default"} />
      <View style={styles.meta}>
        <Text style={typography.bodyStrong}>
          {firstName} {lastInitial ? lastInitial + "." : ""}
          {item.isYou ? "  ·  You" : ""}
        </Text>
        <Text style={typography.caption}>
          {item.uni} · verified {timeAgo(item.verifiedAt)}
        </Text>
      </View>
    </View>
  );
}

function timeAgo(iso: string): string {
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
    gap: theme.spacing[4],
    paddingVertical: theme.spacing[3],
  },
  meta: { flex: 1, gap: 2 },
});
