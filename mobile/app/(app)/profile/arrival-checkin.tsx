import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { Button } from "@/components/Button";
import { CardSurface } from "@/components/CardSurface";
import { KickerLabel } from "@/components/KickerLabel";
import { Pill } from "@/components/Pill";
import { theme, typography } from "@/theme";
import { useSession } from "@/store/session";

/**
 * Y6 — First-week arrival check-in (Premium-gated).
 *
 * v15 BP §5.2 / v6 build §5.15 — the parent-pay value-prop that lands
 * in the highest-anxiety window (first 7 days in destination). Replaces
 * the retired "priority match" feature on PR1.
 *
 * Surface only renders Day 0-7 from session.arrivalDate. Outside that
 * window the screen is a noop (renders an "out of window" notice).
 *
 * Components:
 *   - Named advisor card        — 1 named human, photo, masked phone
 *   - 7-day strip                — past = thumb status, today = active,
 *                                  future = pending dot
 *   - Daily thumb up/down        — single tap, persists, no comment box
 *   - "I need help right now"    — 1-tap routes to /(app)/safety triage
 *                                  (will fold into /help/ in P2 commit 12)
 *
 * Service-layer mock TODO (follow-up): services.arrivalCheckin
 * .{getStatus, submitThumb}. For now: local state only, plus an
 * "outside window" branch off session.arrivalDate.
 */

type Thumb = "up" | "down" | null;

function daysSince(iso: string): number {
  const start = new Date(iso).getTime();
  const now = Date.now();
  const ms = now - start;
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

export default function ArrivalCheckinScreen() {
  const router = useRouter();
  const arrivalDate = useSession((s) => s.arrivalDate);

  // Mock: 7-day thumb history. Day 0 (arrival day) thru Day 6.
  const [thumbs, setThumbs] = useState<Thumb[]>([
    "up",
    "up",
    "up",
    null,
    null,
    null,
    null,
  ]);

  const dayIndex = useMemo(() => {
    if (!arrivalDate) return null;
    const d = daysSince(arrivalDate);
    return d >= 0 && d <= 6 ? d : -1;
  }, [arrivalDate]);

  // Out-of-window paths.
  if (!arrivalDate) {
    return (
      <Screen>
        <Hero
          title="Arrival check-in"
          accent="No flight on record yet."
          size="lg"
        />
        <CardSurface variant="default" style={styles.outCard}>
          <KickerLabel tone="muted">Set your arrival</KickerLabel>
          <Text style={[typography.body, styles.outBody]}>
            Tell us your flight date in Settings → Travel and the
            check-in opens on Day 0. Premium-only — Day 0 to Day 7.
          </Text>
          <Button
            label="Open settings"
            onPress={() => router.push("/(app)/profile/settings")}
            variant="secondary"
            size="md"
          />
        </CardSurface>
      </Screen>
    );
  }

  if (dayIndex === null || dayIndex < 0 || dayIndex > 6) {
    return (
      <Screen>
        <Hero
          title="Arrival check-in"
          accent="Window closed."
          size="lg"
        />
        <Text style={[typography.body, styles.outBody]}>
          The Y6 first-week check-in runs Day 0 through Day 6 only.
          You&apos;re past Day 6 — your full Premium features stay
          active. Reach out via Profile → Report or the help shortcut
          for anything else.
        </Text>
      </Screen>
    );
  }

  const onThumb = (vote: Exclude<Thumb, null>) => {
    setThumbs((prev) => {
      const next = [...prev];
      next[dayIndex] = vote;
      return next;
    });
  };

  const todayThumb = thumbs[dayIndex];

  return (
    <Screen
      footer={
        <Button
          label="I need help right now"
          variant="primary"
          size="lg"
          onPress={() => router.push("/(app)/safety")}
        />
      }
    >
      <Pill variant="primary">Day {dayIndex} · Premium</Pill>

      <Hero
        title="How was today?"
        accent="One tap is enough."
        size="lg"
        style={styles.hero}
      />

      {/* Named advisor card */}
      <CardSurface variant="accent" rail style={styles.advisorCard}>
        <KickerLabel tone="primary">Your advisor</KickerLabel>
        <Text style={[typography.bodyStrong, styles.advisorName]}>
          Priya R · Trust & Safety
        </Text>
        <Text style={[typography.caption, styles.advisorMeta]}>
          IST 09:00–22:00 · 1h SLA · masked-number bridge
        </Text>
      </CardSurface>

      {/* 7-day strip */}
      <View style={styles.stripBlock}>
        <KickerLabel tone="muted">First week</KickerLabel>
        <View style={styles.strip}>
          {thumbs.map((thumb, i) => {
            const isToday = i === dayIndex;
            const isPast = i < dayIndex;
            const glyph = thumb === "up" ? "✓" : thumb === "down" ? "✕" : "·";
            return (
              <View
                key={i}
                style={[
                  styles.stripCell,
                  isToday && styles.stripCellToday,
                  isPast && thumb === "up" && styles.stripCellPastUp,
                  isPast && thumb === "down" && styles.stripCellPastDown,
                ]}
              >
                <Text style={styles.stripDay}>D{i}</Text>
                <Text style={styles.stripGlyph}>{glyph}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Today's thumb */}
      <CardSurface variant="default" style={styles.todayCard}>
        <KickerLabel tone="muted">Today</KickerLabel>
        <View style={styles.thumbRow}>
          <Pressable
            onPress={() => onThumb("up")}
            accessibilityRole="button"
            accessibilityLabel="Today went well"
            style={({ pressed }) => [
              styles.thumbButton,
              todayThumb === "up" && styles.thumbButtonActiveUp,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.thumbGlyph}>✓</Text>
            <Text style={styles.thumbLabel}>Going well</Text>
          </Pressable>
          <Pressable
            onPress={() => onThumb("down")}
            accessibilityRole="button"
            accessibilityLabel="Today was rough"
            style={({ pressed }) => [
              styles.thumbButton,
              todayThumb === "down" && styles.thumbButtonActiveDown,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.thumbGlyph}>✕</Text>
            <Text style={styles.thumbLabel}>Rough</Text>
          </Pressable>
        </View>
        {todayThumb === "down" ? (
          <Text style={[typography.caption, styles.followup]}>
            We&apos;ll reach out within 1 hour. No comment box — your
            advisor will call.
          </Text>
        ) : null}
      </CardSurface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: theme.spacing[3],
    marginBottom: theme.spacing[4],
  },
  outCard: {
    gap: theme.spacing[3],
    marginTop: theme.spacing[5],
  },
  outBody: {
    color: theme.colors.fgMuted,
    lineHeight: 22,
    marginVertical: theme.spacing[3],
  },
  advisorCard: {
    gap: theme.spacing[1],
    marginBottom: theme.spacing[5],
  },
  advisorName: {
    marginTop: theme.spacing[1],
  },
  advisorMeta: {
    color: theme.colors.fgMuted,
  },
  stripBlock: {
    gap: theme.spacing[3],
    marginBottom: theme.spacing[5],
  },
  strip: {
    flexDirection: "row",
    gap: theme.spacing[2],
  },
  stripCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  stripCellToday: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  stripCellPastUp: {
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(0,220,130,0.06)",
  },
  stripCellPastDown: {
    borderColor: theme.colors.warning,
    backgroundColor: "rgba(255,176,32,0.06)",
  },
  stripDay: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    color: theme.colors.fgSubtle,
    letterSpacing: 0.6,
  },
  stripGlyph: {
    fontFamily: theme.fontFamily.body,
    fontSize: 18,
    color: theme.colors.fg,
    marginTop: 2,
  },
  todayCard: {
    gap: theme.spacing[3],
  },
  thumbRow: {
    flexDirection: "row",
    gap: theme.spacing[3],
  },
  thumbButton: {
    flex: 1,
    paddingVertical: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    gap: theme.spacing[1],
  },
  thumbButtonActiveUp: {
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(0,220,130,0.06)",
  },
  thumbButtonActiveDown: {
    borderColor: theme.colors.warning,
    backgroundColor: "rgba(255,176,32,0.06)",
  },
  thumbGlyph: {
    fontFamily: theme.fontFamily.body,
    fontSize: 28,
    color: theme.colors.fg,
  },
  thumbLabel: {
    fontFamily: theme.fontFamily.body,
    fontSize: 13,
    fontWeight: "500",
    color: theme.colors.fg,
  },
  followup: {
    color: theme.colors.warning,
    marginTop: theme.spacing[2],
  },
});
