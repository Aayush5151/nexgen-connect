# `mobile/` — NexGen Connect mobile (paused)

> ⏸ **This workspace is paused.** See [`PAUSED.md`](./PAUSED.md) for the canonical statement, what's frozen, what stays buildable, and how to resume in Q1 2027.

The web app at [`web/`](../web) is the v1 product. Sept 2026 Ireland launch ships on web. Mobile is the v1.5 native experience upgrade.

---

## Quick reference

- Pivot decisions: [`../docs/v16-web-pivot-decisions.md`](../docs/v16-web-pivot-decisions.md)
- v15 build (the work paused): [`docs/build-completion.md`](./docs/build-completion.md)
- Pre-launch blockers (composite hash, audit log, rate-limit, account-deletion): [`docs/pre-launch-blockers.md`](./docs/pre-launch-blockers.md) (introduced in [PR #27](https://github.com/Aayush5151/nexgen-connect/pull/27))
- Design system: [`docs/design-system.md`](./docs/design-system.md)
- Security hardening: [`docs/security-hardening.md`](./docs/security-hardening.md)
- Accessibility audit: [`docs/a11y-audit.md`](./docs/a11y-audit.md)
- Performance budget: [`docs/perf-budget.md`](./docs/perf-budget.md)
- EAS provisioning runbook: [`docs/eas-setup.md`](./docs/eas-setup.md) (deferred until resume)
- TestFlight E2E runbook: [`docs/e2e-testflight-runbook.md`](./docs/e2e-testflight-runbook.md) (deferred until resume)
- Cert pinning rotation: [`docs/cert-pinning.md`](./docs/cert-pinning.md)

## Stack snapshot at pause

- Expo SDK 54 · React Native 0.81.5 · React 19.1.0
- expo-router 6 · Zustand 5 · TanStack Query 5
- Expo's web preview boots via `npm run mobile:start --web` (port 8081)
- Tests: Jest + jest-expo, 40 mobile + 32 shared = 72 unit tests

## Don't

- Add new features here.
- Edit anything outside the pre-pause polish scope ([`PAUSED.md`](./PAUSED.md)).
- Delete files. The v15 work is preserved as a future asset.

## Do

- Bug fixes that affect shared surfaces (`packages/shared/`, `packages/copy/`, `packages/server/`).
- Read [`PAUSED.md`](./PAUSED.md) before touching anything in this workspace.

v16 web pivot §2.
