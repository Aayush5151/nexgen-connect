# Detox specs — the seven critical flows

Build Prompt §Bucket 6 lists seven critical flows that must be E2E-covered. This directory holds the spec scaffolds.

| # | Flow | Spec file | Status |
|---|---|---|---|
| 1 | Signup → OTP → DigiLocker happy path → admit upload → verification waiting → Layer 2 placement | [`01-signup-otp-digilocker-happy-path.spec.ts`](./01-signup-otp-digilocker-happy-path.spec.ts) | scaffold |
| 2 | DigiLocker S27 fallback → passport upload → admit upload → verification | TODO `02-digilocker-s27-fallback.spec.ts` | pending |
| 3 | DigiLocker S28 fallback (mobile-mismatch) → passport upload → admit upload | TODO `03-digilocker-s28-fallback.spec.ts` | pending |
| 4 | Hybrid-programme warning (S31) → continue at risk → corridor placement | TODO `04-hybrid-warning-s31.spec.ts` | pending |
| 5 | Corridor unlock event (Layer 2 crosses 30) → push received → app opens → hero animation plays → user reaches first sub-circle | TODO `05-corridor-unlock-event.spec.ts` | pending |
| 6 | Premium purchase → Razorpay success → parent dashboard setup → first arrival check-in | TODO `06-premium-parent-arrival.spec.ts` | pending |
| 7 | Harassment report → 4-hour SLA timer → advisor response → resolution | TODO `07-harassment-sla.spec.ts` | pending |

## Running

Until simulator builds are wired (Bucket 5 dry-run mode):

```bash
# Local — once iOS build artifacts exist:
cd mobile
npx detox build --configuration ios.sim.debug
npx detox test --configuration ios.sim.debug

# CI — runs against TestFlight build (post-credentials per C5):
# See mobile/docs/e2e-testflight-runbook.md
```

## Why scaffold-only in Bucket 6

Detox needs a built native iOS / Android binary to test against. That requires either:
- Local Xcode + Android Studio (fine for the founder's machine, not for CI without macOS runners + signing certs).
- EAS Build artifacts (post-credentials per Bucket 5).

The scaffolded spec proves the test harness API is correct against our screens (Pressable IDs, text content, waitFor patterns). When the build pipeline lights up, the scaffolds run unchanged.

v6 build §23 / Build Prompt Bucket 6 + C5.
