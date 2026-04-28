import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Screen } from "@/components/Screen";
import { Heading } from "@/components/Heading";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { Hairline } from "@/components/Hairline";
import { StepHeader } from "@/components/StepHeader";
import { theme, typography, primaryTint } from "@/theme";
import { services } from "@/lib/services";
import { PREMIUM_PRICE_DISPLAY } from "@nexgen-connect/shared";

/**
 * PR1 Premium upsell — the four-feature pitch + checkout flow. The
 * pitch lands on what the user gets, never on what they "lose" by
 * not buying. Every feature is concrete + benefit-shaped:
 *
 *   1. Priority matching        (first seat when corridor unlocks)
 *   2. Group-apply housing      (3-6 student PBSA bundle)
 *   3. Parent view              (read-only dashboard)
 *   4. 30-min advisor call      (within 24h of any question)
 *
 * Below the fold:
 *   - Refund policy quick-reference (BP §16 M-series + Mobile E037)
 *   - One-time charge, no auto-renew, charge always shown before
 *     placement (BP §5.2 / L15)
 *
 * Mock checkout: tapping "Unlock Premium" runs startCheckout +
 * confirmCheckout sequentially with a fake order id. Real flow opens
 * the Razorpay native sheet.
 */

const FEATURES: Array<{ title: string; body: string }> = [
  {
    title: "Priority matching",
    body:
      "First seat when your corridor unlocks, first look at new members joining.",
  },
  {
    title: "Group-apply housing",
    body:
      "Bundle a 3 to 6 student PBSA application in one signature flow. Verified roommates only.",
  },
  {
    title: "Parent view",
    body:
      "Read-only dashboard for your parents: group size, verification, arrival time. Never your chats. Never your DMs.",
  },
  {
    title: "30-minute advisor call",
    body:
      "Within 24 hours of any question. A named human, not a chatbot script.",
  },
];

export default function PremiumScreen() {
  const router = useRouter();
  const qc = useQueryClient();

  const status = useQuery({
    queryKey: ["premium.status"],
    queryFn: () => services.premium.status(),
  });

  const [error, setError] = useState<string | null>(null);

  const checkout = useMutation({
    mutationFn: async () => {
      const start = await services.premium.startCheckout();
      // In real impl: open Razorpay native sheet here, await callback.
      // Mock: confirm immediately.
      const result = await services.premium.confirmCheckout({
        razorpayOrderId: start.razorpayOrderId,
      });
      return result;
    },
    onSuccess: () => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      qc.invalidateQueries({ queryKey: ["premium.status"] });
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Checkout failed"),
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

        <View style={styles.headingBlock}>
          <Heading level="h2" accent="thank you.">
            Premium —
          </Heading>
        </View>

        <Text style={[typography.body, styles.subhead]}>
          One-time charge processed. The four Premium features are now live
          on your account. Receipt:{" "}
          <Text style={typography.bodyStrong}>{status.data?.receiptId ?? "—"}</Text>.
        </Text>

        <View style={styles.activeCard}>
          {FEATURES.map((f) => (
            <FeatureRow key={f.title} title={f.title} body={f.body} active />
          ))}
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <View style={styles.footerCol}>
          <Button
            label={`Unlock Premium · ${PREMIUM_PRICE_DISPLAY}`}
            onPress={() => checkout.mutate()}
            loading={checkout.isPending}
            size="lg"
          />
          <Text style={[typography.caption, styles.footerNote]}>
            One-time. Never a subscription. You&apos;ll see the charge before
            it&apos;s placed.
          </Text>
        </View>
      }
    >
      <StepHeader label="Premium" step={0} total={1} />

      <Pill variant="neutral">{PREMIUM_PRICE_DISPLAY} · once</Pill>

      <View style={styles.headingBlock}>
        <Heading level="h2" accent="never a subscription.">
          One unlock,
        </Heading>
      </View>

      <Text style={[typography.body, styles.subhead]}>
        Premium adds four things. Pay once. Use them as long as you have an
        account. Every refund path is on /legal — we made it boringly easy.
      </Text>

      <View style={styles.featureCard}>
        {FEATURES.map((f, i) => (
          <View key={f.title}>
            {i > 0 ? <Hairline style={styles.featureSep} /> : null}
            <FeatureRow title={f.title} body={f.body} />
          </View>
        ))}
      </View>

      <View style={styles.refundCard}>
        <Text style={[typography.mono, { color: theme.colors.fgSubtle }]}>Refunds</Text>
        <RefundLine text="7-day no-questions full refund." />
        <RefundLine text="Confirmed harassment → full refund, regardless of when." />
        <RefundLine text="Corridor never unlocks within 8 weeks → full refund + bridge." />
        <RefundLine text="Compassionate (visa rejection, medical, family) at our discretion." />
      </View>

      {error ? <Text style={[typography.errorText, styles.errorLine]}>{error}</Text> : null}
    </Screen>
  );
}

function FeatureRow({
  title,
  body,
  active = false,
}: {
  title: string;
  body: string;
  active?: boolean;
}) {
  return (
    <View style={styles.featureRow}>
      <View
        style={[
          styles.featureDot,
          { backgroundColor: active ? theme.colors.primary : theme.colors.borderStrong },
        ]}
      />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={typography.bodyStrong}>{title}</Text>
        <Text style={typography.body}>{body}</Text>
      </View>
    </View>
  );
}

function RefundLine({ text }: { text: string }) {
  return (
    <View style={styles.refundLine}>
      <View style={styles.refundDot} />
      <Text style={[typography.caption, { flex: 1 }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headingBlock: { marginTop: theme.spacing[4] },
  subhead: {
    marginTop: theme.spacing[3],
    marginBottom: theme.spacing[6],
  },
  featureCard: {
    padding: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  featureSep: {
    marginVertical: theme.spacing[4],
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing[3],
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 7,
  },
  refundCard: {
    marginTop: theme.spacing[6],
    padding: theme.spacing[4],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing[2],
  },
  refundLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing[2],
    marginTop: theme.spacing[1],
  },
  refundDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
    marginTop: 8,
  },
  activeCard: {
    padding: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: primaryTint(0.04),
    gap: theme.spacing[5],
  },
  errorLine: {
    marginTop: theme.spacing[4],
  },
  footerCol: {
    gap: theme.spacing[3],
  },
  footerNote: {
    textAlign: "center",
  },
});
