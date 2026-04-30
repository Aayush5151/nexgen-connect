import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { track, trackScreen } from "@/lib/analytics";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { Avatar } from "@/components/Avatar";
import { LoadingScreen } from "@/components/LoadingScreen";
import { IconChip } from "@/components/IconChip";
import { Pill } from "@/components/Pill";
import { theme, typography } from "@/theme";
import { services } from "@/lib/services";
import type { Channel } from "@/lib/services";

/**
 * CT1 Chat list. Redesign: hero header + 4 kind-glyph rows. Bigger
 * avatars (44px), bolder unread badges with mono numerals.
 */

const KIND_LABEL: Record<Channel["kind"], string> = {
  corridor: "Corridor",
  uni: "Uni",
  subcircle: "Sub-circle",
  dm: "Direct",
};

const KIND_GLYPH: Record<Channel["kind"], string> = {
  corridor: "🌐",
  uni: "🎓",
  subcircle: "○",
  dm: "→",
};

export default function ChannelListScreen() {
  const router = useRouter();

  useEffect(() => {
    trackScreen("ct1_chat_list");
    track({ name: "chat_opened" });
  }, []);

  const channels = useQuery({
    queryKey: ["chat.listChannels"],
    queryFn: () => services.chat.listChannels(),
    refetchInterval: 15_000,
  });

  const totalUnread = channels.data?.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0) ?? 0;

  if (channels.isLoading && !channels.data) {
    return <LoadingScreen label="Loading channels" />;
  }

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <Hero title="Threads." accent="Built from your corridor." size="lg" />
        {totalUnread > 0 ? (
          <View style={{ marginTop: theme.spacing[4] }}>
            <Pill dot variant="primary">
              {totalUnread} unread
            </Pill>
          </View>
        ) : null}
      </View>

      <FlatList
        data={channels.data ?? []}
        keyExtractor={(c) => c.id}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={typography.body}>
              No channels yet. They appear as your corridor grows.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ChannelRow
            item={item}
            onPress={() =>
              router.push({
                pathname: "/(app)/chat/[channelId]",
                params: { channelId: item.id },
              })
            }
          />
        )}
      />
    </Screen>
  );
}

function ChannelRow({ item, onPress }: { item: Channel; onPress: () => void }) {
  const isDM = item.kind === "dm";
  const isCorridor = item.kind === "corridor";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.leading}>
        {isDM ? (
          <Avatar initials={initialsFor(item)} size="md" tone="primary" />
        ) : (
          <IconChip
            glyph={KIND_GLYPH[item.kind]}
            tone={isCorridor ? "primary" : "default"}
            size="md"
          />
        )}
        {item.unreadCount > 0 ? <View style={styles.dotIndicator} /> : null}
      </View>

      <View style={styles.meta}>
        <View style={styles.metaTop}>
          <Text style={typography.bodyStrong} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.timeChip}>{relativeTime(item.lastMessageAt)}</Text>
        </View>
        <View style={styles.metaBottom}>
          <Text style={[styles.kicker]} numberOfLines={1}>
            {KIND_LABEL[item.kind]}
          </Text>
          <Text style={[typography.caption, styles.preview]} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        </View>
      </View>

      {item.unreadCount > 0 ? (
        <View style={styles.unread}>
          <Text style={styles.unreadText}>{item.unreadCount}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function initialsFor(c: Channel): string {
  const parts = c.title.split(" ");
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
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
  header: {
    paddingBottom: theme.spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  list: {
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[10],
  },
  sep: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: 56,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    paddingVertical: theme.spacing[3],
  },
  rowPressed: {
    backgroundColor: theme.colors.surface,
  },
  leading: {
    position: "relative",
  },
  dotIndicator: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
    borderWidth: 2,
    borderColor: theme.colors.bg,
  },
  meta: { flex: 1, gap: 2 },
  metaTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing[2],
  },
  metaBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    marginTop: 2,
  },
  kicker: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    color: theme.colors.fgSubtle,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  preview: {
    flex: 1,
    color: theme.colors.fgMuted,
  },
  timeChip: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 11,
    color: theme.colors.fgSubtle,
    letterSpacing: 0.6,
  },
  unread: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: theme.spacing[2],
  },
  unreadText: {
    color: theme.colors.primaryFg,
    fontSize: 11,
    fontWeight: "700",
    fontFamily: theme.fontFamily.mono,
  },
  empty: {
    paddingVertical: theme.spacing[10],
    alignItems: "center",
  },
});
