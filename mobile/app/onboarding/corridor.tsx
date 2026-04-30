import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { Button } from "@/components/Button";
import { StepHeader } from "@/components/StepHeader";
import { CardSurface } from "@/components/CardSurface";
import { IconChip } from "@/components/IconChip";
import { KickerLabel } from "@/components/KickerLabel";
import { theme, typography, primaryTint } from "@/theme";
import { useSession } from "@/store/session";
import { track, trackScreen } from "@/lib/analytics";

/**
 * O5 Corridor question — 5-step inline wizard. No modals, no bottom
 * sheets. Each sub-step shows large tiles you tap to advance:
 *
 *   1. RC question — first time studying abroad? (v15 BP §3.4)
 *   2. Country     — Ireland or Germany
 *   3. City        — filtered by country
 *   4. University  — full names, filtered by city
 *   5. Intake      — month tiles
 *
 * State persists across re-mounts via useSession.corridorChoice. The
 * progression dot strip at the top shows where the user is in the
 * 5-question journey. Tapping a previous dot lets them go back to
 * change earlier answers.
 *
 * Per v15 BP §3.4 the RC ("recovering student") branch must fire
 * BEFORE corridor placement so downstream UX (S31 hybrid-programme
 * warning, accommodation-only mode, enhanced visa-status check)
 * routes correctly. RC at step 1 is non-judgmental: "Is this your
 * first time studying abroad? — Yes / No, I've been before."
 *
 * Per BP §3.6 step 2 (post-RC): the product chooses the corridor;
 * the user never has to "find a community". Country → city → uni →
 * intake = the natural narrowing of "where are you going".
 */

type Country = "IE" | "DE";
type SubStep = 0 | 1 | 2 | 3 | 4;

const COUNTRIES: {
  code: Country;
  flag: string;
  label: string;
  cities: string[];
}[] = [
  {
    code: "IE",
    flag: "🇮🇪",
    label: "Ireland",
    cities: ["Dublin", "Cork", "Galway", "Limerick", "Maynooth"],
  },
  {
    code: "DE",
    flag: "🇩🇪",
    label: "Germany",
    cities: ["Munich", "Aachen", "Berlin"],
  },
];

const UNIS: Record<string, string[]> = {
  Dublin: [
    "University College Dublin",
    "Trinity College Dublin",
    "Dublin City University",
    "Technological University Dublin",
  ],
  Maynooth: ["Maynooth University"],
  Cork: ["University College Cork"],
  Galway: [
    "University of Galway",
    "Atlantic Technological University Galway",
  ],
  Limerick: ["University of Limerick"],
  Munich: ["Technical University of Munich"],
  Aachen: ["RWTH Aachen University"],
  Berlin: ["Technical University of Berlin"],
};

const INTAKES = [
  "September 2026",
  "October 2026",
  "January 2027",
  "April 2027",
  "September 2027",
];

export default function CorridorWizardScreen() {
  const router = useRouter();
  const setCorridorChoice = useSession((s) => s.setCorridorChoice);
  const setRecoveringStudent = useSession((s) => s.setRecoveringStudent);
  const existing = useSession((s) => s.corridorChoice);
  const existingRC = useSession((s) => s.isRecoveringStudent);

  const [step, setStep] = useState<SubStep>(0);
  // v15 BP §3.4 — true = first-timer (default path), false = RC branch
  // (S31 hybrid-programme warning, accommodation-only mode, enhanced
  // visa-status check downstream). null until step 0 answers.
  const [isFirstTimer, setIsFirstTimer] = useState<boolean | null>(
    existingRC === null ? null : !existingRC,
  );
  const [country, setCountry] = useState<Country | null>(
    (existing?.country as Country) ?? null,
  );
  const [city, setCity] = useState<string | null>(existing?.city ?? null);
  const [uni, setUni] = useState<string | null>(existing?.uni ?? null);
  const [intake, setIntake] = useState<string | null>(existing?.intake ?? null);

  // Cross-fade between sub-steps so the change feels deliberate, not
  // janky. Each tile-pick auto-advances after a short hold so the user
  // sees their selection register.
  const fade = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [step, fade]);

  const advance = (next: SubStep) => {
    setTimeout(() => setStep(next), 120);
  };

  const cities = country
    ? COUNTRIES.find((c) => c.code === country)?.cities ?? []
    : [];
  const unis = city ? UNIS[city] ?? [] : [];

  useEffect(() => {
    trackScreen("o5_corridor_wizard");
  }, []);

  const onSubmit = () => {
    if (!country || !city || !uni || !intake) return;
    setCorridorChoice({ country, city, uni, intake });
    track({ name: "corridor_question_completed" });
    router.push({
      pathname: "/onboarding/preview",
      params: { country, city, uni, intake },
    });
  };

  const ready = country && city && uni && intake;

  return (
    <Screen
      footer={
        step === 4 && intake ? (
          <Button
            label="See your corridor"
            onPress={onSubmit}
            disabled={!ready}
            size="lg"
            variant="glow"
          />
        ) : null
      }
    >
      <StepHeader
        step={4}
        total={9}
        onBack={() => {
          if (step > 0) {
            setStep((step - 1) as SubStep);
          } else {
            router.back();
          }
        }}
      />

      {/* Wizard progress strip — 5 dots, current highlighted, past
          tappable to go back and change. v15 BP §3.4 RC at step 0. */}
      <View style={styles.progressStrip}>
        {[0, 1, 2, 3, 4].map((i) => {
          const isCurrent = i === step;
          const isPast = i < step;
          const canTap = isPast;
          return (
            <Pressable
              key={i}
              onPress={() => canTap && setStep(i as SubStep)}
              hitSlop={8}
              style={[
                styles.progressDot,
                isCurrent && styles.progressDotCurrent,
                isPast && styles.progressDotPast,
              ]}
            />
          );
        })}
      </View>

      <Animated.View style={{ opacity: fade, flex: 1 }}>
        {step === 0 ? (
          <RecoveringStudentStep
            value={isFirstTimer}
            onPick={(firstTime) => {
              setIsFirstTimer(firstTime);
              // v15 BP §3.4 — store inverted: isRecoveringStudent =
              // !isFirstTimer. RC = "no, I've been before".
              setRecoveringStudent(!firstTime);
              track({
                name: "rc_answered",
                properties: { isFirstTimer: firstTime },
              });
              advance(1);
            }}
          />
        ) : null}

        {step === 1 ? (
          <CountryStep
            value={country}
            onPick={(v) => {
              setCountry(v);
              if (v !== country) {
                // Country change resets downstream selections so a user
                // who picks Ireland → Dublin then changes to Germany
                // doesn't carry "Dublin" into a German cohort.
                setCity(null);
                setUni(null);
              }
              advance(2);
            }}
          />
        ) : null}

        {step === 2 && country ? (
          <CityStep
            country={country}
            cities={cities}
            value={city}
            onPick={(v) => {
              setCity(v);
              if (v !== city) setUni(null);
              advance(3);
            }}
          />
        ) : null}

        {step === 3 && city ? (
          <UniversityStep
            city={city}
            unis={unis}
            value={uni}
            onPick={(v) => {
              setUni(v);
              advance(4);
            }}
          />
        ) : null}

        {step === 4 && uni ? (
          <IntakeStep value={intake} onPick={(v) => setIntake(v)} />
        ) : null}
      </Animated.View>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Step 0 — RC question (v15 BP §3.4)                                   */
/* ------------------------------------------------------------------ */

function RecoveringStudentStep({
  value,
  onPick,
}: {
  /** true = first-timer; false = RC ("no, I've been before"); null = unanswered. */
  value: boolean | null;
  onPick: (firstTime: boolean) => void;
}) {
  return (
    <View>
      <Hero
        title="Is this your first time"
        accent="studying abroad?"
        size="lg"
      />

      <View style={styles.bigTileGrid}>
        <Pressable
          onPress={() => onPick(true)}
          style={({ pressed }) => [
            styles.bigTile,
            value === true && styles.bigTileActive,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.flag}>🆕</Text>
          <Text style={styles.bigTileLabel}>Yes, first time</Text>
        </Pressable>
        <Pressable
          onPress={() => onPick(false)}
          style={({ pressed }) => [
            styles.bigTile,
            value === false && styles.bigTileActive,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.flag}>↩</Text>
          <Text style={styles.bigTileLabel}>
            No, I&apos;ve been before
          </Text>
        </Pressable>
      </View>

      <CardSurface variant="default" style={styles.comingSoonCard}>
        <View style={styles.comingSoonRow}>
          <IconChip glyph="·" tone="default" size="sm" />
          <Text style={typography.caption}>
            Either is fine — we tune the next steps to fit.
          </Text>
        </View>
      </CardSurface>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Step 1 — Country                                                    */
/* ------------------------------------------------------------------ */

function CountryStep({
  value,
  onPick,
}: {
  value: Country | null;
  onPick: (c: Country) => void;
}) {
  return (
    <View>
      <Hero title="Where to?" accent="Pick a country." size="lg" />

      <View style={styles.bigTileGrid}>
        {COUNTRIES.map((c) => {
          const active = c.code === value;
          return (
            <Pressable
              key={c.code}
              onPress={() => onPick(c.code)}
              style={({ pressed }) => [
                styles.bigTile,
                active && styles.bigTileActive,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.flag}>{c.flag}</Text>
              <Text style={styles.bigTileLabel}>{c.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <CardSurface variant="default" style={styles.comingSoonCard}>
        <View style={styles.comingSoonRow}>
          <IconChip glyph="·" tone="default" size="sm" />
          <Text style={typography.caption}>
            UK · Canada · Australia · Q3 2027
          </Text>
        </View>
      </CardSurface>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2 — City                                                       */
/* ------------------------------------------------------------------ */

function CityStep({
  country,
  cities,
  value,
  onPick,
}: {
  country: Country;
  cities: string[];
  value: string | null;
  onPick: (city: string) => void;
}) {
  const countryLabel = COUNTRIES.find((c) => c.code === country)?.label ?? "";
  return (
    <View>
      <Hero title="Which city?" accent={countryLabel} size="lg" />

      <View style={styles.tileGrid}>
        {cities.map((c) => {
          const active = c === value;
          return (
            <Pressable
              key={c}
              onPress={() => onPick(c)}
              style={({ pressed }) => [
                styles.tile,
                active && styles.tileActive,
                pressed && { opacity: 0.6 },
              ]}
            >
              <Text
                style={[
                  styles.tileText,
                  active && { color: theme.colors.primary },
                ]}
              >
                {c}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Step 3 — University (full names, list-style)                       */
/* ------------------------------------------------------------------ */

function UniversityStep({
  city,
  unis,
  value,
  onPick,
}: {
  city: string;
  unis: string[];
  value: string | null;
  onPick: (uni: string) => void;
}) {
  return (
    <View>
      <Hero title="Which uni?" accent={city} size="lg" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.uniList}
      >
        {unis.map((u) => {
          const active = u === value;
          return (
            <Pressable
              key={u}
              onPress={() => onPick(u)}
              style={({ pressed }) => [
                styles.uniRow,
                active && styles.uniRowActive,
                pressed && { opacity: 0.6 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.uniName,
                    active && { color: theme.colors.primary },
                  ]}
                >
                  {u}
                </Text>
              </View>
              {active ? <Text style={styles.uniCheck}>✓</Text> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Step 4 — Intake (month tiles)                                       */
/* ------------------------------------------------------------------ */

function IntakeStep({
  value,
  onPick,
}: {
  value: string | null;
  onPick: (intake: string) => void;
}) {
  return (
    <View>
      <Hero title="When?" accent="Your intake." size="lg" />

      <View style={styles.intakeStack}>
        {INTAKES.map((i) => {
          const active = i === value;
          return (
            <Pressable
              key={i}
              onPress={() => onPick(i)}
              style={({ pressed }) => [
                styles.intakeRow,
                active && styles.intakeRowActive,
                pressed && { opacity: 0.6 },
              ]}
            >
              <KickerLabel tone={active ? "primary" : "muted"}>
                Intake
              </KickerLabel>
              <Text
                style={[
                  styles.intakeText,
                  active && { color: theme.colors.primary },
                ]}
              >
                {i}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* Wizard progress dots */
  progressStrip: {
    flexDirection: "row",
    gap: theme.spacing[2],
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[6],
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.borderStrong,
  },
  progressDotCurrent: {
    backgroundColor: theme.colors.primary,
  },
  progressDotPast: {
    backgroundColor: primaryTint(0.4),
  },

  /* Step 1 — Country tiles */
  bigTileGrid: {
    marginTop: theme.spacing[8],
    gap: theme.spacing[3],
  },
  bigTile: {
    padding: theme.spacing[6],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    alignItems: "flex-start",
    gap: theme.spacing[1],
  },
  bigTileActive: {
    borderColor: theme.colors.primary,
    backgroundColor: primaryTint(0.06),
  },
  flag: {
    fontSize: 36,
    marginBottom: theme.spacing[2],
  },
  bigTileLabel: {
    fontFamily: theme.fontFamily.heading,
    fontSize: 28,
    fontWeight: "600",
    color: theme.colors.fg,
    letterSpacing: -0.8,
  },
  bigTileHint: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 11,
    color: theme.colors.fgSubtle,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginTop: 4,
  },
  comingSoonCard: {
    marginTop: theme.spacing[6],
  },
  comingSoonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
  },

  /* Step 2 — City tile grid */
  tileGrid: {
    marginTop: theme.spacing[8],
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
  },
  tile: {
    flexBasis: "48%",
    flexGrow: 1,
    height: 64,
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  tileActive: {
    borderColor: theme.colors.primary,
    backgroundColor: primaryTint(0.05),
  },
  tileText: {
    fontFamily: theme.fontFamily.body,
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.fg,
  },

  /* Step 3 — University full-name list */
  uniList: {
    marginTop: theme.spacing[8],
    gap: theme.spacing[2],
    paddingBottom: theme.spacing[6],
  },
  uniRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  uniRowActive: {
    borderColor: theme.colors.primary,
    backgroundColor: primaryTint(0.05),
  },
  uniName: {
    fontFamily: theme.fontFamily.body,
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.fg,
    lineHeight: 22,
  },
  uniCheck: {
    color: theme.colors.primary,
    fontWeight: "700",
    fontSize: 18,
    marginLeft: theme.spacing[3],
  },

  /* Step 4 — Intake stack */
  intakeStack: {
    marginTop: theme.spacing[8],
    gap: theme.spacing[2],
  },
  intakeRow: {
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    gap: 4,
  },
  intakeRowActive: {
    borderColor: theme.colors.primary,
    backgroundColor: primaryTint(0.05),
  },
  intakeText: {
    fontFamily: theme.fontFamily.heading,
    fontSize: 22,
    fontWeight: "600",
    color: theme.colors.fg,
    letterSpacing: -0.6,
  },
});
