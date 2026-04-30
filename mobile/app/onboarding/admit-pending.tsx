import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { Avatar } from "@/components/Avatar";
import { StepHeader } from "@/components/StepHeader";
import { LoadingScreen } from "@/components/LoadingScreen";
import { CardSurface } from "@/components/CardSurface";
import { BigStat } from "@/components/BigStat";
import { KickerLabel } from "@/components/KickerLabel";
import { theme, typography } from "@/theme";
import { trackScreen } from "@/lib/analytics";
import { services, type AdmitStatus } from "@/lib/services";
import { ADMIT_REVIEW_SLA_HOURS } from "@nexgen-connect/shared";

/**
 * O10 Admit pending. Build plan §3.6 step 5: while review is
 * pending, surface (a) queue position, (b) three blurred verified
 * faces from the user's wider city cohort, and (c) the scary-
 * September prompt — the day-2 hook that brings the user back.
 */

const PEEK_FACES = [
  { initials: "AD", name: "Aditya", uni: "UCD" },
  { initials: "PR", name: "Priya", uni: "Trinity" },
  { initials: "KR", name: "Karan", uni: "DCU" },
];

const PROMPT = "What scares you most about September?";

export default function AdmitPendingScreen() {
  const router = useRouter();
  const [now, setNow] = useState(Date.now());
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const status = useQuery({
    queryKey: ["verification.status"],
    queryFn: () => services.verification.status(),
    refetchInterval: 8_000,
  });

  useEffect(() => {
    trackScreen("o10_admit_pending");
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const admit = status.data?.admit;
    if (!admit) return;
    if (admit.state === "approved" || admit.state === "rejected") {
      router.replace("/onboarding/admit-outcome");
    }
  }, [status.data, router]);

  const admit: AdmitStatus | undefined = status.data?.admit;
  const queuePosition = admit && admit.state === "pending" ? admit.queuePosition : undefined;
  const reviewBy = admit && admit.state === "pending" ? admit.reviewBy : undefined;

  if (status.isLoading && !status.data) {
    return <LoadingScreen label="Checking review status" />;
  }

  return (
    <Screen footer={<Button label="Carry on" onPress={() => router.replace("/")} size="lg" />}>
      <StepHeader step={7} total={9} showBack={false} />

      <Pill dot variant="primary">
        In review
      </Pill>

      <Hero title="A human up next." accent="Hold tight." size="lg" style={styles.hero} />

      {/* Two stats */}
      <View style={styles.statRow}>
        <CardSurface variant="accent" rail style={styles.statCard}>
          <BigStat value={queuePosition ?? "—"} label="Ahead of you" accent size="lg" />
        </CardSurface>
        <CardSurface variant="default" style={styles.statCard}>
          <BigStat
            value={reviewBy ? formatHrs(reviewBy, now) : "—"}
            denom={ADMIT_REVIEW_SLA_HOURS}
            label="Hours left"
            size="lg"
          />
        </CardSurface>
      </View>

      {/* 3 blurred verified faces — peek at who's already in the wider
          city cohort. Locked feel until the user verifies. */}
      <View style={styles.peekSection}>
        <KickerLabel tone="primary" dot pulse>
          Verified · in your city
        </KickerLabel>
        <View style={styles.peekRow}>
          {PEEK_FACES.map((f) => (
            <View key={f.initials} style={styles.peekTile}>
              <View style={styles.peekAvatarWrap}>
                <Avatar initials={f.initials} size="md" tone="primary" />
                <View style={styles.peekBlur} />
              </View>
              <Text style={styles.peekName}>{f.name}</Text>
              <Text style={styles.peekUni}>{f.uni}</Text>
            </View>
          ))}
        </View>
        <Text style={[typography.caption, styles.peekHint]}>Unlocks after admit review.</Text>
      </View>

      {/* Day-2 prompt */}
      <CardSurface variant="default" rail style={styles.promptCard}>
        <KickerLabel tone="primary">A question while you wait</KickerLabel>
        <Text style={styles.promptHeadline}>{PROMPT}</Text>
        {submitted ? (
          <View style={styles.submittedRow}>
            <Text style={styles.submittedDot}>✓</Text>
            <Text style={[typography.caption, { flex: 1 }]}>
              Sent. Threaded with your cohort once you're in.
            </Text>
          </View>
        ) : (
          <>
            <TextInput
              value={answer}
              onChangeText={setAnswer}
              placeholder="One thing. No prep. No editing."
              placeholderTextColor={theme.colors.fgPlaceholder}
              style={styles.promptInput}
              multiline
              maxLength={280}
            />
            <Pressable
              onPress={() => answer.trim() && setSubmitted(true)}
              disabled={!answer.trim()}
              style={({ pressed }) => [
                styles.promptSubmit,
                !answer.trim() && { opacity: 0.4 },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.promptSubmitText}>Send</Text>
            </Pressable>
          </>
        )}
      </CardSurface>

      <View style={styles.editLink}>
        <Pressable onPress={() => router.replace("/onboarding/admit-upload")} hitSlop={8}>
          <Text style={[typography.bodyStrong, { color: theme.colors.fgSubtle }]}>
            Edit submission ↗
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function formatHrs(iso: string, now: number): string {
  const ms = new Date(iso).getTime() - now;
  if (ms <= 0) return "0";
  const hours = Math.max(0, Math.floor(ms / 3_600_000));
  return String(hours);
}

const styles = StyleSheet.create({
  hero: {
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[6],
  },
  statRow: {
    flexDirection: "row",
    gap: theme.spacing[3],
    marginBottom: theme.spacing[6],
  },
  statCard: {
    flex: 1,
  },
  peekSection: {
    gap: theme.spacing[3],
    marginBottom: theme.spacing[6],
  },
  peekRow: {
    flexDirection: "row",
    gap: theme.spacing[3],
  },
  peekTile: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  peekAvatarWrap: {
    position: "relative",
  },
  peekBlur: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 32,
    backgroundColor: "rgba(10,10,10,0.55)",
  },
  peekName: {
    fontFamily: theme.fontFamily.body,
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.fg,
    marginTop: 6,
  },
  peekUni: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 9,
    color: theme.colors.fgSubtle,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  peekHint: {
    color: theme.colors.fgSubtle,
    textAlign: "center",
    marginTop: theme.spacing[2],
  },
  promptCard: {
    gap: theme.spacing[3],
  },
  promptHeadline: {
    fontFamily: theme.fontFamily.heading,
    fontSize: 22,
    fontWeight: "600",
    color: theme.colors.fg,
    letterSpacing: -0.6,
    lineHeight: 26,
    marginVertical: theme.spacing[2],
  },
  promptInput: {
    minHeight: 64,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    color: theme.colors.fg,
    fontFamily: theme.fontFamily.body,
    fontSize: 15,
    textAlignVertical: "top",
  },
  promptSubmit: {
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  promptSubmitText: {
    color: theme.colors.primaryFg,
    fontFamily: theme.fontFamily.body,
    fontSize: 15,
    fontWeight: "600",
  },
  submittedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  submittedDot: {
    color: theme.colors.primary,
    fontWeight: "700",
    fontSize: 16,
  },
  editLink: {
    marginTop: theme.spacing[6],
    alignItems: "center",
  },
});
