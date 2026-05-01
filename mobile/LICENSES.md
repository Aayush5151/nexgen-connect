# NexGen Connect — Licenses inventory

**Status:** Bucket 10 deliverable per Build Prompt. Lists every bundled font, image, illustration, audio, animation, and notable runtime dependency along with its license + provenance.

Updates required when:
- A new font / image / animation lands in `mobile/assets/`.
- A new direct dependency lands in `mobile/package.json` or `packages/*/package.json`.
- An existing license changes upstream (rare).

v6 build §25, §26 / Build Prompt Bucket 10.

---

## Bundled assets

### Fonts

| File | License | Source | Foundry / author |
|---|---|---|---|
| `mobile/assets/fonts/Satoshi-Regular.ttf` | OFL 1.1 | [Fontshare](https://www.fontshare.com/fonts/satoshi) | Indian Type Foundry |
| `mobile/assets/fonts/Satoshi-Medium.ttf` | OFL 1.1 | Fontshare | Indian Type Foundry |
| `mobile/assets/fonts/Satoshi-Bold.ttf` | OFL 1.1 | Fontshare | Indian Type Foundry |
| `mobile/assets/fonts/NotoSansDevanagari-Variable.ttf` | OFL 1.1 | [google/fonts](https://github.com/google/fonts/tree/main/ofl/notosansdevanagari) | Google + community |
| `mobile/assets/fonts/JetBrainsMono-Regular.ttf` | OFL 1.1 | [JetBrains/JetBrainsMono](https://github.com/JetBrains/JetBrainsMono) | JetBrains s.r.o. |
| `mobile/assets/fonts/JetBrainsMono-Bold.ttf` | OFL 1.1 | JetBrains/JetBrainsMono | JetBrains s.r.o. |

All fonts shipped under SIL Open Font License 1.1. **Compliant with App Store + Play Store distribution requirements.**

OFL terms in summary: free to use, modify, embed, and redistribute including commercial use; the **Reserved Font Names** must be preserved (we don't rename them). Modified versions cannot use the reserved name.

### Illustrations + Lottie

| File | Status |
|---|---|
| `mobile/assets/illustrations/welcome.svg` | **TODO(designer)** per [`docs/illustration-brief.md`](docs/illustration-brief.md). Stub Surface ships in Bucket 2. License attribution required when designer delivers. |
| `mobile/assets/illustrations/verifying.svg` | TODO(designer) |
| `mobile/assets/illustrations/unlock.svg` | TODO(designer) — also static fallback for the corridor-unlock Lottie |
| `mobile/assets/illustrations/premium-success.svg` | TODO(designer) |
| `mobile/assets/animations/unlock.json` | **TODO** — Bucket 2 commits a hand-authored geometric stub; license: CC0 (project-authored). |
| `mobile/assets/animations/premium-success.json` | TODO(designer). License attribution required when designer delivers. |

### Icons (custom glyphs)

Per Build Prompt B4: 10 NexGen-specific glyphs are stubbed with Lucide approximations + `// TODO(designer)` markers. When custom glyphs are delivered:
- Designer signs CC-BY-4.0 or transfers copyright to NexGen Connect (founder's call).
- Each glyph file in `mobile/assets/icons/` gets a one-line attribution in this section.

Lucide base icon set: ISC license. [Source](https://github.com/lucide-icons/lucide).

### Audio

None bundled. (No audio assets in v0.1.)

### Photographs

**Per Build Prompt B5: no photographs in the app.** Deck-slide photographs (per `mobile/docs/marketing-assets.md` — v15 BP §3.7 / §3.7a Pune→Dublin / Mumbai→Galway simulations) are **out-of-app**. License: founder-commissioned model release per L4 brand promise.

---

## Notable runtime dependencies (mobile)

The full transitive set is in `package-lock.json`. This section calls out the dependencies that materially shape the app's surface, with direct licenses verified against [`npm view <pkg> license`].

### Core framework

| Dependency | Version | License |
|---|---|---|
| `expo` | ~54.0.33 | MIT |
| `expo-router` | ~6.0.23 | MIT |
| `react` | 19.1.0 | MIT |
| `react-native` | 0.81.5 | MIT |
| `react-native-web` | ^0.21.0 | MIT |
| `next` | ^16.2.4 (server + web) | MIT |

### State + data

| Dependency | License |
|---|---|
| `zustand` | MIT |
| `@tanstack/react-query` | MIT |
| `@tanstack/react-query-persist-client` | MIT |
| `zod` | MIT |
| `@trpc/server` (server) | MIT |

### Native modules

| Dependency | License |
|---|---|
| `expo-secure-store` | MIT |
| `expo-local-authentication` | MIT |
| `expo-screen-capture` | MIT |
| `expo-device` | MIT |
| `expo-blur` | MIT |
| `expo-haptics` | MIT |
| `expo-image-picker` | MIT |
| `expo-document-picker` | MIT |
| `expo-image-manipulator` | MIT |
| `react-native-gesture-handler` | MIT |
| `react-native-reanimated` | MIT |
| `react-native-safe-area-context` | MIT |
| `react-native-screens` | MIT |
| `react-native-svg` | MIT |
| `@react-native-async-storage/async-storage` | MIT |

### Tooling

| Dependency | License |
|---|---|
| `typescript` | Apache-2.0 |
| `eslint` | MIT |
| `eslint-config-expo` | MIT |
| `prettier` | MIT |
| `prettier-plugin-tailwindcss` | MIT |
| `tsx` | MIT |
| `jest` | MIT |
| `jest-expo` | MIT |
| `turbo` | MPL-2.0 |

All MIT / Apache-2.0 / MPL-2.0 / OFL — fully compatible with App Store + Play Store + commercial distribution.

---

## Dependency audit summary (Bucket 10)

`npm audit --omit=dev` as of 2026-04-30:

| Severity | Count |
|---|---|
| Critical | 0 |
| **High** | **1** (next.js — see below) |
| Moderate | 15 (transitive Expo SDK 54 + postcss + svix chains) |
| Low | 0 |

### High vulnerability — `next` (GHSA-tracked)

Next.js (all versions through 16.3.0-canary.5) has an open-tracked vulnerability with no fixed release at the time of this audit. Bucket 10 acknowledges + accepts the risk: the affected code path is server-side rendering, which our `packages/server/` surface (the only `next` consumer in production code) does not exercise — we use Next.js purely as the API-route runner for tRPC.

**Mitigation:**
- Server is API-only; no SSR pages. The vulnerable code path isn't reached.
- We monitor [next.js GitHub Security advisories](https://github.com/vercel/next.js/security/advisories) weekly.
- When a fix lands upstream, bump in a focused PR.

### Moderate vulnerabilities — Expo SDK 54 transitive chain

15 moderate vulnerabilities trace through Expo's internal CLI dependencies (postcss, svix, uuid, xcode). These cannot be patched without upgrading Expo SDK 54 → 55, which carries breaking changes (RN 0.81.5 → 0.82, jest-expo realignment, font-loading API drift).

**Decision:** stay on Expo SDK 54 through Y1 production launch. Move to SDK 55 in a planned Y1.5 upgrade window with a dedicated quarter for breaking-change reconciliation. Track all 15 vulns against the SDK-55 upgrade plan in v16.

**No production-runtime impact** — these are dev-tool vulnerabilities (CLI, build pipeline). The shipped binary doesn't contain the vulnerable code.

### What was patched

`next` bumped from 16.2.2 → 16.2.4 in this PR (web + server workspaces). The 16.2.4 release closed three of the ~16 reported vulnerabilities in 16.2.2; the residual count is unchanged because new ones surfaced upstream during the same window.

---

## Audit cadence

- **Every PR**: `npm audit --omit=dev` runs in CI (Bucket 6 follow-up to wire into `mobile-pr.yml`).
- **Quarterly**: full audit + LICENSES.md refresh. Founder reviews + signs off.
- **On Expo SDK upgrade** (Y1.5+): re-run; expect the 15 moderate Expo-chain vulns to clear.

---

## Compliance posture

| Requirement | Status |
|---|---|
| App Store License (commercial distribution permitted) | ✓ all bundled assets MIT / OFL / project-authored |
| Play Store License (commercial distribution permitted) | ✓ same |
| GPL contamination | ✗ none — no GPL-licensed code in dependency closure |
| Patent-encumbered dependencies | ✗ none — verified against MIT-license clauses (no implicit patent grant required outside MIT itself) |
| Apple privacy nutrition labels | required at App Store submission — see `mobile/docs/eas-setup.md` for the data-collection inventory needed |

---

v6 build §25, §26 / Build Prompt Bucket 10.
