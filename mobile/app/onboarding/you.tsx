import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { StepHeader } from "@/components/StepHeader";
import { CardSurface } from "@/components/CardSurface";
import { IconChip } from "@/components/IconChip";
import { KickerLabel } from "@/components/KickerLabel";
import { theme, typography, primaryTint } from "@/theme";
import { useSession } from "@/store/session";
import { CITIES_BY_TIER, ALL_CITIES, type IndianCity } from "@/lib/india-cities";
import { track, trackScreen } from "@/lib/analytics";

/**
 * O4 You — soft profile capture between OTP and corridor question.
 *
 * Three things: first name, email (optional), home city. The name
 * is what we display in chats; DigiLocker validates the legal name
 * later. Email is a backup channel for SMS failures. Home city is
 * a soft signal (DigiLocker's Aadhaar address is the hard one) that
 * helps route the user into the matching corridor pool.
 *
 * Home-city picker is a full-screen searchable list with tier
 * sections — Uber / Airbnb pattern. ~85 Indian cities, sorted by
 * population/student-source volume within each tier.
 */

export default function YouScreen() {
  const router = useRouter();
  const setProfile = useSession((s) => s.setProfile);
  const existing = useSession((s) => s.profile);

  const [firstName, setFirstName] = useState(existing?.firstName ?? "");
  const [email, setEmail] = useState(existing?.email ?? "");
  const [homeCity, setHomeCity] = useState(existing?.homeCity ?? "");
  const [showCityPicker, setShowCityPicker] = useState(false);

  useEffect(() => {
    trackScreen("o4_you");
  }, []);

  const ready = useMemo(
    () => firstName.trim().length >= 2 && homeCity.length > 0,
    [firstName, homeCity]
  );

  const onContinue = () => {
    if (!ready) return;
    setProfile({
      firstName: firstName.trim(),
      email: email.trim() || null,
      dobMonth: null,
      homeCity,
    });
    track({
      name: "you_completed",
      properties: { hasEmail: email.trim().length > 0 },
    });
    router.push("/onboarding/corridor");
  };

  if (showCityPicker) {
    return (
      <CityPicker
        selected={homeCity}
        onClose={() => setShowCityPicker(false)}
        onPick={(city) => {
          setHomeCity(city);
          setShowCityPicker(false);
        }}
      />
    );
  }

  return (
    <Screen
      footer={
        <Button
          label="Continue"
          onPress={onContinue}
          disabled={!ready}
          size="lg"
          variant="primary"
        />
      }
    >
      <StepHeader step={2} total={9} />

      <Hero title="Quick hello." accent="Three things." size="lg" />

      <View style={styles.formStack}>
        <TextField
          label="First name"
          placeholder="Aanya"
          value={firstName}
          onChangeText={setFirstName}
          autoFocus
          autoCapitalize="words"
          autoComplete="given-name"
          textContentType="givenName"
          maxLength={32}
        />

        <TextField
          label="Email"
          placeholder="aanya@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          helperText="Optional · backup if SMS fails"
        />

        <Pressable
          onPress={() => setShowCityPicker(true)}
          style={({ pressed }) => [
            styles.cityPicker,
            homeCity && styles.cityPickerFilled,
            pressed && { opacity: 0.6 },
          ]}
        >
          <View style={styles.cityRow}>
            <IconChip glyph="✈" tone={homeCity ? "primary" : "default"} size="sm" />
            <View style={{ flex: 1 }}>
              <KickerLabel tone="muted">Home city</KickerLabel>
              <Text style={[styles.cityValue, !homeCity && { color: theme.colors.fgPlaceholder }]}>
                {homeCity || "Pick your home city"}
              </Text>
            </View>
            <Text style={styles.chev}>›</Text>
          </View>
        </Pressable>
      </View>

      <CardSurface variant="default" style={styles.privacyCard}>
        <View style={styles.privacyRow}>
          <IconChip glyph="🔒" tone="primary" size="sm" />
          <Text style={[typography.caption, { flex: 1 }]}>
            DigiLocker verifies your legal name next.
          </Text>
        </View>
      </CardSurface>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* City picker                                                         */
/* ------------------------------------------------------------------ */

type CityRow = { kind: "header"; tier: string } | { kind: "city"; city: IndianCity };

function CityPicker({
  selected,
  onClose,
  onPick,
}: {
  selected: string;
  onClose: () => void;
  onPick: (city: string) => void;
}) {
  const [query, setQuery] = useState("");

  // Build the row list. When there's a query → flat search results
  // (no headers, ranked by best-prefix-then-substring). When no query
  // → tier-sectioned list with sticky-feel section headers.
  const rows: CityRow[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) {
      const matches = ALL_CITIES.filter(
        (c) => c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q)
      ).sort((a, b) => {
        // Prefix matches rank above mid-string matches.
        const aPrefix = a.name.toLowerCase().startsWith(q) ? 0 : 1;
        const bPrefix = b.name.toLowerCase().startsWith(q) ? 0 : 1;
        if (aPrefix !== bPrefix) return aPrefix - bPrefix;
        return a.name.localeCompare(b.name);
      });
      return matches.map((c) => ({ kind: "city" as const, city: c }));
    }
    return CITIES_BY_TIER.flatMap((t) => [
      { kind: "header" as const, tier: t.tier },
      ...t.cities.map((c) => ({ kind: "city" as const, city: c })),
    ]);
  }, [query]);

  return (
    <Screen scroll={false}>
      <View style={styles.pickerHeader}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.pickerBack}>
          <Text style={styles.pickerBackText}>←</Text>
        </Pressable>
        <Text style={styles.pickerTitle}>Home city</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search cities"
          placeholderTextColor={theme.colors.fgPlaceholder}
          style={styles.searchInput}
          autoFocus
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="search"
        />
        {query.length > 0 ? (
          <Pressable onPress={() => setQuery("")} hitSlop={6}>
            <Text style={styles.searchClear}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={rows}
        keyExtractor={(row, i) =>
          row.kind === "header" ? `h_${row.tier}` : `c_${row.city.name}_${i}`
        }
        contentContainerStyle={styles.pickerList}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          if (item.kind === "header") {
            return (
              <View style={styles.tierHeader}>
                <Text style={styles.tierHeaderText}>{item.tier}</Text>
              </View>
            );
          }
          const isSelected = item.city.name === selected;
          return (
            <Pressable
              onPress={() => onPick(item.city.name)}
              style={({ pressed }) => [
                styles.cityPickerRow,
                pressed && styles.cityPickerRowPressed,
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.cityPickerName, isSelected && { color: theme.colors.primary }]}
                >
                  {item.city.name}
                </Text>
                <Text style={styles.cityPickerState}>{item.city.state}</Text>
              </View>
              {isSelected ? <Text style={styles.cityPickerCheck}>✓</Text> : null}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={typography.body}>
              No matches.{" "}
              <Text style={styles.emptyAction} onPress={() => onPick(query.trim())}>
                Use "{query.trim()}"
              </Text>
            </Text>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  /* Form view */
  formStack: {
    marginTop: theme.spacing[6],
    gap: theme.spacing[5],
  },
  cityPicker: {
    padding: theme.spacing[4],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  cityPickerFilled: {
    borderColor: theme.colors.primary,
    backgroundColor: primaryTint(0.04),
  },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
  },
  cityValue: {
    fontFamily: theme.fontFamily.body,
    fontSize: 17,
    fontWeight: "600",
    color: theme.colors.fg,
    marginTop: 2,
  },
  chev: {
    fontSize: 22,
    color: theme.colors.fgSubtle,
  },
  privacyCard: {
    marginTop: theme.spacing[6],
  },
  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
  },

  /* Picker view */
  pickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: theme.spacing[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  pickerBack: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -6,
  },
  pickerBackText: {
    fontSize: 22,
    color: theme.colors.fg,
  },
  pickerTitle: {
    fontFamily: theme.fontFamily.heading,
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.fg,
    letterSpacing: -0.4,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    height: 48,
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[2],
  },
  searchIcon: {
    fontSize: 18,
    color: theme.colors.fgSubtle,
    width: 24,
    textAlign: "center",
  },
  searchInput: {
    flex: 1,
    color: theme.colors.fg,
    fontFamily: theme.fontFamily.body,
    fontSize: 16,
  },
  searchClear: {
    fontSize: 16,
    color: theme.colors.fgSubtle,
    paddingHorizontal: theme.spacing[2],
  },
  pickerList: {
    paddingBottom: theme.spacing[10],
  },
  tierHeader: {
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[2],
    backgroundColor: theme.colors.bg,
  },
  tierHeaderText: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.fgSubtle,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  cityPickerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  cityPickerRowPressed: {
    backgroundColor: theme.colors.surface,
  },
  cityPickerName: {
    fontFamily: theme.fontFamily.body,
    fontSize: 17,
    fontWeight: "500",
    color: theme.colors.fg,
  },
  cityPickerState: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 11,
    color: theme.colors.fgSubtle,
    letterSpacing: 0.4,
    marginTop: 2,
  },
  cityPickerCheck: {
    color: theme.colors.primary,
    fontWeight: "700",
    fontSize: 18,
    marginLeft: theme.spacing[3],
  },
  empty: {
    paddingVertical: theme.spacing[10],
    alignItems: "center",
  },
  emptyAction: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
});
