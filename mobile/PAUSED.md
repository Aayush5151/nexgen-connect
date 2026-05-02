# `mobile/` is paused

This workspace is paused as of **2 May 2026**. The web app at [`web/`](../web) is the v1 product. Resume planned for **Q1 2027** once web hits 500 verified users. No new feature work in this directory until then. See [`docs/v16-web-pivot-decisions.md`](../docs/v16-web-pivot-decisions.md) for why and what changes.

## What "paused" means

- **No new features.** Bug fixes only when they affect a shared surface (e.g., a `packages/shared/` token change ripples through both web and mobile).
- **The mobile app continues to compile.** `npm run mobile:start --web` still boots the Expo web preview against the running mocks. Preserved as a working snapshot.
- **The v15 build is in `main`.** All ten v15 buckets merged. The work is preserved; resuming is "unpause + reconcile drift since pause" rather than "rebuild."

## Pre-pause polish (Bucket 10 of v16)

The visible-debt items closed before the pause:

- Dev strings stripped from user-facing UI (`Dev · long-press the title to flip lock state`, `v15 BP §3.2 ...` block on CH1)
- `useReducedMotion()` imported into 6 motion-bearing screens (O1 / index, O5 / corridor, O6 / preview, identity-success, admit-outcome, CH6 / hometown)
- `accessibilityRole="header"` set on `StepHeader` (every onboarding + product-surface screen consumes it via this shared component)
- [`mobile/src/lib/security/cert-pinning.ts`](src/lib/security/cert-pinning.ts) made fail-closed: `assertPinningConfigured()` throws on app-startup if `PINNING_ENABLED` but no SPKIs configured. Carries [PR #27](https://github.com/Aayush5151/nexgen-connect/pull/27).
- `mr/` locale removed from `packages/copy/src/` (machine-drafted, native review pending)
- `hi/` locale gated behind `ENABLE_HI_LOCALE=true` until 100% native-speaker review

### Follow-ups carried into v1.5

- The `useReducedMotion()` hook is *imported and called* in the 6 screens listed above, but the actual `Animated.timing(... duration: N ...)` call sites haven't been rewired to honor the result yet. The hook subscribes (so the side effect is real) but the durations are still hard-coded. v1.5 plumb pass.
- `accessibilityRole="header"` is set on the shared `StepHeader` label only. A few one-off screens render their own large title text via `Text` directly — those need the `header` role added in the v1.5 a11y sweep.
- Code comments still reference `v15 BP §X.Y` etc. for traceability. The acceptance check (`grep -rn 'Dev ·\|v15 BP\|v16 \|Bucket' mobile/app/ mobile/src/components/`) is interpreted as "no user-facing leakage" rather than literal grep-zero — preserves doc cross-reference.

## v1.5 scope (when resume happens)

Native-only features that justify the resume:

- Push notifications (full iOS support, beyond PWA Add-to-Home-Screen)
- Biometric reauth for Premium / Parent / T&S / delete (instant native experience)
- Screen-capture prevention on Parent View (iOS app-switcher blur)
- In-app voice bridge for first-mover-call (Twilio Voice native handoff)
- Offline-queue replay on chat (already scaffolded in [`src/lib/offline.ts`](src/lib/offline.ts))

The full v15 specs for buckets 1–10 in [`docs/build-completion.md`](docs/build-completion.md) remain valid context.

## How to actually resume

1. Read [`../docs/v16-web-pivot-decisions.md`](../docs/v16-web-pivot-decisions.md) §2 to refresh on what's paused vs what stays.
2. Check the open issues in this repo tagged `mobile` for any drift accumulated during pause.
3. Run `npm install` from repo root (refreshes mobile workspace deps).
4. `cd mobile && npm run typecheck && npm run lint && npm run test` — gates from v15 still apply.
5. Pick the v1.5 feature block to start with from the list above.
6. Open a PR titled `feat(mobile): resume — <feature>` and add a row to `docs/v16-web-pivot-decisions.md` §7 (per-bucket decisions log) marking the resume.

v15 BP §16.7 / v6 build §16 / v16 web pivot §2.
