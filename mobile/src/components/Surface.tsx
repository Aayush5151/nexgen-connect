import { type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { theme } from "@/theme";

/**
 * Surface — the elevation primitive.
 *
 * Replaces ad-hoc `<View style={{ backgroundColor, padding, borderRadius,
 * shadowColor, ... }} />` patterns scattered across screens. Every raised
 * surface (cards, sheets, dialogs) routes through this component.
 *
 * Build Prompt §Components: "Add a Surface primitive that handles
 * elevation, padding, and corner radius consistently. Replace ad-hoc
 * View styling with Surface."
 *
 * Tone-based variants flip the background + (optional) left rail accent
 * — the same "rail" pattern v5's CardSurface used. Surface supersedes
 * CardSurface; CardSurface stays as a wrapper alias for v5 callers
 * until Bucket 10's cleanup.
 *
 * v6 build §6 / Build Prompt Bucket 2.
 */

export type SurfaceTone = "default" | "accent" | "warning" | "danger";
export type SurfaceElevation = "flat" | "card" | "sheet";

type Props = {
  children: ReactNode;
  /** Elevation tier. flat = no shadow, transparent bg.
   *  card = surface bg + soft shadow.
   *  sheet = surfaceElevated bg + soft shadow + borderStrong. */
  elevation?: SurfaceElevation;
  /** Inner padding token (spacing scale key). Default: 4 (16pt). */
  padding?: keyof typeof theme.spacing;
  /** Corner radius token. Default: lg (16). */
  radius?: keyof typeof theme.radius;
  /** Color treatment. accent uses Pulse, warning uses Caution, danger
   *  uses Halt. */
  tone?: SurfaceTone;
  /** Render a left rail accent (3px Pulse/Caution/Halt strip). */
  rail?: boolean;
  style?: StyleProp<ViewStyle>;
};

const RAIL_WIDTH = 3;

export function Surface({
  children,
  elevation = "card",
  padding = 4,
  radius = "lg",
  tone = "default",
  rail = false,
  style,
}: Props) {
  const toneStyle = TONE_STYLES[tone];
  const elevationStyle = ELEVATION_STYLES[elevation];
  const railStyle = rail ? railStyleFor(tone) : null;

  return (
    <View
      style={[
        styles.base,
        {
          padding: theme.spacing[padding],
          paddingLeft: rail ? theme.spacing[padding] + RAIL_WIDTH : theme.spacing[padding],
          borderRadius: theme.radius[radius],
        },
        toneStyle,
        elevationStyle,
        railStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const TONE_STYLES = StyleSheet.create({
  default: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  } satisfies ViewStyle,
  accent: {
    backgroundColor: theme.colors.primaryTint,
    borderColor: theme.colors.primary,
  } satisfies ViewStyle,
  warning: {
    backgroundColor: theme.colors.warningSurface,
    borderColor: theme.colors.warning,
  } satisfies ViewStyle,
  danger: {
    backgroundColor: theme.colors.dangerSurface,
    borderColor: theme.colors.danger,
  } satisfies ViewStyle,
});

const ELEVATION_STYLES = StyleSheet.create({
  flat: {
    backgroundColor: "transparent",
  } satisfies ViewStyle,
  card: {
    ...theme.shadow.soft.rn,
    borderWidth: StyleSheet.hairlineWidth,
  } satisfies ViewStyle,
  sheet: {
    ...theme.shadow.soft.rn,
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.borderStrong,
    borderWidth: StyleSheet.hairlineWidth,
  } satisfies ViewStyle,
});

function railStyleFor(tone: SurfaceTone): ViewStyle {
  const color =
    tone === "accent"
      ? theme.colors.primary
      : tone === "warning"
      ? theme.colors.warning
      : tone === "danger"
      ? theme.colors.danger
      : theme.colors.borderStrong;
  return { borderLeftWidth: RAIL_WIDTH, borderLeftColor: color };
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
  },
});
