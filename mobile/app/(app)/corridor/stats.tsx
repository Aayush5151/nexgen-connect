import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { CardSurface } from "@/components/CardSurface";
import { KickerLabel } from "@/components/KickerLabel";
import { LoadingScreen } from "@/components/LoadingScreen";
import { BigStat } from "@/components/BigStat";
import { Pill } from "@/components/Pill";
import { theme, typography } from "@/theme";
import { services } from "@/lib/services";
import {
  CORRIDOR_LAYER_2_UNLOCK,
  CORRIDOR_LAYER_1_UNLOCK,
  CORRIDOR_LAYER_3_FALLBACK_MIN,
} from "@nexgen-connect/shared";

/**
 * CH2 — Corridor stats detail.
 *
 * v6 §5.2 carry-forward — the deeper, layer-by-layer numerical surface
 * the user reaches by tapping the headline count on CH1. CH1 stays
 * lean (one big number + one pinned card); the user who wants the full
 * picture lands here.
 *
 * Three layered cards, top-down:
 *   1. Layer 2 — destination × intake (primary)
 *   2. Layer 1 — home × dest × intake (hometown crew, affinity)
 *   3. Layer 3 — destination city ambient (fallback)
 *
 * Each card shows: count vs threshold, status pill (live / forming /
 * pre-form), unlock-probability disclosure when honesty matters
 * (v15 BP §3.5 — sub-40% Layer 1 cohorts get a bridge offer).
 *
 * No mutations on this screen — it's a deep-look surface, not an
 * action surface. Tap-back returns to CH1.
 */

export default function CorridorStatsScreen() {
  const router = useRouter();

  const corridor = useQuery({
    queryKey: ["corridor.me"],
    queryFn: () => services.corridor.me(),
  });
  const members = useQuery({
    queryKey: ["corridor.members"],
    queryFn: () => services.corridor.members(),
  });

  const layer2Count = corridor.data?.verifiedCount ?? 0;
  const layer1Count = corridor.data?.memberCountL1 ?? 0;
  // Layer 3 is a destination-city rollup. v6 spec mocks ~312 across
  // Dublin in the §5.2 sample. Real impl pulls from a service.
  const layer3Count = 312;

  const layer1Probability = useMemo(() => {
    // Honest probability — % of Layer 2 cohort sharing the user's
    // home_city, projected to corridor close. v15 BP §3.5 Bayesian.
    // Mocked here as count/threshold for simplicity; real impl uses
    // a server-side Bayesian projection.
    if (layer1Count >= CORRIDOR_LAYER_1_UNLOCK) return 1;
    return Math.min(1, layer1Count / CORRIDOR_LAYER_1_UNLOCK);
  }, [layer1Count]);

  if (corridor.isLoading || !corridor.data) {
    return <LoadingScreen label="Loading corridor stats" />;
  }

  const layer2Unlocked = corridor.data.unlocked;
  const layer1Unlocked = layer1Count >= CORRIDOR_LAYER_1_UNLOCK;

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>←</Text>
        </Pressable>
      </View>

      <Hero
        title="Your corridor."
        accent="By the numbers."
        size="lg"
        style={styles.hero}
      />

      {/* Layer 2 — primary surface. Almost always unlocked at this
          point; the user reaches CH2 from CH1 which only renders
          when Layer 2 is past forming. */}
      <CardSurface variant="accent" rail style={styles.card}>
        <View style={styles.cardHeader}>
          <KickerLabel tone="primary" dot pulse>
            Layer 2 · Group chat
          </KickerLabel>
          <Pill variant={layer2Unlocked ? "primary" : "neutral"}>
            {layer2Unlocked ? "Live" : "Forming"}
          </Pill>
        </View>
        <BigStat
          value={layer2Count}
          denom={layer2Unlocked ? undefined : CORRIDOR_LAYER_2_UNLOCK}
          label={
            layer2Unlocked
              ? `${corridor.data.destination} · ${corridor.data.intakeMonth}`
              : `${CORRIDOR_LAYER_2_UNLOCK - layer2Count} more to unlock`
          }
          accent
          size="xl"
        />
        <Text style={[typography.caption, styles.cardBody]}>
          The destination × intake cohort. v15 BP §3.2 — the primary
          surface. {members.data?.length ?? 0} verified members are
          reachable in the group chat right now.
        </Text>
      </CardSurface>

      {/* Layer 1 — hometown crew. */}
      <CardSurface variant="default" rail style={styles.card}>
        <View style={styles.cardHeader}>
          <KickerLabel tone={layer1Unlocked ? "primary" : "muted"}>
            Layer 1 · Hometown crew
          </KickerLabel>
          <Pill variant={layer1Unlocked ? "primary" : "neutral"}>
            {layer1Unlocked ? "Live" : "Forming"}
          </Pill>
        </View>
        <BigStat
          value={layer1Count}
          denom={layer1Unlocked ? undefined : CORRIDOR_LAYER_1_UNLOCK}
          label={`${corridor.data.homeCity} → ${corridor.data.destination}`}
          size="lg"
        />
        <Text style={[typography.caption, styles.cardBody]}>
          Affinity sub-group nested under Layer 2 — the smaller, slower
          thread of people you'll likely fly out with.
        </Text>

        {/* Honest probability disclosure for sub-40% corridors per
            v15 BP §3.5. Tells the user "your hometown crew may not
            unlock — here's the bridge offer." */}
        {!layer1Unlocked && layer1Probability < 0.4 ? (
          <View style={styles.honestDisclosure}>
            <KickerLabel tone="warning">Honest projection</KickerLabel>
            <Text style={[typography.body, styles.honestBody]}>
              Hometown crew unlock probability: ~
              {Math.round(layer1Probability * 100)}%. If your corridor
              doesn&apos;t reach {CORRIDOR_LAYER_1_UNLOCK} verified, we
              offer a bridge into the next-closest city's hometown crew.
              No charge for the bridge.
            </Text>
          </View>
        ) : null}
      </CardSurface>

      {/* Layer 3 — destination-city ambient. Fallback feed for users
          whose Layer 2 may be slow to form. */}
      <CardSurface variant="default" style={styles.card}>
        <View style={styles.cardHeader}>
          <KickerLabel tone="muted">Layer 3 · City ambient</KickerLabel>
          <Pill variant="neutral">Always-on</Pill>
        </View>
        <BigStat
          value={layer3Count}
          label={`Across ${corridor.data.destination} this season`}
          size="lg"
        />
        <Text style={[typography.caption, styles.cardBody]}>
          Broader fallback feed across the destination city. Surfaces
          when Layer 2 hasn&apos;t reached the {CORRIDOR_LAYER_3_FALLBACK_MIN}-floor
          yet.
        </Text>
      </CardSurface>

      <Text style={[typography.caption, styles.footer]}>
        v15 BP §3.2 layered architecture. Tap any card on CH1 to act.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    marginBottom: theme.spacing[3],
  },
  back: {
    color: theme.colors.fg,
    fontSize: 22,
    width: 32,
  },
  hero: {
    marginBottom: theme.spacing[5],
  },
  card: {
    gap: theme.spacing[3],
    marginBottom: theme.spacing[4],
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardBody: {
    color: theme.colors.fgMuted,
    lineHeight: 18,
  },
  honestDisclosure: {
    gap: theme.spacing[2],
    paddingTop: theme.spacing[3],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  honestBody: {
    color: theme.colors.fgMuted,
    lineHeight: 20,
  },
  footer: {
    color: theme.colors.fgSubtle,
    textAlign: "center",
    marginTop: theme.spacing[4],
  },
});
