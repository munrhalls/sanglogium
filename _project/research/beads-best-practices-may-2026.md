# Beads Best Practices & First Principles — May 2026

## Research Scope Contract

- **Topic:** Steve Yegge's `beads` (bd) — a Dolt-powered, git-native issue tracker for AI coding agents — best practices, first principles, and community-validated improvements as of May 2026.
- **First Principles:**
  1. AI agents have severe session amnesia (the "50 First Dates" problem).
  2. Deterministic execution order requires explicit dependency graphs, not prose interpretation.
  3. Context windows are scarce; machine-readable, queryable state beats verbose markdown plans.
- **Fundamentals:**
  - `bd ready` graph traversal and blocked-work filtering
  - Hash-based ID collision avoidance
  - Dolt-backed storage with `refs/dolt/data` sync
  - `--json` programmatic API contract
  - AGENTS.md integration pattern
- **Scope Boundary:**
  - OUT: Gas Town / Wasteland / Gas City multi-agent orchestration (experimental, beyond core beads).
  - OUT: Comparison with Claude Code Tasks (different layer — use both).
  - OUT: Contributing to beads source code.
- **Target Audience:** Windsurf IDE pro users already running `bd` in their repos.
- **Decay Risk:** **High** — beads is in active 1.x development; CLI flags and data formats evolve frequently.

---

## Source Triangulation

| Source | URL | Type | Credibility | Date | Key Claim | Verification |
|--------|-----|------|-------------|------|-----------|--------------|
| gastownhall/beads (GitHub) | github.com/gastownhall/beads | Source of Truth | Canonical | 2026-05 | Dolt-backed, hash IDs, `--json` on all commands | ✅ Verified |
| Beads Best Practices (Steve Yegge, Medium) | steve-yegge.medium.com/beads-best-practices-2db636b9760c | Authoritative | High | 2026-03 | Multi-agent coordination, small working set, when to file issues | ✅ Confirmed |
| Beads Blows Up (Steve Yegge, Medium) | steve-yegge.medium.com/beads-blows-up-a0a61bb889b4 | Authoritative | High | 2026-01 | "Land the Plane" protocol, session cleanup, core design rationale | ✅ Confirmed |
| Beads Docs (gastownhall.github.io) | gastownhall.github.io/beads/ | Official | Canonical | 2026-05 | Embedded Dolt default, CLI quick start, core concepts | ✅ Verified |
| Beads FAQ (GitHub) | github.com/gastownhall/beads/blob/main/docs/FAQ.md | Official | Canonical | 2026-05 | Why hash IDs, merge conflict handling, multi-project isolation | ✅ Verified |
| Restoring Beads Classic (DoltHub) | dolthub.com/blog/2026-04-02-restoring-beads-classic/ | Authoritative | High | 2026-04 | Embedded Dolt restored solo-user experience without external server | ✅ Verified |
| Beads: Agent Memory (MorphLLM) | morphllm.com/beads-agent-memory | Community | High | 2026-04 | Honest limitations, "80% rule", L2 memory hierarchy framing | ✅ Confirmed |
| Building Apps with AI (DEV Community) | dev.to/koustubh/building-apps-with-ai-how-beads-changed-my-development-workflow-2p7 | Community | Med-High | 2026-01 | Task-first vs spec-first, real-world workflow example | ✅ Confirmed |
| Beads: Memory for Coding Agents (Paddo) | paddo.dev/blog/beads-memory-for-coding-agents/ | Community | High | 2025-12 | "Land the Plane" pattern, current-work-not-future-planning scope | ✅ Confirmed |
| r/ClaudeCode critique | reddit.com/r/ClaudeCode/comments/1ov1z94/ | Community | Med | 2026-04 | "Beads becomes implementation scratch notes I don't want in my issue tracker" | ✅ Falsification |
| r/ClaudeAI critique | reddit.com/r/ClaudeAI/comments/1qj6l75/ | Community | Med | 2026-04 | "Beads has gone downhill... Gas Town was a disaster" | ✅ Falsification |

---

## First Principles Analysis

### Core Problem Being Solved
AI coding agents operate within ~10-minute effective sessions. When a session ends (context compaction, chat boundary, or human stop), the agent loses all learned project state. The next session begins from scratch — re-explaining project structure, re-describing bugs, re-establishing file relevance. Beads provides **addressable, machine-readable persistent memory** that survives session boundaries.

### Underlying Constraints
1. **Context windows are finite and expensive.** Loading a 2,000-line `TODO.md` wastes tokens on closed items and stale notes.
2. **Agents cannot reliably infer dependencies from prose.** Natural language specs contain implicit ordering that agents misinterpret.
3. **Concurrent work creates merge collisions.** Multiple agents or branches creating tasks simultaneously need collision-free IDs.
4. **Git is the only distributed system developers already trust.** Agents know Git; introducing a new sync protocol creates friction.

### Inherent Tradeoffs

| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| **Beads (task-first DAG)** | Deterministic execution order; machine-readable; offline-first; queryable | Requires explicit instruction to use; agents won't check unprompted | Daily execution once intent is understood |
| **Spec-driven (markdown prose)** | Rich architectural intent; human-readable; good for complex upfront design | Agents must interpret prose; no enforced order; context-heavy | Early planning, architectural stabilization |
| **Hybrid (spec → beads)** | Best of both: detailed planning + deterministic execution | More steps; requires conversion | Complex features with clear execution path |
| **Claude Code Tasks** | Within-session coordination; zero setup; native to Claude | Session-bound; Claude-only; no cross-project memory | Within-session agent teams |

### Failure Modes
1. **Misapplication:** Using beads as a Jira replacement for human teams. It's designed for agent memory, not human project management dashboards.
2. **Over-application:** Filing every stray thought as a bead. The working set should stay small (~current week). Future planning belongs elsewhere.
3. **Under-application:** Not providing explicit `AGENTS.md` instructions. Agents **will not** query beads unprompted. They need scripted triggers.
4. **Architecture confusion:** Treating `.beads/issues.jsonl` as the source of truth. It is a **passive export**. The Dolt database is the source of truth; JSONL is for human review and git diffing only.

---

## Code Fundamentals

### Fundamental: `bd ready` — Deterministic Unblocked Work Detection
**Claim:** `bd ready` computes transitive blocking offline in ~10ms and shows only open issues with no unmet dependencies.

**Verification:**
- ✅ Located in our codebase: `AGENTS.md` references `bd ready` as primary work discovery.
- ✅ Source inspected: Dolt-backed SQL query against dependency graph with status filters.

**Actual Behavior:**
- Respects four dependency types: `blocks`, `related`, `parent-child`, `discovered-from`.
- Returns `--json` arrays with `id`, `title`, `priority`, `status`, `blockers`.
- Recently closed issues get a priority boost to surface follow-up work.

**Edge Cases:**
1. Circular dependencies will deadlock `bd ready` output — use `bd dep tree` to diagnose.
2. `discovered-from` links don't block; they trace provenance of new work.

### Fundamental: Hash-Based IDs
**Claim:** Hash IDs prevent collisions when multiple agents/branches create issues concurrently.

**Verification:**
- ✅ FAQ confirms progressive length scaling: 4 chars (0-500), 5 chars (500-1,500), 6+ chars (1,500+).
- ✅ Same-ID scenarios are treated as updates, not collisions.

**Actual Behavior:**
- UUID-derived hash truncated to configurable length.
- Child IDs use hierarchical numbering: `bd-a3f8e9.1`, `bd-a3f8e9.2`.

**Edge Cases:**
- Manual `bd import` with conflicting IDs can overwrite. Use `bd create` for normal operation.
- Cross-project references are impossible by design (isolated databases).

### Fundamental: Dolt Storage Architecture
**Claim:** Embedded Dolt is now the default backend, restoring the single-player experience without an external server.

**Verification:**
- ✅ DoltHub blog (April 2026) confirms Embedded Dolt replaced the external-server requirement.
- ✅ Our `config.yaml` uses default settings (no `no-db: true`), confirming Dolt mode.

**Actual Behavior:**
- `.beads/dolt/` is gitignored; sync uses `bd dolt push/pull` to `refs/dolt/data` on the git remote.
- Cell-level merge resolves most conflicts automatically.
- `bd init --quiet` for agents; `bd init` for humans (prompts for hooks).

**Edge Cases:**
- Stale database after colleague pushes: run `bd dolt pull` before `bd ready`.
- Windows users: Dolt backend connects via MySQL protocol (no Unix socket issues).

---

## Best Practices (Verified)

### Practice: The "Land the Plane" Protocol
**Consensus:** High — appears in Yegge's articles, Paddo's analysis, MorphLLM's guide, and our own `AGENTS.md`.

**Supporting Evidence:**
- Yegge: "At the end of every session, tell your agent: 'Let's land the plane.'"
- MorphLLM: One developer refactored 315 frontend files in a 12-hour session using this protocol.

**Counter-Evidence:**
- Agents won't trigger this unprompted; instructions fade in long sessions.
- The 80% rule applies: agents do the right thing ~80% of the time; the 20% needs human supervision.

**Verdict:** ✅ Recommended

**Protocol Steps:**
1. **Run Quality Gates** — lint, test, type-check. Verify the session's work compiles.
2. **File Discovered Work** — create beads for anything found mid-session with proper dependency links.
3. **Close Finished Issues** — mark completed work with reasons; update in-progress items with state notes.
4. **Sync and Handoff** — `bd dolt push`, push code to git, generate a ready-to-paste prompt for next session.

**When to Use:** Every session end. Non-negotiable.
**When to Skip:** Never. Skipping = stranded context.

### Practice: AGENTS.md Integration
**Consensus:** High — documented in beads FAQ, GitHub discussion #506, and our repo.

**Supporting Evidence:**
- FAQ: "If your agent is not covered by bd setup, add this minimal AGENTS.md section."
- GitHub discussion #506: explicit CLAUDE.md instructions required for agents to use beads correctly.

**Counter-Evidence:**
- Some users report agents still make mistakes even with instructions.
- Instructions compete with other system prompts for context weight.

**Verdict:** ✅ Recommended

**Implementation:**
```markdown
<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` for workflow context.

### Rules
- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT create MEMORY.md files
```

**When to Use:** Every repo using beads.
**When to Skip:** If the agent has no file-system access to read `AGENTS.md`.

### Practice: Task-First, Not Spec-First
**Consensus:** High — central thesis across Yegge's articles and community guides.

**Supporting Evidence:**
- DEV Community: "beads is task-first — you create issues directly, with explicit dependencies stored as graph edges."
- Paddo: "beads optimizes for execution once intent is roughly understood."

**Counter-Evidence:**
- Some workflows benefit from lightweight requirements.md as input ( Mission House example).
- Complex architectural decisions still need upfront stabilization before task breakdown.

**Verdict:** ⚠️ Context-Dependent

**When to Use:** Intent is understood; execution is the bottleneck.
**When to Skip:** Architectural uncertainty requires upfront spec-driven design.

### Practice: Keep the Working Set Small
**Consensus:** High — Yegge's "Beads Best Practices" and Paddo's analysis both emphasize this.

**Supporting Evidence:**
- Yegge: "Beads sits in a narrow space... Current work: what you care about right now."
- Paddo: "Beads isn't a planning tool, a PRD generator, or Jira."

**Counter-Evidence:**
- None found; universally agreed.

**Verdict:** ✅ Recommended

**Rule of Thumb:**
- ✅ In beads: This week, what just shipped, what's blocked.
- ❌ Not in beads: Vague backlog items months out; fully documented low-risk completed work.

### Practice: Always Use `--json` for Programmatic Access
**Consensus:** High — official docs, FAQ, and all agent integration guides.

**Supporting Evidence:**
- Official docs: "Always use `--json` for programmatic access."
- FAQ: "Every command has `--json` output."

**Verdict:** ✅ Recommended

**When to Use:** Any agent or script consuming beads output.
**When to Skip:** Human CLI browsing (human-readable default output is fine).

---

## Common Solutions Landscape

### Solution: Markdown TODO Files (Pre-Beads)
**Prevalence:** Ubiquitous
**Type:** Workaround / Anti-pattern

**Pros:**
- Zero setup; every agent understands markdown.
- Human-readable.

**Cons:**
- No dependency enforcement; agents misinterpret ordering.
- No compaction strategy; files grow until they waste context.
- Competing/conflicting documents cause "agent dementia."

**Recommendation:** Migrate to beads. Use `bd compact` to summarize old closed issues.

### Solution: GitHub Issues + gh CLI
**Prevalence:** Common
**Type:** Workaround

**Pros:**
- Human teams already use it; web UI dashboards exist.
- Cross-repo integrations and automation.

**Cons:**
- No deterministic "ready" concept; requires custom GraphQL.
- Cloud-first, requires network/auth; no offline work.
- No branch-scoped task state; global per-repo only.
- No AI-resolvable conflicts or duplicate merge.

**Recommendation:** Use GitHub Issues for human team coordination. Use beads for agent memory. They serve different layers.

### Solution: Claude Code Tasks (Anthropic)
**Prevalence:** Growing (Claude Code users)
**Type:** Idiomatic within Claude ecosystem

**Pros:**
- Zero setup; native within-session coordination.
- Agent Teams feature for parallel subtasks.

**Cons:**
- Session-bound; no cross-session persistence.
- Claude-only; doesn't work with Windsurf, Cursor, etc.
- No dependency graph across sessions.

**Recommendation:** Use Tasks for within-session Claude Code work. Use beads for cross-session, cross-agent persistence.

### Solution: Hybrid (Spec → Beads)
**Prevalence:** Emerging
**Type:** Idiomatic

**Pros:**
- Rich upfront planning + deterministic execution.
- Converts human-readable intent into machine-readable tasks.

**Cons:**
- Extra conversion step.
- Requires discipline to keep specs from becoming stale artifacts.

**Recommendation:** Best for complex features. Write lightweight requirements.md, then have the agent encode into beads DAG.

---

## Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| `bd ready` computes unblocked work in ~10ms | FAQ, official docs | Doc inspection |
| Hash IDs prevent concurrent collisions | FAQ with branch examples | Doc inspection |
| Embedded Dolt is default (no external server) | DoltHub blog April 2026 | Authoritative source |
| Agents require explicit instructions to use beads | MorphLLM, GitHub disc #506 | Multiple community sources |
| JSONL is passive export, not source of truth | FAQ, our `AGENTS.md` | Source of truth code |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| Beads eliminates session context loss | Agents won't trigger handoffs unprompted; 20% error rate persists | **Modified** — beads makes the 80% reliable, not perfect |
| Beads replaces all issue tracking | Reddit user: "implementation scratch notes I don't want in my issue tracker" | **Context-Dependent** — use beads for agent memory, not human PM |
| Dolt backend scales without friction | Early 2026 required external server; solo users complained | **Survived** — Embedded Dolt restored single-player experience |
| Gas Town extends beads successfully | Reddit: "Gas Town was a disaster"; experimental, not daily workflow | **Abandoned** — Gas Town out of scope for core beads best practices |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| Dolt backend / Embedded Dolt | High | July 2026 — rapid backend evolution |
| CLI flags and commands | High | July 2026 — 1.x active development |
| AGENTS.md integration pattern | Low | Stable across versions |
| Land the Plane protocol | Low | Core workflow, stable since Jan 2026 |
| Hash ID behavior | Low | Stable design |

---

## Synthesis: Actionable Takeaways

### For Our Project (sang-logium)

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Keep beads for agent memory | Verified as best-in-class for cross-session persistence | Continue using `bd` commands in `AGENTS.md` |
| Maintain AGENTS.md v1 profile | Agents need explicit, versioned instructions | Already implemented; keep `BEGIN BEADS INTEGRATION` block current |
| Enforce "Land the Plane" on every session end | Prevents stranded context; already in `AGENTS.md` | Mandatory session completion workflow |
| Use `bd remember` instead of markdown files | Prevents competing documents and "agent dementia" | Already in rules; audit for `MEMORY.md` leaks |
| Keep `--json` in agent-facing commands | Machine-readable output is the API contract | Already standard in our hooks |
| Hybrid spec→beads for complex features | Best of both worlds for architectural work | Lightweight requirements.md as input, agent encodes to beads |

### Immediate Actions
1. **Audit `AGENTS.md` freshness** — verify beads integration block matches latest `bd prime` output.
2. **Verify no markdown TODOs exist** — search repo for `TODO.md`, `TASKS.md`, `PLAN.md` and migrate to beads.
3. **Test `bd ready` output** — confirm it shows expected unblocked work before each session.
4. **Run `bd dolt push` at session end** — ensure beads state is never stranded locally.

### Open Questions
1. When should we file issues in beads vs. GitHub Issues? (Current heuristic: beads for agent execution, GitHub for human-visible bugs and features.)
2. Should we adopt the `bd compact` command to summarize old closed issues and save context?
3. Is the `no-db: false` default still optimal, or should we test `no-db: true` (JSONL-only) for simpler backup?

---

*Research completed: 2026-05-26*
*Next review: 2026-07-26 (high decay risk due to active 1.x development)*
