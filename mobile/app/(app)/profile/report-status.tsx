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
import { Pill } from "@/components/Pill";
import { LoadingScreen } from "@/components/LoadingScreen";
import { MessageBubble } from "@/components/MessageBubble";
import { KickerLabel } from "@/components/KickerLabel";
import { theme, typography } from "@/theme";
import { services } from "@/lib/services";

/**
 * TS3 Report dialogue thread. Surfaces the ongoing back-and-forth
 * between the user and a named T&S advisor about a submitted
 * report. Polls every 4s for new advisor replies. Supports
 * sending a follow-up message.
 *
 * Reads ?reportId= from the route. Falls back to a friendly state
 * if no report exists yet.
 */

type DialogueMessage = {
  id: string;
  from: "advisor" | "you" | "system";
  body: string;
  sentAt: string;
  advisorName?: string;
};

export default function ReportStatusScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reportId } = useLocalSearchParams<{ reportId?: string }>();
  const qc = useQueryClient();
  const listRef = useRef<FlatList<DialogueMessage>>(null);
  const [draft, setDraft] = useState("");

  const dialogue = useQuery({
    queryKey: ["trustSafety.dialogue", reportId],
    queryFn: () => services.trustSafety.dialogue({ reportId: String(reportId) }),
    refetchInterval: 4_000,
    enabled: Boolean(reportId),
  });

  const reply = useMutation({
    mutationFn: (body: string) =>
      services.trustSafety.replyToReport({
        reportId: String(reportId),
        body,
      }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["trustSafety.dialogue", reportId],
      });
    },
  });

  useEffect(() => {
    if ((dialogue.data?.messages ?? []).length > 0) {
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: false }));
    }
  }, [dialogue.data]);

  if (!reportId) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <Header onBack={() => router.back()} title="Report status" />
        <View style={styles.empty}>
          <Text style={typography.body}>
            No active report.{" "}
            <Text
              style={{ color: theme.colors.primary }}
              onPress={() => router.replace("/(app)/profile/report")}
            >
              File one
            </Text>
            .
          </Text>
        </View>
      </View>
    );
  }

  if (dialogue.isLoading && !dialogue.data) {
    return <LoadingScreen label="Loading conversation" />;
  }

  const messages = dialogue.data?.messages ?? [];
  const lastAdvisor = [...messages].reverse().find((m) => m.from === "advisor");

  const onSend = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    reply.mutate(text);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Header onBack={() => router.back()} title="Report status" />

      {/* Status strip */}
      <View style={styles.statusStrip}>
        <Pill dot variant="primary">
          In review
        </Pill>
        {lastAdvisor?.advisorName ? (
          <View style={styles.advisorRow}>
            <KickerLabel tone="muted">Your advisor</KickerLabel>
            <Text style={typography.bodyStrong}>{lastAdvisor.advisorName}</Text>
          </View>
        ) : null}
      </View>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={insets.bottom + 60}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const sentAt = new Date(item.sentAt);
            const time = `${pad(sentAt.getHours())}:${pad(sentAt.getMinutes())}`;
            if (item.from === "system") {
              return <MessageBubble variant="system" text={item.body} />;
            }
            if (item.from === "you") {
              return <MessageBubble variant="mine" text={item.body} time={time} />;
            }
            return (
              <MessageBubble
                variant="other"
                text={item.body}
                initials={initialsFromName(item.advisorName ?? "TS")}
                authorName={item.advisorName}
                showAvatar
                time={time}
              />
            );
          }}
        />

        <View style={[styles.composeDock, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Reply to your advisor"
            placeholderTextColor={theme.colors.fgPlaceholder}
            style={styles.composeInput}
            multiline
            maxLength={1000}
          />
          <Pressable
            onPress={onSend}
            disabled={!draft.trim() || reply.isPending}
            hitSlop={6}
            style={({ pressed }) => [
              styles.sendButton,
              (!draft.trim() || reply.isPending) && { opacity: 0.4 },
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={styles.sendButtonText}>↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function Header({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onBack}
        hitSlop={12}
        style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.5 }]}
      >
        <Text style={styles.backChevron}>←</Text>
      </Pressable>
      <Text style={[typography.bodyStrong, { flex: 1 }]} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
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
  statusStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing[3],
  },
  advisorRow: {
    alignItems: "flex-end",
  },
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
