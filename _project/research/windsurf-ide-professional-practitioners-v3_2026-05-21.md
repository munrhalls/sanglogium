# Research: Windsurf IDE Professional Practitioner Patterns (v3 — Consolidated)

> **Retrieval Date:** 2026-05-21
> **Researcher:** AI/Human collaboration
> **Decay Risk:** Medium
> **Next Review:** 2026-08-21
> **Prior Versions:**
> - `windsurf-ide-professional-practitioners_2026-05-21.md` (v1 — 8 critical gaps)
> - `windsurf-ide-professional-practitioners-v2_2026-05-21.md` (v2 — 10 false positives, duplicate with prior research)
> - `windsurf-professional-practices.md` (May 14, 2026 — validated three-layer model)
> - `windsurf-professional-techniques.md` (May 10, 2026 — Hooks, Skills, AGENTS.md, MCP)

## Executive Summary

This is the **consolidated** research artifact. It does NOT duplicate prior findings. Instead, it:
1. **References** prior research for validated claims
2. **Fills** gaps identified in the v1/v2 audit
3. **Falsifies** false positives from v2
4. **Adds** newly discovered patterns from source-level checks

**Key Finding:** Professional practitioner behavior is narrower than documented features. The validated stack is **3 mechanisms with strong evidence**, not 5+.

---

## Prior Research — Do Not Duplicate

The following findings are **already validated** in prior artifacts. Read them there:

| Finding | Location | Status |
|---------|----------|--------|
| Three-layer governance model (rules + workflows + memories) | `windsurf-professional-practices.md` | ✅ Validated |
| Workflow YAML frontmatter + `# /command-name` format | `windsurf-professional-practices.md` | ✅ Validated |
| Commit taxonomy (A/B/C/D/E, Fib 1-13, DoD tracking) | `windsurf-professional-practices.md` | ✅ Validated |
| Cascade Hooks architecture | `windsurf-professional-techniques.md` | ✅ Validated |
| Skills progressive disclosure | `windsurf-professional-techniques.md` | ✅ Validated |
| AGENTS.md directory-scoping | `windsurf-professional-techniques.md` | ✅ Validated |
| MCP integration docs | `windsurf-professional-techniques.md` | ✅ Validated |
| PRD-first workflow (edsadr, COG-GTM) | `windsurf-professional-practices.md` | ✅ Validated |
| Memory Bank pattern (RuleSurf) | `windsurf-professional-practices.md` | ✅ Validated |

**This artifact covers ONLY what prior research missed or got wrong.**

---

## What's New in v3

### 1. `.codeiumignore` — Operational Pattern (v1/v2 Completely Missed)

**Source of Truth:** This project's own `.windsurf/memories/ide-ram-leak-lesson.md` (2026-04-24, 11-hour debugging session)

**Critical Facts:**
- `.codeiumignore` controls the **language server indexer**, NOT `.gitignore`
- `.gitignore` has **zero effect** on Windsurf's indexer
- Example: `scripts/image-pipeline/venv/` (604 MB of binaries) was in `.gitignore` but NOT `.codeiumignore` → language server consumed 5.8 GB RAM
- Fix: Add heavy directories to `.codeiumignore` + `Stop-Process language_server_windows_x64`
- Process auto-respawns — no IDE restart needed
- Changes require language server restart to take effect

**Practitioner Evidence:**
- `skillrepos/codeium-basics/.codeiumignore`: `labs.md`, `README.md`, `.devcontainer/*`, `images/*`, `create-tables.sql`
- `BlazeMCworld/Open-Codeium-Engine`: "recommended to setup a `.codeiumignore` file"
- `carlrannaberg/claudekit`: Supports `.codeiumignore` as one of multiple AI ignore formats

**Bug:** Issue #133 — `.codeiumignore` exception rules (`!pattern`) do NOT override `.gitignore` rules

**Verdict:** ✅ Critical operational pattern for any repo > 100 MB

---

### 2. Falsified Claims from v2

| Claim | Verdict | Evidence |
|-------|---------|----------|
| "`.windsurfrules` is legacy" | **FALSE** | No deprecation notice. `kinopeee` (271 stars) uses it exclusively. This project's May 14 research validated it. Docs omission ≠ deprecation. |
| "`.windsurf/memories/` is a distinct context layer" | **FALSE** | Zero auto-loading evidence. Official docs don't mention it. Files exist but are never read unless explicitly referenced. Calling it a "layer" implies automatic participation — unverified. |
| "MCP is actively used by practitioners" | **FALSE** | ONE rule file mentions MCP tools. ZERO repos have actual `mcp_config.json`. Zero practitioner configs found. Should be "mentioned in one rule file," not "actively used." |
| "Skills are a professional practitioner pattern" | **FALSE** | Official docs document them. `addyosmani/agent-skills` defines a format. But ZERO repos in the sample have actual `SKILL.md` in their Windsurf config. Aspirational, not evidence-based. |
| "AGENTS.md is a professional practitioner pattern" | **FALSE** | Official docs document it. `addyosmani/agent-skills` has one. But ZERO practitioner repos use AGENTS.md for their own projects. Documented by authority, not used by practitioners. |
| "The context stack is 5+ mechanisms" | **MISLEADING** | Rules, Workflows, and Memories are the only mechanisms with confirmed practitioner use. Skills, AGENTS.md, and MCP are documented features but NOT practitioner patterns. |
| "12 hook events universally available" | **OVERSTATED** | `post_cascade_response_with_transcript` mentions "Enterprise audit and compliance logging" — enterprise-only hint. Other events likely available to all tiers but not verified. |
| "Migrate to `.windsurf/rules/*.md`" | **SPECULATIVE** | Official docs recommend it, but this project intentionally uses `rules.md`. The May 14 research validated the current setup as working. No evidence `.windsurf/rules/*.md` works better here. |
| "Hooks have 3 config levels merged" | **UNVERIFIED** | Docs describe system/user/workspace levels. Only workspace `.windsurf/hooks.json` found in practice. No evidence anyone uses system-level or user-level hooks. |
| "12K char limit is enforced" | **UNVERIFIED** | Docs say "limited to 12000 characters" — could be recommendation, soft warning, or truncation. Not tested. |

---

### 3. Addy Osmani's `agent-skills` — The Actual Practitioner Format

**Source:** `github.com/addyosmani/agent-skills` (Google Chrome engineer, 25K+ followers)

**Important Caveat:** This is a **cross-platform** skill format (Claude Code, Cursor, Copilot, Antigravity, Windsurf). It is NOT Windsurf-specific. The `SKILL.md` files use a standardized format that works across agents.

**Actual `SKILL.md` Format:**
```yaml
---
name: skill-name-with-hyphens
description: Guides agents through [task]. Use when [trigger]. Max 1024 chars.
---

# Skill Title

## Overview
One-two sentences.

## When to Use
- Triggering conditions
- When NOT to use

## Core Process
Numbered steps or phases.

## Common Rationalizations
| Rationalization | Reality |

## Red Flags
- Behavioral patterns indicating violation

## Verification
- [ ] Checklist of exit criteria
```

**Standardized Sections:**
- `Overview` — what and why
- `When to Use` — triggers and exclusions
- `Core Process` — numbered steps
- `Specific Techniques` — detailed guidance
- `Common Rationalizations` — anti-excuse table
- `Red Flags` — behavioral violations to watch for
- `Verification` — exit criteria checklist

**Why This Matters:**
- The description is **injected into the system prompt** — must tell agent both what the skill provides AND when to activate it
- Max 1024 characters for description — brevity discipline
- `Common Rationalizations` section is unique — explicitly counters agent excuses ("I'll add tests later", "This is simple enough to skip the spec")

**Verdict:** ⚠️ High-quality format but **cross-platform**, not Windsurf-specific. Not yet widely adopted in Windsurf practitioner repos.

---

### 4. Model Selection — SWE-1.5 vs SWE-1.6 vs Fast Context (New)

**Sources:** Reddit r/windsurf discussions (community consensus)

| Model | Speed | Use Case | Practitioner Consensus |
|-------|-------|----------|------------------------|
| **SWE-1.5** | 950 tok/s | Fast agent tasks, simple edits | "Blazing fast good model" — best for quick iterations |
| **SWE-1.6** | 950 tok/s | Same as 1.5 but better performance | "Big step up from SWE-1.5" — beating GPT-4o on SWE-Bench Pro |
| **SWE-grep** (Fast Context) | Very fast | Code search, context retrieval | "Absolute quickest for bridging, research, augmentation of plans" |
| **Claude Sonnet 4** | Slower | Complex reasoning, architecture | Used when SWE models fail |
| **Claude Sonnet 4.5** | 2x cost | Premium reasoning | Controversial — "ruined pricing" per Reddit |

**Key Practitioner Insight:**
> "SWE-1.6 + Fast Context (SWE-grep) = absolute quickest for inquiry, research, augmentation of plans"

**Fast Context** is a specialized subagent for code retrieval. Practitioners pair it with SWE-1.6 for speed.

**Verdict:** ✅ Practitioner pattern confirmed; model selection is a real workflow decision

---

### 5. Negative Case Studies — Abandonment Patterns

**Source:** Reddit r/windsurf, r/Codeium (community pain points)

| Pattern | Abandonment Signal | Why |
|---------|---------------------|-----|
| Rules/Workflows | "Windsurf stops reading workflows and rules" (Reddit 2025) | Rules silently fail; no error message; user assumes agent is "stupid" |
| Rules/Workflows | "The AI is never aware of workspace rules" (Reddit 2025) | No git ignores, no settings conflicts — rules just don't load |
| Pricing model | "Windsurf pricing ruined it for me" (Reddit 2026) | Credit system → quota system; "2x" pricing on Sonnet 4.5 |
| Google acquisition fears | "Why would Google shut down Windsurf" (Reddit 2026) | $2.4B deal; fear of individual user abandonment; enterprise pivot |

**Critical Lesson:** The most common abandonment reason is **silent rule failure** — not the rules being wrong, but the agent not reading them. This validates the v1/v2 finding: **always verify rules are loaded before critical work.**

---

### 6. Rule Loading — Verified Bugs and Gotchas

| Issue | Evidence | Severity |
|-------|----------|----------|
| `.windsurf/rules` in `.gitignore` = silent failure | Issue #239 (Aug 2025, v1.12.3) | **CRITICAL** |
| Rules sometimes ignored even when correctly placed | Issue #157 (Dec 2024) | **HIGH** |
| `.codeiumignore` exceptions don't override `.gitignore` | Issue #133 | **MEDIUM** |
| `.windsurfrules` works but is not canonical | Official docs don't mention it | **LOW** |

**Actionable:** Always verify rule loading by asking agent "What project rules are you following?" at session start.

---

### 7. What Prior Research Got Right (That v2 Ignored)

The `windsurf-professional-practices.md` (May 14) had validated insights:

- **Empirical correlation**: "Presence of `.windsurf/workflows/` correlates with structured commit histories" — backed by 3,078 commits with taxonomy
- **PRD-first workflow**: `edsadr/windsurf-task-manager-workflow` and `COG-GTM/Cognition-SDD` as spec-driven design starters
- **Anti-pattern verification**: "Repositories without workflow directories show inconsistent commit patterns"
- **Validated stack**: Rules + Workflows + Memories = the only three mechanisms with confirmed practitioner use

---

## The Actual Practitioner Stack (Evidence-Based)

Based on source-level inspection of 15+ repos and official docs:

```
Layer 1: RULES (behavioral constraints)
├── global_rules.md          → ~/.codeium/windsurf/memories/ (cross-project)
├── .windsurfrules           → project root (legacy but working)
└── .windsurf/rules/*.md     → project root (canonical per docs, not yet widely used)

Layer 2: WORKFLOWS (repeatable processes)
└── .windsurf/workflows/*.md → manual invocation via /command-name

Layer 3: MEMORIES (persistent knowledge)
├── ~/.codeium/windsurf/memories/  → auto-loaded, cross-project
└── .windsurf/memories/*.md        → project-specific, NOT auto-loaded

OPERATIONAL: .codeiumignore (indexer control)
└── controls language server RAM usage, independent of .gitignore

OPTIONAL/ASPIRATIONAL (documented but NOT practitioner-confirmed):
├── Skills (.windsurf/skills/)     → progressive disclosure (zero practitioner repos)
├── AGENTS.md                      → directory-scoped (zero practitioner repos)
├── MCP (mcp_config.json)          → external tools (zero practitioner configs)
└── Hooks (12 events)              → mostly postWrite only in practice
```

---

## Open Questions (Research Gaps — All Versions)

1. **What is the exact context budget?** — 12K chars per rule file is known, but how many files can load before code context is evicted?
2. **How do AGENTS.md and `.windsurf/rules/*.md` interact?** — Same Rules engine, but precedence undefined.
3. **What is the current system prompt (May 2026)?** — Leaked prompts are 15 months stale.
4. **Do auto-generated memories persist across sessions?** — Where are they stored? Are they accessible?
5. **How does `.windsurf/memories/*.md` get loaded?** — Not in official docs; manual reference only?
6. **Is `.windsurfrules` being deprecated?** — No official notice, but docs omission is suspicious.
7. **Which hook events are available to free vs paid vs enterprise?** — `post_cascade_response_with_transcript` hints at enterprise-only.

---

## Confidence Assessment

| Claim Type | Confidence | Basis |
|------------|------------|-------|
| 3-layer practitioner stack (rules + workflows + memories) | **Very High** | 15+ repos + official docs + commit history correlation |
| `.codeiumignore` operational necessity | **Very High** | This project's own debugging session + multiple repos |
| `.windsurfrules` is legacy (not deprecated) | **High** | No deprecation notice + active use by kinopeee + this project |
| Skills/AGENTS.md/MCP as aspirational | **High** | Zero practitioner repos found using them |
| Model selection (SWE-1.6 + Fast Context) | **Medium** | Reddit consensus, not source-level |
| 12K char rule limit | **Medium** | Official docs claim, not tested |
| Hook event availability by tier | **Low** | Enterprise-only hints, not verified |

---

## Actionable Takeaways for This Project

1. **Keep current stack** — `rules.md` + `.windsurf/workflows/` + `.windsurf/memories/` is validated. Don't migrate to `.windsurf/rules/*.md` without a compelling reason.
2. **Maintain `.codeiumignore`** — Add any new heavy directories (ML models, coverage output, large JSON dumps).
3. **Verify rule loading** — Ask "What project rules are you following?" at session start.
4. **Try SWE-1.6 + Fast Context** — Community reports significant speed gains for research/planning tasks.
5. **Don't invest in Skills/AGENTS.md/MCP yet** — Zero practitioner adoption. Wait for evidence.
6. **Document the stack** — Add a section to `AGENTS.md` or `CLAUDE.md` explaining the 3-layer architecture.

---

## Source References

- **This project `.windsurf/memories/ide-ram-leak-lesson.md`** — `.codeiumignore` debugging
- **This project prior research** — `windsurf-professional-practices.md`, `windsurf-professional-techniques.md`
- **Windsurf Official Docs** — `docs.windsurf.com/llms-full.txt` (canonical mechanism docs)
- **addyosmani/agent-skills** — Cross-platform skill format
- **Reddit r/windsurf** — Model selection discussions, abandonment patterns
- **GitHub Issues** — #157, #239 (rule loading), #133 (`.codeiumignore`)
- **kinopeee/windsurfrules** — `.windsurfrules` active use
- **skillrepos/codeium-basics** — `.codeiumignore` example
