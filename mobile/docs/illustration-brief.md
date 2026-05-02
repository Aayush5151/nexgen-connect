# Illustration brief — for the designer

**Status:** Bucket 2 ships placeholder Surfaces with hero copy at every use site. This doc is the designer's contract for the 4 hero illustrations.

**Style baseline:**
- Minimal line-work. Single accent colour (Pulse `#00DC82`). No fills, no gradients.
- No faces. Avoid casting (race / gender / age cues that lock us into one user archetype).
- Supports dark + light mode (paths use `currentColor` for the line, Pulse for the accent).
- Static SVG — Lottie reserved for the two animations specified in `animation-brief.md`.

**Anti-references:** stock photography, Unsplash, avatar generators. The marketing v15 BP §3.6/§3.7a simulations call for "photographs of real Indian students (consent-licensed or commission them)" — those are deck slides, not in-app illustrations.

---

## The 4 hero moments

### 1. Onboarding welcome (O1 hero)

**Mood:** Departure terminal at dusk. Quiet anticipation. Not lonely — *paused*.

**Composition idea:** Single line drawing of a suitcase at an airport gate, an indistinct figure (silhouette only, no facial features) standing beside it. A row of seats receding into the distance. A subtle Pulse accent on a single departure-board pixel — the only colour on the screen.

**Asymmetry:** lower-left weighted. Negative space top-right reserves for the H1 + accent line.

**Use:** `app/index.tsx` Welcome screen, above the `Heading` block.

**Size on screen:** ~280×180pt centred in the upper half. Doesn't dominate — the H1 below should be louder.

---

### 2. Verification waiting (O8 / O10 admit-letter pending)

**Mood:** Dossier on a desk. Patience. Reviewer engaged.

**Composition idea:** A single document spread on a flat surface. A pen poised mid-stroke. A subtle Pulse circle off to the side — the "in review" indicator. Faint hatch-marks suggest movement / progress without animating.

**Asymmetry:** centred, slightly lower-third weighted.

**Use:** `onboarding/admit-pending.tsx` hero, above the queue-position copy.

**Size on screen:** ~240×160pt.

---

### 3. Corridor unlock (CH1 unlocked-hero, also a Lottie variant)

**Mood:** A door opening. A room with people in it. Warmth without exposure.

**Composition idea:** A doorframe outlined in single line, with a soft Pulse glow visible through it (suggested, not rendered). Three or four small abstract shapes inside the room — figures, but not detailed. The door is partially open at an angle that invites entry without overwhelming.

**Asymmetry:** centred. The viewer's eye should be drawn through the door, into the room.

**Use:** `corridor/index.tsx` hero when Layer 2 has just unlocked. Also the static SVG fallback for the corridor-unlock Lottie animation (see animation-brief.md).

**Size on screen:** ~320×220pt — this is the largest illustration in the app, the moment users will screenshot.

---

### 4. Premium success (PR3 success state)

**Mood:** A ribbon-wrapped key. Calm pride. Family endorsement.

**Composition idea:** A simple key outline with a thin Pulse ribbon tied around it. Beneath it, a horizontal hairline suggesting a desk surface. Off to the right, a small chat-bubble outline with a single dot (the parent advisor's "I'm here").

**Asymmetry:** key centred-left, chat bubble right-third — establishes the Premium → Parent → Advisor relationship visually.

**Use:** `profile/premium.tsx` success state (post-Razorpay confirmation), and the corresponding push-receipt screen.

**Size on screen:** ~260×180pt.

---

## Delivery

- SVG, viewBox 800×600 (4:3) per illustration.
- Two paths per illustration: one `stroke="currentColor"` for the line, one `stroke="var(--pulse, #00DC82)"` (or `data-accent="pulse"`) for the accent.
- One file per illustration: `welcome.svg`, `verifying.svg`, `unlock.svg`, `premium-success.svg`.
- Drop into `mobile/assets/illustrations/` once delivered.
- Wrapper component `<HeroIllustration name="welcome" />` will land in the integration commit.

## Acceptance criteria

- Reads at 240×160pt without losing line clarity.
- Works in both dark and light mode (test by inverting the canvas — paths should re-colour cleanly via `currentColor`).
- No accidental "casting" (no specific gender / race / age cues).
- Pairs visually with the others — same line weight, same Pulse hue, same negative-space discipline.
- Approved by Aayush before integration.

## Stub state in Bucket 2

Each use site renders a `<Surface tone="default" elevation="card" padding="6">` with the screen's hero copy and a `// TODO(designer): replace per docs/illustration-brief.md`. The Surface keeps the layout from collapsing but communicates clearly that art is missing.
