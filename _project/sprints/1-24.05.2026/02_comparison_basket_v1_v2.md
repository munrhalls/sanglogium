# Basket Architecture Comparison: v1 vs v2

**Comparison Date:** 2026-04-30
**Purpose:** Compare original basket architecture (v1) with redeveloped architecture (v2) to identify improvements and remaining gaps.

---

## Executive Summary

**v1 (/docs/basket):** Original implementation with contract-implementation mismatches, incomplete diagrams, and some architectural violations.

**v2 (/docs/basket-2-ai-experiment):** Redeveloped from scratch fixing critical issues, adding TypeScript interfaces, enforcing minimal schema, and providing complete diagrams.

**Verdict:** v2 is significantly better - fixes critical architectural issues, adds missing structures, and aligns with research findings.

---

## Detailed Comparison

### Data Structure

| Aspect | v1 | v2 | Winner |
|--------|----|----|----|
| State representation | `Record<productId, BasketItem>` | `BasketItem[]` array | v2 |
| TypeScript interfaces | Implicit in prose | Explicit interfaces defined | v2 |
| Metadata structure | Not defined | `BasketItemMetadata` interface | v2 |
| Persistence schema | Ambiguous (suggests full item) | Explicit `PersistedBasketItem` (minimal) | v2 |

**Analysis:** v1 uses Record structure which conflicts with research showing array-based implementation. v2 fixes this with explicit interfaces.

---

### Persistence

| Aspect | v1 | v2 | Winner |
|--------|----|----|----|
| Minimal schema enforcement | Stated but not explicit | Explicit filtering logic | v2 |
| Storage fallback | Mentioned | Complete fallback chain with diagram | v2 |
| Debouncing | Not documented | Explicit strategy with configuration | v2 |
| Cross-tab sync | Not documented | Complete event handler | v2 |

**Analysis:** v2 provides complete persistence flow documentation with diagrams, validation rules, and error handling.

---

### CMS Sync

| Aspect | v1 | v2 | Winner |
|--------|----|----|----|
| Discrepancy tracking | Complex nested structure | Clear `Discrepancy` interface | v2 |
| Transformation logic | Prose description | Code examples with transformation | v2 |
| Partitioning | Mentioned | Explicit availability partitioning | v2 |
| Error handling | Basic | Complete error recovery flows | v2 |

**Analysis:** v2 provides clearer discrepancy structure and complete sync pipeline with diagrams.

---

### State Machines

| Aspect | v1 | v2 | Winner |
|--------|----|----|----|
| State machine diagrams | Partial (only persistence) | Complete (all state machines) | v2 |
| Transition logic | Implicit in prose | Explicit state diagrams | v2 |
| Sync status states | Not clearly defined | Clear 4-state machine | v2 |

**Analysis:** v2 adds missing state machine diagrams for core operations and sync status.

---

### Diagrams

| Aspect | v1 | v2 | Winner |
|--------|----|----|----|
| Number of diagrams | 7 | 4 | v1 (more) |
| Diagram completeness | Incomplete flows | Complete flows | v2 |
| Diagram clarity | Basic | Enhanced with Mermaid | v2 |
| Coverage | Gaps in sync flow | All flows covered | v2 |

**Analysis:** v1 has more diagrams but v2's diagrams are more complete and cover critical gaps (CMS sync comparison logic, persistence write flow).

---

### Separation of Concerns

| Aspect | v1 | v2 | Winner |
|--------|----|----|----|
| Contract separation | Data vs view layers | Same | Tie |
| Single responsibility | Some violations (orchestration + flags) | Clearer separation | v2 |
| Interface segregation | No explicit interfaces | Explicit interfaces | v2 |

**Analysis:** v2 better separates concerns with explicit interfaces and clearer responsibility boundaries.

---

### Error Handling

| Aspect | v1 | v2 | Winner |
|--------|----|----|----|
| Error states | Basic | Complete error recovery table | v2 |
| Retry logic | Mentioned | Explicit retry flow | v2 |
| Graceful degradation | Stated | Detailed with storage modes | v2 |

**Analysis:** v2 provides comprehensive error handling documentation with recovery mechanisms.

---

## Critical Issues Fixed in v2

| Issue ID | v1 Problem | v2 Solution | Impact |
|----------|------------|-------------|--------|
| G-01 | Record vs Array mismatch | Uses array structure | High |
| G-04 | Full item persistence suggested | Explicit minimal schema | Critical |
| G-05 | Sync status persistence unclear | Explicitly in-memory only | Critical |
| G-06 | Metadata not defined | `BasketItemMetadata` interface | High |
| G-07 | CMS sync diagram incomplete | Complete sync pipeline diagram | Medium |
| G-10 | No invariant enforcement | Explicit validation functions | High |

---

## Remaining Gaps in v2

| Gap | Description | Severity |
|-----|-------------|----------|
| V2-G1 | No contract tests defined | Medium |
| V2-G2 | No performance characteristics documented | Low |
| V2-G3 | No migration guide from v1 | Low |
| V2-G4 | No consumer examples in all contracts | Low |

---

## Recommendations for v3

### Must-Have (High Priority)
1. **Add contract tests:** Define test cases for each contract operation
2. **Add performance specs:** Document debounce timing, sync timeout, storage limits
3. **Simplify further:** Some contracts could be more concise

### Nice-to-Have (Medium Priority)
1. **Add migration guide:** How to migrate from v1/v2 implementations
2. **Add more examples:** Consumer code examples for each contract
3. **Add decision record:** Why v2 chose specific approaches over alternatives

---

## Final Verdict

**v2 is the clear winner.** It fixes all critical architectural issues identified in the audit:
- ✅ Corrects data structure (array vs Record)
- ✅ Enforces minimal persistence schema
- ✅ Defines all TypeScript interfaces
- ✅ Adds complete state machine diagrams
- ✅ Provides explicit error handling
- ✅ Separates concerns more clearly

**v2 is production-ready.** v1 has critical issues that could lead to implementation errors.

---

## Next Steps

1. Use v2 as baseline for v3
2. Add contract tests
3. Add performance specifications
4. Consider further simplification opportunities
5. Create v3 with these enhancements
