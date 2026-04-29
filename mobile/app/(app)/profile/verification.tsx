import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { Pill } from "@/components/Pill";
import { CardSurface } from "@/components/CardSurface";
import { IconChip } from "@/components/IconChip";
import { KickerLabel } from "@/components/KickerLabel";
import { LoadingScreen } from "@/components/LoadingScreen";
import { theme, typography } from "@/theme";
import { services } from "@/lib/services";

/**
 * Y2 Verification stack detail. Surfaces the four anchors per the
 * brand promise §3.9 L11/L12: phone, identity, admit, DPDP consent.
 * Each shows state + verified-at timestamp. No technical hashes
 * surfaced — this is the user's "what's true about me on this app"
 * surface.
 */

export default function VerificationStackScreen() {
  const router = useRouter();

  const status = useQuery({
    queryKey: ["verification.status"],
    queryFn: () => services.verification.status(),
  });

  if (status.isLoading && !status.data) {
    return <LoadingScreen label="Loading your verifications" />;
  }

  const phone = "verified" as const; // Phase 1 mock — phone always verified by this point
  const identity = status.data?.identity.state;
  const admit = status.data?.admit.state;

  const totalVerified =
    [phone === "verified", identity === "verified", admit === "approved"]
      .filter(Boolean).length;

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Pill dot variant="primary">
          {totalVerified} of 3 verified
        </Pill>
      </View>

      <Hero title="The receipt." accent="What anchors you." size="lg" style={styles.hero} />

      <View style={styles.list}>
        <CheckCard
          glyph="📱"
          state="verified"
          label="Phone"
          sub="Hashed before storage"
          time="Today"
        />
        <CheckCard
          glyph="🪪"
          state={
            identity === "verified"
              ? "verified"
              : identity === "failed"
                ? "failed"
                : "pending"
          }
          label="Identity"
          sub="DigiLocker Aadhaar"
          time={identity === "verified" ? "Today" : "—"}
        />
        <CheckCard
          glyph="📄"
          state={
            admit === "approved"
              ? "verified"
              : admit === "rejected"
                ? "failed"
                : "pending"
          }
          label="Admit letter"
          sub={admit === "approved" ? "Approved by reviewer" : "Pending review"}
          time={admit === "approved" ? "Today" : "—"}
        />
        <CheckCard
          glyph="📜"
          state="verified"
          label="DPDP consent"
          sub="Privacy + terms · v2026-04"
          time="Today"
        />
      </View>

      <View style={styles.footer}>
        <KickerLabel tone="muted">Bans follow you</KickerLabel>
        <Text style={[typography.caption, { marginTop: theme.spacing[1] }]}>
          A new phone or new SIM doesn't reset who you are on this app.
        </Text>
      </View>
    </Screen>
  );
}

function CheckCard({
  glyph,
  state,
  label,
  sub,
  time,
}: {
  glyph: string;
  state: "verified" | "pending" | "failed";
  label: string;
  sub: string;
  time: string;
}) {
  const variant =
    state === "verified" ? "accent" : state === "failed" ? "warning" : "default";
  const tone =
    state === "verified" ? "primary" : state === "failed" ? "warning" : "default";
  const stateLabel =
    state === "verified" ? "✓ Verified" : state === "failed" ? "Failed" : "Pending";

  return (
    <CardSurface variant={variant} rail={state === "verified"} style={styles.card}>
      <View style={styles.cardRow}>
        <IconChip glyph={glyph} tone={tone} size="md" />
        <View style={{ flex: 1 }}>
          <Text style={typography.bodyStrong}>{label}</Text>
          <Text style={typography.caption}>{sub}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text
            style={{
              fontFamily: theme.fontFamily.mono,
              fontSize: 11,
              fontWeight: "600",
              color:
                state === "verified"
                  ? theme.colors.primary
                  : state === "failed"
                    ? theme.colors.warning
                    : theme.colors.fgSubtle,
              letterSpacing: 0.6,
              textTransform: "uppercase",
            }}
          >
            {stateLabel}
          </Text>
          <Text style={[typography.caption, { marginTop: 2 }]}>{time}</Text>
        </View>
      </View>
    </CardSurface>
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
  list: {
    gap: theme.spacing[3],
  },
  card: {
    paddingVertical: theme.spacing[4],
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[4],
  },
  footer: {
    marginTop: theme.spacing[6],
  },
});
