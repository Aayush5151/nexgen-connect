import { useState } from "react";
import { StyleSheet, Text, View, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Screen } from "@/components/Screen";
import { Heading } from "@/components/Heading";
import { Button } from "@/components/Button";
import { StepHeader } from "@/components/StepHeader";
import { theme, typography } from "@/theme";
import { services } from "@/lib/services";
import { useSession } from "@/store/session";

/**
 * O9 Admit upload — picks a PDF or photo of the admit letter and
 * sends it through the upload pipeline. Two affordances:
 *   1. "Upload PDF" → expo-document-picker, returns a file URI.
 *   2. "Take photo" → expo-image-picker camera, returns a file URI.
 *
 * Both paths converge on the same `uploadAdmit({ mimeType, sizeBytes })`
 * call which returns a presigned upload URL. In real impl we PUT the
 * file to that URL; in mock impl we skip the upload and call
 * completeAdmit directly so the funnel keeps moving.
 *
 * Caps:
 *   - 12 MB max file size (server-enforced; we surface the error
 *     gracefully and let the user retry).
 *   - PDF, JPG, PNG accepted. Anything else gets rejected at picker.
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

  const submit = useMutation({
    mutationFn: async (file: Picked) => {
      const upload = await services.verification.uploadAdmit({
        mimeType: file.mimeType,
        fileSizeBytes: file.size,
      });
      return services.verification.completeAdmit({ docId: upload.docId });
    },
    onSuccess: () => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
        "Allow camera access in Settings to take a photo of your admit letter.",
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

  return (
    <Screen
      footer={
        <Button
          label={picked ? "Submit for review" : "Pick a file first"}
          onPress={() => picked && submit.mutate(picked)}
          loading={submit.isPending}
          disabled={!picked}
          size="lg"
        />
      }
    >
      <StepHeader label="Step 4 of 6" step={3} />

      <Heading level="h2">Upload your admit</Heading>
      <Text style={[typography.body, styles.subhead]}>
        PDF, JPG, or PNG. Up to 12 MB. We&apos;ll review within 48 hours.
      </Text>

      <View style={styles.pickers}>
        <PickerTile
          label="Pick a file"
          hint="From Files, iCloud, Drive, or your downloads."
          onPress={pickPdfOrImage}
          active={picked?.mimeType !== "image/jpeg"}
        />
        <PickerTile
          label="Take a photo"
          hint="Skip the scanner. Phone camera works."
          onPress={takePhoto}
          active={picked?.mimeType === "image/jpeg"}
        />
      </View>

      {picked ? (
        <View style={styles.previewCard}>
          <View style={styles.previewIcon} />
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
      ) : null}

      {error ? <Text style={[typography.errorText, styles.errorLine]}>{error}</Text> : null}

      <Text style={[typography.caption, styles.footnote]}>
        We delete the file within 60 minutes of the review decision. Your
        verification fact stays; the document does not.
      </Text>
    </Screen>
  );
}

function PickerTile({
  label,
  hint,
  onPress,
  active,
}: {
  label: string;
  hint: string;
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        active && styles.tileActive,
        pressed && { opacity: 0.6 },
      ]}
    >
      <Text style={[typography.bodyStrong, { color: theme.colors.fg }]}>
        {label}
      </Text>
      <Text style={typography.caption}>{hint}</Text>
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
  subhead: {
    marginTop: theme.spacing[3],
    marginBottom: theme.spacing[6],
  },
  pickers: {
    flexDirection: "row",
    gap: theme.spacing[3],
  },
  tile: {
    flex: 1,
    padding: theme.spacing[4],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.colors.borderStrong,
    gap: theme.spacing[2],
    minHeight: 100,
  },
  tileActive: {
    borderStyle: "solid",
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(0, 220, 130, 0.05)",
  },
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    padding: theme.spacing[4],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    marginTop: theme.spacing[5],
  },
  previewIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primary,
  },
  previewMeta: { flex: 1, gap: 2 },
  replace: {
    color: theme.colors.primary,
  },
  errorLine: {
    marginTop: theme.spacing[4],
  },
  footnote: {
    marginTop: theme.spacing[6],
  },
});
