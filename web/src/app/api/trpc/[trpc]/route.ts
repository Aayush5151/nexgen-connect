/**
 * tRPC fetch-adapter handler — mounts the @nexgen-connect/server
 * appRouter at /api/trpc inside the web app.
 *
 * Why mount in web instead of relying on packages/server's :4000 dev
 * server: a single-deployment story (one Vercel project, one origin)
 * keeps cookies/auth simpler in P2 and removes a CORS surface. Per
 * docs/v16-web-pivot-decisions.md §A3 a separate API project may land
 * later for the mobile/admin clients; until then web ships the API.
 *
 * Force Node.js runtime — middleware uses crypto.randomUUID and other
 * Node APIs.
 *
 * v16 web pivot §P1.b.
 */
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@nexgen-connect/server/server/router";
import { createContext } from "@nexgen-connect/server/server/context";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req as never),
    onError({ path, error }) {
      console.error(`[trpc/web] ${path ?? "<no-path>"}: ${error.message}`);
    },
  });

export { handler as GET, handler as POST };

export const runtime = "nodejs";
