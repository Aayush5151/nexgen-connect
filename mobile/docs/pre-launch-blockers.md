# Pre-launch blockers

Four items hidden inside per-bucket follow-up lists that are actually **must-do-before-launch** — not "nice to have", not "Bucket-N follow-up", not "post-credentials". Each is a security or compliance contract that the foundation depends on. The skeleton ships when these four become real.

Per the post-Bucket-10 review feedback (item 11):

> "The four mocked subsystems (identity, OTP, payments, voice) become real and the four security primitives (attestation, pinning, rate-limit, audit) have actual teeth. Don't let the green test count make this feel further along than it is."

This doc is the visible home for the four "actual teeth" items. They're tracked here, not buried.

---

## Status legend

| Mark | Meaning |
|---|---|
| ✗ | Not started — currently a mock or placeholder |
| ◐ | In progress — partial implementation landed but not enforced |
| ✓ | Real implementation enforced in production code path |

---

## The four blockers

### 1. Composite identity hash — currently ✗

**What it is.** v15 BP §9.1 — server-side hash composed of `name + dob_month + phone_hash + admit_HEI + identity_pepper`. The single uniqueness anchor for the entire three-check trust model. Without it, two phones can claim to be the same person and matching corridors have no actual uniqueness guarantee.

**Where it lives today.** [`packages/server/src/server/routers/verification.ts`](../../packages/server/src/server/routers/verification.ts) `completeDigiLocker` returns a hardcoded `"****12af"` mock string. There is no real hashing; nothing is enforced.

**What unblocks production.** New module at `packages/server/src/server/lib/identity-hash.ts` (server-only — pepper must never reach the mobile bundle) that:
1. Reads `AADHAAR_REF_PEPPER` + `IDENTITY_PEPPER` from server env.
2. Composes the 5-tuple into a deterministic hash with HMAC-SHA-256.
3. Exposes `composeIdentityHash(input) → string` and `maskIdentityHash(hash) → string` (last-4 only for client display).
4. The DigiLocker procedure computes the hash once at handshake, persists, and returns ONLY the masked variant.

**Why this is blocker-level, not follow-up.** Without a real composite hash, identity-tied bans (v15 BP L6 — "banned identity can never re-register") are unenforceable. The first agent who realises this and re-registers across phones breaks the trust model for every legitimate user.

**Owner.** Server lead. **Target.** Pre-launch (before any growth spend).

---

### 2. Real audit-log writes — currently ✗

**What it is.** v6 §17 + GDPR Art. 5(2) accountability + DPDP §10. Every PII-adjacent operation appends an immutable row to `audit_log` (user_id, procedure, req_id, type, success, elapsed_ms, input_hash, error_code, ts).

**Where it lives today.** [`packages/server/src/server/middleware/audit-log.ts`](../../packages/server/src/server/middleware/audit-log.ts) writes through `console.log("[audit_log]", ...)` because `ctx.db = null`. The compliance trail is a Vercel log stream, not a queryable append-only table.

**What unblocks production.** Real Supabase client wired into `ctx.db` + the middleware swaps the `console.log` for `await ctx.db.from("audit_log").insert(record)`. Migration `0001_v5_baseline.sql` already declares the table — apply it at staging cut-over.

**Why this is blocker-level.** If a regulator (DPDP Authority, EU DPA) or an angry parent files a §22 access request asking "show me what this user did between July 14–21" and the answer is "Vercel rotated those logs out 7 days ago", that's an enforcement event, not a feature gap.

**Owner.** Server lead. **Target.** Pre-launch.

---

### 3. Real rate-limit + idempotency caches — currently ✗

**What it is.** v6 §11. Token-bucket per (user, procedure) with per-minute and per-hour caps. Idempotency keys cached for 24h to absorb client retries.

**Where it lives today.** [`packages/server/src/server/middleware/rate-limit.ts`](../../packages/server/src/server/middleware/rate-limit.ts) and [`idempotency.ts`](../../packages/server/src/server/middleware/idempotency.ts) both use process-local `Map<string, …>` caches. On Vercel Functions every cold start gets a fresh process, so:
- An attacker who can cause cold starts (anyone hitting an idle endpoint) defeats the per-minute rate limit.
- A client retry that arrives at a different instance gets re-executed instead of returning the cached response — duplicate `ts.report` rows, duplicate Razorpay charges.

**What unblocks production.** Move both caches to Upstash Redis (or Vercel Marketplace Redis). The middleware shapes don't change — the storage swaps from `Map` to a Redis client with TTL semantics.

**Why this is blocker-level.** Rate-limit defeats let a single attacker exhaust MSG91 OTP budget in minutes. Idempotency defeats let a client double-charge a parent's Razorpay card on a flaky network. Both are user-visible failures with money attached.

**Owner.** Server lead. **Target.** Pre-launch (before any public endpoint).

---

### 4. Account-deletion cascade — currently ✗

**What it is.** GDPR Art. 17 + DPDP §13 right-to-erasure. When a user deletes their account, all user-keyed data deletes within the legally-required window across:
- `verified_user`
- `corridor_member`
- `group_message` (per L8 — author name anonymised, body retained for the conversation)
- `premium_unlock` (financial records: 7-year retention, but identity-tied data scrubbed)
- `ts_incident` + dialogue (advisor IDs anonymised, content retained for safety pattern analysis)
- `arrival_checkin`
- `audit_log` (user_id replaced with deletion-token, body retained for compliance)
- Analytics (PostHog person delete API)
- Crash reports (Sentry user delete API)
- Email service records (Resend audience suppression)
- Payment processor records (Razorpay/Stripe deletion request)
- Backups (next backup cycle scrubs)

**Where it lives today.** Nowhere. There's no `auth.deleteAccount` procedure. No cascade. No SLA contract.

**What unblocks production.** New procedure `auth.deleteAccount` that:
1. Requires biometric re-auth (already wired via `mobile/src/lib/security/biometric.ts`).
2. **Acknowledges within 60 minutes** (per Build Prompt §Bucket 7) — server inserts an erasure-request row, returns `acknowledgedAt` immediately, fires confirmation email.
3. **Completes the cascade within 30 days** (GDPR Art. 12(3) ceiling; DPDP "as soon as practicable") — background job walks the table list above, anonymises or deletes per the per-table retention rules, hits the third-party APIs, returns an erasure-completion record.
4. Zod input + Zod output. Audit-log entries throughout.

**Why this is blocker-level.** GDPR fines start at €10M / 2% global turnover. DPDP fines start at ₹50 crore. Both regulators expect a working cascade the day production traffic begins, not a roadmap entry.

**Note on the SLA contract** (per post-Bucket-10 review): the per-bucket follow-up list previously implied a 60-minute *cascade*. That over-promises — a real cascade across analytics + payment processors + backups cannot complete in 60 minutes. **The contract is: 60-minute acknowledgement, 30-day completion.** Soften the Zod return type accordingly when the procedure lands.

**Owner.** Server lead + DPO consultant on the retention rules. **Target.** Pre-launch.

---

## Recommended sequence (post-Bucket-10 review item 11)

The review's stack-rank places these in the first three sprints alongside other items:

| # | Sprint | Item | Bucket |
|---|---|---|---|
| 1 | now | Composite identity hash (this doc §1) | Bucket 4 follow-up |
| 2 | now | Real audit_log to DB (this doc §2) | Bucket 4 follow-up |
| 3 | now | Upstash for rate-limit + idempotency (this doc §3) | Bucket 4 follow-up |
| 4 | now | Account-deletion cascade (this doc §4) | New |

Items 1–4 are pre-launch must-do. After they land, the four mocked external integrations (MSG91, DigiLocker, Razorpay, Twilio voice) become the next pre-paid-acquisition blocker — those live in [`build-completion.md`](./build-completion.md) under "What's pending → Server-dependent (Bucket 4 follow-up)".

---

## Why this doc exists

Because hiding "the composite hash that anchors the entire trust model" inside a bullet list under "Bucket 4 follow-up" makes it easy to forget. It sat there through Bucket 5, Bucket 6, Bucket 7 — every PR moved past it without naming it. The post-Bucket-10 review caught the omission. This doc is the surgical fix: lift the four blockers out of the noise floor so the next reviewer who reads `build-completion.md` sees them at the same level as everything else.

If a fifth blocker emerges that has the same shape (security or compliance contract, currently a placeholder, must be real before launch), add it here. Don't bury it.

v15 BP §9.1, §16 / v6 build §11, §17 / Build Prompt Bucket 4 + Bucket 10 + post-Bucket-10 review (item 11).
