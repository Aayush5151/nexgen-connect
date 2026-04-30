/**
 * Import audit — the 5+1-class scan.
 *
 * Walks every committed .ts/.tsx file under mobile/ + packages/* and
 * verifies that:
 *   1. Every import (route, component, constant, type, primitive prop
 *      type) resolves to a path in `git ls-files`.
 *   2. Every forward route reference (router.push/replace/navigate,
 *      <Link href>) resolves to a route file in `git ls-files`.
 *
 * The "5+1" framing in the build prompt: 5 normal import classes + the
 * +1 forward-route-ref class. The +1 was added because PR #5 missed it
 * and shipped main with broken routes. This script is the durable fix.
 *
 * Critical: resolution is against `git ls-files`, not the disk. A file
 * that exists on disk but isn't tracked must NOT satisfy a reference —
 * a fresh clone wouldn't have it. This is the entire point.
 *
 * Exit codes:
 *   0 — all references resolve
 *   1 — broken references found (reported to stderr)
 *
 * Usage:
 *   npm run import-audit            # full repo audit
 *   npx tsx tools/import-audit.ts   # equivalent
 *   tsx tools/import-audit.ts --paths mobile/app  # narrow scan
 *
 * v6 build §24 (CI/CD discipline) / Build Prompt E1.
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync, statSync } from "node:fs";
import { dirname, join, resolve, relative, posix } from "node:path";

import ts from "typescript";

const REPO_ROOT = resolve(__dirname, "..");

/** Workspaces we audit. The tRPC server (Bucket 4) gets added when it lands. */
const AUDITED_WORKSPACES = ["mobile", "packages/copy", "packages/shared"];

/** Files in these directories are skipped (build outputs, vendor). */
const SKIP_DIRS = ["node_modules", ".expo", ".turbo", "android", "ios", "dist", "build"];

type TsConfigPaths = Record<string, string[]>;

interface WorkspacePaths {
  /** Absolute path to the workspace root. */
  root: string;
  /** TS path aliases mapped to absolute base dirs. */
  paths: Record<string, string[]>;
}

interface AuditResult {
  file: string;
  line: number;
  kind: "import" | "route";
  specifier: string;
  reason: string;
}

/* ------------------------------------------------------------------ */
/* git ls-files — the source of truth                                  */
/* ------------------------------------------------------------------ */

function gitLsFiles(): Set<string> {
  const out = execSync("git ls-files", { cwd: REPO_ROOT, encoding: "utf8" });
  return new Set(out.split("\n").filter(Boolean).map((p) => posix.normalize(p)));
}

const COMMITTED = gitLsFiles();

/** Returns true iff `relPath` (forward-slash, repo-relative) is committed. */
function isCommitted(relPath: string): boolean {
  return COMMITTED.has(posix.normalize(relPath));
}

/* ------------------------------------------------------------------ */
/* Workspace + tsconfig discovery                                      */
/* ------------------------------------------------------------------ */

function loadWorkspaces(): Map<string, WorkspacePaths> {
  const out = new Map<string, WorkspacePaths>();
  for (const ws of AUDITED_WORKSPACES) {
    const root = resolve(REPO_ROOT, ws);
    if (!existsSync(root)) continue;
    const tsconfigPath = join(root, "tsconfig.json");
    let paths: TsConfigPaths = {};
    let baseUrl = root;
    if (existsSync(tsconfigPath)) {
      const cfg = ts.parseConfigFileTextToJson(tsconfigPath, readFileSync(tsconfigPath, "utf8"));
      const compilerOptions = cfg.config?.compilerOptions ?? {};
      paths = compilerOptions.paths ?? {};
      if (compilerOptions.baseUrl) baseUrl = resolve(root, compilerOptions.baseUrl);
    }
    const expandedPaths: Record<string, string[]> = {};
    for (const [pattern, targets] of Object.entries(paths)) {
      expandedPaths[pattern] = targets.map((t) => resolve(baseUrl, t));
    }
    out.set(ws, { root, paths: expandedPaths });
  }
  return out;
}

const WORKSPACES = loadWorkspaces();

/* ------------------------------------------------------------------ */
/* Workspace package map — resolves @nexgen-connect/* to a workspace   */
/* ------------------------------------------------------------------ */

function buildPackageMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const ws of AUDITED_WORKSPACES) {
    const pkgPath = join(REPO_ROOT, ws, "package.json");
    if (!existsSync(pkgPath)) continue;
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as {
      name?: string;
      main?: string;
      exports?: unknown;
    };
    if (pkg.name) {
      const main = pkg.main ?? "src/index.ts";
      map.set(pkg.name, resolve(REPO_ROOT, ws, main));
    }
  }
  return map;
}

const PACKAGE_MAP = buildPackageMap();

/* ------------------------------------------------------------------ */
/* Resolution                                                          */
/* ------------------------------------------------------------------ */

const TS_EXTENSIONS = [".ts", ".tsx", ".d.ts"];

/** Try every TS extension + index variant. Returns the resolved
 *  absolute path if any candidate is committed, else null. */
function resolveTsCandidates(absBase: string): string | null {
  for (const ext of ["", ...TS_EXTENSIONS]) {
    const candidate = absBase + ext;
    const rel = relative(REPO_ROOT, candidate).split("\\").join("/");
    if (isCommitted(rel)) return candidate;
  }
  for (const ext of TS_EXTENSIONS) {
    const candidate = join(absBase, "index" + ext);
    const rel = relative(REPO_ROOT, candidate).split("\\").join("/");
    if (isCommitted(rel)) return candidate;
  }
  return null;
}

/** Resolve a TS-style import specifier from a given source file. */
function resolveImport(
  specifier: string,
  fromFile: string,
  workspace: WorkspacePaths,
): string | null {
  // External package — skip (tsc/jest will catch real misses).
  if (
    !specifier.startsWith(".") &&
    !specifier.startsWith("@/") &&
    !specifier.startsWith("@nexgen-connect/")
  ) {
    return "external";
  }

  // Workspace package: @nexgen-connect/copy etc.
  if (specifier.startsWith("@nexgen-connect/")) {
    const root = PACKAGE_MAP.get(specifier);
    if (root && existsSync(root)) {
      const rel = relative(REPO_ROOT, root).split("\\").join("/");
      return isCommitted(rel) ? root : null;
    }
    // Sub-path import: @nexgen-connect/shared/theme
    for (const [pkgName, mainAbs] of PACKAGE_MAP) {
      if (specifier.startsWith(pkgName + "/")) {
        const sub = specifier.slice(pkgName.length + 1);
        const pkgRoot = dirname(dirname(mainAbs));
        const candidate = resolve(pkgRoot, "src", sub);
        return resolveTsCandidates(candidate);
      }
    }
    return null;
  }

  // tsconfig path alias: @/foo → workspace.paths['@/*'] = [src]
  for (const [pattern, targets] of Object.entries(workspace.paths)) {
    if (pattern.endsWith("/*")) {
      const prefix = pattern.slice(0, -2);
      if (specifier.startsWith(prefix + "/")) {
        const sub = specifier.slice(prefix.length + 1);
        for (const target of targets) {
          const targetBase = target.endsWith("/*") ? target.slice(0, -2) : target;
          const candidate = resolve(targetBase, sub);
          const r = resolveTsCandidates(candidate);
          if (r) return r;
        }
      }
    } else if (specifier === pattern) {
      for (const target of targets) {
        const r = resolveTsCandidates(target);
        if (r) return r;
      }
    }
  }

  // Relative import.
  if (specifier.startsWith(".")) {
    const candidate = resolve(dirname(fromFile), specifier);
    return resolveTsCandidates(candidate);
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Forward route resolution (Expo Router)                              */
/* ------------------------------------------------------------------ */

/** mobile/app + the route → committed file? */
function resolveExpoRoute(routePath: string, mobileRoot: string): string | null {
  // Strip leading slash, leave group segments intact ("(app)" is real).
  let p = routePath.startsWith("/") ? routePath.slice(1) : routePath;
  // Drop trailing slash.
  if (p.endsWith("/")) p = p.slice(0, -1);
  const appDir = join(mobileRoot, "app");
  // Replace [param] segments with the literal substring; route files
  // in Expo Router use the literal "[param].tsx" filename so a routing
  // call like router.push("/profile/123") still maps to a file
  // app/profile/[id].tsx — but we cannot infer that mapping from the
  // string alone. Instead: we scan all committed [..] route files and
  // see if any pattern matches.
  const candidate = resolve(appDir, p);
  // Direct hit?
  const direct = resolveTsCandidates(candidate);
  if (direct) return direct;
  // [param] fuzzy match: walk app/ committed routes, collapse [..] to
  // a regex, and test the requested path.
  const segments = p.split("/").filter(Boolean);
  const candidates = [...COMMITTED]
    .filter((f) => f.startsWith("mobile/app/") && (f.endsWith(".tsx") || f.endsWith(".ts")))
    .filter((f) => !f.endsWith("_layout.tsx") && !f.endsWith("_layout.ts"));
  for (const f of candidates) {
    const fSegs = f
      .replace(/^mobile\/app\//, "")
      .replace(/\.(tsx|ts)$/, "")
      .split("/")
      .filter((s) => s !== "index");
    if (fSegs.length !== segments.length) continue;
    let ok = true;
    for (let i = 0; i < segments.length; i++) {
      const a = fSegs[i];
      const b = segments[i];
      if (!a) {
        ok = false;
        break;
      }
      if (a === b) continue;
      if (a.startsWith("[") && a.endsWith("]")) continue; // [param] match
      if (a.startsWith("[...") && a.endsWith("]")) continue; // catch-all
      ok = false;
      break;
    }
    if (ok) return resolve(REPO_ROOT, f);
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* AST walk                                                            */
/* ------------------------------------------------------------------ */

const ROUTER_METHODS = new Set(["push", "replace", "navigate"]);

function auditFile(absFile: string, workspace: WorkspacePaths): AuditResult[] {
  const src = ts.createSourceFile(
    absFile,
    readFileSync(absFile, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    absFile.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const issues: AuditResult[] = [];
  const isMobile = absFile.startsWith(resolve(REPO_ROOT, "mobile"));
  const mobileRoot = resolve(REPO_ROOT, "mobile");

  function getLine(node: ts.Node): number {
    return src.getLineAndCharacterOfPosition(node.getStart(src)).line + 1;
  }

  function visit(node: ts.Node): void {
    // imports + side-effect imports
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const spec = node.moduleSpecifier.text;
      const resolved = resolveImport(spec, absFile, workspace);
      if (resolved === null) {
        issues.push({
          file: relative(REPO_ROOT, absFile),
          line: getLine(node),
          kind: "import",
          specifier: spec,
          reason: "import target is not a committed file",
        });
      }
    }
    // dynamic import("…") + require("…")
    if (
      ts.isCallExpression(node) &&
      ((node.expression.kind === ts.SyntaxKind.ImportKeyword) ||
        (ts.isIdentifier(node.expression) && node.expression.text === "require"))
    ) {
      const arg = node.arguments[0];
      if (arg && ts.isStringLiteral(arg)) {
        const resolved = resolveImport(arg.text, absFile, workspace);
        if (resolved === null) {
          issues.push({
            file: relative(REPO_ROOT, absFile),
            line: getLine(node),
            kind: "import",
            specifier: arg.text,
            reason: "dynamic import target is not a committed file",
          });
        }
      }
    }
    // router.push("…") / router.replace / router.navigate
    if (
      isMobile &&
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.name) &&
      ROUTER_METHODS.has(node.expression.name.text)
    ) {
      const arg = node.arguments[0];
      let pathname: string | null = null;
      if (arg && ts.isStringLiteral(arg)) {
        pathname = arg.text;
      } else if (arg && ts.isObjectLiteralExpression(arg)) {
        for (const p of arg.properties) {
          if (
            ts.isPropertyAssignment(p) &&
            p.name &&
            ts.isIdentifier(p.name) &&
            p.name.text === "pathname" &&
            ts.isStringLiteral(p.initializer)
          ) {
            pathname = p.initializer.text;
            break;
          }
        }
      }
      if (pathname && pathname.startsWith("/")) {
        const resolved = resolveExpoRoute(pathname, mobileRoot);
        if (!resolved) {
          issues.push({
            file: relative(REPO_ROOT, absFile),
            line: getLine(node),
            kind: "route",
            specifier: pathname,
            reason: "router.* target is not a committed route file",
          });
        }
      }
    }
    // <Link href="…">
    if (
      isMobile &&
      ts.isJsxAttribute(node) &&
      node.name &&
      ts.isIdentifier(node.name) &&
      node.name.text === "href" &&
      node.initializer &&
      ts.isStringLiteral(node.initializer)
    ) {
      const pathname = node.initializer.text;
      if (pathname.startsWith("/")) {
        const resolved = resolveExpoRoute(pathname, mobileRoot);
        if (!resolved) {
          issues.push({
            file: relative(REPO_ROOT, absFile),
            line: getLine(node),
            kind: "route",
            specifier: pathname,
            reason: "<Link href=…> target is not a committed route file",
          });
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(src);
  return issues;
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

function main(): void {
  const issues: AuditResult[] = [];
  let scanned = 0;

  for (const [wsName, workspace] of WORKSPACES) {
    const wsRoot = resolve(REPO_ROOT, wsName);
    for (const file of COMMITTED) {
      if (!file.startsWith(wsName + "/")) continue;
      if (!file.endsWith(".ts") && !file.endsWith(".tsx")) continue;
      if (file.endsWith(".d.ts")) continue;
      if (SKIP_DIRS.some((d) => file.includes("/" + d + "/"))) continue;
      const abs = resolve(REPO_ROOT, file);
      if (!existsSync(abs) || !statSync(abs).isFile()) continue;
      scanned++;
      issues.push(...auditFile(abs, workspace));
      void wsRoot;
    }
  }

  if (issues.length === 0) {
    console.log(`import-audit: scanned ${scanned} committed file(s) — clean.`);
    process.exit(0);
  }

  console.error(`import-audit: ${issues.length} broken reference(s) across ${scanned} file(s):\n`);
  for (const i of issues) {
    console.error(`  ${i.file}:${i.line} [${i.kind}] ${i.specifier} — ${i.reason}`);
  }
  console.error(
    "\nFix: either commit the missing target, or correct the specifier. " +
      "A clean clone of `main` cannot resolve these.",
  );
  process.exit(1);
}

main();
