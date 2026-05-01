import { Pressable, StyleSheet, Text, View } from "react-native";
import { CardSurface } from "@/components/CardSurface";
import { BigStat } from "@/components/BigStat";
import { KickerLabel } from "@/components/KickerLabel";
import { theme, typography } from "@/theme";

/**
 * PFC Pre-flight countdown. Persistent across-tab widget per Mobile
 * Plan §5.8 — surfaces a daily-return mechanic anchored to the
 * user's intake date.
 *
 * Phase 1 mock: derive the date from the corridor intakeMonth string
 * (e.g. "September 2026") → first of that month. Real impl will pull
 * the user's flight ITN from the parent-shared arrival itinerary.
 */

type Props = {
  /** "September 2026", "October 2026", etc. */
  intakeMonth?: string;
  /** Tap-handler for the "Open checklist" link. */
  onOpenChecklist?: () => void;
};

export function PreFlightCountdown({ intakeMonth, onOpenChecklist }: Props) {
  const target = parseIntakeToDate(intakeMonth);
  const days =
    target == null ? null : Math.max(0, Math.ceil((target.getTime() - Date.now()) / 86_400_000));

  return (
    <CardSurface variant="default" rail style={styles.card}>
      <View style={styles.row}>
        <View style={styles.left}>
          <KickerLabel tone="primary">Days to land</KickerLabel>
          <BigStat value={days ?? "—"} label={intakeMonth ?? "Sept 2026"} accent size="lg" />
        </View>
        {onOpenChecklist ? (
          <Pressable
            onPress={onOpenChecklist}
            hitSlop={6}
            style={({ pressed }) => [styles.checklist, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.checklistText}>Checklist →</Text>
          </Pressable>
        ) : null}
      </View>
    </CardSurface>
  );
}

function parseIntakeToDate(intakeMonth?: string): Date | null {
  if (!intakeMonth) return null;
  // "September 2026" → Sep 1, 2026
  const months: Record<string, number> = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
  };
  const parts = intakeMonth.trim().split(/\s+/);
  if (parts.length < 2) return null;
  const monthName = parts[0]?.toLowerCase();
  const yearText = parts[1];
  if (!monthName || !yearText) return null;
  const month = months[monthName];
  const year = Number.parseInt(yearText, 10);
  if (month === undefined || Number.isNaN(year)) return null;
  // Default to the 1st of the intake month — real impl swaps in the
  // user's flight date once shared.
  return new Date(year, month, 1);
}

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing[5],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flex: 1,
  },
  checklist: {
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.bg,
  },
  checklistText: {
    ...typography.bodyStrong,
    color: theme.colors.fg,
    fontSize: 13,
  },
});
