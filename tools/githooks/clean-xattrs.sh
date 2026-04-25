#!/usr/bin/env bash
# Strip macOS com.apple.provenance xattrs from .git/index and the
# working tree. Without this, git operations on this repo can hang
# indefinitely on macOS Sequoia/Sonoma because the kernel re-evaluates
# trust on every file with a provenance xattr.
#
# Symptom: `git add` / `git status` / `next dev` hang at near-zero CPU
# usage with .git/index.lock orphaned.
#
# Fix: drop the xattr. Git ops go from "hangs forever" to "milliseconds".
#
# Called from .git hooks (post-checkout / post-commit / post-merge /
# post-rewrite) and from `npm run fix-xattrs`. Idempotent — safe to run
# any time.
#
# Linux: a no-op (xattr binary missing or different semantics).
set -e
[ "$(uname -s)" = "Darwin" ] || exit 0
command -v xattr >/dev/null 2>&1 || exit 0

# Use $GIT_DIR (set by git when running hooks) or fall back to .git
# in $PWD. Avoid `git rev-parse` here — running git inside a hook
# adds latency and re-enters the very index whose xattrs we're
# trying to strip.
GD="${GIT_DIR:-.git}"
[ -d "$GD" ] || exit 0

# 1. The hot path: index. This is what makes git ops hang.
[ -e "$GD/index" ] && xattr -c "$GD/index" 2>/dev/null || true

# 2. Other .git internals that get touched on every operation.
for f in HEAD ORIG_HEAD FETCH_HEAD MERGE_HEAD COMMIT_EDITMSG config \
         packed-refs; do
  [ -e "$GD/$f" ] && xattr -c "$GD/$f" 2>/dev/null || true
done

# 3. refs/ + logs/ — touched during commits, pushes, branch ops.
[ -d "$GD/refs" ] && xattr -cr "$GD/refs" 2>/dev/null || true
[ -d "$GD/logs" ] && xattr -cr "$GD/logs" 2>/dev/null || true

# Skipping .git/objects/ on every hook (slow + read-only). Run
# `npm run fix-xattrs:full` for a deep clean if needed.
exit 0
