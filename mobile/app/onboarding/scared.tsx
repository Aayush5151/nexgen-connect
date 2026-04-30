import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { Button } from "@/components/Button";
import { CardSurface } from "@/components/CardSurface";
import { KickerLabel } from "@/components/KickerLabel";
import { theme, typography } from "@/theme";
import { useSession } from "@/store/session";
import { useCopy } from "@/lib/copy";
import { track, trackScreen } from "@/lib/analytics";

/**
 * O3a — "What scares you most about September."
 *
 * v15 BP §3.6 — fired between OTP and /you. Asks the user to name the
 * fear before they name themselves. Cheaper to ask once than to try to
 * recover trust later when the same fear surfaces unspoken in chat.
 *
 * Single 200-char free-text input. Send persists. Skip is a first-class
 * exit, not a punishment — silence is information too. Either way the
 * user lands on /you next.
 *
 * No back button — going back would put them on the OTP success state
 * with a stale session token; the funnel is forward-only past O3.
 */

const MAX_CHARS = 200;

export default function ScaredScreen() {
  const router = useRouter();
  const setScariestThing = useSession((s) => s.setScariestThing);
  const [text, setText] = useState("");
  const t = useCopy("onboarding");

  useEffect(() => {
    trackScreen("o3a_scared");
  }, []);

  const trimmed = text.trim();
  const remaining = MAX_CHARS - text.length;
  const canSend = trimmed.length > 0;

  const onSend = () => {
    setScariestThing(trimmed);
    track({ name: "scared_submitted", properties: { length: trimmed.length } });
    router.push("/onboarding/you");
  };

  const onSkip = () => {
    setScariestThing(null);
    track({ name: "scared_skipped" });
    router.push("/onboarding/you");
  };

  return (
    <Screen
      footer={
        <View style={styles.footerCol}>
          <Button label={t("scared.cta")} onPress={onSend} disabled={!canSend} size="lg" />
          <Button label={t("scared.skip")} onPress={onSkip} variant="ghost" size="md" />
        </View>
      }
    >
      <Hero
        title={t("scared.heading")}
        accent={t("scared.accent")}
        size="lg"
        style={styles.hero}
      />

      <CardSurface variant="default" style={styles.inputCard}>
        <KickerLabel tone="muted">In your words</KickerLabel>
        <TextInput
          value={text}
          onChangeText={(next) =>
            next.length <= MAX_CHARS ? setText(next) : null
          }
          placeholder={t("scared.placeholder")}
          placeholderTextColor={theme.colors.fgSubtle}
          multiline
          textAlignVertical="top"
          maxLength={MAX_CHARS}
          style={styles.input}
          accessibilityLabel="What scares you most about September"
          autoFocus
        />
        <Text style={styles.counter}>{remaining} characters left</Text>
      </CardSurface>

      <Text style={[typography.caption, styles.note]}>{t("scared.note")}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[6],
  },
  inputCard: {
    gap: theme.spacing[2],
  },
  input: {
    minHeight: 120,
    color: theme.colors.fg,
    fontFamily: theme.fontFamily.body,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.1,
    paddingTop: theme.spacing[2],
  },
  counter: {
    color: theme.colors.fgSubtle,
    fontFamily: theme.fontFamily.mono,
    fontSize: 11,
    letterSpacing: 0.6,
    textAlign: "right",
    marginTop: theme.spacing[2],
  },
  note: {
    color: theme.colors.fgMuted,
    marginTop: theme.spacing[5],
    paddingHorizontal: theme.spacing[2],
  },
  footerCol: {
    gap: theme.spacing[2],
  },
});
