# Security hardening (Bucket 3)

What's hardened, what isn't yet, why each gate exists. Cross-references the v15 BP §16 (security & privacy) + Build Prompt Bucket 3 spec.

---

## What ships in Bucket 3

### Client-side primitives (mobile/src/lib/security/)

| Module | What it does | Build Prompt ref |
|---|---|---|
| `biometric.ts` | `reauth(prompt)` — Face ID / Touch ID / fingerprint gate via expo-local-authentication. Required for: Premium purchase, Parent View setup, T&S Report submission, Account Deletion, Data Export. | §Bucket 3 / Biometric re-auth |
| `jailbreak.ts` | `isJailbrokenOrRooted()` — expo-device's heuristic check. Cached per app session. Refuse to render Premium / Parent View / T&S Report on rooted/jailbroken devices. Server-side attestation (Bucket 5) is the real gate. | §Bucket 3 / Jailbreak detection |
| `screen-protection.ts` | `useScreenCapturePrevent()` hook — wraps `expo-screen-capture.preventScreenCaptureAsync` (Android FLAG_SECURE + iOS app-switcher blur). Use on PV2, TS3, PR3, O8/O11. | §Bucket 3 / Background blur + Screenshot prevention |
| `pii-scrub.ts` | `maskPhone`, `scrubObject`, `sentryBeforeSend`, `filterAnalyticsProperties` (PostHog whitelist). Wired into the Sentry + PostHog mocks so PII never reaches the analytics pipeline. | §Bucket 3 / Crash reports + Analytics events |
| `session-manager.ts` | `useIdleTimeout(stage, onIdle)` — 15-min idle timeout for phone-only state, 7-day for fully verified. Polls every 30s + checks on app resume. | §Bucket 3 / Session management |
| `cert-pinning.ts` | `PINNED_HOSTS` map — declarative list of production hosts + SPKI hashes (placeholders until tRPC server deploys in Bucket 4). | §Bucket 3 / Certificate pinning |

### Validation schemas (packages/shared/src/validation.ts)

Zod schemas as the **single source of truth** for both client (mobile forms) and server (Bucket 4 tRPC). One source, no drift between client validation messages and server rejection.

Schemas land for: `PhoneSchema`, `OtpSchema`, `ProfileSchema`, `CorridorChoiceSchema`, `ScaredSchema`, `UploadAdmitSchema`, `ReportSchema`, `ParentPasscodeSchema`, `ArrivalCheckinSchema`.

### Mock-layer hooks already wired

- **`sentry.mock.ts captureException`** — scrubs tags via `scrubObject` before buffering. Mirrors what real Sentry's `beforeSend` will do once `@sentry/react-native` lands.
- **`sentry.mock.ts setUser`** — drops email entirely; only the UUID id is preserved.
- **`posthog.mock.ts capture`** — runs every event property through `filterAnalyticsProperties()`. Properties outside `POSTHOG_PROPERTY_WHITELIST` drop silently.
- **`posthog.mock.ts identify`** — same whitelist on traits.

---

## What's deferred

### To Bucket 4 (server-dependent)

| Item | Why deferred |
|---|---|
| **Aadhaar VID handling** | The 12-digit Aadhaar number must NEVER be on the device. DigiLocker handshake returns a VID; server-side composite hash (per v15 BP §9.1) is computed there and only `name + dob_year + dob_month + masked hash` is returned to client. Client can never derive, see, or transmit raw Aadhaar. The server-side computation lands in Bucket 4. |
| **audit_log writes** | Every PII-adjacent operation logs to `audit_log` (immutable, append-only). DPDP+GDPR compliance. The table + middleware land in Bucket 4. |
| **Right-to-erasure cascade** | `DELETE /account/delete` triggers a server-side cascade that deletes all user-keyed rows within 60 minutes per BP §16.8 P4. Server logic + verification check land in Bucket 4. |
| **Data export (Resend secure-link, 72-hour expiry)** | Server-side ZIP composition + Resend integration. Bucket 4. |
| **Parent View RBAC** | Parent JWT can ONLY read aggregate stats. Server-side row-level security policy. Bucket 4. |
| **Twilio Voice masked-number flow** | Plaintext phone never lands in any UI. Server decrypts in process memory, calls Twilio, returns masked number. Server-side procedure `admin.callFirstMover` / `admin.callUserViaMasked` lands in Bucket 4. |
| **Refresh-token rotation** | Skeleton in `session-manager.ts`; the actual refresh call lands when tRPC client wires up in Bucket 4. |

### To Bucket 5 (credentials needed)

| Item | Credential block |
|---|---|
| **App attestation (DeviceCheck / Play Integrity)** | Apple Developer Program + Google Play Console accounts. |
| **Native cert-pinning library install** | `react-native-cert-pinner` is a native module — needs `pod install` + Android Gradle changes. The JS-side config (`PINNED_HOSTS`) is committed; the native install lands in the EAS Build pipeline (Bucket 5) once Apple / Google credentials exist. |
| **Anti-tampering build config** | `react-native-obfuscating-transformer` + EAS Build production profile minification. Bucket 5. |
| **Sentry source maps** | EAS Build hook to upload sourcemaps. Bucket 5. |

---

## Threat model — what we're protecting against

Per Build Prompt §North Star "Extreme security": the threat model includes Indian-student-targeted scams, agent-driven catfishing, parental snooping, government-data subpoena (DPDP Act + GDPR), device theft, and adversarial reverse-engineering. The hardening above maps to specific threats:

| Threat | Mitigation |
|---|---|
| **Device theft** (forensic image, jailbreak, kid sister borrowing phone) | Secure storage in iOS Keychain / Android EncryptedSharedPreferences (already done, v5). 15-min idle timeout for phone-only state. Biometric re-auth on Premium / Parent / T&S / Delete / Export. Jailbreak detection refuses to render sensitive surfaces. |
| **Network adversary** (rogue WiFi at the airport, intercepting agent's MITM) | TLS 1.3 + HSTS. Cert pinning to public keys (post-Bucket-4 deploy). |
| **Parental snooping** (Mumbai mother reading daughter's DMs) | Parent JWT can ONLY read aggregate stats. Parent dashboard renders status, not content. Screenshots blocked on Parent View dashboard. |
| **Government subpoena** | Aadhaar number never stored — only a one-way composite hash. Admit-letter PDFs auto-delete within 60 minutes of decision. Data export via Resend secure-link (no email of raw data). audit_log proves every access. |
| **Agent-driven catfishing** | Identity-tied bans (composite hash); banned identity can never re-register. Three-check verification (phone + DigiLocker + admit) is the entry gate. |
| **Adversarial reverse-engineering** | Anti-tampering (production EAS build): code obfuscation, minification, symbol stripping. App attestation (DeviceCheck / Play Integrity) — the OS signs that the running binary is the published build. |
| **App-switcher / shoulder-surfing** | iOS app-switcher blur on app background. Android FLAG_SECURE on sensitive screens. |
| **Analytics pipeline leakage** | PostHog property whitelist at SDK boundary. Sentry beforeSend scrubs tags + breadcrumbs. Names + emails NEVER sent to either pipeline. Phone numbers masked to last-4 only. |

---

## How to use — quick reference

```tsx
// Biometric re-auth before Premium purchase
import { reauth } from "@/lib/security";

const onPressBuyPremium = async () => {
  const r = await reauth("Confirm Premium purchase");
  if (!r.ok) { showError(r.message); return; }
  startCheckout();
};

// Block screen capture on the parent dashboard
import { useScreenCapturePrevent } from "@/lib/security";

export default function ParentDashboardScreen() {
  useScreenCapturePrevent();
  // ...
}

// Refuse jailbroken devices on a sensitive surface
import { isJailbrokenOrRooted } from "@/lib/security";

useEffect(() => {
  void isJailbrokenOrRooted().then((rooted) => {
    if (rooted) router.replace("/security/blocked");
  });
}, []);

// Idle timeout (wire once in RootLayout)
import { useIdleTimeout } from "@/lib/security";

useIdleTimeout(
  sessionToken && admitApproved ? "fully_verified" : "phone_only",
  () => { clearSession(); router.replace("/"); },
);

// Mask a phone for display / logging
import { maskPhone } from "@/lib/security";

const display = maskPhone("919876543210"); // "*****6543"
```

---

## What a future security audit will look for

When the audit runs (Bucket 6 ships test coverage; an external penetration test is post-launch), these are the specific properties to verify:

1. **No raw Aadhaar number anywhere on the device.** Search `AsyncStorage`, SecureStore, in-memory state, network bodies. Test: integration check that `services.verification.completeDigiLocker` returns ONLY `maskedHash` + `summary.{nameFirstAndLast, yearMonthOfBirth}`. The 12-digit number is server-only.
2. **No PII in any analytics event.** PostHog event-buffer assertion: every property is in `POSTHOG_PROPERTY_WHITELIST`.
3. **No PII in any Sentry breadcrumb / exception tag.** Sentry buffer assertion: no property name matches `REDACT_KEYS`.
4. **No PII in any URL.** Lint rule: forbid `?phone=` / `?email=` / `?aadhaar=` patterns in any string literal under `app/` and `src/`.
5. **All sensitive screens block screenshot/recording.** Detox test: navigate to PV2, attempt screen capture, assert blocked.
6. **Idle timeout fires at the spec'd thresholds.** Unit test: advance the clock 15min in phone-only stage and assert `onIdle` fires.
7. **Cert pinning rejects MITM.** Bucket 5 EAS Build integration test: connect to a known-bad cert, assert TLS handshake fails.
8. **Biometric re-auth required for protected actions.** Detox: tap "Buy Premium" without biometric → blocked. With biometric → proceed.
