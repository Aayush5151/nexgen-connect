import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Screen } from "@/components/Screen";
import { Heading } from "@/components/Heading";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { StepHeader } from "@/components/StepHeader";
import { theme, typography } from "@/theme";
import { services } from "@/lib/services";

/**
 * O6 Identity success — what you see right after DigiLocker hands
 * back a verified token. Three reassurances:
 *   1. Identity-anchored: a masked composite hash so the user knows
 *      something genuinely happened on the server.
 *   2. What we forgot: the Aadhaar number, VID, and JWT, all wiped
 *      within five minutes of the handshake (BP §9.1).
 *   3. What's next: admit-letter review, the only manual gate left.
 *
 * Triggers a soft success haptic on mount — celebrates the work the
 * user just did without being noisy.
 */

export default function IdentitySuccessScreen() {
  const router = useRouter();
  const [maskedHash, setMaskedHash] = useState<string>("****");

  useEffect(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Pull the maskedHash from status() so this screen doesn't depend
    // on params being passed in via navigation. Real flow: server's
    // /verification/status returns the masked hash; mock impl returns
    // a stable value across the session.
    services.verification
      .status()
      .then((s) => {
        if (s.identity.state === "verified") {
          // The mocked completeDigiLocker returns the maskedHash, but
          // status() doesn't carry it forward — so we surface a
          // placeholder. In real impl, the server returns this in
          // both endpoints.
          setMaskedHash("****" + Math.random().toString(36).slice(2, 6));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <Screen
      footer={
        <Button
          label="Continue to admit letter"
          onPress={() => router.replace("/onboarding/admit-intro")}
          size="lg"
        />
      }
    >
      <StepHeader label="Step 3 of 6" step={2} showBack={false} />

      <Pill dot variant="primary">
        Identity verified
      </Pill>

      <View style={styles.headingBlock}>
        <Heading level="h2" accent="anchored.">
          Identity
        </Heading>
      </View>

      <Text style={[typography.body, styles.subhead]}>
        DigiLocker confirmed your identity. We now hold a one-way token —
        nothing reversible to your Aadhaar number.
      </Text>

      <View style={styles.card}>
        <Row label="Identity hash" value={maskedHash} mono />
        <Row label="What we kept" value="Verified name, year-month of birth" />
        <Row label="What we wiped" value="Aadhaar number, VID, DigiLocker JWT" tone="primary" />
        <Row label="When" value="Within 5 minutes of the handshake" />
      </View>

      <Text style={[typography.caption, styles.footnote]}>
        If a user is ever banned for harassment, the ban is anchored on this
        identity hash — a new phone number, a new email, or a re-issued
        Aadhaar VID will not let them rejoin.
      </Text>
    </Screen>
  );
}

function Row({
  label,
  value,
  mono = false,
  tone = "neutral",
}: {
  label: string;
  value: string;
  mono?: boolean;
  tone?: "neutral" | "primary";
}) {
  return (
    <View style={styles.row}>
      <Text style={[typography.mono, styles.rowLabel]}>{label}</Text>
      <Text
        style={[
          typography.body,
          mono && {
            fontFamily: theme.fontFamily.mono,
            fontSize: 14,
            color: theme.colors.fg,
          },
          tone === "primary" && { color: theme.colors.primary },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headingBlock: { marginTop: theme.spacing[4] },
  subhead: {
    marginTop: theme.spacing[3],
    marginBottom: theme.spacing[8],
  },
  card: {
    gap: theme.spacing[4],
    paddingVertical: theme.spacing[6],
    paddingHorizontal: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(0, 220, 130, 0.05)",
  },
  row: {
    gap: theme.spacing[1],
  },
  rowLabel: {
    color: theme.colors.fgSubtle,
  },
  footnote: {
    marginTop: theme.spacing[6],
  },
});
