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
import { PREMIUM_PRICE_DISPLAY } from "@nexgen-connect/shared";

/**
 * PR4 Receipt history. Premium-anchored ledger: the one-time
 * unlock + any future refunds. Per BP §3.9 L15 + L8 — Premium is
 * one-time, never auto-renew; full refund on harassment exit.
 */

type Receipt = {
  id: string;
  kind: "unlock" | "refund";
  amount: string;
  method: string;
  date: string;
};

export default function ReceiptsScreen() {
  const router = useRouter();

  const status = useQuery({
    queryKey: ["premium.status"],
    queryFn: () => services.premium.status(),
  });

  if (status.isLoading && !status.data) {
    return <LoadingScreen label="Loading receipts" />;
  }

  // Phase-1 mock: derive a single receipt from the active flag. Real
  // impl reads from a transactions endpoint.
  const receipts: Receipt[] = status.data?.active
    ? [
        {
          id: status.data.receiptId ?? "RCP-MOCK-0001",
          kind: "unlock",
          amount: PREMIUM_PRICE_DISPLAY,
          method: "UPI · Razorpay",
          date: status.data.activatedAt ?? new Date().toISOString(),
        },
      ]
    : [];

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Pill variant="subtle">Premium</Pill>
      </View>

      <Hero
        title="Receipts."
        accent="One charge. Forever."
        size="lg"
        style={styles.hero}
      />

      {receipts.length === 0 ? (
        <CardSurface variant="default" rail style={styles.emptyCard}>
          <KickerLabel tone="muted">No receipts yet</KickerLabel>
          <Text
            style={[
              typography.bodyStrong,
              { marginTop: theme.spacing[2] },
            ]}
          >
            You're on the free tier.
          </Text>
          <Text style={typography.caption}>
            Premium is one-time, ever. Never a subscription.
          </Text>
          <Pressable
            onPress={() => router.push("/(app)/profile/premium")}
            style={({ pressed }) => [
              styles.emptyCta,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text
              style={[
                typography.bodyStrong,
                { color: theme.colors.primaryFg },
              ]}
            >
              See Premium →
            </Text>
          </Pressable>
        </CardSurface>
      ) : (
        <View style={styles.list}>
          {receipts.map((r) => (
            <ReceiptCard key={r.id} receipt={r} />
          ))}
        </View>
      )}

      <CardSurface variant="default" rail style={styles.policyCard}>
        <KickerLabel tone="primary">Refunds</KickerLabel>
        <Text style={[typography.body, styles.policyOneLine]}>
          7 days, harassment exit, or unlock failure.
        </Text>
      </CardSurface>
    </Screen>
  );
}

function ReceiptCard({ receipt }: { receipt: Receipt }) {
  const isRefund = receipt.kind === "refund";
  const dateLabel = formatDate(receipt.date);
  return (
    <CardSurface variant="default" style={styles.receiptCard}>
      <View style={styles.receiptRow}>
        <IconChip
          glyph={isRefund ? "↺" : "💎"}
          tone={isRefund ? "warning" : "primary"}
          size="md"
        />
        <View style={{ flex: 1 }}>
          <Text style={typography.bodyStrong}>
            {isRefund ? "Refund" : "Premium unlock"}
          </Text>
          <Text style={typography.caption}>
            {receipt.method} · {dateLabel}
          </Text>
        </View>
        <Text style={styles.receiptAmount}>
          {isRefund ? "−" : ""}
          {receipt.amount}
        </Text>
      </View>
      <View style={styles.receiptIdRow}>
        <KickerLabel tone="muted">Ref</KickerLabel>
        <Text style={styles.receiptIdText}>{receipt.id}</Text>
      </View>
    </CardSurface>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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
  receiptCard: {
    gap: theme.spacing[3],
  },
  receiptRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
  },
  receiptAmount: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.fg,
    letterSpacing: -0.4,
  },
  receiptIdRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    paddingTop: theme.spacing[3],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  receiptIdText: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 12,
    color: theme.colors.fgMuted,
    letterSpacing: 0.6,
  },
  emptyCard: {
    gap: theme.spacing[2],
  },
  emptyCta: {
    marginTop: theme.spacing[4],
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  policyCard: {
    marginTop: theme.spacing[6],
    gap: theme.spacing[2],
  },
  policyOneLine: {
    marginTop: theme.spacing[1],
  },
});
