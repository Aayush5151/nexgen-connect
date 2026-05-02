import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { StepHeader } from "@/components/StepHeader";
import { LoadingScreen } from "@/components/LoadingScreen";
import { CardSurface } from "@/components/CardSurface";
import { IconChip } from "@/components/IconChip";
import { KickerLabel } from "@/components/KickerLabel";
import { theme, typography } from "@/theme";
import { services } from "@/lib/services";
import { useSession } from "@/store/session";
import { track, trackScreen } from "@/lib/analytics";
import { useReducedMotion } from "@/lib/security";

/**
 * O11 Admit outcome. Redesign:
 *   approved → big celebration check, hero "You're in.", 3-row stack
 *              of completed checks (with green dots), glow CTA into
 *              the corridor.
 *   rejected → muted hero "Almost there.", reviewer note as warning
 *              card, 2-tier CTA (resubmit + back).
 */

export default function AdmitOutcomeScreen() {
  const reduceMotion = useReducedMotion();
  void reduceMotion; // wired in §Bucket 10; durations consume in follow-up
  const router = useRouter();
  const markAdmitApproved = useSession((s) => s.markAdmitApproved);

  const status = useQuery({
    queryKey: ["verification.status"],
    queryFn: () => services.verification.status(),
  });

  const admit = status.data?.admit;
  const isApproved = admit?.state === "approved";
  const isRejected = admit?.state === "rejected";
  const canResubmit = admit?.state === "rejected" ? admit.canResubmit : false;

  const checkScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    trackScreen("o11_admit_outcome");
  }, []);

  useEffect(() => {
    if (isApproved) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      track({ name: "admit_approved" });
      markAdmitApproved();
      Animated.parallel([
        Animated.spring(checkScale, {
          toValue: 1,
          friction: 5,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(checkOpacity, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (isRejected) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      track({
        name: "admit_rejected",
        properties: { canResubmit },
      });
    }
  }, [isApproved, isRejected, canResubmit, markAdmitApproved, checkScale, checkOpacity]);

  if (!admit) {
    return <LoadingScreen label="Checking decision" />;
  }

  if (isApproved) {
    return (
      <Screen
        footer={
          <Button
            label="Open my corridor"
            onPress={() => router.replace("/(app)/corridor")}
            size="lg"
            variant="primary"
          />
        }
      >
        <StepHeader step={8} total={9} showBack={false} />

        <View style={styles.celebrate}>
          <Animated.View style={[{ transform: [{ scale: checkScale }], opacity: checkOpacity }]}>
            <IconChip glyph="✓" tone="primary" size="lg" />
          </Animated.View>
        </View>

        <View style={{ alignItems: "center" }}>
          <Pill dot variant="primary">
            Verified
          </Pill>
        </View>

        <Hero
          title="You're in."
          accent="Three checks. Done."
          size="xl"
          align="center"
          style={styles.hero}
        />

        <View style={styles.checks}>
          <CheckRow label="Phone OTP" />
          <CheckRow label="DigiLocker Aadhaar" />
          <CheckRow label="Admit letter" />
        </View>

        <View style={styles.note}>
          <KickerLabel tone="muted">DM unlock</KickerLabel>
          <Text style={[typography.caption, { marginTop: theme.spacing[1] }]}>
            Opens at 60 verified in your corridor.
          </Text>
        </View>
      </Screen>
    );
  }

  // Rejected
  const reason = admit.state === "rejected" ? admit.reason : "Unknown reason.";
  // canResubmit derived once at the top of the component (used by the
  // rejected-track useEffect). Reused here for the render branch.

  return (
    <Screen
      footer={
        <View style={{ gap: theme.spacing[2] }}>
          {canResubmit ? (
            <Button
              label="Re-upload admit"
              onPress={() => router.replace("/onboarding/admit-upload")}
              size="lg"
            />
          ) : (
            <Button label="Talk to a human" onPress={() => router.replace("/")} size="lg" />
          )}
          <Button
            label="Back to home"
            variant="tertiary"
            onPress={() => router.replace("/")}
            size="md"
          />
        </View>
      }
    >
      <StepHeader step={8} total={9} showBack={false} />

      <Pill variant="warning" dot>
        Review · returned
      </Pill>

      <Hero title="Almost there." accent="One thing to fix." size="lg" style={styles.hero} />

      <CardSurface variant="warning" rail style={styles.reasonCard}>
        <KickerLabel tone="warning">Reviewer note</KickerLabel>
        <Text style={[typography.body, { marginTop: theme.spacing[2] }]}>{reason}</Text>
      </CardSurface>

      <View style={styles.note}>
        <Text style={typography.caption}>
          {canResubmit ? "Most resubmissions clear in <24h." : "Named advisor in <4h."}
        </Text>
      </View>
    </Screen>
  );
}

function CheckRow({ label }: { label: string }) {
  return (
    <View style={styles.checkRow}>
      <IconChip glyph="✓" tone="primary" size="sm" />
      <Text style={[typography.bodyStrong, { flex: 1 }]}>{label}</Text>
      <Text style={[typography.mono, { color: theme.colors.primary }]}>Verified</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  celebrate: {
    alignItems: "center",
    marginTop: theme.spacing[6],
    marginBottom: theme.spacing[4],
  },
  hero: {
    marginTop: theme.spacing[5],
    marginBottom: theme.spacing[8],
  },
  checks: {
    gap: theme.spacing[4],
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    paddingVertical: theme.spacing[2],
  },
  reasonCard: {
    marginTop: theme.spacing[6],
  },
  note: {
    marginTop: theme.spacing[6],
  },
});
