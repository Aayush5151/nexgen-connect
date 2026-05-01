import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { Avatar } from "@/components/Avatar";
import { StepHeader } from "@/components/StepHeader";
import { LoadingScreen } from "@/components/LoadingScreen";
import { KickerLabel } from "@/components/KickerLabel";
import { Pill } from "@/components/Pill";
import { theme, typography } from "@/theme";
import { services } from "@/lib/services";
import type { CorridorMember } from "@/lib/services";

/**
 * G2 Member list. Redesign: hero header + search input + clean
 * row layout with hairline separators. No call-to-action — staying
 * quiet by design.
 */

export default function MembersScreen() {
  const [q, setQ] = useState("");
  const members = useQuery({
    queryKey: ["corridor.members"],
    queryFn: () => services.corridor.members(),
  });

  const filtered = useMemo(() => {
    const list = members.data ?? [];
    if (!q.trim()) return list;
    const needle = q.trim().toLowerCase();
    return list.filter(
      (m) => m.name.toLowerCase().includes(needle) || m.uni.toLowerCase().includes(needle)
    );
  }, [members.data, q]);

  if (members.isLoading && !members.data) {
    return <LoadingScreen label="Loading verified members" />;
  }

  return (
    <Screen scroll={false}>
      <StepHeader label={`${members.data?.length ?? 0} verified`} step={0} total={1} />

      <Hero title="The corridor." accent="Quiet on purpose." size="lg" />

      <View style={styles.searchWrap}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search name or uni"
          placeholderTextColor={theme.colors.fgPlaceholder}
          style={styles.search}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.kickerRow}>
        <KickerLabel tone="muted">
          {filtered.length} {filtered.length === 1 ? "person" : "people"}
        </KickerLabel>
        <Pill variant="subtle">Last names hidden</Pill>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(m) => m.id}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <MemberRow item={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={typography.body}>
              No matches. <Text style={typography.bodyStrong}>Try a different name.</Text>
            </Text>
          </View>
        }
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
        <View style={styles.nameRow}>
          <Text style={typography.bodyStrong}>
            {firstName} {lastInitial ? lastInitial + "." : ""}
          </Text>
          {item.isYou ? (
            <View style={styles.youBadge}>
              <Text style={styles.youText}>YOU</Text>
            </View>
          ) : null}
        </View>
        <Text style={typography.caption}>{item.uni}</Text>
      </View>
      <Text style={styles.timeChip}>{timeAgo(item.verifiedAt)}</Text>
    </View>
  );
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "now";
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  return `${Math.floor(hr / 24)}d`;
}

const styles = StyleSheet.create({
  searchWrap: {
    marginTop: theme.spacing[6],
  },
  search: {
    height: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing[4],
    color: theme.colors.fg,
    fontFamily: theme.fontFamily.body,
    fontSize: 16,
  },
  kickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    gap: theme.spacing[4],
    paddingVertical: theme.spacing[4],
  },
  meta: { flex: 1, gap: 2 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  youBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  youText: {
    color: theme.colors.primaryFg,
    fontSize: 9,
    fontWeight: "700",
    fontFamily: theme.fontFamily.mono,
    letterSpacing: 0.8,
  },
  timeChip: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 11,
    color: theme.colors.fgSubtle,
    letterSpacing: 0.6,
  },
  empty: {
    paddingVertical: theme.spacing[10],
    alignItems: "center",
  },
});
