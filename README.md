# NexGen Connect

> **Status (May 2026):** v1 ships on **web** at [nexgen-connect.vercel.app](https://nexgen-connect.vercel.app). Mobile is paused but preserved (see [`mobile/PAUSED.md`](mobile/PAUSED.md)). Targeting **September 2026 Ireland launch**, October 2026 Germany. Mobile resumes Q1 2027 once web has 500+ verified users.

NexGen Connect is the verified-trust network for Indian students moving abroad. The promise: **find your people before you land.**

This is a Turborepo monorepo:

```
.
├── web/              Next.js 16 (App Router) — v1 product, deployed
├── packages/
│   ├── server/       tRPC v11 backend — backend-agnostic, deploys as separate Vercel project
│   ├── shared/       Design tokens + Zod validation + corridor constants + error catalogue
│   └── copy/         i18n catalogues (EN / HI partial / pseudo-locale)
└── mobile/           Expo SDK 54 — PAUSED, see mobile/PAUSED.md
```

## Read these first

- [`docs/v16-web-pivot-decisions.md`](docs/v16-web-pivot-decisions.md) — strategic frame, why web-first, 8-week launch path
- [`mobile/PAUSED.md`](mobile/PAUSED.md) — what "paused" means for the mobile workspace
- [`AGENTS.md`](AGENTS.md) — agent rules (Next.js 16 has breaking changes; read `node_modules/next/dist/docs/` before assuming an API)

## Web — `web/`

Next.js 16 + App Router + Turbopack. Tailwind CSS v4. Supabase SSR. React 19.1. Deployed to Vercel.

```bash
npm install
npm run web:dev          # localhost:3000
npm run web:build        # production build
```

## Server — `packages/server/`

Next.js 16 + tRPC v11 fetch adapter. 11 domain routers (auth, verification, corridor, chat, premium, parent, T&S, group-apply, mental-health, scams, admin). Deploys as a separate Vercel project at `nexgen-connect-api.vercel.app`.

```bash
npm run dev --workspace=@nexgen-connect/server   # localhost:4000/api/trpc/<procedure>
```

See [`packages/server/README.md`](packages/server/README.md) for the full router shape + middleware (audit-log, error-mapping, idempotency, rate-limit) + schema migrations.

## Mobile — `mobile/` (paused)

See [`mobile/PAUSED.md`](mobile/PAUSED.md).

If you genuinely need to boot it (smoke testing the v15 snapshot):

```bash
npm run mobile:start --web    # localhost:8081, web preview against mocks
```

## Discipline

Every PR targets `main`. Every commit references `v15 BP §X.Y`, `v16 web pivot §X.Y`, or `Bucket N`. Pre-push hook runs import-audit + expo-doctor + clean-clone-verify. See [`docs/v16-web-pivot-decisions.md`](docs/v16-web-pivot-decisions.md) §1 for full discipline rules and the seven stop conditions.

## Contributing

This repository is currently single-author (Aayush). External contributions resume after the Sept 2026 launch. If you found this on GitHub and want to wait-list, follow the link in [`web/`](https://nexgen-connect.vercel.app).

---

v16 web pivot §0 (status block per Bucket 0 acceptance check).
