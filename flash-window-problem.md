# Flashing Terminal Window Problem — Diagnostic Summary

**Date:** 18 August 2026
**Machine:** Windows 11 Home (build 26200), Windows Terminal 1.24 installed

## Problem description (plain English)

From time to time, a terminal/console window briefly flashes open on the screen and
steals focus. If you are typing in another app (a note, a browser, anything), the
window suddenly jumps away and you have to click back — it is disruptive and confusing.
The flashes appear to repeat roughly every 20–60 seconds.

## What we confirmed

- **A scheduled task called `agent-ops-resmon` was launching PowerShell every 60 seconds.**
  This is confirmed from the Windows event log (PowerShell Event 40961 shows a new console
  host starting at the `:50` mark of every minute) and it matched the task's own
  last-run timestamp exactly.
- **The repeating spawn stopped immediately when the task was disabled** at 09:51:52.
  After that moment, no new PowerShell launches appear in the log. So `agent-ops-resmon`
  was the repeating console spawner.
- **OneDrive is NOT involved.** No OneDrive process, no OneDrive scheduled task, no
  OneDrive service, no uninstall-registry entry, and no OneDrive events in the last 500
  system log entries. Only an empty leftover folder remains:
  `%LOCALAPPDATA%\Microsoft\OneDrive` (harmless, can be deleted).
- **`agent-ops-resmon` has been DELETED from Task Scheduler** (18 Aug 2026, ~09:59) —
  removed, not just disabled. Verified gone.
- **Recreation risk:** `scripts\agent-ops\resmon.ps1 -Install` can recreate this exact
  task. Do not run that parameter unless you intentionally want the task back.
- The task's command line was:
  `powershell.exe -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "...\scripts\agent-ops\resmon.ps1" -Snapshot`
  (It already runs hidden; even so, Task Scheduler console launches can flash on Windows 11.)

## Not yet resolved / open leads

- Whether the flashes you *perceive* stop now needs your observation (2–3 minute test).
- **`PresentMonService.exe`** (a GPU/telemetry service) has a `conhost.exe` child — a
  service holding a console window is unusual and could be a second source of flashes.
  Its identity is unverified.
- **`SECOCL64.exe`** also holds a `conhost.exe` child — identity unverified.
- A scheduled task named **`Monitoring`** runs `%systemroot%\system32\hpatchmonTask.cmd`
  via `cmd.exe` with repeating triggers. It has not run recently, origin unknown, and has
  NOT been touched.
- Normal / expected console processes (not suspects): VSCode integrated terminal,
  the Cline agent shell (`cline.exe`), and **Wispr Flow Helper** (voice input — never disable).

## Safety notes

- Nothing else was deleted or installed. The one scheduled task was removed; it can be
  recreated only by running `scripts\agent-ops\resmon.ps1 -Install`.
- All diagnostics were read-only (event logs, process lists, registry reads).

## Update — 18 Aug 2026: crash cause + sweep results

- **Crash root cause found:** a single `git.exe` ate ~20 GB on the 16 GB machine, driving
  free RAM down to ~330 MB → Windows thrashed itself into a full lockup → SCM/DCOM
  timeouts at 09:24–09:27 → force-restart ~09:31–09:33. It was an agent/background git
  operation (likely `git add`/`gc`/`diff` touching `node_modules`/`.next`), not user
  action, not repo corruption — repo is healthy (git not running, .git = 265 MB packed).
  Evidence kept in `scripts\agent-ops\logs\ram-log.csv`.
- **Sweep results — nothing else dangerous:** `resmon.ps1` / `resmon.cmd` deleted, so the
  task cannot be recreated. No other task or autostart spawns console windows.
  `PresentMonService` = Intel Graphics Software telemetry, `SECOCL64` = Realtek/Sonic
  Studio audio, `Monitoring`/`hpatchmonTask.cmd` = Windows Hotpatch — all legitimate,
  persistent, no flashing.

