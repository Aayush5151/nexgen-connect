#!/usr/bin/env bash
# Manual rescue: strip macOS com.apple.provenance xattrs from the
# entire repo. Use this if git starts hanging again, or after a fresh
# clone. The git hooks in tools/githooks/ keep .git/ clean on every
# operation; this script extends the cleanup to the working tree
# (which is what makes Node / Next.js dev server hang too).
#
# Pass --full to also strip xattrs from .git/objects (slow — many
# thousands of read-only loose objects). Default skips it because
# objects are immutable and only matter for clone-time operations.
#
# Linux: a no-op.
set -e

[ "$(uname -s)" = "Darwin" ] || { echo "skip: non-Darwin"; exit 0; }
command -v xattr >/dev/null 2>&1 || { echo "skip: xattr missing"; exit 0; }

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO_ROOT"

FULL=0
[ "${1:-}" = "--full" ] && FULL=1

echo "Stripping com.apple.provenance from $REPO_ROOT"

# .git/ — always
xattr -c .git/index 2>/dev/null || true
for f in .git/HEAD .git/ORIG_HEAD .git/FETCH_HEAD .git/MERGE_HEAD \
         .git/COMMIT_EDITMSG .git/config .git/packed-refs; do
  [ -e "$f" ] && xattr -c "$f" 2>/dev/null || true
done
[ -d .git/refs ] && xattr -cr .git/refs 2>/dev/null || true
[ -d .git/logs ] && xattr -cr .git/logs 2>/dev/null || true
[ -d .git/hooks ] && xattr -cr .git/hooks 2>/dev/null || true
[ -d .git/info ] && xattr -cr .git/info 2>/dev/null || true

# Working tree — covers files Next.js reads (src/, public/, configs).
# Skipping node_modules: huge, non-trivial speedup gain, and a fresh
# `npm install` re-applies xattrs anyway.
for d in src public app pages tools; do
  [ -d "$d" ] && xattr -cr "$d" 2>/dev/null || true
done
for f in package.json package-lock.json next.config.ts tsconfig.json \
         vercel.json postcss.config.mjs eslint.config.mjs \
         instrumentation.ts next-env.d.ts; do
  [ -e "$f" ] && xattr -c "$f" 2>/dev/null || true
done

# --full: also walk .git/objects/. Most objects are mode 0444
# (read-only by design), so xattr -c may print "Permission denied"
# warnings. They are harmless — the existing xattrs on those
# read-only objects do not slow git in practice because git only
# reads them, never re-writes them. We try anyway in case any are
# writable.
if [ "$FULL" = "1" ]; then
  echo "  + .git/objects (deep, may print harmless permission warnings)"
  [ -d .git/objects ] && xattr -cr .git/objects 2>/dev/null || true
  echo "  + node_modules (deep — go grab a coffee)"
  [ -d node_modules ] && xattr -cr node_modules 2>/dev/null || true
fi

echo "done"
