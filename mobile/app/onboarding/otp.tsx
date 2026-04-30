import { useEffect, useState, useCallback } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { OtpField } from "@/components/OtpField";
import { Button } from "@/components/Button";
import { StepHeader } from "@/components/StepHeader";
import { ProgressRing } from "@/components/ProgressRing";
import { KickerLabel } from "@/components/KickerLabel";
import { theme, typography } from "@/theme";
import { services, OtpInvalidError } from "@/lib/services";
import { useSession } from "@/store/session";
import { useCopy } from "@/lib/copy";
import { track, trackScreen } from "@/lib/analytics";

/**
 * O3 OTP verify. Redesign: Hero + 6-pin field + countdown ring
 * (visual, not text) for the resend lockout.
 */

const RESEND_LOCKOUT_SEC = 30;

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ masked?: string }>();
  const otpSessionId = useSession((s) => s.otpSessionId);
  const setSession = useSession((s) => s.setSession);
  const setOtpSessionId = useSession((s) => s.setOtpSessionId);
  const phone = useSession((s) => s.phone);
  const t = useCopy("onboarding");

  useEffect(() => {
    trackScreen("o3_otp");
  }, []);

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_LOCKOUT_SEC);

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
      // v15 BP §3.6 — O3a "what scares you most about September" inserted
      // between OTP and /you so the user names the fear before naming
      // themselves. Cheaper to ask once than to try to recover trust later.
      track({ name: "otp_verified" });
      router.push("/onboarding/scared");
    },
    onError: (e) => {
      if (e instanceof OtpInvalidError) {
        setError(t("otp.error.invalid"));
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

  const ringProgress = 1 - secondsLeft / RESEND_LOCKOUT_SEC;

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
      <StepHeader step={1} total={9} />

      <Hero title="Six digits." accent="Sent." size="lg" />

      <View style={styles.maskedRow}>
        <KickerLabel tone="muted">To</KickerLabel>
        <Text style={typography.bodyStrong}>
          {params.masked ?? phone?.e164 ?? "your phone"}
        </Text>
      </View>

      <View style={styles.fieldBlock}>
        <OtpField
          value={code}
          onChangeText={(c) => {
            setCode(c);
            if (error) setError(null);
          }}
          onComplete={handleComplete}
          hasError={Boolean(error)}
        />
      </View>

      {error ? (
        <Text style={[typography.errorText, styles.errorLine]}>{error}</Text>
      ) : null}

      <View style={styles.resendRow}>
        {secondsLeft > 0 ? (
          <View style={styles.countdown}>
            <ProgressRing
              progress={ringProgress}
              size={48}
              thickness={3}
              value={secondsLeft}
            />
            <Text style={[typography.caption, { marginTop: theme.spacing[2] }]}>
              Resend available
            </Text>
          </View>
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
              {resend.isPending ? "Resending…" : "Resend code →"}
            </Text>
          </Pressable>
        )}
      </View>

    </Screen>
  );
}

const styles = StyleSheet.create({
  maskedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    marginTop: theme.spacing[6],
  },
  fieldBlock: {
    marginTop: theme.spacing[8],
  },
  errorLine: {
    marginTop: theme.spacing[3],
  },
  resendRow: {
    marginTop: theme.spacing[8],
    alignItems: "center",
  },
  countdown: {
    alignItems: "center",
  },
  devHint: {
    marginTop: theme.spacing[10],
    alignItems: "center",
  },
});
