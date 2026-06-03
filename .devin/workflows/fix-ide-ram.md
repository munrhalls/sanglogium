---
description: Diagnose and fix Windsurf language_server_windows_x64 RAM leak by evidence, not theory
---

# /fix-ide-ram - Language Server Memory Leak Fix

## Purpose
Fix Windsurf IDE lag / high RAM / high disk thrashing caused by `language_server_windows_x64` over-indexing. **Evidence-based.** No theories, no cache nukes, no workspace resets, no quarantining rules.

## Core Rule
**Measure first. Then fix the one thing that's actually big.** Do not follow generic "add node_modules to ignore" advice — that's already there. The real culprit is always something missing from `.codeiumignore` that nobody bothered to look for.

---

## Step 1: Confirm the culprit process (15 sec)

```powershell
Get-Process | Where-Object { $_.ProcessName -match "language_server|windsurf" } | Sort-Object WorkingSet64 -Descending | Select-Object ProcessName, Id, @{N="RAM_MB";E={[math]::Round($_.WorkingSet64/1MB,0)}} | Format-Table -AutoSize
```

- If `language_server_windows_x64` > 2000 MB → continue to Step 2.
- If a `Windsurf` renderer process is the hog (not the language server) → this workflow does not apply; check for bloated rules/memories instead.

---

## Step 2: Find the actual heavy directory (15 sec)

```powershell
Get-ChildItem -Directory -Force | ForEach-Object { $size = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum; [PSCustomObject]@{ Name=$_.Name; SizeMB=[math]::Round($size/1MB,1) } } | Sort-Object SizeMB -Descending | Select-Object -First 15 | Format-Table -AutoSize
```

Also scan for rogue single files:

```powershell
Get-ChildItem -Path . -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch "\\node_modules\\|\\\.git\\|\\\.next\\" } | Sort-Object Length -Descending | Select-Object -First 10 | Format-Table @{N="MB";E={[math]::Round($_.Length/1MB,2)}}, FullName -AutoSize
```

Common real culprits (none of these are in a default `.codeiumignore`):
- `scripts/**/venv/` or `**/.venv/` — Python virtualenvs (hundreds of MB of `.dll`/`.pyd`)
- `.git/` — large repos (100+ MB)
- `sanity/backups/*.json` — multi-MB JSON dumps
- `coverage/`, `.nyc_output/` — test coverage artifacts
- `storybook-static/`, `.turbo/`, `.cache/`
- Any `models/` or `weights/` folder (ML binaries)
- `*.sqlite`, `*.db`, large `*.log` files

---

## Step 3: Read current `.codeiumignore`

```powershell
Get-Content .codeiumignore -ErrorAction SilentlyContinue
```

**Do not assume what's in it.** Read it. Previous agents will confidently tell you to add things that are already there.

---

## Step 4: Patch `.codeiumignore`

Append the **actually-heavy** directories found in Step 2 that are missing from Step 3. Do not copy-paste a generic template.

`.gitignore` is NOT inherited by the language server. Each entry must be added to `.codeiumignore` explicitly.

Useful patterns:
```
# Python virtualenvs
**/venv/
**/.venv/
**/env/
**/__pycache__/
*.pyc
*.pyd
*.dll
# Git internals
.git/
# Backups and data dumps
sanity/backups/
**/backups/
# Test artifacts
coverage/
.nyc_output/
# Caches
.turbo/
.cache/
storybook-static/
# ML artifacts
**/models/
**/weights/
```

---

## Step 5: Restart the language server

```powershell
Stop-Process -Name "language_server_windows_x64" -Force -ErrorAction SilentlyContinue
```

Windsurf auto-respawns it with the new ignore list. `.codeiumignore` is only re-read on process start — editing the file is not enough by itself.

---

## Step 6: Verify (60 sec after restart)

```powershell
Get-Process language_server_windows_x64 | Select-Object Id, @{N="RAM_MB";E={[math]::Round($_.WorkingSet64/1MB,0)}}
```

- **Expected:** 300–1500 MB for a typical Next.js + Sanity repo.
- **If still > 2000 MB:** The theory is wrong for this case. Re-run Step 2 — a directory you missed is still being indexed. Do not move on to cache nukes or workspace resets until Step 2 shows nothing over ~50 MB missing from the ignore.

---

## Anti-Patterns (what NOT to do)

- ❌ Adding `node_modules/` / `.next/` to `.codeiumignore` without checking — they're already there in 99% of cases.
- ❌ Wiping `$env:USERPROFILE\.codeium\windsurf\cascade\*` — deletes your agent memory for no reason.
- ❌ Wiping `$env:APPDATA\Windsurf\User\workspaceStorage\*` — nukes your IDE session state.
- ❌ Renaming `.windsurf/` to `.windsurf_bak/` — breaks every slash command you have.
- ❌ Modifying `tsconfig.json` to add `exclude` — TypeScript server is rarely the language_server_windows_x64 process.
- ❌ Running builds / reinstalling node_modules "to clear caches."

## Success Criteria
- `language_server_windows_x64` RAM down to < 1500 MB.
- System RAM (Task Manager) drops noticeably.
- **No side-effect cleanups performed.**
- Fix was a single `.codeiumignore` edit + one process kill.
