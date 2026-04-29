import { useState } from "react";
import {
  Modal,
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
import { CardSurface } from "@/components/CardSurface";
import { KickerLabel } from "@/components/KickerLabel";
import { Pill } from "@/components/Pill";
import { MessageBubble } from "@/components/MessageBubble";
import { theme, typography } from "@/theme";
import { useSession } from "@/store/session";
import {
  CORRIDOR_LAYER_1_UNLOCK,
  CORRIDOR_LAYER_2_UNLOCK,
} from "@nexgen-connect/shared";

/**
 * CH6 — Layer 1 hometown-crew thread (v15 BP §3.2 affinity sub-group).
 *
 * Surfaces inside an unlocked Layer 2. Pre-unlock state shows
 * "{n} of 8 verified" with the visible roster + first-mover CTA when
 * relevant. Post-unlock state shows the message thread.
 *
 * First-mover commitment (v15 BP §3.7a): when verifiedCount === 1
 * AND (women-only cohort OR tier-3 home city), surface the founder-
 * call CTA. Tap → modal → confirm phone → schedule → flip card to
 * "📞 Call scheduled · within 24h". Real Twilio masked-number bridge
 * happens in admin AD13 (out of mobile scope); this surface persists
 * the schedule + triggers mock N34 push.
 *
 * Mock state (placeholder): Pune × UCD × Sept 2026 at 5/8 verified,
 * NOT first-mover-eligible. To exercise the first-mover modal, set
 * MOCK_LAYER_1_COUNT = 1 below.
 */

// Typed as `number` (not literal) so the verified === 1 first-mover
// branch below remains type-meaningful when this const is flipped to 1
// during demo/QA. Real data would come from the corridor service.
const MOCK_LAYER_1_COUNT: number = 5;
const MOCK_HOME_CITY = "Pune";
const MOCK_DEST_UNI = "UCD";
const MOCK_INTAKE = "Sept 2026";

// First-mover eligibility — fakes for the demo. Real implementation
// reads from Layer 1 corridor metadata + the user's home_city tier.
const MOCK_IS_FIRST_MOVER_ELIGIBLE = false;

export default function HometownScreen() {
  const router = useRouter();
  const phone = useSession((s) => s.phone);
  const firstMoverCallScheduledAt = useSession(
    (s) => s.firstMoverCallScheduledAt,
  );
  const scheduleFirstMoverCall = useSession((s) => s.scheduleFirstMoverCall);

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmedToast, setConfirmedToast] = useState(false);

  const verified = MOCK_LAYER_1_COUNT;
  const threshold = CORRIDOR_LAYER_1_UNLOCK;
  const unlocked = verified >= threshold;
  const isFirstMover = verified === 1 && MOCK_IS_FIRST_MOVER_ELIGIBLE;
  const callScheduled = firstMoverCallScheduledAt !== null;

  const phoneMasked = phone?.e164
    ? `+${phone.e164.slice(0, 2)} ••••• ••${phone.e164.slice(-3)}`
    : "+91 ••••• ••231";

  const onConfirmCall = () => {
    scheduleFirstMoverCall();
    // Mock N34 push trigger — real app fires the push notification
    // catalogue entry. Here we just flash a confirmation chip.
    setConfirmedToast(true);
    setModalOpen(false);
    setTimeout(() => setConfirmedToast(false), 4000);
  };

  return (
    <Screen>
      <Pill variant={unlocked ? "primary" : "neutral"}>
        Hometown crew · Layer 1
      </Pill>

      <Hero
        title={`${MOCK_HOME_CITY} → ${MOCK_DEST_UNI}`}
        accent={MOCK_INTAKE}
        size="lg"
        style={styles.hero}
      />

      {unlocked ? (
        <>
          <CardSurface variant="default" style={styles.threadCard}>
            <KickerLabel tone="muted">Today</KickerLabel>
            <View style={styles.bubbles}>
              <MessageBubble
                variant="system"
                text={`Hometown crew is live. ${verified} of you, all from ${MOCK_HOME_CITY}, all heading to ${MOCK_DEST_UNI}.`}
              />
              <MessageBubble
                variant="other"
                initials="AD"
                authorName="Aditya"
                time="14:22"
                text="anyone else flying out of BOM on the 4th?"
              />
              <MessageBubble
                variant="other"
                initials="MH"
                authorName="Meera"
                time="14:25"
                text="me — let's share a cab to the airport"
              />
            </View>
          </CardSurface>
        </>
      ) : (
        <CardSurface variant="default" rail style={styles.preUnlockCard}>
          <KickerLabel tone="muted">Verifying</KickerLabel>
          <Text style={[typography.bodyStrong, styles.preUnlockCount]}>
            {verified} of {threshold} verified
          </Text>
          <Text style={[typography.body, styles.preUnlockBody]}>
            Hometown thread opens once {threshold - verified} more{" "}
            {MOCK_HOME_CITY} students heading to {MOCK_DEST_UNI} verify.
            Until then, the Layer 2 group chat is live with{" "}
            {CORRIDOR_LAYER_2_UNLOCK}+ students from across India.
          </Text>
          <Button
            label="Open Layer 2 group chat"
            onPress={() => router.push("/(app)/chat")}
            variant="secondary"
            size="md"
          />
        </CardSurface>
      )}

      {/* First-mover CTA / scheduled state. */}
      {isFirstMover ? (
        callScheduled ? (
          <CardSurface variant="accent" rail style={styles.firstMoverCard}>
            <KickerLabel tone="primary">First-mover</KickerLabel>
            <Text style={[typography.bodyStrong, styles.firstMoverTitle]}>
              📞 Call scheduled · within 24h
            </Text>
            <Text style={[typography.caption, styles.firstMoverMeta]}>
              We&apos;ll reach you on {phoneMasked} via masked-number
              bridge — your number stays private.
            </Text>
          </CardSurface>
        ) : (
          <CardSurface variant="accent" rail style={styles.firstMoverCard}>
            <KickerLabel tone="primary">You&apos;re the first</KickerLabel>
            <Text style={[typography.bodyStrong, styles.firstMoverTitle]}>
              We&apos;ll call to say hi
            </Text>
            <Text style={[typography.body, styles.firstMoverBody]}>
              Aayush or our T&S head, within 24 hours. Just to make sure
              you&apos;re not in here alone wondering if anything is real.
            </Text>
            <Button
              label="Schedule the call"
              onPress={() => setModalOpen(true)}
              variant="primary"
              size="md"
            />
          </CardSurface>
        )
      ) : null}

      {confirmedToast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>
            ✓ Founder-call scheduled — within 24h
          </Text>
        </View>
      ) : null}

      <Modal
        visible={modalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setModalOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.modalScrim}
            onPress={() => setModalOpen(false)}
          />
          <View style={styles.modalSheet}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <KickerLabel tone="primary">First-mover · founder call</KickerLabel>
              <Text style={[typography.bodyStrong, styles.modalTitle]}>
                You&apos;re the first
              </Text>
              <Text style={[typography.body, styles.modalBody]}>
                We&apos;ll call to say hi — Aayush or our T&S head,
                within 24 hours. What&apos;s the best number to reach
                you on?
              </Text>
              <CardSurface variant="default" style={styles.phoneCard}>
                <KickerLabel tone="muted">Calling on</KickerLabel>
                <Text style={[typography.bodyStrong, styles.phoneValue]}>
                  {phoneMasked}
                </Text>
                <Text style={[typography.caption, styles.phoneHint]}>
                  Masked-number bridge — your real number stays private.
                  We can reach a different number on request after the
                  first call.
                </Text>
              </CardSurface>
              <View style={styles.modalActions}>
                <Button
                  label="Schedule"
                  onPress={onConfirmCall}
                  variant="primary"
                  size="lg"
                />
                <Button
                  label="Not now"
                  onPress={() => setModalOpen(false)}
                  variant="ghost"
                  size="md"
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: theme.spacing[3],
    marginBottom: theme.spacing[5],
  },
  preUnlockCard: {
    gap: theme.spacing[3],
  },
  preUnlockCount: {
    fontSize: 28,
    color: theme.colors.fg,
    marginTop: theme.spacing[1],
  },
  preUnlockBody: {
    color: theme.colors.fgMuted,
    lineHeight: 22,
  },
  threadCard: {
    gap: theme.spacing[3],
  },
  bubbles: {
    gap: theme.spacing[3],
  },
  firstMoverCard: {
    gap: theme.spacing[2],
    marginTop: theme.spacing[5],
  },
  firstMoverTitle: {
    marginTop: theme.spacing[1],
  },
  firstMoverBody: {
    color: theme.colors.fgMuted,
    lineHeight: 22,
    marginBottom: theme.spacing[2],
  },
  firstMoverMeta: {
    color: theme.colors.fgMuted,
  },
  toast: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
  },
  toastText: {
    color: theme.colors.primaryFg,
    fontFamily: theme.fontFamily.body,
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalSheet: {
    backgroundColor: theme.colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
  },
  modalContent: {
    padding: theme.spacing[6],
    gap: theme.spacing[4],
  },
  modalTitle: {
    fontSize: 24,
    color: theme.colors.fg,
  },
  modalBody: {
    color: theme.colors.fgMuted,
    lineHeight: 22,
  },
  phoneCard: {
    gap: theme.spacing[1],
  },
  phoneValue: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 16,
    color: theme.colors.fg,
    marginTop: theme.spacing[1],
  },
  phoneHint: {
    color: theme.colors.fgMuted,
    marginTop: theme.spacing[2],
    lineHeight: 18,
  },
  modalActions: {
    gap: theme.spacing[2],
    marginTop: theme.spacing[3],
  },
});
