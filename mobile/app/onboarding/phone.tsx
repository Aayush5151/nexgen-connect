import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Heading } from "@/components/Heading";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/Button";
import { StepHeader } from "@/components/StepHeader";
import { theme, typography } from "@/theme";
import { services } from "@/lib/services";
import { useSession } from "@/store/session";
import { parseIndianMobile, toE164IndianMobile } from "@/lib/utils/phone";

/**
 * O2 Phone — collect the user's mobile, fire the OTP request to
 * MSG91 (mocked), persist the otpSessionId, advance to O3.
 *
 * Phase 1 supports IN-only mobile numbers. Future phases widen.
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
      <StepHeader label="Step 1 of 6" step={0} />

      <Heading level="h2">Your mobile</Heading>
      <Text style={[typography.body, styles.subhead]}>
        We send a 6-digit code by SMS. Your number is hashed before it
        touches our database.
      </Text>

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
        helperText="Indian mobile only at launch. Other countries open in 2027."
        errorText={error ?? undefined}
        autoComplete="tel"
        textContentType="telephoneNumber"
        autoFocus
        maxLength={13}
        containerStyle={styles.input}
      />

      <View style={styles.assurance}>
        <Text style={typography.caption}>
          OTP delivery via MSG91 (DLT-registered, India). Costs you nothing,
          and we never share your number with anyone.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subhead: {
    marginTop: theme.spacing[3],
    marginBottom: theme.spacing[8],
  },
  input: {
    marginBottom: theme.spacing[4],
  },
  assurance: {
    marginTop: theme.spacing[6],
    padding: theme.spacing[4],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
});
