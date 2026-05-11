The One Thing — and the Full Domino Path
Why the current fix is incomplete
The Opus agent was right that .codeiumignore was the proximate cause — the language server was indexing 604 MB of Python DLLs. Fixing that dropped RAM from 78% → 51%. But the data from the second spike (98% RAM, 100% disk, same session) proves that .codeiumignore alone is not sufficient. Here's why:
The language server has a confirmed unbounded memory leak. The .tmp files inside its implicit/ cache directory accumulate across sessions and are never garbage collected — the server loads all of them into Go heap memory on startup. Deleting files older than one day reduced one user's cache from 44 GB to 525 MB. GitHub
In other words: even with a perfect .codeiumignore, the language server will leak because of its own internal cache architecture. The ignore fix only slows the leak — it doesn't stop it.

The One Thing
Clear the Codeium language server's implicit cache directory.
This is the single action that makes everything else easier or irrelevant, because:

It addresses the structural leak (not just the symptom)
It's reversible — the cache rebuilds from scratch, correctly this time, respecting your now-correct .codeiumignore
It takes ~2 minutes
It doesn't touch your code, workflows, or IDE settings

Command to run (PowerShell, Windsurf closed):
powershell# 1. Close Windsurf completely first (File > Exit, not just close window)
# 2. Kill any lingering language server
Stop-Process -Name "language_server_windows_x64" -Force -ErrorAction SilentlyContinue

# 3. Check and measure the cache BEFORE deleting (so you can verify)
$cachePath = "$env:USERPROFILE\.codeium\windsurf"
Get-ChildItem $cachePath -Recurse -ErrorAction SilentlyContinue | 
  Measure-Object -Property Length -Sum | 
  Select-Object @{N="TotalMB";E={[math]::Round($_.Sum/1MB,1)}}

# 4. Delete the implicit cache (NOT the whole .codeium folder — preserve your auth/settings)
Remove-Item "$cachePath\database" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$cachePath\implicit" -Recurse -Force -ErrorAction SilentlyContinue

# 5. Optionally also clear Cascade chat history if RAM still high after restart
# WARNING: this deletes your conversation history
# Remove-Item "$cachePath\cascade" -Recurse -Force -ErrorAction SilentlyContinue
The official Windsurf docs confirm that clearing C:\Users\<YOUR_USERNAME>\.codeium\windsurf\cascade fixes memory issues related to chat history accumulation, but warns it removes your conversation history. Windsurf

The Full Domino Path (ordered)
These are the steps in order. Each one either solves the problem or gives you the information needed for the next step. Do not skip ahead.
Step 1 — Measure before touching anything
powershellGet-ChildItem "$env:USERPROFILE\.codeium\windsurf" -Recurse -ErrorAction SilentlyContinue | 
  Measure-Object -Property Length -Sum | 
  Select-Object @{N="TotalMB";E={[math]::Round($_.Sum/1MB,1)}}
If this returns > 500 MB, the implicit cache is bloated. This confirms you're hitting the known leak.
Step 2 — Close Windsurf fully, kill the language server, delete the cache
Run the commands above. This is the One Thing. Reopen Windsurf. Wait 2 minutes for re-indexing.
Step 3 — Verify the .codeiumignore is still intact
The previous agent verified this on Apr 24. Confirm the file hasn't been touched since then and still includes **/venv/, scripts/image-pipeline/venv/, sanity/backups/, .git/, node_modules/.
Step 4 — Measure RAM after clean start
powershellGet-Process language_server_windows_x64 | Select-Object Id, @{N="RAM_MB";E={[math]::Round($_.WorkingSet64/1MB,0)}}
Expected: 300–800 MB. If it's there → you're done. If it spikes past 3 GB within an hour → go to Step 5.
Step 5 — If still leaking: set up a periodic kill task
One proven workaround is a watchdog that monitors the language server's memory every 10 seconds and force-kills it when it exceeds a threshold — Windsurf auto-restarts it, resetting the leak. GitHub This is the fallback if the architectural leak persists after cache clearing:
powershell# Create a scheduled task that kills the language server if it exceeds 4 GB
# (Windsurf auto-respawns it — clean slate each time)
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument `
  "-WindowStyle Hidden -Command `"
  \$p = Get-Process language_server_windows_x64 -ErrorAction SilentlyContinue;
  if (\$p -and \$p.WorkingSet64 -gt 4GB) { Stop-Process -Name language_server_windows_x64 -Force }
  `""
$trigger = New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Minutes 10) -Once -At (Get-Date)
Register-ScheduledTask -TaskName "WindsurfMemoryGuard" -Action $action -Trigger $trigger -RunLevel Highest
Step 6 — If disk is still 100%: check for .tmp file accumulation in the project itself
The Codeium Visual Studio issues confirm that .tmp files are created on every file save and never deleted automatically Answer Overflow. Search your project root:
powershellGet-ChildItem . -Recurse -Filter "*.tmp" -ErrorAction SilentlyContinue | 
  Measure-Object | Select-Object Count
If thousands of .tmp files exist in the project tree, they need to be deleted and excluded from future indexing.
Step 7 — Nuclear option if all else fails
A confirmed last resort: the embedding_database.sqlite file at ~/.codeium/windsurf/database/<hash>/ can grow to 2+ GB stale and cause startup ballooning. Delete it to force a clean rebuild. GitHub This is different from the implicit cache — it's the semantic embedding database. Deleting it forces a full re-index from zero, which takes longer but gives you a known-clean state.

Why this keeps happening after the code reorganization
The reorganization is the root trigger, but not in the way previous agents thought. When you moved folders, deleted files, and restructured the repo, the language server's incremental index (the .tmp snapshots) became inconsistent with the actual filesystem. The .tmp files are incremental snapshots that never get consolidated or deleted — the server loads all of them into Go heap memory on startup. GitHub After a reorganization, these stale snapshots compound with new indexing runs, causing the cache to balloon far beyond what a stable codebase would generate. The .codeiumignore fix was correct but only addressed the incoming file set — the backlog of stale snapshots from before the fix was still loaded into memory.
Start with Step 1 and 2. Everything else is either a verification or a contingency.