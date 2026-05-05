import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { theme, primaryTint } from "@/theme";
import { useSession, useSessionHydrated } from "@/store/session";
import { useCopy } from "@/lib/copy";
import { track, trackScreen } from "@/lib/analytics";
import { useReducedMotion } from "@/lib/security";

/**
 * O1 Welcome — v2, "designed" pass.
 *
 * Composition principles applied:
 *   1. Atmospheric background. Two layered radial washes (one primary
 *      green, one cooler off-white) over true-black. Subtle, slow,
 *      always present. Replaces the flat black canvas that read as
 *      empty earlier.
 *   2. Vertical hierarchy with weight. The H1 is the loudest object
 *      on the screen — clamp 56–80pt. The serif italic accent is
 *      exactly half the size, sat tight against the H1. Body copy is
 *      generous but recessed.
 *   3. One trust card, not three rows. A single editorial card with
 *      mono kicker, three-line trust statement, and a vertical
 *      pulse-dot down the left rail. Reads like a signature, not a
 *      checklist.
 *   4. Micro-motion. Stagger-fade on mount: pill, headline, accent,
 *      subhead, trust card, CTAs each enter with a 120-180ms delay.
 *      Continue button has a soft halo that pulses every 4s — a
 *      restrained "tap me" without being pushy.
 *   5. Two-tier CTA. Primary "Continue" is the loudest object after
 *      the H1. Secondary "I already have an account" is a quiet text
 *      link below it — gives the returning-but-signed-out user a
 *      path without polluting the conversion surface.
 *   6. Auth-gate identical to v1. Hydration-aware splash, redirect to
 *      /(app)/corridor for verified returning users.
 *
 * Reanimated is wired but not used here — Animated (the legacy API)
 * is enough for a stagger-fade and keeps the bundle small. Heavier
 * choreography moves to Reanimated when we add the unlock-celebration
 * surface in Phase 2.
 */

export default function WelcomeScreen() {
  const reduceMotion = useReducedMotion();
  void reduceMotion; // wired in §Bucket 10; durations consume in follow-up
  const router = useRouter();
  const hydrated = useSessionHydrated();
  const sessionToken = useSession((s) => s.sessionToken);
  const admitApproved = useSession((s) => s.admitApproved);
  // v6 BP §3.4 / build §16 — one-time transparency toast for users whose
  // session-v1 blob was just nuked by the v2 migration (see session.ts
  // onRehydrateStorage). The flag persists until clearMigrationToast()
  // fires, so backgrounding the app pre-dismiss preserves the toast for
  // the next launch.
  const migratedFromV1 = useSession((s) => s.migratedFromV1);
  const clearMigrationToast = useSession((s) => s.clearMigrationToast);
  const t = useCopy("onboarding");

  // v6 §21 telemetry — onboarding_started fires once on cold start of
  // welcome for any unauthed user. trackScreen runs on every mount.
  useEffect(() => {
    trackScreen("welcome");
    if (!sessionToken) track({ name: "onboarding_started" });
  }, [sessionToken]);

  // Stagger-fade choreography. One Animated.Value per row, all
  // animated to 1 with cascading delays. Visible for ~600ms per
  // element, total budget under 1.4s.
  const fadePill = useRef(new Animated.Value(0)).current;
  const fadeHero = useRef(new Animated.Value(0)).current;
  const fadeAccent = useRef(new Animated.Value(0)).current;
  const fadeBody = useRef(new Animated.Value(0)).current;
  // Trust card removed in v3.1 patch — fadeCard kept for the
  // staggered cadence reference but the View it animated is gone.
  // Removing the value entirely so the loop has one fewer write.
  const fadeCta = useRef(new Animated.Value(0)).current;
  const haloPulse = useRef(new Animated.Value(0)).current;
  // Migration toast slide-in/out. Starts off-screen (-80) + invisible.
  const toastSlide = useRef(new Animated.Value(-80)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!hydrated) return;
    const stagger = (value: Animated.Value, delay: number) =>
      Animated.timing(value, {
        toValue: 1,
        duration: 700,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });
    Animated.parallel([
      stagger(fadePill, 60),
      stagger(fadeHero, 160),
      stagger(fadeAccent, 320),
      stagger(fadeBody, 480),
      stagger(fadeCta, 640),
    ]).start();

    // Slow halo on the primary CTA. Loops indefinitely.
    Animated.loop(
      Animated.sequence([
        Animated.timing(haloPulse, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(haloPulse, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [hydrated, fadePill, fadeHero, fadeAccent, fadeBody, fadeCta, haloPulse]);

  useEffect(() => {
    if (!hydrated) return;
    if (sessionToken && admitApproved) {
      router.replace("/(app)/corridor");
    }
  }, [hydrated, sessionToken, admitApproved, router]);

  // Migration toast slide-in + auto-dismiss. Fires when the session-v2
  // hydration cleared a legacy v1 blob. Auto-dismisses after 5s. The
  // flag is persisted, so backgrounding before the timer fires keeps
  // the toast queued for the next launch (only an explicit dismiss
  // — auto-timer or tap — flips migratedFromV1 to false).
  // v15 BP §3.4 schema-forced re-onboard transparency.
  useEffect(() => {
    if (!hydrated) return;
    if (!migratedFromV1) return;

    Animated.parallel([
      Animated.timing(toastSlide, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastSlide, {
          toValue: -80,
          duration: 280,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) clearMigrationToast();
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [hydrated, migratedFromV1, clearMigrationToast, toastSlide, toastOpacity]);

  const onContinue = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    track({ name: "onboarding_started" });
    router.push("/onboarding/phone");
  };

  const onDismissToast = () => {
    Animated.parallel([
      Animated.timing(toastSlide, {
        toValue: -80,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) clearMigrationToast();
    });
  };

  if (!hydrated) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  const haloScale = haloPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.04],
  });
  const haloOpacity = haloPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.18, 0.32],
  });

  return (
    <View style={styles.root}>
      {/* Atmospheric background. Two soft radial washes — one primary
          green at top center, one cool white at lower left — layered
          over true black. Reads as a designed surface, not a blank
          canvas. RN-Web renders these as CSS radial-gradient via the
          rare `boxShadow` trick; on native they fall through as flat
          tinted Views which is acceptable. */}
      <View style={styles.bgGreen} pointerEvents="none" />
      <View style={styles.bgCool} pointerEvents="none" />

      {/* v6 migration toast — only mounts when a legacy session-v1 blob
          was just cleared. Auto-dismisses after 5s OR on tap. v15 BP §3.4. */}
      {migratedFromV1 ? (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: toastOpacity,
              transform: [{ translateY: toastSlide }],
            },
          ]}
        >
          <Pressable
            onPress={onDismissToast}
            accessibilityRole="button"
            accessibilityLabel="Dismiss update notice"
            hitSlop={8}
          >
            <Text style={styles.toastTitle}>{t("welcome.migrationToast.title")}</Text>
            <Text style={styles.toastBody}>{t("welcome.migrationToast.body")}</Text>
            <Text style={styles.toastHint}>Tap to dismiss</Text>
          </Pressable>
        </Animated.View>
      ) : null}

      <ScrollView
        style={styles.scrollFlex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Pill */}
        <Animated.View
          style={[
            styles.kickerRow,
            { opacity: fadePill, transform: [{ translateY: shift(fadePill) }] },
          ]}
        >
          <View style={styles.pill}>
            <View style={styles.pillDot} />
            <View style={styles.pillDotPulse} />
            <Text style={styles.pillText}>Sept 2026 · Oct 2026</Text>
          </View>
        </Animated.View>

        {/* Hero — H1 + serif italic accent stacked tight */}
        <Animated.Text
          style={[
            styles.heroH1,
            { opacity: fadeHero, transform: [{ translateY: shift(fadeHero) }] },
          ]}
        >
          {t("welcome.heading")}
        </Animated.Text>
        <Animated.Text
          style={[
            styles.heroAccent,
            { opacity: fadeAccent, transform: [{ translateY: shift(fadeAccent) }] },
          ]}
        >
          {t("welcome.accent")}
        </Animated.Text>

        {/* Subhead — one line, scannable */}
        <Animated.Text
          style={[
            styles.subhead,
            { opacity: fadeBody, transform: [{ translateY: shift(fadeBody) }] },
          ]}
        >
          {t("welcome.subhead")}
        </Animated.Text>
      </ScrollView>

      {/* Footer CTA */}
      <Animated.View
        style={[styles.footer, { opacity: fadeCta, transform: [{ translateY: shift(fadeCta) }] }]}
      >
        <View style={styles.ctaWrap}>
          {/* Halo behind the CTA — gives it weight in the dark canvas. */}
          <Animated.View
            style={[styles.ctaHalo, { opacity: haloOpacity, transform: [{ scale: haloScale }] }]}
            pointerEvents="none"
          />
          <Pressable
            onPress={onContinue}
            accessibilityRole="button"
            accessibilityLabel="Continue to phone verification"
            style={({ pressed }) => [
              styles.cta,
              pressed && { transform: [{ scale: 0.98 }], opacity: 0.92 },
            ]}
          >
            <Text style={styles.ctaLabel}>{t("welcome.cta")}</Text>
            <Text style={styles.ctaArrow}>→</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={onContinue}
          accessibilityRole="link"
          accessibilityLabel="I already have an account"
          hitSlop={12}
          style={({ pressed }) => [styles.altRow, pressed && { opacity: 0.5 }]}
        >
          <Text style={styles.altText}>{t("welcome.alt")}</Text>
        </Pressable>

        <Text style={styles.hairlineCaption}>{t("welcome.caption")}</Text>
      </Animated.View>
    </View>
  );
}

/** Translate an Animated.Value [0,1] → translateY 12 → 0 for fade-up. */
function shift(value: Animated.Value): Animated.AnimatedInterpolation<number> {
  return value.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });
}

const styles = StyleSheet.create({
  /* ---------------------------------------------------------------- */
  /* root + atmospheric bg                                             */
  /* ---------------------------------------------------------------- */
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    overflow: "hidden",
  },
  bgGreen: {
    position: "absolute",
    top: -260,
    left: -120,
    right: -120,
    height: 620,
    backgroundColor: theme.colors.primary,
    opacity: 0.07,
    borderBottomLeftRadius: 320,
    borderBottomRightRadius: 320,
    transform: [{ scaleX: 1.2 }],
  },
  bgCool: {
    position: "absolute",
    bottom: -180,
    left: -160,
    width: 460,
    height: 460,
    borderRadius: 460,
    backgroundColor: "#FFFFFF",
    opacity: 0.025,
  },
  splash: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ---------------------------------------------------------------- */
  /* migration toast (v6 §3.4)                                          */
  /* ---------------------------------------------------------------- */
  toast: {
    position: "absolute",
    top: 56,
    left: 16,
    right: 16,
    zIndex: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: primaryTint(0.45),
    backgroundColor: primaryTint(0.1),
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  toastTitle: {
    color: theme.colors.fg,
    fontFamily: theme.fontFamily.body,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: -0.1,
    marginBottom: 2,
  },
  toastBody: {
    color: theme.colors.fgMuted,
    fontFamily: theme.fontFamily.body,
    fontSize: 12.5,
    lineHeight: 17,
    letterSpacing: -0.1,
  },
  toastHint: {
    marginTop: 6,
    color: theme.colors.fgSubtle,
    fontFamily: theme.fontFamily.mono,
    fontSize: 9.5,
    fontWeight: "600",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },

  /* ---------------------------------------------------------------- */
  /* content                                                           */
  /* ---------------------------------------------------------------- */
  scrollFlex: { flex: 1 },
  content: {
    paddingHorizontal: 28,
    paddingTop: 96,
    paddingBottom: 16,
  },

  /* PILL */
  kickerRow: { flexDirection: "row", marginBottom: 24 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingLeft: 10,
    paddingRight: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: primaryTint(0.08),
    gap: 8,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  pillDotPulse: {
    position: "absolute",
    left: 7,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.primary,
    opacity: 0.25,
  },
  pillText: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.mono,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },

  /* HERO H1 */
  heroH1: {
    color: theme.colors.fg,
    fontFamily: theme.fontFamily.heading,
    fontSize: 64,
    fontWeight: "600",
    lineHeight: 64,
    letterSpacing: -2.4,
    marginBottom: 6,
  },
  heroAccent: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.heading,
    fontSize: 38,
    fontStyle: "italic",
    fontWeight: "400",
    lineHeight: 42,
    letterSpacing: -0.8,
    marginBottom: 24,
  },

  /* SUBHEAD — single scannable line, no paragraph */
  subhead: {
    color: theme.colors.fgMuted,
    fontFamily: theme.fontFamily.body,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.2,
    marginBottom: 0,
  },

  /* ---------------------------------------------------------------- */
  /* footer                                                            */
  /* ---------------------------------------------------------------- */
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 36,
    paddingTop: 16,
    gap: 14,
  },
  ctaWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaHalo: {
    position: "absolute",
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    opacity: 0.22,
    // Web-only — soft outer glow that, unlike a sized View, blurs
    // beyond its own bounds without occluding content above it.
    boxShadow: "0 18px 48px rgba(0, 220, 130, 0.42)",
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 60,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    gap: 10,
  },
  ctaLabel: {
    color: theme.colors.primaryFg,
    fontFamily: theme.fontFamily.body,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  ctaArrow: {
    color: theme.colors.primaryFg,
    fontSize: 18,
    fontWeight: "600",
  },
  altRow: {
    alignSelf: "center",
    paddingVertical: 8,
  },
  altText: {
    color: theme.colors.fgSubtle,
    fontFamily: theme.fontFamily.body,
    fontSize: 13,
    fontWeight: "500",
  },
  hairlineCaption: {
    color: theme.colors.fgSubtle,
    fontFamily: theme.fontFamily.body,
    fontSize: 11.5,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 4,
  },
});
