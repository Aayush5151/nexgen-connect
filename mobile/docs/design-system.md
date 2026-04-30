# NexGen Connect — Design System

**Single source of truth.** Future engineers reference this instead of asking. If a token doesn't appear here, it doesn't exist.

Build Prompt Bucket 2 + v6 build §6.

---

## North Star (the rubric every change is measured against)

1. **Beauty and clarity.** Visually exceptional. Typography that respects information hierarchy. Color that earns its place. Motion that conveys meaning, never decoration. Empty states that delight, not apologize. Loading states that are themselves part of the product. The app is a design artifact people will share screenshots of.
2. **Extreme security.** Phone numbers, admit letters, Aadhaar via DigiLocker, identity attestation, payment data, parent-dashboard data, harassment-report data — none of this can leak. Production-grade hardening, not best-effort.
3. **Zero friction from day one.** A Mumbai 22-year-old should sign up in 90 seconds without thinking. A first-generation Aizawl student should not feel intimidated. A 49-year-old Delhi mother should set up the parent dashboard without help.

These three are non-negotiable and cannot trade against each other.

---

## Typography

**Latin:** Satoshi Variable (Fontshare, Indian Type Foundry, OFL).
**Devanagari (HI/MR):** Noto Sans Devanagari Variable (Google, OFL).
**Mono (numerals, code, IDs):** JetBrains Mono.

Selected over Geist+Noto and Inter+Noto per [`build-prompt-decisions.md` B1](./build-prompt-decisions.md): Satoshi is distinctive (Geist is ubiquitous in 2026 dev tooling), high-quality, OFL, culturally aligned (Indian foundry for India-out positioning). Inter is the documented fallback if a Satoshi-specific issue surfaces.

### Type scale (11 sizes)

| Token | Size | Line-height | Letter-spacing | Where it's used |
|---|---|---|---|---|
| `display-xl` | 80pt | 80pt (1.0) | -0.02em | The corridor count moment. Never elsewhere. |
| `display` | 56pt | 56pt (1.0) | -0.02em | Hero numbers (price, verified count). |
| `h1` | 40pt | 44pt (1.1) | -0.015em | Screen headings on Welcome / Hero. |
| `h2` | 28pt | 34pt (1.2) | -0.01em | Section headings. |
| `h3` | 22pt | 26pt (1.2) | 0 | Card titles. |
| `body-lg` | 18pt | 27pt (1.5) | 0 | Editorial body, input values. |
| `body` | 16pt | 24pt (1.5) | 0 | Default body text. |
| `body-sm` | 14pt | 20pt (1.45) | 0 | Secondary body, dense lists. |
| `caption` | 13pt | 18pt (1.4) | 0 | Metadata, supporting copy. |
| `micro` | 11pt | 14pt (1.3) | +0.04em | UPPERCASE kicker labels. |
| `label` | 11pt | 14pt (1.3) | +0.04em | Form labels (uppercase tracking). |

### Weights

`400 regular`, `500 medium`, `600 semibold`, `700 bold`. Four stops. No 300, no 800.

### Tabular numerals

Applied to `display-xl`, `display`, and `mono` styles via `fontVariant: ["tabular-nums"]`. The number "8" must not shift width when it becomes "9" — a corridor count ticking from 29 → 30 must hold its column.

### OpenType ligatures + Devanagari matras

Latin text gets standard ligatures (`fi`, `fl`, `ffi`, etc.) on by default. Devanagari text gets matras + half-form ligatures via Noto's variable axis. Verified on real strings before locking the font.

### Where to use what

`textStyles.h1` everywhere a heading is needed. **Never** ad-hoc `<Text style={{ fontSize: 28 }}>`. The reviewer who sees an off-scale font size blocks the PR.

```tsx
import { textStyles } from "@/theme";

<Text style={textStyles.h1}>Find your people</Text>
<Text style={textStyles.body}>Verified students. Same destination.</Text>
<Text style={textStyles.caption}>Sent to +91 ********10</Text>
<Text style={textStyles.label}>Mobile number</Text>
```

---

## Color

Three swatches + three semantic accents. Dark mode primary, light secondary. Both ship from day one.

### Swatches

| Token | Hex | Use |
|---|---|---|
| **Ink** | `#0A0A0B` | Primary surface in dark mode. Primary text in light mode. |
| **Paper** | `#FAFAF7` | Primary surface in light mode. Primary text in dark mode. |
| **Mist** | `#A8A8B0` | Secondary text, hairline borders, disabled states. **Use sparingly.** |

### Accents

| Token | Hex | Use | Frequency cap |
|---|---|---|---|
| **Pulse** | `#4F7942` | Live verification count, unlock ceremony, success states, link affordances. | ~6 occurrences total in the app. |
| **Caution** | `#B85C38` | Warnings, scam-pattern flags, SLA-breach indicators. | ~4 occurrences. |
| **Halt** | `#A53A2A` | Destructive only. Delete account, leave group, ban user. | ~3 occurrences. |

### Color rules

- **Color has purpose.** Pulse is for trust and arrival. Caution is for protection. Halt is for irreversible action. Never decorative. Never themed.
- **Contrast: WCAG AAA on every screen.** 7:1 body text, 4.5:1 large text. Verified with the [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) before locking the palette.
- **No gradients on foundation surfaces.** No drop shadows beyond a single soft shadow at one elevation. No glassmorphism. References: Linear, Things 3, Apple's own apps. Anti-references: anything from 2024-era SaaS marketing pages.
- **Dark mode primary, light mode secondary.** A user opens the app in dark by default — light mode is opt-in via system preference or in-app toggle.

### Semantic surface tokens (consume these, not the hex)

Dark mode (default):
| Token | Value | Description |
|---|---|---|
| `colors.bg` | Ink | Primary canvas. |
| `colors.surface` | `#141416` | Raised cards, sheets. |
| `colors.surfaceElevated` | `#1B1B1E` | Dialogs, popovers. |
| `colors.border` | `#2A2A2E` | Hairlines on cards. |
| `colors.borderStrong` | `#3A3A3F` | Active / focused ring. |
| `colors.fg` | Paper | Primary text. 14.7:1 vs ink. |
| `colors.fgMuted` | `#C8C8CD` | Secondary body. 9.0:1. |
| `colors.fgSubtle` | Mist | Caption, hairline labels. 5.1:1 (AA-large). |
| `colors.primary` | Pulse | Single accent. |
| `colors.warning` | Caution | Inline warnings. |
| `colors.danger` | Halt | Destructive only. |

---

## Spacing

**Strict 4-point grid.** No values outside the scale.

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 96 · 128`

### Vertical rhythm

| Between | pt |
|---|---|
| Sections | 24 |
| Cards in a list | 16 |
| Paragraphs in body | 12 |
| Label and field | 8 |
| Adjacent typography items | 4 |

### Horizontal padding

| Surface | pt |
|---|---|
| Screen edge (default) | 24 |
| Inside cards | 16 |

### Touch targets

| Platform | Minimum | Source |
|---|---|---|
| iOS | 44pt | Apple HIG |
| Android | 48dp | Material |
| HN1 triage buttons | 80dp | v6 §5.8 — largest tap targets in app |

Verify every `IconButton`, every list row, every checkbox. A reviewer who sees a 32pt tap target blocks the PR.

### Spacing usage

```tsx
import { theme } from "@/theme";

<View style={{ padding: theme.spacing[6], gap: theme.spacing[3] }}>
  ...
</View>

// Or with the new primitives:
<Stack gap={6}>
  <Text style={textStyles.h1}>Heading</Text>
  <Text style={textStyles.body}>Body</Text>
</Stack>
```

---

## Motion

Three durations only. **No 250ms, no 300ms ad-hoc.**

| Token | Duration | Use |
|---|---|---|
| `instant` | 120ms | Taps, hover, micro feedback. |
| `transition` | 240ms | Sheet, modal, tab change. |
| `hero` | 480ms | Corridor unlock, verification success — the cinematic moments. |

### Easing

**Single spring config:** `stiffness: 280, damping: 24`. Use for organic motion (tile pop, count animating up, padlock dissolving).

**Single cubic-bezier:** `(0.2, 0.8, 0.2, 1)`. Use for linear-feeling motion (fades, slide-in/out).

No others. Reviewer who sees `bezier(0.4, 0, 1, 1)` blocks the PR.

### Reduce-motion

Honor `AccessibilityInfo.isReduceMotionEnabled()`. When true, fall back to instant cross-fades (240ms cubic-bezier) — no springs, no scale transforms, no 480ms hero animations. Tested with iOS "Reduce Motion" setting on.

### Tap feedback

Every `Button` press: 0.97 scale transform (Animated.spring with the single spring config) + light haptic (`Haptics.ImpactFeedbackStyle.Light`). No ripple, no underglow.

### Page transitions

- Stack screens: native iOS push.
- Sheets: custom slide-from-bottom (240ms `transition`).
- Modals: fade (120ms `instant`).

Never the default Expo Router push if it doesn't feel native.

### The cinematic centerpiece

The corridor-unlock moment (Layer 2 crossing 30 verified) is the brand's centerpiece animation. Synchronous push to all 30+ members. The app, when foregrounded post-unlock, plays a 480ms hero animation: count converges visually to 30, the locked padlock dissolves, and a single line of copy fades in: *"Your group is real."* This must be tested on a real iPhone 12 / Pixel 5 — simulator timing lies.

---

## Iconography

**Lucide Icons** as the base set.

| Property | Value |
|---|---|
| Stroke width | 1.75 (default), 1.5 (compact density) |
| Size | matches text cap height + 2px (so a body-sized icon is 18px next to body 16px text) |
| Color | inherits from parent text color |

Custom icons for ~10 NexGen-specific glyphs are stubbed with Lucide approximations + `// TODO(designer): replace per docs/iconography-brief.md` comments. See [iconography-brief.md](./iconography-brief.md) for the full spec.

---

## Illustration

Custom illustrations for **hero moments only**. Four total: onboarding welcome, verification waiting, corridor unlock, premium success.

**Style:** minimal line-work, single accent color (Pulse), no faces (avoid casting).

**No stock photography. No Unsplash. No avatar generators** except for explicitly anonymized profile placeholders that are clearly placeholders.

**Lottie animations:** two only — corridor unlock + premium success. Both have static SVG fallbacks for reduced-motion.

In Bucket 2 these are stubbed with placeholder Surfaces. See [illustration-brief.md](./illustration-brief.md) and [animation-brief.md](./animation-brief.md) for the full specs.

---

## Components (audit list)

23 components. All audited against the new design system. None ad-hoc.

### Layout primitives (NEW in Bucket 2)

| Component | Props | Use |
|---|---|---|
| `Surface` | `elevation`, `padding`, `radius`, `tone`, `rail` | Every raised card, sheet, dialog. Replaces ad-hoc `<View style={{ backgroundColor, padding, borderRadius }} />`. |
| `Stack` | `gap`, `align`, `justify` | Vertical layout. Replaces marginTop / marginBottom hacks. |
| `Row` | `gap`, `align`, `justify`, `wrap` | Horizontal layout. |

### Action

| Component | Variants | Sizes |
|---|---|---|
| `Button` | `primary` (Pulse fill) / `secondary` (Ink outline) / `tertiary` (text only) / `destructive` (Halt fill) | sm 40h / md 52h / lg 60h / xl 68h |

### Input

| Component | Notes |
|---|---|
| `TextField` | Single primitive. `prefix`, `prefixIcon`, `helperText`, `errorText`. SearchField / PasswordField are TextField with `prefixIcon` + `secureTextEntry`. |
| `OtpField` | 6-cell auto-advance with cellular-bar indicator. (Per-screen design pass for O3.) |

### Display

`Avatar`, `BigStat`, `CardSurface` (alias of Surface for v5 callers), `CrisisCard`, `Hairline`, `Heading`, `Hero`, `IconChip`, `KickerLabel`, `LoadingScreen`, `MessageBubble`, `Pill`, `PreFlightCountdown`, `ProgressBar`, `ProgressRing`, `Screen`, `StepDots`, `StepHeader`.

All consume `theme.*` tokens — none have hard-coded colors / sizes after Bucket 2.

### TextStyles constant module

Use `textStyles` (named exports of all 11 type-scale tokens) everywhere a `<Text>` is rendered. The legacy `typography` alias keeps v5 callers working and will be codemod'd in Bucket 10.

---

## Density

One density system per page: comfortable (`gap-6` / `p-6` / `text-sm`) **or** compact (`gap-4` / `p-4` / `text-sm`). Don't mix.

---

## Per-screen design pass (Bucket 2 deliverables)

The seven screens called out in the build prompt's "per-screen design pass":

| Screen | Treatment | Status |
|---|---|---|
| O1 Welcome | Single illustration (stubbed), three lines of copy, two CTAs. Halo on the primary CTA. No clutter. | See illustration-brief.md / O1 stub. |
| O3 OTP | 6-cell auto-advance, large numerals (display size), generous spacing, cellular-bar indicator with "OTP arrives via SMS" or "voice call retry available" copy. | OtpField primitive owns this. |
| O5 Live preview | Live-count abundance-first framing per v15 BP §3.6. Layer 2 count is the headline number, large + animated. Layer 1 hometown crew is a smaller pinned card. Layer 3 ambient is a footer line. | See preview.tsx update. |
| CH1 Corridor home | Daily landing screen. Hero pinned activity card. Sub-circles strip. Today's prompt. Avatar grid. Lurker-permission banner. Probability disclosure for niche corridors. Not a wall of text — a landing page. | corridor/index.tsx update. |
| CT2 Chat thread | MessageBubble with proper grouping (consecutive messages from same sender share the bubble). Timestamp clusters every ~5 minutes. Named-advisor messages styled distinctly. Scripted-prompt messages have their own visual treatment. | chat/[channelId].tsx update. |
| PR1 Premium upsell | Hero pricing. Four feature cards each with an illustration (stubbed). FAQ accordion below. The "Buy Premium" CTA is a primary button positioned where thumb naturally rests. | profile/premium.tsx update. |
| HN1 /help-now | Four large 80dp triage buttons, then a "read before you need it" section. Tab nav badge dot when there's a relevant alert. | help/index.tsx update. |

§3.7 Pune→Dublin and §3.7a Mumbai→Galway simulations: deck slides, not in-app surfaces. The actual screens that *implement* them must be cinematic — tracked under the per-screen design pass entries above.

---

## Storybook (Bucket 2 commitment, partially deferred)

A Storybook (or React Native Stories equivalent) covering every variant + state of the 23 components is a Bucket 2 deliverable per the build prompt. Bucket 2 ships:

- The infrastructure (storybook config + `mobile/.storybook/`).
- Stories for the new primitives (Surface, Stack, Row, Button, TextField).
- Per-screen smoke pages for the 7 screens called out.

The remaining 18 component stories land in Bucket 6 (test coverage) where they fold into the snapshot-test suite.

---

## How to add or change a token

1. Edit `packages/shared/src/theme.ts`.
2. Mirror to `web/src/app/globals.css` (CSS custom properties under `@theme inline`).
3. Bucket 6 ships `tools/check-theme-sync.ts` that diffs these two files and fails CI on drift. Until then, manual sync.
4. Cite the v15 BP § or v6 build § in the commit body that motivates the change. No drive-by token additions.

---

## Anti-patterns (will block PRs)

- Raw `<TextInput>` / `<Pressable>` when `TextField` / `Button` exist.
- Repeated `<View style={{ borderRadius: 16, padding: 24 }}>` instead of `Surface`.
- Multiple accent colors fighting each other (Pulse + a second green = no).
- Nested cards inside cards inside cards.
- Large gradient backgrounds and glassmorphism on every surface.
- Mixing arbitrary spacing values (e.g., `padding: 14`).
- Using `Modal` for destructive confirmation instead of an `AlertDialog` pattern.
- Shipping empty / loading / error states without design treatment.
- Using ad-hoc Tailwind palette classes for foundation surfaces instead of theme tokens.
- Reaching for `serif` (no longer in the system — use italic-Pulse via `textStyles.accent`).
