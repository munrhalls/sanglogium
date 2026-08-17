# AGENTS.md -- Resource Discipline Rules (sang-logium)

Every agent working in this repo MUST follow these rules. They exist so multiple agents can work on one 16 GB laptop without it lagging. **Wispr Flow (voice input) is mandatory -- never kill or disable it.**

## Non-negotiable

1. **One shared dev server** at `http://localhost:3000`. NEVER run `npm run dev` yourself if port 3000 is already listening. Check first: `Test-NetConnection localhost -Port 3000`. If none, ask the human or use `scripts/agent-ops/services.ps1`.
2. **One shared browser**: Chrome CDP on port 9222. Reuse it. Never launch a second Chrome for automation.
3. **Heavy work needs the build token**: run `scripts/agent-ops/build-lock.ps1 acquire -Owner <your-name>` BEFORE `next build`, full Playwright suites, full vitest runs, or full `tsc`. Release when done (`release`). Never hold it while idling.
4. **Never run two CPU-heavy tools at the same time** (build + playwright + vitest concurrently is forbidden). Wait for the lock.
5. **No `npm install` without asking** -- it thrashes the near-full disk and CPU. Use `npm ci --no-audit --no-fund` only if approved.
6. **Prefer `next build` + `next start` verification** over `next dev` hot-reload when possible. For quick checks, curl the shared server.
7. **End sessions cleanly**: no leftover watch processes (`tsc --watch`, browsers). If you started it, you stop it.

## Context economy (do more with less)

- Use search tools (`rg` / codebase search) FIRST; read each file ONCE; never dump entire large files to the terminal.
- Batch file reads together. Skip re-reading unchanged files.
- Scratch files go to a temp dir, NEVER the repo root. Do not leave probe-*.mjs / out-*.txt / screenshots lying around.
- If free RAM is tight, run `scripts/agent-ops/resource-health.ps1` and share the snapshot before starting heavy work.

## Never do

- Kill/disable Wispr Flow (voice input -- mandatory).
- Start a second `next dev`, second CDP browser, or run build + tests concurrently.
- `git clean -xdf`, `npm cache clean`, or delete `.next` while a server runs.
- Leave background browsers running at session end.
- Hold the build lock while not actively running a heavy task.
