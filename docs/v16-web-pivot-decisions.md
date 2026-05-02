# NexGen Connect — v16 web-first pivot decisions

**Date:** 2 May 2026
**Author:** Aayush Shah (founder)
**Supersedes:** [`mobile/docs/build-prompt-decisions.md`](../mobile/docs/build-prompt-decisions.md) (v15 mobile-first build, buckets 1–10 all merged)
**Source prompt:** [`NexGen_Connect_v16_Web_First_Build_Prompt.md`](../NexGen_Connect_v16_Web_First_Build_Prompt.md)
**Repo:** [github.com/Aayush5151/nexgen-connect](https://github.com/Aayush5151/nexgen-connect) — branch `main`, parent of this work `41ac7a45`

This doc captures the strategic shift to web-first and the per-bucket choices made during execution. Future engineers reference this instead of asking "why this change vs. the v15 plan?".

---

## 1. Why web-first

Five reasons. Each is final, none is conjecture.

1. **The v1 must-haves all work on web.** Verification, corridor matching, group chat, premium, parent view — every market-entry feature ships on web cleanly. Push notifications, biometric reauth, screen-capture prevention, and in-app voice bridges are retention amplifiers, not gating features. They ride on web through PWA + browser APIs (FCM/OneSignal push, WebAuthn, the `prefers-reduced-motion` media query, `<meta name="referrer">`).
2. **Mobile-first costs $223/yr in subscriptions before one verified user exists** — Apple Developer ($99), Google Play ($25), Expo Production ($99) — plus 2–3 weeks of Apple review per release iteration. Web-first costs $0 incremental on the existing Vercel free tier and ships in minutes per release.
3. **Sept 2026 Ireland launch is realistic from web.** Mobile-first pushed launch to Q1 2027 because of the credential-and-cert provisioning chain (Apple enrolment → bundle ID → DigiLocker production approval → first TestFlight build → review). Web shipping is identity-token-only.
4. **The codebase is 70% there.** [`packages/server/`](../packages/server/) is backend-agnostic tRPC — every domain router (auth, verification, corridor, chat, premium, parent, T&S, group-apply, mental-health, scams, admin) consumes inputs and produces outputs that work identically against a web client. [`web/`](../web/) is Next.js 16 with Supabase SSR already wired and a deployed Vercel production build at `nexgen-connect.vercel.app`. The mobile-only assets (Expo SDK 54, react-native-reanimated, expo-secure-store, font binaries) are paused, not deleted.
5. **The mobile codebase stays on `main`, paused but not deleted.** It becomes the v1.5 native experience upgrade once web has 500+ verified users and the friction points are validated by real usage. We will know what mobile-only features actually drive retention, instead of guessing.

Web-first does **not** mean killing mobile. It means redirecting the spotlight to the surface that already exists, while preserving the mobile work as a future asset.

---

## 2. What mobile becomes

**Status:** paused, not killed, as of 2 May 2026.

Concrete scope of "paused":

- No new feature work in `mobile/`. Bug fixes only when they affect a shared surface (e.g., a `packages/shared/` token change ripples through both web and mobile).
- The mobile app continues to compile (`npm run mobile:start --web` still boots the Expo web preview against the running mocks). It is preserved as a working snapshot.
- The single-file marker [`mobile/PAUSED.md`](../mobile/PAUSED.md) is the canonical statement. It is referenced from the workspace `README.md` and from every doc that previously implied mobile was the v1 target.
- Pre-pause polish (Bucket 10 of v16) closes the visible-debt items: dev strings stripped, `useReducedMotion()` wired, semantic headings on every screen, `cert-pinning.ts` made fail-closed (already in PR #27), `mr/` locale dropped, `hi/` locale gated until native review.

**v1.5 scope (resume Q1 2027 if web hits 500+ verified users):**

| v1.5 mobile-only | Why |
|---|---|
| Push notifications (full iOS support, not just PWA Add-to-Home-Screen on Android) | Group-unlock and admit-letter-approved are the two events users want to know about within seconds, not hours |
| Biometric reauth for Premium / Parent / T&S / delete | Web has WebAuthn; native gives the immediacy users expect for a ₹999 transaction |
| Screen-capture prevention on Parent View | iOS app-switcher blur is the expected pattern; web can't replicate |
| In-app voice bridge for first-mover-call (Twilio Voice) | Web's WebRTC works but the native handoff to the dialer is the pattern users trust |
| Offline-queue replay on chat | Already scaffolded in `mobile/src/lib/offline.ts`; web adds it via service worker in Bucket 9 |

The full v15 specs for mobile (buckets 1–10) remain valid — the work is in `main` and tested. Resuming is "unpause + reconcile drift since pause" rather than "rebuild."

---

## 3. What changes per surface

| Surface | Status before v16 | Status after v16 |
|---|---|---|
| Marketing site (`web/src/app/page.tsx`, university pages, /how, /research, /press, /founder) | Live at nexgen-connect.vercel.app, shipping | Stays live. Bucket 1 fixes 7 visible bugs (dead Store CTAs, ₹1,499 vs ₹999 mismatch, brand-color drift, title duplication, sub-44pt tap targets, Campuses dropdown stub, missing `/pricing` `/parents` redirects) |
| Legal pages (`/privacy`, `/terms`, `/legal`) | All three serve identical content | Bucket 2 splits Privacy + Terms into byte-distinct documents with GDPR/DPDP-required items; `/legal` redirects to `/privacy` |
| Server (`packages/server/`) | tRPC v11 skeleton, mocked external integrations, in-memory rate-limit, console.log audit log, no composite hash | Bucket 3 lands real composite identity hash, real Supabase `audit_log` writes, Upstash for rate-limit + idempotency, account-deletion cascade, Cloudflare Turnstile bot-protection. Real MSG91 / DigiLocker / Razorpay swap in Bucket 6 (env-key-blocked) |
| Web auth + signup | Doesn't exist — there are admin login + DigiLocker-callback routes only | Bucket 4 creates `/signup/*` funnel matching the mobile shape: phone → OTP → you → corridor → preview (cold-start aware) → identity → admit |
| Web product surface (authed) | Doesn't exist | Bucket 5 creates `/app/corridor`, `/app/chat`, `/app/help`, `/app/profile`, mirroring the mobile `(app)/` tree |
| Real integrations | All mocked | Bucket 6 swaps mocks for MSG91, DigiLocker, Razorpay, Cloudflare Images, Resend (env-key-blocked; feature-flagged) |
| Group chat | Mock channel list + thread | Bucket 7 wires Supabase Realtime + RLS + persistence, plus T&S report flow |
| Premium + Parent + Y6 | Mock procedures returning shaped data | Bucket 8 wires Razorpay payments, parent magic-link tokens, group-apply PBSA webhook, arrival check-in |
| PWA + push | Doesn't exist | Bucket 9 ships manifest + service worker + install prompt + web push |
| Mobile workspace | v15 buckets 1–10 merged but in messy partial state | Bucket 10 polishes (strips dev strings, wires `useReducedMotion()`, semantic headings, `cert-pinning.ts` fail-closed via PR #27, drops `mr/`, gates `hi/`) and finalises [`mobile/PAUSED.md`](../mobile/PAUSED.md) |
| Tests + a11y + perf | 72 unit tests (mobile + shared), Detox scaffolds, no Playwright, no axe-core CI | Bucket 11 lands ≥50 web Playwright E2E specs + axe-core CI gate + bundle-size gate (180 KB target) + real-device perf measurements |

---

## 4. What stays the same (do not relitigate)

- **Server contracts.** Every router and procedure shape in `packages/server/src/server/routers/` is canonical. Web consumes them identically.
- **Copy package.** `packages/copy/` (EN baseline, partial HI, partial MR) is the source of truth for both web and mobile. Web adds a `useCopy` hook variant; the catalogues are reused verbatim.
- **i18n strategy.** EN 100% baseline, HI ~39% partial gated until native review (per A6 of v15 decisions doc), MR ~10% machine-drafted dropped per Bucket 10. Pseudo-locale (`en-PSEUDO`) for length-budget testing stays.
- **Validation.** Zod schemas in `packages/shared/src/validation.ts` are the single source of truth. Web forms use react-hook-form's Zod resolver against the same schemas the server uses as tRPC input parsers.
- **Design tokens.** `packages/shared/src/theme.ts` is canonical. After Bucket 1 the `primary` token is `#00DC82` (electric emerald) site-wide — web and the paused mobile workspace both consume it.
- **Discipline rules.** 5+1-class import audit, clean-clone-verify before push, commit-msg hook enforcing `v15 BP §X.Y` / `v16 web pivot §X.Y` / `Bucket N` references. The hooks were proven on the v15 buckets and stay in place.
- **The seven stop conditions.** Listed in §1.3 of the v16 prompt. They halt execution and surface a status report; they do not get worked around.
- **The user-promise.** "Find your people before you land." Every shipped surface answers that. Surfaces that don't move users toward verified group formation are questioned before they ship.

---

## 5. Sept 2026 Ireland launch path (8-week sequence)

| Week | Buckets | What ships | Acceptance gate |
|---|---|---|---|
| 1 | 0 + 1 + 2 (3 in parallel) | Pivot decisions, web cross-surface fixes, legal split | Week-end: `nexgen-connect.vercel.app` audit-clean. `/privacy` and `/terms` byte-distinct. ₹999 unified. Brand color unified to `#00DC82`. |
| 2 | 3 finishes; 4 begins | Server hardening complete (composite hash, audit log, Upstash rate-limit, erasure cascade, Turnstile). Web auth + signup begins. | Week-end: 12+ identity-hash tests pass. `audit_log` populated. Rate-limit works across instances. |
| 3 | 4 finishes | Web signup end-to-end vs mocks | Week-end: Playwright happy-path signup green. Cold-start preview shows real `verified_count` from corridor stats. |
| 4 | 5 | Web product surface scaffolded against mocks | Week-end: 12+ Playwright app-surface specs green. |
| 5 | 6 (env-key blocked, scaffold + flags) + 7 | Real MSG91 / DigiLocker / Razorpay / Cloudflare Images / Resend feature-flagged. Group chat + Realtime + T&S. | Week-end: Send/receive message via Realtime working. Sandbox MSG91 OTP working. |
| 6 | 8 | Premium + parent + group-apply + arrival check-in | Week-end: ₹999 sandbox payment flow green. Parent magic-link working. |
| 7 | 9 + 10 (parallel) | PWA installable + push notifications. Mobile pre-pause polish. | Week-end: Lighthouse PWA ≥ 90. Mobile dev strings clean. `useReducedMotion()` wired. |
| 8 | 11 | Tests + a11y + perf + completion summary. Soft launch to first 50 waitlist users. | Week-end: ≥50 Playwright specs green. axe-core zero violations. Bundle ≤ 180 KB. iPhone 12 LCP ≤ 2.5s. |

**Slack:** 4+ weeks before September 2026 Ireland soft-launch event. Sufficient for one round of native-speaker translation review (HI completion), one round of designer engagement (hero illustrations + corridor-unlock animation), and one round of usage feedback from the first 50 verified users.

---

## 6. Outstanding items (user-driven, not part of automated execution)

These remain Aayush's call and unblock at his pace. Documented per the prompt's §6 "What this prompt does NOT cover":

- **Real env keys.** MSG91 production, DigiLocker production, Razorpay production keys, Upstash Redis URL, Cloudflare Images API key, Resend API key, Cloudflare Turnstile site key, OneSignal/FCM. Each Bucket-6/8 feature ships scaffolded with `NEXT_PUBLIC_USE_REAL_*` feature flags; flipping the flag in Vercel env activates the real integration.
- **Designer engagement.** The three v15 briefs (`mobile/docs/iconography-brief.md`, `illustration-brief.md`, `animation-brief.md`) repurpose for web. Estimated 2–4 week designer engagement.
- **HI native-speaker review.** ~₹15-25k engagement to bring HI to 100% with native sign-off.
- **DPO contact + privacy review.** Lawyer review of the Privacy Policy + Terms produced in Bucket 2 before public production launch.
- **On-call rotation staffing for `/app/help/now`.** Even 1-person + business-hours SLA is honest. The CTA does not ship until the rotation decision is made.
- **Marketing launch plan.** Sept 2026 Ireland soft-launch event coordination, press, content calendar, partnership with universities (UCD, Trinity, Maynooth, etc.).

---

## 7. Per-bucket decisions log

This section appends with each bucket as it lands. Every choice between path A and path B is recorded with rationale.

### Bucket 0 — Pivot decisions

- **Decision:** Web-first pivot per all five reasons in §1.
- **Decision:** Mobile is paused, not killed (§2). [`mobile/PAUSED.md`](../mobile/PAUSED.md) is the canonical marker; referenced from `README.md` and `mobile/README.md`.
- **Decision:** Documents from v15 (the three designer briefs, the security-hardening doc, the eas-setup runbook, the e2e-testflight runbook, the cert-pinning rotation runbook, the build-completion summary) all stay in `mobile/docs/`. No copies, no reformulations. Web-only docs go to `docs/` or to `web/docs/` as they're created.
- **Decision:** PR #27 (cert-pinning fail-closed + pre-launch-blockers.md, post-Bucket-10 review) stays open against `main` and gets folded into Bucket 10 mobile polish. The fail-closed work is exactly what Bucket 10 §3 calls for; no need to re-write.

(Subsequent buckets append here as they land.)

---

End.
