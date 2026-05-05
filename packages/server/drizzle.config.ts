/**
 * Drizzle Kit config — schema source-of-truth + introspection target.
 *
 * Reads POSTGRES_URL_NON_POOLING from the Vercel-Supabase Marketplace
 * integration (the direct, non-pooled URL is the right choice for
 * migration / introspection — pooled connections drop transactions
 * mid-flight on long DDL).
 *
 * Usage:
 *   # Generate migrations from schema.ts changes:
 *   drizzle-kit generate --config=packages/server/drizzle.config.ts
 *
 *   # Introspect the live DB (Mumbai project) and rewrite schema.ts.
 *   # This is the path that becomes canonical at staging cut-over per
 *   # D1 of v16-web-pivot-decisions.md — until then schema.ts is the
 *   # hand-curated source of truth (see schema.ts header).
 *   drizzle-kit pull --config=packages/server/drizzle.config.ts
 *
 * v16 web pivot §P1.a.
 */
import type { Config } from "drizzle-kit";

const url =
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.POSTGRES_URL ??
  "";

if (!url) {
  // Don't throw — drizzle-kit is sometimes invoked in environments
  // (e.g. CI typecheck) where the URL isn't needed for the operation
  // being run. Fail-closed only when the operation actually runs.
  console.warn(
    "[drizzle.config] POSTGRES_URL_NON_POOLING and POSTGRES_URL both unset. " +
      "Pull / push / migrate operations will fail until one is provided.",
  );
}

export default {
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url },
  // Tables that live in the Supabase-managed `auth.*` schema are not
  // ours to introspect — they're created by Supabase and we use them
  // via row-level security `auth.uid()` calls only.
  schemaFilter: ["public"],
  // Verbose so dry-runs surface every change before it lands.
  verbose: true,
  strict: true,
} satisfies Config;
