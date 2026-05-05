/**
 * Web bundle-size gate — Bucket 11.
 *
 * Walks `web/.next/` after a production build, gzips each first-party
 * chunk, and asserts the per-route initial JS stays under budget.
 *
 * Budgets (from v16 §Bucket 11.3):
 *   Initial JS for /        ≤ 180 KB gzipped
 *   Initial CSS             ≤  30 KB gzipped
 *
 * Usage:
 *   cd web && npm run build
 *   npx tsx tools/web-bundle-size.ts            # warn-only
 *   npx tsx tools/web-bundle-size.ts --strict   # hard-fail past budget
 *
 * v16 web pivot §Bucket 11.3.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { gzipSync } from "node:zlib";

const REPO_ROOT = resolve(__dirname, "..");
const NEXT_DIR = join(REPO_ROOT, "web", ".next");

const BUDGET_INITIAL_JS_KB = 180;
const BUDGET_INITIAL_CSS_KB = 30;

type SizedAsset = { path: string; gzipKB: number };

function gzipKB(absPath: string): number {
  const buf = readFileSync(absPath);
  const gz = gzipSync(buf);
  return Math.round((gz.length / 1024) * 10) / 10;
}

function walk(dir: string, exts: Set<string>, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, exts, out);
    } else if (exts.has(extOf(entry))) {
      out.push(full);
    }
  }
  return out;
}

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i < 0 ? "" : name.slice(i);
}

function sumGzipKB(files: string[]): number {
  return files.reduce((s, f) => s + gzipKB(f), 0);
}

function fail(msg: string, strict: boolean) {
  if (strict) {
    console.error(`✗ ${msg}`);
    process.exit(1);
  }
  console.warn(`⚠ ${msg}`);
}

function ok(msg: string) {
  console.log(`✓ ${msg}`);
}

function main() {
  const strict = process.argv.includes("--strict");

  if (!existsSync(NEXT_DIR)) {
    console.error(`✗ ${NEXT_DIR} missing — run \`cd web && npm run build\` first.`);
    process.exit(1);
  }

  const staticDir = join(NEXT_DIR, "static");
  if (!existsSync(staticDir)) {
    console.error(`✗ ${staticDir} missing — incomplete build.`);
    process.exit(1);
  }

  // Walk all JS chunks and CSS in .next/static. The "initial JS" gate
  // is approximate — Next splits per-route — so we sum the framework +
  // main + all _app/_root chunks and call that the initial-JS payload
  // surface for the worst-case "/" landing.
  const jsFiles = walk(staticDir, new Set([".js"]));
  const cssFiles = walk(staticDir, new Set([".css"]));

  const initialJs: SizedAsset[] = jsFiles
    .filter((f) => /chunks\/(framework|main|webpack|app)/.test(f) || /chunks\/main-app/.test(f))
    .map((f) => ({ path: f, gzipKB: gzipKB(f) }));

  const initialCss: SizedAsset[] = cssFiles.map((f) => ({ path: f, gzipKB: gzipKB(f) }));

  const totalJsKB = initialJs.reduce((s, a) => s + a.gzipKB, 0);
  const totalCssKB = initialCss.reduce((s, a) => s + a.gzipKB, 0);

  console.log("Web bundle-size report");
  console.log("=======================");
  console.log(`Initial JS  : ${totalJsKB.toFixed(1)} KB gzipped (budget ${BUDGET_INITIAL_JS_KB} KB)`);
  console.log(`Initial CSS : ${totalCssKB.toFixed(1)} KB gzipped (budget ${BUDGET_INITIAL_CSS_KB} KB)`);
  console.log();

  // Print top 5 chunks for context.
  const allJs: SizedAsset[] = jsFiles
    .map((f) => ({ path: f, gzipKB: gzipKB(f) }))
    .sort((a, b) => b.gzipKB - a.gzipKB)
    .slice(0, 5);
  console.log("Top 5 JS chunks (gzipped):");
  for (const a of allJs) {
    console.log(`  ${a.gzipKB.toFixed(1).padStart(7)} KB  ${a.path.replace(REPO_ROOT, ".")}`);
  }
  console.log();

  // Wall-clock total of every JS chunk for context — informational only.
  const allJsTotal = sumGzipKB(jsFiles);
  console.log(`(All JS chunks combined: ${allJsTotal.toFixed(1)} KB gzipped)`);

  let allClear = true;
  if (totalJsKB > BUDGET_INITIAL_JS_KB) {
    fail(
      `Initial JS over budget: ${totalJsKB.toFixed(1)} > ${BUDGET_INITIAL_JS_KB} KB`,
      strict,
    );
    allClear = false;
  } else {
    ok(`Initial JS under budget`);
  }
  if (totalCssKB > BUDGET_INITIAL_CSS_KB) {
    fail(
      `Initial CSS over budget: ${totalCssKB.toFixed(1)} > ${BUDGET_INITIAL_CSS_KB} KB`,
      strict,
    );
    allClear = false;
  } else {
    ok(`Initial CSS under budget`);
  }

  if (!allClear && strict) process.exit(1);
}

main();
