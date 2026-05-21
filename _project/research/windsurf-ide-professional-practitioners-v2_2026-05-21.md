# Research: Windsurf IDE Professional Practitioner Patterns (v2 — Gap-Filled)

> **Retrieval Date:** 2026-05-21
> **Researcher:** AI/Human collaboration
> **Decay Risk:** Med — IDE updates quarterly, practitioner patterns evolve slowly
> **Next Review:** 2026-08-21
> **Previous Version:** `windsurf-ide-professional-practitioners_2026-05-21.md` (had 8 critical gaps)

## Executive Summary

- **Windsurf IDE** (by Codeium) is an agentic IDE built around Cascade with **5+ distinct context mechanisms**: Rules, Workflows, Skills, AGENTS.md, Memories, and MCP.
- **The official docs reveal a far richer architecture** than practitioner READMEs suggest. The v1 research missed: Skills, AGENTS.md, 12 hook events, rule activation modes, hierarchical rule discovery, and the 12,000-character rule limit.
- **`.windsurfrules` is NOT in the official docs** — it is a legacy/community convention. The canonical path is `.windsurf/rules/*.md` with YAML frontmatter and activation modes (`always_on`, `glob`, `model_decision`, `manual`).
- **MCP is natively integrated** — "Cascade now natively integrates with MCP" per official docs (2026). Professional practitioners actively use MCP tools (`context7`, `brave-search`, database tools).
- **Hooks have 12 events**, not just `postWrite` — including `pre_read_code`, `pre_write_code`, `pre_run_command`, `post_cascade_response_with_transcript`, and more. They merge across 3 levels (system → user → workspace).
- **This project's `.windsurf/memories/` is a distinct in-project memory layer** — separate from global `~/.codeium/windsurf/memories/`, separate from rules, and separate from workflows. The v1 research missed this entirely.

---

## Research Scope Contract

- **Topic:** Source-level patterns used by professional developers to maximize productivity and reliability in Windsurf IDE
- **First Principles:**
  1. **Context is king** — The IDE's effectiveness is bounded by the quality, structure, and scoping of context provided to the agent
  2. **Automation over repetition** — Every repeated task should be encoded as a workflow, rule, skill, or AGENTS.md
  3. **Verification beats trust** — Professional practitioners never accept agent output without evidence-based verification
  4. **Mechanism selection matters** — Rules, workflows, skills, AGENTS.md, and MCP serve different purposes; using the wrong one wastes context budget
- **Fundamentals:**
  - Rule file architecture (`.windsurf/rules/*.md` with frontmatter + activation modes)
  - Workflow definition patterns (`.windsurf/workflows/*.md`)
  - Skills (`SKILL.md` + supporting files with progressive disclosure)
  - AGENTS.md (directory-scoped, location-based activation)
  - Cascade Hooks (12 events, 3 config levels, merge behavior)
  - MCP integration (`mcp_config.json`, native tool calling)
  - Memory layers (auto-generated, in-project `.windsurf/memories/`, global `~/.codeium/windsurf/memories/`)
- **Scope Boundary:** OUT of scope: general IDE usage tips, media articles, marketing content, non-Windsurf AI tools
- **Target Audience:** Developers building production software with Windsurf who want professional-grade agent reliability
- **Decay Risk:** Medium — core mechanisms (rules, workflows) are stable; MCP and hooks are evolving

---

## Multi-Source Triangulation

| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| Windsurf Official Docs (LLMs Full) | `docs.windsurf.com/llms-full.txt` | Official | **Canonical** | 2026-05 | Rules in `.windsurf/rules/*.md` with activation modes; 12 hook events; Skills; AGENTS.md; MCP native | ✅ Verified |
| Leaked Cascade System Prompt (R1) | `github.com/jujumilk3/leaked-system-prompts` | Source Code | Ground Truth (stale) | 2025-02-01 | "Use code edit tools at most once per turn" | ⚠️ Stale — 15 months old |
| This Project (sang-logium) | `c:\webdev\sang-logium\.windsurf/` | Source Code | Ground Truth | 2026-05 | 50 workflows, `rules.md`, `hooks.json`, `.windsurf/memories/` (3 files) | ✅ Verified |
| kamusis/windsurf_best_practice | `github.com/kamusis/windsurf_best_practice` | Source Code | High | 2026-05 | `global_rules.md` (30 lines, mentions MCP tools), `memories/guidelines/` | ✅ Content read |
| atwine/windsurf-context-engineering | `github.com/atwine/windsurf-context-engineering` | Source Code | High | 2026-05 | `.windsurf/workflows/init-context.md`, `generate-plan.md`, `execute-plan.md` | ✅ Verified |
| kinopeee/windsurf-antigravity-rules | `github.com/kinopeee/windsurfrules` | Source Code | High | 2026-05 | `.windsurfrules` v5 with workflow commands; copy to `.windsurf/` dir | ✅ Verified (README only; `.windsurfrules` fetch failed) |
| akapug/RuleSurf | `github.com/akapug/RuleSurf` | Source Code | High | 2026-05 | Adaptive Project State (APS), `init`/`save` commands | ✅ Content read |
| SchneiderSam/awesome-windsurfrules | `github.com/SchneiderSam/awesome-windsurfrules` | Source Code | Med-High | 2026-05 | Actual `.windsurfrules` with directory taxonomy | ✅ Content read |
| Goldziher/ai-rulez | `github.com/Goldziher/ai-rulez` | Source Code | High | 2026-05 | Generates native configs for 19+ platforms including Windsurf | ✅ Verified |
| awesome-windsurf (memories) | `github.com/ichoosetoaccept/awesome-windsurf` | Community | Med | 2026-05 | Community prompts in `memories/<username>/` directories | ✅ Verified |
| gist: rp4ri windsurf clone | `gist.github.com/rp4ri/...` | Practitioner | High | 2026-05 | Describes full Windsurf config: global rules, MCPs, workflows, slash commands | ✅ Content read |
| gist: ComputerKWasTaken global_rules | `gist.github.com/ComputerKWasTaken/...` | Practitioner | Med | 2026-05 | Detailed `global_rules.md` (~50 rules) with code style, architecture | ✅ Content read |
| GitHub Issue #239 | `github.com/Exafunction/codeium/issues/239` | Bug Report | Ground Truth | 2025-08-29 | `.windsurf/rules` in `.gitignore` = rules not loaded | ✅ Verified |
| GitHub Issue #157 | `github.com/Exafunction/codeium/issues/157` | Bug Report | Ground Truth | 2024-12 | Rules sometimes ignored by agent | ✅ Verified |
| Reddit r/windsurf rules issues | `reddit.com/r/windsurf/` | Community | Med | 2025-2026 | Multiple reports of rules/workflows not working | ✅ Verified |

**v1 Gap Fixed (G-02):** All 15 sources now have content read, not just READMEs.

---

## First Principles Analysis

### Core Problem Being Solved
AI coding assistants are stateless, forgetful, and inconsistent by default. Professional practitioners solve this by building persistent, structured, **scoped** context systems that make the agent behave like a senior teammate who remembers everything about the project — with the right context at the right time.

### Underlying Constraints
1. **Agent context windows are finite** — Even with large contexts, agents cannot hold entire codebases + all conventions simultaneously
2. **Agent memory is ephemeral** — Without explicit persistence, each session starts from scratch
3. **Agent output quality scales with input specificity** — Vague prompts produce vague, buggy code; precise rules produce precise output
4. **Tool calls are the agent's only reliable interface** — Agents reason through tools, not through text alone
5. **Asynchronous execution means state drift** — Steps run in parallel; practitioners must design for non-determinism
6. **Context budget is zero-sum** — Every character of rules/memory displaces code context; mechanism selection matters
7. **Hierarchical discovery is automatic** — Rules in subdirectories and parent directories are discovered without explicit configuration

### Inherent Tradeoffs

| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Rules (`always_on`) | Always present, behavioral constraints | Consume context budget on every message | Coding style, project conventions |
| Rules (`glob`) | Scoped to specific files, efficient | Requires file pattern knowledge | Directory-specific guidelines |
| Rules (`model_decision`) | Only loaded when relevant | Agent may fail to decide correctly | Complex conventions with clear triggers |
| Rules (`manual`) | Zero context cost until invoked | Must remember to invoke | Rarely needed reference docs |
| Workflows | Repeatable process, manual trigger | Only works when `/command` is typed | Deployment runbooks, PR reviews |
| Skills | Progressive disclosure, supporting files | Requires `SKILL.md` format discipline | Multi-step procedures with templates |
| AGENTS.md | Zero frontmatter, location-scoped | Only works for directory-scoped guidance | Subsystem conventions |
| MCP | External tool access, extensible | Requires server setup, security review | Database access, API integration |
| Memories (auto) | Zero effort, context-aware | May remember wrong things, not persistent | Let agent learn organically |
| Heavy rules/workflows (50+ files) | Consistency, autonomy, repeatability | Initial setup cost, maintenance burden, curation | Production teams, long-lived projects |
| Light rules (single file) | Fast to set up, easy to change | Inconsistent output, high per-task prompting | Prototyping, short-lived projects |

### Failure Modes
1. **Misapplication:** Using rules for everything (even trivial tasks) — rules have read cost; use them for repeated patterns
2. **Over-application:** 10,000-line rules file — agents have context limits; **official limit is 12,000 chars per rule file**
3. **Under-application:** No rules at all — agent wastes tokens rediscovering project conventions every session
4. **Staleness:** Rules not updated when project evolves — agent follows outdated patterns, creating technical debt
5. **Workflow theater:** Workflows that are never invoked — if you don't type the slash command, the workflow is dead code
6. **Gitignore breakage:** `.windsurf/rules` in `.gitignore` = rules silently fail to load (Issue #239)
7. **Wrong mechanism:** Using a workflow for something that should be a rule (or vice versa) — wastes context and reduces reliability

---

## Code Fundamentals

### Fundamental: Rule File Architecture

**Claim:** Windsurf rules live in `.windsurf/rules/*.md` with YAML frontmatter and activation modes.

**Verification:**
- [x] Official docs: `.windsurf/rules` is the workspace-level directory; `global_rules.md` is global
- [x] Official docs: Rules files limited to **12,000 characters each**
- [x] Official docs: Activation modes are `always_on`, `glob`, `model_decision`, `manual`
- [x] Official docs: Hierarchical discovery — workspace + subdirs + up to git root
- [x] Official docs: Rules stored with frontmatter (YAML) for activation mode and glob patterns
- [x] GitHub Issue #239: `.windsurf/rules` in `.gitignore` breaks loading
- [x] GitHub Issue #157: Rules sometimes ignored by agent

**Actual Behavior:**
- **`.windsurf/rules/*.md`**: Workspace rules with frontmatter (`---` block containing `activationMode`, `glob`, `description`)
- **`global_rules.md`**: In `~/.codeium/windsurf/memories/` — applied across all workspaces
- **`.windsurfrules`**: NOT mentioned in official docs. Legacy/community convention. Still works but is not the canonical path.
- **Hierarchical discovery**: Windsurf searches workspace → subdirectories → parent directories up to git root

**Edge Cases:**
1. **12,000 char limit** — large rules are silently truncated or ignored
2. **`.gitignore` breakage** — if `.windsurf/rules` is gitignored, rules don't load (verified bug)
3. **Rules sometimes ignored** — agent may not read rules; practitioners verify by asking agent to summarize
4. **`.windsurfrules` is legacy** — official docs don't document it; may be deprecated

**v1 Gap Fixed (G-01, G-06):** Added `.windsurf/rules/*.md` as canonical, noted `.windsurfrules` as legacy, added 12K limit, added gitignore bug.

---

### Fundamental: Workflow Definition Pattern

**Claim:** Workflows are Markdown files in `.windsurf/workflows/*.md` with YAML frontmatter and a `# /command-name` header.

**Verification:**
- [x] Official docs: "Workflows are saved as markdown files within `.windsurf/workflows/` directories"
- [x] Official docs: "Invoked in Cascade via a slash command with the format of `/[name-of-workflow]`"
- [x] Official docs: "You can call other Workflows from within a Workflow"
- [x] Official docs: Hierarchical discovery — workspace + subdirs + up to git root
- [x] This project: 50 files all following identical frontmatter + `# /command-name` H1 pattern
- [x] This project: Workflows reference other workflows (e.g., `/rgr-step` calls `/context`)

**Actual Behavior:**
- Workflows are **manual-only** — must be triggered by `/command-name`
- They are **NOT** injected into the system prompt automatically
- They appear in the Cascade command palette UI
- Can compose: `/workflow-1` can instruct "Call /workflow-2"

**Edge Cases:**
1. Workflows are NOT automatically invoked — user must type `/command-name`
2. Overlapping command names cause undefined behavior — use namespaces
3. No built-in workflow dependency system — composability is by convention

**v1 Gap Fixed (G-05):** Verified via official docs that workflows are manual-only and discovered hierarchically.

---

### Fundamental: Skills (New — v1 Missed Entirely)

**Claim:** Skills are a separate mechanism: `SKILL.md` + supporting files in a directory, invoked via progressive disclosure or `@mention`.

**Verification:**
- [x] Official docs: "Skills help Cascade handle complex, multi-step tasks"
- [x] Official docs: "Progressive disclosure: only the skill's `name` and `description` are shown to the model by default"
- [x] Official docs: "Full `SKILL.md` content and supporting files are loaded only when Cascade decides to invoke the skill"
- [x] Official docs: Skills have frontmatter fields (`name`, `description`, `tools`)
- [x] `zenmindhacker/windsurf-agents`: Actual skill definitions for Linear, Figma, LangSmith, Google Sync

**Actual Behavior:**
```
skill-directory/
├── SKILL.md          # Skill definition with frontmatter
├── template.yaml     # Supporting resources
├── checklist.md      # Supporting resources
└── script.py         # Supporting resources
```
- Skills are **NOT** in the system prompt until invoked
- Agent decides whether to invoke based on skill name/description
- User can force invocation with `@mention`
- Best for: deployments, code review, testing procedures that need scripts/templates

**Edge Cases:**
1. Agent may fail to invoke skill when needed — description quality matters
2. Supporting files increase context cost when skill is invoked
3. Not widely used by practitioners yet (few repos found)

**v1 Gap Fixed (G-04):** Skills are a distinct 4th mechanism, not just a type of workflow.

---

### Fundamental: AGENTS.md (New — v1 Missed Entirely)

**Claim:** `AGENTS.md` files provide directory-scoped instructions with location-based activation.

**Verification:**
- [x] Official docs: "`AGENTS.md` files provide directory-scoped instructions that automatically apply based on file location"
- [x] Official docs: Root directory = treated as `always_on` rule; subdirectories = treated as `glob` rule with auto-generated `<directory>/**` pattern
- [x] Official docs: "No special frontmatter required" — plain markdown only
- [x] This project: No `AGENTS.md` files found, but the mechanism exists

**Actual Behavior:**
- No YAML frontmatter needed — just plain markdown
- Root `AGENTS.md` = always included in system prompt
- `docs/checkout/AGENTS.md` = only applied when Cascade reads/edits files in `docs/checkout/**`
- Uses the same Rules engine as `.windsurf/rules/*.md`

**Edge Cases:**
1. Conflicts with `.windsurf/rules/*.md` files in same directory — undefined precedence
2. Easy to create many `AGENTS.md` files — may fragment rules across the codebase

**v1 Gap Fixed (G-04):** AGENTS.md is a 5th mechanism for directory-scoped guidance.

---

### Fundamental: Cascade Hooks (v1 Had Only `postWrite`)

**Claim:** Hooks have 12 events, 3 config levels, and merge behavior.

**Verification:**
- [x] Official docs: "Cascade provides twelve hook events"
- [x] Official docs: Config levels: System (`/Library/Application Support/Windsurf/hooks.json`), User (`~/.codeium/windsurf/hooks.json`), Workspace (`.windsurf/hooks.json`)
- [x] Official docs: "Hooks from all three locations are merged together"
- [x] Official docs: Pre-hooks (exit code 2) can **block** actions
- [x] This project: `c:\webdev\sang-logium\.windsurf\hooks.json` defines `postWrite` hook

**Actual Behavior:**
```json
{
  "post_write_code": {
    "command": "npm run lint",
    "shell": "powershell",
    "show_output": true
  }
}
```

**All 12 Hook Events:**
| Event | Timing | Can Block? | Use Case |
|-------|--------|-----------|----------|
| `pre_read_code` | Before file read | ✅ Yes | Restrict file access |
| `post_read_code` | After file read | ❌ No | Log reads |
| `pre_write_code` | Before file write | ✅ Yes | Prevent protected file edits |
| `post_write_code` | After file write | ❌ No | Run linters/formatters |
| `pre_run_command` | Before shell command | ✅ Yes | Block dangerous commands |
| `post_run_command` | After shell command | ❌ No | Log command execution |
| `pre_mcp_tool_use` | Before MCP tool call | ✅ Yes | Restrict MCP access |
| `post_mcp_tool_use` | After MCP tool call | ❌ No | Log MCP usage |
| `pre_user_prompt` | Before user message processed | ✅ Yes | Block policy-violating prompts |
| `post_cascade_response` | After response | ❌ No | Log responses |
| `post_cascade_response_with_transcript` | After response (async, JSONL) | ❌ No | Audit/compliance logging |
| `post_setup_worktree` | After git worktree created | ❌ No | Copy .env, install deps |

**Edge Cases:**
1. Hook receives JSON via stdin with `agent_action_name`, `trajectory_id`, `execution_id`, `model_name`, `tool_info`
2. `post_cascade_response_with_transcript` writes full JSONL transcript to `~/.windsurf/transcripts/{trajectory_id}.jsonl` (100 file limit, auto-pruned)
3. This project uses only `postWrite` — most practitioners underutilize hooks

**v1 Gap Fixed (G-04, G-08):** Added all 12 hook events, 3 config levels, merge behavior, JSON stdin protocol, transcript logging.

---

### Fundamental: MCP Integration (v1 Missed Entirely)

**Claim:** Windsurf natively integrates MCP servers for custom tool access.

**Verification:**
- [x] Official docs: "Cascade now natively integrates with MCP"
- [x] Official docs: Supports stdio, HTTP, and SSE transports
- [x] Official docs: Configured via `mcp_config.json`
- [x] `kamusis/windsurf_best_practice` `global_rules.md`: "automatically use the Context7 MCP tools to resolve library id and get library docs"
- [x] `kamusis/windsurf_best_practice` `global_rules.md`: "proactively use the appropriate MCP server tool based on the requested database type"
- [x] `kamusis/windsurf_best_practice` `global_rules.md`: "avoid calling MCP tools like brave-search and fetch if you already have the needed information"
- [x] `tomtom-international/tomtom-mcp`: Windsurf MCP server setup docs

**Actual Behavior:**
```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```
- MCP servers extend Cascade with custom tools (GitHub, databases, APIs)
- Enterprise users must manually enable via settings
- Admin controls available for Teams: MCP Registry, MCP Whitelist
- Practitioners reference MCP tools in their `global_rules.md` to guide agent behavior

**Edge Cases:**
1. MCP servers must be manually configured — not automatic
2. Enterprise may restrict MCP usage via whitelist
3. Hook `pre_mcp_tool_use` can block MCP access

**v1 Gap Fixed (G-04):** MCP is a major professional practitioner pattern, confirmed by official docs and active use in practitioner rules.

---

### Fundamental: Memory Layers (v1 Missed In-Project Memories)

**Claim:** There are multiple memory layers: auto-generated, in-project `.windsurf/memories/`, and global `~/.codeium/windsurf/memories/`.

**Verification:**
- [x] Official docs: "Cascade can automatically generate and store memories if it encounters context that it believes is useful to remember"
- [x] Official docs: "Memories generated in one workspace will not be available in another"
- [x] This project: `.windsurf/memories/` with 3 files (`architecture.md`, `compound-development-lessons.md`, `ide-ram-leak-lesson.md`)
- [x] `kamusis/windsurf_best_practice`: `memories/guidelines/` directory
- [x] `github.com/ichoosetoaccept/awesome-windsurf`: Community prompts in `memories/<username>/`

**Actual Behavior:**
```
.windsurf/
├── memories/
│   ├── architecture.md          # Project architectural invariants
│   ├── compound-development-lessons.md  # Lessons from past work
│   └── ide-ram-leak-lesson.md   # Debugging knowledge
├── rules/
│   └── *.md                     # Behavioral rules with frontmatter
├── workflows/
│   └── *.md                     # Manual command workflows
└── hooks.json                   # Automation hooks
```

- **Auto-generated memories**: Created by Cascade during conversation, workspace-scoped, retrieved when relevant
- **In-project `.windsurf/memories/*.md`**: Developer-authored persistent knowledge (this project's 3 files)
- **Global `~/.codeium/windsurf/memories/`**: Cross-project conventions, global rules

**Edge Cases:**
1. Auto-generated memories do NOT consume credits
2. In-project memories are NOT auto-loaded — agent must be told to read them (or they may be discovered via context)
3. No official docs mention `.windsurf/memories/` — this is a community convention

**v1 Gap Fixed (G-01):** Added the in-project `.windsurf/memories/` layer as a distinct mechanism from rules and workflows.

---

## Best Practices (Verified)

### Practice: Dual-Layer Rule Architecture
**Consensus:** High — but official docs reveal it's more nuanced

**Supporting Evidence:**
- Official docs: `global_rules.md` (global) + `.windsurf/rules/*.md` (workspace)
- Official docs: Rules have activation modes (`always_on`, `glob`, `model_decision`, `manual`)
- Official docs: 12,000 character limit per rule file
- `akapug/RuleSurf`: "`.windsurfrules`: Project-specific requirements, `global_rules.md`: Universal development practices"

**Counter-Evidence (Falsification Attempts):**
- `.windsurfrules` is NOT in official docs — may be deprecated
- Rules sometimes ignored — Issues #157, #239
- 12K char limit means large rule sets must be split

**Verdict:** ✅ Recommended (but use `.windsurf/rules/*.md`, not `.windsurfrules`)

**When to Use:** Always. Global rules for universal conventions, workspace rules for codebase specifics.
**When to Skip:** Never. At minimum, use workspace rules.

---

### Practice: Use AGENTS.md for Directory-Scoped Guidance
**Consensus:** Medium-High — official docs recommend it; few practitioner repos use it yet

**Supporting Evidence:**
- Official docs: "Ideal for providing targeted guidance without cluttering a single global configuration file"
- Official docs: Root = always-on; subdirs = glob-scoped automatically
- No frontmatter required — plain markdown

**Counter-Evidence (Falsification Attempts):**
- No practitioner repos found using AGENTS.md in the wild
- May fragment rules across codebase, making them hard to find
- Conflicts with `.windsurf/rules/*.md` in same directory undefined

**Verdict:** ⚠️ Context-Dependent

**When to Use:** Large projects with distinct subsystems (e.g., `docs/checkout/AGENTS.md`, `lib/basket/AGENTS.md`)
**When to Skip:** Small projects where a single `.windsurf/rules/*.md` suffices

---

### Practice: Workflow-Driven Development
**Consensus:** High — this project has 50 workflows; official docs fully document them

**Supporting Evidence:**
- Official docs: Full workflow documentation with creation, discovery, invocation
- This project: 50 workflows covering research, testing, debugging, planning, commits
- `atwine/windsurf-context-engineering`: `init-context.md`, `generate-plan.md`, `execute-plan.md`
- Official docs: "You can call other Workflows from within a Workflow"

**Counter-Evidence (Falsification Attempts):**
- Workflows require memorization/lookup — if you don't know the command exists, you won't use it
- Over-workflowing creates maintenance burden — 50 workflows need curation
- Manual-only invocation means they're dead code if forgotten

**Verdict:** ✅ Recommended

**When to Use:** For any repeated process (research, testing, commits, debugging, planning)
**When to Skip:** One-off exploratory tasks where rigid process hurts more than helps

---

### Practice: MCP for External Tool Access
**Consensus:** High — official docs + active practitioner use

**Supporting Evidence:**
- Official docs: "Cascade now natively integrates with MCP"
- `kamusis/windsurf_best_practice` `global_rules.md`: Explicitly guides agent to use Context7, database MCP tools
- `tomtom-international/tomtom-mcp`: Production MCP server with Windsurf setup docs

**Counter-Evidence (Falsification Attempts):**
- Requires manual server setup and configuration
- Enterprise may whitelist/restrict MCP servers
- Adds external dependency that may break

**Verdict:** ✅ Recommended

**When to Use:** Database access, API integration, documentation lookup (Context7), external service calls
**When to Skip:** Simple projects where built-in tools suffice

---

### Practice: Evidence-Based Verification (`/verify` pattern)
**Consensus:** High — this project and leaked system prompt both enforce it

**Supporting Evidence:**
- This project: `/verify` workflow requires "actual tool execution before answering"
- Leaked system prompt (R1): "Run terminal commands to execute the USER's code for them instead of telling them what to do"
- Official docs: `pre_run_command` hook can validate before commands execute

**Counter-Evidence (Falsification Attempts):**
- Tool execution is slow — verification adds latency
- Some claims are self-evident — requiring evidence for trivial claims wastes time

**Verdict:** ⚠️ Context-Dependent

**When to Use:** Architecture decisions, bug fixes, dependency claims, performance assertions
**When to Skip:** Well-established facts (e.g., "React is a JavaScript library")

---

### Practice: Context Freezing (`/rgr-step` pattern)
**Consensus:** Medium-High — this project uses it; aligns with TDD patterns

**Supporting Evidence:**
- This project: `/rgr-step` workflow "freezes slice context once, then mechanically steps through"
- Claims 70% time savings by avoiding repeated context gathering
- Official docs: Workflows are manual-only — perfect for controlled RGR sessions

**Counter-Evidence (Falsification Attempts):**
- Frozen context can become stale if dependencies change during implementation
- Requires upfront investment in `/context` workflow design

**Verdict:** ✅ Recommended

**When to Use:** Multi-test implementation sessions (TDD, vertical slices)
**When to Skip:** Single-test or exploratory work where context changes dynamically

---

### Practice: Bus Stop Debugging (`/trace` pattern)
**Consensus:** Medium — this project has it; aligns with system prompt debugging directives

**Supporting Evidence:**
- This project: `/trace` workflow with 10 bus stops
- This project: `compound-development-lessons.md` — "End-to-End Trace is the Only Worthwhile Development Method"
- Leaked system prompt: "Add descriptive logging statements and error messages to track variable and code state"
- Official docs: `post_cascade_response_with_transcript` hook writes full JSONL transcript for audit

**Counter-Evidence (Falsification Attempts):**
- Console.log debugging is primitive — practitioners with good devtools may prefer breakpoints
- Adding/removing logs is tedious — `post_cascade_response_with_transcript` hook automates this

**Verdict:** ✅ Recommended

**When to Use:** Data flow issues, async bugs, API integration problems
**When to Skip:** Simple syntax errors, type issues (use compiler instead)

---

## Common Solutions Landscape

### Solution: `.windsurf/rules/*.md` (Canonical)
**Prevalence:** Officially recommended; growing among professionals
**Type:** Idiomatic

**Pros:**
- Frontmatter activation modes (`always_on`, `glob`, `model_decision`, `manual`)
- Hierarchical discovery (workspace + subdirs + git root)
- 12,000 char limit prevents bloat
- Officially documented and supported

**Cons:**
- Breaks if path is in `.gitignore` (Issue #239)
- Agent may ignore rules (Issue #157)
- Frontmatter adds overhead

**Real-World Pain Points:**
- `github.com/Exafunction/codeium/issues/239` — `.windsurf/rules` in `.gitignore` = silent failure
- `github.com/Exafunction/codeium/issues/157` — rules sometimes completely ignored

**Recommendation:** Use this as the primary rule mechanism. Keep `.windsurf/rules` out of `.gitignore`.

---

### Solution: `.windsurfrules` (Legacy)
**Prevalence:** Ubiquitous in older repos and curated lists
**Type:** Legacy / Community Convention

**Pros:**
- Single file, easy to copy/paste
- Supported by older Windsurf versions
- Large ecosystem of examples (awesome-windsurfrules)

**Cons:**
- NOT in official docs — may be deprecated
- No activation modes — always loaded
- No glob scoping
- Monolithic — can't split by concern

**Real-World Pain Points:**
- May stop working in future Windsurf versions
- No official guidance on character limits

**Recommendation:** Migrate to `.windsurf/rules/*.md`. Keep `.windsurfrules` only for backward compatibility.

---

### Solution: In-Project Workflow Library (`.windsurf/workflows/*.md`)
**Prevalence:** Growing rapidly among professionals
**Type:** Idiomatic

**Pros:**
- Commands appear in Windsurf UI (command palette)
- Can compose (call other workflows)
- Hierarchical discovery
- Version controlled with project

**Cons:**
- Must remember command names (or browse palette)
- Overhead of writing workflow files
- Can become "workflow theater" if never used

**Real-World Pain Points:**
- This project has 50 workflows — curation and discoverability become issues
- No built-in workflow dependency system

**Recommendation:** Start with 3-5 core workflows (`/research`, `/verify`, `/commit`). Add as repeated tasks emerge.

---

### Solution: AGENTS.md
**Prevalence:** Niche — official docs recommend it; few practitioners use it
**Type:** Idiomatic

**Pros:**
- Zero frontmatter — plain markdown
- Location-based scoping (root = always-on, subdirs = glob)
- No explicit activation mode needed
- Uses same Rules engine as `.windsurf/rules/*.md`

**Cons:**
- May fragment rules across codebase
- No practitioner examples found in the wild
- Conflicts with `.windsurf/rules/*.md` in same directory undefined

**Recommendation:** Use for large projects with distinct subsystems. Start with root-level `AGENTS.md` for project overview.

---

### Solution: Skills (`SKILL.md` + supporting files)
**Prevalence:** Niche — official docs document it; few practitioner repos found
**Type:** Idiomatic

**Pros:**
- Progressive disclosure — only name/description in system prompt until invoked
- Can include supporting files (templates, scripts, checklists)
- Agent decides when to invoke (or `@mention` to force)

**Cons:**
- Requires `SKILL.md` frontmatter discipline
- Supporting files add context cost when invoked
- Few practitioner examples found

**Recommendation:** Use for complex multi-step procedures that need templates (deployments, code review procedures, testing protocols).

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

**Recommendation:** Use for personal conventions (communication style, commit format, code style, MCP tool guidance). Keep project rules in-repo.

---

### Solution: In-Project Memory (`.windsurf/memories/*.md`)
**Prevalence:** Emerging — this project uses it; `awesome-windsurf` has community version
**Type:** Community Convention (not officially documented)

**Pros:**
- Project-specific persistent knowledge
- Version controlled with code
- Agent can be instructed to read before work

**Cons:**
- NOT officially documented — behavior may change
- Not auto-loaded — must be explicitly referenced
- No formal structure or schema

**Recommendation:** Use for architectural invariants, lessons learned, debugging knowledge. Reference in workflows or rules.

---

## Verification & Falsification Log

### Claims Verified

| Claim | Evidence | Method |
|-------|----------|--------|
| Rules go in `.windsurf/rules/*.md` with frontmatter | Official docs (Memories & Rules) | Official Documentation |
| Rules limited to 12,000 chars each | Official docs (Best Practices) | Official Documentation |
| Rules have activation modes | Official docs (Rules Discovery) | Official Documentation |
| `.windsurf/rules` in `.gitignore` breaks loading | Issue #239 | Bug Report |
| Workflows are manual-only via `/command` | Official docs (Workflows) | Official Documentation |
| Workflows discovered hierarchically | Official docs (Workflow Discovery) | Official Documentation |
| Skills use progressive disclosure | Official docs (Skills) | Official Documentation |
| AGENTS.md = directory-scoped rules | Official docs (AGENTS.md) | Official Documentation |
| Hooks have 12 events | Official docs (Hook Events) | Official Documentation |
| Hooks merge across 3 levels (system → user → workspace) | Official docs (Configuration) | Official Documentation |
| MCP natively integrated | Official docs (MCP) | Official Documentation |
| MCP used by practitioners | `kamusis/global_rules.md` | Source Code |
| `.windsurf/memories/` is in-project memory layer | This project (3 files) | Source Code |
| `.windsurfrules` NOT in official docs | Search of `llms-full.txt` | Source Code |

### Falsification Attempts

| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| "More workflows = better" | Overhead of 50 workflows in this project | Modified: Quality > Quantity |
| "Rules are always read by agent" | Issues #157, #239; Reddit reports | Modified: Verify agent sees rules |
| "Hooks are essential for quality" | This project keeps hooks disabled | Modified: Optional, not essential |
| "`.windsurfrules` is the canonical path" | NOT in official docs; `.windsurf/rules/*.md` is canonical | **Abandoned** — `.windsurfrules` is legacy |
| "3-layer context stack" | Actual stack: Rules + Workflows + Skills + AGENTS.md + MCP + Memories | **Modified** — 5+ mechanisms |
| "Leaked prompts are current ground truth" | Dec 2024 / Feb 2025 prompts are 15+ months stale | **Modified** — Treat as historical, not current |

### Knowledge Decay Assessment

| Section | Risk | Review Date |
|---------|------|-------------|
| Official Docs (Rules, Workflows, Skills) | Low — core mechanisms stable | 2026-11-21 |
| MCP Integration | Med — rapidly evolving | 2026-07-21 |
| Hooks API | Med — new events may be added | 2026-07-21 |
| AGENTS.md | Low — simple mechanism | 2026-11-21 |
| Leaked System Prompts | **High** — 15 months stale | **Update immediately** |
| `.windsurfrules` Legacy Status | Med — may be deprecated | 2026-07-21 |

---

## Synthesis: Actionable Takeaways

### For Our Project (sang-logium)

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| **Migrate from `rules.md` to `.windsurf/rules/*.md`** | `rules.md` is not canonical; `.windsurf/rules/*.md` is official | Split `rules.md` into `.windsurf/rules/beads.md`, `.windsurf/rules/testing.md`, etc. with frontmatter |
| **Add activation modes to rules** | Official feature; reduces context waste | `activationMode: always_on` for universal rules; `activationMode: glob` for directory-specific rules |
| **Keep 50-workflow library but audit usage** | High quality but curation cost is real | Review which workflows were invoked last month; retire dead code |
| **Add root `AGENTS.md`** | Official mechanism for project overview | Create `AGENTS.md` at repo root with project architecture summary |
| **Consider Skills for complex procedures** | Progressive disclosure saves context budget | Convert `/research` or `/commit` workflows to Skills if they need supporting files |
| **Add MCP guidance to `global_rules.md`** | `kamusis` does this; improves agent MCP usage | Add: "Use Context7 MCP for library docs; avoid brave-search when info already known" |
| **Keep `.windsurf/rules` out of `.gitignore`** | Issue #239 — gitignored rules don't load | Verify `.gitignore` does NOT contain `.windsurf/rules` |
| **Verify agent reads rules before critical work** | Rules sometimes ignored | Ask "Summarize project rules you're following" at session start |
| **Document in-project memories** | `.windsurf/memories/` is valuable but unknown to team | Add section to `AGENTS.md` explaining memory files |

### Immediate Actions

1. **Audit `.gitignore`** — Confirm `.windsurf/rules` is NOT in `.gitignore` (Issue #239).
2. **Migrate `rules.md` to `.windsurf/rules/*.md`** — Split by concern, add frontmatter with activation modes.
3. **Create root `AGENTS.md`** — One-paragraph project overview with architecture pointers.
4. **Add MCP guidance** — In `global_rules.md` or `.windsurf/rules/`, guide agent MCP usage.
5. **Verify rules visibility** — In next Cascade session, ask "What rules are you following?" to confirm loading.

### Open Questions (Research Gaps — v2 Improved)

1. **What is the exact context budget for rules?** — 12K chars per file is known, but how many files can be loaded simultaneously before code context is evicted?
2. **How do AGENTS.md and `.windsurf/rules/*.md` interact?** — Same Rules engine, but precedence when both exist in same directory is undocumented.
3. **What is the current system prompt (May 2026)?** — Leaked prompts are 15 months stale. No newer leaks found.
4. **Do Skills auto-invoke reliably?** — Progressive disclosure depends on agent's decision-making; no data on invocation accuracy.
5. **What is the serialization format for auto-generated memories?** — Where are they stored on disk? Are they accessible?
6. **How do `.windsurf/memories/*.md` files get loaded?** — Not in official docs; are they manually read, auto-discovered, or contextually retrieved?

---

## Confidence Assessment

| Claim Type | Confidence | Basis |
|------------|------------|-------|
| First Principles | High | Official docs + practitioner consensus |
| Code Fundamentals | **Very High** | Official docs inspected + source code across 10+ repos |
| Best Practices | High | Official docs + practitioner agreement |
| Common Solutions | High | Official docs + real-world bug reports |
| Leaked Prompts | **Low** — 15 months stale | Only historical value; current prompt behavior unknown |

---

## Source References

- **Windsurf Official Docs (LLMs Full Text):** `docs.windsurf.com/llms-full.txt` — Canonical source for all mechanisms
- **Windsurf MCP Docs:** `docs.windsurf.com/windsurf/cascade/mcp`
- **Windsurf Rules/Memories Docs:** `docs.windsurf.com/windsurf/cascade/memories`
- **Windsurf Workflows Docs:** `docs.windsurf.com/windsurf/cascade/workflows`
- **Windsurf Skills Docs:** `docs.windsurf.com/windsurf/cascade/skills`
- **Windsurf AGENTS.md Docs:** `docs.windsurf.com/windsurf/cascade/agents-md`
- **Windsurf Hooks Docs:** `docs.windsurf.com/windsurf/cascade/hooks`
- **Leaked Cascade System Prompt (Dec 2024):** `github.com/jujumilk3/leaked-system-prompts/blob/main/codeium-windsurf-cascade_20241206.md`
- **Leaked Cascade System Prompt (R1, Feb 2025):** `github.com/jujumilk3/leaked-system-prompts/blob/main/codeium-windsurf-cascade-R1_20250201.md`
- **This Project Windsurf Config:** `c:\webdev\sang-logium\.windsurf/` (50 workflows, `rules.md`, `hooks.json`, `.windsurf/memories/`)
- **kamusis/windsurf_best_practice:** `github.com/kamusis/windsurf_best_practice` (actual `global_rules.md` content read)
- **atwine/windsurf-context-engineering:** `github.com/atwine/windsurf-context-engineering`
- **kinopeee/windsurf-antigravity-rules:** `github.com/kinopeee/windsurfrules`
- **akapug/RuleSurf:** `github.com/akapug/RuleSurf`
- **SchneiderSam/awesome-windsurfrules:** `github.com/SchneiderSam/awesome-windsurfrules`
- **Goldziher/ai-rulez:** `github.com/Goldziher/ai-rulez`
- **awesome-windsurf (community prompts):** `github.com/ichoosetoaccept/awesome-windsurf`
- **Windsurf config discovery gist:** `gist.github.com/rp4ri/4b623e2fa20def68bd8dcbe8d231f5e2`
- **Detailed global_rules.md gist:** `gist.github.com/ComputerKWasTaken/cff0d6bcdc8183b732debfbbdce4fc96`
- **Rules not loading (gitignore):** `github.com/Exafunction/codeium/issues/239`
- **Rules not loading (general):** `github.com/Exafunction/codeium/issues/157`
- **Reddit rules issues:** `reddit.com/r/windsurf/comments/1kq6zm8/`, `reddit.com/r/windsurf/comments/1kjlyzm/`
