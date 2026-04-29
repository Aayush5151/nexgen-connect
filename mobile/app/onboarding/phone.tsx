import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/Button";
import { StepHeader } from "@/components/StepHeader";
import { theme } from "@/theme";
import { services } from "@/lib/services";
import { useSession } from "@/store/session";
import { parseIndianMobile, toE164IndianMobile } from "@/lib/utils/phone";

/**
 * O2 Phone — capture mobile, fire OTP request, persist sessionId.
 * Redesign: Hero + minimal form + low-text trust footer card.
 */

export default function PhoneScreen() {
  const router = useRouter();
  const setPhone = useSession((s) => s.setPhone);
  const setOtpSessionId = useSession((s) => s.setOtpSessionId);

  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);

  const local = parseIndianMobile(raw);
  const isValid = local !== null;

  const mutation = useMutation({
    mutationFn: async () => {
      const e164 = toE164IndianMobile(raw);
      if (!e164) throw new Error("Enter a valid 10-digit Indian mobile.");
      return services.auth.requestOtp({ phone: { country: "IN", e164 } });
    },
    onSuccess: (result) => {
      setPhone({ country: "IN", e164: toE164IndianMobile(raw)! });
      setOtpSessionId(result.otpSessionId);
      router.push({
        pathname: "/onboarding/otp",
        params: { masked: result.maskedPhone },
      });
    },
    onError: (e: Error) => setError(e.message),
  });

  const onSubmit = () => {
    setError(null);
    if (!isValid) {
      setError("Enter a valid 10-digit Indian mobile.");
      return;
    }
    mutation.mutate();
  };

  return (
    <Screen
      footer={
        <Button
          label="Send code"
          onPress={onSubmit}
          loading={mutation.isPending}
          disabled={!isValid && raw.length > 0}
          size="lg"
        />
      }
    >
      <StepHeader step={0} total={9} />

      <Hero
        title="Your mobile."
        accent="The first check."
        size="lg"
      />

      <View style={styles.formBlock}>
        <TextField
          label="Mobile number"
          prefix="+91"
          placeholder="98765 43210"
          keyboardType="phone-pad"
          value={raw}
          onChangeText={(t) => {
            setRaw(t);
            if (error) setError(null);
          }}
          errorText={error ?? undefined}
          autoComplete="tel"
          textContentType="telephoneNumber"
          autoFocus
          maxLength={13}
        />
      </View>

    </Screen>
  );
}

const styles = StyleSheet.create({
  formBlock: {
    marginTop: theme.spacing[8],
    gap: theme.spacing[4],
  },
});
