import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Heading } from "@/components/Heading";
import { Avatar } from "@/components/Avatar";
import { Pill } from "@/components/Pill";
import { Hairline } from "@/components/Hairline";
import { theme, typography } from "@/theme";
import { services } from "@/lib/services";
import { useSession } from "@/store/session";
import { maskE164 } from "@/lib/utils/phone";

/**
 * Profile home — settings + Premium + parent view + report. Acts as
 * the launchpad for every account-level action. Layout is a
 * three-section stack:
 *
 *   1. Identity card (avatar + masked phone + verification status)
 *   2. Plan card (Free / Premium with upsell or receipt)
 *   3. Quick actions: Parent dashboard, Report a concern, Sign out
 */

export default function ProfileScreen() {
  const router = useRouter();
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

  const onSignOut = () => {
    clear();
    router.replace("/");
  };

  return (
    <Screen>
      <Heading level="h2">You</Heading>

      {/* Identity card */}
      <View style={styles.identityCard}>
        <Avatar initials="YO" size="lg" tone="primary" />
        <View style={styles.identityMeta}>
          <Text style={typography.bodyStrong}>
            {phone ? maskE164(phone.e164) : "—"}
          </Text>
          <Text style={typography.caption}>
            {verification.data?.identity.state === "verified" ? (
              "Identity verified"
            ) : (
              "Identity pending"
            )}{" "}
            ·{" "}
            {verification.data?.admit.state === "approved"
              ? "Admit approved"
              : verification.data?.admit.state === "pending"
                ? "Admit under review"
                : verification.data?.admit.state === "rejected"
                  ? "Admit needs attention"
                  : "Admit not uploaded"}
          </Text>
        </View>
      </View>

      <Hairline />

      {/* Plan card */}
      <View style={styles.section}>
        <Text style={[typography.mono, styles.kicker]}>Plan</Text>
        <Pressable
          onPress={() => router.push("/(app)/profile/premium")}
          style={({ pressed }) => [styles.planCard, pressed && { opacity: 0.7 }]}
        >
          {isPremium ? (
            <>
              <Pill dot variant="primary">
                Premium · active
              </Pill>
              <Text style={[typography.bodyStrong, styles.planLine]}>
                One-time unlock active
              </Text>
              <Text style={typography.caption}>
                Receipt, parent view, group-apply housing, advisor calls.
                Tap to manage.
              </Text>
            </>
          ) : (
            <>
              <Pill variant="neutral">Free · default</Pill>
              <Text style={[typography.bodyStrong, styles.planLine]}>
                Upgrade to Premium · ₹1,499 one-time
              </Text>
              <Text style={typography.caption}>
                Priority matching, parent view, group-apply housing, 30-min
                human call within 24 hours of any question.
              </Text>
              <Text
                style={[
                  typography.bodyStrong,
                  { color: theme.colors.primary, marginTop: theme.spacing[2] },
                ]}
              >
                See what&apos;s included →
              </Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Quick actions */}
      <View style={styles.section}>
        <Text style={[typography.mono, styles.kicker]}>Actions</Text>

        <ActionRow
          label="Parent view"
          hint="Read-only dashboard for your parents. Status only, never DMs."
          onPress={() => router.push("/(app)/profile/parent")}
          locked={!isPremium}
          lockedHint="Premium"
        />

        <ActionRow
          label="Group-apply housing"
          hint="3-6 verified students into one PBSA application."
          onPress={() => router.push("/(app)/profile/group-apply")}
          locked={!isPremium}
          lockedHint="Premium"
        />

        <ActionRow
          label="Report a concern"
          hint="Routes to a named Trust & Safety advisor. 4h business / 30-min imminent harm."
          onPress={() => router.push("/(app)/profile/report")}
        />

        <ActionRow
          label="Settings"
          hint="Notifications, language, account deletion, data export."
          onPress={() => router.push("/(app)/profile/settings")}
        />

        <ActionRow
          label="Sign out"
          hint="Clears the session. Verification facts stay (you'll re-OTP next time)."
          onPress={onSignOut}
          variant="destructive"
        />
      </View>
    </Screen>
  );
}

function ActionRow({
  label,
  hint,
  onPress,
  locked,
  lockedHint,
  variant = "neutral",
}: {
  label: string;
  hint: string;
  onPress: () => void;
  locked?: boolean;
  lockedHint?: string;
  variant?: "neutral" | "destructive";
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionRow,
        pressed && { opacity: 0.6 },
      ]}
    >
      <View style={{ flex: 1 }}>
        <View style={styles.actionRowTop}>
          <Text
            style={[
              typography.bodyStrong,
              variant === "destructive" && { color: theme.colors.danger },
            ]}
          >
            {label}
          </Text>
          {locked ? (
            <View style={styles.lockedTag}>
              <Text style={styles.lockedTagText}>{lockedHint ?? "Locked"}</Text>
            </View>
          ) : null}
        </View>
        <Text style={typography.caption}>{hint}</Text>
      </View>
      <Text style={[typography.bodyStrong, { color: theme.colors.fgSubtle }]}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  identityCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[4],
    paddingVertical: theme.spacing[5],
  },
  identityMeta: { flex: 1, gap: 4 },
  section: {
    paddingVertical: theme.spacing[5],
    gap: theme.spacing[4],
  },
  kicker: {
    color: theme.colors.fgSubtle,
  },
  planCard: {
    padding: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing[2],
  },
  planLine: {
    marginTop: theme.spacing[2],
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing[4],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing[3],
  },
  actionRowTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  lockedTag: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  lockedTagText: {
    color: theme.colors.primary,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
    fontFamily: theme.fontFamily.mono,
  },
});
