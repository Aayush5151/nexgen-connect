import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { theme } from "@/theme";

/**
 * BigStat — the Apple Health / Stripe Dashboard pattern. A huge
 * mono number with a small uppercase label below, optionally with
 * a "/ total" denominator (e.g. 47 / 60).
 *
 * Used on:
 *   - O5 (corridor preview): "47" verified members
 *   - CH1 (corridor home): "47 / 60" big progress headline
 *   - PV3 (parent dashboard): "3 / 3" verification checks complete
 *   - Profile (verification stack): days-to-arrival countdown
 */

type Size = "md" | "lg" | "xl";

type Props = {
  /** Primary number, displayed prominently. */
  value: string | number;
  /** Optional denominator rendered smaller, e.g. "/ 60". */
  denom?: string | number;
  /** Caption below the number. */
  label?: string;
  /** Trend indicator above the number (e.g. "+3 today"). */
  trend?: string;
  /** Color the value primary-green for emphasis. */
  accent?: boolean;
  size?: Size;
  align?: "left" | "center";
  style?: StyleProp<ViewStyle>;
};

const SIZE: Record<Size, { value: number; line: number; tracking: number }> = {
  md: { value: 36, line: 38, tracking: -1.2 },
  lg: { value: 56, line: 56, tracking: -2 },
  xl: { value: 80, line: 78, tracking: -3 },
};

export function BigStat({
  value,
  denom,
  label,
  trend,
  accent = false,
  size = "lg",
  align = "left",
  style,
}: Props) {
  const sizeCfg = SIZE[size];
  return (
    <View style={[align === "center" && { alignItems: "center" }, style]}>
      {trend ? <Text style={styles.trend}>{trend}</Text> : null}
      <View style={styles.numberRow}>
        <Text
          style={[
            styles.value,
            {
              fontSize: sizeCfg.value,
              lineHeight: sizeCfg.line,
              letterSpacing: sizeCfg.tracking,
              color: accent ? theme.colors.primary : theme.colors.fg,
            },
          ]}
        >
          {value}
        </Text>
        {denom !== undefined ? (
          <Text
            style={[
              styles.denom,
              {
                fontSize: Math.round(sizeCfg.value * 0.45),
                lineHeight: sizeCfg.line,
              },
            ]}
          >
            {" / "}
            {denom}
          </Text>
        ) : null}
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  numberRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  value: {
    fontFamily: theme.fontFamily.mono,
    fontWeight: "600",
  },
  denom: {
    fontFamily: theme.fontFamily.mono,
    fontWeight: "500",
    color: theme.colors.fgSubtle,
  },
  trend: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: theme.colors.primary,
    marginBottom: 6,
  },
  label: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: theme.colors.fgSubtle,
    marginTop: 8,
  },
});
