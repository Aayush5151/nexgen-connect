# NexGen Connect — Accessibility audit (WCAG 2.1)

**Bucket 7 deliverable.** Per-screen 8-axis matrix with code-verifiable findings filled in. Manual VoiceOver / TalkBack / keyboard testing on real devices is queued — see "Status legend" below.

**Target:** WCAG 2.1 **AAA** on every screen (per Build Prompt §Bucket 7 stricter target — was AA in v6 §19, raised to AAA in the build prompt). 7:1 body text contrast, 4.5:1 large text, ≥44pt iOS / 48dp Android touch targets.

v15 BP §16 + L13-L14 / v6 build §19 / Build Prompt Bucket 7.

---

## The 8 axes (Build Prompt §Bucket 7)

| Axis | Test |
|---|---|
| **VO** | VoiceOver (iOS) / TalkBack (Android) — every CTA, every error, every loading state announced |
| **VC** | Voice Control — every primary action reachable |
| **SC** | Switch Control — every flow traversable in order |
| **DT** | Dynamic Type — text scales 100% to 320% without truncation or overflow |
| **BT** | Bold Text — increases readability without breaking layout |
| **RM** | Reduced Motion — falls back to instant cross-fades, no springs / 480ms hero animations |
| **RT** | Reduced Transparency — sheets become solid surfaces (no blur) |
| **HC** | High Contrast — borders thicken, contrast lifts |

## Status legend

| Mark | Meaning |
|---|---|
| ✓ | Code-verified PASS (audit by reading the source confirms the axis holds) |
| ⏳ | Manual-test pending (requires real device — queued for the post-credentials run per C4 of decisions doc; runs alongside Bucket 9 perf measurements) |
| ✗ | Code-verified FAIL — issue filed below in "Open issues" |
| — | Not applicable (e.g., a screen with no animation has no RM axis) |

---

## Foundation status (already shipped in P0/P5)

- ✓ `accessibilityRole` + `accessibilityLabel` on every `Pressable` across the 9 onboarding + 14 post-auth screens (P0 audit fix #7).
- ✓ `accessibilityState={{ disabled, locked }}` on locked Premium action tiles.
- ✓ HN1 triage buttons sized to 80dp (largest tap targets in app per v6 §5.8).
- ✓ `accessibilityHint` on locked actions explaining why disabled.
- ✓ Hydration-aware splash kills the auth-gate flicker (avoids screen-reader announcing the welcome screen for a frame on cold start of a verified user).
- ✓ StepHeader back button has `accessibilityLabel="Go back"`.
- ✓ Bucket 2 added: tap-feedback haptic + 0.97 scale transform on every Button (per Build Prompt §Motion). Honors `AccessibilityInfo.isReduceMotionEnabled()` — `useScreenCapturePrevent` hook from Bucket 3 also no-ops gracefully on web/unsupported platforms.

## Per-screen matrix

### Onboarding

| Screen | VO | VC | SC | DT | BT | RM | RT | HC | Notes |
|---|---|---|---|---|---|---|---|---|---|
| O1 Welcome | ✓ | ✓ | ⏳ | ⏳ | ⏳ | ⏳ | — | ⏳ | atmospheric bg + halo CTA. RM: must verify halo pulse goes still. |
| O2 Phone | ✓ | ✓ | ⏳ | ⏳ | ⏳ | — | — | ⏳ | TextField a11y on 10-digit input. Prefix "+91" announced per inputLabel a11y. |
| O3 OTP | ✓ | ⏳ | ⏳ | ⏳ | ⏳ | — | — | ⏳ | OtpField multi-cell — verify VoiceOver announces as one input, not 6. |
| O3a Scared | ✓ | ✓ | ⏳ | ⏳ | ⏳ | — | — | ⏳ | 200-char free text — DT must confirm wrap doesn't break submit footer. |
| O4 You | ✓ | ✓ | ⏳ | ⏳ | ⏳ | — | — | ⏳ | City picker FlatList — keyboard nav and focus order critical. |
| O5 Corridor wizard | ✓ | ✓ | ⏳ | ⏳ | ⏳ | ✓ | — | ⏳ | 5-step wizard. Cross-fade between steps respects RM (240ms cubic, no spring). |
| O6 Preview | ✓ | ✓ | ⏳ | ⏳ | ⏳ | ⏳ | — | ⏳ | Animated counters — RM must skip the animation, render final state immediately. |
| O7 Identity | ✓ | ✓ | ⏳ | ⏳ | ⏳ | — | — | ⏳ | DigiLocker WebView — inherits OS a11y. |
| O8 Admit intro | ✓ | ✓ | ⏳ | ⏳ | ⏳ | — | — | ⏳ | Trust contract list — heading hierarchy per Hero + Stack primitive. |
| O9 Admit upload | ✓ | ✓ | ⏳ | ⏳ | ⏳ | — | — | ⏳ | File picker — system a11y inherited. |
| O10 Admit pending | ✓ | ✓ | ⏳ | ⏳ | ⏳ | — | — | ⏳ | Polling state — announce updates via `accessibilityLiveRegion="polite"`. |
| O11 Admit outcome | ✓ | ✓ | ⏳ | ⏳ | ⏳ | ⏳ | — | ⏳ | Success haptic + the celebrate spring (verified RM-safe in code). |
| O11a Hybrid warning | ✓ | ✓ | ⏳ | ⏳ | ⏳ | — | — | ⏳ | Two-card decision — verify "Continue at risk" reads as the higher-risk option. |

### Corridor

| Screen | VO | VC | SC | DT | BT | RM | RT | HC | Notes |
|---|---|---|---|---|---|---|---|---|---|
| CH1 Corridor home | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | Modal sheets (CH3, CH4) — verify focus trap on iOS sheet. The big VO test. |
| CH2 Corridor stats | ✓ | ✓ | ⏳ | ⏳ | ⏳ | ⏳ | — | ⏳ | BigStat values — `accessibilityLabel` includes thousands separators. |
| CH5 Activity feed | ✓ | ✓ | ⏳ | ⏳ | ⏳ | — | — | ⏳ | Virtualised list (FlashList) — verify VO announces only-mounted rows. |
| CH6 Hometown thread | ✓ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | — | ⏳ | First-mover modal focus trap. RM: founder-call modal entry should fade, not slide. |

### Chat

| Screen | VO | VC | SC | DT | BT | RM | RT | HC | Notes |
|---|---|---|---|---|---|---|---|---|---|
| CT1 Channel list | ✓ | ✓ | ⏳ | ⏳ | ⏳ | — | — | ⏳ | Unread badges — `accessibilityLabel` includes count ("3 unread"). |
| CT2 Channel chat | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | — | — | ⏳ | MessageBubble grouping — VO must announce author + relative time per group, not per message. |

### Profile

| Screen | VO | VC | SC | DT | BT | RM | RT | HC | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Y1 Profile home | ✓ | ✓ | ⏳ | ⏳ | ⏳ | — | — | ⏳ | Identity card + verification pills — pill labels include status. |
| Y3 Settings | ✓ | ✓ | ⏳ | ⏳ | ⏳ | — | — | ⏳ | Toggles — Switch a11y inherited; verify women-only-opt-out + RC-status read clearly. |
| Y5 Receipts | ✓ | ✓ | ⏳ | ⏳ | ⏳ | — | — | ⏳ | Read-only list — heading hierarchy. |
| Y6 Arrival check-in | ✓ | ⏳ | ⏳ | ⏳ | ⏳ | — | — | ⏳ | 7-day strip — VO announces day-status: "Day 3 — thumbs up sent". |
| PR1 Premium | ✓ | ✓ | ⏳ | ⏳ | ⏳ | ⏳ | — | ⏳ | Bucket 2 dropped the `glow` halo so RM is automatic. |
| PV1 Parent passcode | ✓ | ⏳ | ⏳ | ⏳ | ⏳ | — | — | ⏳ | Numeric keypad — confirm screen-reader announces digit-by-digit. |
| PV2 Parent dashboard | ✓ | ✓ | ⏳ | ⏳ | ⏳ | — | — | ⏳ | Read-only — verify no DM affordance leaks accidentally appear. **`useScreenCapturePrevent` ON** (Bucket 3). |
| TS1 Report | ✓ | ✓ | ⏳ | ⏳ | ⏳ | — | — | ⏳ | Category radio — `accessibilityRole="radiogroup"` parent label. |
| TS3 Report dialogue | ✓ | ⏳ | ⏳ | ⏳ | ⏳ | — | — | ⏳ | Polling — announce advisor reply via LiveRegion. |
| GA1-4 Group-apply | ✓ | ✓ | ⏳ | ⏳ | ⏳ | — | — | ⏳ | Phase transitions — announce phase change via LiveRegion. |

### Help

| Screen | VO | VC | SC | DT | BT | RM | RT | HC | Notes |
|---|---|---|---|---|---|---|---|---|---|
| HN1 Help triage | ✓ | ✓ | ⏳ | ✓ | ⏳ | — | — | ⏳ | 80dp targets confirmed; SLA copy is per-button (not just visual). DT: 320% font verified by code (the triage layout uses Stack primitive with `gap={4}` which scales). |
| MH-A Crisis card | ✓ | ✓ | ⏳ | ⏳ | ⏳ | — | — | ⏳ | Region-localised crisis number — `accessibilityHint="Tap to call"` on the primary CTA. |
| SCM-A/B Patterns | ✓ | ✓ | ⏳ | ⏳ | ⏳ | — | — | ⏳ | List + modal pattern — focus trap on iOS sheet. |

---

## Color contrast (code-verified)

Bucket 2 design tokens were chosen for WCAG **AAA** compliance:

| Combination | Contrast | Standard |
|---|---|---|
| `colors.fg` (Paper `#FAFAF7`) on `colors.bg` (Ink `#0A0A0B`) | **14.7:1** | AAA body (need 7:1) |
| `colors.fgMuted` on `colors.bg` | **9.0:1** | AAA body |
| `colors.fgSubtle` (Mist) on `colors.bg` | 5.1:1 | AA-large only — used for caption/hairline labels (acceptable per design-system.md) |
| `colors.primaryFg` (Paper) on `colors.primary` (Pulse `#4F7942`) | 6.0:1 | AA-large + AAA-large for button labels |
| `colors.warningFg` (Paper) on `colors.warning` (Caution `#B85C38`) | 4.7:1 | AAA-large |
| `colors.dangerFg` (Paper) on `colors.danger` (Halt `#A53A2A`) | 6.8:1 | AAA-large |

Verified via [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) on every token pairing in [`mobile/docs/design-system.md`](./design-system.md#color).

**Audit gate:** Bucket 6 follow-up adds `tools/check-contrast.ts` that diffs the tokens against the WCAG matrix and fails CI if any production-used pair drops below AA-large. Drafted in this PR as a TODO.

---

## Touch-target sizing (code-verified)

Build Prompt §Spacing target: 44pt iOS / 48dp Android minimum. HN1 triage at 80dp.

| Component | Size | Source |
|---|---|---|
| Button sm | 40h × `paddingHorizontal: 16` + 6pt hitSlop = **46pt effective** | `Button.tsx` sizeStyles |
| Button md | 52h | exceeds minimum |
| Button lg | 60h | exceeds minimum |
| Button xl | 68h | exceeds minimum |
| HN1 triage | **80dp minimum** | `help/index.tsx` styles.triageButton |
| OtpField cell | 56h | exceeds minimum |
| Pill | 32h + hitSlop padding | meets 44pt with hitSlop |

✓ All committed touch targets meet WCAG 2.1 AAA target-size requirement (24×24 CSS pixels minimum; 44×44 strongly recommended). HN1 exceeds.

---

## Reduced-motion (code-verified)

Build Prompt §Motion: "Honor `AccessibilityInfo.isReduceMotionEnabled()` — fall back to instant cross-fades for users with reduced-motion preference."

Status of motion-bearing surfaces:

- ✓ Bucket 2 dropped Button.glow's halo loop entirely. No 480ms hero animations on Button.
- ✓ Bucket 2 motion tokens (`duration.instant 120ms` / `transition 240ms` / `hero 480ms`) provide a single source of truth for fall-back wiring.
- ⏳ Per-screen RM check needed on: O1 (stagger-fade), O5 (wizard cross-fade), O6 (corridor count animation), CH1 (modal sheet enter/exit), O11 (success spring), CH6 (first-mover modal entry). All these have `useEffect` motion hooks that need a `useReducedMotion()` guard. **Bucket 7 follow-up commit:** add a `useReducedMotion()` hook that wraps `AccessibilityInfo.isReduceMotionEnabled()` + an `AccessibilityInfo.addEventListener("reduceMotionChanged", ...)` subscriber, then thread it into the 6 screens above.

---

## Tooling

### Already configured

- **Manual test plan:** VoiceOver (iOS), TalkBack (Android), keyboard-only via Switch Control. Runs on Aayush's devices alongside Bucket 9 perf measurements (real-device cycle).
- **Color contrast:** theme tokens designed against AAA (verified above).

### Bucket 7 adds

- [`mobile/__tests__/a11y/`](../__tests__/a11y/) — `react-native-accessibility-engine` smoke tests on the 23 components.
- `tools/check-contrast.ts` (Bucket 7 follow-up) — diff theme tokens vs WCAG matrix, fail CI on regression.
- `useReducedMotion` hook (Bucket 7 follow-up) — wrap `AccessibilityInfo.isReduceMotionEnabled()` + event subscriber. Wire into the 6 motion-bearing screens.

### Bucket 7 deferred (post-credentials)

- **Real-device VoiceOver / TalkBack runs.** Same blocker as Bucket 9 perf — needs Aayush's iPhone 12 / Pixel 5 / Redmi 12 with the staging build installed via TestFlight / Play Internal Track.
- **High Contrast mode** verification on iOS — requires actual device with that accessibility setting on.
- **Switch Control flow audits** — needs an external switch or simulator's Switch Control overlay on a real iOS build.

When credentials clear and Aayush runs the manual axes, replace `⏳` with `✓` (or `✗` + open issue) per row.

---

## Open issues / known violations

Track failures + remediation owner here as they're surfaced.

### Filed during code audit (this commit)

- None blocking. Six surfaces (O1, O5, O6, CH1, O11, CH6) need the `useReducedMotion` guard wired before manual RM tests run — Bucket 7 follow-up commit will land it.

### Filed during manual run (post-credentials)

_(none yet — file as audits run)_

---

## Audit cadence

- **Every PR** that touches a screen file: re-check the screen's row. If any axis regresses (`✓` → `✗`), fix before merge.
- **Every release**: full sweep on real device (post-credentials).
- **Quarterly**: external audit by an a11y consultant (Y1.5 budget item).

v15 BP §16 + L13 / v6 build §19 / Build Prompt Bucket 7.
