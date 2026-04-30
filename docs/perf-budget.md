# NexGen Connect — Performance budget

**v6 build §22.** Targets validated on iPhone 12 (real device) and
Pixel 5 (real device). No simulator measurements — simulator perf is
2–4× faster than real and lies.

## Budget

| Metric | Target | Source |
|---|---|---|
| Cold-start to interactive | < 2.5s on iPhone 12 / Pixel 5 | v6 §22 |
| Frame rate, chat scroll | 60fps sustained | v6 §22 |
| Bundle size | < 1.8 MB gzipped (iOS + Android JS bundle) | v6 §22 |
| Layer 2 unlock event commit-to-broadcast | < 100ms p95 | v6 §22 |
| Layer 1 hometown-crew unlock | < 500ms p95 (eventual) | v6 §22 |
| Channel-pool shard threshold | > 150 subscribers/channel | v6 §22 |
| First-mover SLA-breach detection | < 60s lag | v6 §22 |

## Measurement plan

### Cold start

```bash
cd mobile
# iPhone 12 — physical device, latest iOS, low-power-mode off:
npx react-native run-ios --device "iPhone 12" --release
# Use Instruments → Time Profiler, mark from app icon tap to first
# interactive frame on welcome screen. Target < 2,500ms.

# Pixel 5 — physical device, latest Android, animations on:
npx expo run:android --variant release --device <Pixel5>
# Use Android Studio → CPU Profiler, same mark.
```

### Frame rate

Mount CT2 chat thread with 100 seeded messages (modify `chat.mock.ts`
seed temporarily), scroll fast, capture with iOS Instruments → Core
Animation FPS or Android Studio → GPU Inspector. Target 60fps
sustained for 10s of continuous scroll.

### Bundle size

```bash
cd mobile
EXPO_NO_DOTENV=1 npx expo export --platform ios --output-dir dist
gzip -k dist/_expo/static/js/ios/*.js
ls -lh dist/_expo/static/js/ios/*.js.gz
# Target: combined gzipped < 1.8 MB.
```

Track bundle size per PR via CI (planned, P5 polish):
```yaml
# .github/workflows/bundle-size.yml
- run: cd mobile && npx expo export --platform ios --output-dir dist
- uses: andresz1/size-limit-action@v1
  with:
    package_path: mobile/dist/_expo/static/js/ios/*.js
```

### Realtime latencies

Measured server-side after Supabase Realtime swap (out of P0-P6 mobile
scope). Layer 2 unlock event timing instrumented in the corridor
service mock for synthetic measurements during chaos tests.

## Current measurements

_None yet._ Per v6 §22: "measured against budget after Phase 5 polish
on real devices."

| Date | iPhone 12 cold | Pixel 5 cold | Bundle | Tester |
|---|---|---|---|---|
| _ | _ | _ | _ | _ |

## Hot-spots flagged in audit

Per `/tmp/codebase-state-audit.md` Audit 6:

1. **CH1 corridor home is ~900 LoC** in a single file with inline
   modal sheets (CH3, CH4). Acceptable for v1 — split during P5
   polish if frame rate measurements show jank.
2. **Welcome screen uses Animated (legacy)** instead of Reanimated.
   JSDoc says "heavier choreography moves to Reanimated when we add
   the unlock-celebration surface in Phase 2." Phase 2 shipped
   without that move. Revisit if cold-start measurement is over
   budget.
3. **Theme.tsx token resolution** — no measurement. Static `theme`
   import; primaryTint() is pure. Should be ≤ 1ms aggregate. Spot
   verify.

## Open issues

_(file performance regressions here as they surface in measurement)_
