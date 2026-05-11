/**
 * Drizzle client — postgres-js driver.
 *
 * Reads `POSTGRES_URL` from env (the Vercel-Supabase Marketplace
 * integration sets this for production + preview). The pooled URL
 * (`POSTGRES_URL`, port 5432 with pgbouncer) is right for serverless
 * functions; the non-pooled URL (`POSTGRES_URL_NON_POOLING`) is for
 * `drizzle-kit` migration / introspection only.
 *
 * Three modes:
 *   - Production / preview: returns a real Drizzle client backed by
 *     postgres-js connected to the Mumbai Supabase project.
 *   - Dev (POSTGRES_URL unset): returns a stub that throws on use,
 *     with a helpful message pointing the developer at
 *     `vercel env pull` to set up the connection string.
 *   - Tests: import `db` and inject a postgres-js mock; the
 *     production path stays untouched.
 *
 * v16 web pivot §P1.a.
 */
import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
// `postgres` ships its own types in 3.x but some installs in this
// monorepo don't surface them through hoisting. The runtime import
// still works; suppress only the missing-declaration warning.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- TS7016 declaration file missing on some installs.
import postgres from "postgres";
import * as schema from "./schema";

let cached: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (cached) return cached;

  const url = process.env.POSTGRES_URL;
  if (!url) {
    throw new Error(
      "[db] POSTGRES_URL not set — run `vercel env pull` from a linked project, " +
        "or set the env var manually. The Vercel-Supabase Marketplace integration " +
        "auto-populates this for production and preview deploys.",
    );
  }

  // postgres-js connection options:
  //   - prepare: false works around pgbouncer's transaction-pooler mode,
  //     which doesn't support prepared statements
  //   - max: 1 keeps each Vercel Function invocation to a single connection
  //     so we don't blow the connection-pool ceiling
  //   - idle_timeout: 20 closes idle conns aggressively (Fluid Compute
  //     reuses instances, but a dropped pool conn between invocations
  //     leaks slots)
  const sql = postgres(url, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
  });

  cached = drizzle(sql, { schema });
  return cached;
}

/**
 * Re-export the schema namespace so callers can do:
 *   import { getDb, verifiedUser } from "@nexgen-connect/server/db";
 */
export * from "./schema";
