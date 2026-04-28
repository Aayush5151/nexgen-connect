import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Heading } from "@/components/Heading";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { theme, typography } from "@/theme";
import { LAUNCH_DATES, CORRIDOR_UNLOCK_THRESHOLD } from "@nexgen-connect/shared";
import { useSession, useSessionHydrated } from "@/store/session";

/**
 * O1 Welcome + auth-gate. Three jobs:
 *   1. Cold-start auth-gate: a returning verified user with a session
 *      token gets redirected to /(app)/corridor without seeing
 *      Welcome again. Welcome is for the first ~90s of a user's
 *      lifetime, not every cold start.
 *   2. Brand promise in one breath: "Find your people / before you
 *      land." Identical to the marketing site so the install-to-app
 *      transition feels continuous.
 *   3. Trust signal up-front: three-check verification surfaced
 *      before any CTA, so the most-skeptical reader sees it before
 *      they tap Continue.
 *
 * Redirect timing: we wait one frame after mount so Zustand can
 * hydrate from secure-store. Without the frame, the first render
 * sees null phone + null token even on a returning user.
 */

export default function WelcomeScreen() {
  const router = useRouter();
  const hydrated = useSessionHydrated();
  const sessionToken = useSession((s) => s.sessionToken);
  const admitApproved = useSession((s) => s.admitApproved);

  useEffect(() => {
    if (!hydrated) return;
    // Returning, fully-verified user → straight to corridor.
    if (sessionToken && admitApproved) {
      router.replace("/(app)/corridor");
    }
  }, [hydrated, sessionToken, admitApproved, router]);

  // Render a black splash until secure-store hydration finishes.
  // Without this, returning verified users see the Welcome screen
  // flash for one frame before the redirect kicks in.
  if (!hydrated) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Screen
      footer={
        <Button
          label="Continue"
          onPress={() => router.push("/onboarding/phone")}
          size="lg"
        />
      }
    >
      <View style={styles.kickerRow}>
        <Pill dot variant="primary">
          {LAUNCH_DATES.ireland.intakeMonth} · {LAUNCH_DATES.germany.intakeMonth}
        </Pill>
      </View>

      <View style={styles.headingBlock}>
        <Heading accent="before you land.">Find your people</Heading>
      </View>

      <Text style={[typography.body, styles.subhead]}>
        A verified group of classmates from your home city, going to your
        destination, in your intake month. Group DMs unlock when{" "}
        <Text style={typography.bodyStrong}>{CORRIDOR_UNLOCK_THRESHOLD}</Text>{" "}
        verified students share your corridor.
      </Text>

      <View style={styles.trustBlock}>
        <TrustRow text="Three checks: phone, identity, admit letter." />
        <TrustRow text="DigiLocker for Aadhaar — we never see your number." />
        <TrustRow text="No agents. No recruiters. No ads. No data sale." />
      </View>

      <Text style={[typography.caption, styles.footerNote]}>
        Free to verify. Free to find your people. We earn our keep when your
        parents want the dashboard.
      </Text>
    </Screen>
  );
}

function TrustRow({ text }: { text: string }) {
  return (
    <View style={styles.trustRow}>
      <View style={styles.tick} />
      <Text style={typography.body}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kickerRow: {
    flexDirection: "row",
    marginBottom: theme.spacing[6],
  },
  headingBlock: {
    marginBottom: theme.spacing[6],
  },
  subhead: {
    marginBottom: theme.spacing[10],
  },
  trustBlock: {
    gap: theme.spacing[3],
    paddingVertical: theme.spacing[4],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  trustRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing[3],
  },
  tick: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginTop: 9,
  },
  splash: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  footerNote: {
    marginTop: theme.spacing[8],
  },
});
