import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Pill } from "@/components/Pill";
import { Avatar } from "@/components/Avatar";
import { LoadingScreen } from "@/components/LoadingScreen";
import { CardSurface } from "@/components/CardSurface";
import { ProgressRing } from "@/components/ProgressRing";
import { ProgressBar } from "@/components/ProgressBar";
import { BigStat } from "@/components/BigStat";
import { IconChip } from "@/components/IconChip";
import { KickerLabel } from "@/components/KickerLabel";
import { Button } from "@/components/Button";
import { PreFlightCountdown } from "@/components/PreFlightCountdown";
import { theme, typography, primaryTint } from "@/theme";
import { services, devTools } from "@/lib/services";
import type { SubCircle } from "@/lib/services";
import { track, trackScreen } from "@/lib/analytics";

/**
 * CH1 Corridor home. Apple Health-meets-Linear redesign:
 *   - Big mono progress headline ("47 / 60") with animated ring
 *   - Live activity rail (avatars at top, fading right)
 *   - Sub-circle grid as IconChip-led cards
 *   - Day-1 prompt as a railed accent card when relevant
 *   - Single primary CTA (Open chat) when unlocked
 */

const TOPIC: Record<SubCircle["topic"], { label: string; glyph: string; sub: string }> = {
  housing: { label: "Housing", glyph: "🏠", sub: "What your parents asked." },
  airport: { label: "Airport", glyph: "✈", sub: "Pair the arrival window." },
  food: { label: "Food", glyph: "🍴", sub: "Jain · halal · paneer." },
  roommates: { label: "Roommates", glyph: "🤝", sub: "Sleep · deal-breakers." },
};

const DAILY_PROMPT = "What's the one thing you packed that nobody told you to?";

const PINNED_ACTIVITY = {
  title: "Pre-orientation breakfast",
  when: "Sun · 6 Sept · 09:00",
  where: "UCD Belfield · O'Brien Centre",
  organiser: "Aditya R.",
  capacity: 18,
  filled: 11,
  body: "Soft start before orientation week. We'll grab coffee, swap room-fit notes, and walk to Belfield together. Reply with anything you want to talk about — sleep schedules, the bus from Beaumont, kitchen rotations.",
};

export default function CorridorHomeScreen() {
  const router = useRouter();
  const qc = useQueryClient();

  const corridor = useQuery({
    queryKey: ["corridor.me"],
    queryFn: () => services.corridor.me(),
    refetchInterval: 30_000,
  });
  const members = useQuery({
    queryKey: ["corridor.members"],
    queryFn: () => services.corridor.members(),
  });
  const subCircles = useQuery({
    queryKey: ["corridor.subCircles"],
    queryFn: () => services.corridor.subCircles(),
  });

  // Sub-circle join/leave is now handled inside the G3 detail page,
  // not from the home tile. The home routes to the detail; the
  // detail owns the toggle mutation.

  const onDevToggle = () => {
    if (!__DEV__) return;
    if (corridor.data?.unlocked) devTools.relockCorridor();
    else devTools.unlockCorridor();
    qc.invalidateQueries({ queryKey: ["corridor.me"] });
  };

  // CH3 pinned-activity sheet + CH4 today's-prompt sheet are inline
  // modals — no separate route file. The home renders compact cards;
  // tapping opens the detail surface.
  const [pinnedSheet, setPinnedSheet] = useState(false);
  const [promptSheet, setPromptSheet] = useState(false);
  const [promptDraft, setPromptDraft] = useState("");
  const [promptSubmitted, setPromptSubmitted] = useState(false);
  const [rsvp, setRsvp] = useState<"yes" | "maybe" | "no" | null>(null);

  const unlocked = corridor.data?.unlocked ?? false;
  const count = corridor.data?.verifiedCount ?? 0;
  const threshold = corridor.data?.unlockThreshold ?? 60;
  const progress = Math.min(1, count / threshold);
  const remaining = Math.max(0, threshold - count);

  // v6 §21 telemetry — screen view + Layer 2 unlock event detection.
  // unlock event fires once per session-mount when the corridor flips
  // from forming to unlocked (the screen is mounted in both states).
  useEffect(() => {
    trackScreen("ch1_corridor_home");
    track({ name: "ch1_viewed" });
  }, []);

  useEffect(() => {
    if (unlocked) {
      track({
        name: "corridor_layer_2_unlock",
        properties: { count, threshold },
      });
    }
  }, [unlocked, count, threshold]);

  if (corridor.isLoading && !corridor.data) {
    return <LoadingScreen label="Loading your corridor" />;
  }

  return (
    <Screen
      scroll
      footer={
        unlocked ? (
          <Button
            label="Open group chat"
            onPress={() => router.push("/(app)/chat")}
            size="lg"
            variant="primary"
          />
        ) : null
      }
    >
      {/* Header — corridor identity */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          {unlocked ? (
            <Pill dot variant="primary">
              Live · {timeAgo(corridor.data?.unlockedAt ?? null)}
            </Pill>
          ) : (
            <Pill variant="neutral" dot>
              Building
            </Pill>
          )}
          <Pressable onLongPress={onDevToggle} delayLongPress={600} style={styles.titleBlock}>
            <Text style={styles.title}>
              {corridor.data?.homeCity ?? "Pune"} <Text style={styles.arrow}>→</Text>{" "}
              {corridor.data?.destination ?? "Dublin"}
            </Text>
            <Text style={styles.subtitle}>{corridor.data?.intakeMonth ?? "September 2026"}</Text>
          </Pressable>
        </View>
      </View>

      {/* Hero progress card. Tappable → CH2 corridor stats detail
          (v6 build §5.2). Wraps both pre/post-unlock branches. */}
      {!unlocked ? (
        <CardSurface
          variant="accent"
          rail
          onPress={() => router.push("/(app)/corridor/stats")}
          style={styles.hero}
        >
          <View style={styles.heroRow}>
            <View style={{ flex: 1 }}>
              <KickerLabel tone="primary" dot pulse>
                Verified
              </KickerLabel>
              <BigStat
                value={count}
                denom={threshold}
                label={`${remaining} more to unlock DMs`}
                accent
                size="xl"
                style={styles.heroStat}
              />
            </View>
            <ProgressRing
              progress={progress}
              size={108}
              thickness={8}
              value={`${Math.round(progress * 100)}%`}
            />
          </View>
          <ProgressBar progress={progress} height={4} style={styles.heroBar} />
        </CardSurface>
      ) : (
        <CardSurface
          variant="accent"
          rail
          onPress={() => router.push("/(app)/corridor/stats")}
          style={styles.hero}
        >
          <KickerLabel tone="primary" dot pulse>
            Layer 2 · group chat live
          </KickerLabel>
          <Text style={styles.unlockedHero}>
            <Text style={styles.unlockedNum}>{count}</Text> verified ·{" "}
            {corridor.data?.destination ?? "Dublin"} ·{" "}
            {corridor.data?.intakeMonth ?? "September 2026"}.
          </Text>
          <Text style={[typography.body, styles.unlockedSub]}>
            v15 BP §3.2 — Layer 2 (destination × intake) opened at the{" "}
            <Text style={typography.bodyStrong}>{threshold}</Text>-floor. Most cohorts run higher in
            practice.
          </Text>
        </CardSurface>
      )}

      {/* Layer 1 hometown-crew pinned card (v15 BP §3.2 affinity sub-group).
          Always visible inside an unlocked Layer 2 — links to CH6
          where the user sees pre-unlock count or live thread. */}
      {unlocked ? (
        <CardSurface
          variant="default"
          rail
          onPress={() => router.push("/(app)/corridor/hometown")}
          style={styles.hometownCard}
        >
          <View style={styles.pinnedRow}>
            <IconChip glyph="🏘" tone="primary" size="sm" />
            <View style={{ flex: 1 }}>
              <KickerLabel tone="primary">Hometown crew · Layer 1</KickerLabel>
              <Text style={typography.bodyStrong} numberOfLines={1}>
                {corridor.data?.homeCity ?? "Pune"} × {corridor.data?.destination ?? "Dublin"} ·{" "}
                {corridor.data?.memberCountL1 ?? 0} of 8 verified
              </Text>
              <Text style={typography.caption} numberOfLines={1}>
                Tap for hometown thread + first-mover commitment
              </Text>
            </View>
            <Text style={styles.chev}>›</Text>
          </View>
        </CardSurface>
      ) : null}

      {/* PFC pre-flight countdown widget */}
      <PreFlightCountdown intakeMonth={corridor.data?.intakeMonth} />

      {/* CH4 today's prompt — daily-rotating */}
      <CardSurface
        variant="default"
        rail
        onPress={() => setPromptSheet(true)}
        style={styles.promptCard}
      >
        <View style={styles.promptRow}>
          <IconChip glyph="○" tone="primary" size="sm" />
          <View style={{ flex: 1 }}>
            <KickerLabel tone="primary">Today's prompt</KickerLabel>
            <Text style={typography.bodyStrong} numberOfLines={2}>
              {DAILY_PROMPT}
            </Text>
          </View>
          <Text style={styles.chev}>›</Text>
        </View>
      </CardSurface>

      {/* CH3 pinned activity — RSVP card */}
      <CardSurface variant="default" onPress={() => setPinnedSheet(true)} style={styles.pinnedCard}>
        <View style={styles.pinnedRow}>
          <IconChip glyph="📌" tone="default" size="sm" />
          <View style={{ flex: 1 }}>
            <KickerLabel tone="muted">Pinned · meet-up</KickerLabel>
            <Text style={typography.bodyStrong} numberOfLines={1}>
              {PINNED_ACTIVITY.title}
            </Text>
            <Text style={typography.caption} numberOfLines={1}>
              {PINNED_ACTIVITY.when} · {PINNED_ACTIVITY.where}
            </Text>
          </View>
          {rsvp ? (
            <View style={styles.rsvpChip}>
              <Text style={styles.rsvpChipText}>{rsvp.toUpperCase()}</Text>
            </View>
          ) : (
            <Text style={styles.chev}>›</Text>
          )}
        </View>
      </CardSurface>

      {/* Day-1 prompt — only when unlocked + no sub-circle joined */}
      {unlocked && (subCircles.data ?? []).every((s) => !s.joined) ? (
        <CardSurface variant="default" rail style={styles.day1}>
          <KickerLabel tone="primary">Day 1</KickerLabel>
          <Text style={[typography.bodyStrong, styles.day1Headline]}>
            Pick a worry. Six people land in your circle.
          </Text>
        </CardSurface>
      ) : null}

      {/* Live verifications rail */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <KickerLabel tone="muted" dot>
            Live verifications
          </KickerLabel>
          <Pressable onPress={() => router.push("/(app)/corridor/members")} hitSlop={8}>
            <Text style={[typography.bodyStrong, { color: theme.colors.primary }]}>See all →</Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.avatarRail}
        >
          {(members.data ?? []).slice(0, 9).map((m) => (
            <Pressable key={m.id} style={styles.avatarTile}>
              <Avatar initials={m.initials} size="md" tone="primary" />
              <Text style={styles.avatarName} numberOfLines={1}>
                {m.name.split(" ")[0]}
              </Text>
              <Text style={styles.avatarUni} numberOfLines={1}>
                {m.uni}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Activity feed link */}
      <CardSurface
        variant="default"
        onPress={() => router.push("/(app)/corridor/activity")}
        style={styles.activityLink}
        padding={theme.spacing[4]}
      >
        <View style={styles.activityRow}>
          <IconChip glyph="⚡" tone="primary" size="sm" />
          <View style={{ flex: 1 }}>
            <Text style={typography.bodyStrong}>Activity feed</Text>
            <Text style={typography.caption}>Verifications + sub-circle pulse</Text>
          </View>
          <Text style={styles.chev}>›</Text>
        </View>
      </CardSurface>

      {/* Stay-safe link — surfaces the SCM-A pattern library */}
      <CardSurface
        variant="default"
        onPress={() => router.push("/(app)/help")}
        style={styles.activityLink}
        padding={theme.spacing[4]}
      >
        <View style={styles.activityRow}>
          <IconChip glyph="⚠" tone="warning" size="sm" />
          <View style={{ flex: 1 }}>
            <Text style={typography.bodyStrong}>
              Stay safe in {corridor.data?.destination ?? "Dublin"}
            </Text>
            <Text style={typography.caption}>5 housing-scam patterns + crisis lines</Text>
          </View>
          <Text style={styles.chev}>›</Text>
        </View>
      </CardSurface>

      {/* Sub-circles */}
      <View style={styles.section}>
        <KickerLabel tone="muted">Sub-circles</KickerLabel>
        <Text style={[typography.caption, styles.sectionIntro]}>
          Six per circle · join more than one
        </Text>

        <View style={styles.subGrid}>
          {(subCircles.data ?? []).map((sc) => {
            const t = TOPIC[sc.topic];
            return (
              <Pressable
                key={sc.id}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/corridor/circle/[topic]",
                    params: { topic: sc.topic },
                  })
                }
                style={({ pressed }) => [
                  styles.subCard,
                  sc.joined && styles.subCardJoined,
                  pressed && { opacity: 0.6 },
                ]}
              >
                <View style={styles.subCardTop}>
                  <IconChip glyph={t.glyph} tone={sc.joined ? "primary" : "default"} size="md" />
                  {sc.joined ? (
                    <View style={styles.joinedBadge}>
                      <Text style={styles.joinedText}>JOINED</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={typography.bodyStrong}>{t.label}</Text>
                <Text style={[typography.caption, styles.subCardSub]}>{t.sub}</Text>
                <View style={styles.subCardFooter}>
                  <Text style={styles.subCardCount}>
                    {sc.count} <Text style={styles.subCardCountSuffix}>members</Text>
                  </Text>
                  <Text style={styles.subCardTime}>{timeAgo(sc.lastActivityAt)}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {!unlocked ? (
        <CardSurface variant="default" style={styles.unlockExplain}>
          <KickerLabel tone="primary">Unlocks at {threshold}</KickerLabel>
          <View style={styles.unlockGrid}>
            <UnlockItem glyph="💬" text="Group DMs" />
            <UnlockItem glyph="🎓" text="Uni subgroups" />
            <UnlockItem glyph="🌅" text="Day-1 thread" />
            <UnlockItem glyph="🛏" text="Roommate clusters" />
          </View>
        </CardSurface>
      ) : null}

      {__DEV__ ? (
        <View style={styles.devNote}>
          <Text style={typography.caption}>Dev · long-press the title to flip lock state</Text>
        </View>
      ) : null}

      {/* CH4 Today's prompt sheet */}
      <Modal
        visible={promptSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setPromptSheet(false)}
      >
        <Pressable style={sheetStyles.backdrop} onPress={() => setPromptSheet(false)}>
          <View />
        </Pressable>
        <View style={sheetStyles.sheet}>
          <View style={sheetStyles.handle} />
          <ScrollView contentContainerStyle={sheetStyles.body}>
            <View style={sheetStyles.topRow}>
              <IconChip glyph="○" tone="primary" size="lg" />
              <Pressable
                onPress={() => setPromptSheet(false)}
                hitSlop={10}
                style={sheetStyles.close}
              >
                <Text style={sheetStyles.closeText}>✕</Text>
              </Pressable>
            </View>
            <KickerLabel tone="primary">Today's prompt</KickerLabel>
            <Text style={sheetStyles.title}>{DAILY_PROMPT}</Text>
            <Text style={[typography.caption, sheetStyles.sub]}>
              {(members.data ?? []).length} people will see your reply. Threaded into the corridor
              chat.
            </Text>

            {promptSubmitted ? (
              <CardSurface variant="accent" rail style={sheetStyles.sentCard}>
                <KickerLabel tone="primary">Sent</KickerLabel>
                <Text style={[typography.bodyStrong, { marginTop: theme.spacing[2] }]}>
                  Your answer is in the corridor.
                </Text>
              </CardSurface>
            ) : (
              <>
                <TextInput
                  value={promptDraft}
                  onChangeText={setPromptDraft}
                  placeholder="One thing. Stream of consciousness."
                  placeholderTextColor={theme.colors.fgPlaceholder}
                  style={sheetStyles.input}
                  multiline
                  maxLength={280}
                />
                <Pressable
                  onPress={() => {
                    if (!promptDraft.trim()) return;
                    setPromptSubmitted(true);
                  }}
                  disabled={!promptDraft.trim()}
                  style={({ pressed }) => [
                    sheetStyles.submit,
                    !promptDraft.trim() && { opacity: 0.4 },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={sheetStyles.submitText}>Send to the corridor</Text>
                </Pressable>
              </>
            )}

            {/* Mock peer answers — shows what the prompt looks like
                when populated. */}
            <View style={sheetStyles.answersBlock}>
              <KickerLabel tone="muted">3 answers · last 4h</KickerLabel>
              <PeerAnswer
                initials="PR"
                name="Priya"
                ago="just now"
                text="Mom slipped a stainless steel tiffin set into my bag. Now I get it."
              />
              <PeerAnswer
                initials="AR"
                name="Arjun"
                ago="1h"
                text="Pickled mango. Forty rupees of joy. I'll thank her later."
              />
              <PeerAnswer
                initials="MH"
                name="Meera"
                ago="3h"
                text="A ₹50 thread. For when buttons fall off and I forget that hostels in Galway don't have darji uncles."
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* CH3 Pinned activity sheet — RSVP */}
      <Modal
        visible={pinnedSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setPinnedSheet(false)}
      >
        <Pressable style={sheetStyles.backdrop} onPress={() => setPinnedSheet(false)}>
          <View />
        </Pressable>
        <View style={sheetStyles.sheet}>
          <View style={sheetStyles.handle} />
          <ScrollView contentContainerStyle={sheetStyles.body}>
            <View style={sheetStyles.topRow}>
              <IconChip glyph="📌" tone="primary" size="lg" />
              <Pressable
                onPress={() => setPinnedSheet(false)}
                hitSlop={10}
                style={sheetStyles.close}
              >
                <Text style={sheetStyles.closeText}>✕</Text>
              </Pressable>
            </View>
            <KickerLabel tone="primary">Pinned · meet-up</KickerLabel>
            <Text style={sheetStyles.title}>{PINNED_ACTIVITY.title}</Text>

            <View style={sheetStyles.metaGrid}>
              <View style={sheetStyles.metaItem}>
                <KickerLabel tone="muted">When</KickerLabel>
                <Text style={typography.bodyStrong}>{PINNED_ACTIVITY.when}</Text>
              </View>
              <View style={sheetStyles.metaItem}>
                <KickerLabel tone="muted">Where</KickerLabel>
                <Text style={typography.bodyStrong}>{PINNED_ACTIVITY.where}</Text>
              </View>
              <View style={sheetStyles.metaItem}>
                <KickerLabel tone="muted">Organiser</KickerLabel>
                <Text style={typography.bodyStrong}>{PINNED_ACTIVITY.organiser}</Text>
              </View>
              <View style={sheetStyles.metaItem}>
                <KickerLabel tone="muted">Capacity</KickerLabel>
                <Text style={typography.bodyStrong}>
                  {PINNED_ACTIVITY.filled} / {PINNED_ACTIVITY.capacity}
                </Text>
              </View>
            </View>

            <Text style={[typography.body, sheetStyles.body2]}>{PINNED_ACTIVITY.body}</Text>

            <KickerLabel tone="muted" style={{ marginTop: theme.spacing[5] }}>
              Your RSVP
            </KickerLabel>
            <View style={sheetStyles.rsvpRow}>
              <RsvpPill label="Yes" active={rsvp === "yes"} onPress={() => setRsvp("yes")} />
              <RsvpPill label="Maybe" active={rsvp === "maybe"} onPress={() => setRsvp("maybe")} />
              <RsvpPill label="No" active={rsvp === "no"} onPress={() => setRsvp("no")} />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
}

function PeerAnswer({
  initials,
  name,
  ago,
  text,
}: {
  initials: string;
  name: string;
  ago: string;
  text: string;
}) {
  return (
    <View style={sheetStyles.peerRow}>
      <Avatar initials={initials} size="sm" tone="primary" />
      <View style={{ flex: 1 }}>
        <View style={sheetStyles.peerHead}>
          <Text style={typography.bodyStrong}>{name}</Text>
          <Text style={sheetStyles.peerAgo}>{ago}</Text>
        </View>
        <Text style={[typography.body, { marginTop: 2 }]}>{text}</Text>
      </View>
    </View>
  );
}

function RsvpPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        sheetStyles.rsvpPill,
        active && sheetStyles.rsvpPillActive,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text
        style={[
          sheetStyles.rsvpPillText,
          {
            color: active ? theme.colors.primary : theme.colors.fgMuted,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function UnlockItem({ glyph, text }: { glyph: string; text: string }) {
  return (
    <View style={styles.unlockItem}>
      <IconChip glyph={glyph} tone="default" size="sm" />
      <Text style={typography.caption}>{text}</Text>
    </View>
  );
}

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  const sec = Math.max(0, Math.floor(ms / 1000));
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  return `${Math.floor(hr / 24)}d`;
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    marginBottom: theme.spacing[5],
  },
  titleBlock: {
    marginTop: theme.spacing[3],
  },
  title: {
    fontFamily: theme.fontFamily.heading,
    fontSize: 32,
    fontWeight: "600",
    color: theme.colors.fg,
    letterSpacing: -1.2,
    lineHeight: 36,
  },
  arrow: {
    color: theme.colors.primary,
    fontWeight: "400",
  },
  subtitle: {
    fontFamily: theme.fontFamily.heading,
    fontSize: 18,
    fontStyle: "italic",
    color: theme.colors.fgMuted,
    marginTop: 4,
  },
  hero: {
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[5],
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[5],
  },
  heroStat: {
    marginTop: theme.spacing[3],
  },
  heroBar: {
    marginTop: theme.spacing[5],
  },
  unlockedHero: {
    fontFamily: theme.fontFamily.heading,
    fontSize: 44,
    color: theme.colors.fg,
    fontWeight: "600",
    letterSpacing: -1.6,
    marginTop: theme.spacing[2],
  },
  unlockedNum: {
    color: theme.colors.primary,
  },
  unlockedSub: {
    marginTop: theme.spacing[2],
  },
  day1: {
    marginBottom: theme.spacing[5],
  },
  day1Headline: {
    fontSize: 17,
    lineHeight: 22,
    marginTop: theme.spacing[2],
  },
  section: {
    marginTop: theme.spacing[6],
    marginBottom: theme.spacing[2],
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing[4],
  },
  sectionIntro: {
    marginTop: theme.spacing[1],
    marginBottom: theme.spacing[4],
  },
  avatarRail: {
    gap: theme.spacing[3],
    paddingRight: theme.spacing[6],
  },
  avatarTile: {
    width: 72,
    alignItems: "center",
    gap: 4,
  },
  avatarName: {
    fontFamily: theme.fontFamily.body,
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.fg,
    marginTop: 6,
    maxWidth: "100%",
  },
  avatarUni: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 9,
    color: theme.colors.fgSubtle,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    maxWidth: "100%",
  },
  activityLink: {
    marginTop: theme.spacing[5],
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
  },
  chev: {
    fontSize: 22,
    color: theme.colors.fgSubtle,
  },
  subGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[3],
  },
  subCard: {
    flexBasis: "48%",
    flexGrow: 1,
    padding: theme.spacing[4],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing[2],
    minHeight: 150,
  },
  subCardJoined: {
    borderColor: theme.colors.primary,
    backgroundColor: primaryTint(0.05),
  },
  subCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing[1],
  },
  joinedBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  joinedText: {
    color: theme.colors.primaryFg,
    fontSize: 9,
    fontWeight: "700",
    fontFamily: theme.fontFamily.mono,
    letterSpacing: 0.8,
  },
  subCardSub: {
    color: theme.colors.fgMuted,
  },
  subCardFooter: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: theme.spacing[2],
  },
  subCardCount: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.fg,
  },
  subCardCountSuffix: {
    fontWeight: "400",
    color: theme.colors.fgSubtle,
  },
  subCardTime: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    color: theme.colors.fgSubtle,
    letterSpacing: 0.4,
  },
  unlockExplain: {
    marginTop: theme.spacing[6],
  },
  unlockGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[3],
    marginTop: theme.spacing[3],
  },
  unlockItem: {
    flexBasis: "48%",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
  },
  devNote: {
    marginTop: theme.spacing[8],
    padding: theme.spacing[3],
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.colors.border,
  },
  promptCard: {
    marginBottom: theme.spacing[3],
  },
  promptRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
  },
  pinnedCard: {
    marginBottom: theme.spacing[5],
  },
  hometownCard: {
    marginBottom: theme.spacing[5],
  },
  pinnedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
  },
  rsvpChip: {
    paddingVertical: 4,
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
  },
  rsvpChipText: {
    color: theme.colors.primaryFg,
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
});

const sheetStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: "88%",
    backgroundColor: theme.colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    paddingTop: 8,
    paddingBottom: 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.borderStrong,
    alignSelf: "center",
    marginBottom: theme.spacing[3],
  },
  body: {
    paddingHorizontal: theme.spacing[6],
    paddingBottom: theme.spacing[8],
    gap: theme.spacing[2],
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing[4],
  },
  close: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontSize: 20,
    color: theme.colors.fgSubtle,
  },
  title: {
    fontFamily: theme.fontFamily.heading,
    fontSize: 28,
    fontWeight: "600",
    color: theme.colors.fg,
    letterSpacing: -1,
    lineHeight: 32,
    marginTop: 4,
    marginBottom: theme.spacing[3],
  },
  sub: {
    color: theme.colors.fgSubtle,
    marginBottom: theme.spacing[5],
  },
  body2: {
    color: theme.colors.fgMuted,
    lineHeight: 24,
    marginTop: theme.spacing[4],
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[4],
    marginTop: theme.spacing[4],
  },
  metaItem: {
    flexBasis: "45%",
    flexGrow: 1,
    gap: 4,
  },
  rsvpRow: {
    flexDirection: "row",
    gap: theme.spacing[2],
    marginTop: theme.spacing[3],
  },
  rsvpPill: {
    flex: 1,
    height: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  rsvpPillActive: {
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(0,220,130,0.08)",
  },
  rsvpPillText: {
    fontFamily: theme.fontFamily.body,
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    minHeight: 96,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    color: theme.colors.fg,
    fontFamily: theme.fontFamily.body,
    fontSize: 15,
    textAlignVertical: "top",
    marginTop: theme.spacing[3],
  },
  submit: {
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing[3],
  },
  submitText: {
    color: theme.colors.primaryFg,
    fontFamily: theme.fontFamily.body,
    fontSize: 15,
    fontWeight: "600",
  },
  sentCard: {
    marginTop: theme.spacing[3],
  },
  answersBlock: {
    marginTop: theme.spacing[6],
    gap: theme.spacing[3],
  },
  peerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing[3],
  },
  peerHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  peerAgo: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    color: theme.colors.fgSubtle,
    letterSpacing: 0.6,
  },
});
