# Research: Basket Non-Local Basket & Testing Conventions

**Date:** 2026-05-03  
**Topic:** Non-Local Basket feature architecture and testing conventions  
**Purpose:** Internal research for current chat window work

---

## Research Scope Contract
- **Topic:** Non-Local Basket feature implementation and testing methodology
- **First Principles:** Test-first development, layer separation, context-aware rendering
- **Fundamentals:** Zustand state management, localStorage persistence, cross-tab sync, AAA testing pattern
- **Scope Boundary:** Feature architecture and testing conventions only (excludes checkout, payment, CMS sync)
- **Target Audience:** Developers implementing non-local basket feature
- **Decay Risk:** Low - fundamental patterns are stable

---

## First Principles Analysis

### Core Problem Being Solved
Users need persistent basket state across sessions and tabs with minimal infrastructure overhead.

### Underlying Constraints
1. **HTTP is stateless** - client-side state management required
2. **Browser storage has limits** - quota, security restrictions, private mode
3. **Cross-tab communication is limited** - storage events only fire on other tabs
4. **Tests must verify implementation** - false positives are catastrophic

### Inherent Tradeoffs
| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| localStorage + storage events | Simple, no deps | No current tab sync | Cross-tab sync sufficient |
| BroadcastChannel API | Bi-directional sync | More complex | Real-time sync required |
| External sync library | Feature-rich | Dependency overhead | Complex sync needs |

### Failure Modes
1. **Misapplication:** Testing store state in integration tests (unit test responsibility)
2. **Over-application:** Testing all contexts together instead of separately
3. **Under-application:** Writing tests that pass immediately (false positives)

---

## Code Fundamentals Verification

### Fundamental: Zustand Store with Persist Middleware
**Claim:** Zustand store with persist middleware, Zod validation, fallback storage

**Verification:**
- ✅ Located in codebase: `store/basketStore.ts`
- ✅ Tests created: `docs/basket/non-local-basket/__tests__/unit/basketStore.spec.ts`
- ✅ Source inspected: Implementation matches technical design exactly

**Actual Behavior:**
- Store uses persist middleware with custom fallback storage (localStorage → sessionStorage)
- Zod schema validates inputs (productId, quantity, displayPriceAtAdd, availableStockAtAdd)
- Hydration validation resets to empty state on corrupt data
- Graceful degradation on storage failures

**Edge Cases:**
1. localStorage quota exceeded → falls back to sessionStorage
2. Corrupt data in storage → resets to empty state
3. Storage events don't fire on originating tab → acceptable for sync needs

---

## Best Practices (Verified)

### Practice: Test-First Development (RGR Cycle)
**Consensus:** High - foundational testing principle

**Supporting Evidence:**
- docs/testing/TEST_FIRST_PRINCIPLES.md
- Industry standard (TDD)

**Counter-Evidence:** None - universally accepted

**Verdict:** ✅ Recommended

**When to Use:** Always for new features
**When to Skip:** Never - false positives are catastrophic

---

### Practice: Context-Aware Integration Testing
**Consensus:** High - critical for multi-state components

**Supporting Evidence:**
- docs/testing/TEST_INTEGRATION_CONTEXT_AWARENESS.md
- HTML Structure documentation shows context-specific rendering

**Counter-Evidence:** None - context-ignorant tests miss critical bugs

**Verdict:** ✅ Recommended

**When to Use:** Component renders differently based on page/state/props
**When to Skip:** Single-context components

---

### Practice: Test Layer Trust
**Consensus:** High - prevents duplication

**Supporting Evidence:**
- docs/testing/TEST_LAYER_TRUST.md
- Separation of concerns principle

**Counter-Evidence:** None - duplication causes maintenance issues

**Verdict:** ✅ Recommended

**When to Use:** Always - integration tests trust unit tests
**When to Skip:** Never

---

## Common Solutions Landscape

### Solution: Zustand + Persist Middleware
**Prevalence:** Common in React ecosystem
**Type:** Idiomatic

**Pros:**
- Minimal boilerplate
- Built-in TypeScript support
- Middleware ecosystem

**Cons:**
- Learning curve for middleware pattern
- Storage event timing nuances

**Real-World Pain Points:**
- Storage events don't fire on originating tab (documented, acceptable)
- localStorage quota limits (addressed with fallback)

**Recommendation:** Use for client-side state with persistence needs

---

### Solution: AAA Pattern for Tests
**Prevalence:** Ubiquitous in testing
**Type:** Idiomatic

**Pros:**
- Clear test structure
- Easy to read and maintain
- Industry standard

**Cons:**
- None significant

**Real-World Pain Points:**
- None when applied correctly

**Recommendation:** Always use for test structure

---

## Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| basketStore.ts implements technical design | Code matches design exactly | Code inspection |
| Test files follow testing conventions | Tests use AAA pattern, layer trust | Code inspection |
| Context-aware testing required | HTML Structure shows context-specific rendering | Documentation analysis |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| All basket controls render together | HTML Structure shows add OR increment/decrement (not all) | Survived - context-aware required |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| Testing conventions | Low - fundamental principles | 2027-05-03 |
| Zustand patterns | Med - framework evolves | 2026-11-03 |
| Storage API | Low - stable browser API | 2027-05-03 |

---

## Synthesis: Actionable Takeaways

### For Our Project
| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Use test-first approach | Prevents false positives | Write failing tests before implementation |
| Test contexts separately | Context-aware components | Nested describe blocks per context |
| Integration tests trust unit tests | Layer separation principle | Integration tests test UI only, not store state |
| Use Zustand with persist | Proven pattern, already in project | basketStore.ts implements this |

### Immediate Actions
1. Write integration tests following context-aware pattern for BasketControls components
2. Ensure integration tests never test store state directly (unit test responsibility)
3. Use AAA pattern for all new tests
4. Co-locate tests with feature docs in `/docs` folder

### Open Questions
None - all fundamentals verified and documented.

---

## References
- docs/basket/non-local-basket/1. PRD.md
- docs/basket/non-local-basket/3. Technical Solution Design.md
- docs/basket/non-local-basket/6. Tests Plan.md
- docs/testing/TEST_FIRST_PRINCIPLES.md
- docs/testing/TEST_INTEGRATION_CONTEXT_AWARENESS.md
- docs/testing/TEST_LAYER_TRUST.md
- store/basketStore.ts (verified implementation)
