import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { theme, typography } from "@/theme";
import { StepDots } from "@/components/StepDots";

/**
 * StepHeader — compact top bar inside the onboarding funnel. Shows
 * a back chevron on the left, step dots on the right, the screen
 * label centered between them. Sits at the top of every onboarding
 * screen for a consistent visual anchor.
 *
 * Phase 1 has 6 logical funnel steps:
 *   0  Phone
 *   1  OTP
 *   2  Identity (DigiLocker)
 *   3  Admit upload
 *   4  Admit pending
 *   5  Admit outcome
 */

type Props = {
  /** "Step n of m" label rendered as a kicker above the dots. */
  label?: string;
  /** Index of active dot (0-based). */
  step: number;
  /** Total dots. Default 6. */
  total?: number;
  /** If false, the back chevron is hidden (e.g., on the success screen
   *  where we never want users navigating back into the auth flow). */
  showBack?: boolean;
};

export function StepHeader({ label, step, total = 6, showBack = true }: Props) {
  const router = useRouter();

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {showBack ? (
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backPressed,
            ]}
          >
            <Text style={styles.chevron}>←</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.center}>
        {label ? (
          <Text
            style={[typography.mono, { color: theme.colors.fgSubtle }]}
            numberOfLines={1}
          >
            {label}
          </Text>
        ) : null}
      </View>

      <View style={styles.right}>
        <StepDots active={step} total={total} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    marginBottom: theme.spacing[6],
  },
  left: {
    width: 56,
    alignItems: "flex-start",
  },
  center: {
    flex: 1,
    alignItems: "center",
  },
  right: {
    width: 80,
    alignItems: "flex-end",
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
  },
  backPressed: { opacity: 0.5 },
  chevron: {
    color: theme.colors.fg,
    fontSize: 22,
    lineHeight: 22,
  },
});
