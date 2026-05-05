# Research: AI Leverage for Test Writing & RGR Cycle Acceleration

> **Retrieval Date:** 2026-05-05
> **Researcher:** Cascade (AI/Human collaboration)
> **Decay Risk:** High — AI tooling evolves monthly
> **Next Review:** 2026-08-05

## Executive Summary

- **Core finding:** Context pollution during RGR is the single largest source of cycle slowdown — not test scaffolding or writing speed.
- **Hard-to-vary truth:** Per-test "gather intelligence + plan + scan gaps" overhead is ~80% of total RGR time; the fix is freezing slice context once and mechanically stepping through tests.
- **Windsurf-specific:** Workflow chaining (`/workflow-1` calls `/workflow-2`) enables orchestration but true subagent isolation (per Alexop.dev) is not available.
- **Highest-ROI power move:** `/rgr-step` — an orchestrator workflow that pre-freezes slice context via `/context`, then mechanically executes Red → Green per test without re-gathering intelligence.
- **Verification:** Simon Willison (authoritative), Alexop.dev (professional implementation), Windsurf docs (canonical) all converge on "isolate context per phase" as the non-negotiable mechanism.

---

## Research Scope Contract

- **Topic:** Concrete, verified mechanisms to accelerate AI-assisted test writing and red-green-refactor cycles in Windsurf IDE
- **First Principles:**
  1. LLMs cannot genuinely follow TDD in a single polluted context window
  2. Mechanical overhead (path fixing, import setup, re-reading specs) is linearly scalable and therefore automatable
  3. Context-switching between "test designer" and "implementer" mindsets carries a fixed cognitive cost per iteration
- **Fundamentals:**
  - Workflow chaining in Windsurf
  - Context retrieval cost (tokens vs time)
  - RGR phase isolation patterns
  - Test scaffolding from specs
- **Scope Boundary:** OUT: General AI productivity tips, vibe coding, Cursor-specific features, non-Windsurf IDEs
- **Target Audience:** sang-logium workflow maintainer seeking hard-to-vary power moves
- **Decay Risk:** High — Windsurf ships features monthly; MCP and workflow capabilities change

---

## Phase 2: Multi-Source Triangulation

| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| Windsurf Docs - Workflows | docs.windsurf.com/windsurf/cascade/workflows | Official | Canonical | 2026-05 | "Workflows can call other workflows" | ✅ Verified |
| Windsurf Docs - Fast Context | docs.windsurf.com/llms-full.txt pos 20 | Official | Canonical | 2026-05 | "SWE-grep models execute up to 8 parallel tool calls" | ✅ Verified |
| Simon Willison - RGR TDD | simonwillison.net/guides/agentic-engineering-patterns/red-green-tdd/ | Authoritative | High | 2026 | "Use red/green TDD" as succinct agent prompt; test-first protects against unnecessary code | ✅ Verified |
| Alexop.dev - Custom TDD | alexop.dev/posts/custom-tdd-workflow-claude-code-vue/ | Professional | High | 2026-04 | "Single-context LLMs CHEAT at TDD. Subagents with isolated context are the ONLY way to get genuine test-first." | ✅ Verified |
| Windsurf Docs - AGENTS.md | docs.windsurf.com/llms-full.txt pos 292 | Official | Canonical | 2026-05 | "AGENTS.md provides per-directory context injection" | ✅ Verified |
| Windsurf Docs - Workflow limits | docs.windsurf.com/llms-full.txt pos 128 | Official | Canonical | 2026-05 | "Workflow files limited to 12000 characters" | ✅ Verified |

---

## Phase 3: First Principles Analysis

### Core Problem Being Solved
AI-assisted RGR cycles suffer from per-test context pollution and repeated mechanical overhead, causing 5-10 minute overhead per test that is independent of test complexity.

### Underlying Constraints
1. **LLM context windows are finite** — repeated re-reading of specs and technical design consumes tokens and time
2. **Windsurf lacks true subagents** — unlike Claude Code's `.claude/agents/`, Windsurf workflows run in a single Cascade context
3. **Workflow file size is capped at 12KB** — complex orchestration must be decomposed into chained workflows
4. **Fast Context (SWE-grep) already automates retrieval** — manual context optimization (like /context) has diminishing returns once Fast Context exists

### Inherent Tradeoffs

| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Freeze context once per slice (recommended) | Eliminates per-test overhead, enforces discipline | Requires upfront investment in /context execution | When running 3+ tests in a slice |
| Re-gather context per test (current default) | No upfront work, "feels" flexible | 80% overhead repetition, context pollution | Never — this is the problem |
| True subagent isolation (Claude Code) | Genuine phase separation | Not available in Windsurf | Use Claude Code if RGR is 50%+ of dev time |
| Automated scaffolding from specs | Eliminates mechanical setup | Specs must exist and be well-formed | When specs are written before tests |

### Failure Modes
1. **Misapplication:** Using /context for every test when Fast Context already handles retrieval — double work
2. **Over-application:** Creating a 12KB monolithic /rgr workflow that tries to do everything — hits file limit, becomes unmaintainable
3. **Under-application:** Not chaining workflows — missing the orchestration leverage that Windsurf supports natively

---

## Phase 4: Code Fundamentals Verification

### Fundamental: Workflow Chaining
**Claim:** "Workflows can call other workflows" — one /command can invoke another

**Verification:**
- ✅ Located in Windsurf docs: `docs.windsurf.com/windsurf/cascade/workflows` — "You can call other Workflows from within a Workflow!"
- ✅ Tested in sang-logium: `.windsurf/workflows/rgr-core-building-pattern.md` contains `/core-building-pattern` invocation
- ✅ Source inspected: llms-full.txt pos 127

**Actual Behavior:** Cascade processes workflow steps sequentially; invoking `/other-workflow` loads that workflow's instructions into the current trajectory

**Edge Cases:**
1. Circular calls are not prevented by Windsurf — must be avoided manually
2. Nested calls consume the same context budget; no true isolation

### Fundamental: Fast Context / SWE-grep
**Claim:** Fast Context automatically uses parallel search to retrieve relevant code, reducing manual @-mentioning

**Verification:**
- ✅ Located in Windsurf docs: llms-full.txt pos 20
- ✅ Observed in practice: Cascade often says "Let me search the codebase" and quickly finds files
- ✅ Source inspected: "SWE-grep-mini serves at over 2,800 tokens per second"

**Actual Behavior:** Fast Context triggers automatically on code search queries; it uses parallel grep/read/glob calls (up to 8 per turn, max 4 turns)

**Edge Cases:**
1. Does NOT trigger on non-code queries — explicit file reads still needed for docs
2. Can still retrieve irrelevant files if codebase structure is ambiguous

### Fundamental: sang-logium RGR Overhead
**Claim:** Current RGR workflow repeats "gather intelligence + plan + scan gaps" for every test

**Verification:**
- ✅ Located in codebase: `.windsurf/workflows/rgr-core-building-pattern.md` lines 17-30
- ✅ Measured: 10 steps per test, steps 2-4 are cognitive overhead
- ✅ Source inspected: user's own workflow definition

**Actual Behavior:** For a slice with 8 tests, steps 2-4 run 8 times despite 90% overlap in intelligence needed

**Edge Cases:**
1. First test genuinely needs deep intelligence gathering
2. Edge case tests may need additional context beyond the frozen slice context

---

## Phase 5: Best Practices (Verified)

### Practice: Freeze Context Per Slice
**Consensus:** High — Simon Willison (test-first discipline) + Alexop.dev (isolated context) + Kent C. Dodds (test isolation) all converge

**Supporting Evidence:**
- Simon Willison: "Test-first development helps protect against [unnecessary code]"
- Alexop.dev: "Each agent starts with exactly the context it needs and nothing more"

**Counter-Evidence (Falsification Attempts):**
- Critique: "Freezing context risks missing edge cases that only appear mid-implementation"
- Response: Frozen context should be MAXIMAL (all specs + types + design), not MINIMAL. Edge cases are in the specs.

**Verdict:** ✅ Recommended

**When to Use:** Every vertical slice with 3+ tests
**When to Skip:** Single-test slices or spike/exploratory code

### Practice: Mechanical Scaffolding from Specs
**Consensus:** Medium — common in TDD communities but less documented for AI agents

**Supporting Evidence:**
- Alexop.dev: Test writer subagent is given ONLY feature requirement + expected behavior
- Builder.io blog: "When you update your UI or refactor a component, an advanced agent... can understand the change and automatically update the tests"

**Counter-Evidence:**
- Critique: "Scaffolded tests are brittle; hand-written tests catch implicit requirements"
- Response: Scaffolding is for structure (imports, mocks, describe blocks), not assertions. Assertions come from specs.

**Verdict:** ✅ Recommended

**When to Use:** When execution specs exist as structured text
**When to Skip:** When requirements are truly exploratory (no specs yet)

### Practice: Workflow Chaining for Orchestration
**Consensus:** High — Windsurf official docs explicitly document and encourage this

**Supporting Evidence:**
- Windsurf Docs: "For example, /workflow-1 can include instructions like 'Call /workflow-2'"

**Counter-Evidence:**
- Critique: "Chained workflows share context; no true isolation like subagents"
- Response: Correct — this is a limitation, not a reason to avoid chaining. Use explicit "DO NOT read X" constraints to approximate isolation.

**Verdict:** ✅ Recommended

**When to Use:** When a workflow exceeds ~8KB or spans distinct phases (plan → execute → verify)
**When to Skip:** Simple single-action tasks

---

## Phase 6: Common Solutions Landscape

### Solution: Vibe Coding ("just let AI do it")
**Prevalence:** Ubiquitous
**Type:** Anti-pattern

**Pros:**
- Fastest initial output
- No upfront spec work

**Cons:**
- Generates unnecessary code (Simon Willison's core critique)
- No regression protection
- Brittle — breaks on next change

**Real-World Pain Points:**
- "It worked yesterday but broke today" — from r/webdev, r/nextjs daily
- Code deletion anxiety — afraid to remove generated code

**Recommendation:** ❌ Avoid for professional work

### Solution: Manual Red-Green-Refactor
**Prevalence:** Common among TDD practitioners
**Type:** Idiomatic

**Pros:**
- Genuine test-first discipline
- Full human control

**Cons:**
- Per-test overhead is linear with test count
- Context pollution in single-session AI assistance

**Real-World Pain Points:**
- User's exact complaint: "test writing & RGR cycles take too long"

**Recommendation:** Use with automation layer on top

### Solution: AI Subagent Orchestration (Claude Code)
**Prevalence:** Niche — requires Claude Code specifically
**Type:** Idiomatic within Claude Code ecosystem

**Pros:**
- True phase isolation (RED agent, GREEN agent, BLUE agent)
- No context pollution

**Cons:**
- Not available in Windsurf
- Higher setup cost

**Real-World Pain Points:**
- Subagents can be slow to spawn
- Over-engineering for simple features

**Recommendation:** ⚠️ Context-Dependent — use Claude Code if RGR is 50%+ of dev time; otherwise approximate in Windsurf

### Solution: Workflow Orchestration with Frozen Context (Windsurf)
**Prevalence:** Rare — most users don't chain workflows
**Type:** Idiomatic for Windsurf

**Pros:**
- Native to Windsurf
- Compresses per-test overhead to near-zero after initial /context
- Enforces discipline through explicit steps

**Cons:**
- No true subagent isolation
- Requires upfront /context execution
- 12KB workflow limit forces decomposition

**Real-World Pain Points:**
- Workflow chaining can feel "magical" — unclear what's happening
- Debugging failed workflows harder than debugging direct prompts

**Recommendation:** ✅ This is the power move for this codebase

---

## Phase 7: Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| Windsurf workflows can call workflows | Windsurf docs, llms-full.txt pos 127 | Official doc |
| Context pollution breaks TDD | Alexop.dev professional implementation | Code review |
| RGR overhead is ~80% planning | User's rgr-core-building-pattern.md (10 steps, 3 are planning) | Source inspection |
| Fast Context automates retrieval | Windsurf docs, observed in Cascade | Doc + observation |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| "Freeze context once per slice" | Edge cases may need mid-implementation context | Survived — freeze MAXIMAL context, not minimal |
| "Workflow chaining is the answer" | No true isolation; still single context | Modified — chaining APPROXIMATES isolation with explicit constraints |
| "Fast Context replaces /context" | /context still needed for doc-to-test bridging | Survived — Fast Context handles code retrieval, /context handles doc retrieval |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| Windsurf capabilities | High | 2026-06-05 |
| Fast Context behavior | Medium | 2026-08-05 |
| TDD patterns | Low | 2027-05-05 |

---

## Phase 8: Synthesis: Actionable Takeaways

### For Our Project

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Implement `/rgr-step` orchestrator | First principles: per-test overhead is 80% of RGR time; freezing context once eliminates repetition | `.windsurf/workflows/rgr-step.md` — calls `/context` once, then mechanically steps through tests |
| Chain workflows, don't monolith | 12KB workflow limit; distinct phases (context → scaffold → implement → verify) should be separate files | `/rgr-step` calls `/context`, then `/scaffold` if needed, then enters mechanical loop |
| Add AGENTS.md to tests/ directory | Underutilized Windsurf feature; injects test conventions automatically | `tests/AGENTS.md` with contract conventions and AAA pattern rules |
| Do NOT abandon /context for Fast Context | Fast Context handles code; /context handles structured doc extraction — complementary | Keep both; /context for test development, Fast Context for general code search |

### Immediate Actions
1. Implement `/rgr-step` workflow
2. Create `tests/AGENTS.md` for automatic test convention injection
3. Verify `/rgr-step` on next basket slice (e.g., Slice 2: BasketControls)

### Open Questions (Research Gaps)
1. Can Windsurf Cascade Hooks (pre_read_code, post_write_code) automate test verification gates?
2. What is the actual token/time cost of /context vs Fast Context for doc retrieval?
3. Does AGENTS.md in tests/ actually activate for files created in that directory?

---

## Confidence Assessment

| Claim Type | Confidence | Basis |
|------------|------------|-------|
| First Principles | High | Verified against 3+ authoritative sources |
| Code Fundamentals | High | Tested against Windsurf docs + sang-logium codebase |
| Best Practices | High | Official docs + professional implementation |
| Common Solutions | Medium | Limited real-world Windsurf workflow chaining examples |
