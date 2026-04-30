# Iconography brief — for the designer

**Status:** Bucket 2 ships Lucide approximations + `// TODO(designer)` markers at every use site. This doc is the designer's contract for the 10 NexGen-specific custom glyphs.

**Style baseline:** Match Lucide's stroke quality. 1.75 stroke width default, 1.5 for compact density. Outlined (not filled), single colour (inherit from parent). Designed at 24px, scale linearly.

---

## The 10 custom glyphs

### 1. Corridor map markers (×3 variants)

The Layer 1 / Layer 2 / Layer 3 layer indicators rendered on the corridor home + activity surfaces.

| Variant | Visual idea |
|---|---|
| Layer 1 | Small concentric ring, single dot at centre — the affinity sub-group inside Layer 2. |
| Layer 2 | Larger concentric ring, three dots arranged inside — the user's primary class. |
| Layer 3 | Dashed outer ring, no inner — ambient city-wide fallback. |

**Use:** `corridor/index.tsx` Layer 2 hero, hometown pinned card, ambient footer.

### 2. Women-only filter

A shield-with-female-symbol, or a circle-with-Venus-glyph. Restraint over decoration — must read at 18px in a row of other glyphs without screaming.

**Use:** `chat/index.tsx` channel list (women-only sub-thread), `settings.tsx` toggle row.

### 3. Hometown crew badge

A pin-on-a-map combined with two small figure outlines, or a single house silhouette with a "+N" badge. Should evoke "your people from your city."

**Use:** `corridor/index.tsx` pinned hometown card, `corridor/hometown.tsx` header.

### 4. First-mover badge

A flag-on-a-mountain, or a comet-trail circle. Communicates "you're the first to arrive here." Ships in Pulse on a Mist background — the hero badge for the first-mover modal flow.

**Use:** `corridor/hometown.tsx` first-mover modal, `AD13` admin console.

### 5. Three-check verification stack

Three checkmarks vertically stacked or arranged in a triangle, each with a thin connecting line. Represents the phone + DigiLocker + admit-letter trio. Used on the verification status surface and as a header badge on the post-verification corridor.

**Use:** `profile/verification.tsx`, `app/index.tsx` verified-state hero.

### 6. Layer 1 / 2 / 3 tier indicator (×3, but distinct from corridor markers)

A stacked-bars motif (1 bar / 2 bars / 3 bars) — or roman numerals I / II / III in a circle. Indicates which layer a surface is currently presenting. More neutral than the corridor markers.

**Use:** Per-screen header tier indicator.

### 7. Parent-view eye

A single eye outline with a hairline through it (not a slashed eye — that reads "blocked"). The hairline is a visual disclaimer: "your parents see status, not content." Pulse-tinted when the parent dashboard is active.

**Use:** `profile/parent.tsx` dashboard hero, settings → Parent view.

### 8. Scam-pattern flag (×5 sub-variants, one per BP §16.30 scam pattern)

Each of the five canonical scam patterns from the business plan §16.30 gets a quiet glyph. Suggested:
- **SCM-1 fake-PBSA:** house outline with a question mark
- **SCM-2 mobile-only landlord:** chat bubble with an exclamation
- **SCM-3 cash-deposit:** rupee symbol with a downward arrow
- **SCM-4 fake-agent:** suit-figure with a question mark
- **SCM-5 sex-for-rent:** house outline with a key + warning corner

These appear small (16px) on the SCM-A pattern list. Caution-tinted.

**Use:** `help/index.tsx` SCM-A folded section.

### 9. Lurker permission banner anchor (single glyph)

An open book or a quiet wave. Communicates "it's okay to read first." Subtle — doesn't compete with the message.

**Use:** `corridor/index.tsx` post-unlock lurker banner.

### 10. Group-apply cluster

Three or four small figure outlines in a tight cluster, with a single house above. Represents the housing-cluster bundle (BP §5.2 Premium feature card).

**Use:** `profile/group-apply.tsx`, `profile/premium.tsx` feature card.

---

## Delivery

- SVG, 24×24 viewBox, all paths.
- One file per glyph (`corridor-marker-l1.svg`, `corridor-marker-l2.svg`, `corridor-marker-l3.svg`, `women-only.svg`, `hometown-crew.svg`, `first-mover.svg`, `three-check-verify.svg`, `layer-tier-1.svg`, etc.).
- `stroke="currentColor"` on every path so colour inherits.
- Drop into `mobile/assets/icons/` once delivered.
- A wrapper component `<NexGlyph name="women-only" size={18} color={theme.colors.primary} />` will be added in the integration commit.

## Acceptance criteria

- Renders cleanly at 16, 18, 20, 24, 32px (no fuzzy aliasing).
- Reads correctly without colour (greyscale test).
- Pairs with Lucide icons in the same row without looking like a different family.
- Approved by Aayush before integration.
