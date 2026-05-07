# v16 cross-cut cleanups

Tracking the deferred follow-ups from the P-series. None of these
block v1 launch but each surfaces a sharp edge that's easy to miss
once the codebase stabilises.

## 1. `web/src/lib/msg91.ts` — orphan after P1.b (partial)

P1.b lifted the **/signup** funnel's OTP path through tRPC
`auth.requestOtp` / `auth.verifyOtp`, which routes to
`packages/server/src/server/lib/otp/router.ts` (Meta WhatsApp +
MSG91 fallback). So the new funnel never touches `msg91.ts`.

The legacy file is still imported by the v15 admin-login server
action (`web/src/app/actions/admin.ts`), which uses MSG91 SMS to
send admin OTP codes and gates on `is_admin_hash` after verify.
Until `/admin/login` is migrated to Supabase Auth + the
`app_metadata.is_admin` claim consumed by the new tRPC
`requireAdmin` middleware (trpc.ts), this file stays.

Status as of 2026-05-07:
- ✅ `web/src/app/actions/waitlist.ts` deleted (was orphaned by
  P1.b — no remaining callers).
- ✅ Legacy REST routes `/api/auth/send-otp`, `/api/auth/verify-otp`
  removed in the cross-cut cleanup PR (predates this entry).
- ⏳ `/admin/login` → tRPC migration. Larger rewrite: collapses
  the `ngc_admin` cookie path onto the standard Supabase Auth
  cookie chain, replaces `is_admin_hash` RPC with the JWT
  `app_metadata.is_admin` check, retires `web/src/lib/admin.ts`'s
  signed-cookie helper. Out of scope for v1 launch.

Action (later): port `/admin/login` to Supabase Auth (admins
authenticate like everyone else, `app_metadata.is_admin = true`
gates `/admin/(protected)` and the tRPC `adminProcedure`). Then
delete `msg91.ts` + `web/src/lib/admin.ts`.

## 2. `lucide-react` version audit — RESOLVED

`web/package.json` pins `^1.8.0` and resolves to `1.14.0`. We
checked: this **is** the canonical maintained package
(`https://lucide.dev`, maintainer `ericfennis`). The `0.x` numbers
that live in some Anthropic/training-data references are dev/beta
dist-tags, not the latest stable. No bump needed.

Removed from this list.

## 3. react-email templates for parent-link

`web/src/app/api/parent-link/send/route.ts` calls Resend with an
inline HTML string for the magic-link email. It works but:
- Hard to A/B subject lines
- Rendering tested only in Gmail
- No staging preview surface

Action: introduce `@react-email/components`, port the inline HTML
to `web/src/emails/parent-link.tsx`, wire `react-email dev` for
local preview at `:3001`, and switch the route to render the
template through `render(<ParentLink ... />)`.

## 4. `PaymentGateway` interface

`web/src/app/api/razorpay/{order,webhook}` is hard-wired to
Razorpay. The premium tier may need to add a second gateway
(Stripe? Cashfree?) in 2027 once we go beyond INR.

Action: extract a `PaymentGateway` interface
(`web/src/lib/payments/types.ts`) with `createOrder`, `verifyWebhook`,
`refund` methods. Move Razorpay implementation behind it. New
gateways add a sibling file + a flag to pick at runtime.

## 5. Drizzle migration apply

The hand-curated `packages/server/src/db/schema.ts` mirrors
migrations 0001–0011 but isn't generated. Per D1 of the decisions
doc, `drizzle-kit pull` becomes canonical at staging cut-over.

Action: when staging Postgres is ready (target: end of June 2026),
run `drizzle-kit pull` against the staging DB and replace the
hand-curated schema with the generated one. The schema-agreement
test (`packages/server/__tests__/schema-agreement.test.ts`) catches
drift in the meantime.

## 6. Web Push end-to-end smoke

Bucket 4 follow-up shipped the durable push pipeline:

- ✅ `web/supabase/migrations/0008_push_subscription.sql` —
  schema with unique (user_id, endpoint), failure markers,
  RLS service-role-only.
- ✅ `web/src/app/api/push/subscribe/route.ts` — auth-gated +
  rate-limited (10/min) upsert via service-role client.
- ✅ `web/src/lib/inngest/jobs/push-fanout.ts` — queries
  `chat_thread_member` + active `push_subscription` rows, signs
  + sends via `web-push`, marks 404/410 as expired.
- ⏳ Wiring the `/app` PWA's Service Worker to call
  `pushManager.subscribe(applicationServerKey: VAPID_PUBLIC)` and
  POST to `/api/push/subscribe`. The schema + endpoint + worker
  are ready; the SW JS is the last mile.
- ⏳ A scheduled Inngest cron to hard-delete subscriptions
  with `last_failure_at` older than 30 days (today the rows are
  soft-marked, never reclaimed).
- ⏳ End-to-end test that proves a chat-send triggers a push to
  the other thread member's registered endpoint. Requires VAPID
  keys + a Service Worker + Playwright's `notifications` API.

VAPID env vars (NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY,
VAPID_SUBJECT) are documented in `web/.env.example`. Generate the
keypair once with `npx web-push generate-vapid-keys`.

## 7. Real-device performance + a11y lifts

These appear in `docs/v16-launch-checklist.md` Tier-2:

- **Real-device perf measurements**: the perf-budget doc tracks
  the 180 KB initial-JS target on synthetic Lighthouse runs only.
  Pre-launch we want to capture LCP / INP on a mid-tier Android
  device (Pixel 4a is representative) over Indian 4G.
- **`axe` a11y violations to zero**: `web-a11y.yml` runs with
  `continue-on-error: true` because the marketing surface still
  has known WCAG 2.1 AA violations (colour contrast on the
  problem-stat overlay; landmark-region misuse on the legal
  pages). Tracked as the Tier-2 item; lift requires a dedicated
  PR per surface.

## 8. Lawyer review of legal copy

`/privacy` + `/terms` are written for plain-English readability.
DPDP-2023, GDPR (parent links target Ireland-resident parents) and
the standard B2C SaaS clauses need a lawyer pass before the
public-launch press push (corridor-1 DUB Sept 2026). Today the
copy is "founder-drafted, founder-signed" — defensible during
beta; not defensible at scale. Action: book a 90-minute review
with the chosen counsel after admit-letter validation rate hits
80% on real DUB letters (signal that we're past the technical
correctness phase and into commercial polish).

## 9. AI lanes — shipped + deferred

Four AI lanes shipped through Vercel AI Gateway (Claude Haiku 4.5
default), each behind its own env flag so the operator can roll
them on independently after reviewing real output:

- ✅ **Admit-letter vision parse** —
  `web/src/lib/ai/admit-parse.ts`. Pulls the uploaded letter from
  Cloudflare Images via the account-token API, asks the model to
  extract university/intake/applicant/red-flags, diffs against the
  user-typed corridor fields, persists to
  `auth.users.user_metadata.admit_extracted`. Surfaced in the
  `/admin` review row as a chip. Flag: `AI_ADMIT_PARSE_ENABLED`.
- ✅ **Chat scam auto-file** —
  `web/src/lib/inngest/jobs/chat-scam-detect.ts`. Sibling Inngest
  job to `push-fanout` on `chat/message.sent`; classifies the
  140-char excerpt the chat-send route already capped, auto-files
  a `chat_report` (`auto_filed=true`) when confidence ≥ 0.75.
  Hands off to the existing `ts-sla` SLA escalation. Migration:
  `packages/server/migrations/0012_chat_report_ai.sql`. Flag:
  `AI_SCAM_DETECT_ENABLED`.
- ✅ **DigiLocker name-match override** —
  `web/src/lib/ai/name-match.ts`. Runs only when the cheap
  token-overlap match has rejected; LLM override at confidence
  ≥ 0.85 with a verbatim entry to `audit_log` for spot-check.
  Catches transliteration / regional spelling drift / honorifics
  that the token logic rejects today. Flag:
  `AI_NAME_MATCH_ENABLED`.
- ✅ **Founder triage verdict** — `web/src/lib/ai/triage.ts` +
  `computeTriageForRowAction`. One-line verdict (label + sentence)
  prefixed onto each `/admin` row. Lazy-loaded on row mount,
  cached in `user_metadata.triage_verdict`, invalidated on every
  `admission_status` write. Flag: `AI_TRIAGE_ENABLED`.

Deferred:

- ⏳ **Sub-circle embeddings**. Cluster verified cohort members
  by interests / course / dietary preferences for finer-grained
  matching beyond the named buckets (women-only, etc.). Embeddings
  are only useful past ~200 verified per corridor — below that you
  have no signal to cluster on, the named buckets carry more
  meaning than a noise-cluster. Reassess at corridor-1 mid-launch
  (Sept 2026 + 6 weeks).

Cost & monitoring:

- All four lanes route through Vercel AI Gateway (`gateway()` in
  `web/src/lib/ai/client.ts`). One key, fallback to Sonnet 4.6 on
  Haiku 5xx, zero data retention.
- Default model is Haiku 4.5 — at typical volumes (50 admits/day,
  10k chat messages/day, 50 admin row triages/day) the projected
  cost is under $5/month. Monitor in Vercel dashboard.
- Auth uses OIDC (`VERCEL_OIDC_TOKEN`) on Vercel deployments. No
  manual key rotation needed in production. Local dev pulls the
  short-lived token via `vercel env pull`.

v16 web pivot Bucket 4 follow-up.
