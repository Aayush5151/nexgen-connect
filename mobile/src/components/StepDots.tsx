import { StyleSheet, View } from "react-native";
import { theme } from "@/theme";

/**
 * StepDots — slim row of step indicators for a multi-step funnel
 * (welcome → phone → otp → identity → admit → done). Three states per
 * dot: filled (current), outline (upcoming), checkmark (complete) —
 * for now we only render filled vs outline; complete is a future v2
 * polish.
 */

type Props = {
  total: number;
  active: number;
  /** Bigger gap between dots on long funnels. Default 6. */
  gap?: number;
};

export function StepDots({ total, active, gap = 6 }: Props) {
  return (
    <View style={[styles.row, { gap }]}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === active ? styles.dotActive : null,
            i < active ? styles.dotComplete : null,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: "transparent",
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    width: 24,
  },
  dotComplete: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
});
