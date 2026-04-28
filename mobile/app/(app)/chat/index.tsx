import { Pressable, StyleSheet, Text, View, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Heading } from "@/components/Heading";
import { Avatar } from "@/components/Avatar";
import { LoadingScreen } from "@/components/LoadingScreen";
import { theme, typography } from "@/theme";
import { services } from "@/lib/services";
import type { Channel } from "@/lib/services";

/**
 * CT1 Channel list — the chat tab home. Four channel kinds:
 *
 *   corridor   — The full verified group. Locked until 60.
 *   uni        — Auto-spawned uni subgroup once 20+ at the same HEI.
 *   subcircle  — Worry-shaped sub-circle (housing / airport / etc.)
 *   dm         — 1:1 conversation with another verified member.
 *
 * Each row shows: initials chip, title, last message preview,
 * relative time, unread count. Row press → /(app)/chat/[channelId].
 */

const KIND_KICKER: Record<Channel["kind"], string> = {
  corridor: "Corridor",
  uni: "Uni subgroup",
  subcircle: "Sub-circle",
  dm: "Direct message",
};

export default function ChannelListScreen() {
  const router = useRouter();
  const channels = useQuery({
    queryKey: ["chat.listChannels"],
    queryFn: () => services.chat.listChannels(),
    refetchInterval: 15_000,
  });

  if (channels.isLoading && !channels.data) {
    return <LoadingScreen label="Loading channels" />;
  }

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <Heading level="h2">Chat</Heading>
        <Text style={[typography.caption, styles.subhead]}>
          Threads built from your verified corridor — uni groups, sub-circles,
          direct messages.
        </Text>
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

function ChannelRow({
  item,
  onPress,
}: {
  item: Channel;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${KIND_KICKER[item.kind]} channel: ${item.title}`}
      accessibilityHint={
        item.unreadCount > 0
          ? `${item.unreadCount} unread`
          : `Last activity ${relativeTime(item.lastMessageAt)} ago`
      }
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Avatar
        initials={initialsFor(item)}
        size="md"
        tone={item.kind === "corridor" ? "primary" : "default"}
      />

      <View style={styles.meta}>
        <View style={styles.metaTop}>
          <Text style={[typography.mono, styles.kicker]} numberOfLines={1}>
            {KIND_KICKER[item.kind]}
          </Text>
          <Text style={typography.caption}>{relativeTime(item.lastMessageAt)}</Text>
        </View>
        <Text style={typography.bodyStrong} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={typography.caption} numberOfLines={1}>
          {item.lastMessage}
        </Text>
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
  if (c.kind === "dm") {
    const parts = c.title.split(" ");
    return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  }
  if (c.kind === "corridor") return "CR";
  if (c.kind === "uni") return c.title.slice(0, 2).toUpperCase();
  return c.title.slice(0, 2).toUpperCase();
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "just now";
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
  subhead: {
    marginTop: theme.spacing[2],
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
  meta: { flex: 1, gap: 2 },
  metaTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  kicker: {
    color: theme.colors.fgSubtle,
    flex: 1,
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
