# Motion language

> **Status**: Codified in v18 trillion-dollar polish. Every animation
> on the site picks from this vocabulary. If your animation doesn't fit,
> the right move is almost always to make it fit — not to invent a new
> primitive.

## Why a motion language

Motion is the second hand of design. Apple, Linear, Stripe, NVIDIA — each
of them has a recognisable motion fingerprint because every transition
on their product reads as part of one composition. We do the same.

The single biggest tell that a site is v1 is **motion that was added
afterwards**: a fade-up here, a hover-lift there, all timing values
pulled out of thin air. Each one looks fine in isolation; together they
read as noise.

The fix is a closed vocabulary. Three easing curves. Four durations. One
stagger unit. Everything composes from those.

---

## The vocabulary

### Easing — three curves, no more

Defined as CSS custom properties in `globals.css` and consumed
everywhere (Tailwind utilities, framer-motion, raw CSS transitions).

| Token | Curve | Use for |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | **Arrivals.** Default. Elements coming into the user's view. Page reveals, dropdowns, content fade-ins. |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | **Redirections.** State changes where the eye should follow the motion. Tab indicator slides, magic-move, route transitions. |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | **Tactile feedback.** Press, snap-back, "this thing is alive". Use sparingly — reserved for affordances the user touches. |

> **Never improvise easing**. If you reach for a value not in this
> table, the right move is almost always one of these three. If you
> truly need a new curve, add it here first with the reason.

### Duration ladder — four rungs

```
--duration-fast    150ms   interaction feedback (hover lift, focus ring,
                            small press)
--duration-normal  300ms   local UI motion (panel open, button morph,
                            tab indicator slide)
--duration-slow    500ms   entrance / exit choreography (section
                            reveals, modal in/out)
--duration-slower  700ms   hero / first-paint reveal, meter fills
```

**Anything under 120ms reads as instant.** Anything over 600ms reads as
sluggish. The ladder bounds the space — stay inside it.

### Stagger unit

```
--stagger-step   60ms   the choreography unit
```

Used in two ways:

1. **Per-element delay multiplier** — set `--i` on each child, and the
   `.stagger-children > *` utility automatically delays each by
   `calc(var(--i) * var(--stagger-step))`. Read it like sheet music.
2. **Word-by-word reveals** — the hero H1 uses `60ms` between word
   reveals. Same unit, applied in JS via framer-motion delays.

60ms is the sweet spot: fast enough to feel intentional, slow enough to
read as cascade. Faster looks like a glitch; slower looks like a queue.

---

## The patterns

### 1. Entrance reveal — `.stagger-children`

The default landing-page reveal. Each child fades up by 16px on a
60ms cascade. No external library; pure CSS keyframe + `--i` per child.

```tsx
<div className="stagger-children">
  <Eyebrow style={{ "--i": 0 } as React.CSSProperties}>Eyebrow</Eyebrow>
  <Heading level="display-lg" style={{ "--i": 1 }}>Title</Heading>
  <p style={{ "--i": 2 }}>Body</p>
  <button style={{ "--i": 3 }}>CTA</button>
</div>
```

### 2. Word-by-word reveal — the hero move

For the H1 only. Use framer-motion per-word delays, anchored to the
`--stagger-step` value (`0.06s`).

See `components/landing/MarketingHero.tsx` for the canonical
implementation. Don't repeat this in other headings — it's reserved for
the page hero.

### 3. Magic-move indicator — single element across slots

Used in `AppNav` and the Navbar's active-link underline. A single
element slides between positions using `transform: translateX(...)`
with `transition-transform duration-[300ms] ease-out`. Never use four
independent appearing/disappearing dots; that's the v1 instinct.

### 4. Presence-pulse — the trust signal

Defined as `.presence-dot` in `globals.css`. A 6px green dot with a
slow pulse halo. Drop it next to anything that means "this is live
right now": corridor count, activity feed, ticker, thread list header.

Visual continuity from marketing surface → product surface is
non-negotiable; we use the *same dot* in both places.

### 5. Tactile press — `active:scale-[0.96]` to `0.98`

Every button or interactive card scales down on press. `0.96` for
small tappable nav items; `0.98` for primary CTAs. Pair with a
`duration-fast` colour transition.

### 6. Skeleton shimmer — perceived perf

CSS-only. Apply the `.skeleton` class to a sized div. Used inside
`<Skeleton />`, `<SkeletonLine />`, `<SkeletonCard />` etc. Shimmer
sweep is 1.6s — slow enough to read as "thinking", not anxious.

### 7. View transitions — route-to-route motion

The View Transitions API on the root layout gives every navigation a
soft cross-fade between routes by default. Per-page opt-in via
`view-transition-name` for shared-element transitions.

> See `app/layout.tsx` for the `unstable_ViewTransition` wrapper.

---

## Accessibility — `prefers-reduced-motion`

Every animation on the site honours `prefers-reduced-motion: reduce`.
The global rule in `globals.css` neutralises everything by default:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

For framer-motion components, also pass through `useReducedMotion()` —
the global CSS rule kills the CSS side, but framer-motion still drives
JS-based animations unless you opt out at the component level.

---

## Anti-patterns

❌ **Hand-rolling new easing curves** — if it's not in the table above,
   it shouldn't be on the site.

❌ **Animating everything** — restraint is the trillion-dollar move.
   Motion should be a punctuation mark, not a sentence.

❌ **Sprinkling fade-ups onto every element** — one stagger composition
   per section, not one fade-up per heading.

❌ **Animating with `transition: all`** — always name the properties
   (`transition: transform 300ms ease-out`). `transition: all` triggers
   paint on properties you didn't mean to animate.

❌ **Colored shadows everywhere** — colored glow is reserved for the
   one card on a page that needs to read as "featured" (e.g. premium
   plan). The rest stays neutral.

❌ **Motion that doesn't tell the user anything** — every animation
   should communicate a state change or guide the eye. Decorative
   motion is a tax.

---

## When to add new vocabulary

Almost never. If you find yourself wanting to:

1. **A new easing curve** — first check whether the existing three
   actually fail. If they do, add it here *with a name and reason*
   before using it.
2. **A new duration** — same. The ladder has four rungs for a reason.
3. **A new pattern** — write it up in this doc under "The patterns"
   before shipping it to a second surface.

The vocabulary is small on purpose. Resist the urge to grow it.
