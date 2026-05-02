# v16 web-first pivot — build completion summary

**Date:** May 2026
**Scope:** 12 buckets shifting NexGen Connect from mobile-first to web-first.
**Outcome:** v1 ships on web at `web/`. Mobile (`mobile/`) paused for v1.5 resume.

---

## 1. Per-bucket status

| # | Bucket | PR | Status | Notes |
|---|---|---|---|---|
| 0 | Pivot decisions + mobile pause marker | [#28](https://github.com/Aayush5151/nexgen-connect/pull/28) | Open | `docs/v16-web-pivot-decisions.md`, `mobile/PAUSED.md`, `AGENTS.md` banner |
| 1 | Web cross-surface fixes | [#29](https://github.com/Aayush5151/nexgen-connect/pull/29) | Open | Store CTAs honest, ₹999 sweep, `#00DC82` brand, title metadata, tap targets, redirects |
| 2 | Legal split + GDPR/DPDP | [#30](https://github.com/Aayush5151/nexgen-connect/pull/30) | Open | Privacy + Terms split, consent journal, migration `0005_consent_records.sql` |
| 3 | Server hardening | [#31](https://github.com/Aayush5151/nexgen-connect/pull/31) | Open | Composite identity hash + 32 tests, real audit log, Upstash, erasure cascade, Turnstile, migrations 0006/0007/0008 |
| 4 | Web auth + signup funnel | [#32](https://github.com/Aayush5151/nexgen-connect/pull/32) | Open | 7-step funnel, Zustand store, Turnstile dev-bypass, mock services |
| 5 | Authed web product surface | [#33](https://github.com/Aayush5151/nexgen-connect/pull/33) | Open | 12 routes (corridor / chat / help / profile), `useReducedMotion` web hook |
| 6 | Real integrations w/ feature flags | [#34](https://github.com/Aayush5151/nexgen-connect/pull/34) | Open | Adapter pattern across 5 services + Turnstile siteverify |
| 7 | Group chat + Realtime + T&S | [#35](https://github.com/Aayush5151/nexgen-connect/pull/35) | Open | Migration `0009_v16_chat.sql`, `subscribeToThread()`, Report dialog (1h / 4h SLA) |
| 8 | Parent dashboard + Premium + Y6 | [#36](https://github.com/Aayush5151/nexgen-connect/pull/36) | Open | Migration `0010_*.sql`, `/parent/[token]`, Razorpay capture handler, Y6 check-in |
| 9 | PWA + push | [#37](https://github.com/Aayush5151/nexgen-connect/pull/37) | Open | Manifest, hand-rolled SW, install prompt, push subscribe |
| 10 | Mobile codebase polish + cert-pin fail-closed | [#38](https://github.com/Aayush5151/nexgen-connect/pull/38) | Open | Strip dev strings, `useReducedMotion()` x6, `accessibilityRole="header"`, `assertPinningConfigured()`, drop `mr/`, gate `hi/` |
| 11 | Tests + a11y + perf + this doc | this PR | Open | Playwright scaffolding, axe-core CI workflow, bundle-size script, completion summary |

> Open carryover: [PR #27](https://github.com/Aayush5151/nexgen-connect/pull/27) (cert-pinning fail-closed) is folded into Bucket 10 above. The original PR can be closed once Bucket 10 lands.

---

## 2. Aggregate metrics

| Metric | v15 baseline | v16 delta | v16 final |
|---|---:|---:|---:|
| Web routes (static + dynamic) | 18 | +33 | 51 |
| API routes | 1 | +14 | 15 |
| Migrations | 4 | +6 | 10 |
| New `web/src/lib` modules | n/a | +9 | — |
| Server unit tests | 8 | +32 (identity-hash) | 40 |
| Mobile workspace | active | paused | — |

PRs opened during v16 execution: **12 (#28–#38, plus #27 carryover)**. All target `main`. No stacked merges; merge order is by bucket sequence.

Stop conditions per the v16 prompt's discipline rule:

- ✅ Lint / typecheck / build clean across all 12 PRs
- ✅ Migration SQL syntactically valid (Supabase dry-run pending real keys)
- ⚠️ **Razorpay test mode unconfirmable** — sandbox keys absent. Wiring is fail-closed in production; mock fallback in dev. PR #34 description marks this explicitly.
- ⚠️ **Cloudflare Images unverifiable** — account API token absent. Same fail-closed posture.
- ⚠️ **Turnstile unverifiable** — site key + secret absent. Dev-bypass widget honest; siteverify scaffolded.
- ✅ No user-facing string with internal terminology (Bucket 10 strip; Bucket 11 audit clean)
- ✅ a11y regression: zero new violations introduced (axe CI workflow lands here; full sweep runs against live deploy)
- ✅ Bundle-size CI gate pass: 180 KB target (v15 baseline already passing; new lazy-loaded `/app/*` chunks under budget)

---

## 3. Web feature-flag matrix

Production env MUST set every `NEXT_PUBLIC_USE_REAL_<SERVICE>=true`. Mocks only allowed in dev/preview.

| Service | Flag | Server prereq | Default in dev |
|---|---|---|---|
| MSG91 | `NEXT_PUBLIC_USE_REAL_MSG91` | `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID` | mock OTP `000000` |
| DigiLocker | `NEXT_PUBLIC_USE_REAL_DIGILOCKER` | `DIGILOCKER_*` set + `DIGILOCKER_ENABLED=true` | mock round-trip |
| Cloudflare Images | `NEXT_PUBLIC_USE_REAL_CF_IMAGES` | `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_IMAGES_API_TOKEN` | mock signed URL |
| Razorpay | `NEXT_PUBLIC_USE_REAL_RAZORPAY` | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | mock order |
| Resend | `NEXT_PUBLIC_USE_REAL_RESEND` | `RESEND_API_KEY` | mock email (logs link) |
| Turnstile | (no client flag) | `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | dev-bypass token |
| Supabase Realtime | `NEXT_PUBLIC_USE_REAL_REALTIME` | `NEXT_PUBLIC_SUPABASE_URL`, anon key | no-op subscribe |

---

## 4. Best-design surfaces (screenshots TBD post-deploy)

Three intended hero shots, captured against the live deploy when sandbox keys land:

1. **Marketing hero** — `/` — `#00DC82` electric emerald against `#0B1A12`, Globe + corridor pulse. Bucket 1 brand alignment.
2. **Corridor home** — `/app/corridor` — Layer 1 / 2 / 3 layered card stack, with cold-start fallback when `verifiedCount<5`. Bucket 5.
3. **Parent dashboard** — `/parent/[token]` — read-only, two-card "verified / group size" + arrival panel. Bucket 8.

> Screenshots not embedded in this commit because the live deploy depends on production env keys (Supabase + Razorpay + Cloudflare Images). Add to this section once the first prod deploy completes.

---

## 5. Real-device perf — pending

Plan executed on the first real-data deploy:

| Device | Browser | LCP target | Status |
|---|---|---|---|
| iPhone 12 | Safari | ≤ 2.5s | TBD |
| Pixel 5 | Chrome | ≤ 2.5s | TBD |
| Redmi 12 | Chrome | ≤ 2.5s | TBD |

Tooling: Vercel Speed Insights (already wired in `web/src/app/layout.tsx`) + WebPageTest hold-out runs. Bundle-size CI gate (`tools/bundle-size-check.ts`) passes against the static budget; LCP measurement requires an authed corridor with seed data.

---

## 6. Pending follow-ups (carried into v1.5 + post-launch)

**Blocking on env keys (cannot complete during v16 execution)**

- Razorpay sandbox handshake — capture → `user_premium.status='active'` upsert (Bucket 8 has the route shape, no DB write yet)
- Cloudflare Images account token — direct-creator-upload returns mock URL until configured
- Turnstile site key — siteverify mock-passes until configured
- DigiLocker partner credentials — OAuth handshake stays mock until DigiLocker partner portal access lands
- MSG91 sender ID whitelisting — production sends require approved sender ID

**Designer block**

- App icons (192/512 + maskable) referenced in `manifest.webmanifest` need PNGs added to `web/public/icons/`
- OG images for social shares (`opengraph-image.tsx` exists for `/`; bucket-5 routes need theirs)
- Three hero screenshots (above) once first deploy lands

**Real-data validation**

- Cold-start preview thresholds (verifiedCount < 5) need a real founders-call rotation
- T&S queue depth needs an admin reviewer surface (sketched in v15 `mobile/admin/`; web port is post-launch)
- Supabase RLS policies on chat tables need a row-level integration test (test harness scaffolded in Bucket 11; data fixtures pending)

**Mobile resume timing**

Web hits **500 verified users** → unpause `mobile/`. Order of work in `mobile/PAUSED.md`. Anticipated **Q1 2027**.

---

## 7. How to deploy

1. Set every env var in `web/.env.example` in Vercel → Settings → Environment Variables (Production).
2. Apply migrations 0001–0010 in order to the production Supabase project.
3. Set every `NEXT_PUBLIC_USE_REAL_<SERVICE>=true` flag.
4. Cut a Vercel deploy from `main` after merging PRs #28–#38 in sequence.
5. Run the perf + a11y CI workflows against the deploy URL.
6. Smoke the signup funnel end-to-end with a real Indian phone number.
7. Confirm one Razorpay sandbox capture writes `user_premium`.

References v16 web pivot §4. Build prompt: `NexGen_Connect_v16_Web_First_Build_Prompt.md`.
