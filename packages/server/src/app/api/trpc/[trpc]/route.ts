/**
 * tRPC fetch-adapter handler — Next.js App Router route.
 *
 * Single endpoint for every domain procedure (auth, verification,
 * corridor, chat, premium, parent, trustSafety, groupApply,
 * mentalHealth, scams, admin) — tRPC handles the path → procedure
 * resolution.
 *
 * Production deploys to a dedicated Vercel project per A3 of the
 * decisions doc:
 *   nexgen-connect-api.vercel.app/api/trpc/<procedure>
 *
 * Mobile points at this via EXPO_PUBLIC_TRPC_URL.
 *
 * v6 build §11 / Build Prompt Bucket 4.
 */
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/router";
import { createContext } from "@/server/context";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req as never),
    onError({ path, error }) {
      // Already mapped to E0XX by the error-mapping middleware. Log
      // server-side so Vercel captures the trace.
      console.error(`[trpc] ${path ?? "<no-path>"}: ${error.message}`);
    },
  });

export { handler as GET, handler as POST };

// Force Node.js runtime — middleware uses crypto.randomUUID and other
// Node APIs. Per A2: read node_modules/next/dist/docs/ before assuming
// Edge runtime APIs.
export const runtime = "nodejs";
