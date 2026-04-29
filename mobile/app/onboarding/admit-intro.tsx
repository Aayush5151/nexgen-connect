import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Heading } from "@/components/Heading";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { StepHeader } from "@/components/StepHeader";
import { theme, typography } from "@/theme";
import { ADMIT_REVIEW_SLA_HOURS, ADMIT_PDF_TTL_MIN } from "@nexgen-connect/shared";

/**
 * O8 Admit-letter intro — explains why we ask for an admit, what
 * counts, what we keep, and the SLA. The whole pitch:
 *   - One human reviewer reads every letter. No bots, no
 *     auto-approve.
 *   - 48-hour SLA. Breach = ₹100 credit + fast-path.
 *   - The PDF is deleted within 60 minutes of the review decision.
 *
 * This is the moment we earn the user's trust on the most personally
 * sensitive document — written acceptance from a foreign uni — so the
 * page stays restrained and explicit. No marketing fluff.
 */

export default function AdmitIntroScreen() {
  const router = useRouter();

  return (
    <Screen
      footer={
        <Button
          label="Upload admit letter"
          onPress={() => router.push("/onboarding/admit-upload")}
          size="lg"
        />
      }
    >
      <StepHeader label="Step 4 of 6" step={3} />

      <Pill dot variant="primary">
        Final check
      </Pill>

      <View style={styles.headingBlock}>
        <Heading level="h2" accent="reads every letter.">
          A real human
        </Heading>
      </View>

      <Text style={[typography.body, styles.subhead]}>
        We pair your verified identity with your university admit so the
        corridor you join is genuinely yours. One reviewer per letter. No
        bots. No auto-approve.
      </Text>

      <View style={styles.contract}>
        <ContractRow
          label="What we accept"
          value="Conditional or final offer, scholarship letter, or visa packet from the uni. PDF, JPG, or PNG."
        />
        <ContractRow
          label="What we look for"
          value="Your name, the uni, the intake month. Three things, that's it."
        />
        <ContractRow
          label="How long"
          value={`${ADMIT_REVIEW_SLA_HOURS} hours, soft SLA. Breach = ₹100 credit + fast-path review.`}
        />
        <ContractRow
          label="What we keep"
          value="The hash. The verification fact. Nothing else."
        />
        <ContractRow
          label="The PDF itself"
          value={`Deleted within ${ADMIT_PDF_TTL_MIN} minutes of the review decision.`}
          tone="primary"
        />
      </View>

      <Text style={[typography.caption, styles.footnote]}>
        Don&apos;t have your admit yet? Save your spot today and upload the
        moment it lands. You&apos;ll see the rest of the corridor reveal as
        more verified students join your home-city + intake.
      </Text>
    </Screen>
  );
}

function ContractRow({
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

const styles = StyleSheet.create({
  headingBlock: { marginTop: theme.spacing[4] },
  subhead: {
    marginTop: theme.spacing[3],
    marginBottom: theme.spacing[8],
  },
  contract: {
    gap: theme.spacing[4],
    paddingVertical: theme.spacing[6],
    paddingHorizontal: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  row: { gap: theme.spacing[1] },
  rowLabel: { color: theme.colors.fgSubtle },
  footnote: {
    marginTop: theme.spacing[6],
  },
});
