import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { Pill } from "@/components/Pill";
import { CardSurface } from "@/components/CardSurface";
import { IconChip } from "@/components/IconChip";
import { KickerLabel } from "@/components/KickerLabel";
import { BigStat } from "@/components/BigStat";
import { LoadingScreen } from "@/components/LoadingScreen";
import { theme, typography } from "@/theme";
import { services } from "@/lib/services";
import type { ScamPattern } from "@/lib/services";

/**
 * SCM-A Accommodation safety home + SCM-B pattern detail (modal).
 *
 * Reads patterns from services.scams.patterns() (BP §16.30 SCM1-5).
 * Real-data anchored: Dublin H1 2025 accommodation fraud rose 22%
 * with €385K reported losses (RTÉ News, Aug 2025).
 */

const PATTERN_GLYPHS: Record<string, string> = {
  scm_1: "💸",
  scm_2: "📜",
  scm_3: "💵",
  scm_4: "🎭",
  scm_5: "⏱",
};

export default function SafetyHomeScreen() {
  const router = useRouter();
  const [open, setOpen] = useState<ScamPattern | null>(null);

  const patterns = useQuery({
    queryKey: ["scams.patterns"],
    queryFn: () => services.scams.patterns(),
  });

  if (patterns.isLoading && !patterns.data) {
    return <LoadingScreen label="Loading safety patterns" />;
  }

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Pill variant="warning" dot>
          Live alert
        </Pill>
      </View>

      <Hero
        title="Stay safe."
        accent="The five patterns."
        size="lg"
        style={styles.hero}
      />

      <CardSurface variant="warning" rail style={styles.alertCard}>
        <View style={styles.alertRow}>
          <BigStat value="22%" label="Up · H1 2025" size="md" />
          <View style={{ flex: 1, paddingLeft: theme.spacing[4] }}>
            <KickerLabel tone="warning">Dublin fraud reports</KickerLabel>
            <Text style={[typography.caption, styles.alertSub]}>
              €385K reported lost · 160 cases
            </Text>
          </View>
        </View>
      </CardSurface>

      <View style={styles.section}>
        <KickerLabel tone="muted">Patterns we watch</KickerLabel>
        <View style={styles.patternList}>
          {(patterns.data ?? []).map((p) => (
            <Pressable
              key={p.id}
              onPress={() => setOpen(p)}
              style={({ pressed }) => [
                styles.patternRow,
                pressed && { opacity: 0.6 },
              ]}
            >
              <IconChip
                glyph={PATTERN_GLYPHS[p.id] ?? "·"}
                tone="default"
                size="md"
              />
              <View style={{ flex: 1 }}>
                <Text style={typography.bodyStrong}>{p.title}</Text>
                <Text style={typography.caption}>{p.ask}</Text>
              </View>
              <Text style={styles.chev}>›</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <CardSurface variant="accent" rail style={styles.pbsaCard}>
        <KickerLabel tone="primary">Verified PBSA</KickerLabel>
        <Text style={[typography.bodyStrong, styles.pbsaTitle]}>
          Skip the patterns. Use group-apply.
        </Text>
        <Text style={typography.caption}>
          aparto · Yugo · Fresh · Mezzino — verified partners only.
        </Text>
        <Pressable
          onPress={() => router.push("/(app)/profile/group-apply")}
          hitSlop={6}
          style={styles.pbsaCta}
        >
          <Text
            style={[typography.bodyStrong, { color: theme.colors.primaryFg }]}
          >
            Open group-apply →
          </Text>
        </Pressable>
      </CardSurface>

      <Pressable
        onPress={() => router.push("/(app)/safety/resources")}
        style={({ pressed }) => [styles.mhLink, pressed && { opacity: 0.7 }]}
      >
        <IconChip glyph="🆘" tone="primary" size="sm" />
        <View style={{ flex: 1 }}>
          <Text style={typography.bodyStrong}>Crisis resources</Text>
          <Text style={typography.caption}>India · Ireland · Germany</Text>
        </View>
        <Text style={styles.chev}>›</Text>
      </Pressable>

      {/* SCM-B Pattern detail modal */}
      <Modal
        visible={open !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(null)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setOpen(null)}>
          <View />
        </Pressable>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          {open ? (
            <ScrollView contentContainerStyle={styles.sheetBody}>
              <View style={styles.sheetTopRow}>
                <IconChip
                  glyph={PATTERN_GLYPHS[open.id] ?? "·"}
                  tone="warning"
                  size="lg"
                />
                <Pressable
                  onPress={() => setOpen(null)}
                  hitSlop={10}
                  style={styles.sheetClose}
                >
                  <Text style={styles.sheetCloseText}>✕</Text>
                </Pressable>
              </View>

              <Text style={styles.sheetTitle}>{open.title}</Text>

              <View style={styles.sheetSection}>
                <KickerLabel tone="warning">The ask</KickerLabel>
                <Text style={styles.sheetText}>{open.ask}</Text>
              </View>

              <View style={styles.sheetSection}>
                <KickerLabel tone="muted">Red flag</KickerLabel>
                <Text style={styles.sheetText}>{open.redFlag}</Text>
              </View>

              <View style={styles.sheetSection}>
                <KickerLabel tone="primary">Safer path</KickerLabel>
                <Text style={styles.sheetText}>{open.saferPath}</Text>
              </View>

              <Pressable
                onPress={() => {
                  setOpen(null);
                  router.push("/(app)/profile/report");
                }}
                style={styles.reportCta}
              >
                <Text
                  style={[
                    typography.bodyStrong,
                    { color: theme.colors.primaryFg },
                  ]}
                >
                  Report this pattern
                </Text>
              </Pressable>
            </ScrollView>
          ) : null}
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing[4],
  },
  back: {
    color: theme.colors.fg,
    fontSize: 22,
    width: 32,
  },
  hero: {
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[6],
  },
  alertCard: {
    marginBottom: theme.spacing[6],
  },
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  alertSub: {
    marginTop: theme.spacing[1],
  },
  section: {
    gap: theme.spacing[3],
    marginBottom: theme.spacing[6],
  },
  patternList: {
    gap: theme.spacing[2],
  },
  patternRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    padding: theme.spacing[4],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  chev: {
    fontSize: 22,
    color: theme.colors.fgSubtle,
  },
  pbsaCard: {
    gap: theme.spacing[2],
    marginBottom: theme.spacing[5],
  },
  pbsaTitle: {
    fontSize: 18,
    marginTop: theme.spacing[1],
  },
  pbsaCta: {
    marginTop: theme.spacing[3],
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  mhLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    padding: theme.spacing[4],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: "85%",
    backgroundColor: theme.colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    paddingTop: 8,
    paddingBottom: 24,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.borderStrong,
    alignSelf: "center",
    marginBottom: theme.spacing[3],
  },
  sheetBody: {
    paddingHorizontal: theme.spacing[6],
    paddingBottom: theme.spacing[8],
  },
  sheetTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing[4],
  },
  sheetClose: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetCloseText: {
    fontSize: 20,
    color: theme.colors.fgSubtle,
  },
  sheetTitle: {
    fontFamily: theme.fontFamily.heading,
    fontSize: 32,
    fontWeight: "600",
    color: theme.colors.fg,
    letterSpacing: -1,
    lineHeight: 36,
    marginBottom: theme.spacing[6],
  },
  sheetSection: {
    gap: theme.spacing[2],
    marginBottom: theme.spacing[5],
  },
  sheetText: {
    fontFamily: theme.fontFamily.body,
    fontSize: 16,
    color: theme.colors.fg,
    lineHeight: 24,
  },
  reportCta: {
    height: 52,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing[4],
  },
});
