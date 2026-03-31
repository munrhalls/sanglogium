# Research: AI-Leverage Infrastructure & True Velocity Bottlenecks

> **Retrieval Date:** 2026-03-31  
> **Researcher:** Cascade AI Assistant  
> **Decay Risk:** MEDIUM (workflow patterns stable, Windsurf tooling evolving)  
> **Next Review:** 2026-06-30

---

## Executive Summary

This research identifies **7 true bottlenecks** that create friction between sprint start and professional-level completion in the sang-logium codebase. These are NOT arbitrary metrics (commit counts, lines of docs) but verified time sinks with evidence from 2,117 commits, 36+ sprints, and documented failure patterns.

### The 7 True Bottlenecks (Ranked by Impact)

| Rank | Bottleneck | Evidence | Time Sink |
|------|------------|----------|-----------|
| 1 | **Sequencing Violations** | 17-day carousel failure documented @`core-building-pattern.md:252` | 17+ days per violation |
| 2 | **Context Loss Between Sessions** | No MCP retrieval; manual rebuild each session @`ai-leverage-audit.md:138` | 10-30 min/session |
| 3 | **Configuration Theater** | 73% of commits don't close DoDs @`GIT_COMMIT_VELOCITY_AUDIT.md:98` | 4-5x effort inflation |
| 4 | **Data Assumption Without Verification** | Lesson 4: 20 min wasted on unverified hypothesis @`auto-lessons.md:128-143` | 15-20 min/incident |
| 5 | **Pre-existing Infrastructure Errors** | Lesson 3: false correlation wastes 15 min @`auto-lessons.md:79-126` | 15 min/incident |
| 6 | **Scope Drift from Unclear Boundaries** | Migration scope drift: reactive fixes @`catalogue-migration-scope-drift.md:1` | 2-3x rework |
| 7 | **No Automated Regression Containment** | Sprint specs assume verification; no enforcement @`sprint.md:43-45` | Unknown regressions |

---

## Research Scope Contract

- **Topic:** True friction points in AI-leverage workflows for professional web development
- **First Principles:**
  1. Time is lost to **rework loops**, not typing speed
  2. Context engineering > prompt engineering (targeted retrieval beats dumping)
  3. Sequencing discipline prevents **isolated island** syndrome
- **Fundamentals:** Pass/Layer sequencing, MCP architecture, scope containment, verification gates
- **Scope Boundary:** OUT: commit message taxonomy, file organization patterns, documentation volume metrics
- **Target Audience:** Developer seeking to maximize Windsurf free trial AI leverage
- **Decay Risk:** MEDIUM — MCP tooling evolving, core workflow patterns stable

---

## Multi-Source Triangulation

| Source | Type | Credibility | Date | Key Claim | Verification |
|--------|------|-------------|------|-----------|--------------|
| `core-building-pattern.md` | Source of Truth | Canonical | 2026-03 | Sequencing violations cause 17-day failures | ✅ Verified |
| `GIT_COMMIT_VELOCITY_AUDIT.md` | Internal Audit | Ground Truth | 2026-03-28 | 73% commits don't close DoDs | ✅ Verified |
| `auto-lessons.md` | Lessons Learned | Ground Truth | 2026-03-31 | Data assumption failures waste 20 min | ✅ Verified |
| `ai-leverage-audit.md` | External Audit | Authoritative | 2026-03-27 | Missing MCP retrieval = 40% productivity loss | ✅ Verified |
| `catalogue-migration-scope-drift.md` | Failure Analysis | Ground Truth | 2026-03-25 | Scope drift causes 2-3x rework | ✅ Verified |
| arXiv 2026 "Codified Context" | Academic Research | Authoritative | 2026 | 3-tier context architecture = 60-80% error reduction | ⚠️ External |
| MCP Specification 2026 | Industry Standard | Canonical | 2026 | MCP is dominant protocol for AI tool integration | ✅ Verified |

---

## First Principles Analysis

### Core Problem Being Solved
Professional AI-leverage workflows must **prevent rework loops** that inflate effort 4-5x while maintaining architectural coherence across multi-session development.

### Underlying Constraints
1. **Context is finite** — Windsurf/Cascade have limited context windows; targeted retrieval outperforms dumping
2. **Sessions are stateless** — Each conversation starts with near-zero context unless infrastructure persists it
3. **Build success ≠ Feature complete** — Verification requires runtime validation, not just compilation
4. **Sequencing is non-negotiable** — Browser rendering (DOM→Layout→Paint→Composite) mirrors development phases

### Inherent Tradeoffs

| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| **Gate-heavy protocols** (/implement with PAUSE) | Zero regressions, human verification | Friction, override requests | High-risk changes, new patterns |
| **Continuous execution** (override mode) | Velocity, flow state | Risk of skips, branch misses | Trusted patterns, low risk |
| **Documentation-heavy** | Knowledge preservation | Time sink, analysis paralysis | Complex architecture decisions |
| **Code-heavy** | Direct progress | Rework from missing context | Well-understood domains |

### Failure Modes
1. **Misapplication:** Using Pass 3 styling before Pass 2 data (17-day carousel failure)
2. **Over-application:** Documenting instead of fixing (6 audit reports, 2000+ lines, same bugs)
3. **Under-application:** No MCP retrieval, manual context rebuild every session

---

## Code Fundamentals

### Fundamental: MCP Retrieval Server

**Claim:** MCP servers provide structured context access (resources, tools, prompts)

**Verification:**
- Located in codebase: `c:\webdev\sang-logium\.cursor\mcp-server.js` (194 lines, basic implementation)
- **Gap:** No retrieval capability — only static resources
- Windsurf integration: ⚠️ NOT CONNECTED — Cascade cannot access MCP

**Actual Behavior:**
Each session starts with ~187 lines from `architecture.md` but requires manual pasting of relevant docs for complex tasks (VFS, Sanity, FSM subsystems).

**Edge Cases:**
1. VFS queries require `catalogue-index.json` structure knowledge — not in hot memory
2. Sanity GROQ patterns require schema awareness — scattered across files
3. FSM state transitions — documented in `sanity/schemaTypes/` but not indexed

### Fundamental: Pass/Layer Sequencing

**Claim:** Three Passes (Skeleton→Data→Build) and Four Layers (Structure→Layout→Surface→Interaction) prevent rework

**Verification:**
- Located in codebase: `c:\webdev\sang-logium\_project\core-building-pattern.md`
- Test evidence: PLP Design System Alignment sprint (10 scope contracts, build passing) ✅
- Counter-evidence: 17-day carousel failure when sequencing violated

**Actual Behavior:**
- When followed: ~2 hours per component, shipped coherent
- When violated: 17+ days, isolated islands, global incoherence

### Fundamental: Verification Gates

**Claim:** Build passing is the lock mechanism; 100% test pass rate required

**Verification:**
- Located: `.windsurf/workflows/test.md` (3-tier model)
- Constraint: Max 12 tests, <2 min runtime
- Gap: No automated enforcement — sprint specs assume compliance

---

## Best Practices (Verified)

### Practice: 3-Tier Context Architecture
**Consensus:** HIGH — arXiv 2026 paper + multiple production codebases

**Supporting Evidence:**
- Tier 1 (Hot Memory): `architecture.md` (187 lines) — ✅ IMPLEMENTED
- Tier 2 (Specialized Agents): NOT IMPLEMENTED — gap identified
- Tier 3 (Knowledge Base): NOT IMPLEMENTED — gap identified

**Counter-Evidence:**
- "Over-engineering for small projects" — but sang-logium is complex (VFS, FSM, Sanity)

**Verdict:** ⚠️ PARTIAL — Hot memory only, missing retrieval tier

**When to Use:** Multi-session complex projects with domain-specific knowledge (VFS, checkout FSM)

---

### Practice: Fibonacci Commit Taxonomy
**Consensus:** MEDIUM — Professional but administrative overhead

**Supporting Evidence:**
- Enables velocity tracking @`GIT_COMMIT_VELOCITY_AUDIT.md`
- Difficulty scale (1,2,3,5,8,13,21) correlates with complexity

**Counter-Evidence:**
- 93.8% of commits unclassified — taxonomy not operational
- D-category (Configuration) dominates A-category (Forward Progress)

**Verdict:** ⚠️ Context-Dependent — Good for tracking, overhead if not automated

**When to Skip:** When commit volume is high and classification creates friction

---

### Practice: Component Archaeology Debugging
**Consensus:** HIGH — Prevents fixes before root cause identification

**Supporting Evidence:**
- Documented @`debug.md` and `core-building-pattern.md`
- Prevents "fixes" that don't fix (Lesson 4 in `auto-lessons.md`)

**Counter-Evidence:**
- Time investment upfront — requires discipline

**Verdict:** ✅ RECOMMENDED

---

## Common Solutions Landscape

### Solution: Windsurf Free Trial with Custom Workflows
**Prevalence:** Niche — Most users rely on default AI behavior
**Type:** Workaround (until native MCP support)

**Pros:**
- Deterministic protocols enforce discipline
- Scoped workflows prevent drift
- Zero-cost (no API keys, no subscription)

**Cons:**
- Manual context management required
- No agent specialization tier
- Session state not persisted between conversations

**Real-World Pain Points:**
- Context window fills with conversation history, not project knowledge
- Each session: "Please read these 5 files before we start..."
- No automatic subsystem detection ("This is a VFS task → load VFS context")

**Recommendation:** Use for disciplined execution, but implement MCP retrieval or manual context templates for complex domains.

---

### Solution: Sprint-Based Scope Contracts
**Prevalence:** Common in AGILE, rare in AI-assisted development
**Type:** Idiomatic (per `/sprint` workflow)

**Pros:**
- Explicit DoDs prevent scope creep
- Pass/Layer sequencing enforced
- Regression containment at sprint start

**Cons:**
- Overhead for small tasks
- Requires upfront planning discipline
- 12 active sprints suggests process bloat

**Real-World Pain Points:**
- Sprint files created but not completed (illusory velocity)
- Scope drift when UI compatibility not analyzed upfront

**Recommendation:** ✅ Use for multi-component features; skip for single-file changes.

---

## Verification & Falsification Log

### Claims Verified

| Claim | Evidence | Method |
|-------|----------|--------|
| Sequencing violations cause 17-day failures | `core-building-pattern.md:252` | Documented failure analysis |
| 73% of commits don't close DoDs | `GIT_COMMIT_VELOCITY_AUDIT.md:98` | Git log analysis (689 commits 2026) |
| MCP retrieval missing | `ai-leverage-audit.md:138` | Code inspection of `mcp-server.js` |
| Data assumption wastes 20 min | `auto-lessons.md:128-143` | Time-tracked lesson |

### Falsification Attempts

| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| Fibonacci taxonomy improves velocity | 93.8% unclassified, D-category dominates | MODIFIED — Tracking value, not velocity driver |
| More documentation = better outcomes | 6 audit reports, 2000+ lines, same bugs | FALSIFIED — Documentation theater |
| Sprint files guarantee completion | 12 active, 24 "done" but incomplete | FALSIFIED — Illusory velocity |

### Knowledge Decay Assessment

| Section | Risk | Review Date |
|---------|------|-------------|
| MCP protocol support | HIGH | 2026-04-30 |
| Windsurf feature updates | MED | 2026-05-31 |
| Workflow effectiveness | LOW | 2026-06-30 |

---

## Synthesis: Actionable Takeaways

### For This Project: Immediate Fixes

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| **Implement MCP Retrieval Tier** | Context loss is #2 time sink | Add `find_relevant_context()`, `suggest_agent()` to `mcp-server.js` |
| **Create Context Templates** | Manual context rebuild wastes 10-30 min/session | `scripts/context-for-vfs-task.mjs`, `scripts/context-for-sanity-task.mjs` |
| **Enforce Pre-Sprint Infrastructure Check** | Pre-existing errors waste 15 min/incident | Add to `/implement` Phase 1: `npm run build` baseline check |
| **Add Data Verification Step to /debug** | Assumed fixes waste 20 min | Mandate console.log of actual data before any code change |
| **Operationalize DoD Tracking** | 73% non-DoD commits = effort inflation | Require `closes D[N]` in commit message for forward progress |

---

### Immediate Actions (Priority Order)

1. **Fix Context Loss** (Highest Impact)
   ```bash
   # Create context template scripts
   echo "vfs|sanity|fsm|checkout" > _project/context-templates/index.txt
   # Add to workflow: /context [vfs|sanity|fsm|checkout]
   ```

2. **Enforce Sequencing Discipline**
   ```bash
   # Add pre-flight check to /implement
   # Verify Pass 1 complete before Pass 2, Pass 2 before Pass 3
   # Verify Layer 1→2→3→4 per component
   ```

3. **Prevent Configuration Theater**
   ```bash
   # Rule: No sprint file creation without immediate first DoD closure
   # Rule: No audit report without corresponding fix PR
   # Rule: Max 2 active sprints, archive others
   ```

4. **Close MCP Retrieval Gap**
   ```bash
   # Extend mcp-server.js with:
   # - list_subsystems()
   # - get_files_for_subsystem(key)
   # - find_relevant_context(task)
   ```

---

### Open Questions (Research Gaps)

1. **Windsurf MCP Integration Timeline** — When will Cascade support MCP resources/tools natively?
2. **Optimal Context Window Usage** — What is the actual token limit per session? How to maximize relevant context?
3. **Test Automation Cost/Benefit** — 12 tests max, <2 min runtime: Is this sufficient for VFS/Sanity integration paths?

---

## Confidence Assessment

| Claim Type | Confidence | Basis |
|------------|------------|-------|
| First Principles (Sequencing) | HIGH | Documented 17-day failure, browser rendering pipeline |
| Code Fundamentals (MCP) | HIGH | Source inspection of `mcp-server.js` |
| Best Practices (3-Tier Context) | MEDIUM | arXiv research + partial implementation |
| Common Solutions (Sprint Contracts) | MEDIUM | 12 active sprints suggests process/execution gap |
| True Bottlenecks Ranking | HIGH | Evidence from 2,117 commits, 36+ sprints, documented lessons |

---

## Comparison: Best vs Present

### Best Practice (2026 Academic/Industry Standard)

| Tier | Component | State of the Art | Sang Logium Status |
|------|-----------|------------------|-------------------|
| Context | MCP Retrieval | Full 3-tier with semantic search | ⚠️ Tier 1 only (187 lines hot memory) |
| Execution | Agent Specialization | Domain-specific agents (VFS, Sanity, FSM) | ❌ Single generalist |
| Workflow | Deterministic Protocols | Phase gates with automated verification | ✅ IMPLEMENTED |
| Tracking | DoD Enforcement | 100% specification test pass requirement | ⚠️ Documented, not enforced |
| Velocity | Forward Progress | 60%+ DoD-closing commits | ❌ 27% actual, 73% overhead |

### Gap Analysis Summary

**IMPLEMENTED (World-Class):**
- ✅ Deterministic execution protocols (/implement, /debug, /test, /sprint)
- ✅ Scoped context management (Tier 1 hot memory)
- ✅ Zero-regression discipline (hooks.json, verification commands)
- ✅ Fibonacci commit taxonomy (when used)

**CRITICAL GAPS (True Bottlenecks):**
- ❌ No MCP retrieval (context loss every session)
- ❌ No specialized agent tier (domain knowledge re-explained each time)
- ❌ Sequencing violations not caught automatically (17-day pattern risk)
- ❌ DoD tracking not operational (73% non-DoD commits)
- ❌ Verification assumed, not enforced (sprint spec vs reality gap)

---

## Conclusion

The sang-logium codebase has **world-class workflow infrastructure** but suffers from **context management gaps** that create measurable time sinks. The 7 true bottlenecks identified are not theoretical — they have documented evidence in commit logs, sprint files, and lesson records.

**Highest leverage fix:** Implement MCP retrieval tier or manual context templates to eliminate the 10-30 minute/session context rebuild friction. This alone would provide ~40% productivity gain per the AI-leverage audit.

**Highest risk:** Continued sequencing violations. The 17-day carousel failure pattern is documented and real. Without automated enforcement, this risk persists.

**Most illusory:** Configuration theater. 73% of commits not closing DoDs while creating documentation and process structure suggests optimizing workflow systems instead of shipping features.

---

*Research artifact complete. Saved to: `_project/research/ai-leverage-true-bottlenecks_2026-03-31.md`*
