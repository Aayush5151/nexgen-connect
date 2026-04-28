import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Heading } from "@/components/Heading";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { theme, typography } from "@/theme";
import { LAUNCH_DATES, CORRIDOR_UNLOCK_THRESHOLD } from "@nexgen-connect/shared";

/**
 * O1 Welcome — first frame after splash. Three jobs:
 *   1. State the promise in one breath: "Find your people / before
 *      you land." Identical to the marketing site so a returning
 *      visitor feels continuity.
 *   2. Carry one line of trust signal — the verification mechanism is
 *      the product, so it has to surface here, not buried two screens
 *      in. "Three checks: phone, identity, admit. No agents. No fakes."
 *   3. Drive a single action: Continue. No alt path, no sign-in toggle
 *      (Phase 1 has no separate sign-in flow — every user goes through
 *      the same OTP-first onboarding). A returning user with a valid
 *      session token is bounced past this screen by the root layout's
 *      future redirect logic — for now, every cold start lands here.
 */

export default function WelcomeScreen() {
  const router = useRouter();

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
  footerNote: {
    marginTop: theme.spacing[8],
  },
});
