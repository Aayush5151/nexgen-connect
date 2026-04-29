import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { Avatar } from "@/components/Avatar";
import { Pill } from "@/components/Pill";
import { LoadingScreen } from "@/components/LoadingScreen";
import { CardSurface } from "@/components/CardSurface";
import { IconChip } from "@/components/IconChip";
import { KickerLabel } from "@/components/KickerLabel";
import { Button } from "@/components/Button";
import { theme, typography } from "@/theme";
import { services } from "@/lib/services";
import { useSession } from "@/store/session";
import { maskE164 } from "@/lib/utils/phone";
import { PREMIUM_PRICE_DISPLAY } from "@nexgen-connect/shared";

/**
 * Profile home (Y1). Redesign: identity hero + plan card + icon-led
 * action grid. Less prose, more visual.
 */

export default function ProfileScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const phone = useSession((s) => s.phone);
  const clear = useSession((s) => s.clear);

  const premium = useQuery({
    queryKey: ["premium.status"],
    queryFn: () => services.premium.status(),
  });

  const verification = useQuery({
    queryKey: ["verification.status"],
    queryFn: () => services.verification.status(),
  });

  const isPremium = premium.data?.active ?? false;

  const profileLoading =
    (premium.isLoading && !premium.data) ||
    (verification.isLoading && !verification.data);

  const onSignOut = () => {
    clear();
    qc.clear();
    router.replace("/");
  };

  if (profileLoading) {
    return <LoadingScreen label="Loading your profile" />;
  }

  const identityVerified =
    verification.data?.identity.state === "verified";
  const admitState = verification.data?.admit.state;

  return (
    <Screen>
      <Hero title="You." accent="In a corridor." size="lg" />

      {/* Identity card — tappable, opens Y2 verification stack */}
      <CardSurface
        variant="default"
        onPress={() => router.push("/(app)/profile/verification")}
        style={styles.identityCard}
      >
        <View style={styles.identityRow}>
          <Avatar initials="YO" size="lg" tone="primary" />
          <View style={styles.identityMeta}>
            <Text style={typography.bodyStrong}>
              {phone ? maskE164(phone.e164) : "—"}
            </Text>
            <Text style={typography.caption}>
              Pune → Dublin · Sept 2026
            </Text>
          </View>
          <Text style={styles.chev}>›</Text>
        </View>
        <View style={styles.checkRow}>
          <CheckPill label="Phone" on />
          <CheckPill label="Identity" on={identityVerified} />
          <CheckPill
            label="Admit"
            on={admitState === "approved"}
            warn={admitState === "pending"}
          />
        </View>
      </CardSurface>

      {/* Plan */}
      <View style={styles.section}>
        <KickerLabel tone="muted">Plan</KickerLabel>
        <CardSurface
          variant={isPremium ? "accent" : "default"}
          rail={isPremium}
          onPress={() => router.push("/(app)/profile/premium")}
          style={styles.planCard}
        >
          <View style={styles.planTop}>
            {isPremium ? (
              <Pill dot variant="primary">
                Premium · active
              </Pill>
            ) : (
              <Pill variant="neutral">Free · default</Pill>
            )}
            <Text style={styles.chev}>›</Text>
          </View>
          <Text style={[typography.bodyStrong, styles.planLine]}>
            {isPremium
              ? "One-time unlock active"
              : `Premium · ${PREMIUM_PRICE_DISPLAY} once`}
          </Text>
          <Text style={typography.caption}>
            {/* v15 BP §5.2 reprice — "priority match" retired (contradicted
                L8 brand promise), replaced by "arrival check-in". Active
                subtitle expanded to include the new feature too. */}
            {isPremium
              ? "Parent view · group-apply · arrival check-in · advisor calls"
              : "Parent view · group-apply · arrival check-in"}
          </Text>
        </CardSurface>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <KickerLabel tone="muted">Actions</KickerLabel>
        <View style={styles.actionGrid}>
          <ActionTile
            glyph="👨‍👩‍👧"
            label="Parent view"
            sub="Read-only"
            onPress={() => router.push("/(app)/profile/parent")}
            locked={!isPremium}
          />
          <ActionTile
            glyph="🏠"
            label="Group-apply"
            sub="3–6 students"
            onPress={() => router.push("/(app)/profile/group-apply")}
            locked={!isPremium}
          />
          <ActionTile
            glyph="⚠"
            label="Stay safe"
            sub="5 scam patterns"
            onPress={() => router.push("/(app)/safety")}
          />
          <ActionTile
            glyph="🛡"
            label="Report"
            sub="T&S advisor"
            onPress={() => router.push("/(app)/profile/report")}
          />
          <ActionTile
            glyph="⚙"
            label="Settings"
            sub="Push · language"
            onPress={() => router.push("/(app)/profile/settings")}
          />
        </View>
      </View>

      <Button
        label="Sign out"
        variant="ghost"
        size="md"
        onPress={onSignOut}
        style={{ marginTop: theme.spacing[6] }}
      />
    </Screen>
  );
}

function CheckPill({
  label,
  on,
  warn,
}: {
  label: string;
  on?: boolean;
  warn?: boolean;
}) {
  return (
    <View
      style={[
        styles.checkPill,
        on && styles.checkPillOn,
        warn && styles.checkPillWarn,
      ]}
    >
      <Text
        style={[
          styles.checkPillText,
          { color: on ? theme.colors.primary : warn ? theme.colors.warning : theme.colors.fgSubtle },
        ]}
      >
        {on ? "✓ " : warn ? "● " : "○ "}
        {label}
      </Text>
    </View>
  );
}

function ActionTile({
  glyph,
  label,
  sub,
  onPress,
  locked,
}: {
  glyph: string;
  label: string;
  sub: string;
  onPress: () => void;
  locked?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionTile,
        pressed && { opacity: 0.6 },
      ]}
    >
      <View style={styles.actionTop}>
        <IconChip glyph={glyph} tone={locked ? "default" : "primary"} size="md" />
        {locked ? (
          <View style={styles.premBadge}>
            <Text style={styles.premBadgeText}>PREMIUM</Text>
          </View>
        ) : null}
      </View>
      <Text style={typography.bodyStrong}>{label}</Text>
      <Text style={typography.caption}>{sub}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  identityCard: {
    marginTop: theme.spacing[6],
    gap: theme.spacing[4],
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[4],
  },
  identityMeta: { flex: 1, gap: 4 },
  checkRow: {
    flexDirection: "row",
    gap: theme.spacing[2],
    flexWrap: "wrap",
  },
  checkPill: {
    paddingVertical: 6,
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bg,
  },
  checkPillOn: {
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(0,220,130,0.06)",
  },
  checkPillWarn: {
    borderColor: theme.colors.warning,
    backgroundColor: "rgba(255,176,32,0.06)",
  },
  checkPillText: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
  },
  section: {
    marginTop: theme.spacing[6],
    gap: theme.spacing[3],
  },
  planCard: {
    gap: theme.spacing[2],
  },
  planTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  planLine: {
    marginTop: theme.spacing[2],
  },
  chev: {
    fontSize: 22,
    color: theme.colors.fgSubtle,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[3],
  },
  actionTile: {
    flexBasis: "48%",
    flexGrow: 1,
    padding: theme.spacing[4],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing[2],
    minHeight: 120,
  },
  actionTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing[2],
  },
  premBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  premBadgeText: {
    color: theme.colors.primary,
    fontSize: 9,
    fontWeight: "700",
    fontFamily: theme.fontFamily.mono,
    letterSpacing: 0.8,
  },
});
