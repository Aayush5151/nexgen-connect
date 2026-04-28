import { useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Heading } from "@/components/Heading";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { StepHeader } from "@/components/StepHeader";
import { theme, typography } from "@/theme";
import {
  services,
  DigiLockerFailureError,
  type DigiLockerFailureReason,
} from "@/lib/services";
import { useSession } from "@/store/session";

/**
 * O5 DigiLocker — in real life, this is a thin shell around the
 * system browser opened to DigiLocker's OAuth page; the user signs in
 * with their Aadhaar VID + OTP, consents, and the browser deep-links
 * back into the app with an authorisation code which we exchange for
 * the verified token.
 *
 * In dev/mock mode, we simulate the user being on the DigiLocker
 * page with a fake "approve" / "fail with reason" surface so we can
 * test every code path locally — including each S27/S28/S29/S30
 * fallback. The dev-only failure picker is gated by __DEV__.
 */

export default function DigiLockerScreen() {
  const router = useRouter();
  const markIdentityVerified = useSession((s) => s.markIdentityVerified);

  const complete = useMutation({
    mutationFn: async () =>
      services.verification.completeDigiLocker({
        state: "mock_state",
        code: "mock_code",
      }),
    onSuccess: () => {
      markIdentityVerified();
      router.replace("/onboarding/identity-success");
    },
    onError: (e) => {
      if (e instanceof DigiLockerFailureError) {
        router.replace({
          pathname: "/onboarding/identity-fallback",
          params: { reason: e.reason },
        });
      }
    },
  });

  const setFailure = useMutation({
    mutationFn: async (reason: DigiLockerFailureReason) =>
      services.verification.forceFailure(reason),
  });

  const [picker, setPicker] = useState<DigiLockerFailureReason | null>(null);

  const onApprove = () => complete.mutate();
  const onForceFail = async (reason: DigiLockerFailureReason) => {
    setPicker(reason);
    await setFailure.mutateAsync(reason);
    complete.mutate();
  };

  return (
    <Screen
      footer={
        <Button
          label="Approve consent"
          onPress={onApprove}
          loading={complete.isPending && !picker}
          size="lg"
        />
      }
    >
      <StepHeader label="Step 3 of 6" step={2} />

      <Pill variant="neutral">DigiLocker · Government of India</Pill>

      <View style={styles.headingBlock}>
        <Heading level="h2">Approve consent on DigiLocker</Heading>
      </View>

      <Text style={[typography.body, styles.subhead]}>
        DigiLocker will ask for your permission to share your name and
        date of birth, signed by UIDAI. Your Aadhaar number stays private —
        we receive a token, not the digits.
      </Text>

      <View style={styles.preview}>
        <Text style={[typography.mono, styles.previewLabel]}>What you&apos;ll see</Text>
        <Text style={typography.bodyStrong}>NexGen Connect requests:</Text>
        <View style={styles.previewList}>
          <PreviewLine text="Verified name from Aadhaar" />
          <PreviewLine text="Year and month of birth" />
          <PreviewLine text="A signed verification token" />
        </View>
        <Text style={[typography.caption, styles.previewFooter]}>
          You will tap &ldquo;Allow&rdquo; on DigiLocker, then return here.
        </Text>
      </View>

      {__DEV__ ? (
        <View style={styles.devPanel}>
          <Text style={[typography.mono, styles.devLabel]}>
            Dev: simulate failure
          </Text>
          <View style={styles.devButtons}>
            {(
              [
                ["aadhaar_not_linked", "Aadhaar not linked"],
                ["mobile_changed", "Mobile changed"],
                ["deactivated", "Deactivated"],
                ["invisible_character", "Name char issue"],
              ] as const
            ).map(([reason, label]) => (
              <Pressable
                key={reason}
                onPress={() => onForceFail(reason)}
                style={({ pressed }) => [
                  styles.devButton,
                  pressed && { opacity: 0.5 },
                ]}
              >
                <Text style={[typography.caption, { color: theme.colors.fg }]}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

function PreviewLine({ text }: { text: string }) {
  return (
    <View style={styles.previewLine}>
      <View style={styles.previewDot} />
      <Text style={typography.body}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headingBlock: { marginTop: theme.spacing[4] },
  subhead: {
    marginTop: theme.spacing[3],
    marginBottom: theme.spacing[6],
  },
  preview: {
    padding: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing[2],
  },
  previewLabel: {
    color: theme.colors.fgSubtle,
    marginBottom: theme.spacing[1],
  },
  previewList: {
    gap: theme.spacing[2],
    marginTop: theme.spacing[2],
  },
  previewLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
  },
  previewDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
  previewFooter: {
    marginTop: theme.spacing[3],
  },
  devPanel: {
    marginTop: theme.spacing[8],
    padding: theme.spacing[4],
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: "dashed",
    gap: theme.spacing[3],
  },
  devLabel: {
    color: theme.colors.warning,
  },
  devButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
  },
  devButton: {
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.bg,
  },
});
