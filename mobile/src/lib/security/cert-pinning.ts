/**
 * Cert pinning configuration — fail-closed.
 *
 * Build Prompt §Bucket 3 + post-Bucket-10 review feedback:
 *   "Certificate pinning on all production hosts: tRPC backend,
 *    Razorpay, DigiLocker callback, Supabase, Twilio, Stripe. Use
 *    react-native-cert-pinner. Pin to public keys (not certs) with
 *    backup pins. Validate at every TLS handshake."
 *
 *   "Never ship code that *claims* to do security but does nothing.
 *    Either pin real SPKIs (with the rotation runbook actually
 *    exercised once) or set PINNING_ENABLED=false."
 *
 * Approach:
 *   - Pin SPKI (Subject Public Key Info) hashes, not full
 *     certificates. SPKI hashes survive cert rotation as long as the
 *     underlying public key doesn't change. Each host has at least
 *     one backup pin so a planned key rotation doesn't brick the app.
 *   - Pins extracted from live cert chains via the procedure in
 *     mobile/docs/cert-pinning.md.
 *
 * Default: PINNING_ENABLED = false. Stays false until real SPKIs
 * land for every host AND the native module is wired (post-Bucket-5
 * EAS Build). Flipping to true with empty pin lists will THROW at
 * module load via assertPinningCoherent — fail-closed, never
 * fail-open. The wiring stays in place so the day real fingerprints
 * are extracted, populating the arrays + flipping the flag is a
 * one-commit change.
 *
 * NOT YET WIRED: react-native-cert-pinner is a native module that
 * requires `pod install` + Android Gradle changes. The module config
 * lives here; the native install lands in the EAS Build pipeline
 * (Bucket 5) after credentials.
 *
 * Rotation procedure: mobile/docs/cert-pinning.md.
 *
 * v15 BP §16 / v6 build §11 / Build Prompt Bucket 3 + post-Bucket-10
 * review (item 1: stop the false signal).
 */

export type PinnedHost = {
  hostname: string;
  /** SPKI sha256 base64 hashes, prefixed with "sha256/". Always
   *  include at least one backup. Empty array = host has no pins yet
   *  → keeping PINNING_ENABLED=false is mandatory. */
  publicKeyHashes: string[];
  /** Why this host is pinned. */
  rationale: string;
};

export const PINNED_HOSTS: readonly PinnedHost[] = [
  {
    hostname: "nexgen-connect-api.vercel.app",
    publicKeyHashes: [
      // TODO(post-deploy): extract once tRPC server deploys to
      // nexgen-connect-api.vercel.app. Procedure in
      // mobile/docs/cert-pinning.md → "Initial extraction".
      // sha256/PRIMARY_PIN_PLACEHOLDER=
      // sha256/BACKUP_PIN_PLACEHOLDER=
    ],
    rationale: "tRPC server — every authed call. Highest-priority pin.",
  },
  {
    hostname: "api.razorpay.com",
    publicKeyHashes: [
      // TODO(pre-launch): extract from live Razorpay cert.
    ],
    rationale: "Premium ₹999 checkout. Tampering here → financial harm.",
  },
  {
    hostname: "api.digitallocker.gov.in",
    publicKeyHashes: [
      // TODO(pre-launch): extract from live DigiLocker cert.
    ],
    rationale: "Aadhaar VID handshake. MITM here → identity-hash forgery.",
  },
  {
    hostname: "*.supabase.co",
    publicKeyHashes: [
      // TODO(pre-launch): extract from live Supabase cert.
    ],
    rationale: "Storage (admit-letter PDFs) + Realtime (chat). MITM → admit-letter exfiltration.",
  },
  {
    hostname: "api.twilio.com",
    publicKeyHashes: [
      // TODO(pre-launch): extract from live Twilio cert.
    ],
    rationale: "Voice masked-number bridge for first-mover-call + MH1 emergency-phone.",
  },
  {
    hostname: "api.stripe.com",
    publicKeyHashes: [
      // TODO(Y1.5): extract from live Stripe cert. EUR fallback.
    ],
    rationale: "EUR fallback for in-destination Premium. Y1.5.",
  },
];

/**
 * Whether pinning is active. **Default: false.** Stays false until
 * real SPKIs land. Flipping to true with empty pin arrays will throw
 * at module load — see `assertPinningCoherent` below.
 *
 * Per post-Bucket-10 review feedback (item 1):
 *   "Either pin real SPKIs ... or set PINNING_ENABLED=false. Never
 *    ship code that *claims* to do security but does nothing."
 *
 * The day real fingerprints are extracted (per
 * mobile/docs/cert-pinning.md "Initial extraction"), populate the
 * arrays above and flip this flag in the same commit. The runtime
 * check guarantees the two states are coherent.
 */
export const PINNING_ENABLED: boolean = false;

/**
 * Fail-closed coherence check. Called at module load with the actual
 * (PINNING_ENABLED, PINNED_HOSTS) pair; also exposed for unit testing
 * with synthetic inputs.
 *
 * Throws when pinning is "enabled" but any host has no SPKI
 * fingerprints — this is the false-signal state we never want
 * shipping. The message points the reader at the rotation doc so the
 * fix path is obvious.
 *
 * No-op when pinning is disabled (current default — empty arrays are
 * fine because nothing claims to be enforcing them).
 */
export function assertPinningCoherent(
  enabled: boolean,
  hosts: readonly PinnedHost[],
): void {
  if (!enabled) return;
  for (const host of hosts) {
    if (host.publicKeyHashes.length === 0) {
      throw new Error(
        `cert-pinning: PINNING_ENABLED=true but ${host.hostname} has no SPKI fingerprints configured. ` +
          `Either extract real fingerprints (see mobile/docs/cert-pinning.md → "Initial extraction") ` +
          `or set PINNING_ENABLED=false. Never claim security you don't deliver.`,
      );
    }
  }
}

// Self-check on module load. If PINNING_ENABLED is ever flipped to
// true while any host's `publicKeyHashes` is empty, the bundle hard-
// fails the moment this module imports — long before any TLS
// handshake silently does nothing. Fail-closed by construction.
assertPinningCoherent(PINNING_ENABLED, PINNED_HOSTS);
