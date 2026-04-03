# AI-Leverage Infrastructure Sprint
## SPRINT_2026_03_31_AI_LEVERAGE_INFRASTRUCTURE

> **Target:** Implement 7 true bottleneck fixes to reduce friction and time sinks
> **Scope:** Context management, verification gates, workflow hardening
> **Created:** 2026-03-31
> **Status:** READY FOR EXECUTION

---

## Shorthand: Target State Changes & Rationale

### Improvement 1: Context Templates (Addresses Bottleneck #2)
**WHAT:** Create `scripts/context-for-[vfs|sanity|fsm|checkout].mjs` templates

**WHY:** Eliminate 10-30 min/session context rebuild friction
- **Evidence:** `ai-leverage-audit.md:138` — No MCP retrieval = 40% productivity loss
- **Historical:** Each complex task requires re-explaining VFS/Sanity structure
- **Use case:** Starting VFS debugging → run `node scripts/context-for-vfs-task.mjs` → instant context

**RISK LESSENED:** Context loss between sessions causing repeated explanation overhead

---

### Improvement 2: Data Verification Gate (Addresses Bottleneck #4)
**WHAT:** Enforce `/debug` workflow mandates actual data observation before hypothesis

**WHY:** Prevent 15-20 min wasted on unverified assumptions
- **Evidence:** `auto-lessons.md:128-143` — Lesson 4: 20 min wasted on assumed fix that didn't work
- **Historical:** Build passed but bug persisted; assumed `_ref` vs `_id` was issue without verifying
- **Use case:** Image not rendering → add `console.log(image)` → see actual Sanity response → then hypothesize

**RISK LESSENED:** "Fixes" that don't fix, build passing as false signal, rework loops

---

### Improvement 3: Pre-Sprint Infrastructure Check (Addresses Bottleneck #5)
**WHAT:** Add `/implement` Phase 1 requirement: verify clean build before sprint start

**WHY:** Prevent 15 min/incident false correlation investigations
- **Evidence:** `auto-lessons.md:79-126` — Lesson 3: Build error appeared after sprint work, false correlation assumed
- **Historical:** S8 sprint completion followed by build error; wasted 15 min verifying S8 work was actually correct
- **Use case:** Before any sprint → `npm run build` baseline → document pre-existing failures

**RISK LESSENED:** Pre-existing infrastructure errors masquerading as sprint regressions

---

### Improvement 4: MCP Retrieval Extension (Addresses Bottleneck #2)
**WHAT:** Extend `.cursor/mcp-server.js` with retrieval capabilities

**WHY:** Enable semantic context retrieval instead of static resources only
- **Evidence:** `ai-leverage-audit.md:152` — Without retrieval, manual overhead for complex tasks
- **Historical:** VFS queries require scattered knowledge across 5+ files
- **Use case:** "Fix VFS subtree logic" → MCP suggests `scripts/build-catalogue-index.mjs`, `lib/catalogue/`, VFS audit

**RISK LESSENED:** Time spent gathering scattered documentation for each complex task

---

### Improvement 5: Automated Regression Containment (Addresses Bottleneck #7)
**WHAT:** Add regression test enforcement to `/sprint` and `/implement` workflows

**WHY:** Prevent unknown regressions from scope drift
- **Evidence:** `catalogue-migration-scope-drift.md:1` — Migration caused 2-3x rework from scope drift
- **Historical:** UI compatibility not analyzed upfront; had to reverse-engineer component requirements reactively
- **Use case:** Data structure change → regression tests verify UI still renders correctly

**RISK LESSENED:** Scope drift, downstream consumer impact, reactive fixes

---

### Improvement 6: Sequencing Violation Guard (Addresses Bottleneck #1)
**WHAT:** Add `/sprint` enforcement: Pass 1→2→3, Layer 1→2→3→4 verification

**WHY:** Prevent 17+ day failures from mixing passes/layers
- **Evidence:** `core-building-pattern.md:252` — 17-day carousel failure from sequencing violation
- **Historical:** Deep work on carousel while ProductSpotlights had no real data; full composition never established
- **Use case:** PLP component build → verify Pass 1 skeleton complete before Pass 2 data

**RISK LESSENED:** Isolated islands, late integration hell, beautifully colored wrong layouts

---

### Improvement 7: DoD Operationalization (Addresses Bottleneck #3)
**WHAT:** Require `closes D[N]` marker in commit messages for forward progress tracking

**WHY:** Reduce 73% non-DoD commit overhead (configuration theater)
- **Evidence:** `GIT_COMMIT_VELOCITY_AUDIT.md:98` — 73% of commits don't close DoDs = effort inflation
- **Historical:** 2,117 commits with only 27% actual forward progress; documentation explosion without fixes
- **Use case:** Commit message must include `closes D3` or categorized as configuration/polish overhead

**RISK LESSENED:** Analysis paralysis, documentation theater, illusory velocity

---

## Pre-Sprint Regression Containment

### Files at Risk of Regression

| Area | File(s) | Risk | Containment Strategy |
|------|---------|------|---------------------|
| Debug Workflow | `.windsurf/workflows/debug.md` | Adding Data Verification Gate may conflict with existing steps | Verify debug.md syntax after edit |
| MCP Server | `.cursor/mcp-server.js` | Adding retrieval functions may break existing resources | Test existing resources still work |
| Sprint Workflow | `.windsurf/workflows/sprint.md` | Adding /test integration may conflict with existing sequencing | Verify workflow still parses |
| Context Scripts | `scripts/context-for-*.mjs` (new files) | No regression risk (greenfield) | Verify they don't conflict with existing scripts |

### Regression Tests (Run Before & After Sprint)

```bash
# 1. Workflow Syntax Check
npx markdownlint .windsurf/workflows/*.md  # If markdown lint available
# Or: Verify no broken links/references in workflows

# 2. MCP Server Runs Without Error
node .cursor/mcp-server.js --test  # If test flag exists
# Or: Source check: node -c .cursor/mcp-server.js

# 3. Build Passes
npm run build

# 4. New Scripts Are Runnable
node -c scripts/context-for-vfs-task.mjs  # Syntax check
node -c scripts/context-for-sanity-task.mjs
node -c scripts/context-for-fsm-task.mjs
node -c scripts/context-for-checkout-task.mjs
```

---

## Sprint Architecture

### Scope Contracts (7 Total — One Per Improvement)

**Pass Sequencing:**
- **Pass 1 — Skeleton (all 7 contracts):** File creation, structure only, no logic
- **Pass 2 — Data (all 7 contracts):** Content integration, no styling (not applicable for infrastructure)
- **Pass 3 — Build (one contract at a time):** Implementation, verification

---

## Scope Contract 1: Context Templates — VFS
**Addresses:** Bottleneck #2 (Context Loss)
**Benefit:** Eliminate 10-30 min VFS context rebuild per session

### Target State
`scripts/context-for-vfs-task.mjs` exists and outputs complete VFS context when run

### DoD — Pass 1: Skeleton
- [ ] Create `scripts/context-for-vfs-task.mjs` file with empty function structure

### DoD — Pass 2: Data
- [ ] Identify all VFS-related files from research: `data/catalogue-index.json`, `scripts/build-catalogue-index.mjs`, `lib/catalogue/`
- [ ] Map key concepts: slugToIdMap, slotMetadataMap, unrollDescendantKeys, buildGroqKeysParam

### DoD — Pass 3: Build
- [ ] Implement context output: file paths, key functions, common pitfalls (subtree correctness issue)
- [ ] Add CLI execution: `node scripts/context-for-vfs-task.mjs` prints formatted context
- [ ] Verify no syntax errors: `node -c scripts/context-for-vfs-task.mjs`

### Verification
```bash
node scripts/context-for-vfs-task.mjs | head -20
# Expected: VFS context summary, file paths, key concepts
echo $?
# Expected: 0 (success)
```

---

## Scope Contract 2: Context Templates — Sanity
**Addresses:** Bottleneck #2 (Context Loss)
**Benefit:** Eliminate 10-30 min Sanity context rebuild per session

### Target State
`scripts/context-for-sanity-task.mjs` exists and outputs complete Sanity context

### DoD — Pass 1: Skeleton
- [ ] Create `scripts/context-for-sanity-task.mjs` file

### DoD — Pass 2: Data
- [ ] Identify Sanity files: `sanity/schemaTypes/`, `sanity/lib/`, `sanity.types.ts`
- [ ] Map key concepts: Typegen, GROQ, schema contracts

### DoD — Pass 3: Build
- [ ] Implement context output for Sanity domain
- [ ] Verify: `node scripts/context-for-sanity-task.mjs` runs without error

### Verification
```bash
node scripts/context-for-sanity-task.mjs | head -10
# Expected: Sanity context summary
echo $?
# Expected: 0
```

---

## Scope Contract 3: Context Templates — FSM & Checkout
**Addresses:** Bottleneck #2 (Context Loss)
**Benefit:** Eliminate 10-30 min FSM/checkout context rebuild per session

### Target State
`scripts/context-for-fsm-task.mjs` and `scripts/context-for-checkout-task.mjs` exist

### DoD — Pass 1: Skeleton
- [ ] Create both files with empty structure

### DoD — Pass 2: Data
- [ ] Identify FSM files: order lifecycle schemas, state transitions
- [ ] Identify checkout files: address validation, payment flow

### DoD — Pass 3: Build
- [ ] Implement both context scripts
- [ ] Verify all 4 context scripts run: VFS, Sanity, FSM, Checkout

### Verification
```bash
for script in vfs sanity fsm checkout; do
  node scripts/context-for-${script}-task.mjs > /dev/null && echo "✅ ${script}" || echo "❌ ${script}"
done
```

---

## Scope Contract 4: Data Verification Gate — Debug Workflow
**Addresses:** Bottleneck #4 (Data Assumption)
**Benefit:** Prevent 15-20 min wasted on unverified fixes

### Target State
`.windsurf/workflows/debug.md` contains mandatory Data Verification Gate

### DoD — Pass 1: Skeleton
- [ ] Add "Data Verification Gate (MANDATORY)" section header to debug.md after Component Chain Analysis

### DoD — Pass 2: Data
- [ ] Document the 3 verification steps: console.log, actual API response check, data structure confirmation
- [ ] Reference Lesson 4 evidence: `auto-lessons.md:128-143`

### DoD — Pass 3: Build
- [ ] Write Data Verification Gate content with explicit rule: "No root cause hypothesis until actual data is observed"
- [ ] Update Root Cause Hypothesis step to reference "**verified** data"

### Verification
```bash
# Verify debug.md contains Data Verification Gate
grep -A5 "Data Verification Gate" .windsurf/workflows/debug.md | head -10
# Expected: Method, Verify, Rule lines
echo $?
# Expected: 0
```

---

## Scope Contract 5: Pre-Sprint Infrastructure Check — Implement Workflow
**Addresses:** Bottleneck #5 (Pre-existing Errors)
**Benefit:** Prevent 15 min/incident false correlation investigations

### Target State
`.windsurf/workflows/implement.md` Phase 1 requires baseline build verification

### DoD — Pass 1: Skeleton
- [ ] Add "Pre-Flight Checklist" subsection to Phase 1 in implement.md

### DoD — Pass 2: Data
- [ ] Document baseline verification: `npm run build` before sprint
- [ ] Reference Lesson 3 evidence: `auto-lessons.md:79-126`

### DoD — Pass 3: Build
- [ ] Write Pre-Flight Checklist with explicit commands
- [ ] Add rule: Document pre-existing failures before sprint work

### Verification
```bash
# Verify implement.md contains Pre-Flight Checklist
grep -A3 "Pre-Flight Checklist" .windsurf/workflows/implement.md
# Expected: Branch check, baseline build check
echo $?
# Expected: 0
```

---

## Scope Contract 6: MCP Retrieval Extension
**Addresses:** Bottleneck #2 (Context Loss)
**Benefit:** Semantic context retrieval instead of manual gathering

### Target State
`.cursor/mcp-server.js` has `find_relevant_context()` and `suggest_agent()` functions

### DoD — Pass 1: Skeleton
- [ ] Add function stubs: `find_relevant_context(task)`, `suggest_agent(task)`
- [ ] Add tool handlers in `handleRequest()` switch statement

### DoD — Pass 2: Data
- [ ] Map subsystems: VFS, Sanity, FSM, Checkout, PLP, PDP, Basket
- [ ] Identify key files per subsystem from codebase

### DoD — Pass 3: Build
- [ ] Implement keyword matching for subsystem detection
- [ ] Implement file suggestion per subsystem
- [ ] Add tool registration for new functions
- [ ] Verify MCP server still runs: `node .cursor/mcp-server.js` (basic smoke test)

### Verification
```bash
# Syntax check
node -c .cursor/mcp-server.js
# Expected: no syntax errors

# If possible to test: verify resources still list
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"resources/list"}' \
  http://localhost:3000/mcp 2>/dev/null || echo "Manual test required"
```

---

## Scope Contract 7: DoD Operationalization — Commit Taxonomy Enforcement
**Addresses:** Bottleneck #3 (Configuration Theater)
**Benefit:** Reduce 73% non-DoD commit overhead

### Target State
Commit taxonomy requires `closes D[N]` marker for forward progress commits

### DoD — Pass 1: Skeleton
- [ ] Document the problem in `_project/research/commit-taxonomy-operationalization.md`

### DoD — Pass 2: Data
- [ ] Reference evidence: `GIT_COMMIT_VELOCITY_AUDIT.md:98` — 27% DoD-closing commits
- [ ] Analyze recent commits to show current state

### DoD — Pass 3: Build
- [ ] Create commit message template with `closes D[N]` requirement
- [ ] Document new rule: All "A" category commits must include `closes D[N]`
- [ ] Add verification: git log check for compliance

### Verification
```bash
# Check recent commits for DoD markers
git log --oneline --since="2026-03-01" | grep -c "closes D" || echo "0"
# Note: This establishes baseline; improvement measured over time

# Verify documentation exists
ls -la _project/research/commit-taxonomy-operationalization.md
```

---

## Test Evidence Log

### Pre-Sprint Baseline
| Date | /test Invocation | Tests | Pass Rate | Verdict |
|------|------------------|-------|-----------|---------|
| 2026-03-31 | Baseline capture | 4 | TBD | ⏳ PENDING |

### Per Scope Contract
| Scope Contract | /test Date | DoD Tests | Pass Rate | Verdict |
|----------------|------------|-----------|-----------|---------|
| SC1: VFS Context | 2026-03-31 | 3 | ⏳ | ⏳ PENDING |
| SC2: Sanity Context | 2026-03-31 | 3 | ⏳ | ⏳ PENDING |
| SC3: FSM/Checkout Context | 2026-03-31 | 3 | ⏳ | ⏳ PENDING |
| SC4: Data Verification Gate | 2026-03-31 | 2 | ⏳ | ⏳ PENDING |
| SC5: Pre-Sprint Check | 2026-03-31 | 2 | ⏳ | ⏳ PENDING |
| SC6: MCP Retrieval | 2026-03-31 | 3 | ⏳ | ⏳ PENDING |
| SC7: DoD Operationalization | 2026-03-31 | 2 | ⏳ | ⏳ PENDING |

### Post-Sprint Final
| Date | /test Invocation | Total Tests | Pass Rate | Sprint Verdict |
|------|------------------|-------------|-----------|----------------|
| 2026-03-31 | Final verification | 18 | ⏳ | ⏳ PENDING |

---

## Scope Lock Rules

- **NO** changes to `globals.css` — infrastructure sprint, no styling
- **NO** changes to homepage components — regression containment
- **NO** changes to VFS data structures — audit findings frozen
- **NO** new npm dependencies — use existing tooling only
- **YES** all workflow changes must preserve existing functionality

---

## Expected Outcomes

| Bottleneck | Before | After | Time Saved |
|------------|--------|-------|------------|
| #2 Context Loss | 10-30 min/session rebuild | Instant via scripts/MCP | ~20 min/session |
| #4 Data Assumption | 15-20 min per unverified fix | Data-first verification | ~15 min/incident |
| #5 Pre-existing Errors | 15 min false correlation | Baseline check | ~15 min/incident |
| #3 Config Theater | 73% non-DoD commits | Enforced tracking | Reduced overhead |
| #1 Sequencing | 17-day pattern risk | Guard in workflow | Catastrophic prevention |
| #7 Regression | Unknown drift | Containment tests | Rework reduction |

**Total Estimated Impact:** 40-60 min saved per complex session + catastrophic failure prevention

---

## Immediate Execution Commands

```bash
# Verify baseline (Pre-Sprint Infrastructure Check)
npm run build

# Execute scope contracts in order:
# SC1: node scripts/context-for-vfs-task.mjs (create and test)
# SC2: node scripts/context-for-sanity-task.mjs (create and test)
# SC3: node scripts/context-for-fsm-task.mjs + checkout (create and test)
# SC4: Edit .windsurf/workflows/debug.md (Data Verification Gate)
# SC5: Edit .windsurf/workflows/implement.md (Pre-Flight Check)
# SC6: Edit .cursor/mcp-server.js (Retrieval functions)
# SC7: Document commit taxonomy enforcement

# Final verification
npm run build
```
