#!/usr/bin/env bash
#
# Clean-clone simulation — runs before every PR push.
#
# Spec from Build Prompt §Discipline rules:
#   cd /tmp && rm -rf nexgen-test && git clone <repo> nexgen-test \
#     && cd nexgen-test && npm install && npm run lint && npm run typecheck \
#     && npm run test
#   Must exit 0.
#
# Why: the audit before P3 caught two classes of broken-state bugs the
# normal "tsc passes locally" check could not — a fresh clone with no
# cached node_modules and no working-tree files is the only honest
# signal that committed code can actually run on someone else's machine
# (and on Vercel CI). Running this before every PR push closes the
# class of bug that PRs #5/#6/#8 shipped.
#
# Usage:
#   bash tools/clean-clone-verify.sh                # local repo source
#   REPO_URL=<url> bash tools/clean-clone-verify.sh # remote source
#
# v6 build §24 / Build Prompt E3.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TEMP_DIR="${TMPDIR:-/tmp}/nexgen-clean-clone-$$"
SOURCE="${REPO_URL:-$REPO_ROOT}"

cleanup() {
  if [ -d "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
  fi
}
trap cleanup EXIT

echo "==> clean-clone-verify"
echo "    source:  $SOURCE"
echo "    target:  $TEMP_DIR"
echo

# 1. Fresh clone (local-source path uses --shared --no-hardlinks for speed
#    but the working-tree checkout is fresh).
echo "==> [1/5] git clone"
if [ -d "$SOURCE/.git" ]; then
  git clone --quiet --shared --no-hardlinks "$SOURCE" "$TEMP_DIR"
else
  git clone --quiet "$SOURCE" "$TEMP_DIR"
fi

cd "$TEMP_DIR"

# 2. npm install — non-deterministic deps slip past `npm ci` warnings, but
#    `npm install` is what a contributor actually runs.
echo "==> [2/5] npm install"
npm install --no-audit --no-fund --silent 2>&1 | tail -5 || true

# 3. Import audit — the 5+1-class scan must pass on the fresh clone.
echo "==> [3/5] import-audit"
npx --yes tsx tools/import-audit.ts

# 4. Mobile-scoped lint + typecheck. Per Build Prompt E3 the gate
#    enforced before every push is mobile-only — web is a separate
#    workstream per A1. Web lint is the web team's gate, run on web's
#    Vercel deploy.
echo "==> [4/5] mobile lint + typecheck"
( cd mobile && npm run lint && npm run typecheck )

# 5. Tests (--passWithNoTests in workspaces without tests yet).
echo "==> [5/5] mobile test"
( cd mobile && npm run test )

echo
echo "==> clean-clone-verify: PASS"
