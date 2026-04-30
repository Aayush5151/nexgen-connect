# i18n review punchlist

Per A6 of [`mobile/docs/build-prompt-decisions.md`](../mobile/docs/build-prompt-decisions.md): **Aayush + native-speaker review** is the gate before any locale promotes to production. This doc tracks what needs review and the status.

Build Prompt §Bucket 8 + A6.

---

## Status by locale

| Locale | Coverage | Source | Reviewer status |
|---|---|---|---|
| **EN** (en) | 100% — baseline | hand-authored | locked (canonical) |
| **HI** (hi) | ~39% (75 of 192 entries) | hand-authored, Aayush | needs native-speaker review |
| **MR** (mr) | ~10% (18 of 192 entries) | **machine-drafted by Claude** | DRAFT — must be reviewed before any user sees it |
| **en-PSEUDO** | 100% — generated | computed from EN | dev-only, no review needed |

---

## HI review punchlist (Hindi)

The HI catalogue covers `onboarding`, `verification`, and `premium` namespaces. Aayush's draft + native-speaker review pass needs to verify each line against:

1. **Tone consistency.** v15 BP §1.3 brand-voice rules: warm but precise, never cute, never English-Marathi-Gujarati pidgin. Hindi-speaking users include Tier-1 Mumbai professionals + Tier-3 Aizawl-bordering districts; the register must work for both.
2. **Devanagari rendering.** Test the actual rendered output on Noto Sans Devanagari Variable. Some matras break on older Android renderers.
3. **Length budget.** Run `npm run length-budget` from repo root. Any flag >150% needs tightening.
4. **Cultural calibration.** The "your hometown crew is real" beat (CH6) translates literally as "तुमचे शहरातले लोक खरे आहेत" but the warmer Marathi-borrowing "तुमचे लोक" reads better — verify context-by-context.

Files to review:
- [`packages/copy/src/hi/onboarding.ts`](../packages/copy/src/hi/onboarding.ts) — 45 entries
- [`packages/copy/src/hi/verification.ts`](../packages/copy/src/hi/verification.ts) — 9 entries
- [`packages/copy/src/hi/premium.ts`](../packages/copy/src/hi/premium.ts) — 21 entries

**Missing from HI** (currently EN-fallback): `errors`, `push`, `empty-states`, `corridor`, `chat`, `safety`. After review, expand HI to cover these (~117 more entries) — Bucket 8 follow-up.

---

## MR review punchlist (Marathi) — HIGH PRIORITY

The Marathi locale was picked because v15 §3.7 (Pune→Dublin) and §3.7a (Mumbai→Galway) are the canonical user simulations. **Both flows ship to a Marathi-speaking user as the primary persona.**

The Marathi onboarding subset shipped in this PR is **machine-drafted by Claude** and **NOT production-ready**. Before any Marathi-speaking user sees it:

1. **Native Marathi speaker review** — line by line. The drafts use formal-register Marathi which may read stilted to a Pune 22-year-old.
2. **Specific calibration questions:**
   - "तुमचे लोक शोधा" (Find your people) — formal "तुमचे" is correct but "तुझे" (informal) might match the brand-voice's intimacy better. Need a native call.
   - "उतरण्याआधी" (before you land) — could be "उतरायच्या आधी" — verify which feels natural.
   - "खात्री असलेले विद्यार्थी" (verified students) — does "verified" map cleanly to "खात्री असलेले" or to a transliteration "verified विद्यार्थी"?
   - Code-mixing thresholds: how much English-in-Devanagari is acceptable? (e.g., "OTP" is universally understood; "verification" might be too.)
3. **Length budget** — same `npm run length-budget` check. Marathi tends to inflate vs English by ~25-40% so a few keys probably trip the 150% gate; flagged in the script output.

Files to review:
- [`packages/copy/src/mr/onboarding.ts`](../packages/copy/src/mr/onboarding.ts) — 18 entries (welcome / phone / OTP / scared)

**Missing from MR** (currently EN-fallback): everything else. Bucket 8 follow-up: extend coverage as native-speaker review continues.

---

## Process

1. **Aayush** drafts or reviews machine-drafted translations against the brand voice.
2. **Native speaker** (Marathi: a Pune-based contributor; Hindi: any contributor with Mumbai or Delhi register) reviews line by line.
3. Findings come back as comments in this doc + PRs against the locale files.
4. When a namespace is signed off, mark the row above as ✓ reviewed.

---

## What ships before review completes

- EN remains the default for any user whose device locale isn't HI / MR.
- HI partial covers onboarding + verification + premium for the Hindi-locale subset.
- MR partial (under review) covers ONLY onboarding. Other Marathi-locale users see EN fallback for everything else.
- en-PSEUDO is dev-mode only — exposed via `usePreferences.setLocale("en-PSEUDO")` for length-budget testing.

The user-facing impact is **acceptable** — every key resolves to *something* legible (EN fallback). No "missing key: X" placeholders ship to production. Per Build Prompt §Bucket 8 the locale promotion gate is staged review, not blanket release.

---

## Bucket 8 follow-up tasks (post-review)

1. Run length-budget check after each round of edits; close all >150% rows.
2. Extend HI coverage to errors / push / empty-states / corridor / chat / safety (~117 more entries).
3. Extend MR coverage to verification / premium / corridor at minimum (~70 more entries).
4. Add a fourth locale (Tamil) per Y2 expansion if Chennai-tier traffic justifies it.
5. RTL readiness audit (per Build Prompt §Bucket 8) — run a static analysis on the codebase looking for `marginLeft` / `marginRight` (should be `marginStart` / `marginEnd`). See the Bucket 8 PR body for the static-check command.

v15 BP §1.3 + §16 / v6 build §20 / Build Prompt Bucket 8 + A6.
