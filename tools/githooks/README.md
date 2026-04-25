# Git hooks — macOS provenance xattr maintenance

These hooks strip the `com.apple.provenance` extended attribute from
`.git/` after every git operation. Without this, git on macOS
Sequoia / Sonoma can hang indefinitely on `git add`, `git commit`,
and even `next dev` because the kernel re-evaluates "trusted process"
status for every file carrying the xattr.

Wired up via `core.hooksPath = tools/githooks` in the repo's
`.git/config`. Run `npm run setup-hooks` to install on a fresh clone.

## Files

- `clean-xattrs.sh` — the script the hooks call. Idempotent.
  Strips xattrs from `.git/index`, `.git/HEAD`, `.git/refs/`, etc.
- `post-commit`, `post-checkout`, `post-merge`, `post-rewrite` —
  thin wrappers that invoke `clean-xattrs.sh`.

## Manual rescue

If git starts hanging again (e.g., after a fresh clone or if hooks
were skipped), run:

```bash
npm run fix-xattrs        # quick — just .git/
npm run fix-xattrs:full   # deeper — also strips src/ and public/
```

Or drop straight to the underlying command:

```bash
xattr -c .git/index
```

## Permanent system-level fix (alternative)

Granting your terminal app **Full Disk Access** in System Settings
→ Privacy & Security stops macOS from applying provenance xattrs
to files modified by trusted processes. If you do that, these hooks
become a no-op safety net rather than a necessity.

## Linux / CI

The script is a no-op on non-Darwin systems, so committing it is
safe for CI runners and Linux contributors.
