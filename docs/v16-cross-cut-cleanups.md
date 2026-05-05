# v16 cross-cut cleanups

Tracking the deferred follow-ups from the P-series. None of these
block v1 launch but each surfaces a sharp edge that's easy to miss
once the codebase stabilises.

## 1. `web/src/lib/msg91.ts` — orphan after P1.b

P1.b lifted the OTP path through tRPC `auth.requestOtp` /
`auth.verifyOtp`, which routes to `packages/server/src/server/lib/
otp/router.ts` (Meta WhatsApp + MSG91 fallback).

The legacy `web/src/lib/msg91.ts` is still imported by:
- `web/src/app/actions/waitlist.ts`
- `web/src/app/actions/admin.ts`
- `web/src/app/api/auth/send-otp/route.ts`
- `web/src/app/api/auth/verify-otp/route.ts`

Action: once the signup pages no longer call `services.ts` for
auth (they already don't post-P1.b), drop the four REST routes
that wrap msg91, then delete the file. Estimated ~150 LOC removal,
zero runtime impact because the new tRPC procedures are already
serving every call site that matters.

## 2. `lucide-react` version audit

`web/package.json` pins `^1.8.0`. The published npm package by
that name is a separate (older) fork — the modern Lucide icons
ship under `lucide-react@^0.x` (most recent: 0.479+).

Action: bump to `lucide-react@latest` (the maintained 0.x line),
sweep imports for any renamed icons, run lint to surface
references that reach for icons that no longer exist (e.g., the
old fork shipped some icon names that the modern fork dropped).

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
