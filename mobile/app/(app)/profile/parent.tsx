import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Heading } from "@/components/Heading";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { Hairline } from "@/components/Hairline";
import { OtpField } from "@/components/OtpField";
import { StepHeader } from "@/components/StepHeader";
import { theme, typography } from "@/theme";
import { services } from "@/lib/services";

/**
 * PV1 + PV2 Parent dashboard. Two phases on one route:
 *
 *   PV1 SETUP — first time the user lands here, they pick a 4-digit
 *   passcode that their parents will use to enter the dashboard.
 *   Doubles as a re-auth gate so a stolen device can't surface the
 *   parent view from the app menu.
 *
 *   PV2 PREVIEW — once a passcode is set, this surface is what the
 *   parent will see. Read-only. Group size, verification counts,
 *   days until arrival. Never names. Never DMs. Never the chat.
 *
 * The setup flow uses our existing OtpField for a passcode entry —
 * 4 digits, no SMS, no validation magic. We re-prompt for confirm to
 * avoid typo-locking the parent out.
 */

type Phase = "setup" | "confirm" | "preview";

export default function ParentScreen() {
  const router = useRouter();
  const qc = useQueryClient();

  const [phase, setPhase] = useState<Phase>("setup");
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [error, setError] = useState<string | null>(null);

  const setPasscode = useMutation({
    mutationFn: (passcode: string) =>
      services.parent.setPasscode({ passcode }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["parent.dashboard"] });
      setPhase("preview");
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Invalid passcode."),
  });

  const dashboard = useQuery({
    queryKey: ["parent.dashboard"],
    queryFn: () => services.parent.dashboard(),
    enabled: phase === "preview",
  });

  if (phase === "setup") {
    return (
      <Screen
        footer={
          <Button
            label="Continue"
            onPress={() => {
              if (first.length !== 4) {
                setError("Pick a 4-digit code.");
                return;
              }
              setError(null);
              setPhase("confirm");
            }}
            disabled={first.length !== 4}
            size="lg"
          />
        }
      >
        <StepHeader label="Step 1 of 2 · set passcode" step={0} total={2} />

        <Heading level="h2" accent="for your parents.">
          A 4-digit code
        </Heading>
        <Text style={[typography.body, styles.subhead]}>
          They&apos;ll use this code to view your dashboard. Pick something
          you both remember. We never store it in plain text.
        </Text>

        <OtpField
          value={first}
          onChangeText={(c) => {
            setFirst(c);
            if (error) setError(null);
          }}
          length={4}
          hasError={Boolean(error)}
        />

        {error ? <Text style={[typography.errorText, styles.errorLine]}>{error}</Text> : null}

        <View style={styles.helperBlock}>
          <HelperLine text="They never see your DMs, your chats, or your channel list." />
          <HelperLine text="They see: group size, verification stats, arrival window." />
          <HelperLine text="You can change or revoke the code at any time." />
        </View>
      </Screen>
    );
  }

  if (phase === "confirm") {
    return (
      <Screen
        footer={
          <Button
            label="Set passcode"
            onPress={() => {
              if (second !== first) {
                setError("Codes don't match. Try once more.");
                return;
              }
              setError(null);
              setPasscode.mutate(first);
            }}
            disabled={second.length !== 4}
            loading={setPasscode.isPending}
            size="lg"
          />
        }
      >
        <StepHeader label="Step 2 of 2 · confirm" step={1} total={2} />

        <Heading level="h2">Confirm the code</Heading>
        <Text style={[typography.body, styles.subhead]}>
          Just to make sure no typos. Re-enter the same 4 digits.
        </Text>

        <OtpField
          value={second}
          onChangeText={(c) => {
            setSecond(c);
            if (error) setError(null);
          }}
          length={4}
          hasError={Boolean(error)}
        />

        {error ? <Text style={[typography.errorText, styles.errorLine]}>{error}</Text> : null}
      </Screen>
    );
  }

  // PREVIEW phase
  const d = dashboard.data;

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
      <StepHeader label="Parent dashboard preview" step={0} total={1} />

      <Pill dot variant="primary">
        Read-only · what your parents see
      </Pill>

      <View style={styles.headingBlock}>
        <Heading level="h2" accent="never your chats.">
          Group size, verification,
        </Heading>
      </View>

      <Text style={[typography.body, styles.subhead]}>
        This is the entire surface your parents see. The numbers update
        automatically. They never see who&apos;s in the corridor by name,
        and they never see a single message.
      </Text>

      <View style={styles.dashCard}>
        <DashRow label="Group size" value={String(d?.groupSize ?? "—")} />
        <Hairline />
        <DashRow
          label="DMs unlocked"
          value={d?.unlocked ? "Yes" : "Building toward 60"}
          tone={d?.unlocked ? "primary" : "neutral"}
        />
        <Hairline />
        <DashRow label="Phone verified" value={String(d?.verificationCounts.phone ?? "—")} />
        <Hairline />
        <DashRow label="DigiLocker verified" value={String(d?.verificationCounts.digilocker ?? "—")} />
        <Hairline />
        <DashRow label="Admit approved" value={String(d?.verificationCounts.admit ?? "—")} />
        <Hairline />
        <DashRow
          label="Days until you arrive"
          value={d?.daysUntilArrival != null ? String(d.daysUntilArrival) : "—"}
          tone="primary"
        />
      </View>

      <Text style={[typography.caption, styles.footnote]}>
        If you&apos;d like to change or revoke the passcode, sign back in via
        Profile → Parent view. Your code is hashed; we cannot recover it for
        you, only reset it.
      </Text>
    </Screen>
  );
}

function HelperLine({ text }: { text: string }) {
  return (
    <View style={styles.helperLine}>
      <View style={styles.helperDot} />
      <Text style={[typography.body, { flex: 1 }]}>{text}</Text>
    </View>
  );
}

function DashRow({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "primary";
}) {
  return (
    <View style={styles.dashRow}>
      <Text style={[typography.mono, { color: theme.colors.fgSubtle }]}>{label}</Text>
      <Text
        style={[
          typography.bodyStrong,
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
  errorLine: { marginTop: theme.spacing[3] },
  helperBlock: {
    marginTop: theme.spacing[8],
    gap: theme.spacing[3],
  },
  helperLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing[3],
  },
  helperDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
    marginTop: 9,
  },
  dashCard: {
    paddingHorizontal: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  dashRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing[4],
  },
  footnote: { marginTop: theme.spacing[6] },
});
