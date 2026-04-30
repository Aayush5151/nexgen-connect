import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { StepHeader } from "@/components/StepHeader";
import { CardSurface } from "@/components/CardSurface";
import { IconChip } from "@/components/IconChip";
import { KickerLabel } from "@/components/KickerLabel";
import { theme, typography } from "@/theme";
import { services } from "@/lib/services";
import { PREMIUM_PRICE_DISPLAY } from "@nexgen-connect/shared";
import { useCopy } from "@/lib/copy";
import { track, trackScreen } from "@/lib/analytics";

/**
 * PR1 Premium upsell. Redesign: hero amount + 4 icon-led benefit
 * cards + glow CTA + compact refund rail. The pitch lands as
 * gratitude amplification, not feature-gate.
 *
 * v15 BP §5.2 reprice — "priority match" was retired for contradicting
 * the L8 brand promise (we don't gatekeep verified-cohort access by
 * tier). It's replaced by "arrival check-in" — a parent-pay value-prop
 * that lands in the highest-anxiety window (the first 7 days in
 * destination). The Y6 surface (mobile/app/(app)/profile/arrival-checkin.tsx)
 * ships in P1; this card is the marketing pre-cursor.
 */

const FEATURES: { glyph: string; title: string; sub: string }[] = [
  { glyph: "🛬", title: "Arrival check-in", sub: "Day 0–7 · 1-tap help" },
  { glyph: "🏠", title: "Group-apply", sub: "3–6 student PBSA bundle" },
  { glyph: "👨‍👩‍👧", title: "Parent view", sub: "Read-only · never DMs" },
  { glyph: "📞", title: "Advisor call", sub: "30 min · within 24h" },
];

export default function PremiumScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const tp = useCopy("premium");

  const status = useQuery({
    queryKey: ["premium.status"],
    queryFn: () => services.premium.status(),
  });

  const [error, setError] = useState<string | null>(null);

  // v6 §21 telemetry — surface mount + upsell view event.
  useEffect(() => {
    trackScreen("pr1_premium");
    if (!status.data?.active) track({ name: "premium_upsell_viewed" });
  }, [status.data?.active]);

  const checkout = useMutation({
    mutationFn: async () => {
      const start = await services.premium.startCheckout();
      const result = await services.premium.confirmCheckout({
        razorpayOrderId: start.razorpayOrderId,
      });
      return result;
    },
    onMutate: () => {
      track({
        name: "premium_unlock_attempted",
        properties: { source: "pr1" },
      });
    },
    onSuccess: () => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      track({ name: "premium_unlock_succeeded" });
      qc.invalidateQueries({ queryKey: ["premium.status"] });
    },
    onError: (e) => {
      const reason = e instanceof Error ? e.message : "Checkout failed";
      track({ name: "premium_unlock_failed", properties: { reason } });
      setError(reason);
    },
  });

  const isActive = status.data?.active ?? false;

  if (isActive) {
    return (
      <Screen
        footer={
          <Button
            label="Back to profile"
            variant="secondary"
            onPress={() => router.back()}
            size="lg"
          />
        }
      >
        <StepHeader label="Premium" step={0} total={1} />

        <Pill dot variant="primary">
          Active
        </Pill>

        <Hero
          title={tp("pr3.active.heading")}
          accent={tp("pr3.active.accent")}
          size="lg"
          style={styles.heroBlock}
        />

        <CardSurface variant="accent" rail style={styles.activeCard}>
          <KickerLabel tone="primary">{tp("pr3.active.receipt")}</KickerLabel>
          <Text style={[typography.bodyStrong, styles.receiptId]}>
            {status.data?.receiptId ?? "—"}
          </Text>
          <View style={styles.featureGrid}>
            {FEATURES.map((f) => (
              <FeatureTile key={f.title} {...f} active />
            ))}
          </View>
        </CardSurface>

        <Pressable
          onPress={() => router.push("/(app)/profile/receipts")}
          style={({ pressed }) => [
            styles.receiptsLink,
            pressed && { opacity: 0.6 },
          ]}
        >
          <Text style={styles.receiptsLinkText}>View receipts →</Text>
        </Pressable>

        {/* Y6 first-week arrival check-in entry. v15 BP §5.2 — without
            this link, the marketing card promise is dead text. Lands
            here in active state because the user has paid; the Y6
            surface itself is window-gated to Day 0–7 in destination. */}
        <Pressable
          onPress={() => router.push("/(app)/profile/arrival-checkin")}
          style={({ pressed }) => [
            styles.receiptsLink,
            pressed && { opacity: 0.6 },
          ]}
        >
          <Text style={styles.receiptsLinkText}>Arrival check-in →</Text>
        </Pressable>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <View style={{ gap: theme.spacing[2] }}>
          <Button
            label={`Unlock · ${PREMIUM_PRICE_DISPLAY}`}
            onPress={() => checkout.mutate()}
            loading={checkout.isPending}
            size="lg"
            variant="glow"
          />
          <Text style={[typography.caption, { textAlign: "center" }]}>
            One-time. Never a subscription.
          </Text>
        </View>
      }
    >
      <StepHeader label="Premium" step={0} total={1} />

      <Pill variant="neutral">{PREMIUM_PRICE_DISPLAY} · once</Pill>

      <Hero
        title="One unlock."
        accent="Never a sub."
        size="xl"
        style={styles.heroBlock}
      />

      <View style={styles.featureGrid}>
        {FEATURES.map((f) => (
          <FeatureTile key={f.title} {...f} />
        ))}
      </View>

      <View style={styles.refundSection}>
        <KickerLabel tone="muted">Refunds</KickerLabel>
        <Text style={[typography.body, styles.refundOneLine]}>
          7 days, harassment exit, or unlock failure.
        </Text>
      </View>

      {error ? (
        <Text style={[typography.errorText, styles.errorLine]}>{error}</Text>
      ) : null}
    </Screen>
  );
}

function FeatureTile({
  glyph,
  title,
  sub,
  active = false,
}: {
  glyph: string;
  title: string;
  sub: string;
  active?: boolean;
}) {
  return (
    <View style={[styles.featTile, active && styles.featTileActive]}>
      <IconChip glyph={glyph} tone={active ? "primary" : "default"} size="md" />
      <Text style={typography.bodyStrong}>{title}</Text>
      <Text style={typography.caption}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroBlock: {
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[6],
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[3],
    marginTop: theme.spacing[3],
  },
  featTile: {
    flexBasis: "48%",
    flexGrow: 1,
    padding: theme.spacing[4],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing[2],
    minHeight: 110,
  },
  featTileActive: {
    borderColor: theme.colors.primary,
  },
  refundSection: {
    marginTop: theme.spacing[8],
    gap: theme.spacing[2],
  },
  refundOneLine: {
    color: theme.colors.fgMuted,
  },
  activeCard: {
    gap: theme.spacing[3],
  },
  receiptId: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 14,
    color: theme.colors.fg,
    letterSpacing: 0.6,
    marginBottom: theme.spacing[3],
  },
  errorLine: {
    marginTop: theme.spacing[4],
  },
  receiptsLink: {
    marginTop: theme.spacing[5],
    alignItems: "center",
    paddingVertical: theme.spacing[3],
  },
  receiptsLinkText: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.body,
    fontSize: 14,
    fontWeight: "600",
  },
});
