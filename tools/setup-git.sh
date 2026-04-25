#!/usr/bin/env bash
# One-shot repo setup: configure git for fast operations on macOS
# Sequoia/Sonoma where com.apple.provenance xattrs make every default-
# stat git operation hang.
#
# Run automatically by `npm install` (postinstall) and manually via
# `npm run setup-hooks`. Idempotent.
set -e

if [ ! -d .git ]; then
  exit 0
fi

# 1. Disable fsmonitor — it adds latency and re-enters the index on
#    every command, multiplying provenance-check cost.
git config core.fsmonitor false

# 2. core.checkStat=minimal — the actual fix for git hangs. With the
#    default ("default"), git compares st_size, st_mtime, st_ctime,
#    st_uid, st_gid, st_ino, and st_dev for every working-tree entry
#    on every status / commit / diff. On macOS Sequoia / Sonoma each
#    of those stat reads can trigger a trust-evaluation on files
#    carrying com.apple.provenance, which can take minutes per
#    operation. "minimal" only checks st_size and st_mtime, which is
#    plenty for change detection and skips the slow path.
git config core.checkStat minimal

# 3. Wire repo-local hooks for ongoing maintenance (best-effort xattr
#    cleanup after each git op).
git config core.hooksPath tools/githooks

echo "git configured: fsmonitor=false, checkStat=minimal, hooksPath=tools/githooks"
