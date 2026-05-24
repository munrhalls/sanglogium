# Windsurf Power Moves — Prioritized by Real-World Leverage

> Extracted from `windsurf-ide-professional-practitioners-MASTER_2026-05-21.md`
> Date: 2026-05-21

---

## 1. Engram — 89.1% Token Savings

**What it is:** A context optimizer that intercepts every file read and serves a compact summary from cache instead of dumping the full file into your context window.

**The result:** A typical 18,000-token file becomes a 300-token summary. On a reproducible benchmark it saves 89.1% of tokens. Best case is 98.4% savings.

**How it works:** Three layers — a knowledge graph the agent builds over time, a SQLite cache per provider, and an in-memory LRU. It has nine built-in providers covering AST, regex, past failures, git patterns, and more.

**Why it is the highest leverage move:** Token cost is the binding constraint on agentic workflows. Every file read costs credits. Every tool call eats your quota. Engram slashes that cost by an order of magnitude. It also has hooks that survive compaction, so the savings compound in long sessions.

**The catch:** Setup complexity. It is not plug-and-play. You need to configure providers and trust the summary accuracy.

**Source:** `github.com/NickCirv/engram` (117 stars)

---

## 2. Agent Personas with `@name` Invocation

**What it is:** Dedicated agent definitions in folders like `.windsurf/agents/architect/AGENT.md` that you invoke by typing `@architect` in Cascade chat. Each persona is pinned to a specific model and mode.

**The three core personas:**

- **Architect** — Pinned to `swe-1.6`, plan mode only. Never edits code. Produces written plans with goals, constraints, alternatives, risks, and rollback steps. If the plan exceeds 800 lines, it is over-engineered.

- **Implementer** — Pinned to `swe-1.6-fast`, code mode. Batch-parallelizes edits, runs tests after every checkbox, never weakens a test to make it pass. If stuck for more than ten minutes, hands off back to the architect.

- **Reviewer** — Pinned to `claude-opus-4.6`, read-only. Six-dimension review across correctness, security, testing, code smell, performance, and rules alignment. Outputs a verdict: LGTM, changes requested, or needs discussion.

**Why it matters:** You stop paying for the wrong model to do the wrong job. You stop rewriting the same behavioral instructions in every prompt. The persona is loaded once and behaves consistently.

**The catch:** Adoption is tiny — the main repo has only 33 stars. This project does not use them yet. Whether `@name` invocation works reliably in current Windsurf is unverified.

**Source:** `github.com/OnlyTerp/windsurf-unlocked`

---

## 3. Auto-Triggered Skills

**What it is:** Skills that fire automatically when the system detects intent, not when you type a slash command. This is a hidden feature most users miss.

**The canonical example is `compact-hygiene`.** It triggers when your context window hits 50 to 60 percent utilization, or when you mention forgetting, drift, or long sessions. It then guides the compaction process with a preservation checklist.

**The protocol:**

- Proactively compact at 50 to 60 percent — that is the sweet spot.
- Never compact at 95 percent — by then your foundational context is already degraded.
- Before compacting, write durable facts to a vault directory. The vault survives forever. The session does not.

**Why it matters:** Context rot is the number one pain point practitioners report on Reddit. Skills automate the fix without you having to remember to run a command.

**The catch:** False positives and negatives are unknown. The trigger mechanism is not documented in official docs. Real-world reliability is unverified.

**Source:** `github.com/OnlyTerp/windsurf-unlocked/starter/.windsurf/skills/compact-hygiene/SKILL.md`

---

## 4. CKPT — Agent Self-Correction

**What it is:** A checkpointing tool that lets the AI itself rewind its own work. Not you clicking revert. The AI runs `ckpt restore 3` autonomously.

**The workflow:**

- `ckpt watch` auto-snapshots every AI change.
- `ckpt steps` shows what happened step by step.
- `ckpt restore 3` rewinds to step three.
- `ckpt try approach-a -r 2` branches to try a different path.
- `ckpt end` squashes everything into a clean git commit.

**Why it matters:** IDE checkpoints require human intervention. The AI cannot operate them. CKPT makes the agent self-correcting and self-branching. It works in any terminal, any CI pipeline, any environment.

**The catch:** It requires the agent to know the tool exists and choose to use it. If the agent does not know about CKPT, it cannot self-correct.

**Source:** `github.com/mohshomis/ckpt`

---

## 5. Windsurf CLI — Programmatic Control

**What it is:** A terminal tool called `wsc` that sends prompts to Cascade through JSON files instead of the GUI. It enables full automation, multi-window orchestration, and structured logging.

**Key commands:**

- `wsc "explain this codebase"` sends a prompt.
- `wsc -m "Claude Sonnet 4.5" "refactor"` picks a model.
- `wsc -w "what does this do"` waits for a blocking response.
- `wsc -a "add error handling"` auto-accepts edits.
- `wsc --tabs` lists all conversations.

**Why it matters:** You can script Cascade into CI pipelines, batch-process codebases, and keep full audit trails of every conversation. The logs are structured JSONL per window and trajectory.

**The catch:** It uses a file protocol that is fragile and may break with Windsurf updates. Maintenance burden is real.

**Source:** `github.com/staronelabs/windsurf-cli`

---

## 6. `.codeiumignore` for RAM Survival

**What it is:** A file that controls what the language server indexes. It is independent of `.gitignore`.

**Why it matters:** A one-kilobyte `.todo` file in this project caused pathological re-indexing that bloated RAM from 1.1 GB to 8.7 GB. On large repos this is the difference between the IDE running smoothly and becoming unusable.

**The rule:** If your repo is over 100 megabytes, you need a `.codeiumignore`. No exceptions.

**Source:** This project's own discovery, verified by direct observation.

---

## 7. Git Worktrees for Parallel Development

**What it is:** Official support since Wave 13 in December 2025 for spawning multiple Cascade sessions in the same repository without conflicts.

**Why it matters:** You can run one Cascade session per feature branch without them overwriting each other. The official `post_setup_worktree` hook fires automatically after worktree creation.

**Practitioner tools:** `priyashpatil/rift` and `kundeng/windloop` manage worktrees specifically for parallel AI agent development.

**Source:** Official changelog, `github.com/priyashpatil/rift`

---

## Quick Reference: What to Use When

- **Burning credits fast** — Engram
- **Need consistent behavior across sessions** — Agent personas (`@name`)
- **Agent keeps forgetting things** — Auto-triggered `compact-hygiene` skill
- **Agent went down a bad path** — CKPT restore
- **Need to automate Cascade** — Windsurf CLI
- **IDE is sluggish or RAM is exploding** — `.codeiumignore`
- **Working on multiple features at once** — Git worktrees

---

## The One-Sentence Takeaway

The highest leverage is not a single trick — it is stacking them. Use engram to slash token costs, agent personas to enforce behavior, auto-skills to prevent context rot, and CKPT to recover when the agent drifts. Each layer compounds the others.
