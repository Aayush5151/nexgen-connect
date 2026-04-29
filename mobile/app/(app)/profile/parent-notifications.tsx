import { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { Pill } from "@/components/Pill";
import { CardSurface } from "@/components/CardSurface";
import { IconChip } from "@/components/IconChip";
import { KickerLabel } from "@/components/KickerLabel";
import { theme, typography } from "@/theme";

/**
 * PV4 Parent notification settings. What the parent gets pinged
 * about. Per BP §3.9 L4: parent dashboard is status-level only;
 * never names, never DMs, never member list.
 */

type Pref = {
  key: string;
  glyph: string;
  label: string;
  sub: string;
  defaultOn: boolean;
};

const PREFS: Pref[] = [
  {
    key: "unlock",
    glyph: "🔓",
    label: "Corridor unlock",
    sub: "The moment 60 verified",
    defaultOn: true,
  },
  {
    key: "verification",
    glyph: "✓",
    label: "Verification milestones",
    sub: "Phone · Identity · Admit",
    defaultOn: true,
  },
  {
    key: "arrival",
    glyph: "🛬",
    label: "Arrival window",
    sub: "T-24h · landing · T+4h",
    defaultOn: true,
  },
  {
    key: "imminent",
    glyph: "🆘",
    label: "Imminent-harm escalation",
    sub: "Only if T&S advisor escalates",
    defaultOn: true,
  },
  {
    key: "weekly",
    glyph: "📈",
    label: "Weekly digest",
    sub: "One quiet Sunday email",
    defaultOn: false,
  },
];

export default function ParentNotificationsScreen() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PREFS.map((p) => [p.key, p.defaultOn])),
  );

  const toggle = (key: string) =>
    setPrefs((cur) => ({ ...cur, [key]: !cur[key] }));

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Pill variant="subtle">Read-only · parent</Pill>
      </View>

      <Hero
        title="What pings them."
        accent="Status only."
        size="lg"
        style={styles.hero}
      />

      <CardSurface variant="default" padded={false}>
        {PREFS.map((p, i) => (
          <View key={p.key}>
            <View style={styles.row}>
              <IconChip
                glyph={p.glyph}
                tone={prefs[p.key] ? "primary" : "default"}
                size="sm"
              />
              <View style={{ flex: 1 }}>
                <Text style={typography.bodyStrong}>{p.label}</Text>
                <Text style={typography.caption}>{p.sub}</Text>
              </View>
              <Switch
                value={prefs[p.key] ?? false}
                onValueChange={() => toggle(p.key)}
                trackColor={{
                  false: theme.colors.borderStrong,
                  true: theme.colors.primary,
                }}
                thumbColor={theme.colors.fg}
                ios_backgroundColor={theme.colors.borderStrong}
              />
            </View>
            {i < PREFS.length - 1 ? <View style={styles.sep} /> : null}
          </View>
        ))}
      </CardSurface>

      <CardSurface variant="warning" rail style={styles.lockCard}>
        <KickerLabel tone="warning">Never sent</KickerLabel>
        <View style={styles.lockList}>
          <LockRow text="Names of corridor members" />
          <LockRow text="Any DM or chat content" />
          <LockRow text="The full member list" />
        </View>
      </CardSurface>
    </Screen>
  );
}

function LockRow({ text }: { text: string }) {
  return (
    <View style={styles.lockRow}>
      <Text style={styles.lockX}>✕</Text>
      <Text style={[typography.body, { flex: 1 }]}>{text}</Text>
    </View>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[4],
  },
  sep: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: 56,
  },
  lockCard: {
    marginTop: theme.spacing[6],
    gap: theme.spacing[3],
  },
  lockList: {
    gap: theme.spacing[2],
  },
  lockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
  },
  lockX: {
    color: theme.colors.warning,
    fontSize: 16,
    fontWeight: "700",
    width: 18,
  },
});
