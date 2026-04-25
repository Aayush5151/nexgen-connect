# Git hooks — macOS provenance xattr maintenance

Best-effort cleanup hooks that try to strip `com.apple.provenance`
xattrs from `.git/` after every git operation. **Note:** on most
macOS Sequoia/Sonoma installs the provenance xattr is kernel-
restricted and `xattr -c` can no longer remove it from user space.
The actual fix that makes git fast on this repo is set in
`tools/setup-git.sh`:

1. `git config core.checkStat = minimal` — the load-bearing one.
   Stops git from checking st_ctime / st_uid / st_gid / st_ino on
   every working-tree file. That is what triggers the slow
   trust-evaluation cascade on files with com.apple.provenance.
2. `git config core.fsmonitor = false` — fsmonitor re-enters the
   index on every command and multiplies the cost.
3. `core.hooksPath = tools/githooks` — wires up these hooks.

Run `npm run setup-hooks` (or `npm install`) to apply. Postinstall
runs the same script so a fresh clone is auto-configured.

## Files

- `clean-xattrs.sh` — best-effort xattr stripper called by the hooks.
- `post-commit`, `post-checkout`, `post-merge`, `post-rewrite` —
  thin wrappers that invoke `clean-xattrs.sh`.

## Symptom recognition

Git hangs at near-zero CPU? `next dev` start hangs after the npm
header? `.git/index.lock` keeps reappearing after you remove it?
Almost certainly the provenance-xattr / checkStat issue. Run:

```bash
bash tools/setup-git.sh
```

That's the permanent fix. If you cloned this repo and skipped
`npm install`, this is the one command to run.

## Manual rescue (working tree)

If `next dev` is also slow (not just git), the working-tree files
have provenance xattrs slowing every read. Strip them:

```bash
npm run fix-xattrs        # quick — just .git/
npm run fix-xattrs:full   # deeper — also walks node_modules and
                          # .git/objects (slow, only if needed)
```

## Strongest fix (system-level, optional)

Granting your terminal app (Terminal.app / iTerm / Ghostty / your
IDE) **Full Disk Access** in System Settings → Privacy & Security
stops macOS from applying provenance xattrs to files modified by
trusted processes. If you do that, the repo-level `core.checkStat`
fix becomes belt-and-braces rather than load-bearing.

Alternatively, moving the repo out of `~/Documents/` (which is in
macOS's "managed" privacy boundary) into `~/code/` or `~/dev/`
sidesteps the issue entirely — provenance tracking is much lighter
outside the protected directories.

## Linux / CI

`clean-xattrs.sh` and `setup-git.sh` are no-ops on non-Darwin
systems. Safe to commit and run on CI without conditional gating.
