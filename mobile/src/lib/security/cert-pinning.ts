/**
 * Cert pinning configuration.
 *
 * Build Prompt §Bucket 3:
 *   "Certificate pinning on all production hosts: tRPC backend,
 *    Razorpay, DigiLocker callback, Supabase, Twilio, Stripe. Use
 *    react-native-cert-pinner. Pin to public keys (not certs) with
 *    backup pins. Validate at every TLS handshake."
 *
 * Approach:
 *   - Pin SPKI (Subject Public Key Info) hashes, not full
 *     certificates. SPKI hashes survive cert rotation as long as the
 *     underlying public key doesn't change. Each host has at least
 *     one backup pin so a planned key rotation doesn't brick the app.
 *   - Pins are extracted from live cert chains using the helper
 *     script tools/extract-spki-hash.sh (TODO Bucket 3 follow-up).
 *   - In dev (__DEV__ === true) pinning is OFF so hot-reload + local
 *     proxies still work.
 *
 * NOT YET WIRED: react-native-cert-pinner is a native module that
 * requires `pod install` + Android Gradle changes. The module config
 * lives here; the native install lands in the EAS Build pipeline
 * (Bucket 5) after credentials. Until then, this file is the
 * canonical record of the pin map.
 *
 * Rotation procedure: see mobile/docs/cert-pinning.md (Bucket 3
 * follow-up).
 *
 * v15 BP §16 / v6 build §11 / Build Prompt Bucket 3.
 */

export type PinnedHost = {
  hostname: string;
  /** SPKI sha256 base64 hashes. Always include at least one backup. */
  publicKeyHashes: string[];
  /** Why this host is pinned. */
  rationale: string;
};

export const PINNED_HOSTS: readonly PinnedHost[] = [
  {
    hostname: "nexgen-connect-api.vercel.app",
    publicKeyHashes: [
      // TODO(bucket-4): extract once tRPC server deployed.
      // sha256/PRIMARY_PIN_PLACEHOLDER=
      // sha256/BACKUP_PIN_PLACEHOLDER=
    ],
    rationale: "tRPC server — every authed call. Highest-priority pin.",
  },
  {
    hostname: "api.razorpay.com",
    publicKeyHashes: [
      // TODO(bucket-3): extract from live Razorpay cert.
    ],
    rationale: "Premium ₹999 checkout. Tampering here → financial harm.",
  },
  {
    hostname: "api.digitallocker.gov.in",
    publicKeyHashes: [
      // TODO(bucket-3): extract from live DigiLocker cert.
    ],
    rationale: "Aadhaar VID handshake. MITM here → identity-hash forgery.",
  },
  {
    hostname: "*.supabase.co",
    publicKeyHashes: [
      // TODO(bucket-3): extract from live Supabase cert.
    ],
    rationale: "Storage (admit-letter PDFs) + Realtime (chat). MITM → admit-letter exfiltration.",
  },
  {
    hostname: "api.twilio.com",
    publicKeyHashes: [
      // TODO(bucket-3): extract from live Twilio cert.
    ],
    rationale: "Voice masked-number bridge for first-mover-call + MH1 emergency-phone.",
  },
  {
    hostname: "api.stripe.com",
    publicKeyHashes: [
      // TODO(bucket-3): extract from live Stripe cert. Y1.5 EUR fallback.
    ],
    rationale: "EUR fallback for in-destination Premium. Y1.5.",
  },
];

/**
 * Whether pinning is active for the current build. Pinning is OFF in
 * dev so hot-reload + local proxies (Charles, mitmproxy) still work
 * when debugging network issues.
 */
export const PINNING_ENABLED: boolean = !__DEV__;
