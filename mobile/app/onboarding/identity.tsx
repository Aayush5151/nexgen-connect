import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Heading } from "@/components/Heading";
import { Button } from "@/components/Button";
import { StepHeader } from "@/components/StepHeader";
import { theme, typography } from "@/theme";
import { services } from "@/lib/services";

/**
 * O4 Identity intro — explains DigiLocker, asks consent, hands off
 * to the system browser for the OAuth handshake. Three jobs:
 *   1. Demystify Aadhaar in one breath. The user has been told their
 *      whole life that Aadhaar is the most sensitive number they
 *      own — we have to acknowledge that and show what we DO and
 *      DON'T receive.
 *   2. Secure consent to leave the app for DigiLocker. The handoff
 *      goes through expo-web-browser → returns via deep link.
 *   3. Surface the four "what if" cases (Aadhaar not linked, mobile
 *      changed, deactivated, invisible character) up front, with
 *      a "tell me more" disclosure that doesn't bloat the screen.
 *
 * Mock implementation: pressing "Continue" advances directly to a
 * fake DigiLocker screen at /onboarding/digilocker. Real flow will
 * open `result.authUrl` in the system browser via expo-web-browser
 * with a deep-link return.
 */

export default function IdentityScreen() {
  const router = useRouter();
  const [showWhatIf, setShowWhatIf] = useState(false);

  const start = useMutation({
    mutationFn: async () => services.verification.startDigiLocker(),
    onSuccess: () => router.push("/onboarding/digilocker"),
  });

  return (
    <Screen
      footer={
        <View style={styles.footerCol}>
          <Button
            label="Continue with DigiLocker"
            onPress={() => start.mutate()}
            loading={start.isPending}
            size="lg"
          />
          <Text style={[typography.caption, styles.footerHint]}>
            DigiLocker is the Government of India identity rail. We never
            see your Aadhaar number.
          </Text>
        </View>
      }
    >
      <StepHeader label="Step 3 of 6" step={2} />

      <Heading level="h2" accent="not your Aadhaar number.">
        Identity, anchored —
      </Heading>

      <Text style={[typography.body, styles.subhead]}>
        We need a stable proof you&apos;re a real person heading abroad.
        DigiLocker hands us a one-way verification token. We never receive,
        store, or log the 12-digit Aadhaar number itself.
      </Text>

      <View style={styles.whatWeSee}>
        <Row label="What we see" value="Verified name, year-month of birth, a token." />
        <Row label="What we never see" value="Aadhaar number, full DOB, address, photo." tone="primary" />
        <Row label="Where it goes" value="Hashed with a secret pepper, then forgotten." />
      </View>

      <Text
        style={[typography.bodyStrong, styles.whatIf]}
        onPress={() => setShowWhatIf((v) => !v)}
      >
        {showWhatIf ? "↓ Hide" : "→ What if DigiLocker can't reach me?"}
      </Text>

      {showWhatIf ? (
        <View style={styles.whatIfPanel}>
          <Text style={typography.body}>
            Four cases where we route you to a held-spot admit-letter
            review instead, no questions asked:
          </Text>
          <BulletRow text="Aadhaar isn't linked to your phone (~2.4% of users)." />
          <BulletRow text="You changed your mobile number recently." />
          <BulletRow text="DigiLocker account deactivated by UIDAI." />
          <BulletRow text="Your name has an invisible character that breaks the match." />
          <Text style={[typography.caption, styles.whatIfFooter]}>
            We hold your spot for up to 21 days while you fix it.
          </Text>
        </View>
      ) : null}
    </Screen>
  );
}

function Row({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "primary";
}) {
  return (
    <View style={styles.row}>
      <Text style={[typography.mono, styles.rowLabel]}>{label}</Text>
      <Text
        style={[
          typography.body,
          tone === "primary" && { color: theme.colors.primary },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function BulletRow({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <Text style={[typography.body, styles.bulletText]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  subhead: {
    marginTop: theme.spacing[3],
    marginBottom: theme.spacing[8],
  },
  whatWeSee: {
    gap: theme.spacing[4],
    paddingVertical: theme.spacing[6],
    paddingHorizontal: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing[6],
  },
  row: {
    gap: theme.spacing[1],
  },
  rowLabel: {
    color: theme.colors.fgSubtle,
  },
  whatIf: {
    color: theme.colors.primary,
    marginTop: theme.spacing[2],
  },
  whatIfPanel: {
    gap: theme.spacing[3],
    paddingVertical: theme.spacing[5],
    paddingHorizontal: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing[4],
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing[3],
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.fgMuted,
    marginTop: 11,
  },
  bulletText: { flex: 1 },
  whatIfFooter: {
    marginTop: theme.spacing[2],
  },
  footerCol: {
    gap: theme.spacing[3],
  },
  footerHint: {
    textAlign: "center",
  },
});
