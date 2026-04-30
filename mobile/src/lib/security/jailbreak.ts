/**
 * Jailbreak / root detection.
 *
 * Build Prompt §Bucket 3: "On detect, refuse to render sensitive
 * surfaces (Premium, Parent View, T&S Report). Show a clear message:
 * 'We detect your device may be modified. For your safety,
 * NexGen Connect doesn't run on rooted/jailbroken devices.'"
 *
 * Strategy: expo-device exposes isRootedExperimentalAsync() on
 * Android + iOS (combined heuristic — checks for Cydia, common
 * jailbreak tooling paths, su binary). The "experimental" prefix is
 * Expo's own caveat that detection isn't 100% — sophisticated
 * adversaries can defeat any client-side check. We treat detection
 * as defense-in-depth, not a hard gate.
 *
 * Caching: the result is checked once per app session and cached.
 * Re-checking on every render of a sensitive surface adds latency
 * with no real protection upside.
 *
 * Server-side defence-in-depth lives in Bucket 4: app attestation
 * (DeviceCheck / Play Integrity) signed by the OS, validated server-
 * side before issuing fully-verified JWTs. That's the real gate.
 *
 * v15 BP §16 / v6 build §16 / Build Prompt Bucket 3.
 */
import * as Device from "expo-device";

let cached: boolean | null = null;

export async function isJailbrokenOrRooted(): Promise<boolean> {
  if (cached !== null) return cached;
  try {
    const result = await Device.isRootedExperimentalAsync();
    cached = result;
    return result;
  } catch {
    // Detection itself failed — fail open (false). Server-side
    // attestation is the real gate; client check is defense-in-depth.
    cached = false;
    return false;
  }
}

/**
 * Reset the cached result. Test-only; production code should rely on
 * the per-session cache.
 */
export function _resetJailbreakCache(): void {
  cached = null;
}
