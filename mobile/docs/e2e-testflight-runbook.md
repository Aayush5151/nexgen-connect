# E2E on TestFlight build — runbook

End-to-end tests on the Apple-signed TestFlight build run only after the credential block from [C1](./build-prompt-decisions.md#c--credentials--accounts) clears. Until then, E2E specs land but execute against the dev simulator with the mock backend.

Build Prompt §Bucket 6 / E2E:

> "E2E tests on TestFlight/Internal Track build with real OTP fallback (test phone numbers): verify network, push notifications, deep links, biometric re-auth."

---

## Prerequisites

1. Apple Developer Program enrolled. Bundle ID `app.nexgenconnect` registered. (See [eas-setup.md](./eas-setup.md) steps 1–3.)
2. Google Play Console enrolled. Internal Track app created. (Step 4.)
3. EAS Production tier active. (Step 6.)
4. `EXPO_TOKEN`, `APPLE_ID`, `APPLE_TEAM_ID`, `ASC_APP_ID` set as GitHub repo secrets.
5. A successful preview build has uploaded to TestFlight (verifies the pipeline before E2E gating).
6. Test phone numbers registered with MSG91 / Twilio dev sandbox so OTP fires without consuming production SMS budget.

---

## E2E flow

### Step 1: tag a release candidate

```bash
git tag -a release/v0.1.0-rc.1 -m "0.1.0-rc.1 — E2E candidate"
git push origin release/v0.1.0-rc.1
```

CI runs `mobile-release.yml` → builds production → uploads to TestFlight + Play Internal Track.

### Step 2: invite test devices

- iOS: in App Store Connect → Users and Access → Add Internal Testers → invite Aayush + the test devices' Apple IDs. Approve them in the TestFlight section of the build.
- Android: in Play Console → Internal testing → Testers tab → add the email lists.

### Step 3: install on physical test devices

- iPhone 12 (iOS test device for performance baseline per Bucket 9)
- Pixel 5 (Android test device)
- Optional: Redmi 12 (low-end Android performance baseline)

### Step 4: run Detox / Maestro flows on real devices

Bucket 6 ships the test specs:

```bash
# iOS
cd mobile
npx detox test --configuration ios.sim.testflight \
  --DEVICE_UDID="$IPHONE_12_UDID" \
  --TRPC_URL="https://nexgen-connect-api.vercel.app/api/trpc"

# Android
npx detox test --configuration android.real.testflight \
  --DEVICE_SERIAL="$PIXEL_5_SERIAL" \
  --TRPC_URL="https://nexgen-connect-api.vercel.app/api/trpc"
```

### Step 5: verify the seven critical flows (Build Prompt §Bucket 6)

Run each flow as a Detox test or manually checklist:

1. **Signup → OTP → DigiLocker happy path → admit upload → verification waiting → Layer 2 placement.**
2. **DigiLocker S27 fallback → passport upload → admit upload → verification.**
3. **DigiLocker S28 fallback (mobile-mismatch) → passport upload → admit upload.**
4. **Hybrid-programme warning (S31) → continue at risk → corridor placement.**
5. **Corridor unlock event (Layer 2 crosses 30) → push received → app opens → hero animation plays → user reaches first sub-circle.**
6. **Premium purchase → Razorpay success → parent dashboard setup → first arrival check-in.**
7. **Harassment report → 4-hour SLA timer → advisor response → resolution.**

### Step 6: smoke-verify on real device (network + push + deep links + biometric)

- **Network**: airplane mode → send a message → verify offline-queue indicator → reconnect → verify queued message sends.
- **Push notifications**: trigger the corridor unlock from a second test account → verify the first device receives the push within 100ms p95 (per v6 §22 budget).
- **Deep links**: send `nexgen-connect://corridor/ucd-sept-2026` via SMS → tap → verify the app opens to CH1.
- **Biometric re-auth**: tap "Buy Premium" → Face ID prompt fires → cancel → verify error path → retry → success.

### Step 7: report findings

Output goes into [`mobile/docs/e2e-test-results.md`](./e2e-test-results.md) (created when first run completes). Per-flow status: PASS / FAIL with screenshot + system logs.

If any flow fails the Detox spec → the release candidate is rejected. Fix → tag `release/v0.1.0-rc.2` → re-run.

---

## What runs on dev simulator (pre-credentials)

Until E2E on TestFlight is unblocked, Bucket 6 runs the same Detox specs against the development build (`eas build --profile development --platform ios --simulator`). Coverage is identical except:

- OTP uses the magic dev code `123456` (per `MOCK_OTP=true`).
- DigiLocker uses `forceFailure` test helper instead of real OAuth.
- Razorpay returns mock success without real Razorpay sheet.
- Twilio voice bridge is the mock client (no real call).

This catches ~85% of regressions; the remaining 15% are real-network / real-push / real-deep-link issues that only surface on a signed TestFlight build.

---

## Schedule

E2E on TestFlight = **post-credentials**. ETA: whenever Apple Developer + Google Play + Expo Production accounts complete the verification windows (typically 1–3 weeks after enrolment).

Until then: dev-simulator E2E + manual exploratory testing on Aayush's iPhone via the Expo Go client (with limitations — no native push, no real biometric, no real DigiLocker).

v6 build §23, §25 / Build Prompt Bucket 6 + C5.
