import { useEffect } from "react";
import { Alert, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { trackScreen } from "@/lib/analytics";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { Pill } from "@/components/Pill";
import { StepHeader } from "@/components/StepHeader";
import { CardSurface } from "@/components/CardSurface";
import { IconChip } from "@/components/IconChip";
import { KickerLabel } from "@/components/KickerLabel";
import { theme, typography } from "@/theme";
import { useSession } from "@/store/session";
import { usePreferences } from "@/store/preferences";
import { maskE164 } from "@/lib/utils/phone";

/**
 * Settings. Redesign: Hero + 3 grouped CardSurface sections with
 * IconChip-led toggle rows. No prose explainers.
 */

export default function SettingsScreen() {
  const router = useRouter();
  const phone = useSession((s) => s.phone);
  const clear = useSession((s) => s.clear);
  const notifs = usePreferences((s) => s.notifications);
  const setNotificationPref = usePreferences((s) => s.setNotificationPref);

  useEffect(() => {
    trackScreen("y3_settings");
  }, []);

  const onChangePhone = () => {
    Alert.alert("Change phone number?", "Re-OTP your new number. Verification stays anchored.", [
      { text: "Cancel", style: "cancel" },
      { text: "Continue", onPress: () => router.push("/onboarding/phone") },
    ]);
  };

  const onDeleteAccount = () => {
    Alert.alert(
      "Delete this account?",
      "Verification facts wiped within 30 days. Identity hash stays append-only forever.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            clear();
            router.replace("/");
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <StepHeader label="Settings" step={0} total={1} />

      <Hero title="Settings." accent="Yours." size="lg" />

      <View style={styles.section}>
        <KickerLabel tone="muted">Notifications</KickerLabel>
        <CardSurface variant="default" padded={false}>
          <ToggleRow
            glyph="🔔"
            label="Corridor unlock"
            value={notifs.unlock}
            onChange={(v) => setNotificationPref("unlock", v)}
          />
          <Sep />
          <ToggleRow
            glyph="○"
            label="Day-1 + sub-circles"
            value={notifs.prompt}
            onChange={(v) => setNotificationPref("prompt", v)}
          />
          <Sep />
          <ToggleRow
            glyph="💬"
            label="Direct messages"
            value={notifs.dm}
            onChange={(v) => setNotificationPref("dm", v)}
          />
          <Sep />
          <ToggleRow
            glyph="📣"
            label="Marketing"
            value={notifs.marketing}
            onChange={(v) => setNotificationPref("marketing", v)}
          />
        </CardSurface>
      </View>

      <View style={styles.section}>
        <KickerLabel tone="muted">Account</KickerLabel>
        <CardSurface variant="default" padded={false}>
          <ActionRow
            glyph="📱"
            label="Phone"
            value={phone ? maskE164(phone.e164) : "—"}
            actionLabel="Change"
            onPress={onChangePhone}
          />
          <Sep />
          <ActionRow glyph="🌐" label="Language" value="English" actionLabel="—" disabled />
          <Sep />
          <ActionRow
            glyph="📦"
            label="Export data"
            value="JSON via email"
            actionLabel="Request"
            onPress={() => Alert.alert("Data export requested", "JSON in your inbox within 24h.")}
          />
          <Sep />
          <ActionRow
            glyph="✕"
            label="Delete account"
            value="30-day wipe"
            actionLabel="Delete"
            destructive
            onPress={onDeleteAccount}
          />
        </CardSurface>
      </View>

      <View style={styles.section}>
        <KickerLabel tone="muted">Legal</KickerLabel>
        <CardSurface variant="default" padded={false}>
          <ActionRow
            glyph="📄"
            label="Privacy + Terms"
            value="On the website"
            actionLabel="Open"
            onPress={() => router.push("/(app)/profile")}
          />
        </CardSurface>
      </View>

      <View style={styles.versionRow}>
        <Pill variant="subtle">v0.1.0 · Phase 1</Pill>
      </View>
    </Screen>
  );
}

function ToggleRow({
  glyph,
  label,
  value,
  onChange,
}: {
  glyph: string;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <IconChip glyph={glyph} tone={value ? "primary" : "default"} size="sm" />
      <Text style={[typography.bodyStrong, { flex: 1 }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{
          false: theme.colors.borderStrong,
          true: theme.colors.primary,
        }}
        thumbColor={theme.colors.fg}
        ios_backgroundColor={theme.colors.borderStrong}
      />
    </View>
  );
}

function ActionRow({
  glyph,
  label,
  value,
  actionLabel,
  onPress,
  disabled = false,
  destructive = false,
}: {
  glyph: string;
  label: string;
  value: string;
  actionLabel: string;
  onPress?: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [styles.row, pressed && !disabled && { opacity: 0.6 }]}
    >
      <IconChip glyph={glyph} tone={destructive ? "danger" : "default"} size="sm" />
      <View style={{ flex: 1 }}>
        <Text style={[typography.bodyStrong, destructive && { color: theme.colors.danger }]}>
          {label}
        </Text>
        <Text style={typography.caption}>{value}</Text>
      </View>
      <Text
        style={[
          styles.action,
          {
            color: disabled
              ? theme.colors.fgSubtle
              : destructive
                ? theme.colors.danger
                : theme.colors.primary,
          },
        ]}
      >
        {actionLabel}
      </Text>
    </Pressable>
  );
}

function Sep() {
  return <View style={styles.sep} />;
}

const styles = StyleSheet.create({
  section: {
    marginTop: theme.spacing[6],
    gap: theme.spacing[3],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[4],
  },
  sep: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: 56,
  },
  action: {
    fontFamily: theme.fontFamily.body,
    fontSize: 14,
    fontWeight: "600",
  },
  versionRow: {
    marginTop: theme.spacing[10],
    alignItems: "center",
  },
});
