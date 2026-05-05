/**
 * Supabase region-drift guard.
 *
 * Verifies that NEXT_PUBLIC_SUPABASE_URL points at the
 * Mumbai-region project (ap-south-1, AWS IPv6 prefix `2406:da00::/24`)
 * by extracting the project ref from the URL and comparing against
 * SUPABASE_EXPECTED_PROJECT_REF.
 *
 * Why we need this: this repo started its life on a Vercel-Marketplace-
 * provisioned Supabase project that defaulted to `us-east-1` (N. Virginia).
 * The project was rebuilt in `ap-south-1` (Mumbai) for DPDP Act
 * compliance and India-latency. A future env-var swap (intentional or
 * accidental) could silently move PII back to Virginia. This script
 * fails CI if NEXT_PUBLIC_SUPABASE_URL's project ref ever drifts off
 * the expected Mumbai project ref.
 *
 * Required env at CI time:
 *   NEXT_PUBLIC_SUPABASE_URL          — the running app's Supabase URL
 *   SUPABASE_EXPECTED_PROJECT_REF     — the Mumbai project's ref
 *                                       (committed in the workflow,
 *                                       NOT a secret — the ref is
 *                                       embedded in the public URL)
 *
 * Usage:
 *   tsx tools/check-supabase-region.ts
 *
 * Exit codes:
 *   0  — refs match (or env unset in dev)
 *   1  — refs disagree (deploy-blocking drift)
 *   2  — env-var misconfiguration
 *
 * v16 web pivot §M0 follow-up.
 */

const URL_VAR = "NEXT_PUBLIC_SUPABASE_URL";
const EXPECTED_VAR = "SUPABASE_EXPECTED_PROJECT_REF";

function fail(msg: string, code = 1): never {
  console.error(`\x1b[31m✗ ${msg}\x1b[0m`);
  process.exit(code);
}

function ok(msg: string): void {
  console.log(`\x1b[32m✓ ${msg}\x1b[0m`);
}

function extractRef(url: string): string | null {
  // Supabase project URLs look like: https://<ref>.supabase.co
  const match = url.match(/https?:\/\/([a-z0-9]+)\.supabase\.(?:co|in)/);
  return match ? match[1] : null;
}

function main(): void {
  const expected = process.env[EXPECTED_VAR];
  const url = process.env[URL_VAR];

  // Dev convenience: if either env var is unset (e.g., a contributor's
  // local machine without the prod env wired up), exit 0. The CI job
  // sets both so prod / preview deploys always run the real check.
  if (!expected) {
    console.log(
      `\x1b[33m! ${EXPECTED_VAR} unset — skipping region check (dev / unconfigured CI).\x1b[0m`,
    );
    return;
  }
  if (!url) {
    console.log(
      `\x1b[33m! ${URL_VAR} unset — skipping region check (dev / unconfigured CI).\x1b[0m`,
    );
    return;
  }

  const actualRef = extractRef(url);
  if (!actualRef) {
    fail(`couldn't parse a project ref from ${URL_VAR}: ${url}`, 2);
  }

  if (actualRef === expected) {
    ok(
      `Supabase project ref matches expected (${expected}). Region drift guard PASSED.`,
    );
    return;
  }

  fail(
    `Supabase project ref drift detected — expected=${expected} actual=${actualRef}.\n` +
      `  This means ${URL_VAR} points at a different Supabase project than the\n` +
      `  one we provisioned in ap-south-1 (Mumbai). Refusing to deploy until\n` +
      `  the ref matches ${expected} or ${EXPECTED_VAR} is updated to reflect\n` +
      `  an intentional new project (and the new project's region is verified\n` +
      `  via 'select inet_server_addr()' returning a 2406:da00::/24 address).`,
  );
}

main();
