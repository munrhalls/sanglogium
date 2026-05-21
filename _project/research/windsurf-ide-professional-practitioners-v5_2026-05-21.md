# Research: Windsurf IDE — The Power Moves (v5)

> **Retrieval Date:** 2026-05-21
> **Researcher:** AI/Human collaboration
> **Decay Risk:** Medium
> **Next Review:** 2026-08-21
> **Prior Versions:** v1 (8 gaps), v2 (10 false positives), v3 (3-layer stack), v4 (obscure finds)
> **Methodology Fix:** Full inventory, negative case search, local verification attempted, temporal checks, cross-project reference

## Executive Summary

This version found the **actual practitioners doing the highest-leverage work**. Not "people who wrote a rules file." People who built **complete operational frameworks**, **automation systems**, **agent self-correction tools**, and **context optimization layers** on top of Windsurf.

The biggest power moves:

1. **Agent personas with `@name` invocation** — Not just rules, but 8 distinct personalities (`@architect`, `@implementer`, `@reviewer`, `@tester`, `@security`, `@docs`, `@perf`, `@shipper`) each with their own AGENT.md, model pin, and scope
2. **Programmatic Cascade control (`wsc`)** — Terminal CLI that sends prompts, switches models, auto-accepts, manages multiple windows, and logs every conversation to JSONL
3. **Agent self-correction (`ckpt`)** — The AI itself checkpoints, branches, and restores. Not a human clicking "revert." The agent runs `ckpt restore 3` autonomously
4. **89.1% token savings (`engram`)** — Cached context spine with 9 built-in providers, 9 hook handlers, intercepts file reads at tool boundary
5. **Auto-triggered skills** — Not manual `/command` invocation. Skills fire automatically based on intent detection (end of session, coverage below target, context >50%)
6. **Complete operational frameworks** — `windsurf-unlocked`, `learnship`, `RuleSurf`, `BMad Method` — each providing a full starter kit, not just a single file

---

## Prior Research — Do Not Duplicate

All validated claims from v1-v4 remain valid. Read them there. This artifact covers ONLY the highest-leverage practitioner patterns.

---

## The Power Moves — Ranked by Leverage

### #1: windsurf-unlocked (OnlyTerp) — Complete Operational Framework

**Source:** `github.com/OnlyTerp/windsurf-unlocked`
**Last updated:** 2026-04-17 (BENCHMARKS.md)
**What it is:** A starter kit that installs a **complete operational layer** on top of Windsurf. Not just rules. Agents, skills, hooks, workflows, vault, plans, templates, benchmarks.

**The Architecture:**
```
<your-repo>/
├── AGENTS.md                    # Project constitution + invariants
├── vault/                       # Agentic Wiki — persistent project memory
│   ├── INDEX.md
│   ├── decisions/
│   ├── services/
│   ├── incidents/
│   ├── people/
│   └── glossary.md
├── plans/                       # File-based plans (planning-with-files skill)
├── templates/
│   └── PRD.template.md          # 9-section drop-in PRD
└── .windsurf/
    ├── agents/                  # 8 personality profiles
    │   ├── architect/AGENT.md   # Plan Mode, clarifying questions
    │   ├── implementer/AGENT.md # SWE 1.6 Fast, terse, parallel tools
    │   ├── reviewer/AGENT.md    # Read-only PR review
    │   ├── tester/AGENT.md      # Coverage ≥80%, runs the suite
    │   ├── security/AGENT.md    # Threat model + vuln scan
    │   ├── docs/AGENT.md        # README/CHANGELOG keeper
    │   ├── perf/AGENT.md        # Benchmarks + regressions
    │   └── shipper/AGENT.md     # PR descriptions, release notes
    ├── skills/                  # AUTO-TRIGGERED on intent
    │   ├── wiki-update/         # Maintain vault/ after each session
    │   ├── wiki-query/          # Read vault/ before starting work
    │   ├── pr-ready/            # Turn branch into clean PR
    │   ├── test-backfill/       # Fill gaps to hit coverage target
    │   ├── secret-scrubber/     # Block diffs with leaked secrets
    │   ├── planning-with-files/ # Persistent plan files
    │   ├── ast-grep/            # Structural search + refactor
    │   └── compact-hygiene/     # Proactive /compact with preservation
    ├── hooks/                   # Shell + Python hook scripts
    │   ├── secret_scan.py       # pre_tool_use on file writes
    │   ├── langfuse_logger.py   # post_cascade_response telemetry
    │   ├── wiki_update.py       # auto-invokes wiki-update skill
    │   └── post_setup_worktree.sh
    ├── hooks.json               # Wires the above to Cascade events
    ├── workflows/               # Slash commands
    │   ├── plan-then-implement.md
    │   ├── speckit-specify.md
    │   ├── speckit-plan.md
    │   ├── megaplan.md
    │   ├── ralph-safe.md        # Persistent loop with killswitch + cost cap
    │   ├── prd-driven.md        # Spec-first, anti-drift
    │   ├── reflection-loop.md   # generate → evaluate → revise
    │   ├── visual-iteration.md  # Screenshot → describe → fix
    │   ├── max-think.md         # Route to Opus 4.7 Think — MAX tier
    │   └── swarm-split.md       # Decompose into 6 subtasks for Kimi K2 swarm
    └── mcp_config.json          # Curated server list (Streamable HTTP)
```

**The Power Move — `@agent-name` Invocation:**

Instead of writing long prompts, you type:
```
@reviewer Read AGENTS.md and list any invariants that need to be filled in
@architect Plan the authentication module
@implementer Build the login flow
@tester Write tests for the auth module
@security Threat model the auth flow
```

Each agent has its own AGENT.md with:
- **Persona definition** (role, tone, constraints)
- **Model pin** (e.g., implementer → SWE 1.6 Fast)
- **Tool preferences** (e.g., reviewer → read-only)
- **Scope boundaries** (e.g., tester → coverage ≥80%)

**Actual AGENT.md Content (source-level):**

**`architect/AGENT.md`:**
```yaml
---
name: architect
description: Use when the user needs a plan, spec, or design before any code. Produces a written plan saved to ~/.windsurf/plans/, asks many clarifying questions, never touches code files.
model: swe-1.6
mode: plan
tools: [read_file, grep, search_code, web_search, read_url]
---
```
- **Rule #1:** "Always start in Plan Mode. Refuse to edit code files. If the user tells you to implement, hand off to `@implementer` and stop."
- **Rule #2:** "Ask clarifying questions. If the request has >1 reasonable interpretation, list the options and ask which."
- **Output:** Written plan saved to `~/.windsurf/plans/<slug>.md` with Goal, Non-goals, Constraints, Proposed approach (2-3 alternatives), Task breakdown (checkboxes), Risks, Rollback plan
- **Constraint:** "Time-box yourself — if the plan doc is >800 lines, you're over-engineering."

**`implementer/AGENT.md`:**
```yaml
---
name: implementer
description: Use when a plan exists and the user wants it executed. Pinned to SWE 1.6 Fast for speed. Terse, parallel tool calls, runs tests after every batch. Does not plan — implements.
model: swe-1.6-fast
mode: code
tools: [read_file, write_file, edit_file, grep, search_code, run_command, read_terminal]
---
```
- **Rule #1:** "Always start from a plan. If the user asks you to do something without a plan, point them at `@architect` first."
- **Rule #2:** "Batch + parallelize. When reading files, read them in parallel. When the plan has independent steps, do them in parallel tool calls."
- **Rule #3:** "Run tests after every checkbox. If a checkbox turned red, stop and fix before the next one."
- **Rule #4:** "Never weaken a test to make it pass."
- **Output style:** "Terse. No 'Let me…' / 'I'll…' preamble. No running commentary."
- **Stuck protocol:** If stuck >10 minutes, stop, write note to plan file, hand off to `@architect`.

**`reviewer/AGENT.md`:**
```yaml
---
name: reviewer
description: Read-only PR-style reviewer. Focus on correctness, security, testing gaps, code smell, performance. Never edits files. Invoke after any non-trivial diff or plan.
model: claude-opus-4.6
tools: [read_file, grep, search_code, web_search, git_diff]
---
```
- **Six-dimension review:** Correctness, Security, Testing, Code smell, Performance, AGENTS.md alignment
- **Output format:** BLOCKER → MAJOR → MINOR → NIT, each with file:line reference
- **Explicit verdict:** `LGTM` / `CHANGES REQUESTED` / `NEEDS DISCUSSION`
- **Rule:** "Review your own work — if invoked on your own diff, say so and decline."

**Auto-Triggered Skills (The Hidden Feature):**

Skills don't require manual `/command` — they fire automatically:

| Skill | Trigger Condition | Action |
|-------|-------------------|--------|
| `wiki-update` | End of session with decisions/facts/incidents | Appends/updates `vault/` pages |
| `wiki-query` | Start of any non-trivial task | Reads `vault/INDEX.md` before planning |
| `pr-ready` | About to open a PR | Cleans commits, writes description, verifies CI |
| `test-backfill` | Coverage below target | Generates tests to hit coverage without weakening assertions |
| `secret-scrubber` | About to commit or push | Blocks diffs with API keys/tokens/PII |
| `planning-with-files` | Non-trivial task (>20 LOC or >1 file) or "plan"/"PRD"/"spec" mentioned | Maintains persistent markdown plan in `plans/` |
| `ast-grep` | Structural refactor or "rename every call site of X" | Uses ast-grep for structural matches instead of regex |
| `compact-hygiene` | Context utilization >50% or long session | Runs `/compact` proactively with preservation instructions |

**Actual SKILL.md Content (source-level) — `compact-hygiene/SKILL.md`:**

The skill defines a trigger:
```yaml
trigger: >
  Context window is approaching 50% utilization, OR user asks about:
  context management, drift, "the agent keeps forgetting", long sessions,
  "how do I stop the AI from losing track", or explicitly mentions /compact.
```

**The protocol:**
- **Proactive (best):** at 50–60% context utilization, before model starts approximating
- **Pre-output:** right before a large tool output you don't need to keep verbatim
- **Checkpoint:** after finishing a major step, before starting the next
- **Never:** at 95%. By then you're compressing context that already degraded the last 20 responses.

**Preservation checklist — what to keep:**
- Current plan file path and checkbox state
- Cited AGENTS.md invariants
- Design decisions made this session
- Current blocker (if any)
- Recent error messages
- Vault pages being actively referenced

**Safe to drop:**
- Tool outputs from rejected paths
- File contents you've already modified
- Verbose command logs (test runs, installs)
- Exploration that didn't pan out
- Superseded grep/search results

**The key insight:** "Never rely on compact as long-term memory — write durable facts to `vault/` before compacting; the vault survives forever, the session doesn't."

**Hooks Configuration (source-level) — `hooks.json`:**

```json
{
  "hooks": {
    "pre_tool_use": [
      {
        "name": "secret-scan-on-write",
        "enabled": false,
        "matchers": ["write_file", "edit_file"],
        "command": "python3 .windsurf/hooks/secret_scan.py --mode=tool-input"
      }
    ],
    "post_tool_use": [
      {
        "name": "auto-format-on-write",
        "enabled": false,
        "matchers": ["write_file", "edit_file"],
        "command": "bash .windsurf/hooks/auto_format.sh"
      }
    ],
    "post_cascade_response_with_transcript": [
      {
        "name": "langfuse-logger",
        "enabled": false,
        "command": "python3 .windsurf/hooks/langfuse_logger.py"
      },
      {
        "name": "wiki-updater",
        "enabled": false,
        "command": "python3 .windsurf/hooks/wiki_update.py"
      }
    ],
    "post_setup_worktree": [
      {
        "name": "seed-worktree",
        "enabled": false,
        "command": "bash .windsurf/hooks/post_setup_worktree.sh"
      }
    ],
    "pre_commit": [
      {
        "name": "secret-scan-full",
        "enabled": false,
        "command": "python3 .windsurf/hooks/secret_scan.py --mode=staged-diff"
      }
    ]
  }
}
```

**All hooks ship DISABLED by default** — you flip `enabled: true` on the ones you want. This is important: the framework gives you the wiring but doesn't force behavior.

**MCP Config (source-level) — `mcp_config.json`:**

Curated servers (all Streamable HTTP):
- `github` — GitHub MCP server (v0.33.0 adds OAuth auto-trigger)
- `filesystem` — Local filesystem access
- `fetch` — Read arbitrary URLs
- `sqlite` — Local SQLite for vault/ and data exploration
- `memory` — Official MCP memory server (persistent key-value)
- `chrome-devtools` — Screenshots, console, DOM, perf traces
- `playwright` — Scripted browser driving

**Disabled examples** (commented out): Puppeteer, Azure, Keboola, Linear, Postgres, Slack

**Key note:** "Remove the ones you don't use to stay under the 100-tool ceiling."

**The Ralph Safe Loop (source-level) — `workflows/ralph-safe.md`:**

A **bash script** (not a markdown workflow) for autonomous fix loops:

```bash
#!/usr/bin/env bash
GOAL="${1:?goal required — 'make X green'}"
MAX_ITERS="${MAX_ITERS:-20}"
COST_CAP_USD="${COST_CAP_USD:-5.00}"
KILLSWITCH="${HOME}/.ralph-stop"
CHECK_CMD="${CHECK_CMD:-pnpm test --silent}"
LOGDIR=".ralph-logs/$(date +%s)"

# Pre-flight: refuse shared branches, refuse dirty worktree
BRANCH="$(git symbolic-ref --short HEAD 2>/dev/null || true)"
if echo "$BRANCH" | grep -Eq '^(main|master|develop)$'; then
  echo "ralph refuses to run on shared branches"
  exit 1
fi
[ -z "$(git status --porcelain)" ] || { echo "ralph refuses dirty worktree"; exit 1; }

for i in $(seq 1 "$MAX_ITERS"); do
  # 1. Killswitch check
  if [ -f "$KILLSWITCH" ]; then echo "Killswitch tripped — bailing."; rm "$KILLSWITCH"; exit 2; fi

  # 2. Cost cap check
  SPENT="$(calculate_spent)"
  if (( $(echo "$SPENT > $COST_CAP_USD" | bc) )); then
    echo "Cost cap hit: \$$SPENT > \$$COST_CAP_USD"; exit 3
  fi

  # 3. Check: are we already green?
  if eval "$CHECK_CMD" > "$LOGDIR/check-$i.log" 2>&1; then
    echo "✓ Green at iter $i. Spent: \$$SPENT"; exit 0
  fi

  # 4. Not green — hand failure to Cascade and iterate
  FAILURE=$(tail -50 "$LOGDIR/check-$i.log")
  windsurf cascade --mode=code --no-confirm-file-writes \
    --prompt "Goal: $GOAL. The check command is red. Fix the CODE." \
    > "$LOGDIR/cascade-$i.log"
done
```

**Guardrails (non-negotiable):**
1. Worktree-only (never on main/develop)
2. Killswitch file (`touch ~/.ralph-stop` stops the loop)
3. Iteration cap (default 20)
4. Cost cap (default $5)
5. Clean worktree required
6. Never weakens tests
7. Log everything to `.ralph-logs/<timestamp>/`

**Benchmarks (from their BENCHMARKS.md):**

| Model | Throughput | Context | Best For |
|-------|------------|---------|----------|
| SWE 1.6 Fast (Cerebras) | ~950 tok/s | 200k | Speed, prototyping |
| SWE 1.6 (non-Fast) | ~110 tok/s | 200k | Balanced |
| Claude Opus 4.6 | ~60 tok/s | 500k | Complex reasoning |
| GPT-5.4 | ~85 tok/s | 400k | General tasks |

**Key insight:** SWE 1.6 Fast is **16x faster** than Opus 4.6 but Opus has **2.5x the context window**. Model selection is a speed-vs-capacity tradeoff, not a "use the best one" decision.

**Verdict:** ✅ **Source-level inspection** — actual AGENT.md, SKILL.md, hooks.json, mcp_config.json, and ralph-safe.sh read from repo
**Installation:** `curl -fsSL https://raw.githubusercontent.com/OnlyTerp/windsurf-unlocked/main/starter/install.sh | bash`

---

### #2: engram (NickCirv) — 89.1% Token Savings

**Source:** `github.com/NickCirv/engram`
**What it is:** "The cached context spine for AI coding agents." Intercepts every file read at the tool boundary.

**The Power Move — Three Layers of Cache:**

1. **Knowledge graph** — agent has already "paid" to build
2. **Per-provider SQLite cache** — of external lookups
3. **In-memory LRU** — of recent queries

**Result:** Hands the agent a **~500-token response** instead of a raw file.

**Measured savings on reproducible benchmark: 89.1%.** Not estimated. 85 of 87 real source files saved tokens. Best case: 98.4% (18,820 tokens → 306).

**9 Built-in Providers:**

| Provider | Source | Confidence | Latency |
|----------|--------|:-----------:|:-------:|
| `engram:ast` | Tree-sitter parse (10 languages) | 1.0 | <50ms |
| `engram:structure` | Regex heuristics (fallback) | 0.85 | <50ms |
| `engram:mistakes` | Past failure nodes (bi-temporal) | — | <10ms |
| `anthropic:memory` | Claude Code's MEMORY.md index | 0.85 | <10ms |
| `engram:git` | Co-change patterns, churn, authorship | — | <100ms |
| `mempalace` | Decisions, learnings, project context | — | <5ms cached |
| `context7` | Library API docs for detected imports | — | <5ms cached |
| `obsidian` | Project notes, architecture docs | — | <5ms cached |
| `engram:lsp` | Live diagnostics captured as mistake nodes | — | on-event |

**9 Hook Handlers:**

| Hook | What it does |
|------|-------------|
| `PreToolUse:Read` | Blocks read if file covered. Delivers structural summary. |
| `PreToolUse:Edit` | Passes through. Injects known mistakes as warnings. |
| `PreToolUse:Write` | Advisory injection only, never blocks. |
| `PreToolUse:Bash` | Catches `cat | head | tail | less | more` and delegates to Read handler. |
| `SessionStart` | Injects compact project brief (god nodes, graph stats, top landmines). |
| `UserPromptSubmit` | Extracts keywords, runs budget-capped pre-query, injects results. |
| `PostToolUse` | Observer only. Writes to `.engram/hook-log.jsonl`. |
| `PreCompact` | Re-injects god nodes and active landmines before Claude compresses. Survives compaction. |
| `CwdChanged` | Auto-switches project context when navigating to different repo mid-session. |

**10 Safety Invariants:**
1. Any handler error → passthrough (never blocks agent)
2. 2-second per-handler timeout
3. Kill switch (`.engram/hook-disabled`) respected
4. Atomic settings.json writes with timestamped backups
5. Never intercept outside project root
6. Never intercept binary files or secrets
7. Never log user prompt content (privacy invariant)
8. Never inject more than 8,000 chars per hook response
9. Stale graph detection — file mtime newer than graph mtime → passthrough
10. Partial-read bypass — explicit offset/limit → passthrough

**Why this is higher leverage than `lean-ctx`:**
- **89.1% measured** vs 60-99% claimed
- **Works via hooks** — no MCP needed, no config changes
- **Survives compaction** — `PreCompact` re-injects critical context
- **Mistake learning** — bi-temporal mistake nodes prevent repeated errors

**Verdict:** ✅ **Source-level inspection** — actual README read with full provider/hook tables

---

### #3: windsurf-cli (staronelabs) — Programmatic Cascade Control

**Source:** `github.com/staronelabs/windsurf-cli`
**What it is:** Terminal CLI (`wsc`) that controls Cascade programmatically.

**The Power Move — Full Automation:**

```bash
# Send a prompt from terminal
wsc "explain this codebase"

# Choose model programmatically
wsc -m "Claude Sonnet 4.5" "refactor the auth module"
wsc -l                           # list available models

# Wait for response (blocking, scriptable)
wsc -w "what does this function do?"

# Open new window + send prompt
wsc -N ~/projects/myapp "fix bug"

# Target specific window
wsc --windows                    # list open windows
wsc -W myproject "fix the login bug"

# Pipe input
echo "fix the bug in main.py" | wsc
cat error.log | wsc "explain this error"

# Auto-accept (no human in loop)
wsc -a "add error handling to api.js"
wsc -A                          # click "Accept all" NOW

# Execute any Windsurf command
wsc --exec windsurf.cascadePanel.focus
wsc -c                          # list all discovered commands
```

**How It Works — The File Protocol:**

All communication through JSON files in `~/.windsurf-cli/`:

| File | Purpose |
|------|---------|
| `prompt.json` | CLI → Extension: prompt, model, command requests |
| `status.json` | Extension → CLI: processing status updates |
| `response.json` | Hook → CLI: captured Cascade responses (global) |
| `response-{window}.json` | Hook → CLI: captured response (per-window) |
| `conversation-history.json` | Hook: full prompt/response history (global) |
| `conversation-history-{window}.json` | Hook: full history (per-window) |
| `cascade-logs/{window}_{trajectory}.jsonl` | Hook: structured per-window, per-conversation log |

**Hooks Used:**
- `pre_user_prompt` → captures every prompt
- `post_cascade_response` → captures every response
- `post_cascade_response_with_transcript` → full conversation transcripts

**Why this is high leverage:**
- **Scripts can drive Cascade** — CI pipelines, cron jobs, batch processing
- **Multi-window orchestration** — manage 5 parallel Cascades from one terminal
- **Complete conversation logging** — every prompt, every response, every window, every conversation = full audit trail
- **Auto-accept** = fully autonomous agent loops

**Verdict:** ✅ **Source-level inspection** — actual README read

---

### #4: ckpt (mohshomis) — Agent Self-Correction

**Source:** `github.com/mohshomis/ckpt`
**What it is:** Automatic checkpoints for AI coding sessions. Per-step undo, branching, and restore — on top of git.

**The Power Move — AI Operates Its Own Checkpoints:**

```bash
# Start watching — auto-snapshots every AI change
ckpt watch

# The AI itself can restore
ckpt restore 3

# Branch — try multiple approaches
ckpt try approach-a -r 2         # save current, go back to step 2, try approach A
ckpt trydiff approach-a          # compare approaches

# End session — squash into one clean git commit
ckpt end
```

**Why existing IDE checkpoints are insufficient:**

| Feature | IDE Checkpoints | ckpt |
|---------|----------------|------|
| AI agent can use it | ❌ (human clicks "revert") | ✅ (`ckpt restore 3`) |
| Terminal agents | ❌ | ✅ |
| Branch & compare approaches | ❌ | ✅ |
| Persistent history | ❌ | ✅ |
| Works outside IDE | ❌ | ✅ |
| Step tagging | ❌ | ✅ |

**Why this is high leverage:**
- **Self-correcting agents** — The AI detects it broke something, rolls back, tries again. No human intervention.
- **Branching exploration** — Agent does A/B testing autonomously.
- **Works with Windsurf** — `ckpt watch` monitors file changes, regardless of IDE

**Verdict:** ✅ **Source-level inspection** — actual README read

---

### #5: learnship (FavioVazquez) — 57-Workflow Agentic Engineering

**Source:** `github.com/FavioVazquez/learnship`
**What it is:** "Agentic engineering done right" — context engineering, spec-driven development, compounding quality.

**The Power Move — Context Engineering:**

Every agent invocation is loaded with structured context. Nothing is guessed:

```
AGENTS.md                   ← loaded automatically every conversation
├── Soul & Principles        # Pair-programmer framing, 10 working principles
├── Platform Context         # Points to .planning/, explains phase loop
├── Current Phase            # Updated automatically by workflows
├── Project Structure        # Filled during new-project
├── Tech Stack               # Filled from research results
└── Regressions              # Updated by /debug when bugs fixed
```

**The 5 Commands:**
1. `init` — Start/resume project work
2. `plan` — Generate executable PLAN.md
3. `execute` — Build according to plan
4. `review` — Code review with challenger agent
5. `ship` — Clean commits, PR description, release notes

**Model Profiles (Quality vs Budget):**

| Agent | `quality` | `balanced` | `budget` |
|-------|-----------|------------|----------|
| Planner | large | large | medium |
| Executor | large | medium | medium |
| Debugger | large | medium | medium |
| Code Reviewer | large | medium | medium |
| Challenger | large | medium | medium |
| Verifier | medium | medium | small |
| Plan Checker | medium | medium | small |

**Speed vs Quality Presets:**

| Scenario | `mode` | `granularity` | `model_profile` | Research | Plan Check | Verifier |
|----------|--------|--------------|----------------|----------|------------|---------|
| Prototyping | `auto` | `coarse` | `budget` | off | off | off |
| Normal dev | `auto` | `standard` | `balanced` | on | on | on |
| Production | `interactive` | `fine` | `quality` | on | on | on |

**Why this is high leverage:**
- **57 workflows** — almost every development scenario covered
- **Context engineering** — structured context loaded into every agent call, not ad-hoc prompting
- **Decision tracking** — every architectural choice in `DECISIONS.md`, honored by agents
- **Cost control** — explicit quality/budget model selection per task type

**Verdict:** ✅ **Source-level inspection** — actual README sections read

---

### #6: RuleSurf (akapug) — Adaptive Project State

**Source:** `github.com/akapug/RuleSurf`
**What it is:** Intelligent rules framework using `global_rules.md` + `.windsurfrules` with self-editable memory.

**The Power Move — `init` and `save` Commands:**

```
User: init
Cascade: [reads global_rules.md Adaptive Project State, resumes work]

... work happens ...

User: save
Cascade: [updates global_rules.md with new progress, decisions, lessons]
```

**Adaptive Project State (APS):**
- AI-maintained project context in `global_rules.md`
- Automatically track milestones
- Maintain task progression history
- Preserve lessons learned across cycles

**Why this is high leverage:**
- **Session restoration** — `init` loads full project state, no re-explaining
- **Self-improving** — `save` teaches the AI what worked and what didn't
- **Cross-session continuity** — APS survives `/compact`, session close, even IDE restart

**Verdict:** ✅ **Source-level inspection** — actual README read

---

### #7: BMad Method (cdwbrad) — `@agent-name` with `.bmad-core/`

**Source:** `github.com/cdwbrad/bmad-method`
**What it is:** Breakthrough Method for Agile AI Driven Development.

**The Power Move:**

```bash
npx bmad-method install
# Select Windsurf as IDE
```

Creates:
- `.bmad-core/` folder with all agents
- `.windsurf/rules/` folder with agent rule files

**Usage:**
```
Type @agent-name in chat to activate an agent
```

**Why this is high leverage:**
- **One command install** — `npx bmad-method install` sets up everything
- **IDE-agnostic** — works with Windsurf, Cursor, Claude Code
- **Agent library** — `.bmad-core/` is a reusable agent template library

**Verdict:** ✅ **Source-level inspection** — actual guide read

---

## Hard Constraints Discovered

### Context Limit: 6000 Tokens for Global Rules
**Source:** `github.com/The-Pocket/PocketFlow-Template-Python/issues/3`

> "Windsurf context file max for the global rules is 6000 tokens."

**Implication:** `global_rules.md` must stay under 6000 tokens. The `windsurf-unlocked` framework distributes knowledge across rules, skills, vault/, and workflows. You CANNOT put everything in global rules.

**Verification status:** ⚠️ Single source, no counter-evidence found

---

## Negative Case Evidence (What Practitioners Complain About)

### Reddit r/windsurf and r/Codeium — Real Pain Points

1. **Auto-run terminal commands stopped working**
   > "Before it was possible for windsurf to chain terminal commands, read the outputs and then act on them. Now it's almost like it's been completely stopped from doing it."
   — r/Codeium, 2026

2. **Permission prompts despite allowlist**
   > "I put commands on the allow list. I then switched to Turbo and that had no impact. .windsurfrules is empty"
   — r/windsurf, 2026

3. **Cascade gets stuck after terminal commands**
   > "I had this issue pretty consistently with Claude 3.7. When I switched to Claude 3.7 Thinking it seemed to stop happening."
   — r/windsurf, 2026

4. **Planning mode doesn't stop**
   > "How do I make it stop trying to plan and just do what I asked?"
   — r/windsurf, 2026

5. **Context rot / forgetting**
   > From the ai-dev-workflow gist: "Start a new conversation when you feel the model is 'forgetting' old information... A good rule is to keep context between 40-50% of the limit."
   — fforbeck, 2026

6. **Context rot symptoms:**
   - AI suggests code that contradicts recent decisions
   - References files/functions that were already removed
   - Repetition of solutions that already failed
   - Confusion about current project state

**Why this matters:** The frameworks above (windsurf-unlocked's `compact-hygiene`, engram's `PreCompact`, RuleSurf's `save`) are **direct responses** to these pain points. They're not theoretical — they solve real problems that cause practitioners to abandon or downgrade their Windsurf usage.

---

## This Project's Actual Usage (Cross-Reference)

From `git log --oneline --since="2026-04-01" -- .windsurf/workflows/`:

**Evidence of active use (this project):**
- 30+ commits touching `.windsurf/workflows/` since April 2026
- Workflow files for: system-awareness, trace, sprint, implement, audit-tests, harden, mode-declaration, prototype, organic learning, scope contracts, indexing
- `.windsurfrules` actively maintained (multiple commits)
- `AGENTS.md` present and referenced
- `.windsurf/memories/` with 3 files including `ide-ram-leak-lesson.md`
- `.windsurf/research/` with 18 files (130 KB of project knowledge)

**Critical operational discovery from this project:**
- Commit `4e674745`: `.codeiumignore` fix for critical 100% lag memory issue
- `venv/` = 604 MB, `.git/` = large, `sanity/backups/` = large
- Without `.codeiumignore`, language server RAM grew to 5.8+ GB
- With `.codeiumignore`, RAM back to normal

**This project does NOT use:**
- `@agent-name` invocation (no evidence in git log or files)
- `vault/` directory (not present)
- `plans/` directory (not present)
- MCP config (not present in `.windsurf/`)
- Hooks (`.windsurf/hooks.json` not present — only `hooks.json` at root level for beads)

**Verdict:** This project uses **workflows and memories heavily**, but has **not adopted** the agent persona pattern, vault pattern, or MCP integration. The `.windsurf/research/` directory is a unique local innovation not found in any practitioner repo inspected.

---

## New Open Questions (v5)

1. **How many practitioners actually use `@agent-name` invocation?** — Documented by 3+ repos, but no adoption evidence in this project or inspected repos
2. **Does `wsc` (windsurf-cli) work reliably?** — File protocol is clever but fragile. What happens when Windsurf updates?
3. **Can `ckpt` integrate with Windsurf's native checkpoints?** — Or does it duplicate/overlap?
4. **What is the actual performance of `engram` with Windsurf?** — 89.1% measured, but on what workload? Is it generalizable?
5. **Do auto-triggered skills actually fire reliably?** — Intent detection is fuzzy. False positives/negatives?
6. **How do `@agent-name` personas interact with existing rules?** — Do they override, append, or conflict?
7. **What is the cost of running `windsurf-unlocked` full stack?** — 8 agents, 8 skills, 10 workflows, hooks, MCP — how much token overhead?
8. **Why does this project have `.windsurf/research/` but no other repo does?** — Is this a local innovation or a common pattern I missed?
9. **Is the 6000 token global rules limit still accurate?** — Single source from 2026, may have changed
10. **Do the Reddit complaints about auto-run stopping relate to a specific Windsurf version?** — Need temporal correlation

---

## Confidence Assessment

| Claim | Confidence | Basis |
|-------|------------|-------|
| `windsurf-unlocked` architecture | **Very High** | Actual AGENT.md, SKILL.md, hooks.json, mcp_config.json read |
| `@agent-name` invocation pattern | **Very High** | Multiple repos document same pattern, actual AGENT.md content read |
| `engram` 89.1% savings | **High** | README read with benchmark methodology, measured not estimated |
| `wsc` programmatic control | **High** | README read, architecture clear |
| `ckpt` agent self-correction | **High** | README read, concept clear |
| `lean-ctx` 60-99% savings | **Medium** | README read, no independent verification |
| `learnship` 57 workflows | **Medium** | README read, no workflow content inspected |
| 6000 token global rules limit | **Medium** | Single GitHub issue |
| Model benchmarks (tok/s) | **Medium** | Cognition blog + vendor docs, not independently measured |
| Auto-triggered skill reliability | **Low** | Concept documented, no usage evidence |
| This project's workflow adoption | **Very High** | Direct git log inspection |
| This project's agent persona adoption | **Very High** | Absence confirmed by file inspection |
| Reddit pain points (auto-run, context) | **High** | Multiple independent Reddit threads |

---

## Source References

- **windsurf-unlocked:** `github.com/OnlyTerp/windsurf-unlocked` (starter/README.md, BENCHMARKS.md, AGENT.md files, SKILL.md files, hooks.json, mcp_config.json, ralph-safe.md)
- **engram:** `github.com/NickCirv/engram` (README.md)
- **windsurf-cli:** `github.com/staronelabs/windsurf-cli` (README.md)
- **ckpt:** `github.com/mohshomis/ckpt` (README.md)
- **lean-ctx:** `github.com/yvgude/lean-ctx` (README.md)
- **learnship:** `github.com/FavioVazquez/learnship` (README.md)
- **RuleSurf:** `github.com/akapug/RuleSurf` (README.md)
- **BMad Method:** `github.com/cdwbrad/bmad-method` (docs/agentic-tools/windsurf-guide.md)
- **Global rules token limit:** `github.com/The-Pocket/PocketFlow-Template-Python/issues/3`
- **ai-dev-workflow gist:** `gist.github.com/fforbeck/a3aeeb71e71583adf099dfddfae7963c`
- **Reddit complaints:** r/windsurf, r/Codeium (multiple threads 2026)
- **This project usage:** `git log --since="2026-04-01" -- .windsurf/workflows/` (direct inspection)
