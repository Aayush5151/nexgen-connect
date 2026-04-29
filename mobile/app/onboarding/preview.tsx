import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { Button } from "@/components/Button";
import { StepHeader } from "@/components/StepHeader";
import { CardSurface } from "@/components/CardSurface";
import { ProgressRing } from "@/components/ProgressRing";
import { ProgressBar } from "@/components/ProgressBar";
import { BigStat } from "@/components/BigStat";
import { KickerLabel } from "@/components/KickerLabel";
import { IconChip } from "@/components/IconChip";
import { Pill } from "@/components/Pill";
import { theme, typography } from "@/theme";

/**
 * O5 Live corridor preview. Real numbers, no theatre.
 *
 * Three concentric layers per build plan §3.6:
 *   - Corridor (home_city × destination × intake) — biggest stat
 *   - City (destination city, all intakes) — fallback
 *   - Country (destination country, all intakes) — broader fallback
 *
 * Plus the v5.1 Bayesian unlock-probability card with three buckets
 * (≥75% green / 30–75% amber / <30% red), each linking to the
 * fallback path the user gets if the corridor doesn't unlock.
 *
 * Numbers are mocked with realistic values seeded by destination uni.
 */

type Bucket = "high" | "mid" | "low";

const SEEDS: Record<
  string,
  { corridor: number; city: number; country: number; bucket: Bucket }
> = {
  UCD: { corridor: 47, city: 312, country: 1842, bucket: "high" },
  Trinity: { corridor: 38, city: 312, country: 1842, bucket: "mid" },
  DCU: { corridor: 22, city: 312, country: 1842, bucket: "mid" },
  "TU Dublin": { corridor: 19, city: 312, country: 1842, bucket: "mid" },
  Maynooth: { corridor: 12, city: 312, country: 1842, bucket: "low" },
  UCC: { corridor: 26, city: 84, country: 1842, bucket: "mid" },
  Galway: { corridor: 14, city: 71, country: 1842, bucket: "low" },
  "ATU Galway": { corridor: 9, city: 71, country: 1842, bucket: "low" },
  UL: { corridor: 11, city: 56, country: 1842, bucket: "low" },
  TUM: { corridor: 31, city: 248, country: 1455, bucket: "mid" },
  RWTH: { corridor: 18, city: 92, country: 1455, bucket: "mid" },
  "TU Berlin": { corridor: 22, city: 218, country: 1455, bucket: "mid" },
};

const THRESHOLD = 60;

export default function CorridorPreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    city?: string;
    uni?: string;
    intake?: string;
  }>();

  const uniShort = useMemo(() => {
    const raw = params.uni ?? "";
    return raw.split(" · ")[0] ?? "UCD";
  }, [params.uni]);

  const destCity = useMemo(() => {
    const raw = params.uni ?? "";
    return raw.split(" · ")[1] ?? "Dublin";
  }, [params.uni]);

  const seed = SEEDS[uniShort] ?? SEEDS.UCD;

  // Animated count-up for the corridor headline number.
  const animatedCount = useRef(new Animated.Value(0)).current;
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    const id = animatedCount.addListener(({ value }) => {
      setDisplayCount(Math.round(value));
    });
    Animated.timing(animatedCount, {
      toValue: seed.corridor,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => animatedCount.removeListener(id);
  }, [animatedCount, seed.corridor]);

  const progress = Math.min(1, seed.corridor / THRESHOLD);
  const remaining = Math.max(0, THRESHOLD - seed.corridor);

  const bucketCfg: Record<
    Bucket,
    { variant: "accent" | "warning" | "danger"; label: string; sub: string; tone: "primary" | "warning" | "danger" }
  > = {
    high: {
      variant: "accent",
      label: "High",
      sub: "Likely to unlock by intake",
      tone: "primary",
    },
    mid: {
      variant: "warning",
      label: "Building",
      sub: "City-level fallback if it stalls",
      tone: "warning",
    },
    low: {
      variant: "danger",
      label: "Early",
      sub: "Country-level fallback while you wait",
      tone: "danger",
    },
  };
  const cfg = bucketCfg[seed.bucket];

  return (
    <Screen
      footer={
        <Button
          label="Continue to verification"
          onPress={() => router.push("/onboarding/identity")}
          size="lg"
          variant="glow"
        />
      }
    >
      <StepHeader step={4} total={9} />

      <Pill dot variant="primary">
        Live · real numbers
      </Pill>

      <Hero
        title={`${params.city ?? "Mumbai"} → ${destCity}`}
        accent={params.intake ?? "September 2026"}
        size="xl"
        style={styles.hero}
      />

      {/* Hero corridor card */}
      <CardSurface variant="accent" rail style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View style={{ flex: 1 }}>
            <KickerLabel tone="primary" dot pulse>
              Verified
            </KickerLabel>
            <View style={styles.numberRow}>
              <Text style={styles.bigNum}>{displayCount}</Text>
              <Text style={styles.denom}>/ {THRESHOLD}</Text>
            </View>
            <Text style={styles.bigLabel}>
              {remaining > 0
                ? `${remaining} more · group chat opens`
                : "Live · group chat open"}
            </Text>
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

      {/* Probability card */}
      <CardSurface variant={cfg.variant} rail style={styles.probCard}>
        <View style={styles.probRow}>
          <IconChip
            glyph={seed.bucket === "high" ? "↑" : seed.bucket === "mid" ? "→" : "·"}
            tone={cfg.tone}
            size="md"
          />
          <View style={{ flex: 1 }}>
            <KickerLabel tone={cfg.tone}>Unlock probability</KickerLabel>
            <Text style={styles.probLabel}>{cfg.label}</Text>
            <Text style={typography.caption}>{cfg.sub}</Text>
          </View>
        </View>
      </CardSurface>

      {/* Fallback layers */}
      <View style={styles.layersHeader}>
        <KickerLabel tone="muted">If your group stays small</KickerLabel>
      </View>
      <View style={styles.layerRow}>
        <CardSurface variant="default" style={styles.layerCard}>
          <BigStat value={seed.city} label={`In ${destCity}`} size="md" />
        </CardSurface>
        <CardSurface variant="default" style={styles.layerCard}>
          <BigStat
            value={seed.country}
            label={destCity === "Munich" || destCity === "Berlin" || destCity === "Aachen" ? "Germany" : "Ireland"}
            size="md"
          />
        </CardSurface>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[6],
  },
  heroCard: {
    marginBottom: theme.spacing[4],
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[5],
  },
  numberRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: theme.spacing[2],
  },
  bigNum: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 80,
    fontWeight: "600",
    color: theme.colors.primary,
    letterSpacing: -3,
    lineHeight: 78,
  },
  denom: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 28,
    fontWeight: "500",
    color: theme.colors.fgSubtle,
    marginLeft: 8,
  },
  bigLabel: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.fgSubtle,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginTop: 8,
  },
  heroBar: {
    marginTop: theme.spacing[5],
  },
  probCard: {
    marginBottom: theme.spacing[6],
  },
  probRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[4],
  },
  probLabel: {
    fontFamily: theme.fontFamily.heading,
    fontSize: 22,
    fontWeight: "600",
    color: theme.colors.fg,
    letterSpacing: -0.6,
    marginTop: 2,
    marginBottom: 2,
  },
  layersHeader: {
    marginBottom: theme.spacing[3],
  },
  layerRow: {
    flexDirection: "row",
    gap: theme.spacing[3],
  },
  layerCard: {
    flex: 1,
  },
});
