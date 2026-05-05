# v16 cross-cut cleanups

Tracking the deferred follow-ups from the P-series. None of these
block v1 launch but each surfaces a sharp edge that's easy to miss
once the codebase stabilises.

## 1. `web/src/lib/msg91.ts` — orphan after P1.b (partial)

P1.b lifted the **/signup** funnel's OTP path through tRPC
`auth.requestOtp` / `auth.verifyOtp`, which routes to
`packages/server/src/server/lib/otp/router.ts` (Meta WhatsApp +
MSG91 fallback). So the new funnel never touches `msg91.ts`.

The legacy file is still imported by **two distinct paths** that
predate the v16 pivot:

A. **REST routes** behind `NEXT_PUBLIC_USE_REAL_MSG91`:
   - `web/src/app/api/auth/send-otp/route.ts`
   - `web/src/app/api/auth/verify-otp/route.ts`

   These are the only msg91 imports the v16 funnel could reach,
   and post-P1.b nothing calls them. Safe to drop.

B. **Server actions** for the legacy v15 waitlist + admin login:
   - `web/src/app/actions/waitlist.ts`
   - `web/src/app/actions/admin.ts`

   These power the original `/admin/login` flow and the original
   waitlist signup that pre-dates the /signup funnel. Until those
   surfaces are deprecated or migrated through tRPC, the file
   stays.

Action (now): delete the two REST routes — `npm run build` proves
they have no consumers in the v16 codebase.
Action (later): port `/admin/login` to call `auth.requestOtp` via
the tRPC server-action wrapper, then delete `msg91.ts`.

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

v16 web pivot Bucket 4 follow-up.
