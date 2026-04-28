import { useEffect, useState, useCallback } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Heading } from "@/components/Heading";
import { OtpField } from "@/components/OtpField";
import { Button } from "@/components/Button";
import { StepHeader } from "@/components/StepHeader";
import { theme, typography } from "@/theme";
import { services, OtpInvalidError } from "@/lib/services";
import { useSession } from "@/store/session";

/**
 * O3 OTP verify — six-digit code entry. Auto-submit on completion;
 * manual fallback button is rendered too in case auto-submit's spring
 * animation feels too aggressive (a11y users with tremor benefit
 * from an explicit button).
 *
 * Resend timer: 30s lockout, then a tappable "Resend code" link. The
 * lockout prevents accidental flood-trigger of MSG91 SMS billing if a
 * user thumb-drums the resend.
 */

const RESEND_LOCKOUT_SEC = 30;

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ masked?: string }>();
  const otpSessionId = useSession((s) => s.otpSessionId);
  const setSession = useSession((s) => s.setSession);
  const setOtpSessionId = useSession((s) => s.setOtpSessionId);
  const phone = useSession((s) => s.phone);

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_LOCKOUT_SEC);

  // Resend countdown.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const verify = useMutation({
    mutationFn: async (input: string) => {
      if (!otpSessionId) throw new Error("Missing OTP session. Restart sign in.");
      return services.auth.verifyOtp({ otpSessionId, code: input });
    },
    onSuccess: (result) => {
      setSession({
        sessionToken: result.sessionToken,
        refreshToken: result.refreshToken,
        userId: result.user.id,
      });
      router.replace("/onboarding/identity");
    },
    onError: (e) => {
      if (e instanceof OtpInvalidError) {
        setError("Wrong code. Try again.");
      } else {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
      setCode("");
    },
  });

  const resend = useMutation({
    mutationFn: async () => {
      if (!phone) throw new Error("No phone on record. Go back and re-enter.");
      return services.auth.requestOtp({ phone });
    },
    onSuccess: (result) => {
      setOtpSessionId(result.otpSessionId);
      setSecondsLeft(RESEND_LOCKOUT_SEC);
      setCode("");
      setError(null);
    },
  });

  const handleComplete = useCallback(
    (filled: string) => {
      if (!verify.isPending && filled.length === 6) {
        verify.mutate(filled);
      }
    },
    [verify],
  );

  return (
    <Screen
      footer={
        <Button
          label="Verify"
          onPress={() => verify.mutate(code)}
          disabled={code.length !== 6}
          loading={verify.isPending}
          size="lg"
        />
      }
    >
      <StepHeader label="Step 2 of 6" step={1} />

      <Heading level="h2">Six-digit code</Heading>
      <Text style={[typography.body, styles.subhead]}>
        Sent to{" "}
        <Text style={typography.bodyStrong}>
          {params.masked ?? phone?.e164 ?? "your phone"}
        </Text>
        . Should arrive within thirty seconds.
      </Text>

      <OtpField
        value={code}
        onChangeText={(c) => {
          setCode(c);
          if (error) setError(null);
        }}
        onComplete={handleComplete}
        hasError={Boolean(error)}
      />

      {error ? (
        <Text style={[typography.errorText, styles.errorLine]}>{error}</Text>
      ) : null}

      <View style={styles.resendRow}>
        {secondsLeft > 0 ? (
          <Text style={typography.caption}>
            Resend in <Text style={typography.bodyStrong}>{secondsLeft}s</Text>
          </Text>
        ) : (
          <Pressable
            onPress={() => resend.mutate()}
            disabled={resend.isPending}
            hitSlop={12}
          >
            <Text
              style={[
                typography.bodyStrong,
                {
                  color: theme.colors.primary,
                  opacity: resend.isPending ? 0.5 : 1,
                },
              ]}
            >
              {resend.isPending ? "Resending…" : "Resend code"}
            </Text>
          </Pressable>
        )}
      </View>

      {__DEV__ ? (
        <View style={styles.devHint}>
          <Text style={typography.caption}>Dev tip: the magic OTP is 123456.</Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  subhead: {
    marginTop: theme.spacing[3],
    marginBottom: theme.spacing[8],
  },
  errorLine: {
    marginTop: theme.spacing[3],
  },
  resendRow: {
    marginTop: theme.spacing[8],
    alignItems: "center",
  },
  devHint: {
    marginTop: theme.spacing[10],
    padding: theme.spacing[3],
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: "dashed",
    backgroundColor: theme.colors.surface,
  },
});
