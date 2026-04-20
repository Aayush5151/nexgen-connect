# NexGen Connect — V3 Polish Pass

**For:** Claude Code, executing in the `nexgen-connect/` repository
**From:** Aayush (founder)
**Mode:** surgical fixes + copy upgrades. No rewrites. No new features. No new sections. No new dependencies unless explicitly called for.
**Branch strategy:** One PR-style branch, many small commits (one per task). Push at the end. Do not force-push.

---

## 0. Read this before touching any file

### 0.1 Project shape (already on disk — read, don't re-invent)

- Next.js 14 App Router, TypeScript, Tailwind v4 (tokens in `src/app/globals.css`), shadcn/ui primitives in `src/components/ui/`, framer-motion for all motion, Supabase (admin + RPCs), MSG91 for OTP, Resend for email, Plausible wrapped by `src/lib/analytics.ts`.
- Homepage composition lives in `src/app/page.tsx` — it pulls in 8 landing components from `src/components/landing/`. Do **not** add a ninth.
- Routes that exist: `/`, `/how`, `/founder`, `/privacy`, `/terms`, plus server actions at `src/app/actions/waitlist.ts`.
- Fonts (already wired in `src/app/layout.tsx`): Inter (body), Inter Tight (heading), JetBrains Mono (mono).
- Design tokens (CSS vars in `globals.css`): `--color-bg`, `--color-surface`, `--color-surface-elevated`, `--color-border`, `--color-border-strong`, `--color-fg`, `--color-fg-muted`, `--color-fg-subtle`, `--color-fg-placeholder`, `--color-primary`, `--color-primary-hover`, `--color-primary-fg`, `--color-warning`, `--color-danger`. **Use tokens via `text-[color:var(--token-name)]` — never hardcode hex.**

### 0.2 Non-negotiable rules (these killed V1 and V2 — do not re-introduce)

1. No fake data. No fake testimonials. No fake logos. No "23,000+" anything.
2. No fake scarcity. The live counter must actually reflect the database.
3. No fake pricing. "Lifetime free for founding members" is the only commitment. No ₹999.
4. No download buttons. App does not exist yet.
5. No gradients, no neon glow, no colored shadows. Pure black (`#0A0B10`) background, single green accent (`#A4E24A`), neutral shadows only.
6. Copy rule: if a number can't be proven, don't say it. `ActivityTicker` already enforces `if (rows.length < 3) return null` — mirror that discipline everywhere.
7. Ireland-only. UCD / Trinity / UCC. September 2026. Do not add countries, universities, or intakes on the homepage. (Vision paragraph on `/founder` is the *one* exception — details in Task 1.4.)
8. If a task tells you to change copy, use the copy given verbatim. Do not "improve" it.
9. Do not touch `supabase/migrations/0001_init.sql` — create a new migration file for schema changes (Task 2.4, Task 3.4).

### 0.3 How to work

- Read every file mentioned in a task **before** editing it. Do not assume contents.
- One task = one commit. Conventional commit style, matching existing git log:
  `fix(landing): unify cohort cap at 300 across CohortCard and FinalCTA`
  `feat(founder): add vision paragraph`
  etc.
- After every file edit, run `pnpm build` (or `npm run build` — detect from `package.json`). Fix any TypeScript / ESLint errors before moving on.
- At the end: `pnpm build` green, `pnpm lint` green, commit, push.
- If anything in this prompt contradicts what's on disk, the code on disk wins — flag the contradiction in your final summary, don't silently change it.

---

## 1. MUST-FIX (ship-blockers)

### 1.1 Unify the cohort cap number

**Problem:** `src/components/landing/CohortCard.tsx` uses `COHORT_CAP = 100`. `src/components/landing/FinalCTA.tsx` uses `COHORT_TARGET = 300`. Same concept, two numbers, same page. Breaks trust.

**Decision:** The canonical number is **300**. (Reason: Ireland cohort spans three universities × many home cities. 100 is too thin to feel alive; 300 leaves real headroom. If you disagree, stop and ask — do not guess.)

**Steps:**

1. Create `src/lib/cohort.ts`:

   ```ts
   // Single source of truth for cohort sizing across the landing page.
   // If you change this, the FinalCTA headline, the CohortCard dot grid,
   // and the spots-open math all move together.
   export const COHORT_CAP = 300;
   ```

2. In `src/components/landing/CohortCard.tsx`:
   - Remove the local `const COHORT_CAP = 100`.
   - Import `COHORT_CAP` from `@/lib/cohort`.
   - The 100-dot grid renders via this constant — confirm the grid still lays out correctly at 300. If the grid looks too dense, reduce dot size (e.g. from current size to a smaller one) so 300 dots fit the existing card dimensions without scroll. If truly impossible to render 300 dots cleanly, render a *segmented bar* (filled / total) instead of dots — but only as a last resort, and flag it in your summary.

3. In `src/components/landing/FinalCTA.tsx`:
   - Remove the local `const COHORT_TARGET = 300`.
   - Import `COHORT_CAP` from `@/lib/cohort` and alias: `const COHORT_TARGET = COHORT_CAP`. (Keep the local name so less of the file changes.)

4. Grep the whole repo for any other hardcoded `100` / `300` referring to cohort size. Replace with the import.

5. Verify the headline on `FinalCTA` still reads `The Sept 2026 cohort fills at 300.` and the `CohortCard` CTA states still say `Claim spot #1`, `Reserve spot #{filled+1}`, `Join waitlist` — none of those copy strings should change.

**Commit:** `fix(landing): unify cohort cap at 300 across CohortCard and FinalCTA`

---

### 1.2 Reconcile the verification timeline order

**Problem:** The shipped `VerificationTimeline.tsx` order is:
**01 Phone OTP → 02 Admit letter → 03 DigiLocker Aadhaar (Coming Aug 2026) → 04 Cohort unlocks.**

The `/how` page and `/privacy` page both describe a slightly different flow. The original master prompt §10 had yet another order. We're keeping the shipped order because it's better UX (identity checks run before a 48-hour human review). Align everything else to the shipped order.

**Steps:**

1. Read `src/components/landing/VerificationTimeline.tsx` — treat its step order and labels as the canonical story.

2. Open `src/app/how/page.tsx`. The prose steps currently drift. Rewrite them to match the timeline in the same order, with these exact headings and tight copy:

   - **01 · Phone OTP (30 seconds).**
     > We text you a 6-digit code via MSG91. You enter it. That's it for step one. We store a hash of your number, never the number itself.

   - **02 · Admit letter (48 hours).**
     > Upload a PDF or photo of your offer from UCD, Trinity, or UCC. A real human at our end reads it. If anything's unclear we email you the same day; otherwise you're in within 48 hours.

   - **03 · DigiLocker Aadhaar (2 minutes · live Aug 2026).**
     > Once DigiLocker goes live for us in August, you'll confirm your Aadhaar in two minutes without ever leaving the app. We receive a verification token, never your Aadhaar number. Until August, step 2 alone is enough.

   - **04 · Cohort unlocks (rolling).**
     > The moment there are ten verified students in your cohort (your home city × your university), we introduce you. No guessing games, no 400-person groups.

3. Open `src/app/privacy/page.tsx`. Section 1 ("What we collect") already mentions phone, admit letter, DigiLocker — keep it, but confirm the *order* matches the timeline above. Add one sentence to Section 1 at the end:
   > "You can sign up, verify your phone, and reserve your spot today. Admit letter review and DigiLocker Aadhaar happen on their own timelines, as described on /how."

4. In `VerificationTimeline.tsx`, add a one-line sub-caption under the H2 ("Verified the way your mother would."):
   > "Phone first. Then admit. Then Aadhaar when DigiLocker opens in August. Then your cohort."

   Use `text-[color:var(--color-fg-muted)]` at around 14–15px.

**Commit:** `docs(verify): reconcile verification order across /how, /privacy, and homepage`

---

### 1.3 Extract CONSENT_VERSION to a single source

**Problem:** `src/components/landing/WaitlistModal.tsx` hardcodes `CONSENT_VERSION = "2026-04-19"`. If `/terms` materially changes and this constant isn't bumped, users get silently stamped with the wrong version.

**Steps:**

1. Create `src/lib/consent.ts`:

   ```ts
   /**
    * Bump this string whenever /terms or /privacy materially changes.
    * Stamped into every waitlist row in `consent_version`.
    * Format: YYYY-MM-DD.
    */
   export const CONSENT_VERSION = "2026-04-19";
   ```

2. In `src/components/landing/WaitlistModal.tsx`:
   - Remove the local `const CONSENT_VERSION = "2026-04-19"`.
   - `import { CONSENT_VERSION } from "@/lib/consent";`

3. Grep the repo for any other hardcoded `"2026-04-19"` that references consent — none should remain after this.

4. In `src/app/privacy/page.tsx` and `src/app/terms/page.tsx`, the "Last updated" line currently reads `April 2026`. Leave those as human-readable strings, but add a comment in both files above the line:
   ```tsx
   {/* If you change this date, also bump CONSENT_VERSION in src/lib/consent.ts */}
   ```

**Commit:** `refactor(consent): extract CONSENT_VERSION to src/lib/consent.ts`

---

### 1.4 Add the vision paragraph to /founder

**Problem:** Right now `/founder` commits NexGen to Ireland forever. The moment we announce a second corridor it'll read as dishonest. We need one paragraph — in the founder's voice, on the founder's page, not the homepage — that sets long-term direction without polluting the current positioning.

**Do NOT** add vision language to:
- The homepage (`src/app/page.tsx` and any component in `src/components/landing/`)
- `/how`
- The `<meta>` descriptions
- The navbar
- The manifesto section
- Any CTA

**Steps:**

1. Open `src/app/founder/page.tsx`.

2. Between the paragraph that ends `"— and I'll fix it that day."` (currently lines ~89–101) and the closing paragraph `"If you're heading to Ireland this September…"` (currently lines ~102–106), insert this new paragraph. Match the existing paragraph styling exactly (`text-[17px] leading-[1.7] text-[color:var(--color-fg-muted)]` wrapper already applies from the parent `space-y-6` container — just add a `<p>`).

   **Exact copy to insert (do not edit):**

   ```tsx
   <p>
     <span className="text-[color:var(--color-fg)]">Where this is going.</span>{" "}
     Ireland, September 2026, three universities — that&apos;s the first inch.
     If we earn it, the next corridors are the ones Indian students already
     move to in the largest numbers: the UK, Canada, Australia, Germany, the
     US. After that, this isn&apos;t just for Indian students anymore —
     it&apos;s for anyone, anywhere, moving across a border to study. Every
     student landing somewhere new, knowing nine people. That&apos;s the
     company. But only if we earn it here first. One city, one campus, one
     September at a time.
   </p>
   ```

3. Do not change the paragraphs on either side of it. Do not change the page metadata. Do not change the H1 or the hero blurb.

4. Sanity check after save:
   - The order of paragraphs is now: (i) "I grew up in India…" (ii) "I found exactly zero…" (iii) "That's the problem…" (iv) "NexGen Connect starts with…" (v) "Every profile has…" (vi) "We will never take money…" (vii) **NEW — "Where this is going…"** (viii) "If you're heading to Ireland this September…"
   - The closing CTA section and H2 stay exactly as they are.

**Commit:** `feat(founder): add vision paragraph — Ireland first, then every corridor`

---

## 2. SHOULD-FIX (polish / substance)

### 2.1 Flesh out the manifesto section

**Problem:** `src/components/landing/ManifestoSection.tsx` is 16 lines. One headline, one sub-line. Not enough gravity for the emotional center of the page.

**Steps:**

1. Read the current file to understand its wrapper, container, and typography.

2. Rewrite the body (keep the section wrapper, container-narrow, and any existing `SectionLabel` — only the content inside changes). Replace the current content with this exact structure:

   - `SectionLabel` (if not already present): `Manifesto`
   - H2 (keep existing styling — likely `font-heading text-[40px] md:text-[72px] font-semibold leading-[1.03] tracking-[-0.025em]`):
     > Familiarity before foreignness.
   - Sub-line (keep existing styling — likely `text-[18px] text-[color:var(--color-fg-muted)] max-w-[620px]`), insert below H2 with `mt-8`:
     > Moving abroad is hard. Not because the weather's different. Because on day one you know nobody, and the apps that promised to fix that were run by people selling things you hadn&apos;t asked for.
   - Then a three-beat list, rendered as paragraphs (not bullets), each preceded by a small `font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]` label. Use this `mt-16` vertical rhythm, and wrap in a `space-y-12 mt-20 max-w-[620px]` container:

     ```
     01 / NOT A DIRECTORY
     A directory gives you four hundred names. We give you nine. The difference is the difference between landing and arriving.

     02 / NOT A DATING APP
     A mutual match is how Instagram unlocks, not how anything else does. This isn't about chemistry. It's about the first person you sit next to on the bus from the airport.

     03 / NOT A NETWORKING LOUNGE
     Nobody moves countries for a networking opportunity. You move because of a program, a fee, a visa, a family decision. We start where the move starts: your home city going to your campus.
     ```

3. Keep the section border-top / padding-block consistent with its neighbors (`border-t border-[color:var(--color-border)]`, `py-32 md:py-48`).

4. Do not add a CTA inside this section. The final CTA section already closes the page.

**Commit:** `feat(landing): flesh out manifesto section with three-beat body`

---

### 2.2 Reuse VerificationTimeline on /how

**Problem:** `/how` currently duplicates the 4-step story in prose. Two sources of truth will drift.

**Steps:**

1. Extract the step-grid portion of `src/components/landing/VerificationTimeline.tsx` into a child component `src/components/shared/VerificationSteps.tsx` that takes no props and renders just the 4 step cards (no H2, no section wrapper, no SectionLabel).

2. `VerificationTimeline.tsx` now imports and renders `<VerificationSteps />` inside its existing section shell.

3. In `src/app/how/page.tsx`, after the H1 and lead paragraph, render `<VerificationSteps />`. Keep the rest of the page prose (the "Safety architecture" section, the final CTA) as-is — but delete the prose version of the 4 steps that currently duplicates the timeline. The prose version becomes obsolete the moment the component is imported; do not keep both.

4. Confirm the component still renders correctly on the homepage.

**Commit:** `refactor(verify): share VerificationSteps component between / and /how`

---

### 2.3 Honesty fix on cohort counts

**Problem:** `get_cohort_count`, `get_total_waitlist`, `get_recent_activity`, and `get_map_cohort_breakdown` all count `verification_status in ('verified', 'pending')`. A row in `pending` status is someone who started the flow and hasn't confirmed OTP. Calling them "reserved" is a lie by 2%.

**Decision:** Keep the RPCs' current filter (it makes the numbers feel alive during pre-launch), but change the UI labels from "reserved" to "joined". Truth-in-advertising.

**Steps:**

1. In `src/components/landing/FinalCTA.tsx`:
   - Change the `CounterBlock` label from `"reserved"` to `"joined"`.
   - Change the `CounterBlock` label from `"spots open"` to `"spots open"` (leave as-is).
   - Do not change the `COHORT_TARGET` / the 300 headline.

2. In `src/components/landing/IrelandMap.tsx`:
   - Any pin subtitle that currently says `"{n} reserved"` becomes `"{n} joined"`.
   - Keep the `"Be the first"` zero-state copy.

3. In `src/components/landing/CohortCard.tsx`:
   - The CTA text `"Reserve spot #{filled+1}"` stays (reservation happens *when they submit*, not when they're counted).
   - Any other counter label that currently says "reserved" in this card becomes "joined".

4. Add a single comment at the top of `src/app/actions/waitlist.ts` above the RPC functions:
   ```ts
   // RPCs count (verified + pending). UI labels this as "joined", never "reserved",
   // because pending = someone who started OTP but hasn't confirmed. See 2.3 in
   // NEXGEN-V3-POLISH-PROMPT.md.
   ```

**Commit:** `fix(landing): label waitlist counts as "joined" not "reserved"`

---

### 2.4 OTP rate limiting

**Problem:** `startWaitlistAction` inserts into `otp_codes` with no "how many OTPs has this phone already requested" check. An attacker can burn MSG91 balance.

**Steps:**

1. Create a new migration: `supabase/migrations/0002_otp_rate_limit.sql`:

   ```sql
   -- Cap OTP requests per phone to 3 in any 10-minute window.

   create or replace function public.count_recent_otp_requests(p_phone_hash text)
   returns int
   language sql
   security definer
   set search_path = public
   as $$
     select count(*)::int
     from public.otp_codes
     where phone_hash = p_phone_hash
       and created_at > now() - interval '10 minutes';
   $$;

   grant execute on function public.count_recent_otp_requests(text)
     to anon, authenticated;
   ```

2. In `src/app/actions/waitlist.ts`, inside `startWaitlistAction` — *before* calling `sendOtp()` and *before* inserting into `otp_codes` — call the new RPC with the phone hash. If the count is >= 3, return:

   ```ts
   return {
     ok: false,
     error:
       "Too many codes requested. Try again in ten minutes — or email hello@nexgenconnect.com if you're stuck.",
   };
   ```

3. Add a matching Plausible event: `track("OTP_Rate_Limited", { phone_hash_prefix })` — use only the first 8 chars of the hash, never the full hash.

4. Extend `AnalyticsEvent` in `src/lib/analytics.ts` with `"OTP_Rate_Limited"`.

5. In `src/components/landing/WaitlistModal.tsx`, when `startWaitlistAction` returns `{ok: false, error: ...}`, surface the error text inline (not a toast — inline under the phone input), using the existing error-state classes in the form.

**Commit:** `feat(waitlist): rate-limit OTP requests to 3 per 10min per phone`

---

### 2.5 ActivityTicker caching

**Problem:** The ticker fetches `getRecentActivityAction` on every mount. Scrolling up and down on mobile re-fires it.

**Steps:**

1. In `src/components/landing/ActivityTicker.tsx`, introduce a module-scoped cache:

   ```ts
   let cache: { rows: RecentActivityRow[]; fetchedAt: number } | null = null;
   const CACHE_TTL_MS = 60_000;
   ```

2. In the effect, check `cache` first. If fresh (< 60s old), set state from cache. Otherwise fetch, set state, update cache.

3. Preserve the existing honesty rule: `if (!rows || rows.length < 3) return null`.

4. No visible behavior change expected — verify manually that the marquee still auto-hides when DB is empty and shows when there are ≥ 3 rows.

**Commit:** `perf(ticker): cache recent-activity fetch for 60s`

---

### 2.6 CohortCard loading / error states

**Problem:** If Supabase is slow or down, the debounced cohort lookup returns silently and the card shows nothing.

**Steps:**

1. In `src/components/landing/CohortCard.tsx`, add two new states: `isLoading: boolean` and `error: string | null`.

2. On each `getCohortCountAction` call: set `isLoading = true` immediately; on resolve set `isLoading = false` and update count; on reject set `isLoading = false` and `error = "Couldn't reach the server. Try again in a moment."`.

3. Render states:
   - `isLoading`: show a small inline "…" mono glyph or the existing skeleton style where the count normally renders.
   - `error`: render the error string under the input in `text-[color:var(--color-danger)] text-[13px]`.
   - Success: existing behavior.

4. Do not block the form submit on a failed count fetch — the user should still be able to reserve.

**Commit:** `feat(cohort): add loading and error states to CohortCard`

---

### 2.7 Verify /public/images/aayush.jpg exists

**Problem:** `src/components/shared/FounderPhoto.tsx` (used on `/founder`) references `/images/aayush.jpg`. If that file isn't in `public/images/`, cold deploys silently hit the initials fallback.

**Steps:**

1. Check `ls public/images/aayush.jpg`. If it exists, do nothing.
2. If it does not exist, do nothing destructive — leave the initials fallback in place, but add a TODO comment in `src/app/founder/page.tsx` above the `<FounderPhoto>` block:
   ```tsx
   {/* TODO: add public/images/aayush.jpg (280×280 min, square, under 200kb webp/jpg). */}
   ```
3. Report in your final summary whether the file exists or not.

**No commit if file already exists. If TODO is added:** `chore(founder): flag missing aayush.jpg for upload`

---

## 3. NICE-TO-FIX (time-permitting)

### 3.1 Decide Scrollytelling_Complete

**Problem:** `AnalyticsEvent` enum in `src/lib/analytics.ts` declares `"Scrollytelling_Complete"` but no code fires it.

**Steps:**

1. In `src/components/landing/ScrollyStory.tsx`, fire `track("Scrollytelling_Complete")` once (gate with a `useRef` flag so it can't fire twice per page view) when the user reaches frame 4 with > 80% scroll progress.

2. Do not add any other events.

**Commit:** `feat(analytics): fire Scrollytelling_Complete on final frame`

---

### 3.2 Organization JSON-LD

**Steps:**

1. In `src/app/layout.tsx`, inside the `<head>` before the `<link rel="icon">`, add a `<script type="application/ld+json">` block with this JSON (stringify in the component, don't inline a template literal without escaping):

   ```json
   {
     "@context": "https://schema.org",
     "@type": "Organization",
     "name": "NexGen Connect",
     "url": "https://nexgen-connect.vercel.app",
     "founder": {
       "@type": "Person",
       "name": "Aayush Shah"
     },
     "description": "Verified Indian student cohorts for UCD, Trinity, UCC. Sept 2026.",
     "email": "hello@nexgenconnect.com",
     "areaServed": "IE",
     "foundingDate": "2026"
   }
   ```

2. Use `dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}` on the `<script>`.

**Commit:** `feat(seo): add Organization JSON-LD`

---

### 3.3 Align OG + meta descriptions

**Steps:**

1. In `src/app/layout.tsx`, change `openGraph.description` and `twitter.description` to exactly match the top-level `description`:
   > Meet verified Indian students from your city going to UCD, Trinity, or UCC — before your September 2026 flight.

2. No other metadata changes.

**Commit:** `fix(seo): align openGraph and twitter descriptions with root meta`

---

### 3.4 OTP cleanup migration

**Steps:**

1. Create `supabase/migrations/0003_otp_cleanup.sql`:

   ```sql
   -- Nightly cleanup of expired OTPs. Schedule via Supabase cron
   -- (Database → Cron) with expression `0 3 * * *` after deploy.

   create or replace function public.cleanup_expired_otps()
   returns int
   language plpgsql
   security definer
   set search_path = public
   as $$
   declare
     deleted int;
   begin
     delete from public.otp_codes
     where expires_at < now() - interval '24 hours';
     get diagnostics deleted = row_count;
     return deleted;
   end;
   $$;

   grant execute on function public.cleanup_expired_otps() to service_role;
   ```

2. Do **not** call this function from anywhere in the app — it's scheduled server-side only.

3. Add to your final summary: "Schedule `select public.cleanup_expired_otps()` nightly at 03:00 UTC via Supabase cron."

**Commit:** `feat(db): add cleanup_expired_otps function + migration`

---

### 3.5 List-Unsubscribe on welcome email

**Steps:**

1. In `src/lib/resend.ts`, in `sendWaitlistWelcome`, pass these headers to `emails.send`:

   ```ts
   headers: {
     "List-Unsubscribe":
       "<mailto:hello@nexgenconnect.com?subject=Unsubscribe>, <https://nexgen-connect.vercel.app/unsubscribe>",
     "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
   }
   ```

2. Do **not** create the `/unsubscribe` route in this pass. Add a TODO in your summary.

**Commit:** `feat(email): add List-Unsubscribe headers to welcome email`

---

### 3.6 A11y pass on SwipeDeck + IrelandMap

**Steps:**

1. In `src/components/landing/SwipeDeck.tsx`:
   - Confirm each action button has an `aria-label` (`"Pass"` / `"Match"` / `"Reset demo"`).
   - Confirm ArrowLeft / ArrowRight handlers are attached to a focusable element (not `document`) or that focus is moved to the card on mount.

2. In `src/components/landing/IrelandMap.tsx`:
   - Wrap the SVG in an element with `role="img"` and `aria-label="Map of Ireland showing UCD, Trinity College Dublin, and University College Cork with travel paths from India"`.
   - Mark purely decorative paths (flight arcs, Ireland outline strokes) with `aria-hidden="true"`.
   - Each pin's interactive element (if any) needs an accessible name — city + university + count.

3. Don't rewrite these components. Only add the attributes.

**Commit:** `a11y(landing): label SwipeDeck controls and IrelandMap SVG`

---

### 3.7 "Sept 2026" vs "September 2026"

**Steps:**

1. Search the repo for both `"Sept 2026"` and `"September 2026"`. Pick one *display* rule:
   - In the body prose and trust copy → "September 2026" (full word).
   - In small mono labels, nav pills, counters, CTA badges → "Sept 2026" (short).
2. Enforce the rule. The master prompt's approved hero pill `SEPT 2026 · INDIA → IRELAND · WAITLIST OPEN` uses the short form — keep it.

**Commit:** `fix(copy): enforce Sept-vs-September rule across the page`

---

## 4. Acceptance criteria (run all before the final push)

- [ ] `pnpm build` passes with zero warnings about unused imports or dead code.
- [ ] `pnpm lint` passes.
- [ ] `pnpm tsc --noEmit` passes (no type errors).
- [ ] `rg -n "23,?000|Find Your People|₹999|download the app" src/` returns **zero** matches.
- [ ] `rg -n "reserved" src/components/landing/` — only appearances are in the word `"Reserve"` on CTAs, never as a noun describing a count.
- [ ] `rg -n "COHORT_CAP|COHORT_TARGET" src/` — every hit imports from `@/lib/cohort`.
- [ ] `rg -n "2026-04-19" src/` — every hit is in `src/lib/consent.ts` or in a comment referring to it, never in a component.
- [ ] The string `"Where this is going."` appears exactly once in the codebase, inside `src/app/founder/page.tsx`.
- [ ] Visiting `/` → Cohort card shows 300-dot (or segmented) cap. FinalCTA still says "fills at 300." Labels say "joined", never "reserved."
- [ ] Visiting `/how` → renders the same 4-step `<VerificationSteps />` as the homepage. No duplicated prose version.
- [ ] Visiting `/founder` → the "Where this is going." paragraph sits between the "…fix it that day." paragraph and the "…nine people." paragraph.
- [ ] Visiting `/privacy` and `/terms` → both still render. Last-updated line unchanged. New comment points to `CONSENT_VERSION`.
- [ ] DB migration files `0002_otp_rate_limit.sql` and `0003_otp_cleanup.sql` exist and `psql --echo-errors` would parse them.
- [ ] `rg -n "Scrollytelling_Complete" src/` — at least one firing site in `ScrollyStory.tsx`, not just the enum.
- [ ] No new dependencies added (`git diff package.json` is empty).
- [ ] No new top-level routes, no new landing components.
- [ ] Every commit is atomic and its subject matches the format in this doc.

---

## 5. Final summary I want you to write (paste into PR description)

When you're done, produce a short report with these sections:

1. **Commits shipped** — list of commit subjects in order.
2. **Contradictions hit** — any case where the code on disk contradicted this prompt and how you resolved it.
3. **Skipped items** — anything in §3 you didn't get to, and why.
4. **DB migrations pending deploy** — exact names of the two new migration files; reminder to run `supabase db push` and to schedule the cron.
5. **Manual QA checklist I should run** — 5–7 bullets, max, covering the visual changes I won't catch in code.

That's the whole scope. Anything tempting that isn't in this document — including "while I'm here, I should also…" — do **not** do it. Flag it in the summary instead.

— Aayush
