/**
 * Biometric re-auth helper.
 *
 * Build Prompt §Bucket 3 / Biometric re-auth: required for Premium
 * purchase, Parent View setup, T&S Report submission, Account
 * Deletion, Data Export. Fall back to PIN if biometrics unavailable.
 *
 * Implementation: expo-local-authentication. Returns a discriminated
 * result so callers can branch on success / cancelled / unavailable
 * without try/catching.
 *
 * Usage:
 *   const r = await reauth("Confirm Premium purchase");
 *   if (r.ok) proceed();
 *   else if (r.reason === "cancelled") return;
 *   else if (r.reason === "unavailable") fallbackToPin();
 *
 * v15 BP §16.7 / v6 build §16 / Build Prompt Bucket 3.
 */
import * as LocalAuthentication from "expo-local-authentication";

export type ReauthResult =
  | { ok: true }
  | { ok: false; reason: "cancelled" | "unavailable" | "lockout" | "error"; message: string };

/**
 * Prompt the user for biometric re-authentication. Returns a typed
 * outcome — never throws. The `prompt` is what shows on the system
 * sheet (e.g., "Confirm Premium purchase").
 */
export async function reauth(prompt: string): Promise<ReauthResult> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      return { ok: false, reason: "unavailable", message: "No biometric hardware on this device." };
    }
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) {
      return {
        ok: false,
        reason: "unavailable",
        message: "No biometrics enrolled. Set up Face ID / Touch ID / fingerprint to use this feature.",
      };
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: prompt,
      // iOS: "Cancel" instead of native default to avoid the user
      // tapping "Cancel" thinking they cancelled the underlying action.
      cancelLabel: "Cancel re-auth",
      // Disable fallback to passcode by default — passcode is weaker
      // than biometric for re-auth gating. Callers that want a PIN
      // fallback set their own with disableDeviceFallback: false.
      disableDeviceFallback: true,
    });
    if (result.success) return { ok: true };
    if (result.error === "app_cancel" || result.error === "user_fallback") {
      return { ok: false, reason: "cancelled", message: "User cancelled biometric prompt." };
    }
    if (result.error === "authentication_failed" || result.error === "timeout") {
      return {
        ok: false,
        reason: "lockout",
        message: "Authentication failed. Unlock your device with passcode and retry.",
      };
    }
    return { ok: false, reason: "error", message: result.error ?? "Authentication failed." };
  } catch (e) {
    return {
      ok: false,
      reason: "error",
      message: e instanceof Error ? e.message : "Unknown re-auth error.",
    };
  }
}

/**
 * Quick predicate — does this device have biometrics set up at all?
 * Use to gate UI states (e.g., disable "Enable Face ID" toggle if
 * user hasn't enrolled).
 */
export async function isBiometricAvailable(): Promise<boolean> {
  const [hardware, enrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);
  return hardware && enrolled;
}
