# NexGen Connect — Performance budget

## ⚠️ Simulator measurements only

Per **C4 of [build-prompt-decisions.md](./build-prompt-decisions.md)**: real-device verification on iPhone 12 / Pixel 5 / Redmi 12 is **PENDING** — Bucket 9 ships the budget instrumentation + simulator baseline. The simulator runs 2-4× faster than real hardware (the build prompt itself notes this); these numbers are the floor, not the truth.

When credentials clear and Aayush has the test devices on hand, replace the simulator rows with real-device numbers.

Build Prompt §Bucket 9 + C4 / v6 build §22.

---

## Budget targets

| Metric | Target | Critical threshold | Source |
|---|---|---|---|
| Cold-start (iPhone 12) | < 2.5s TTI | 4.0s | Build Prompt + v6 §22 |
| Cold-start (Pixel 5) | < 2.5s TTI | 4.0s | Build Prompt |
| Cold-start (Redmi 12 — low-end) | < 4.0s TTI | 6.0s | Build Prompt |
| Hot-start | < 800ms | 1.5s | Build Prompt |
| Chat-scroll FPS | 60fps sustained | >50fps | Build Prompt + v6 §22 |
| Bundle size (JS gzipped) | < 1.8 MB | 2.0 MB | Build Prompt + v6 §22 |
| Memory (steady-state) | < 180 MB | 300 MB | Build Prompt |
| Layer 2 unlock event commit-to-broadcast | < 100ms p95 | n/a | v6 §22 |
| Layer 1 hometown-crew unlock | < 500ms p95 (eventual) | n/a | v6 §22 |
| Channel-pool shard threshold | > 150 subscribers/channel | n/a | v6 §22 |
| First-mover SLA-breach detection | < 60s lag from queue insert to admin push | n/a | v6 §22 |

---

## Current measurements (simulator baseline)

### Cold-start

| Surface | iOS Simulator (iPhone 16 Pro, M2 Pro Mac) | Android Emulator (Pixel 8 Pro API 35) |
|---|---|---|
| Welcome (O1) — first frame | **TODO** ⏳ | **TODO** ⏳ |
| Verified user → CH1 (post-auth fast path) | **TODO** ⏳ | **TODO** ⏳ |

**Method:** `npx expo start` → tap app icon → mark from Metro's "Bundling complete" log to first user-tappable frame on Welcome.

### Bundle size

| Profile | Size | Threshold |
|---|---|---|
| development bundle (JS, gzipped) | TODO ⏳ | < 1.8 MB |
| production bundle (post-EAS Build) | n/a (Bucket 5 dry-run) | < 1.8 MB |

**Method:** `npx expo export --platform ios` → `du -h dist/_expo/static/js/ios/*.hbc` → gzip and re-measure.

### Chat-scroll FPS

**Status:** instrumented but not measured. The CT2 mock seeds 10 messages; Build Prompt asks for 100-message scroll test. Bucket 9 follow-up: temporarily seed `chat.mock.ts` to 100 and run iOS Instruments Core Animation FPS counter.

**Method:**
1. iOS: Xcode → Open Developer Tool → Instruments → Core Animation FPS template → Record → scroll CT2 fast for 10s → assert ≥50fps p95.
2. Android: Android Studio → CPU Profiler → GPU rendering speed.

Both must run on REAL devices to be meaningful — the simulator/emulator FPS is uncapped and lies.

### Memory

**Status:** uninstrumented. Bucket 9 follow-up: integrate `expo-system-ui`'s `getMemoryWarningEvents` + add a debug-only `<MemoryHUD>` overlay in dev builds.

---

## Code-splitting strategy

Build Prompt §Bucket 9 mandate:

> "Code-split: lazy-load HN1, MH-A, MH-B, SCM-B, Premium, Parent View, Group-Apply screens. They're not on the critical path."

**Critical path:** O1 Welcome → O2 Phone → O3 OTP → O3a Scared → O4 You → O5 Corridor wizard → O6 Preview → O7 Identity → O8-O11 Admit → CH1 Corridor home → CT1/CT2 Chat. Everything that the median Day-1 user touches.

**Off-path** (lazy-loadable):

| Screen | Why off-path |
|---|---|
| HN1 (`/help`) | Tab nav target — only opened in distress or for preventive content review. |
| MH-A (`/help/resources`) | Sub-screen of HN1. |
| MH-B | Sub-screen of MH-A. |
| SCM-B | Pattern detail modal inside HN1. |
| PR1 Premium upsell | Profile sub-screen — only Premium-curious users hit it. |
| PV1/PV2 Parent View | Profile sub-screen — only Premium activators set it up. |
| GA1-4 Group-apply | Profile sub-screen — late-funnel Premium feature. |

### How to lazy-load in expo-router

expo-router auto-code-splits per route file when `unstable_settings.lazy = true` is set on the route. Bucket 9 wires this into each off-path route's `_layout.tsx` by adding:

```tsx
// app/(app)/help/_layout.tsx (and equivalents)
export const unstable_settings = {
  // Defer the route's bundle until the user navigates here.
  initialRouteName: "index",
  lazy: true,
};
```

For modal screens that are imported eagerly today (e.g., the CH3 / CH4 sheets inside `corridor/index.tsx`), Bucket 9 follow-up extracts them into separate route files under `(app)/corridor/sheets/` so they get the same lazy treatment.

Estimated bundle savings: ~25% for cold-start budget — pre-Bucket-9, every screen JS ships in the initial bundle. Post-Bucket-9, the critical path is ~75% of total, off-path 25%, deferred until navigation.

---

## Image optimisation

Build Prompt §Bucket 9: "Use expo-image everywhere (faster than RN's Image)."

| Use site | Status |
|---|---|
| Avatar component | Migrated in P0 — uses Image but Bucket 9 follow-up swaps to expo-image |
| Hero illustrations (4 stubs) | Surface placeholder, no image yet |
| PBSA partner thumbnails (group-apply) | RN Image — Bucket 9 follow-up |

Migration is a regex pattern on the `from "react-native"` import to `from "expo-image"` + the prop swap (`source={uri}` → `source={{ uri }}`).

**Pre-load hero illustrations on welcome mount** per Build Prompt: when `app/index.tsx` mounts, kick off `Image.prefetch(welcomeIllustrationUri)` so the next mount of the verification waiting state already has it cached. Bucket 9 follow-up.

---

## Lottie deferral

Build Prompt §Bucket 9: "Defer Lottie animations — use react-native-lottie with on-demand loading. Static SVG fallbacks always loaded."

Current state: Lottie not yet integrated (per `mobile/docs/animation-brief.md` — corridor-unlock Lottie is hand-authored, ships when the screen rebuilds; premium-success is designer TODO).

When Lottie lands:
- `<HeroLottie name="unlock" />` wrapper component does `import("./unlock.json")` lazily on mount, NOT eagerly.
- Static SVG fallback (`unlock.svg`) loads eagerly so reduced-motion users see something immediately.
- File-size budget per `animation-brief.md`: <30KB for `unlock.json`, <25KB for `premium-success.json`.

---

## Measurement plan (post-credentials, real-device)

When the test device cycle runs:

```bash
# iPhone 12 — physical device, latest iOS, low-power-mode off:
cd mobile
npx eas build --profile development --platform ios
# install via TestFlight or simulator
# Use Instruments → Time Profiler, mark from app icon tap to first
# interactive frame on welcome screen.

# Pixel 5 — physical device, latest Android, animations on:
npx eas build --profile development --platform android
# install via Play Internal Track
# Use Android Studio → CPU Profiler, same mark.

# Redmi 12 — same as Pixel 5, expect ~1.5× slower numbers.
```

For chat-scroll FPS: temporarily seed `chat.mock.ts` to 100 messages, scroll fast in CT2, capture with iOS Instruments → Core Animation FPS or Android Studio → GPU Inspector. Target 60fps sustained for 10s of continuous scroll.

For bundle-size: post-EAS-Build, the build artifact JSON includes `bundle.size`. Bucket 9 follow-up adds a CI step that fails when this exceeds 1.8 MB.

---

## React DevTools Profiler in CI

Build Prompt §Bucket 9: "Use React DevTools Profiler on every PR to catch render regressions."

**Status:** scaffolded as a Bucket 9 follow-up. The plan:

1. Add `react-devtools-profiler-cli` as a devDep.
2. New CI step on `mobile-pr.yml`: build a release bundle → run a deterministic interaction script via Maestro → diff the profiler output against the main-branch baseline.
3. Threshold: any single component re-rendering >2× more than baseline blocks merge.

This is non-trivial (requires a deterministic-headless RN runner) — flagging as Bucket 9 follow-up rather than blocking this PR.

---

## What ships in this PR (Bucket 9)

1. This `perf-budget.md` rewrite with the simulator-only callout, the budget table, and the measurement plan.
2. [`tools/bundle-size-check.ts`](../../tools/bundle-size-check.ts) — measures the dev-mode bundle and reports vs threshold (warn-only until production builds wire).
3. Code-splitting documentation (this section). Wiring `unstable_settings.lazy = true` into the seven off-path `_layout.tsx` files lands in Bucket 9 follow-up.

## Open issues

_(file as measurements run)_

v6 build §22 / Build Prompt Bucket 9 + C4.
