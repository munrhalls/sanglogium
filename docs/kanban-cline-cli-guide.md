# Client Kanban + Cline CLI — One-Page Guide

The client kanban is the **beads** issue tracker (`.beads/` in this repo) rendered on a
zero-dependency board server. Source of truth = the beads Dolt DB, driven 100% from the
terminal with `bd`. The board (`http://localhost:3333`) is just a live window into it.

## The golden loop (learn this — it's everything)

```powershell
cd C:\webdev\sang-logium
bd q "Title"                                   # 1. add a card → prints ID (e.g. sang-logium-0br)
bd export -o .beads/issues.jsonl               # 2. refresh the export
bd ready                                       # 3. see what's open — the terminal IS the board
```

**Optional visual board** (watch agents work live, zero deps):

```powershell
cd C:\webdev\beads-kanban
node server.mjs --path C:\webdev\sang-logium   # → http://localhost:3333 (SSE live refresh)
```

**CLI writes, board displays.** Never hand-edit `.beads/issues.jsonl` — it is a generated
export. Write with `bd`, then re-export, and commit `.beads/issues.jsonl` alongside your code
changes (git's copy is a mirror, not the source of truth). The board live-refreshes via SSE
the instant the file changes (no page reload).

## Card lifecycle cheat sheet

| Want | Command |
|---|---|
| Quick card (prints ID only) | `bd q "Title"` |
| Card with fields | `bd create --type task --priority 1 --assignee you --labels "ui,test" --title "..." --description "..."` |
| See open work | `bd ready` / `bd list` |
| Read a card | `bd show <id>` |
| Claim + start it | `bd update <id> --claim` (assignee + `in_progress` in one step) |
| Move columns | `bd update <id> --status in_progress` · `--status blocked` · `--status done` |
| Add progress note | `bd note <id> "…"` or `bd update <id> --append-notes "…"` |
| Close it | `bd close <id>` |
| Refresh the board | `bd export -o .beads/issues.jsonl` (after every write) |

Statuses in use: `open` → `in_progress` → `closed` (`blocked` only for stuck cards). That's
all that's needed — every card moves exactly once. Board columns come from the real status
values found in the data — no separate setup. Task sizing (Difficulty → DoD) lives in commit
messages, not on cards.

## With Cline CLI terminal agents

`cline` runs headless from the terminal and can drive the exact same `bd` commands, so a
terminal agent creates, claims, updates, and closes cards end-to-end — no UI needed. You
watch it happen on the board in real time.

- One-shot add: `cline --json "Create a bd card for 'Fix checkout VAT bug' (type bug, priority 1), then run bd export"`
- Pull your queue: `cline --json "Run bd ready and summarize what's open"`
- Full agent pass (turn into a repeatable prompt):

```
1. bd q "<title>"                # create the card
2. bd export -o .beads/issues.jsonl
3. bd show <id>                  # read the spec
4. bd update <id> --claim        # agent takes the card (card moves to in_progress)
5. …do the work…
6. bd update <id> --append-notes "what was done + evidence"
7. bd update <id> --status done  # card lands in done on the board
8. bd export -o .beads/issues.jsonl
```

Every step 4–8 shows up on the board within a second (SSE auto-refresh) — terminal agents
become visible, remote-controllable workers.

## Resource discipline (this laptop, 16 GB)

- The board server is tiny (zero deps) and is **not** `next dev` — one board on `:3333` is fine,
  but only one of each shared service, ever.
- Never run `next build` + Playwright + vitest at once — take the token first:
  `scripts/agent-ops/build-lock.ps1 acquire -Owner <you>` … release when done.
- `bd` / `cline` calls are cheap; the Dolt DB is the slowest part (seconds per write). Batch
  `bd` writes, then a single `bd export` at the end — and commit `.beads/issues.jsonl` with
  the same change, so git's copy never drifts from the DB.
- If port 3333 is busy, the server auto-increments (`--port 3334` works too).


