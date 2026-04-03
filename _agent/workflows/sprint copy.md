---
description: Execute sprint planning with systematic scope contracts and sequenced DoDs
---

# /Sprint Command Protocol

Role: you are professional, robust web developer and professional sprint manager. You received task to prepare comprehensive, systematic .todo sprint file to reach provided target state.

Your only task is to systematically research and understand the current codebase, to perform systematic observe, orient, choices and act - design such that you can prepare professionally informed sprint .todo file with systematic, professional scope contracts, verification per scope contract, meticulously and professionally sequenced layers of DoDs per scope contract, and simple, robust, minimal testing required per scope contract.

It's true for all sprints in general but especially for sprints that affect frontend ui, it's vital to abide by the themes of ai-webdev-spatial-curriculum-v3.md to write proper quality scope contracts and to sequence DoD layers properly and avoid the mistake of mixing up **Pass 1 — Skeleton Pass (all components, no styling):** **Pass 2 — Data Pass (all components, real data, no styling):** **Pass 3 — Build Pass (one component at a time, full scope):**
            1. Build component to DoD at desktop (1280px). Lock the desktop DoD items.
            2. Immediately build the same component to DoD at mobile (375px). Lock the mobile DoD items.
            Within a single component during Pass 3, there is also a sequencing rule. A component is built in exactly four layers, in order:
            ```
            Layer 1 — Structure:    Semantic HTML/JSX skeleton. No classes. No logic.
            Layer 2 — Layout:       Tailwind flex/grid/spacing/sizing only.
                                    No colors. No typography. No borders.
            Layer 3 — Surface:      Colors, typography, brand tokens, imagery.
            Layer 4 — Interaction:  Hover states, transitions, animations.
            ```
Professional sprint must enforce adherence to global design system (tailwind.config.ts for styling) first, in order to contain and seal shut risks of one-off's and disconnected implementations that fix a problem locally but disrupt global coherence, hence creating problems elsewhere by lack of discipline in adhering to global design system first. Hence, that discipline must be rigurously enforced and checked.

Critical: forward progress of a sprint happens only if regression risks are fully contained and sealed shut. Sprint must be extremely rigorous about not improving or changing anything outside the scope.

The start of a sprint must begin with:
- systematically identifying and processing all code areas at risk of regressions or unrelated changes due to sprint code changes
- systematically inserting scope and systematically sequenced layers of DoDs of writing simple, robust, professional regression tests per code code area at risk of regressions at the beginning of the sprint; it should be as concise as possible, while providing evidence of 0 regressions
- systematically enforcing scope and sequenced layers of DoDs of executing simple, robust, professional regression tests and systematically verifying lack of regressions after sprint

Output full, verified sprint in .md file in proper folder, in the _project/sprints

---

## MANDATORY /TEST INTEGRATION STEP (100% UNSKIPPABLE)

**Position in sequence:** After regression containment at sprint start, after each scope contract completion, before sprint finalization.

**Rule:** Sprint CANNOT proceed without /test execution. No scope contract is complete without /test evidence dashboard showing 100% specification test pass rate.

### Step 1: Pre-Sprint /Test Execution (At Sprint Start)
**Trigger:** Immediately after regression risks identified and containment tests defined.

**Action:** Invoke `/test` with:
- **Scope:** Sprint DoD items from scope contracts
- **DoDs:** Sequenced DoD layers per scope contract
- **Context:** Regression risks identified for containment

**Output required from /test:**
1. Test mapping table (DoD → test file)
2. Evidence dashboard showing baseline (pre-sprint)
3. **Verdict:** BASELINE CAPTURED

**Blocking:** YES - Sprint cannot start without baseline test suite established.

### Step 2: Per-Scope-Contract /Test Execution (During Sprint)
**Trigger:** After each scope contract's Pass 3 Build completion.

**Action:** Invoke `/test` with:
- **Scope:** Current scope contract DoD items only
- **DoDs:** Pass 3 DoD items for that specific component
- **Context:** Component-specific regression risks

**Output required from /test:**
```markdown
## Evidence Dashboard - Scope Contract N

### Coverage
| Tier | Count | Runtime | Pass Rate | Blocking |
|------|-------|---------|-----------|----------|
| Specification (DoD) | X/X | Xs | 100% | ✅ YES |
| Regression | X/X | Xs | 100% | ⚠️ WARN |
| Smoke | X/X | Xs | 100% | ✅ YES |

### Verdict
✅ **SCOPE CONTRACT N COMPLETE** - All DoD tests pass
OR
❌ **SCOPE CONTRACT N BLOCKED** - Fix failing DoD tests before proceeding
```

**Blocking:** YES 100% - If any specification test fails, scope contract is NOT complete. Fix and re-run /test until 100% pass rate.

### Step 3: Post-Sprint /Test Execution (At Sprint Finalization)
**Trigger:** After all scope contracts complete.

**Action:** Invoke `/test` with:
- **Scope:** Full sprint DoD items + regression safety net
- **DoDs:** All sprint DoDs + full regression suite
- **Context:** Complete regression risk matrix

**Output required from /test:**
```markdown
## Final Evidence Dashboard - Sprint [Name]

### Specification Coverage (DoD Enforcement)
| Scope Contract | DoD Tests | Pass Rate | Status |
|----------------|-----------|-----------|--------|
| SC1: [Name] | X/X | 100% | ✅ |
| SC2: [Name] | X/X | 100% | ✅ |
| ... | ... | ... | ... |
| **TOTAL** | **X/X** | **100%** | **✅** |

### Regression Coverage (Safety Net)
| Critical Path | Tests | Pass Rate | Status |
|---------------|-------|-----------|--------|
| [Path 1] | X/X | 100% | ✅ |
| [Path 2] | X/X | 100% | ✅ |

### Build Gate
| Check | Status |
|-------|--------|
| npm run build | ✅ PASS |
| Smoke tests | ✅ PASS |

### Sprint Lock Verdict
✅ **SPRINT COMPLETE & SHIPPABLE**
- All specification tests pass (100%)
- All critical regressions contained
- Build gate passed

**OR**

❌ **SPRINT BLOCKED**
- [ ] Fix failing specification tests
- [ ] Re-run /test until 100% pass rate
```

**Blocking:** YES 100% MANDATORY - Sprint is NOT complete without final evidence dashboard showing 100% specification test pass rate.

---

## /TEST CONSTRAINT RULES (Enforced Within /Sprint)

- **NO** scope contract marked complete without /test evidence dashboard
- **NO** sprint finalization without post-sprint /test execution
- **NO** test suite with >12 tests total
- **NO** test runtime >2 minutes
- **YES** 1 test per DoD item (mathematical 1:1 mapping)
- **YES** evidence dashboard generated at each /test invocation
- **YES** 100% specification test pass rate required for forward progress

---

## /TEST INTEGRATION OUTPUT FORMAT

Each sprint .todo file must include:

```markdown
## TEST EVIDENCE LOG

### Pre-Sprint Baseline
| Date | /test Invocation | Tests | Pass Rate | Verdict |
|------|------------------|-------|-----------|---------|
| YYYY-MM-DD | Baseline capture | X | 100% | ✅ BASELINE |

### Per Scope Contract
| Scope Contract | /test Date | DoD Tests | Pass Rate | Verdict |
|----------------|------------|-----------|-----------|---------|
| SC1 | YYYY-MM-DD | X/X | 100% | ✅ COMPLETE |
| SC2 | YYYY-MM-DD | X/X | 100% | ✅ COMPLETE |

### Post-Sprint Final
| Date | /test Invocation | Total Tests | Pass Rate | Sprint Verdict |
|------|------------------|-------------|-----------|----------------|
| YYYY-MM-DD | Final verification | X | 100% | ✅ SHIPPABLE |
```