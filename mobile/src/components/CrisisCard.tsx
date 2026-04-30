import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { CardSurface } from "@/components/CardSurface";
import { IconChip } from "@/components/IconChip";
import { KickerLabel } from "@/components/KickerLabel";
import { theme, typography } from "@/theme";

/**
 * MH-A Crisis card. Surfaces in-line when MH1 / MH16 / MH17
 * triggers fire. Empathic open, region-aware crisis line, advisor
 * chat, dismiss link. Per BP §16.18, dismissal mutes the keyword
 * classifier for that user for 48h (caller hooks the suppression).
 *
 * This component is intentionally framework-agnostic about WHEN it
 * shows — the chat thread and other surfaces decide that. Pass
 * `phone` to dial, `onAdvisor` to start the advisor chat,
 * `onDismiss` to acknowledge.
 */

type Props = {
  /** Phone number to dial. Region-resolved by caller. */
  phone?: string;
  /** Display label for the helpline. */
  helplineName?: string;
  /** Tap-handler for "Chat with a NexGen advisor". */
  onAdvisor?: () => void;
  /** Tap-handler for the dismiss link (also fires 48h suppression). */
  onDismiss?: () => void;
};

export function CrisisCard({
  phone = "022-2754-6669",
  helplineName = "iCall (TISS)",
  onAdvisor,
  onDismiss,
}: Props) {
  const router = useRouter();

  const onCall = () => {
    if (phone) void Linking.openURL(`tel:${phone}`);
  };

  return (
    <CardSurface variant="warning" rail style={styles.card}>
      <View style={styles.headerRow}>
        <IconChip glyph="🤍" tone="warning" size="md" />
        <View style={{ flex: 1 }}>
          <KickerLabel tone="warning">We noticed</KickerLabel>
          <Text style={styles.headline}>That sounded heavy.</Text>
        </View>
      </View>

      <Text style={styles.body}>
        You don't have to talk to us. You can talk to someone trained.
      </Text>

      <View style={styles.actions}>
        <Pressable
          onPress={onCall}
          style={({ pressed }) => [styles.cta, styles.ctaPrimary, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.ctaPrimaryText}>Call · {phone}</Text>
          <Text style={styles.helplineSub}>{helplineName}</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            if (onAdvisor) {
              onAdvisor();
            } else {
              router.push("/(app)/profile/report");
            }
          }}
          style={({ pressed }) => [styles.cta, styles.ctaGhost, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.ctaGhostText}>Talk to a NexGen advisor</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            if (onDismiss) onDismiss();
          }}
          style={({ pressed }) => [styles.dismiss, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.dismissText}>I'm okay, thanks</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => router.push("/(app)/help/resources")}
        hitSlop={6}
        style={styles.allLink}
      >
        <Text style={styles.allLinkText}>All resources →</Text>
      </Pressable>
    </CardSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing[4],
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
  },
  headline: {
    fontFamily: theme.fontFamily.heading,
    fontSize: 22,
    fontWeight: "600",
    color: theme.colors.fg,
    letterSpacing: -0.6,
    marginTop: 2,
  },
  body: {
    ...typography.body,
    color: theme.colors.fgMuted,
  },
  actions: {
    gap: theme.spacing[2],
  },
  cta: {
    height: 56,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing[4],
  },
  ctaPrimary: {
    backgroundColor: theme.colors.primary,
  },
  ctaPrimaryText: {
    color: theme.colors.primaryFg,
    fontFamily: theme.fontFamily.body,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  helplineSub: {
    color: theme.colors.primaryFg,
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginTop: 2,
    opacity: 0.7,
  },
  ctaGhost: {
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    height: 44,
  },
  ctaGhostText: {
    color: theme.colors.fg,
    fontFamily: theme.fontFamily.body,
    fontSize: 14,
    fontWeight: "600",
  },
  dismiss: {
    alignItems: "center",
    paddingVertical: theme.spacing[3],
  },
  dismissText: {
    color: theme.colors.fgSubtle,
    fontFamily: theme.fontFamily.body,
    fontSize: 14,
  },
  allLink: {
    alignItems: "center",
  },
  allLinkText: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.body,
    fontSize: 13,
    fontWeight: "600",
  },
});
