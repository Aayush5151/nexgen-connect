/**
 * tRPC client — typed browser-side client pointed at the in-process
 * /api/trpc handler (web/src/app/api/trpc/[trpc]/route.ts).
 *
 * Default URL is same-origin `/api/trpc` so cookies (Supabase Auth in
 * P2) flow naturally and there's no CORS surface. Override with
 * `NEXT_PUBLIC_TRPC_URL` if a future deploy splits the API into a
 * dedicated Vercel project per docs/v16-web-pivot-decisions.md §A3.
 *
 * Two surfaces:
 *   - `trpc`        React-Query hooks (createTRPCReact). Use in client
 *                   components for queries / mutations.
 *   - `trpcVanilla` Promise-style client (createTRPCClient). Use in
 *                   non-React paths, server actions, or one-shot
 *                   mutations where hooks are awkward (e.g. the
 *                   imperative signup-funnel adapter in lib/signup/
 *                   services.ts).
 *
 * v16 web pivot §P1.b.
 */
import { createTRPCClient, httpBatchLink, type TRPCClient } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@nexgen-connect/server";

/**
 * No `transformer` is configured here because the server's
 * `initTRPC.context<Context>().create()` (packages/server/src/server/
 * trpc-builder.ts) ships with the default JSON serializer. Every
 * existing procedure returns ISO strings for dates explicitly, so
 * skipping superjson keeps the wire format stable. Add `transformer`
 * here AND on the server in lockstep if a future procedure needs
 * Date / Map / Set on the wire.
 */

/** Default to same-origin /api/trpc — handler is mounted in this app. */
const DEFAULT_URL = "/api/trpc";

export function getTrpcUrl(): string {
  if (typeof window !== "undefined") {
    // Browser side: env var is inlined at build time by Next.js. Falls
    // back to relative `/api/trpc` so the request goes to the same origin.
    return process.env.NEXT_PUBLIC_TRPC_URL ?? DEFAULT_URL;
  }
  // SSR / server-side: relative URLs aren't legal in fetch on the server,
  // so we expand to the canonical site URL when needed.
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return process.env.NEXT_PUBLIC_TRPC_URL ?? `${origin}${DEFAULT_URL}`;
}

/**
 * React Query bindings. Components import:
 *   const { data } = trpc.corridor.preview.useQuery({...});
 *   const m = trpc.auth.requestOtp.useMutation();
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Build the headers for outgoing tRPC requests.
 *
 * Production: nothing extra — the SSR cookie set by /api/auth/
 * establish-session (P2) carries the Supabase JWT and packages/server
 * picks it up from the request once context.ts is wired to read it.
 *
 * Dev / preview: when `NEXT_PUBLIC_DEV_BEARER_TOKEN` is set we attach
 * `Authorization: Bearer <token>`. The packages/server context.ts
 * `_mockUserFor` resolver knows three demo tokens:
 *   - "demo-phone-only"     phone OTP done, identity not yet
 *   - "demo-fully-verified" passes fullyVerifiedProcedure
 *   - "demo-premium"        fully-verified + premiumActiveAt set
 *
 * Set the env var in `.env.local` to exercise /app/* surfaces locally
 * without standing up the full Supabase Auth path.
 */
export function buildAuthHeaders(): Record<string, string> {
  const devToken = process.env.NEXT_PUBLIC_DEV_BEARER_TOKEN;
  return devToken ? { Authorization: `Bearer ${devToken}` } : {};
}

/**
 * Vanilla client. Used by /signup mock-services replacement so the
 * existing call-sites stay imperative (page-by-page swap, no global
 * hook refactor required for Bucket 4 surfaces).
 */
export const trpcVanilla: TRPCClient<AppRouter> = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: getTrpcUrl(),
      headers: buildAuthHeaders,
      // Send credentials so the session cookie (Bucket 4 SignupShell sets
      // it post-OTP via Supabase Auth) reaches the API server.
      fetch(url, options) {
        return fetch(url, { ...options, credentials: "include" });
      },
    }),
  ],
});
