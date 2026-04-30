import { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { CardSurface } from "@/components/CardSurface";
import { IconChip } from "@/components/IconChip";
import { KickerLabel } from "@/components/KickerLabel";
import { LoadingScreen } from "@/components/LoadingScreen";
import { theme, typography } from "@/theme";
import { services } from "@/lib/services";
import type { CrisisResource } from "@/lib/services";

/**
 * MH-B Crisis resource library. Region-tabbed (IN/IE/DE) per BP
 * §16.MH3. NexGen never replaces clinical care — we route to
 * established services + our T&S advisor follows up.
 */

type Region = "IN" | "IE" | "DE";

const REGIONS: { key: Region; label: string; flag: string }[] = [
  { key: "IN", label: "India", flag: "🇮🇳" },
  { key: "IE", label: "Ireland", flag: "🇮🇪" },
  { key: "DE", label: "Germany", flag: "🇩🇪" },
];

export default function ResourcesScreen() {
  const router = useRouter();
  const [region, setRegion] = useState<Region>("IN");

  const resources = useQuery({
    queryKey: ["mentalHealth.resources", region],
    queryFn: () => services.mentalHealth.resources({ region }),
  });

  if (resources.isLoading && !resources.data) {
    return <LoadingScreen label="Loading resources" />;
  }

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>←</Text>
        </Pressable>
      </View>

      <Hero
        title="You're not alone."
        accent="A real human, on the line."
        size="lg"
        style={styles.hero}
      />

      {/* Region tabs */}
      <View style={styles.tabs}>
        {REGIONS.map((r) => {
          const active = region === r.key;
          return (
            <Pressable
              key={r.key}
              onPress={() => setRegion(r.key)}
              style={({ pressed }) => [
                styles.tab,
                active && styles.tabActive,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.flag}>{r.flag}</Text>
              <Text
                style={[
                  styles.tabLabel,
                  { color: active ? theme.colors.primary : theme.colors.fgMuted },
                ]}
              >
                {r.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.list}>
        {(resources.data ?? []).map((r) => (
          <ResourceCard key={r.name} resource={r} />
        ))}
      </View>

      <View style={styles.note}>
        <KickerLabel tone="muted">If it's right now</KickerLabel>
        <Text style={[typography.caption, { marginTop: theme.spacing[1] }]}>
          Tap a number to call. Tap the link to open chat.
        </Text>
      </View>
    </Screen>
  );
}

function ResourceCard({ resource }: { resource: CrisisResource }) {
  const onCall = () => {
    if (resource.phone) {
      void Linking.openURL(`tel:${resource.phone}`);
    }
  };
  const onWeb = () => {
    if (resource.url) {
      void Linking.openURL(resource.url);
    }
  };

  return (
    <CardSurface variant="default" rail style={styles.card}>
      <View style={styles.cardTop}>
        <IconChip glyph="📞" tone="primary" size="md" />
        <View style={{ flex: 1 }}>
          <Text style={typography.bodyStrong}>{resource.name}</Text>
          {resource.freeCall ? (
            <Text style={styles.freeChip}>Free · 24/7</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.actions}>
        {resource.phone ? (
          <Pressable
            onPress={onCall}
            style={({ pressed }) => [
              styles.cta,
              styles.ctaPrimary,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.ctaPrimaryText}>{resource.phone}</Text>
          </Pressable>
        ) : null}
        {resource.url ? (
          <Pressable
            onPress={onWeb}
            style={({ pressed }) => [
              styles.cta,
              styles.ctaGhost,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={styles.ctaGhostText}>Open chat →</Text>
          </Pressable>
        ) : null}
      </View>
    </CardSurface>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
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
  tabs: {
    flexDirection: "row",
    gap: theme.spacing[2],
    marginBottom: theme.spacing[5],
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing[2],
    height: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  tabActive: {
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(0,220,130,0.06)",
  },
  flag: {
    fontSize: 18,
  },
  tabLabel: {
    fontFamily: theme.fontFamily.body,
    fontSize: 14,
    fontWeight: "600",
  },
  list: {
    gap: theme.spacing[3],
  },
  card: {
    gap: theme.spacing[3],
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
  },
  freeChip: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.primary,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing[2],
  },
  cta: {
    flex: 1,
    height: 44,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  ctaPrimary: {
    backgroundColor: theme.colors.primary,
  },
  ctaPrimaryText: {
    color: theme.colors.primaryFg,
    fontFamily: theme.fontFamily.mono,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  ctaGhost: {
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  ctaGhostText: {
    color: theme.colors.fg,
    fontFamily: theme.fontFamily.body,
    fontSize: 14,
    fontWeight: "600",
  },
  note: {
    marginTop: theme.spacing[6],
  },
});
