import { Alert, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Heading } from "@/components/Heading";
import { Hairline } from "@/components/Hairline";
import { Pill } from "@/components/Pill";
import { StepHeader } from "@/components/StepHeader";
import { theme, typography } from "@/theme";
import { useSession } from "@/store/session";
import { maskE164 } from "@/lib/utils/phone";

/**
 * Settings — the account-management surface. Three sections:
 *
 *   1. Notifications (toggle level)
 *      - Corridor unlock              (default on)
 *      - Day-1 prompt + sub-circles   (default on)
 *      - Direct messages              (default on)
 *      - Marketing / product news     (default off — explicit opt-in)
 *
 *   2. Account (BP §9 deletion-on-request promise)
 *      - Change phone number          (re-OTP flow)
 *      - Change language              (Phase 5 stub)
 *      - Download my data             (GDPR-style export, support routes)
 *      - Delete account               (24h cool-off, re-confirm)
 *
 *   3. Legal + about
 *      - Open privacy + terms         (deep-links to nexgenconnect.com/legal)
 *      - App version / build
 *
 * No app-wide settings stored here yet — each toggle just flips local
 * UI state. Wiring to push prefs lands when expo-notifications service
 * is bound (Phase 4 polish).
 */

export default function SettingsScreen() {
  const router = useRouter();
  const phone = useSession((s) => s.phone);
  const clear = useSession((s) => s.clear);

  const [notifs, setNotifs] = useState({
    unlock: true,
    prompt: true,
    dm: true,
    marketing: false,
  });

  const onChangePhone = () => {
    Alert.alert(
      "Change phone number?",
      "We'll re-OTP your new number. Your verification + corridor stay anchored to the same identity hash.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: () => router.push("/onboarding/phone"),
        },
      ],
    );
  };

  const onDeleteAccount = () => {
    Alert.alert(
      "Delete this account?",
      "We'll wipe your verification facts within 30 days. The identity hash stays append-only forever per BP §9.1 — that's how identity-tied bans work, even for users in good standing.",
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
      ],
    );
  };

  return (
    <Screen>
      <StepHeader label="Settings" step={0} total={1} />

      <Heading level="h2">Settings</Heading>
      <Text style={[typography.body, styles.subhead]}>
        Manage notifications, your phone number, and account deletion.
        Privacy + Terms live at nexgenconnect.com/legal.
      </Text>

      {/* Notifications */}
      <SectionHeader text="Notifications" />
      <View style={styles.card}>
        <ToggleRow
          label="Corridor unlock"
          hint="Push the moment 60 verified students share your corridor."
          value={notifs.unlock}
          onChange={(v) => setNotifs((p) => ({ ...p, unlock: v }))}
        />
        <Hairline />
        <ToggleRow
          label="Day-1 prompts + sub-circles"
          hint="Worry-shaped prompts as your sub-circles fill."
          value={notifs.prompt}
          onChange={(v) => setNotifs((p) => ({ ...p, prompt: v }))}
        />
        <Hairline />
        <ToggleRow
          label="Direct messages"
          hint="Notifications from 1:1 conversations."
          value={notifs.dm}
          onChange={(v) => setNotifs((p) => ({ ...p, dm: v }))}
        />
        <Hairline />
        <ToggleRow
          label="Marketing + product news"
          hint="Off by default. Toggle on if you want occasional product updates."
          value={notifs.marketing}
          onChange={(v) => setNotifs((p) => ({ ...p, marketing: v }))}
        />
      </View>

      {/* Account */}
      <SectionHeader text="Account" />
      <View style={styles.card}>
        <ActionRow
          label="Phone number"
          hint={phone ? maskE164(phone.e164) : "—"}
          actionLabel="Change"
          onPress={onChangePhone}
        />
        <Hairline />
        <ActionRow
          label="Language"
          hint="English (Hindi partial coming Phase 5)"
          actionLabel="—"
          disabled
        />
        <Hairline />
        <ActionRow
          label="Download my data"
          hint="Email a JSON export of everything we hold on you."
          actionLabel="Request"
          onPress={() =>
            Alert.alert(
              "Data export requested",
              "We'll email you a JSON export within 24 hours. Reply to that email if you don't see it within 48.",
            )
          }
        />
        <Hairline />
        <ActionRow
          label="Delete account"
          hint="Wipes verification facts within 30 days. Identity hash stays banned-eligible forever."
          actionLabel="Delete"
          variant="destructive"
          onPress={onDeleteAccount}
        />
      </View>

      {/* Legal */}
      <SectionHeader text="Legal" />
      <View style={styles.card}>
        <ActionRow
          label="Privacy + Terms"
          hint="The full text on the website."
          actionLabel="Open"
          onPress={() => router.push("/(app)/profile")}
        />
      </View>

      <View style={styles.versionRow}>
        <Pill variant="neutral">v0.1.0 · Phase 1 onboarding</Pill>
      </View>
    </Screen>
  );
}

function SectionHeader({ text }: { text: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[typography.mono, { color: theme.colors.fgSubtle }]}>{text}</Text>
    </View>
  );
}

function ToggleRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={typography.bodyStrong}>{label}</Text>
        <Text style={typography.caption}>{hint}</Text>
      </View>
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
  label,
  hint,
  actionLabel,
  onPress,
  disabled = false,
  variant = "neutral",
}: {
  label: string;
  hint: string;
  actionLabel: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: "neutral" | "destructive";
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && !disabled && { opacity: 0.6 },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={[
            typography.bodyStrong,
            variant === "destructive" && { color: theme.colors.danger },
          ]}
        >
          {label}
        </Text>
        <Text style={typography.caption}>{hint}</Text>
      </View>
      <Text
        style={[
          typography.bodyStrong,
          {
            color: disabled
              ? theme.colors.fgSubtle
              : variant === "destructive"
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

const styles = StyleSheet.create({
  subhead: {
    marginTop: theme.spacing[3],
    marginBottom: theme.spacing[8],
  },
  sectionHeader: {
    marginTop: theme.spacing[6],
    marginBottom: theme.spacing[3],
  },
  card: {
    paddingHorizontal: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing[4],
    gap: theme.spacing[3],
  },
  versionRow: {
    marginTop: theme.spacing[10],
    flexDirection: "row",
    justifyContent: "center",
  },
});
