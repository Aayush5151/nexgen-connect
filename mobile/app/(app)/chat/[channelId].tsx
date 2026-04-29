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
import { MessageBubble } from "@/components/MessageBubble";
import { KickerLabel } from "@/components/KickerLabel";
import { CardSurface } from "@/components/CardSurface";
import { CrisisCard } from "@/components/CrisisCard";
import { theme, typography } from "@/theme";
import { services } from "@/lib/services";
import type { Message } from "@/lib/services";

/**
 * Crisis-keyword classifier (MH16). A tiny client-side list — the
 * production version runs server-side with iCall-reviewed thresholds
 * (BP §16.18). Match means we surface the CrisisCard inline; user
 * can dismiss (48h suppression) or call iCall directly.
 */
const CRISIS_KEYWORDS = [
  "kill myself",
  "want to die",
  "end it all",
  "no point",
  "can't go on",
  "hurt myself",
  "suicide",
  "give up",
];

function detectCrisis(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((k) => lower.includes(k));
}

/**
 * CT2 Channel chat. Redesign: Telegram-style header (compact), big
 * primary send button on the compose dock, message bubbles via the
 * shared MessageBubble component, locked-channel inline banner.
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
  // MH-A surface: appears when keyword classifier fires on the
  // *outgoing* draft. Dismiss = 48h suppression in production
  // (mocked here as a session-scoped flag).
  const [crisisVisible, setCrisisVisible] = useState(false);
  const [crisisSuppressed, setCrisisSuppressed] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  // CT3 first-message coaching banner — show on DM channels until
  // the user has sent at least one message there.
  const isDM = channel?.kind === "dm";
  const youSentSomething = (messages.data ?? []).some((m) => m.isYou);
  const showFirstMessageCoaching = isDM && !youSentSomething;

  useEffect(() => {
    if ((messages.data ?? []).length > 0) {
      requestAnimationFrame(() =>
        listRef.current?.scrollToEnd({ animated: false }),
      );
    }
  }, [messages.data]);

  const onSend = () => {
    const text = draft.trim();
    if (!text || isCorridorLocked) return;
    // Crisis classifier: trip the MH-A surface BEFORE sending. The
    // user can still send by tapping "I'm okay, thanks" first.
    if (!crisisSuppressed && detectCrisis(text)) {
      setCrisisVisible(true);
      return;
    }
    setDraft("");
    send.mutate(text);
  };

  const onDismissCrisis = () => {
    setCrisisVisible(false);
    setCrisisSuppressed(true);
  };

  // Detect consecutive same-author messages to suppress repeated avatars.
  const list = messages.data ?? [];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [
            styles.backButton,
            pressed && { opacity: 0.5 },
          ]}
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
          style={({ pressed }) => [
            styles.reportButton,
            pressed && { opacity: 0.5 },
          ]}
        >
          <KickerLabel tone="muted">Report</KickerLabel>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={insets.bottom + 60}
      >
        <FlatList
          ref={listRef}
          data={list}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => {
            const prev = list[index - 1];
            const showAvatar =
              !item.isSystemPrompt &&
              !item.isYou &&
              (!prev ||
                prev.isSystemPrompt ||
                prev.authorInitials !== item.authorInitials);
            const sentAt = new Date(item.sentAt);
            const time = `${pad(sentAt.getHours())}:${pad(
              sentAt.getMinutes(),
            )}`;
            if (item.isSystemPrompt) {
              return <MessageBubble variant="system" text={item.body} />;
            }
            if (item.isYou) {
              return (
                <MessageBubble
                  variant="mine"
                  text={item.body}
                  time={time}
                />
              );
            }
            return (
              <MessageBubble
                variant="other"
                text={item.body}
                initials={item.authorInitials}
                authorName={showAvatar ? item.authorName : undefined}
                showAvatar={showAvatar}
                time={time}
              />
            );
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text
                style={[
                  typography.body,
                  { textAlign: "center", color: theme.colors.fgSubtle },
                ]}
              >
                {isCorridorLocked
                  ? "DMs unlock at 60 verified."
                  : "Start the thread."}
              </Text>
            </View>
          }
        />

        {/* CT3 first-message coaching banner — shows on DM threads
            until the user sends one message. Prevents off-platform
            contact-info exchange before trust forms (BP §5.4). */}
        {showFirstMessageCoaching ? (
          <CardSurface variant="default" rail style={styles.coachBanner}>
            <KickerLabel tone="primary" dot>
              Before you share
            </KickerLabel>
            <Text style={[typography.caption, { marginTop: 4 }]}>
              Don't share contact info before you trust them. Long-press any
              message to report.
            </Text>
          </CardSurface>
        ) : null}

        {/* MH-A crisis card — surfaces in-line when keyword classifier
            fires on the user's outgoing draft. */}
        {crisisVisible ? (
          <View style={styles.crisisWrap}>
            <CrisisCard onDismiss={onDismissCrisis} />
          </View>
        ) : null}

        {isCorridorLocked ? (
          <CardSurface variant="warning" rail style={styles.lockedNotice}>
            <KickerLabel tone="warning" dot pulse>
              Locked · until 60
            </KickerLabel>
            <Text style={[typography.caption, { marginTop: 4 }]}>
              Sub-circles are open. Find your worry.
            </Text>
          </CardSurface>
        ) : (
          <View
            style={[styles.composeDock, { paddingBottom: insets.bottom + 8 }]}
          >
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
            >
              <Text style={styles.sendButtonText}>↑</Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
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
  lockedNotice: {
    margin: theme.spacing[4],
  },
  coachBanner: {
    marginHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[3],
  },
  crisisWrap: {
    marginHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[3],
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
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    color: theme.colors.fg,
    fontFamily: theme.fontFamily.body,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: {
    color: theme.colors.primaryFg,
    fontSize: 22,
    fontWeight: "700",
  },
});
