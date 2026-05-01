# Animation brief — for the designer

**Status:** Bucket 2 hand-authors the **corridor-unlock** Lottie (geometric, pure shapes) and stubs the **premium-success** Lottie. This doc is the designer's contract for refining both.

**Constraints (from Build Prompt §Motion):**

- Three durations only system-wide: `instant 120ms`, `transition 240ms`, `hero 480ms`.
- Single spring (stiffness 280, damping 24) for organic motion.
- Single cubic-bezier `(0.2, 0.8, 0.2, 1)` for linear-feeling motion.
- Reduce-motion users see static SVG fallbacks (no animation, no haptic).

**Format:**

- Lottie JSON, optimised (no embedded raster, no extraneous keyframes, no unsupported expressions).
- Targeted at `lottie-react-native` 6.x via `expo-asset` loading.
- Each animation has a static SVG fallback in `mobile/assets/illustrations/` for reduced-motion (corridor unlock = `unlock.svg`; premium success = `premium-success.svg`).

---

## 1. Corridor unlock — `unlock.json`

**The cinematic centerpiece.** v15 BP §3.7. The moment when Layer 2 crosses 30 verified students and the group chat opens. This is the moment screenshots get taken.

### Sequence (480ms total)

| t (ms) | What happens |
|---|---|
| 0–80 | Number "29" sits centred. Locked padlock icon visible above it. |
| 80–280 | Number ticks 29 → 30 with a small Y-axis bounce on each digit (single spring). The 9-shape morphs to 0-shape; the 2 holds steady; the 3 enters from the carry. **Tabular numerals are critical** — column width must not shift. |
| 280–400 | Locked padlock dissolves. Cleanly: scale 1 → 1.15 with opacity 1 → 0 (240ms cubic-bezier). |
| 400–480 | Pulse-coloured ring sweeps in from below, settling around the "30." A single line of copy fades in beneath: *"Your group is real."* (120ms instant fade). |

### Stroke / colour rules

- All paths `stroke-width: 1.75` matching iconography stroke.
- Padlock: `currentColor` (inherits parent text colour — Paper in dark mode, Ink in light).
- Number digits: `currentColor`.
- Ring around 30: Pulse `#4F7942`.
- Background: transparent — the parent screen surface shows through.

### Acceptance criteria

- Plays cleanly at 60fps on iPhone 12 (real device, not simulator).
- The number transition column-aligns — "9" and "0" occupy identical horizontal space.
- Static SVG fallback (`unlock.svg`) shows the final frame: the unlocked "30" inside the Pulse ring, padlock gone, copy in place.
- Total file size <30KB Lottie JSON.

### Bucket 2 hand-authored stub

Bucket 2 ships a hand-authored geometric Lottie that approximates this — pure shape animation (no organic art), tabular-numeric tick, clean dissolve. The animation file is committed at `mobile/assets/animations/unlock.json` with extensive inline metadata. The designer either accepts it or replaces it; the API contract (the wrapper component + the trigger conditions) is stable.

---

## 2. Premium success — `premium-success.json` (DESIGNER STUB)

**The moment after Razorpay confirms.** PR3. Quiet pride. Family endorsement.

### Mood

The opposite of corridor unlock — *intimate*, not *cinematic*. A single illustration animating in. Should feel earned, not celebratory-loud.

### Sequence (480ms)

| t (ms) | What happens |
|---|---|
| 0–120 | Static state: the key outline (from `premium-success.svg`) drawn-in path-by-path, left to right (cubic-bezier). |
| 120–280 | The Pulse ribbon ties around the key — single spring, slight overshoot. |
| 280–400 | The chat bubble appears off to the right. Single dot fades in inside it (the advisor presence). |
| 400–480 | A tiny tick mark appears next to "Premium active" copy (240ms cubic-bezier). |

### Stroke / colour rules

- Key: `currentColor`.
- Ribbon: Pulse.
- Chat bubble: `currentColor` outline, transparent fill.
- Tick: Pulse.

### Acceptance criteria

- Same as unlock: 60fps on real device, static fallback (`premium-success.svg`), <25KB JSON.
- Designer-delivered. Bucket 2 stubs only — the wrapper component (`<HeroLottie name="premium-success" />`) renders the static SVG fallback until the JSON lands.

---

## Reduce-motion behaviour

Both animations check `AccessibilityInfo.isReduceMotionEnabled()` on mount. When true:

- Skip the Lottie entirely.
- Render the static SVG fallback at the *final-frame* state.
- No haptic.

Tested with iOS Settings → Accessibility → Motion → Reduce Motion ON.

---

## Integration

```tsx
import { HeroLottie } from "@/components/HeroLottie";

<HeroLottie name="unlock" autoplay loop={false} />
<HeroLottie name="premium-success" autoplay loop={false} />
```

The `<HeroLottie>` wrapper:
- Loads the JSON via `expo-asset`.
- Detects reduce-motion → swaps for static SVG.
- Plays at the build-prompt `hero 480ms` cadence.
- Triggers haptic `Haptics.NotificationFeedbackType.Success` on play start (corridor unlock only).

---

## Stub state in Bucket 2

- `mobile/assets/animations/unlock.json` — hand-authored geometric Lottie (Bucket 2 self-delivered).
- `mobile/assets/animations/premium-success.json` — **TODO: designer-delivered.** Until then, the wrapper renders the static SVG.
- `<HeroLottie>` component lands in the per-screen design pass commit when the corridor-unlock surface is rebuilt.
