# Agent Resource Discipline — Field Manual

> The goal: 3–4 agents, no lag, always under 70% RAM. This machine is a 15 W ultra-low-power
> laptop (2 fast cores, 16 GB RAM, 90%+ full SSD). Discipline is not optional here — it IS the system.
> Wispr Flow is the voice layer and is **always** kept running.

## 1. The doctrine (one sentence)

Everything must earn its place: **no duplicate toolchains, one heavy task at a time,
no background bloat during sessions, and every leak caught by the watchdog before it becomes lag.**

## 2. The numbers to hit

| Metric | Target | How enforced |
|---|---|---|
| Free RAM during session | ≥ 2 GB | `watchdog.ps1` alerts below 2 GB |
| RAM used total | ≤ 70% (~11 GB) | budget table in `config.ps1` |
| Concurrent dev servers | 1 | `services.ps1` (port 3000 reuse) |
| Concurrent CDP browsers | 1 | `services.ps1` (port 9222 reuse) |
| Concurrent heavy tasks | 1 | `build-lock.ps1` |
| Auto-start apps | only Wispr + system | `bloat.ps1 off` |
| Free disk | ≥ 15% | cleanup at setup; keep it that way |

## 3. Session SOP (the daily loop)

### START (2 min)
```powershell
cd C:\webdev\sang-logium
powershell -ExecutionPolicy Bypass -File scripts\agent-ops\start-session.ps1
powershell -ExecutionPolicy Bypass -File scripts\agent-ops\services.ps1 status
# if dev/browser missing, start ONE of each:
powershell -ExecutionPolicy Bypass -File scripts\agent-ops\services.ps1 start-dev
powershell -ExecutionPolicy Bypass -File scripts\agent-ops\services.ps1 start-browser
# baseline should show >= 6 GB free BEFORE agents start
```

### DURING (the loop)
```powershell
# heavy task? take the token first:
powershell -ExecutionPolicy Bypass -File scripts\agent-ops\build-lock.ps1 acquire -Owner <agent>
# ...run build / playwright / vitest / tsc-full...
powershell -ExecutionPolicy Bypass -File scripts\agent-ops\build-lock.ps1 release -Owner <agent>
```
- Watchdog in a spare terminal: `watchdog.ps1 -IntervalSeconds 30`
- Free RAM < 2 GB → stop an agent, restart the browser, drop a heavy task — in that order.
- Restart the shared browser every 2–3 h (renderers leak). `services.ps1 stop-browser` + `start-browser`.

### END (1 min)
```powershell
powershell -ExecutionPolicy Bypass -File scripts\agent-ops\end-session.ps1 -StopSharedServices
# optionally add: -KillBloatOnExit
```
- Browsers never survive the night. `logs\ram-log.csv` is your session diary — review it when something felt slow.

## 4. The rules (hard)

1. Agents never start their own `next dev`, second browser, or `tsc --watch`. They reuse shared services.
2. One heavy task at a time, always behind the build token.
3. Wispr Flow is never killed or disabled (voice input is mandatory).
4. No `npm install` without the human — disk is nearly full and installs thrash it.
5. Verify with `next build` + `next start` (or curl the shared server), not dev hot-reload.
6. Agents never leave scratch files in the repo root; no leftover watch processes.
7. If an agent exceeds its memory budget (see `config.ps1`), restart it — don't tolerate creep.

## 5. One-time setup prep

### Already done (by agent on 2026-08-16; reg backups in `scripts\agent-ops\backup\`)
- [x] Killed running bloat (Teams, Omen, WhatsApp, OverlayHelper… ~250 MB freed at the time)
- [x] Disabled 12 HKCU auto-start entries (non-destructive `_OFF_` renames)
- [x] npm cache cleaned; temp files > 7 days removed; recycle bin emptied
- [x] High-Performance power plan active
- [x] Toolkit scripts created + smoke-tested (start-session, end-session, services, watchdog,
      build-lock, bloat, resource-health, setup-elevated, config)
- [x] `AGENTS.md` written at repo root — every agent reads these rules

### Needs elevation — run ONCE, then confirm:
```powershell
powershell -ExecutionPolicy Bypass -File C:\webdev\sang-logium\scripts\agent-ops\setup-elevated.ps1
```
(accept the UAC prompt — it self-elevates). This adds Defender exclusions for `C:\webdev` +
node_modules (kills the silent scan tax), disables HP/Omen services, disables HKLM startup
entries (KeePass preload, Riot Vanguard tray), and re-asserts the power plan.

### Recommended manual (5 min)
- Task Manager → Startup: confirm only Wispr Flow + system remain.
- Free disk: aim for +40 GB (stale Playwright browser builds, old `node_modules`, `cleanmgr`).
  Your C: had only ~32 GB free.
- If you don't game on this PC: uninstall Riot Vanguard (kernel-level resident).

## 6. Cloud usage with Cline (research summary)

You don't need 4 agents on this laptop. Split the work:

| Pattern | Command | When |
|---|---|---|
| **Headless CLI (zero UI)** | `cline --json "task"` / `git diff \| cline "review"` | Scripts, CI, one-shot reviews |
| **Scheduled agents** | `cline schedule create "PR summary" --cron "0 9 * * 1-5" --prompt "…" --workspace <repo>` | Daily/weekly recurring work, runs without a terminal (hub) |
| **Agent Teams (coordinator + specialists)** | `cline --team-name <name> "task"` (state in `~/.cline/data/teams/<name>/`, resume anytime) | Complex multi-step features |
| **Kanban (many agents, cloud-friendly)** | `npx kanban` — per-card git worktrees, auto-commit, dependency chains | Parallel batch work |
| **Kanban on a cloud box** | Tailscale + `kanban --host 0.0.0.0`, or SSH tunnel, or Docker | Heavy parallel runs off this laptop |
| **Subagents (read-only, parallel)** | enabled by default — ask "use subagents to explore X" | Codebase research without heavy context |
| **Checkpoints** | on by default; shadow git repo per tool call | Safety net for auto-approve; disable if huge repo slows Cline |

Key flags to save memory/tokens: `--thinking low|medium` (default medium), `-t --timeout <s>`,
`--data-dir` for isolated state, `CLINE_COMMAND_PERMISSIONS` to restrict commands.
Auto-approve safe reads: Settings → Auto Approve → "Read project files".
**Recommended topology on this PC:** 2 heavy agents locally (shared services + build token) +
cloud/CI for parallel batches + subagents for research. That is how 4 lanes of work fit under 70%.

## 7. More quality & progress, fewer resources

- **One verification loop, not N.** Build once → `next start` → agents curl `:3000`. Dev hot-reload per agent is the #1 multiplier.
- **Playwright lean mode:** headless, `--workers=1`, trace/video off unless debugging. Reuse the shared CDP browser.
- **TypeScript:** `tsc --noEmit --incremental` (tsbuildinfo already exists) instead of `--watch` loops.
- **Context economy (in AGENTS.md):** search before read, batch reads, never cat huge files, no terminal dumps.
- **Serialization beats parallel-thrash:** 2 agents building simultaneously are BOTH slower than 1 at a time (2 P-cores). The build token is speed, not a slowdown.
- **Leak discipline:** browser restart every 2–3 h; kill `tsc --watch` at session end; watchdog flags the creep.
- **Cost discipline:** ClinePass ($9.99/mo) gives 2–5× usage on open models; `--thinking low/medium` cuts latency + tokens.

## 8. Troubleshooting cheat sheet

| Symptom | Likely cause | Fix |
|---|---|---|
| PC lags | free RAM < 2 GB | `resource-health.ps1` → restart browser → drop agent → check `ram-log.csv` |
| Agent eats 2+ GB | leak / runaway loop | restart the agent; note it in the log |
| Slow disk I/O | C: nearly full | free space; move caches |
| `setup-elevated.ps1` UAC cancelled | — | re-run; nothing was changed |
| 2 builds run at once | lock ignored | `build-lock.ps1 force-release` + retrain the agent |
| OverlayHelper can't be killed | protected HP process | ignore (~25 MB) or disable via elevated setup |

## 9. Script reference

| Script | Purpose |
|---|---|
| `resource-health.ps1` | One-shot RAM/top-10/ports snapshot (`-Json` for agents) |
| `watchdog.ps1` | 30 s loop → `logs\ram-log.csv`, alerts on budget breach |
| `services.ps1` | One shared `next` (:3000) + one CDP browser (:9222) |
| `build-lock.ps1` | acquire/release/force-release/status heavy-task token |
| `start-session.ps1` | kill bloat (Wispr-safe) + baseline snapshot |
| `end-session.ps1` | after-action + optional service stop |
| `bloat.ps1` | `off` / `on` / `status` for bloat startups + processes |
| `setup-elevated.ps1` | one-time UAC: Defender exclusions, service disables, HKLM startup |
| `config.ps1` | budgets, bloat list, ports — tune here |

