import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { OtpField } from "@/components/OtpField";
import { StepHeader } from "@/components/StepHeader";
import { CardSurface } from "@/components/CardSurface";
import { BigStat } from "@/components/BigStat";
import { IconChip } from "@/components/IconChip";
import { KickerLabel } from "@/components/KickerLabel";
import { theme, typography } from "@/theme";
import { services } from "@/lib/services";
import { track, trackScreen } from "@/lib/analytics";

/**
 * PV1 + PV2 + PV3 Parent dashboard. Redesign: hero + 4-pin
 * passcode setup, then dashboard preview as a 4-card stat grid +
 * alert list + advisor card.
 */

type Phase = "setup" | "confirm" | "preview";

export default function ParentScreen() {
  const router = useRouter();
  const qc = useQueryClient();

  const [phase, setPhase] = useState<Phase>("setup");
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackScreen("pv1_pv2_parent");
    track({ name: "parent_dashboard_setup_started" });
  }, []);

  const setPasscode = useMutation({
    mutationFn: (passcode: string) =>
      services.parent.setPasscode({ passcode }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["parent.dashboard"] });
      track({ name: "parent_dashboard_unlocked" });
      setPhase("preview");
    },
    onError: (e) =>
      setError(e instanceof Error ? e.message : "Invalid passcode."),
  });

  const dashboard = useQuery({
    queryKey: ["parent.dashboard"],
    queryFn: () => services.parent.dashboard(),
    enabled: phase === "preview",
  });

  if (phase === "setup") {
    return (
      <Screen
        footer={
          <Button
            label="Continue"
            onPress={() => {
              if (first.length !== 4) {
                setError("Pick 4 digits.");
                return;
              }
              setError(null);
              setPhase("confirm");
            }}
            disabled={first.length !== 4}
            size="lg"
          />
        }
      >
        <StepHeader label="Step 1 of 2" step={0} total={2} />

        <Hero title="Four digits." accent="For your parents." size="lg" />

        <View style={styles.fieldBlock}>
          <OtpField
            value={first}
            onChangeText={(c) => {
              setFirst(c);
              if (error) setError(null);
            }}
            length={4}
            hasError={Boolean(error)}
          />
        </View>

        {error ? (
          <Text style={[typography.errorText, styles.errorLine]}>{error}</Text>
        ) : null}

        <CardSurface variant="default" style={styles.helperCard}>
          <KickerLabel tone="muted">What they see</KickerLabel>
          <View style={styles.helperList}>
            <HelperLine glyph="✓" text="Group size · verification stats" />
            <HelperLine glyph="✓" text="Arrival window · landing alert" />
            <HelperLine glyph="✕" text="DMs · chats · channel list" muted />
            <HelperLine glyph="✕" text="Member names" muted />
          </View>
        </CardSurface>
      </Screen>
    );
  }

  if (phase === "confirm") {
    return (
      <Screen
        footer={
          <Button
            label="Set passcode"
            onPress={() => {
              if (second !== first) {
                setError("Codes don't match.");
                return;
              }
              setError(null);
              setPasscode.mutate(first);
            }}
            disabled={second.length !== 4}
            loading={setPasscode.isPending}
            size="lg"
          />
        }
      >
        <StepHeader label="Step 2 of 2" step={1} total={2} />

        <Hero title="Confirm." accent="Same four." size="lg" />

        <View style={styles.fieldBlock}>
          <OtpField
            value={second}
            onChangeText={(c) => {
              setSecond(c);
              if (error) setError(null);
            }}
            length={4}
            hasError={Boolean(error)}
          />
        </View>

        {error ? (
          <Text style={[typography.errorText, styles.errorLine]}>{error}</Text>
        ) : null}
      </Screen>
    );
  }

  // PREVIEW phase
  const d = dashboard.data;

  return (
    <Screen
      footer={
        <Button
          label="Back to profile"
          variant="secondary"
          onPress={() => router.back()}
          size="lg"
        />
      }
    >
      <StepHeader label="Parent preview" step={0} total={1} />

      <Pill dot variant="primary">
        Read-only · all they see
      </Pill>

      <Hero
        title="Their view."
        accent="Never your chat."
        size="lg"
        style={styles.heroBlock}
      />

      <View style={styles.statGrid}>
        <CardSurface variant="accent" rail style={styles.statCard}>
          <BigStat
            value={d?.groupSize ?? "—"}
            label="Group size"
            accent
            size="md"
          />
        </CardSurface>
        <CardSurface variant="default" style={styles.statCard}>
          <BigStat
            value={d?.daysUntilArrival ?? "—"}
            label="Days to arrive"
            size="md"
          />
        </CardSurface>
      </View>

      <View style={styles.statGrid}>
        <CardSurface variant="default" style={styles.statCard}>
          <BigStat
            value={d?.verificationCounts.phone ?? "—"}
            label="Phone"
            size="md"
          />
        </CardSurface>
        <CardSurface variant="default" style={styles.statCard}>
          <BigStat
            value={d?.verificationCounts.digilocker ?? "—"}
            label="Identity"
            size="md"
          />
        </CardSurface>
        <CardSurface variant="default" style={styles.statCard}>
          <BigStat
            value={d?.verificationCounts.admit ?? "—"}
            label="Admit"
            size="md"
          />
        </CardSurface>
      </View>

      <CardSurface
        variant="default"
        rail
        onPress={() => router.push("/(app)/profile/parent-notifications")}
        style={styles.alertsCard}
      >
        <View style={styles.alertHeader}>
          <KickerLabel tone="primary">Alerts they get</KickerLabel>
          <Text style={styles.alertChev}>›</Text>
        </View>
        <View style={styles.alertList}>
          <AlertLine text="Corridor unlock event" />
          <AlertLine text="Verification milestones" />
          <AlertLine text="Arrival: T-24h, landing, T+4h" />
          <AlertLine text="Imminent-harm escalation" warn />
        </View>
      </CardSurface>

      <CardSurface variant="default" style={styles.advisorCard}>
        <View style={{ flex: 1, gap: 4 }}>
          <KickerLabel tone="primary">Premium</KickerLabel>
          <Text style={typography.bodyStrong}>30-min advisor call</Text>
          <Text style={typography.caption}>Within 24h · named human</Text>
        </View>
        <Pressable
          onPress={() =>
            Alert.alert(
              "Advisor request sent",
              "Calendar slot in your inbox within 24h.",
            )
          }
          style={({ pressed }) => [styles.advisorCta, pressed && { opacity: 0.7 }]}
        >
          <Text
            style={[typography.buttonLabel, { color: theme.colors.primaryFg }]}
          >
            Request
          </Text>
        </Pressable>
      </CardSurface>
    </Screen>
  );
}

function HelperLine({
  glyph,
  text,
  muted,
}: {
  glyph: string;
  text: string;
  muted?: boolean;
}) {
  return (
    <View style={styles.helperLine}>
      <IconChip
        glyph={glyph}
        tone={muted ? "default" : "primary"}
        size="sm"
      />
      <Text
        style={[
          typography.body,
          { flex: 1 },
          muted && { color: theme.colors.fgSubtle },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

function AlertLine({ text, warn }: { text: string; warn?: boolean }) {
  return (
    <View style={styles.alertLine}>
      <View
        style={[
          styles.alertDot,
          warn && { backgroundColor: theme.colors.warning },
        ]}
      />
      <Text style={[typography.body, { flex: 1 }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldBlock: {
    marginTop: theme.spacing[8],
  },
  errorLine: {
    marginTop: theme.spacing[3],
  },
  helperCard: {
    marginTop: theme.spacing[8],
    gap: theme.spacing[3],
  },
  helperList: {
    gap: theme.spacing[3],
  },
  helperLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
  },
  heroBlock: {
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[6],
  },
  statGrid: {
    flexDirection: "row",
    gap: theme.spacing[3],
    marginBottom: theme.spacing[3],
  },
  statCard: {
    flex: 1,
  },
  alertsCard: {
    marginTop: theme.spacing[3],
    gap: theme.spacing[3],
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  alertChev: {
    fontSize: 20,
    color: theme.colors.fgSubtle,
  },
  alertList: {
    gap: theme.spacing[3],
  },
  alertLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
  },
  alertDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  advisorCard: {
    marginTop: theme.spacing[4],
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[4],
  },
  advisorCta: {
    height: 44,
    paddingHorizontal: theme.spacing[5],
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
