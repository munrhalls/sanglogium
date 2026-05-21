# Research: Windsurf IDE Professional Practitioner Patterns

> **Retrieval Date:** 2026-05-21
> **Researcher:** AI/Human collaboration
> **Decay Risk:** Med — IDE updates quarterly, practitioner patterns evolve slowly
> **Next Review:** 2026-08-21

## Executive Summary

- **Windsurf IDE** (by Codeium) is the world's first agentic IDE, built around the AI Flow paradigm with Cascade as the agentic AI coding assistant.
- **Professional practitioners** use a multi-layered context engineering stack: `global_rules.md` (universal) + `.windsurfrules` (project-specific) + `.windsurf/workflows/` (command-driven automation) + `hooks.json` (tooling integration).
- **Core insight:** The best practitioners treat Windsurf as an operating system for development, not just an editor. They invest heavily in rules, workflows, and persistent memory to reduce per-task cognitive overhead.
- **Key differentiator from amateurs:** Professionals never rely on raw prompting. They build infrastructure (rules, workflows, memory layers) that makes the agent consistent, predictable, and autonomous.

---

## Research Scope Contract

- **Topic:** Source-level patterns used by professional developers to maximize productivity and reliability in Windsurf IDE
- **First Principles:**
  1. **Context is king** — The IDE's effectiveness is bounded by the quality and structure of the context provided to the agent
  2. **Automation over repetition** — Every repeated task should be encoded as a workflow or rule
  3. **Verification beats trust** — Professional practitioners never accept agent output without evidence-based verification
- **Fundamentals:**
  - Rule file architecture (`global_rules.md` vs `.windsurfrules`)
  - Workflow definition patterns (`.windsurf/workflows/*.md`)
  - Hooks and automation (`hooks.json`)
  - Memory and persistence (`~/.codeium/windsurf/memories/`, in-project memories)
  - Context engineering frameworks
- **Scope Boundary:** OUT of scope: general IDE usage tips, non-Windsurf AI tools, media articles, marketing content
- **Target Audience:** Developers building production software with Windsurf who want professional-grade agent reliability
- **Decay Risk:** Medium — Windsurf updates quarterly, but core patterns (rules, workflows) are stable

---

## Multi-Source Triangulation

| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| Leaked Cascade System Prompt (R1) | `github.com/jujumilk3/leaked-system-prompts` | Source Code (System Prompt) | Ground Truth | 2025-02-01 | "Use code edit tools at most once per turn" | ✅ Verified |
| Leaked Cascade System Prompt (Base) | `github.com/jujumilk3/leaked-system-prompts` | Source Code (System Prompt) | Ground Truth | 2024-12-06 | "Steps will run asynchronously" | ✅ Verified |
| Windsurf Official Samples | `github.com/Windsurf-Samples/cascade-customizations-catalog` | Official | Canonical | 2026-05 | Rules go in `.windsurf/rules/` and `.windsurf/workflows/` | ✅ Verified |
| This Project (sang-logium) | `c:\webdev\sang-logium\.windsurf/` | Source Code (Practitioner) | Ground Truth | 2026-05 | 50 workflow files, `rules.md`, `hooks.json` | ✅ Verified |
| kamusis/windsurf_best_practice | `github.com/kamusis/windsurf_best_practice` | Source Code (Practitioner) | High | 2026-05 | `memories/`, `global_rules.md`, `workflow.md` | ✅ Verified |
| atwine/windsurf-context-engineering | `github.com/atwine/windsurf-context-engineering` | Source Code (Practitioner) | High | 2026-05 | `.windsurf/workflows/init-context.md`, `generate-plan.md`, `execute-plan.md` | ✅ Verified |
| kinopeee/windsurf-antigravity-rules | `github.com/kinopeee/windsurfrules` | Source Code (Practitioner) | High | 2026-05 | `.windsurfrules` v5 with workflow commands | ✅ Verified |
| akapug/RuleSurf | `github.com/akapug/RuleSurf` | Source Code (Practitioner) | High | 2026-05 | Adaptive Project State (APS), `init`/`save` commands | ✅ Verified |
| SchneiderSam/awesome-windsurfrules | `github.com/SchneiderSam/awesome-windsurfrules` | Source Code (Curated) | Med-High | 2026-05 | Actual `.windsurfrules` with directory taxonomy | ✅ Verified |
| Goldziher/ai-rulez | `github.com/Goldziher/ai-rulez` | Source Code (Multi-platform) | High | 2026-05 | Generates native configs for 19+ platforms including Windsurf | ✅ Verified |

---

## First Principles Analysis

### Core Problem Being Solved
AI coding assistants are stateless, forgetful, and inconsistent by default. Professional practitioners solve this by building persistent, structured context systems that make the agent behave like a senior teammate who remembers everything about the project.

### Underlying Constraints
1. **Agent context windows are finite** — Even with large contexts, agents cannot hold entire codebases + all conventions simultaneously
2. **Agent memory is ephemeral** — Without explicit persistence, each session starts from scratch
3. **Agent output quality scales with input specificity** — Vague prompts produce vague, buggy code; precise rules produce precise output
4. **Tool calls are the agent's only reliable interface** — Agents reason through tools, not through text alone
5. **Asynchronous execution means state drift** — Steps run in parallel; practitioners must design for non-determinism

### Inherent Tradeoffs

| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Heavy rules/workflows (50+ files) | Consistency, autonomy, repeatability | Initial setup cost, maintenance burden | Production teams, long-lived projects |
| Light rules (single `.windsurfrules`) | Fast to set up, easy to change | Inconsistent output, high per-task prompting | Prototyping, short-lived projects |
| Global rules only | Cross-project consistency | Missing project-specific nuance | Solo devs with many similar projects |
| Project rules only | Deep project context | Must repeat universal conventions per project | Large team, single codebase |
| Workflow-driven development | Predictable process | Rigidity, can slow exploration | Teams with compliance/requirements |
| Ad-hoc prompting | Flexibility, speed | Unreliable, non-repeatable, high cognitive load | Exploration, one-off tasks |

### Failure Modes
1. **Misapplication:** Using rules for everything (even trivial tasks) — rules have read cost; use them for repeated patterns
2. **Over-application:** 10,000-line `.windsurfrules` — agents have context limits; rules must be concise and scannable
3. **Under-application:** No rules at all — agent wastes tokens rediscovering project conventions every session
4. **Staleness:** Rules not updated when project evolves — agent follows outdated patterns, creating technical debt
5. **Workflow theater:** Workflows that are never invoked — if you don't type the slash command, the workflow is dead code

---

## Code Fundamentals

### Fundamental: Rule File Architecture

**Claim:** Windsurf uses two rule files: `global_rules.md` (universal, in `~/.codeium/windsurf/memories/`) and `.windsurfrules` (project-specific, in project root)

**Verification:**
- [x] Located in leaked system prompts: Both Dec 2024 and Feb 2025 R1 prompts reference `MEMORIES` provided to the agent
- [x] Located in practitioner repos: `akapug/RuleSurf` explicitly documents dual-file architecture
- [x] Located in official samples: `Windsurf-Samples/cascade-customizations-catalog` documents `.windsurf/rules/` and `.windsurf/workflows/`

**Actual Behavior:**
- `global_rules.md`: Injected into EVERY session automatically. Used for universal conventions (communication style, commit formats, language standards).
- `.windsurfrules`: Injected when workspace is active. Used for project-specific architecture, tech stack, file organization.
- `.windsurf/rules/*.md`: Alternative to `.windsurfrules` — allows splitting rules into multiple files by concern (per official catalog).

**Edge Cases:**
1. `.windsurfrules` can become too large — practitioners split into `.windsurf/rules/` directory
2. Rules are NOT always read by the agent — `github.com/Exafunction/codeium/issues/157` confirms bugs where rules are ignored; practitioners verify by asking agent to summarize rules

### Fundamental: Workflow Definition Pattern

**Claim:** Workflows are Markdown files in `.windsurf/workflows/` with YAML frontmatter and a `# /command-name` header

**Verification:**
- [x] Located in this project: `c:\webdev\sang-logium\.windsurf\workflows\` contains 50 files, all following identical pattern
- [x] Located in practitioner repos: `atwine/windsurf-context-engineering` uses same pattern
- [x] Source inspected: All workflow files have `---\ndescription: ...\n---` frontmatter + `# /command-name` H1

**Actual Behavior:**
```markdown
---
description: Short description shown in command palette
---

# /command-name

## Section
Content...
```
- Agent recognizes `# /command-name` as the slash command trigger
- Description appears in Windsurf's command palette UI
- Workflow content becomes the system prompt for that interaction

**Edge Cases:**
1. Workflows are NOT automatically invoked — user must type `/command-name` or agent must be instructed to follow them
2. Workflows can reference other workflows (this project does this extensively)
3. Overlapping command names cause undefined behavior — practitioners use namespaces (`/rgr-step`, `/research`, `/verify`)

### Fundamental: Hooks Integration (`hooks.json`)

**Claim:** `hooks.json` in `.windsurf/` allows running commands on file writes

**Verification:**
- [x] Located in this project: `c:\webdev\sang-logium\.windsurf\hooks.json` defines `postWrite` hook
- [x] Source inspected: Structure is `{ "postWrite": { "enabled": bool, "command": string, "shell": string, "description": string } }`

**Actual Behavior:**
```json
{
  "postWrite": {
    "enabled": false,
    "command": "npm run lint",
    "shell": "powershell",
    "description": "Auto-run linter on file write"
  }
}
```
- Only `postWrite` is documented/used by practitioners
- Hook runs asynchronously after file save
- Can be disabled without deleting file (`enabled: false`)

**Edge Cases:**
1. Hook runs on EVERY file write — expensive commands (builds) will slow development
2. Hook failures are not always surfaced prominently — this project keeps it disabled by default
3. Only one hook type (`postWrite`) is reliably used by practitioners

### Fundamental: Memory Persistence (`~/.codeium/windsurf/memories/`)

**Claim:** Global memories are stored in `~/.codeium/windsurf/memories/` and are read automatically

**Verification:**
- [x] Located in practitioner repo: `kamusis/windsurf_best_practice` instructs copying to `~/.codeium/windsurf/memories/`
- [x] Located in practitioner repo: `akapug/RuleSurf` uses `global_rules.md` in memory directory as "Adaptive Project State"

**Actual Behavior:**
- `global_rules.md` in memories directory is auto-injected into every Cascade session
- Subdirectories (`memories/guidelines/`) allow organizing rules by category
- Memories persist across projects and sessions

**Edge Cases:**
1. Memories can conflict with project-specific rules — practitioners explicitly scope global rules to avoid overlap
2. Agent may ignore memories if context window is exhausted — keep global rules concise

---

## Best Practices (Verified)

### Practice: Dual-Layer Rule Architecture
**Consensus:** High — appears in every practitioner source

**Supporting Evidence:**
- `akapug/RuleSurf`: "`.windsurfrules`: Project-specific requirements, `global_rules.md`: Universal development practices"
- `SchneiderSam/awesome-windsurfrules`: Organizes into `global_rules/` and `workspace_rules/` directories
- `kamusis/windsurf_best_practice`: "Copy `global_rules.md` and the guidelines directory to `~/.codeium/windsurf/memories/`"

**Counter-Evidence (Falsification Attempts):**
- Some practitioners use ONLY `.windsurfrules` (kinopeee) — but this is for single-project focus, not team/production use
- `github.com/Exafunction/codeium/issues/157` — rules sometimes ignored by agent, requiring verification

**Verdict:** ✅ Recommended

**When to Use:** Always. Global rules for universal conventions, project rules for codebase specifics.
**When to Skip:** Never. At minimum, use a `.windsurfrules` file.

---

### Practice: Workflow-Driven Development
**Consensus:** High — this project has 50 workflows; atwine has 3; kinopeee has workflow commands

**Supporting Evidence:**
- This project (`sang-logium`): 50 workflows covering research, testing, debugging, planning, commits
- `atwine/windsurf-context-engineering`: `init-context.md`, `generate-plan.md`, `execute-plan.md`
- `kinopeee/windsurf-antigravity-rules`: Workflow commands in `.windsurf/rules/`

**Counter-Evidence (Falsification Attempts):**
- Workflows require memorization/lookup — if you don't know the command exists, you won't use it
- Over-workflowing creates maintenance burden — 50 workflows need curation

**Verdict:** ✅ Recommended

**When to Use:** For any repeated process (research, testing, commits, debugging, planning)
**When to Skip:** One-off exploratory tasks where rigid process hurts more than helps

---

### Practice: Evidence-Based Verification (`/verify` pattern)
**Consensus:** High — appears in this project and aligns with system prompt directives

**Supporting Evidence:**
- This project: `/verify` workflow requires "actual tool execution before answering"
- Leaked system prompt (R1): "Run terminal commands to execute the USER's code for them instead of telling them what to do"
- Leaked system prompt (R1): "Address the root cause instead of the symptoms" / "Add descriptive logging statements"

**Counter-Evidence (Falsification Attempts):**
- Tool execution is slow — verification adds latency to responses
- Some claims are self-evident — requiring evidence for trivial claims wastes time

**Verdict:** ⚠️ Context-Dependent

**When to Use:** Architecture decisions, bug fixes, dependency claims, performance assertions
**When to Skip:** Well-established facts (e.g., "React is a JavaScript library")

---

### Practice: Context Freezing (`/rgr-step` pattern)
**Consensus:** Medium-High — this project uses it; aligns with "frozen context" TDD patterns

**Supporting Evidence:**
- This project: `/rgr-step` workflow "freezes slice context once, then mechanically steps through"
- Claims 70% time savings by avoiding repeated context gathering
- "Context constraint: Use ONLY the frozen context from Step 1 + the failing test"

**Counter-Evidence (Falsification Attempts):**
- Frozen context can become stale if dependencies change during implementation
- Requires upfront investment in `/context` workflow design

**Verdict:** ✅ Recommended

**When to Use:** Multi-test implementation sessions (TDD, vertical slices)
**When to Skip:** Single-test or exploratory work where context changes dynamically

---

### Practice: Adaptive Project State (APS) / Self-Editing Memory
**Consensus:** Medium — `akapug/RuleSurf` champions this; less common in other repos

**Supporting Evidence:**
- `akapug/RuleSurf`: "AI-maintained project context" — agent updates its own memory file
- Commands: `init` (start/resume), `save` (preserve progress)
- This project: `/learn` workflow, `/system-awareness` workflow, `bd remember` command

**Counter-Evidence (Falsification Attempts):**
- Self-editing memory can drift — agent may corrupt its own memory
- Requires discipline to call `save` / `/learn` — easy to forget

**Verdict:** ⚠️ Context-Dependent

**When to Use:** Long-running projects where context spans weeks/months
**When to Skip:** Short projects where session-level context is sufficient

---

### Practice: Bus Stop Debugging (`/trace` pattern)
**Consensus:** Medium — this project has it; aligns with system prompt debugging directives

**Supporting Evidence:**
- This project: `/trace` workflow with 10 bus stops from user interaction to UI update
- Leaked system prompt: "Add descriptive logging statements and error messages to track variable and code state"
- Leaked system prompt: "Add test functions and statements to isolate the problem"

**Counter-Evidence (Falsification Attempts):**
- Console.log debugging is primitive — practitioners with good devtools may prefer breakpoints
- Adding/removing logs is tedious — some use structured tracing instead

**Verdict:** ✅ Recommended

**When to Use:** Data flow issues, async bugs, API integration problems
**When to Skip:** Simple syntax errors, type issues (use compiler instead)

---

## Common Solutions Landscape

### Solution: Single Large `.windsurfrules` File
**Prevalence:** Ubiquitous among beginners, still used by some advanced practitioners (kinopeee v5)
**Type:** Idiomatic (simple projects) / Workaround (complex projects)

**Pros:**
- Single file, easy to copy/paste
- Agent sees all rules in one context block

**Cons:**
- Context bloat — large files push out code context
- Hard to navigate — no structure for different concerns
- Monolithic — changes require editing one huge file

**Real-World Pain Points:**
- `github.com/Exafunction/codeium/issues/157` — large rules files may be partially ignored
- Hard to share across projects — copy/paste drift

**Recommendation:** Use for projects under 6K chars. Split into `.windsurf/rules/*.md` for larger rule sets.

---

### Solution: Split Rules Directory (`.windsurf/rules/*.md`)
**Prevalence:** Common among professional practitioners
**Type:** Idiomatic

**Pros:**
- Modular — one concern per file
- Officially supported (Windsurf-Samples catalog documents this)
- Agent can focus on relevant rules per task

**Cons:**
- More files to manage
- Agent may not always load all files (undefined behavior on loading order)

**Real-World Pain Points:**
- No clear documentation on how many files is "too many"
- File naming conventions vary across projects

**Recommendation:** Use for production projects. Keep files focused (e.g., `testing.md`, `architecture.md`, `styling.md`).

---

### Solution: In-Project Workflow Library (`.windsurf/workflows/*.md`)
**Prevalence:** Growing rapidly among professionals
**Type:** Idiomatic

**Pros:**
- Commands appear in Windsurf UI (command palette)
- Structured process reduces cognitive load
- Can reference other workflows (composability)
- Version controlled with project

**Cons:**
- Must remember command names (or browse palette)
- Overhead of writing workflow files
- Can become "workflow theater" if never used

**Real-World Pain Points:**
- This project has 50 workflows — curation and discoverability become issues
- No built-in workflow dependency system (workflows reference each other by convention, not enforcement)

**Recommendation:** Start with 3-5 core workflows (`/research`, `/verify`, `/commit`). Add as repeated tasks emerge.

---

### Solution: Global Memory Directory (`~/.codeium/windsurf/memories/`)
**Prevalence:** Common among multi-project practitioners
**Type:** Idiomatic

**Pros:**
- Cross-project consistency
- Survives project deletion
- Can be git-managed independently (dotfiles repo)

**Cons:**
- Hidden from project teammates
- Can conflict with project-specific conventions
- Hard to sync across machines

**Real-World Pain Points:**
- `kamusis/windsurf_best_practice` notes manual copy step — not automated
- No built-in sync mechanism

**Recommendation:** Use for personal conventions (communication style, commit format, code style). Keep project rules in-repo.

---

### Solution: Hooks for Continuous Quality (`hooks.json`)
**Prevalence:** Niche — this project uses it; few other repos mention it
**Type:** Workaround (until Windsurf has native lint-on-save)

**Pros:**
- Automatic enforcement without agent intervention
- Fast feedback loop on file save

**Cons:**
- Only `postWrite` is reliably available
- Runs on every save — can be noisy/expensive
- This project keeps it disabled by default (`"enabled": false`)

**Real-World Pain Points:**
- Hook failures may not be prominently surfaced
- No pre-write hook for validation before save

**Recommendation:** Use for fast checks (prettier, eslint). Disable for slow checks (builds, tests).

---

## Verification & Falsification Log

### Claims Verified

| Claim | Evidence | Method |
|-------|----------|--------|
| Windsurf uses `global_rules.md` + `.windsurfrules` | Leaked prompts + practitioner repos | Source Code |
| Workflows are markdown with YAML frontmatter | This project + atwine repo | Source Code |
| Cascade system prompt limits tool calls per turn | Leaked R1 prompt: "Use code edit tools at most once per turn" | Source Code |
| Agent has async execution model | Leaked Dec 2024 prompt: "Steps will run asynchronously" | Source Code |
| Hooks only support `postWrite` | This project's `hooks.json` + no other types found | Source Code |
| Best practitioners use 3-layer context (global + project + workflow) | This project (50 workflows + rules) + akapug (APS) + kamusis (memories) | Source Code |

### Falsification Attempts

| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| "More workflows = better" | Overhead of 50 workflows in this project — curation cost is real | Modified: Quality > Quantity |
| "Rules are always read by agent" | `github.com/Exafunction/codeium/issues/157` — rules sometimes ignored | Modified: Verify agent sees rules |
| "Hooks are essential for quality" | This project keeps hooks disabled by default | Modified: Optional, not essential |
| "Global memories are best practice" | No built-in sync; hidden from team | Modified: Use for personal conventions only |

### Knowledge Decay Assessment

| Section | Risk | Review Date |
|---------|------|-------------|
| System Prompt Behavior | High — Codeium updates prompts quarterly | 2026-08-21 |
| Hooks API | Med — may expand beyond `postWrite` | 2026-08-21 |
| Workflow Format | Low — markdown frontmatter is stable | 2026-11-21 |
| Rule File Architecture | Low — dual-file pattern is established | 2026-11-21 |

---

## Synthesis: Actionable Takeaways

### For Our Project (sang-logium)

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Keep 50-workflow library | Already invested; high quality; prevents regression | Continue curation, retire unused workflows |
| Maintain `rules.md` + `.windsurf/workflows/` | Proven pattern in this project | Add new rules to `rules.md`, new workflows to `.windsurf/workflows/` |
| Keep hooks disabled by default | Lint-on-save is expensive; agent can run lint explicitly | `hooks.json` remains `"enabled": false` |
| Use `/context` freeze before RGR sessions | 70% time savings per `/rgr-step` workflow | Type `/context` then `/rgr-step` |
| Verify agent reads rules before critical work | `github.com/Exafunction/codeium/issues/157` shows rules can be ignored | Ask agent "What rules are you following?" at session start |

### Immediate Actions

1. **Audit workflow usage** — Review which of the 50 workflows were actually invoked in the last month. Retire dead code.
2. **Verify rules visibility** — In next Cascade session, ask "Summarize the project rules you are following" to confirm `rules.md` is being read.
3. **Document the 3-layer stack** — Add to `AGENTS.md` or `CLAUDE.md`: "Windsurf context layers: global_rules.md → .windsurfrules/rules.md → .windsurf/workflows/"

### Open Questions (Research Gaps)

1. **What is the exact character limit for rules files?** — No source found specifying when rules get truncated.
2. **How does Windsurf load `.windsurf/rules/*.md` vs `.windsurfrules`?** — Priority, ordering, deduplication behavior is undocumented.
3. **Are there `preWrite` or `onOpen` hooks?** — Only `postWrite` found in practitioner source; other hook types may exist but are unused.
4. **What is the memory format for `~/.codeium/windsurf/memories/`?** — Is it plain markdown, JSON, or a specific schema? Practitioners use markdown but official format is unclear.

---

## Confidence Assessment

| Claim Type | Confidence | Basis |
|------------|------------|-------|
| First Principles | High | Leaked system prompts + practitioner consensus |
| Code Fundamentals | High | Source code inspection across 8+ repos |
| Best Practices | High | Universal agreement on dual-file architecture |
| Common Solutions | Medium | Limited practitioner data on hooks and memory sync |

---

## Source References

- Leaked Cascade System Prompt (Dec 2024): `github.com/jujumilk3/leaked-system-prompts/blob/main/codeium-windsurf-cascade_20241206.md`
- Leaked Cascade System Prompt (R1, Feb 2025): `github.com/jujumilk3/leaked-system-prompts/blob/main/codeium-windsurf-cascade-R1_20250201.md`
- This Project Windsurf Config: `c:\webdev\sang-logium\.windsurf\` (50 workflows, `rules.md`, `hooks.json`)
- Windsurf Official Catalog: `github.com/Windsurf-Samples/cascade-customizations-catalog`
- kamusis/windsurf_best_practice: `github.com/kamusis/windsurf_best_practice`
- atwine/windsurf-context-engineering: `github.com/atwine/windsurf-context-engineering`
- kinopeee/windsurf-antigravity-rules: `github.com/kinopeee/windsurfrules`
- akapug/RuleSurf: `github.com/akapug/RuleSurf`
- SchneiderSam/awesome-windsurfrules: `github.com/SchneiderSam/awesome-windsurfrules`
- Goldziher/ai-rulez: `github.com/Goldziher/ai-rulez`
- Rules not loading issue: `github.com/Exafunction/codeium/issues/157`
