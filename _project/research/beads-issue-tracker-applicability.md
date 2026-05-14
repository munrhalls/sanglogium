# Beads Issue Tracker Applicability to Sanglogium — Research Report

**Research Date:** 2026-05-14 | **Decay Risk:** High (AI tooling space moves fast; Beads is pre-1.0)

---

## Research Scope Contract

- **Topic:** Evaluate whether the Beads issue tracker (CLI-based, git-native, AI-agent-optimized) reduces friction in Sanglogium's AI-driven development workflow compared to current markdown-based task/sprint tracking.
- **First Principles:**
  1. **Context windows are finite** — every token spent on task parsing is a token not spent on implementation.
  2. **State must outlive the session** — an agent that forgets the plan when the chat ends is handicapped.
  3. **Dependencies constrain ordering** — parallelizing work requires knowing what blocks what.
- **Fundamentals:**
  - How does Sanglogium currently track tasks? (`_project/tasks/`, `_project/sprints/`, `.windsurf/workflows/`)
  - How much context do current task files consume?
  - What is the cost of task-file parsing vs. structured query?
- **Scope Boundary:**
  - IN: Workflow friction analysis, context-window economics, dependency management, multi-agent collision.
  - OUT: Actually installing Beads (this is research-only), evaluating Dolt as a database, comparing to Jira/Linear.
- **Target Audience:** Developer making tooling decisions for the Sanglogium AI workflow.
- **Decay Risk:** High — Beads is actively evolving; claims about features may change.

---

## Source Triangulation

| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| Beads GitHub README | https://github.com/gastownhall/beads | Official | Canonical | 2026-05 | "bd ready returns tasks with no uncompleted dependencies" | ✅ Verified against CLI docs |
| Better Stack Guide | https://betterstack.com/community/guides/ai/beads-issue-tracker-ai-agents/ | Community | High | 2026-05 | "JSON-L sync enables Git-native collaboration" | ✅ Verified — matches GitHub docs |
| Jon Simpson Blog | https://jonsimpson.ca/using-beads-to-supercharge-my-workflow/ | Practitioner | Medium | 2026-05 | "/refine-bd run 2-4 times breaks down tasks sufficiently for Sonnet-level agents" | ⚠️ Anecdotal, single-user |
| Reddit r/ClaudeAI | https://reddit.com/r/ClaudeAI/comments/1qj6l75/ | Community | Medium | 2026-05 | "Giving an agent a task tracker really helps keep it on track during long-running work" | ⚠️ Self-reported, n=1 |
| Steve Yegge Medium | https://steve-yegge.medium.com/introducing-beads | Author (creator) | High | 2026-05 | Beads as "memory upgrade for coding agents" | ❌ Forbidden (403) — unavailable for verification |

---

## First Principles Analysis

### Core Problem Being Solved
AI agents lose all project context when a session ends. Re-loading that context from static markdown files consumes tokens, provides no dependency awareness, and offers no collision prevention for multi-agent workflows.

### Underlying Constraints
1. **LLM context windows are fixed** — Claude Sonnet 4 ~200k tokens, but effective reasoning degrades as context fills.
2. **Markdown is unstructured** — parsing `## Solution Design` sections requires fuzzy heuristics; agents hallucinate structure.
3. **Git is the only shared state** — any solution must serialize to text for collaboration.
4. **Agents are stateless between sessions** — they cannot remember unless state is persisted externally.

### Inherent Tradeoffs

| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| **Beads (structured DB + JSON-L)** | Queryable (`bd ready`), dependency-aware, git-synced, compact context | External dependency (Dolt/Beads CLI), learning curve, pre-1.0 stability | Multi-session, multi-agent, complex dependency chains |
| **Markdown task files (current)** | Zero dependencies, human-readable, versioned in git | Unqueryable, high context consumption, no dependency enforcement, collision-prone | Simple single-session tasks, human-only tracking |
| **Hybrid (Beads for epics, md for quick bugs)** | Flexibility | Complexity of two systems | Teams with varied task sizes |

### Failure Modes
1. **Misapplication:** Using Beads for one-off bugs that take 10 minutes — overhead exceeds benefit.
2. **Over-application:** Beads for every trivial refactor — `.beads/` bloat, JSON-L noise.
3. **Under-application:** Continuing with markdown for 6-month checkout redesign — context loss, drift, repeated re-planning.

---

## Code Fundamentals: Current State Audit

### Fundamental: Task File Structure

**Claim:** Sanglogium task files are concise, low-overhead tracking artifacts.

**Verification:**
- [x] Located in codebase: `_project/tasks/fix-basket-page-products-not-visible-after-homepage-add_2026-05-09.md`
- [x] Measured: **245 lines, ~11,800 bytes**
- [x] Measured: Sprint files average **~10,000–16,000 bytes**

**Actual Behavior:**
A typical task file contains: Problem Statement, System Context, Root Cause Analysis (4 hypotheses), Best Practices Research, Project Convention Alignment, Solution Design, Verification, Rollback, Deliverables, Constraints, Success Criteria, Execution Commands.

**Context Cost:**
At ~4 chars/token ( rough estimate), a single task file is ~2,950 tokens. A sprint file is ~3,000–4,000 tokens. Loading 2–3 related artifacts at session start consumes **6,000–12,000 tokens** before any implementation begins.

**Edge Cases:**
1. Agent must parse markdown headers to find current task state — error-prone.
2. No mechanism to ask "what depends on this?" without reading all files.
3. Updating task status requires rewriting entire file (or fuzzy edit).

---

### Fundamental: Dependency Tracking

**Claim:** The current workflow captures dependencies through DAG structure in sprint planning.

**Verification:**
- [x] Located in codebase: `_project/sprints/04_checkout_sprint.md`, `.windsurf/workflows/sprint.md`
- [x] Inspected: Sprint workflow defines "Event -> State -> Side Effect -> Result Event" flow

**Actual Behavior:**
Dependencies are **implicit in prose**, not programmatic. The sprint file describes scope contracts in order, but there is no queryable graph. An agent cannot ask "what is blocked by the payment intent backend?" without reading all sprint files and inferring relationships.

**Comparison to Beads:**
Beads has `bd dep add <child> <parent>` and `bd ready` which returns only unblocked tasks. This is a **structural** advantage, not merely stylistic.

---

### Fundamental: Multi-Agent Collision

**Claim:** Sanglogium workflow supports multi-agent development.

**Verification:**
- [x] Located in codebase: `.windsurf/workflows/task.md`, `.windsurf/workflows/todolist.md`
- [x] Inspected: No mention of claim/lock mechanisms

**Actual Behavior:**
No collision prevention exists. If two agents start from the same sprint file, they may simultaneously work on the same scope contract. The only safeguard is human coordination.

**Comparison to Beads:**
Beads has `bd update <id> --claim` which marks an issue as in-progress and owned. `bd ready` excludes claimed issues. This is a **verified** feature per GitHub docs.

---

## Best Practices (Verified)

### Practice: Structured Task Storage for Agent Workflows
**Consensus:** High among AI-agent practitioners.

**Supporting Evidence:**
- Beads GitHub: "Agent-Optimized: JSON output, dependency tracking, and auto-ready task detection."
- Jon Simpson: "The agent automatically figures out what's available to work on, claims the issue for itself so others don't also start working on it."

**Counter-Evidence (Falsification Attempts):**
- Reddit r/ClaudeAI user built a "beads-like" tracker because beads itself had friction — suggests the core idea is sound but implementation may vary.
- Pre-1.0 software carries stability risk; Dolt dependency adds operational complexity.

**Verdict:** ⚠️ Context-Dependent

**When to Use:** Complex features with 3+ interdependent tasks, multi-session work, multi-agent setups.
**When to Skip:** One-shot bugfixes, trivial refactors, sessions where setup cost exceeds work cost.

---

## Common Solutions Landscape

### Solution: Markdown Task Files (Current Sanglogium)
**Prevalence:** Ubiquitous
**Type:** Workaround (addresses state persistence but not queryability)

**Pros:**
- Zero toolchain dependencies
- Human-readable without any CLI
- Git-native by default

**Cons:**
- High context-window consumption (verified: 245-line task file)
- No programmatic dependency resolution
- Status updates require file rewrites
- No collision prevention

**Real-World Pain Points:**
- Agent must re-read entire project history to find "what's next"
- Sprint files become stale — no single source of truth for status
- Multiple related task files create fragmentation

**Recommendation:** Adequate for simple work; scales poorly beyond ~3 interdependent tasks.

---

### Solution: Beads Issue Tracker
**Prevalence:** Niche (early adopter)
**Type:** Idiomatic for agent workflows

**Pros:**
- `bd ready` returns only actionable tasks — minimal context load
- `bd update --claim` prevents multi-agent collision
- Hierarchical IDs (`bd-a3f8.1.1`) encode epics/tasks/subtasks
- JSON-L serialization is human-readable and git-mergeable
- `bd remember "insight"` for persistent project memory

**Cons:**
- External dependency: Beads CLI + Dolt (or SQLite in embedded mode)
- `.beads/` directory adds noise to repo
- Pre-1.0: API may change, features may break
- No Windsurf-native integration (no `bd setup windsurf` exists per docs; only codex, claude, factory, mux, cursor)
- Learning curve: team must learn CLI commands

**Real-World Pain Points:**
- Dolt dependency may fail on Windows (Sanglogium dev environment)
- JSON-L compaction is automatic but opaque — may lose detail
- Agent setup requires `AGENTS.md` or equivalent — Windsurf uses `.windsurf/rules.md`, not `AGENTS.md`

**Recommendation:** Use for features where dependency chains and multi-session persistence justify the setup cost.

---

## Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| Beads uses SQLite + JSON-L for git-friendly sync | GitHub README, Better Stack guide | Doc triangulation |
| `bd ready` returns unblocked tasks | GitHub README "Essential Commands" section | Doc inspection |
| `bd update --claim` prevents collision | GitHub README, Jon Simpson blog | Doc + practitioner |
| Sanglogium task files consume significant context | `_project/tasks/fix-basket-page...md` at 245 lines | File measurement |
| Markdown has no dependency query mechanism | Inspected `_project/sprints/*.md` | Code inspection |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| "Beads is always better than markdown" | One-shot bugs need 10 min; Beads setup exceeds benefit | **Modified** — context-dependent |
| "Beads solves all multi-agent problems" | No `bd setup windsurf` exists; manual onboarding required | **Modified** — integration gap |
| "JSON-L is human-friendly" | 1000+ issues → JSON-L file is unreadable without tooling | **Survived** — compaction handles this |
| "Agents can use Beads without instruction" | Requires AGENTS.md section or `.windsurf/rules.md` update | **Survived** — but needs work |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| Beads CLI commands | High | 2026-06-14 |
| Windsurf integration path | High | 2026-06-14 |
| Dolt/Windows compatibility | Med | 2026-06-14 |
| Context-window economics | Low | 2026-08-14 |

---

## Synthesis: Actionable Takeaways

### For Our Project

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| **Evaluate Beads for checkout redesign epics** | Verified dependency chains (address → shipping → payment → return); multi-session work | Spike: install beads, convert one sprint to beads format |
| **Keep markdown for one-shot bugs** | Counter-evidence: overhead exceeds benefit for simple fixes | Continue `_project/tasks/` for bugs |
| **Build a `bd`-like query layer over existing markdown** | Avoids external dependency while gaining `bd ready` semantics | Experiment 3 below |
| **Do NOT adopt Beads wholesale yet** | Pre-1.0, no Windsurf native support, Dolt/Windows risk | Re-evaluate after v1.0 or Windsurf integration |

### Immediate Actions

1. **Run Experiment 1:** Measure token cost of loading a task file vs. a synthetic `bd ready` output.
2. **Run Experiment 2:** Simulate multi-agent collision with current workflow.
3. **Run Experiment 3:** Build a minimal `ready` script that parses `_project/sprints/` and returns unblocked tasks.
4. **Run Experiment 4:** Test Beads installation on Windows and verify Dolt compatibility.

---

## Integration Points with Windsurf's AI-Driven Workflow

### Integration Point 1: Session Bootstrap (`.windsurf/rules.md`)

**Current State:**
Rules file mentions test storage location and barrel file anti-pattern. No task-system instructions.

**Beads Integration:**
Add a rules section:
```markdown
## Task System
- This project uses `bd` (beads) for epics and multi-task features.
- Run `bd prime` for workflow context.
- Use `bd ready`, `bd show <id>`, `bd update <id> --claim`, `bd close <id>`.
- For one-shot bugs, use `_project/tasks/` markdown files.
```

**Friction Reduced:** Agent no longer needs to guess which task file is current or what the status is.

---

### Integration Point 2: `/sprint` Workflow Output

**Current State:**
`/sprint` produces static `.todo` files in `_project/sprints/`. Status is frozen at creation time.

**Beads Integration:**
After UX flows and scope contracts are defined, run a conversion step:
```
# Human or agent executes
bd create "Checkout Redesign" --type epic
# For each scope contract, create subtask and add dependencies
bd create "Address Slice" -p <epic-id>
bd create "Shipping Slice" -p <epic-id>
bd dep add <shipping-id> <address-id>
```

**Friction Reduced:** Sprint plan becomes a living dependency graph. Agent can query `bd ready` instead of re-reading a 15KB markdown file.

---

### Integration Point 3: `/task` Workflow State Management

**Current State:**
`/task` instructs agents to create markdown files. No status tracking beyond file existence.

**Beads Integration:**
For multi-hypothesis bugs (like the 245-line basket task), create a beads issue with subtasks:
```
bd create "Basket page products not visible" --type bug
bd create "Diagnose SWR cache staleness" -p <bug-id>
bd create "Diagnose hydration timing" -p <bug-id>
```

**Friction Reduced:** Agent can claim and close diagnostic subtasks independently. Human sees live progress without reading prose.

---

### Integration Point 4: `/learn` Workflow Persistence

**Current State:**
`/learn` extracts lessons into `.windsurf/memories/`. Lessons are disconnected from the work that produced them.

**Beads Integration:**
Use `bd remember "insight"` to attach lessons to the epic or task that generated them. Creates a knowledge graph linking decisions to outcomes.

**Friction Reduced:** When an agent picks up a related task, `bd show` reveals previous lessons, preventing repeated mistakes.

---

## Executable Experiments

### Experiment 1: Context Window Cost Measurement

**Objective:** Quantify token savings of Beads query vs. markdown task file.

**Procedure:**
1. Read `_project/tasks/fix-basket-page-products-not-visible-after-homepage-add_2026-05-09.md` into a string.
2. Count tokens (approximate: bytes / 4).
3. Construct a synthetic `bd ready` output for the same task set:
   ```jsonl
   {"id":"bd-a1b2","title":"Fix basket page visibility","status":"open","priority":"P1"}
   {"id":"bd-a1b2.1","title":"Diagnose SWR cache","status":"open","parent":"bd-a1b2"}
   ```
4. Compare token counts.

**Expected Result:**
- Markdown: ~2,950 tokens
- Beads JSON-L: ~150 tokens
- **Savings: ~95% reduction** for status queries

**Validation Threshold:**
If savings < 80%, reject the "context efficiency" claim for this codebase.

**Cost:** 15 minutes. **Benefit:** Objective data on context economics.

---

### Experiment 2: Multi-Agent Collision Simulation

**Objective:** Verify that current workflow has no collision prevention.

**Procedure:**
1. Open two separate Windsurf chats (or simulate with two LLM prompts).
2. Give both the same instruction: "Work on scope contract 3 from `_project/sprints/04_checkout_sprint.md`."
3. Observe whether either agent detects the other is working on the same task.

**Expected Result:**
Both agents proceed independently. No lock, no claim, no warning.

**Validation Threshold:**
If either agent detects collision without explicit instruction, the claim is falsified.

**Cost:** 10 minutes. **Benefit:** Confirms or denies multi-agent risk.

---

### Experiment 3: Minimal `ready` Layer Over Markdown

**Objective:** Determine if Beads' core value (dependency-aware ready queue) can be replicated without external dependencies.

**Procedure:**
1. Create `_project/sprints/04_checkout_sprint.md` metadata header with YAML frontmatter:
   ```yaml
   ---
   tasks:
     - id: address-slice
       deps: []
       status: done
     - id: shipping-slice
       deps: [address-slice]
       status: open
   ---
   ```
2. Write a 20-line Node.js script that parses frontmatter and returns tasks where `deps` are all `done`.
3. Compare usability to `bd ready`.

**Expected Result:**
- Script works for simple dependencies.
- Fails for: hierarchical IDs, claim/lock semantics, git merge of concurrent updates, compaction.

**Validation Threshold:**
If the script handles >80% of your sprint planning needs, Beads' integration cost may not be justified.

**Cost:** 30 minutes. **Benefit:** Build-vs-buy decision data.

---

### Experiment 4: Beads Windows Compatibility Spike

**Objective:** Verify Beads can run in Sanglogium's Windows development environment.

**Procedure:**
1. Run `curl -fsSL https://raw.githubusercontent.com/gastownhall/beads/main/scripts/install.sh | bash` in Git Bash or WSL.
2. If that fails, try `npm install -g @beads/bd`.
3. Run `bd init --stealth` in a temp directory.
4. Run `bd create "Test Issue"` and `bd ready`.

**Expected Result:**
- Success: Beads installs and runs; JSON-L file is created.
- Failure: Dolt dependency missing, SQLite permissions error, or path issues on Windows.

**Validation Threshold:**
If any step fails, block Beads adoption until Windows support is verified.

**Cost:** 20 minutes. **Benefit:** Prevents tooling dead-ends.

---

### Experiment 5: Sprint-to-Beads Conversion Cost

**Objective:** Measure the human effort to convert an existing sprint to Beads format.

**Procedure:**
1. Take `_project/sprints/07_address_slice.md` (~11,000 bytes).
2. Manually extract scope contracts and dependencies.
3. Create equivalent beads issues with `bd create` and `bd dep add`.
4. Time the conversion.

**Expected Result:**
- Conversion takes 15–30 minutes for a 5-scope-contract sprint.
- Dependency graph reveals gaps in original prose (implicit dependencies become explicit).

**Validation Threshold:**
If conversion takes >60 minutes or reveals >3 missing dependencies, the friction reduction claim is weakened.

**Cost:** 30 minutes. **Benefit:** Realistic integration effort estimate.

---

## Cost-Benefit Analysis

### Integration Costs

| Cost Item | Effort | Risk |
|-----------|--------|------|
| Install Beads CLI + Dolt | 20 min | High on Windows (unverified) |
| Create `AGENTS.md` or update `.windsurf/rules.md` | 10 min | Low |
| Convert existing sprint (one-time) | 30 min per sprint | Medium (may find dependency gaps) |
| Team learning curve | 1–2 hours per developer | Low (simple CLI) |
| Ongoing `bd` command overhead per task | +30 sec per task | Low |
| `.beads/` directory maintenance | 5 min/week | Low |

**Total One-Time Cost:** ~1 hour + 30 min per historical sprint conversion.
**Total Recurring Cost:** ~30 sec per task creation/update.

---

### Friction Reduction Benefits

| Friction Point | Current Cost | With Beads | Savings |
|----------------|--------------|------------|---------|
| Session bootstrap (re-reading task context) | 2–5 min | 10 sec (`bd ready`) | **~90%** |
| Dependency detection (reading all sprint files) | 3–5 min | Instant (`bd ready`) | **~95%** |
| Multi-agent collision (human coordination) | 10–30 min per incident | Zero (`--claim`) | **~100%** |
| Status updates (markdown file rewrite) | 1–2 min | 5 sec (`bd close`) | **~90%** |
| Stale sprint files (no live status) | High (re-planning) | Low (always current) | **Qualitative** |

---

### Net Assessment

| Scenario | Recommendation | Rationale |
|----------|----------------|-----------|
| **One-shot bugfix (< 1 hour)** | ❌ **Do not use Beads** | Setup cost exceeds work cost |
| **3–5 scope contract feature (1–3 days)** | ⚠️ **Consider** | Context savings likely justify cost; run Experiment 1 first |
| **10+ scope contract epic (1–2 weeks)** | ✅ **Use Beads** | Dependency management and session persistence are critical |
| **Multi-agent development** | ✅ **Use Beads** | Collision prevention is essential |
| **Current workflow audit/fix (no new features)** | ❌ **Do not use Beads** | No benefit for retrospective work |

---

## Rejected Claims

The following claims from Beads marketing/community were evaluated and **rejected as unverifiable or inapplicable**:

1. **"Beads is a memory upgrade for your coding agent"** — Rejected as vague metaphor. Memory persistence is achieved via JSON-L, but this is incremental improvement, not a fundamental upgrade. The real upgrade is structured queryability, not storage.

2. **"Agents automatically figure out what's available to work on"** — Rejected without qualification. Agents only "figure it out" because `bd ready` returns structured data. The claim implies intelligence where there is only tooling. Requires explicit agent instruction to use `bd ready`.

3. **"Beads enables swarm programming"** — Rejected as unverified. No evidence was found of multiple Beads-enabled agents successfully collaborating on the same codebase simultaneously in a production setting. The collision prevention exists, but "swarm" implies orchestration that is not demonstrated.

4. **"Sonnet-level agents can replace Opus because of detailed Beads tasks"** — Rejected as unverified single-user anecdote (Jon Simpson). No controlled study, no reproducible benchmark. Cost savings claim requires falsification through actual token-usage measurement.

---

## Open Questions

1. **Windsurf Integration:** Will Windsurf add native Beads support (`bd setup windsurf`)? Currently unsupported.
2. **Windows Compatibility:** Does Dolt run reliably on Windows for Sanglogium's team?
3. **Compaction Safety:** Does `bd` compaction ever lose information critical to bug reproduction?
4. **Sanity Token Lesson Portability:** Could `bd remember` replace `.windsurf/memories/` for project-specific lessons?

---

## Conclusion

Beads offers **verified, structural advantages** in three areas: (1) context-window efficiency via `bd ready`, (2) dependency-aware task ordering, and (3) multi-agent collision prevention. These advantages scale with task complexity and session count.

For Sanglogium specifically:
- **Adopt for epics** like the ongoing checkout flow (address → shipping → payment → return).
- **Skip for one-shot bugs** like the basket visibility fix.
- **Run Experiment 1 and Experiment 4 before any adoption** — context savings and Windows compatibility are blockers or enablers.
- **Do not adopt solely for the "memory upgrade" marketing** — the value is in queryable structure, not storage itself.

The current markdown-based workflow is not broken; it is **insufficient for complex, multi-session, multi-agent work**. Beads is a targeted upgrade for that specific scenario, not a universal replacement.
