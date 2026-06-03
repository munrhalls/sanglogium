**Title:** Windsurf language_server_windows_x64 RAM leak — `.codeiumignore` is independent of `.gitignore`
**Date:** 2026-04-24
**Source:** sang-logium repo, 11-hour debugging session with 4–5 previous agents failing

## What Happened
`language_server_windows_x64` climbed to 5,838 MB RAM, pushing system RAM to 78–90%. Previous agents gave 4+ wrong theories (merged rules, workspace state corruption, cache corruption, tsconfig scope) and prescribed destructive "fixes" (wipe `.codeium/windsurf/cascade/*`, wipe `workspaceStorage/*`, rename `.windsurf/`, reinstall). None worked.

Actual fix took one `.codeiumignore` edit and one `Stop-Process` — ~90 seconds total.

## Root Cause
`.codeiumignore` did not list the actually-heavy directories in the repo:
- `scripts/image-pipeline/venv/` (Python virtualenv, **604 MB** of `.dll`/`.pyd` binaries — `llvmlite.dll` alone was 101 MB)
- `.git/` (269 MB)
- `sanity/backups/*.json` (12 MB of JSON)

The Windsurf language server reads `.codeiumignore` **independently of `.gitignore`**. The repo's `.gitignore` correctly excluded `venv/` but that had zero effect on the indexer. Previous agents never verified this — they assumed one implies the other.

## Prevention
**Before prescribing any fix for Windsurf RAM issues:**

1. Run `Get-Process language_server_windows_x64 | Select Id, @{N="RAM_MB";E={[math]::Round($_.WorkingSet64/1MB,0)}}` — confirm which process is actually the leak.
2. Run directory-size measurement (`Get-ChildItem -Directory | ForEach-Object { ... }`) — find what's actually big.
3. Run `Get-Content .codeiumignore` — read what's already ignored. Never assume.
4. Patch only what's missing. Kill the language server. Done.

**Never** apply these without evidence, they did nothing but cost hours in this case:
- Wiping `~/.codeium/windsurf/cascade/*` or `implicit/*` or `indexer/*`
- Wiping `%APPDATA%\Windsurf\User\workspaceStorage\*`
- Renaming `.windsurf/` or `.windsurfrules`
- Editing `tsconfig.json` exclude array
- Reinstalling node_modules

## Key Facts
- `.codeiumignore` ≠ `.gitignore`. Both must be maintained separately for the language server.
- `.codeiumignore` changes require a language server restart to take effect (edit + `Stop-Process`).
- The process auto-respawns — no need to relaunch Windsurf.
- "Cleanup" suggestions that delete state/cache/rules are almost always wrong for this symptom.

## When to Apply
- Windsurf lagging, slow chat responses, system-wide slowdown.
- Task Manager shows `language_server_windows_x64` > 2 GB.
- System RAM > 75% with no other heavy apps running.
- After adding a new heavy directory to the repo (Python venv, ML models, large JSON dumps, coverage output).

## Workflow
`/fix-ide-ram` — see `.windsurf/workflows/fix-ide-ram.md`
