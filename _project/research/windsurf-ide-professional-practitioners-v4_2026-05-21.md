# Research: Windsurf IDE Professional Practitioner Patterns (v4 — The Obscure Finds)

> **Retrieval Date:** 2026-05-21
> **Researcher:** AI/Human collaboration
> **Decay Risk:** Medium
> **Next Review:** 2026-08-21
> **Prior Versions:** v1 (8 gaps), v2 (10 false positives), v3 (consolidated, 3-layer stack)

## Executive Summary

This artifact covers **genuinely obscure angles** missed in all prior versions. The big finds:

1. **Wave 11 leaked system prompt (2025)** — More recent than the Dec 2024 / Feb 2025 leaks. Reveals model identity (GPT 4.1), 8192 token limit, `update_plan` tool, cost-awareness directives.
2. **`.windsurf/research/` — 18-file knowledge base** — Completely missed in all 3 versions. This is an undocumented in-project research layer.
3. **Parallel agent development** — `priyashpatil/rift` + official docs "Simultaneous Cascades" + `kundeng/windloop` = genuine practitioner pattern for parallel work.
4. **`.codeiumignore` operational necessity** — From this project's own 11-hour debugging session.
5. **Prompt evolution timeline** — Three distinct leaked prompts show clear behavioral changes over 5 months.

---

## Prior Research — Do Not Duplicate

All validated claims from v1-v3 and the May 10/14 research artifacts remain valid. Read them there. This artifact covers ONLY new, obscure findings.

---

## The Obscure Finds

### 1. Leaked System Prompt Evolution (The Big One)

**Three distinct leaked prompts exist**, showing clear behavioral evolution:

#### Prompt 1: Dec 2024 (R0)
- **Source:** `github.com/jujumilk3/leaked-system-prompts/codeium-windsurf-cascade_20241206.md`
- **Key features:** Basic agent paradigm, "at most once per turn" tool limit

#### Prompt 2: Feb 2025 (R1)
- **Source:** `github.com/jujumilk3/leaked-system-prompts/codeium-windsurf-cascade-R1_20250201.md`
- **Key changes:** Refined tool calling, memory system introduction

#### Prompt 3: April 2025 (Wave ~10)
- **Source:** `github.com/dontriskit/awesome-ai-system-prompts/windsurf/system-2025-04-20.md`
- **Key new features:**
  - Knowledge cutoff: **2024-06**
  - **"ALWAYS combine ALL changes into a SINGLE edit_file tool call"**
  - `TargetLintErrorIds` parameter on `edit_file` tool
  - **`codebase_search` tool** — "Find snippets of code most relevant to the search query" (this is Fast Context / SWE-grep)
  - **`view_file_outline`** tool — "preferred first-step tool for file exploration"
  - **`view_line_range`** tool — 0-indexed, max 200 lines
  - **`view_code_item`** tool — views specific functions/classes by fully qualified name
  - **`search_in_file`** tool — searches within a specific file
  - **`multi_tool_use.parallel`** namespace — explicit parallel execution
  - **`suggested_responses`** tool — supplies multiple choice options to user
  - **Memory system:** "create memories liberally" + "ALL CONVERSATION CONTEXT, INCLUDING checkpoint summaries, will be deleted"
  - **`EPHEMERAL_MESSAGE`** — "injected by the system as important information to pay attention to"

#### Prompt 4: Wave 11 (2025, most recent)
- **Source:** `github.com/x1xhlol/system-prompts-and-models-of-ai-tools/Windsurf/Prompt%20Wave%2011.txt`
- **CRITICAL CHANGES from April 2025:**
  - **"Codeium engineering team" → "Windsurf engineering team"** — Rebranding
  - **"Only call tools when they are absolutely necessary"** — NEW cost constraint
  - **"NEVER make redundant tool calls as these are very expensive"** — NEW cost-awareness
  - **"If asked about what your underlying model is, respond with `GPT 4.1`"** — **MODEL DISCLOSURE**
  - **Max output tokens: 8192** (down from 64000 in R1!) — **MAJOR reduction**
  - **">300 lines break into multiple smaller edits"** — **OPPOSITE of April 2025** (which said "SINGLE edit_file"). They relaxed the constraint.
  - **`<planning>` section** — NEW: "You will maintain a plan of action... updated by the plan mastermind through calling the `update_plan` tool"
  - **`update_plan` tool** — NEW tool not present in earlier prompts
  - **"The plan should always reflect the current state of the world before any user interaction"** — NEW behavior

**Why This Matters:**
- The 8192 token limit explains why large edits must be broken up — it's a hard ceiling per generation
- "GPT 4.1" disclosure means Cascade is NOT a custom model — it's a GPT-4.1 wrapper with system prompt engineering
- Cost-awareness directives explain why the agent sometimes refuses to make "redundant" tool calls
- The `update_plan` tool explains why Windsurf has plan tracking UI features

**Verdict:** ✅ **Source-level ground truth** — these are actual leaked prompts

---

### 2. `.windsurf/research/` — The Hidden Knowledge Layer

**What it is:** An 18-file research knowledge base inside `.windsurf/`, completely missed in all 3 prior research versions.

**Files found:**
| File | Size | Topic |
|------|------|-------|
| `TEST_FIRST_PRINCIPLES.md` | 3.8 KB | Testing philosophy |
| `TEST_INTEGRATION_CONTEXT_AWARENESS.md` | 6.8 KB | Integration test patterns |
| `TEST_INTEGRATION_GOOD_EXAMPLE.md` | 4.5 KB | Test examples |
| `basket-feature-research.md` | 18.3 KB | Feature research |
| `basket-feature-wholeness-understanding.md` | 14.7 KB | Architecture understanding |
| `contract-design-best-practices.md` | 8.6 KB | Contract design |
| `gemini-3-pro-audit-analysis.md` | 10.2 KB | External AI audit analysis |
| `stripe-cms-price-data-format.md` | 9.7 KB | Stripe integration research |
| `structureTool-import-error-root-cause.md` | 9.7 KB | Debugging root cause |
| `windows-language-server-monitoring-practical.md` | 12.6 KB | Operational monitoring |
| `windows-lsp-monitoring-working-plan.md` | 11.1 KB | Working plans |
| `nextjs-zustand-async-state-management.md` | 8.9 KB | State management patterns |
| `simple-prd-contracts.md` | 7.0 KB | PRD methodology |
| `aaa-pattern-research.md` | 6.6 KB | AAA testing pattern |
| `TEST_LAYER_TRUST.md` | 3.6 KB | Test layer trust |
| `TEST_SEPARATION_GUIDE.md` | 1.2 KB | Test separation |
| `TestsNamingConvention.md` | 1.5 KB | Naming conventions |
| `TEST_LOCATION_CONVENTION.md` | 402 B | Location conventions |

**Total:** ~130 KB of project-specific research knowledge

**Key insight from `gemini-3-pro-audit-analysis.md`:**
> External AI audit by Gemini 3 Pro on basket architecture versions v2, v3, v4. Includes critical findings like "300ms debounce on persist() introduces data loss vulnerability" — findings that were validated and led to fixes.

**Key insight from `windows-language-server-monitoring-practical.md`:**
> ETW tracing, Performance Monitor, PowerShell monitoring — practical operational knowledge for Windows language server debugging.

**Key insight from `structureTool-import-error-root-cause.md`:**
> "Module resolution conflict causing `structureTool` import failure" — bare specifier `"sanity/structure"` vs relative path `"./sanity/structure"`. Root cause: local file named `sanity/structure.ts` shadows npm package export.

**Verdict:** ✅ **This is a 4th knowledge layer** — rules, workflows, memories, AND research. All 4 are in `.windsurf/`. Total undocumented by official docs.

---

### 3. Parallel Agent Development — Genuine Practitioner Pattern

**Three independent sources confirm this:**

**Source 1: Official docs**
> "Users can have multiple Cascades running simultaneously... If two Cascades edit the same file at the same time, the edits can race, and sometimes the second edit will fail. If you expect two Cascades to edit similar files, you should consider using worktrees to keep them isolated."

**Source 2: `priyashpatil/rift`**
> "Git worktree manager for parallel AI agent development. Rift lets you spin up isolated git worktrees, each with its own branch, and automatically launch an AI coding agent inside them. Work on multiple features simultaneously without stashing or switching branches."

**Source 3: `kundeng/windloop`**
> "Rule #1: One Cascade session per working tree. Sessions sharing a branch will overwrite each other's changes. Always use worktrees or branches for parallel work."

**The Pattern:**
```bash
# Create worktrees for parallel feature development
git worktree add ../project-feature-a feature-a-branch
git worktree add ../project-feature-b feature-b-branch

# Open each in separate Windsurf windows
# Run /workflow in each — isolated, parallel, no race conditions
```

**Official support:** `post_setup_worktree` hook fires after worktree creation.

**Verdict:** ✅ **Confirmed practitioner pattern** — solves the "edit race" problem with official support

---

### 4. `.codeiumignore` — The Operational Lifesaver

**Source:** This project's own 11-hour debugging session (`.windsurf/memories/ide-ram-leak-lesson.md`)

**The discovery:**
- `scripts/image-pipeline/venv/` = **604 MB** of Python binaries
- `.gitignore` excluded it → language server still indexed it → **5.8 GB RAM**
- `.codeiumignore` exclusion → process kill → **RAM back to normal**
- `.codeiumignore` is **independent of `.gitignore`** — they don't interact

**Practitioner repos using it:**
- `skillrepos/codeium-basics/.codeiumignore` — `labs.md`, `.devcontainer/*`, `images/*`
- `BlazeMCworld/Open-Codeium-Engine` — "recommended to setup a `.codeiumignore` file"
- `carlrannaberg/claudekit` — supports `.codeiumignore` as one of multiple AI ignore formats

**This project's `.codeiumignore` (33 lines, well-maintained):**
```
node_modules/
.next/
.venv/
**/__pycache__/
*.dll
sanity/backups/
*.todo  # pathological re-indexing trigger
```

**Bug:** Issue #133 — `.codeiumignore` exception rules (`!pattern`) do NOT override `.gitignore` rules

**Verdict:** ✅ **Critical for repos > 100 MB** — silent failure mode (no visual symptoms until RAM death)

---

### 5. Codemaps — Official Feature, Unknown Practitioner Use

**Source:** Official docs + `Cometix-Org/windsurf-codemap` VS Code extension

**What it is:** "AI-powered code exploration and visualization. Generate interactive codemaps that document control flow and data flow in your codebase."

**Features:**
- Tree view: hierarchical list of traces and locations
- Diagram view: node-and-arrow diagram showing flow between code locations
- VS Code extension (not built into Windsurf IDE)

**Practitioner adoption:** Unknown — no evidence of use in inspected repos. Possibly too new.

**Verdict:** ⚠️ **Documented feature, unknown practitioner adoption**

---

### 6. Skill.sh — Universal Skill Installer

**Source:** `gist.github.com/schpet/85531b6a05a5d8119e859bdec6b0e0b8`

**What it is:** `skill.sh` — a universal skill installer for Pi, Claude Code, Goose, and **Windsurf**.

```bash
# Install a skill for Windsurf
skill.sh install windsurf https://raw.githubusercontent.com/user/repo/main/skill.md
```

**Implication:** Skills are becoming cross-platform standardized. Windsurf is part of the ecosystem, not isolated.

**Verdict:** ⚠️ **Emerging standard, not yet widely used**

---

## The Complete Practitioner Stack (v4, Evidence-Based)

```
Layer 1: RULES (behavioral constraints)
├── global_rules.md          → ~/.codeium/windsurf/memories/ (cross-project)
├── .windsurfrules           → project root (legacy but working)
└── .windsurf/rules/*.md     → project root (canonical per docs)

Layer 2: WORKFLOWS (repeatable processes)
└── .windsurf/workflows/*.md → manual invocation via /command-name

Layer 3: MEMORIES (persistent knowledge)
├── ~/.codeium/windsurf/memories/  → auto-loaded, cross-project
└── .windsurf/memories/*.md        → project-specific, NOT auto-loaded

Layer 4: RESEARCH (project knowledge base)  ← NEW in v4
└── .windsurf/research/*.md        → 18 files, 130 KB, project-specific

OPERATIONAL: .codeiumignore (indexer control)
└── controls language server RAM usage, independent of .gitignore

PARALLEL DEVELOPMENT: Git worktrees + rift/windloop  ← NEW in v4
└── multiple Cascade sessions, isolated branches, no edit races

PROMPT EVOLUTION: 4 leaked versions (Dec 2024 → Feb 2025 → Apr 2025 → Wave 11)
└── GPT 4.1 disclosure, 8192 token limit, cost-awareness, update_plan tool

OPTIONAL/ASPIRATIONAL:
├── Skills (.windsurf/skills/ or skills/)     → progressive disclosure
├── AGENTS.md                                 → directory-scoped
├── MCP (mcp_config.json)                     → external tools
├── Codemaps                                  → code visualization
└── Hooks (12 events)                         → mostly postWrite only
```

---

## New Open Questions (v4)

1. **What is the `update_plan` tool?** — Mentioned in Wave 11 prompt but not in tool definitions. Is it a UI feature or a callable tool?
2. **How does `EPHEMERAL_MESSAGE` work?** — Injected by system, agent must follow but not acknowledge. What triggers it?
3. **What is the actual current prompt (May 2026)?** — Wave 11 is still ~7 months stale. What's changed since?
4. **Does `.windsurf/research/` get auto-loaded?** — Or must it be manually referenced like `.windsurf/memories/`?
5. **How many practitioners use parallel worktrees?** — `rift` and `windloop` suggest it's emerging but how common?
6. **What is `checkpoint` tool mentioned in Pi setup guide?** — "Popular picks: pi-mcp-adapter, safe-git, pi-cost-dashboard, pi-notify, checkpoint..."
7. **Is the 8192 token limit per tool call or per response?** — "Your max output tokens is 8192 tokens per generation" suggests per response generation.

---

## Confidence Assessment

| Claim Type | Confidence | Basis |
|------------|------------|-------|
| Prompt evolution (4 versions) | **Very High** | Actual leaked prompts read |
| Model identity (GPT 4.1) | **Very High** | Direct from Wave 11 prompt |
| 8192 token limit | **Very High** | Direct from Wave 11 prompt |
| `.windsurf/research/` as knowledge layer | **Very High** | Direct file inspection |
| Parallel worktrees pattern | **High** | Official docs + 2 repos |
| `.codeiumignore` operational necessity | **Very High** | This project's own experience + multiple repos |
| `update_plan` tool existence | **Medium** | Mentioned in prompt, not verified callable |
| `EPHEMERAL_MESSAGE` mechanism | **Medium** | Described in prompt, not observed |
| Codemap practitioner adoption | **Low** | No evidence found |
| Current prompt (May 2026) | **Very Low** | Wave 11 is 7+ months stale |

---

## Source References

- **Wave 11 leaked prompt:** `github.com/x1xhlol/system-prompts-and-models-of-ai-tools/Windsurf/Prompt%20Wave%2011.txt`
- **April 2025 leaked prompt:** `github.com/dontriskit/awesome-ai-system-prompts/windsurf/system-2025-04-20.md`
- **Feb 2025 R1 leaked prompt:** `github.com/jujumilk3/leaked-system-prompts/codeium-windsurf-cascade-R1_20250201.md`
- **Dec 2024 leaked prompt:** `github.com/jujumilk3/leaked-system-prompts/codeium-windsurf-cascade_20241206.md`
- **`.windsurf/research/`:** `c:\webdev\sang-logium\.windsurf\research/` (18 files)
- **Rift (parallel worktrees):** `github.com/priyashpatil/rift`
- **Windloop (spec-driven + worktrees):** `github.com/kundeng/windloop`
- **Windsurf-codemap:** `github.com/Cometix-Org/windsurf-codemap`
- **Skill.sh universal installer:** `gist.github.com/schpet/85531b6a05a5d8119e859bdec6b0e0b8`
- **`.codeiumignore` debugging:** This project's `.windsurf/memories/ide-ram-leak-lesson.md`
- **Official docs (parallel cascades):** `docs.windsurf.com/llms-full.txt`
