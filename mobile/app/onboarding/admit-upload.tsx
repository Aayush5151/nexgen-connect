import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Screen } from "@/components/Screen";
import { Hero } from "@/components/Hero";
import { Button } from "@/components/Button";
import { StepHeader } from "@/components/StepHeader";
import { CardSurface } from "@/components/CardSurface";
import { IconChip } from "@/components/IconChip";
import { theme, typography, primaryTint } from "@/theme";
import { services } from "@/lib/services";
import { track, trackScreen } from "@/lib/analytics";
import { useSession } from "@/store/session";

/**
 * O9 Admit upload. Redesign: hero + 2 big tactile pick tiles +
 * inline file chip. Less explanation, more visuals.
 */

const MAX_BYTES = 12 * 1024 * 1024;

type Picked = {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
};

export default function AdmitUploadScreen() {
  const router = useRouter();
  const markAdmitUploaded = useSession((s) => s.markAdmitUploaded);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackScreen("o9_admit_upload");
  }, []);

  const submit = useMutation({
    mutationFn: async (file: Picked) => {
      const upload = await services.verification.uploadAdmit({
        mimeType: file.mimeType,
        fileSizeBytes: file.size,
      });
      return services.verification.completeAdmit({ docId: upload.docId });
    },
    onSuccess: (_result, file) => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      track({
        name: "admit_uploaded",
        properties: {
          sizeMb: Math.round((file.size / 1_048_576) * 10) / 10,
          mime: file.mimeType,
        },
      });
      markAdmitUploaded();
      router.replace("/onboarding/admit-pending");
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Upload failed."),
  });

  const pickPdfOrImage = async () => {
    setError(null);
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/jpeg", "image/png"],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset) return;
    if (asset.size && asset.size > MAX_BYTES) {
      setError("File too large. Keep it under 12 MB.");
      return;
    }
    setPicked({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType ?? "application/octet-stream",
      size: asset.size ?? 0,
    });
  };

  const takePhoto = async () => {
    setError(null);
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Camera off",
        "Allow camera access in Settings to take a photo of your admit letter."
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.9,
      allowsEditing: false,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset) return;
    setPicked({
      uri: asset.uri,
      name: `admit_${Date.now()}.jpg`,
      mimeType: "image/jpeg",
      size: asset.fileSize ?? 0,
    });
  };

  const isPhoto = picked?.mimeType === "image/jpeg";

  return (
    <Screen
      footer={
        <Button
          label={picked ? "Submit for review" : "Pick a file"}
          onPress={() => picked && submit.mutate(picked)}
          loading={submit.isPending}
          disabled={!picked}
          size="lg"
          variant="primary"
        />
      }
    >
      <StepHeader step={6} total={9} />

      <Hero title="Drop the letter." accent="A human reads it." size="lg" style={styles.hero} />

      <View style={styles.pickers}>
        <PickerTile
          glyph="📄"
          label="Pick file"
          hint="Files · iCloud · Drive"
          onPress={pickPdfOrImage}
          active={picked !== null && !isPhoto}
        />
        <PickerTile
          glyph="📷"
          label="Take photo"
          hint="Phone camera works"
          onPress={takePhoto}
          active={picked !== null && isPhoto}
        />
      </View>

      {picked ? (
        <CardSurface variant="accent" rail style={styles.previewCard}>
          <View style={styles.previewRow}>
            <IconChip glyph={isPhoto ? "📷" : "📄"} tone="primary" size="md" />
            <View style={styles.previewMeta}>
              <Text style={typography.bodyStrong} numberOfLines={1}>
                {picked.name}
              </Text>
              <Text style={typography.caption}>
                {formatBytes(picked.size)} · {prettyMime(picked.mimeType)}
              </Text>
            </View>
            <Pressable onPress={() => setPicked(null)} hitSlop={10}>
              <Text style={[typography.bodyStrong, styles.replace]}>Replace</Text>
            </Pressable>
          </View>
        </CardSurface>
      ) : null}

      {error ? <Text style={[typography.errorText, styles.errorLine]}>{error}</Text> : null}
    </Screen>
  );
}

function PickerTile({
  glyph,
  label,
  hint,
  onPress,
  active,
}: {
  glyph: string;
  label: string;
  hint: string;
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.tile,
        active && styles.tileActive,
        pressed && { opacity: 0.6 },
      ]}
    >
      <Text style={styles.tileGlyph}>{glyph}</Text>
      <Text style={[typography.bodyStrong, styles.tileLabel]}>{label}</Text>
      <Text style={[typography.caption, styles.tileHint]}>{hint}</Text>
    </Pressable>
  );
}

function formatBytes(bytes: number): string {
  if (!bytes) return "—";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
}

function prettyMime(m: string): string {
  if (m === "application/pdf") return "PDF";
  if (m === "image/jpeg") return "JPG";
  if (m === "image/png") return "PNG";
  return m;
}

const styles = StyleSheet.create({
  hero: {
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[6],
  },
  pickers: {
    flexDirection: "row",
    gap: theme.spacing[3],
  },
  tile: {
    flex: 1,
    padding: theme.spacing[5],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.colors.borderStrong,
    gap: theme.spacing[2],
    minHeight: 140,
    backgroundColor: theme.colors.surface,
    alignItems: "flex-start",
  },
  tileActive: {
    borderStyle: "solid",
    borderColor: theme.colors.primary,
    backgroundColor: primaryTint(0.05),
  },
  tileGlyph: {
    fontSize: 28,
    marginBottom: theme.spacing[2],
  },
  tileLabel: {
    color: theme.colors.fg,
  },
  tileHint: {
    color: theme.colors.fgSubtle,
  },
  previewCard: {
    marginTop: theme.spacing[5],
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
  },
  previewMeta: { flex: 1, gap: 2 },
  replace: {
    color: theme.colors.primary,
  },
  errorLine: {
    marginTop: theme.spacing[4],
  },
});
