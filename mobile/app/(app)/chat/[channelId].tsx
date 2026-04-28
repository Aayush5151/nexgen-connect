import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar } from "@/components/Avatar";
import { theme, typography, primaryTint } from "@/theme";
import { services } from "@/lib/services";
import type { Channel, Message } from "@/lib/services";

/**
 * CT2 Channel chat — the actual chat surface. Bottom-up stack of
 * messages, system prompts visually distinct from member messages,
 * compose dock at the foot.
 *
 * Phase 2 minimum:
 *   - Read messages (polling every 5s in mock; Realtime websocket
 *     in real impl).
 *   - Send a message (optimistic insert; rollback on error).
 *   - Show a "DMs unlock at 60" notice if the corridor channel is
 *     viewed before unlock — compose stays disabled.
 *   - Inline header with channel title + back chevron + report
 *     affordance (T&S touch-point: any channel can be reported).
 */

export default function ChannelChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { channelId } = useLocalSearchParams<{ channelId: string }>();
  const qc = useQueryClient();

  const channels = useQuery({
    queryKey: ["chat.listChannels"],
    queryFn: () => services.chat.listChannels(),
  });
  // Source of truth for "is the corridor unlocked yet?" is the
  // corridor service, NOT a string parse of the channel subtitle.
  // Earlier draft used `channel.subtitle.includes("of 60 verified")`
  // which silently broke if the subtitle format ever changed.
  const corridor = useQuery({
    queryKey: ["corridor.me"],
    queryFn: () => services.corridor.me(),
  });
  const messages = useQuery({
    queryKey: ["chat.getMessages", channelId],
    queryFn: () => services.chat.getMessages({ channelId: String(channelId) }),
    refetchInterval: 5_000,
    enabled: Boolean(channelId),
  });

  const channel = channels.data?.find((c) => c.id === channelId);
  const isCorridorLocked =
    channel?.kind === "corridor" && corridor.data?.unlocked === false;

  const send = useMutation({
    mutationFn: (body: string) =>
      services.chat.sendMessage({ channelId: String(channelId), body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat.getMessages", channelId] });
      qc.invalidateQueries({ queryKey: ["chat.listChannels"] });
    },
  });

  const [draft, setDraft] = useState("");
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    if ((messages.data ?? []).length > 0) {
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: false }));
    }
  }, [messages.data]);

  const onSend = () => {
    const text = draft.trim();
    if (!text || isCorridorLocked) return;
    setDraft("");
    send.mutate(text);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.5 }]}
          accessibilityLabel="Back to chat list"
          accessibilityRole="button"
        >
          <Text style={styles.backChevron}>←</Text>
        </Pressable>

        <View style={styles.headerMeta}>
          <Text style={typography.bodyStrong} numberOfLines={1}>
            {channel?.title ?? "Loading…"}
          </Text>
          {channel?.subtitle ? (
            <Text style={[typography.caption]} numberOfLines={1}>
              {channel.subtitle}
            </Text>
          ) : null}
        </View>

        <Pressable
          onPress={() =>
            router.push({
              pathname: "/(app)/profile/report",
              params: {
                channelId: String(channelId),
                channelTitle: channel?.title ?? "",
              },
            })
          }
          hitSlop={12}
          style={({ pressed }) => [styles.reportButton, pressed && { opacity: 0.5 }]}
          accessibilityLabel={`Report ${channel?.title ?? "this conversation"}`}
          accessibilityRole="button"
        >
          <Text style={[typography.mono, { color: theme.colors.fgSubtle }]}>REPORT</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={insets.bottom + 60}
      >
        <FlatList
          ref={listRef}
          data={messages.data ?? []}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <MessageRow item={item} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={typography.body}>
                {isCorridorLocked
                  ? "Group DMs unlock when 60 verified students share this corridor."
                  : "No messages yet. Start the thread."}
              </Text>
            </View>
          }
        />

        {isCorridorLocked ? (
          <View style={styles.lockedNotice}>
            <View style={styles.lockedDot} />
            <Text style={typography.caption}>
              Compose locked until 60 verified. Sub-circles are open now.
            </Text>
          </View>
        ) : (
          <View style={[styles.composeDock, { paddingBottom: insets.bottom + 8 }]}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Write a message"
              placeholderTextColor={theme.colors.fgPlaceholder}
              style={styles.composeInput}
              multiline
              maxLength={1000}
            />
            <Pressable
              onPress={onSend}
              disabled={!draft.trim() || send.isPending}
              hitSlop={6}
              style={({ pressed }) => [
                styles.sendButton,
                (!draft.trim() || send.isPending) && { opacity: 0.4 },
                pressed && { opacity: 0.6 },
              ]}
              accessibilityLabel="Send message"
              accessibilityRole="button"
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

function MessageRow({ item }: { item: Message }) {
  if (item.isSystemPrompt) {
    return (
      <View style={styles.systemRow}>
        <View style={styles.systemPill}>
          <Text style={[typography.mono, { color: theme.colors.primary }]}>NEXGEN</Text>
        </View>
        <Text style={[typography.body, styles.systemBody]}>{item.body}</Text>
      </View>
    );
  }

  const sentAt = new Date(item.sentAt);
  const time = `${pad(sentAt.getHours())}:${pad(sentAt.getMinutes())}`;

  return (
    <View
      style={[
        styles.msgRow,
        item.isYou ? styles.msgRowYou : styles.msgRowOther,
      ]}
    >
      {!item.isYou ? (
        <Avatar initials={item.authorInitials} size="sm" />
      ) : null}
      <View style={item.isYou ? styles.bubbleYou : styles.bubbleOther}>
        {!item.isYou ? (
          <Text style={[typography.caption, styles.author]}>{item.authorName}</Text>
        ) : null}
        <Text
          style={[
            typography.body,
            { color: item.isYou ? theme.colors.primaryFg : theme.colors.fg },
          ]}
        >
          {item.body}
        </Text>
        <Text
          style={[
            typography.caption,
            styles.bubbleTime,
            { color: item.isYou ? "rgba(0, 0, 0, 0.5)" : theme.colors.fgSubtle },
          ]}
        >
          {time}
        </Text>
      </View>
    </View>
  );
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing[3],
  },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  backChevron: { color: theme.colors.fg, fontSize: 22, lineHeight: 22 },
  headerMeta: { flex: 1, gap: 1 },
  reportButton: { padding: theme.spacing[2] },
  body: { flex: 1 },
  list: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[4],
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[8],
  },
  systemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing[3],
    marginBottom: theme.spacing[5],
    padding: theme.spacing[3],
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: primaryTint(0.04),
  },
  systemPill: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  systemBody: { flex: 1 },
  msgRow: {
    flexDirection: "row",
    gap: theme.spacing[2],
    marginBottom: theme.spacing[3],
  },
  msgRowYou: { justifyContent: "flex-end" },
  msgRowOther: { justifyContent: "flex-start" },
  bubbleOther: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    maxWidth: "80%",
    gap: 2,
  },
  bubbleYou: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    maxWidth: "80%",
    gap: 2,
  },
  author: { color: theme.colors.fgSubtle },
  bubbleTime: { fontSize: 10, marginTop: 2 },
  lockedNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    padding: theme.spacing[4],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  lockedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.warning,
  },
  composeDock: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.spacing[2],
    padding: theme.spacing[3],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.bg,
  },
  composeInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    color: theme.colors.fg,
    fontFamily: theme.fontFamily.body,
    fontSize: 15,
  },
  sendButton: {
    height: 44,
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: {
    color: theme.colors.primaryFg,
    fontFamily: theme.fontFamily.body,
    fontWeight: "600",
  },
});
