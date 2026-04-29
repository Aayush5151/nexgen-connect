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
import * as Haptics from "expo-haptics";
import { Pill } from "@/components/Pill";
import { Avatar } from "@/components/Avatar";
import { CardSurface } from "@/components/CardSurface";
import { IconChip } from "@/components/IconChip";
import { KickerLabel } from "@/components/KickerLabel";
import { MessageBubble } from "@/components/MessageBubble";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Button } from "@/components/Button";
import { theme, typography } from "@/theme";
import { services } from "@/lib/services";
import type { SubCircle } from "@/lib/services";

/**
 * G3 Intro circle detail. Six-person sub-circle around one of four
 * worries (housing / airport / food / roommates per §3.7a).
 *
 * Three states map to the plan §5.3:
 *   not-joined  → "Join this circle" CTA + scripted opener preview
 *   joined-quiet → opener visible, no replies, prompt to break ice
 *   joined-active → opener + thread of replies + compose
 */

const TOPIC_META: Record<
  SubCircle["topic"],
  { label: string; glyph: string; opener: string; followUp: string }
> = {
  housing: {
    label: "Housing",
    glyph: "🏠",
    opener:
      "What's the one thing about housing in Dublin your parents asked you to figure out?",
    followUp:
      "Drop the name of the PBSA or estate you're looking at. We'll cross-check it against the SCM patterns.",
  },
  airport: {
    label: "Airport",
    glyph: "✈",
    opener:
      "Drop your arrival date + flight number if you want to be matched with another arriving student.",
    followUp:
      "T+18h with no arrival pair triggers a T&S advisor outreach — your safety on Day 0 is the highest-bar circle.",
  },
  food: {
    label: "Food",
    glyph: "🍴",
    opener: "Jain · halal · kosher — share what you eat. We'll thread it for the cohort.",
    followUp:
      "If you've found a Jain or halal place near campus, drop the name. Smaller cohorts coordinate earlier.",
  },
  roommates: {
    label: "Roommates",
    glyph: "🤝",
    opener: "What's your sleep schedule + what's a deal-breaker?",
    followUp:
      "Cluster forms at 4 active members. Both sides re-confirm Aadhaar + admit before signing.",
  },
};

type LocalReply = {
  id: string;
  body: string;
  authorInitials: string;
  authorName: string;
  isYou: boolean;
  sentAt: string;
};

const SEED_REPLIES: Record<SubCircle["topic"], LocalReply[]> = {
  housing: [
    {
      id: "r1",
      body: "Looking at aparto Binary Hub — anyone signed there yet?",
      authorInitials: "PR",
      authorName: "Priya",
      isYou: false,
      sentAt: minutesAgo(46),
    },
    {
      id: "r2",
      body: "Yugo Highfield's ensuite is gone for Sept; waitlist for January.",
      authorInitials: "AD",
      authorName: "Aditya",
      isYou: false,
      sentAt: minutesAgo(22),
    },
    {
      id: "r3",
      body: "Mom asked about tenancy registration — anyone's parents found a checklist for that?",
      authorInitials: "MH",
      authorName: "Meera",
      isYou: false,
      sentAt: minutesAgo(8),
    },
  ],
  airport: [
    {
      id: "r1",
      body: "DEL → DUB Sun 31 Aug 06:40, Etihad EY207. Looking for a buddy on the bus to Belfield.",
      authorInitials: "AR",
      authorName: "Arjun",
      isYou: false,
      sentAt: minutesAgo(34),
    },
    {
      id: "r2",
      body: "Same flight! Reply to me and we can split the AirCoach.",
      authorInitials: "TS",
      authorName: "Tanvi",
      isYou: false,
      sentAt: minutesAgo(31),
    },
  ],
  food: [
    {
      id: "r1",
      body: "Govinda's on Middle Abbey is the closest pure-veg spot to TCD. Open till 9.",
      authorInitials: "NK",
      authorName: "Nikhil",
      isYou: false,
      sentAt: minutesAgo(102),
    },
    {
      id: "r2",
      body: "Any halal options near Belfield that aren't kebab?",
      authorInitials: "SA",
      authorName: "Sahil",
      isYou: false,
      sentAt: minutesAgo(57),
    },
  ],
  roommates: [
    {
      id: "r1",
      body: "Late riser. Quiet kitchen. Vegetarian. Don't smoke.",
      authorInitials: "IS",
      authorName: "Isha",
      isYou: false,
      sentAt: minutesAgo(64),
    },
    {
      id: "r2",
      body: "Early sleeper, OK with shared kitchen + a halal-friendly housemate.",
      authorInitials: "AN",
      authorName: "Ananya",
      isYou: false,
      sentAt: minutesAgo(40),
    },
    {
      id: "r3",
      body: "Looking for two more — we're forming a cluster for Mezzino Queen Street.",
      authorInitials: "VK",
      authorName: "Vikram",
      isYou: false,
      sentAt: minutesAgo(13),
    },
  ],
};

function minutesAgo(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString();
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

export default function IntroCircleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const params = useLocalSearchParams<{ topic?: string }>();
  const topicKey = (params.topic ?? "housing") as SubCircle["topic"];
  const meta = TOPIC_META[topicKey] ?? TOPIC_META.housing;

  const subCircles = useQuery({
    queryKey: ["corridor.subCircles"],
    queryFn: () => services.corridor.subCircles(),
  });

  const sc = (subCircles.data ?? []).find((s) => s.topic === topicKey);

  const toggle = useMutation({
    mutationFn: () =>
      services.corridor.toggleSubCircle({ subCircleId: sc?.id ?? "" }),
    onSuccess: () => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      qc.invalidateQueries({ queryKey: ["corridor.subCircles"] });
    },
  });

  // Local thread (not persisted — Phase 2 mock has no per-circle
  // message endpoint). Treated as in-memory chat for the demo.
  const [replies, setReplies] = useState<LocalReply[]>(
    SEED_REPLIES[topicKey] ?? [],
  );
  const [draft, setDraft] = useState("");
  const listRef = useRef<FlatList<LocalReply>>(null);

  useEffect(() => {
    setReplies(SEED_REPLIES[topicKey] ?? []);
  }, [topicKey]);

  useEffect(() => {
    if (replies.length > 0) {
      requestAnimationFrame(() =>
        listRef.current?.scrollToEnd({ animated: false }),
      );
    }
  }, [replies.length]);

  const onSend = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    setReplies((cur) => [
      ...cur,
      {
        id: "y_" + Date.now(),
        body: text,
        authorInitials: "YO",
        authorName: "You",
        isYou: true,
        sentAt: new Date().toISOString(),
      },
    ]);
  };

  if (subCircles.isLoading && !subCircles.data) {
    return <LoadingScreen label="Loading circle" />;
  }

  const joined = sc?.joined ?? false;
  const count = sc?.count ?? 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.back, pressed && { opacity: 0.5 }]}
        >
          <Text style={styles.backChevron}>←</Text>
        </Pressable>
        <View style={styles.headerMeta}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerGlyph}>{meta.glyph}</Text>
            <Text style={typography.bodyStrong} numberOfLines={1}>
              {meta.label}
            </Text>
          </View>
          <Text style={typography.caption} numberOfLines={1}>
            {count} {count === 1 ? "person" : "people"} ·{" "}
            {sc ? relativeTime(sc.lastActivityAt) : "—"}
          </Text>
        </View>
        {joined ? (
          <Pill dot variant="primary">
            Joined
          </Pill>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={insets.bottom + 60}
      >
        <FlatList
          ref={listRef}
          data={replies}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={{ gap: theme.spacing[3] }}>
              {/* Scripted opener */}
              <CardSurface variant="accent" rail>
                <KickerLabel tone="primary">Opener</KickerLabel>
                <Text style={styles.opener}>{meta.opener}</Text>
              </CardSurface>

              {!joined ? (
                <CardSurface variant="default" rail style={styles.previewCard}>
                  <View style={styles.previewRow}>
                    <IconChip glyph="👀" tone="default" size="md" />
                    <View style={{ flex: 1 }}>
                      <Text style={typography.bodyStrong}>Quiet preview</Text>
                      <Text style={typography.caption}>
                        Replies unlock when you join.
                      </Text>
                    </View>
                  </View>
                </CardSurface>
              ) : null}

              {joined && replies.length > 0 ? (
                <View style={styles.followUpRow}>
                  <KickerLabel tone="muted">Follow-up</KickerLabel>
                  <Text style={[typography.caption, { marginTop: 2 }]}>
                    {meta.followUp}
                  </Text>
                </View>
              ) : null}
            </View>
          }
          renderItem={({ item }) => {
            const time = relativeTime(item.sentAt);
            if (!joined) {
              // Blurred preview when not joined.
              return (
                <View style={styles.blurredRow}>
                  <Avatar
                    initials={item.authorInitials}
                    size="sm"
                    tone="primary"
                  />
                  <View style={[styles.blurredBubble]}>
                    <View style={styles.blurredBar} />
                    <View
                      style={[styles.blurredBar, { width: "60%" }]}
                    />
                  </View>
                </View>
              );
            }
            return item.isYou ? (
              <MessageBubble variant="mine" text={item.body} time={time} />
            ) : (
              <MessageBubble
                variant="other"
                text={item.body}
                initials={item.authorInitials}
                authorName={item.authorName}
                showAvatar
                time={time}
              />
            );
          }}
        />

        {!joined ? (
          <View
            style={[styles.joinDock, { paddingBottom: insets.bottom + 8 }]}
          >
            <Button
              label={`Join · ${meta.label}`}
              onPress={() => toggle.mutate()}
              loading={toggle.isPending}
              size="lg"
              variant="glow"
            />
          </View>
        ) : (
          <View
            style={[styles.composeDock, { paddingBottom: insets.bottom + 8 }]}
          >
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Reply to the circle"
              placeholderTextColor={theme.colors.fgPlaceholder}
              style={styles.composeInput}
              multiline
              maxLength={1000}
            />
            <Pressable
              onPress={onSend}
              disabled={!draft.trim()}
              hitSlop={6}
              style={({ pressed }) => [
                styles.sendButton,
                !draft.trim() && { opacity: 0.4 },
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
  back: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backChevron: { color: theme.colors.fg, fontSize: 22, lineHeight: 22 },
  headerMeta: { flex: 1, gap: 2 },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  headerGlyph: { fontSize: 16 },
  body: { flex: 1 },
  list: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[4],
    gap: theme.spacing[3],
  },
  opener: {
    fontFamily: theme.fontFamily.heading,
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.fg,
    letterSpacing: -0.4,
    lineHeight: 26,
    marginTop: theme.spacing[2],
  },
  previewCard: {
    marginBottom: theme.spacing[2],
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
  },
  followUpRow: {
    paddingVertical: theme.spacing[3],
    gap: 2,
  },
  blurredRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.spacing[2],
    marginBottom: theme.spacing[3],
  },
  blurredBubble: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 18,
    padding: theme.spacing[3],
    gap: 6,
    minWidth: 180,
    maxWidth: "82%",
  },
  blurredBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.borderStrong,
    width: "85%",
  },
  joinDock: {
    paddingTop: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.bg,
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
