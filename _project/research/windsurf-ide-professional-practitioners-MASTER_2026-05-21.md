# Research: Windsurf IDE Professional Practitioner Patterns — MASTER CONSOLIDATED

> **Retrieval Date:** 2026-05-21
> **Research Versions:** v1 (gaps), v2 (false positives), v3 (3-layer stack), v4 (obscure finds), v5 (power moves), v6 (gap fill + consolidation)
> **Decay Risk:** Medium
> **Next Review:** 2026-08-21

---

## Research Scope Contract

- **Topic:** Windsurf IDE (by Codeium/Cognition) professional practitioner patterns, operational frameworks, and hidden features
- **First Principles:**
  1. Context window is finite and degrades with utilization
  2. Agent behavior is determined by system prompt + rules + context injection
  3. Token cost is the binding constraint on agentic workflows
- **Fundamentals:** Rules, workflows, memories, skills, hooks, MCP, AGENTS.md, agent personas, context optimization
- **Scope Boundary:** NOT implementing features; NOT modifying project source; NOT marketing content without source verification
- **Target Audience:** Developers building operational layers on top of Windsurf
- **Decay Risk:** Medium — features ship monthly (Wave cadence), practitioner repos evolve

---

## 1. The Complete Windsurf Feature Architecture (Official)

### Feature Release Timeline (Verified from Official Changelog)

| Wave | Date | Key Features |
|------|------|--------------|
| Wave 6 | ~Apr 2025 | App Deploys, GPT 4.1 model |
| Wave 7 | ~May 2025 | Rules revamp, Workflows, Cascade Plugin Panel, Customization Panel |
| Wave 8 | ~Jun 2025 | Skills support, Planning Mode, MCP Servers, Hooks, Worktree Preview |
| Wave 9 | ~Jul 2025 | Codemaps, Tab Completion, Vibe and Replace, Fast Context |
| Wave 10 | ~Aug 2025 | Cascade Hooks on User Prompts, Arena Mode, GPT-5.1-Codex |
| Wave 11 | ~Sep 2025 | Cascade Customization, SWE 1.5 Image Support, Sonnet 4.5 |
| Wave 12 | ~Oct 2025 | Lifeguard, Claude Opus 4.6, GPT-5.4, Context Window Indicator Beta |
| Wave 13 | Dec 2025 | **Git Worktree Support, Multi-Cascade Panes/Tabs, Cascade Dedicated Terminal, Context Window Indicator GA, Cascade Hooks GA, System-level Rules & Workflows, SWE-1.5 Free** |
| Wave 14 | ~Feb 2026 | **Arena Mode GA, Plan Mode GA**, Claude Opus 4.7, Devin Review |
| Post-14 | May 2026 | Devin Cloud, Agent Command Center, Adaptive Model Router, GPT-5.5 |

**Source:** `windsurf.com/changelog/windsurf-next` (direct inspection)

---

### Pricing & Feature Tiers (Official)

| Plan | Price | Key Limits |
|------|-------|------------|
| **Free** | $0 | 25 credits/month (~3-5 meaningful sessions), SWE-1.5 Free available (3-month promo) |
| **Pro** | ~$15/month | Standard quotas, most models |
| **Max** | Higher | Power users, larger quotas |
| **Teams** | ~$30/user/month | Centralized billing, admin dashboard, team-wide controls |
| **Enterprise** | Custom | SSO, SCIM, RBAC, Zero Data Retention, system-level rules/workflows via MDM, analytics API |

**Feature Tier Matrix:**

| Feature | Free | Pro | Teams | Enterprise |
|---------|------|-----|-------|------------|
| Rules (.windsurf/rules/*.md) | ✅ | ✅ | ✅ | ✅ |
| Workflows (.windsurf/workflows/*.md) | ✅ | ✅ | ✅ | ✅ |
| Memories (global + local) | ✅ | ✅ | ✅ | ✅ |
| Skills | ✅ | ✅ | ✅ | ✅ |
| AGENTS.md | ✅ | ✅ | ✅ | ✅ |
| Hooks (user/workspace level) | ✅ | ✅ | ✅ | ✅ |
| Hooks (system level) | ❌ | ❌ | ❌ | ✅ |
| System-level Rules & Workflows | ❌ | ❌ | ❌ | ✅ (MDM-deployed) |
| MCP Servers | ✅ | ✅ | ✅ | ✅ (admin whitelist) |
| Arena Mode | ❌ | ✅ | ✅ | ✅ |
| Cascade Dedicated Terminal | ✅ (opt-in) | ✅ | ✅ | ✅ |
| Devin Cloud | ❌ | ❌ | ✅ | ✅ |
| Analytics API | ❌ | ❌ | ❌ | ✅ |
| BYOK (Bring Your Own Key) | ✅ | ✅ | ✅ | ✅ |

**Source:** `docs.windsurf.com/llms-full.txt` (Plans and Credit Usage, Memories & Rules, Cascade Hooks sections)

---

## 2. The Core Practitioner Stack (Evidence-Based)

### Layer 1: RULES — Behavioral Constraints

**Three canonical locations:**
1. `global_rules.md` → `~/.codeium/windsurf/memories/` (cross-project, auto-loaded every session)
2. `.windsurfrules` → project root (legacy but working)
3. `.windsurf/rules/*.md` → project root (canonical per docs, supports activation modes)

**Activation modes (per official docs):**
- `auto` — loaded on every Cascade response
- `glob` — loaded when matching files are modified
- `manual` — loaded only when @mentioned

**Hard constraint:** Global rules limited to ~6000 tokens. Cannot fit everything there.

**Critical bug:** Issue #239 — `.windsurf/rules` in `.gitignore` = **silent failure**. Rules loaded 0 times with no error message.

**Source:** Official docs, `github.com/The-Pocket/PocketFlow-Template-Python/issues/3`

---

### Layer 2: WORKFLOWS — Repeatable Processes

**Location:** `.windsurf/workflows/*.md`
**Invocation:** `/command-name` in Cascade chat
**Features:**
- YAML frontmatter with `description:`
- Markdown body with step-by-step instructions
- No auto-invocation — must be manually triggered
- System-level workflows (Enterprise only, MDM-deployed)

**This project's usage:** 50 workflow files, 30+ git commits since April 2026

---

### Layer 3: MEMORIES — Persistent Knowledge

**Global:** `~/.codeium/windsurf/memories/` → auto-loaded every session, cross-project
**Local:** `.windsurf/memories/*.md` → NOT auto-loaded, must be manually referenced
**Rule:** Any memory you create is presented to the user, who can reject it

---

### Layer 4: RESEARCH — Project Knowledge Base (Undocumented Feature)

**Location:** `.windsurf/research/*.md`
**This project:** 18 files, 130 KB
**Other repos:** Not found in any inspected practitioner repo
**Status:** Undocumented by official docs. Appears to be a local convention.

---

### OPERATIONAL: `.codeiumignore`

- Controls language server indexing
- **Independent of `.gitignore`** — they don't interact
- Critical for repos > 100 MB (prevents RAM death)
- This project's own discovery: 1 KB `.todo` file triggered pathological re-indexing, RAM grew from 1.1 GB to 8.7 GB
- Bug #133: exception rules (`!pattern`) do NOT override `.gitignore`

---

### PARALLEL DEVELOPMENT: Git Worktrees

**Official support since Wave 13 (Dec 2025):**
> "Windsurf now supports Git worktrees, letting you spawn multiple Cascade sessions in the same repository without conflicts."

**Practitioner tools:**
- `priyashpatil/rift` — "Git worktree manager for parallel AI agent development"
- `kundeng/windloop` — "One Cascade session per working tree. Sessions sharing a branch will overwrite each other's changes."

**Official hook:** `post_setup_worktree` fires after worktree creation

---

## 3. The Power Moves — Highest-Leverage Practitioner Patterns

### #1: Agent Personas with `@name` Invocation

**Repos documenting this:** `windsurf-unlocked`, `BMad Method`, `learnship`
**Actual implementation (from `windsurf-unlocked`):**

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
- Rule #1: "Always start in Plan Mode. Refuse to edit code files."
- Output: Written plan with Goal, Non-goals, Constraints, Alternatives, Task breakdown, Risks, Rollback plan
- Constraint: "If plan doc is >800 lines, you're over-engineering."

**`implementer/AGENT.md`:**
```yaml
---
name: implementer
model: swe-1.6-fast
mode: code
tools: [read_file, write_file, edit_file, grep, search_code, run_command, read_terminal]
---
```
- Rule #1: "Always start from a plan."
- Rule #2: "Batch + parallelize."
- Rule #3: "Run tests after every checkbox."
- Rule #4: "Never weaken a test to make it pass."
- Stuck protocol: If stuck >10 min, stop, write note, hand off to `@architect`.

**`reviewer/AGENT.md`:**
```yaml
---
name: reviewer
model: claude-opus-4.6
tools: [read_file, grep, search_code, web_search, git_diff]
---
```
- Six-dimension review: Correctness, Security, Testing, Code smell, Performance, AGENTS.md alignment
- Output: BLOCKER → MAJOR → MINOR → NIT
- Explicit verdict: `LGTM` / `CHANGES REQUESTED` / `NEEDS DISCUSSION`

**Adoption metrics:**
- `windsurf-unlocked`: 33 stars, 7 forks, last updated 2026-04-17
- `bmad-method`: Not checked
- **This project does NOT use `@agent-name`** (confirmed by file inspection)

---

### #2: Auto-Triggered Skills (The Hidden Feature)

**Concept:** Skills fire automatically based on intent detection, NOT manual `/command`.

**Actual SKILL.md example (`compact-hygiene`):**
```yaml
---
name: compact-hygiene
description: Guides proactive /compact usage with preservation instructions
trigger: >
  Context window is approaching 50% utilization, OR user asks about:
  context management, drift, "the agent keeps forgetting", long sessions...
---
```

**The protocol:**
- Proactive (best): at 50–60% context utilization
- Pre-output: before large tool outputs you don't need verbatim
- Never: at 95% — by then foundational context is already degraded

**Preservation checklist:**
- Keep: current plan, AGENTS.md invariants, design decisions, blockers, error messages
- Drop: tool outputs from rejected paths, already-modified files, verbose logs, failed exploration

**Key insight:** "Never rely on compact as long-term memory — write durable facts to `vault/` before compacting; the vault survives forever, the session doesn't."

**Source:** `github.com/OnlyTerp/windsurf-unlocked/starter/.windsurf/skills/compact-hygiene/SKILL.md`

---

### #3: `engram` — 89.1% Token Savings

**Source:** `github.com/NickCirv/engram`
**Stars:** 117, Forks: 12

**The mechanism:** Intercepts every file read at tool boundary, answers from pre-assembled context packet.

**Three cache layers:**
1. Knowledge graph (agent has "paid" to build)
2. Per-provider SQLite cache
3. In-memory LRU

**Result:** ~500-token response instead of raw file.
**Measured:** 89.1% savings on reproducible benchmark. Best case: 98.4% (18,820 → 306 tokens).

**9 Built-in providers:** tree-sitter AST, regex heuristics, past failure nodes, git co-change patterns, MEMORY.md index, library API docs, project notes, LSP diagnostics.

**9 Hook handlers:** PreToolUse:Read (blocks if covered), PreToolUse:Edit (injects mistake warnings), SessionStart (injects project brief), PreCompact (re-injects god nodes — **survives compaction**), CwdChanged (switches project context).

**10 Safety invariants:** Handler error → passthrough, 2s timeout, kill switch, never intercept outside project root, never log user prompts.

**Why higher leverage than `lean-ctx`:** Measured (not claimed), works via hooks (no MCP), survives compaction, learns from mistakes.

---

### #4: `windsurf-cli` (staronelabs) — Programmatic Control

**Source:** `github.com/staronelabs/windsurf-cli`

**File protocol:** All communication through JSON files in `~/.windsurf-cli/`:
- `prompt.json` — CLI → Extension
- `response.json` — Hook → CLI
- `cascade-logs/{window}_{trajectory}.jsonl` — structured per-conversation logs

**Key commands:**
```bash
wsc "explain this codebase"          # send prompt
wsc -m "Claude Sonnet 4.5" "refactor" # choose model
wsc -w "what does this function do"  # wait for response (blocking)
wsc -a "add error handling"          # auto-accept
wsc -N ~/projects/myapp              # open new window
wsc --tabs                           # show all conversations
```

**Hooks used:** `pre_user_prompt`, `post_cascade_response`, `post_cascade_response_with_transcript`

---

### #5: `ckpt` — Agent Self-Correction

**Source:** `github.com/mohshomis/ckpt`

**The innovation:** The **AI itself** runs `ckpt restore 3`. Not a human clicking "revert."

```bash
ckpt watch     # auto-snapshots every AI change
ckpt steps     # see what happened step by step
ckpt restore 3 # AI goes back to step 3 autonomously
ckpt try approach-a -r 2  # branch: try different approach
ckpt end       # squash into clean git commit
```

**Why IDE checkpoints are insufficient:**
- IDE checkpoints: human clicks "revert", AI cannot operate them
- `ckpt`: AI runs `ckpt restore 3`, becomes self-correcting
- Works in any terminal, any CI pipeline, any environment

---

### #6: Complete Operational Frameworks

| Framework | Source | What It Provides | Adoption |
|-----------|--------|-----------------|----------|
| `windsurf-unlocked` | OnlyTerp | 8 agents, 8 skills, 10 workflows, vault, hooks, MCP | 33 stars |
| `learnship` | FavioVazquez | 57 workflows, context engineering, model profiles | Unknown |
| `RuleSurf` | akapug | Adaptive Project State, `init`/`save` commands | Unknown |
| `BMad Method` | cdwbrad | `@agent-name`, `.bmad-core/` | Unknown |

**Key insight:** These are starter kits, not single files. They provide a complete operational layer.

---

## 4. System Prompt Evolution (Leaked Prompts)

Four distinct versions showing behavioral evolution:

| Version | Date | Key Changes |
|---------|------|-------------|
| R0 | Dec 2024 | Baseline agent paradigm |
| R1 | Feb 2025 | Memory system, 64000 token limit |
| Wave ~10 | Apr 2025 | `codebase_search`, `view_file_outline`, single-edit constraint, model identity "Codeium engineering team" |
| Wave 11 | ~May 2025 | **"GPT 4.1" disclosure**, **8192 token limit** (down from 64000!), cost-awareness directives ("NEVER make redundant tool calls"), **`update_plan` tool**, `<planning>` section, rebranding to "Windsurf engineering team" |

**Critical finding:** The 8192 token limit per generation explains why large edits must be broken up. Cascade is a GPT-4.1 wrapper with system prompt engineering, not a custom model.

**Sources:**
- `github.com/jujumilk3/leaked-system-prompts/codeium-windsurf-cascade_20241206.md`
- `github.com/jujumilk3/leaked-system-prompts/codeium-windsurf-cascade-R1_20250201.md`
- `github.com/dontriskit/awesome-ai-system-prompts/windsurf/system-2025-04-20.md`
- `github.com/x1xhlol/system-prompts-and-models-of-ai-tools/Windsurf/Prompt%20Wave%2011.txt`

---

## 5. Negative Case Evidence (Real Pain Points)

### From Reddit (r/windsurf, r/Codeium)

1. **Auto-run terminal commands stopped working**
   > "Before it was possible for windsurf to chain terminal commands, read the outputs and then act on them. Now it's almost like it's been completely stopped from doing it."

2. **Permission prompts despite allowlist**
   > "I put commands on the allow list. I then switched to Turbo and that had no impact. .windsurfrules is empty"

3. **Cascade gets stuck after terminal commands**
   > "I had this issue pretty consistently with Claude 3.7. When I switched to Claude 3.7 Thinking it seemed to stop happening."

4. **Planning mode doesn't stop**
   > "How do I make it stop trying to plan and just do what I asked?"

5. **Context rot / forgetting**
   > "Start a new conversation when you feel the model is 'forgetting'... A good rule is to keep context between 40-50% of the limit."
   — fforbeck, ai-dev-workflow gist

6. **Context rot symptoms:**
   - AI suggests code contradicting recent decisions
   - References files/functions already removed
   - Repetition of solutions that already failed

**Why this matters:** The frameworks above (`compact-hygiene`, `engram`'s `PreCompact`, `RuleSurf`'s `save`) are **direct responses** to these pain points.

---

## 6. This Project's Actual Usage (Cross-Reference)

### Confirmed Active Use (from `git log`):
- **50 workflow files** in `.windsurf/workflows/`
- **30+ commits** touching `.windsurf/workflows/` since April 2026
- **`.windsurfrules`** actively maintained
- **`AGENTS.md`** present and referenced
- **`.windsurf/memories/`** with 3 files
- **`.windsurf/research/`** with 18 files (130 KB)
- **`.codeiumignore`** maintained (33 lines)

### NOT Used (confirmed by file inspection):
- `@agent-name` invocation
- `vault/` directory
- `plans/` directory
- MCP config in `.windsurf/`
- `.windsurf/hooks.json`

### Unique Local Innovation:
- `.windsurf/research/` — not found in any practitioner repo inspected
- This appears to be a project-specific convention for research knowledge base

---

## 7. First Principles Analysis

### Core Problem Being Solved
AI coding assistants have **stateless sessions** with finite context windows. Every session starts from zero project knowledge. The practitioner patterns above solve **context persistence**, **behavior consistency**, and **cost optimization**.

### Underlying Constraints
1. **Context window is finite** — 8192 tokens per generation (Wave 11 prompt), ~200k for SWE-1.6, 500k for Opus 4.6
2. **Session state is ephemeral** — ALL conversation context, including checkpoint summaries, will be deleted
3. **Token cost is the binding constraint** — each file read, each tool call, each response costs credits
4. **Agent behavior is prompt-engineered** — "GPT 4.1" with system prompt, not a custom model

### Inherent Tradeoffs

| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Heavy rules + workflows | Consistent behavior | Token overhead, 6000 token limit | Team standardization |
| Agent personas (@name) | No prompt engineering, model optimization | Setup complexity, token cost | Complex projects with distinct roles |
| Auto-triggered skills | Zero manual overhead | False positives/negatives | Quality gates (secret scan, test backfill) |
| Context optimization (engram) | 89% token savings | Setup complexity, possible inaccuracy | Large codebases, long sessions |
| Programmatic control (wsc) | CI integration, full logging | Fragile (file protocol), maintenance | Automation, audit trails |

### Failure Modes
1. **Misapplication:** Using `@agent-name` for simple tasks where a single prompt suffices
2. **Over-application:** 50 workflows with 80% unused → cognitive overload
3. **Under-application:** Not using `.codeiumignore` → RAM death on large repos
4. **False confidence:** Treating leaked prompts as current (Wave 11 is ~12 months stale)

---

## 8. Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| 8 agent personas exist with AGENT.md | Actual AGENT.md files read | Source inspection |
| Auto-triggered skills have trigger conditions | Actual SKILL.md with trigger field | Source inspection |
| Hooks merge system→user→workspace | Official docs | Doc inspection |
| 6000 token global rules limit | GitHub issue #3 | Issue inspection |
| Wave 13 shipped Git worktrees + Multi-Cascade | Official changelog | Doc inspection |
| Context Window Indicator is official | Official changelog | Doc inspection |
| System-level rules/workflows are Enterprise-only | Official docs | Doc inspection |
| This project has 50 workflows, 18 research files | File listing + git log | Direct inspection |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| "Practitioner repos widely adopt agent personas" | windsurf-unlocked: 33 stars only | **Modified** — documented but not widely adopted |
| "Skills are widely used" | No evidence of auto-triggered skills firing in practice | **Unverified** — concept documented, adoption unknown |
| "Wave 11 prompt is current" | Prompt is ~12 months old | **Abandoned** — current prompt unknown |

---

## 9. Knowledge Decay Assessment

| Section | Decay Risk | Review Date | Trigger |
|---------|------------|-------------|---------|
| Official feature list | High | Monthly | New Wave release |
| Pricing tiers | High | Quarterly | Plan changes (March 2026 was recent) |
| Leaked prompts | Very High | Immediate | New prompt leak |
| Practitioner repos | Medium | Quarterly | New commits |
| Model benchmarks | Medium | Quarterly | New model releases |
| This project's conventions | Low | Semi-annually | Local practice, slow change |

---

## 10. All Source References

### Official Documentation
- **Changelog:** `windsurf.com/changelog/windsurf-next`
- **Full docs (llms-full.txt):** `docs.windsurf.com/llms-full.txt`
- **Pricing:** `windsurf.com/blog/windsurf-pricing-plans`

### Leaked System Prompts
- **Dec 2024 R0:** `github.com/jujumilk3/leaked-system-prompts/codeium-windsurf-cascade_20241206.md`
- **Feb 2025 R1:** `github.com/jujumilk3/leaked-system-prompts/codeium-windsurf-cascade-R1_20250201.md`
- **Apr 2025 Wave ~10:** `github.com/dontriskit/awesome-ai-system-prompts/windsurf/system-2025-04-20.md`
- **Wave 11:** `github.com/x1xhlol/system-prompts-and-models-of-ai-tools/Windsurf/Prompt%20Wave%2011.txt`

### Practitioner Repos (Highest Leverage)
- **windsurf-unlocked:** `github.com/OnlyTerp/windsurf-unlocked` (33 stars, 7 forks, 2026-04-17)
- **engram:** `github.com/NickCirv/engram` (117 stars, 12 forks)
- **windsurf-cli:** `github.com/staronelabs/windsurf-cli`
- **ckpt:** `github.com/mohshomis/ckpt`
- **lean-ctx:** `github.com/yvgude/lean-ctx`
- **learnship:** `github.com/FavioVazquez/learnship`
- **RuleSurf:** `github.com/akapug/RuleSurf`
- **BMad Method:** `github.com/cdwbrad/bmad-method`

### Parallel Development
- **rift:** `github.com/priyashpatil/rift`
- **windloop:** `github.com/kundeng/windloop`

### Community Evidence
- **Reddit r/windsurf:** Multiple threads on auto-run, permissions, context rot
- **ai-dev-workflow gist:** `gist.github.com/fforbeck/a3aeeb71e71583adf099dfddfae7963c`

### This Project
- **Workflows:** `.windsurf/workflows/` (50 files)
- **Memories:** `.windsurf/memories/` (3 files)
- **Research:** `.windsurf/research/` (18 files, 130 KB)
- **Git history:** `git log --since="2026-04-01" -- .windsurf/workflows/`

---

## 11. Master Open Questions

1. What is the actual current system prompt (May 2026)? Wave 11 is ~12 months stale.
2. Does `@agent-name` actually work in Windsurf's current version? How does it interact with rules?
3. Do auto-triggered skills fire reliably? What's the false positive rate?
4. What is the real-world token overhead of running `windsurf-unlocked` full stack?
5. How does `engram` perform on a typical Next.js project? Is 89.1% generalizable?
6. Why does this project have `.windsurf/research/` when no other repo does?
7. Is the 6000 token global rules limit still accurate after Wave 13/14?
8. What triggered the auto-run terminal command regression in 2026?
9. How does the `update_plan` tool (mentioned in Wave 11 prompt) actually work?
10. What is `EPHEMERAL_MESSAGE` mechanism and what triggers it?

---

*End of consolidated master research artifact. Prior versions (v1-v5) remain in `_project/research/` for reference. This artifact supersedes all prior versions.*
