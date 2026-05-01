/**
 * Bundle-size measurement.
 *
 * Build Prompt §Bucket 9 budget: < 1.8 MB JS gzipped, < 2 MB critical.
 *
 * Strategy: walk mobile's exported bundle (from `npx expo export
 * --platform ios`), gzip it, measure, compare to threshold. Reports
 * warn-only by default; --strict makes overflows exit 1.
 *
 * Usage:
 *   # First, generate a bundle:
 *   cd mobile && npx expo export --platform ios --dev
 *   # Then check it from repo root:
 *   npm run bundle-size                  # warn-only
 *   npm run bundle-size -- --strict      # hard-fail past threshold
 *
 * Thresholds match perf-budget.md targets. Production-build numbers
 * (post-EAS Build) will differ — production strips dev-mode code +
 * minifies, so dev-mode numbers are an upper bound.
 *
 * v6 build §22, §24 / Build Prompt Bucket 9.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { gzipSync } from "node:zlib";

const REPO_ROOT = resolve(__dirname, "..");
const TARGET_MB = 1.8;
const CRITICAL_MB = 2.0;

function findBundles(): { platform: string; path: string }[] {
  const exportDirs = [
    join(REPO_ROOT, "mobile", "dist", "_expo", "static", "js", "ios"),
    join(REPO_ROOT, "mobile", "dist", "_expo", "static", "js", "android"),
  ];
  const found: { platform: string; path: string }[] = [];
  for (const dir of exportDirs) {
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir)) {
      if (file.endsWith(".hbc") || file.endsWith(".bundle") || file.endsWith(".js")) {
        found.push({ platform: dir.includes("/ios") ? "ios" : "android", path: join(dir, file) });
      }
    }
  }
  return found;
}

function measureGzipped(filepath: string): { raw: number; gzipped: number } {
  const raw = readFileSync(filepath);
  const gzipped = gzipSync(raw);
  return { raw: raw.length, gzipped: gzipped.length };
}

function mb(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}

function main(): void {
  const strict = process.argv.includes("--strict");
  const bundles = findBundles();
  if (bundles.length === 0) {
    console.log(
      "bundle-size: no exported bundles found. Run `cd mobile && npx expo export --platform ios --dev` first.",
    );
    console.log("Skipping (warn).");
    process.exit(0);
  }

  console.log("Bundle              Platform   Raw size      Gzipped       vs target");
  console.log("-".repeat(85));

  let anyOverflow = false;
  for (const b of bundles) {
    const stat = statSync(b.path);
    if (!stat.isFile()) continue;
    const { raw, gzipped } = measureGzipped(b.path);
    const ratio = gzipped / 1024 / 1024 / TARGET_MB;
    const status =
      gzipped > CRITICAL_MB * 1024 * 1024
        ? "✗ CRITICAL"
        : gzipped > TARGET_MB * 1024 * 1024
          ? "⚠ over target"
          : "✓ ok";
    if (gzipped > TARGET_MB * 1024 * 1024) anyOverflow = true;
    const filename = b.path.split("/").pop()?.padEnd(20) ?? "<unknown>";
    console.log(
      `${filename}${b.platform.padEnd(11)}${mb(raw).padEnd(14)}${mb(gzipped).padEnd(14)}${(ratio * 100).toFixed(0)}% ${status}`,
    );
  }

  console.log("");
  console.log(`Targets: ${TARGET_MB} MB target, ${CRITICAL_MB} MB critical (gzipped JS).`);

  process.exit(anyOverflow && strict ? 1 : 0);
}

main();
