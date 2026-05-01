# @nexgen-connect/server

The tRPC v11 backend for NexGen Connect mobile.

Bucket 4 of the autonomous build per `mobile/docs/build-prompt-decisions.md` A3:

> `packages/server/` deploys as a **separate Vercel project** at `nexgen-connect-api.vercel.app`. Wired from mobile via `EXPO_PUBLIC_TRPC_URL`. Cleaner blast radius, isolated env, isolated logs.

---

## What's here

```
packages/server/
├── package.json
├── tsconfig.json
├── next.config.ts
├── .env.example
├── README.md
├── migrations/
│   ├── 0001_v5_baseline.sql              — v5 schema baseline (audit_log, verified_user, corridor, etc.)
│   ├── 0002_v6_corridor_layers.sql       — Layer 1/2/3 per v15 BP §3.2
│   ├── 0003_v6_first_mover_outreach.sql  — W16 founder-call queue
│   └── 0004_v6_arrival_checkin_and_optout.sql — Y6 + women-only opt-out
└── src/
    ├── index.ts                          — public type-only export (AppRouter)
    ├── app/api/trpc/[trpc]/route.ts      — Next.js 16 App Router fetch-adapter
    └── server/
        ├── context.ts                    — request context, mock user resolver
        ├── trpc-builder.ts               — initTRPC instance (split to break import cycle)
        ├── trpc.ts                       — public/phoneOnly/fullyVerified procedures
        ├── router.ts                     — composes all 11 domain routers
        ├── middleware/
        │   ├── audit-log.ts              — DPDP+GDPR append-only audit
        │   ├── error-mapping.ts          — every error → E001-E065
        │   ├── idempotency.ts            — 24h replay cache on mutations
        │   └── rate-limit.ts             — token bucket per (user, procedure)
        └── routers/
            ├── auth.ts                   — phone OTP (mocked MSG91)
            ├── verification.ts           — DigiLocker + admit-letter + status
            ├── corridor.ts               — Layer 1/2/3 placement, members, sub-circles
            ├── chat.ts                   — channel list + messages
            ├── premium.ts                — Razorpay ₹999 + arrival-checkin
            ├── parent.ts                 — passcode + dashboard
            ├── trustSafety.ts            — report + advisor dialogue
            ├── groupApply.ts             — PBSA cluster
            ├── mentalHealth.ts           — region-localised crisis resources
            ├── scams.ts                  — 5 canonical patterns (BP §16.30)
            └── admin.ts                  — back-office: callFirstMover, banUser, peppersRotate, etc.
```

## Status

**Foundation complete, mock-backed.** Every procedure declared by `mobile/src/lib/services/types.ts` has a server-side implementation with:
- Zod input validation (importing schemas from `@nexgen-connect/shared/validation` where defined).
- Zod output validation (server returns the same shape mobile mocks return — so the swap is mechanical).
- Auth gate (public / phoneOnly / fullyVerified).
- Audit-log + error-mapping + (mutations) idempotency middleware applied automatically.

Real external integrations are stubbed with `// TODO(bucket-4-followup)` markers:
- MSG91 SMS send (auth.requestOtp).
- DigiLocker OAuth + composite hash computation (verification.startDigiLocker / completeDigiLocker).
- Supabase Storage signed URL (verification.uploadAdmit).
- Razorpay order create (premium.startCheckout).
- Twilio Voice masked-number bridge (admin.callFirstMover).

The mock implementations return the same shape the real ones will, so consumer code (mobile) is contract-stable across the swap.

## Local development

```bash
# from monorepo root
npm install
cp packages/server/.env.example packages/server/.env.local
# fill in PHONE_PEPPER, OTP_PEPPER, SESSION_SECRET (any random strings for dev)

# run the dev server
npm run dev --workspace=@nexgen-connect/server
# tRPC handler at http://localhost:4000/api/trpc/<procedure>
```

Mobile points at this via `EXPO_PUBLIC_TRPC_URL=http://localhost:4000/api/trpc` in `mobile/.env.local`.

## Production deployment (post-Bucket 5)

The server deploys as its own Vercel project at `nexgen-connect-api.vercel.app`. Setup steps:

1. Create a new Vercel project, root = `packages/server/`, framework preset = Next.js.
2. Set env vars in Vercel dashboard (everything from `.env.example` except `MOCK_OTP=false` / `MOCK_DIGILOCKER=false` / `DIGILOCKER_ENABLED=true`).
3. Set `NODE_ENV=production`.
4. Domain: alias `nexgen-connect-api.vercel.app` (default) or a custom domain — the mobile app reads from `EXPO_PUBLIC_TRPC_URL`.
5. Configure Vercel KV for the rate-limit + idempotency caches (currently in-memory; swap in Bucket 4 follow-up).

## Schema migrations

`migrations/0001` through `0004` capture the v5 baseline + v6 deltas per v6 §17. **They are documentary** — not run against any real Supabase. Per [build-prompt-decisions.md D1](../../mobile/docs/build-prompt-decisions.md):

> Real Supabase corridor schema migration is handled separately at staging cut-over. Server-side Bucket 4 mocks return data shaped by these migrations.

When the staging cut-over runs, apply migrations in numeric order against the Supabase schema. Each migration is idempotent on its own (DDL only — no data movement).

## Mobile integration

Mobile imports the AppRouter type only:

```ts
// mobile/src/lib/services/trpc.ts (Bucket 4 follow-up)
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@nexgen-connect/server";

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: process.env.EXPO_PUBLIC_TRPC_URL ?? "http://localhost:4000/api/trpc",
      headers: () => ({ authorization: getSessionToken() }),
    }),
  ],
});
```

Then `services.auth.requestOtp({ phone })` becomes `trpc.auth.requestOtp.mutate({ phone })` — a mechanical swap once the credential and infrastructure pipelines are live.

## Auth flow

| Stage | Bearer token | Procedures available |
|---|---|---|
| `public` | none | `auth.requestOtp`, `auth.verifyOtp`, `scams.patterns`, `mentalHealth.resources` |
| `phoneOnly` | session token from verifyOtp | `verification.*`, `corridor.preview` |
| `fullyVerified` | session token after admit-letter approved | everything else: `corridor.me`, `chat.*`, `premium.*`, `parent.*`, `trustSafety.*`, `groupApply.*`, `admin.*` |

## Known TODOs (Bucket 4 follow-up + Buckets 5/6)

- Real DB client (Supabase) — currently `ctx.db` is null.
- Vercel KV / Upstash for rate-limit + idempotency caches.
- Real MSG91 / Twilio / DigiLocker / Razorpay integrations (post-KYC per Build Prompt out-of-scope list).
- Production cert SPKI hash extraction once this server deploys (per `mobile/src/lib/security/cert-pinning.ts`).
- Source-map upload to Sentry (Bucket 5 EAS / Vercel build hook).
- Unit tests for each domain router (Bucket 6).

v6 build §11, §17, §18 / Build Prompt Bucket 4.
