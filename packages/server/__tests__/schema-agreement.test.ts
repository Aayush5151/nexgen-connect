/**
 * Schema agreement test.
 *
 * Catches drift between the SQL migrations in `migrations/` and the
 * Drizzle types in `src/db/schema.ts`. This file is the source of
 * truth until staging cut-over (per D1 of v16-web-pivot-decisions.md);
 * if a developer adds a `create table` to a migration without adding
 * the matching `pgTable(...)` here, this test fails.
 *
 * The check is shallow:
 *   - Every `create table NAME (` in the migrations should map to a
 *     name in TABLES_IN_ORDER.
 *   - Every name in TABLES_IN_ORDER should appear in some migration.
 *
 * v16 web pivot §P1.a.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { TABLES_IN_ORDER } from "../src/db/schema";

const MIGRATIONS_DIR = join(__dirname, "..", "migrations");

function tablesInMigrations(): Set<string> {
  const found = new Set<string>();
  for (const file of readdirSync(MIGRATIONS_DIR)) {
    if (!file.endsWith(".sql")) continue;
    const content = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
    // Match `create table [if not exists] NAME (` — the `if not exists`
    // form lands in 0006 (audit_log_v16 alters but doesn't create).
    const re = /create\s+table\s+(?:if\s+not\s+exists\s+)?([a-z_][a-z0-9_]*)\s*\(/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(content)) !== null) {
      found.add(m[1].toLowerCase());
    }
  }
  return found;
}

describe("schema agreement", () => {
  test("every Drizzle table maps to a SQL `create table`", () => {
    const sqlTables = tablesInMigrations();
    const missing = TABLES_IN_ORDER.filter((t) => !sqlTables.has(t));
    expect({ missing }).toEqual({ missing: [] });
  });

  test("every `create table` in SQL has a Drizzle counterpart", () => {
    const sqlTables = tablesInMigrations();
    const drizzleSet = new Set(TABLES_IN_ORDER);
    const orphans = [...sqlTables].filter((t) => !drizzleSet.has(t));
    expect({ orphans }).toEqual({ orphans: [] });
  });

  test("TABLES_IN_ORDER has no duplicates", () => {
    const seen = new Set<string>();
    const dupes: string[] = [];
    for (const t of TABLES_IN_ORDER) {
      if (seen.has(t)) dupes.push(t);
      seen.add(t);
    }
    expect(dupes).toEqual([]);
  });
});
