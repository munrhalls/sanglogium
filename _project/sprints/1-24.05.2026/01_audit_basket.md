# Audit: Basket Feature Contracts and Diagrams

**Audit Date:** 2026-04-30
**Auditor:** Cascade AI
**Scope:** Basket feature data contracts, view contracts, and diagrams
**Target:** Identify gaps, inconsistencies, and areas for improvement

---

## 1. Current State Analysis

### Contract Structure
```
/docs/basket/
├── contract-data/
│   ├── prd-basket-contracts.md (Core basket operations)
│   ├── prd-basket-persistence-contracts.md (Storage layer)
│   ├── prd-basket-page-cms-sync-pipeline.md (CMS sync)
│   ├── prd-basket-page-orchestration.md (Page orchestration)
│   └── diagrams/ (4 diagrams)
└── contract-view/
    ├── prd-basket-controls-view-contracts.md (UI controls)
    ├── prd-basket-page-view-contracts.md (Basket page UI)
    ├── prd-view-cart-button-view-contracts.md (Cart button)
    └── diagrams/ (3 diagrams)
```

### Research Foundation
- **basket-feature-research.md:** Comprehensive research with 12 sources verified
- **basket-feature-wholeness-understanding.md:** Complete architectural understanding
- Both documents establish: minimal persistence schema, CMS-native pricing, boundary enforcement, graceful degradation

---

## 2. Gap Analysis (G-XX)

| ID | Area | Current State | Target State | Severity |
|----|------|---------------|--------------|----------|
| G-01 | Contract Consistency | Data contracts use `BasketItem` with `snapshot` field | Research shows `metadata` field for discrepancies | High |
| G-02 | Naming Convention | Mix of `displayPrice` vs `price_data` terminology | Consistent naming throughout all contracts | Medium |
| G-03 | State Representation | Contracts use `Record<productId, BasketItem>` | Research shows array-based structure in implementation | High |
| G-04 | Persistence Schema | Contract shows full BasketItem persistence | Research explicitly rejects this (minimal schema only) | Critical |
| G-05 | Sync Status | Contract shows persisted `syncingStatus` | Research explicitly rejects this (in-memory only) | Critical |
| G-06 | Metadata Handling | Contracts don't define metadata structure | Research shows `{old_price, old_availableStock}` pattern | High |
| G-07 | Diagram Completeness | CMS sync pipeline diagram minimal | Missing comparison logic, partitioning flow | Medium |
| G-08 | Contract Separation | Data and view contracts separate but unclear boundaries | Clear separation of concerns with explicit interfaces | Medium |
| G-09 | Error Handling | Contracts mention error states but no recovery flows | Defined error recovery and retry mechanisms | Medium |
| G-10 | Invariant Enforcement | Contracts state invariants but no enforcement mechanism | Explicit validation functions with pre/post-conditions | High |

---

## 3. Architectural Issues

### Issue A-01: Contract-Implementation Mismatch
**Problem:** Contracts describe `Record<productId, BasketItem>` but research shows implementation uses array-based structure.

**Evidence:**
- `prd-basket-contracts.md` line 7: `basket: Record<productId: string, BasketItem>`
- `basket-feature-research.md` line 345: "Zustand store holding an array of items"

**Impact:** Implementation guidance is misleading; developers may implement wrong structure.

### Issue A-02: Persistence Schema Violation
**Problem:** Persistence contract suggests full BasketItem persistence, violating minimal schema principle.

**Evidence:**
- `prd-basket-persistence-contracts.md` line 8: `basket: Record<productId: string, BasketItem>`
- `basket-feature-research.md` line 66: "Only persist {productId, quantity} to localStorage"

**Impact:** Could lead to stale pricing/stock data being persisted.

### Issue A-03: Missing Metadata Structure
**Problem:** Contracts reference discrepancy tracking but don't define metadata schema.

**Evidence:**
- `prd-basket-page-cms-sync-pipeline.md` line 48: Complex discrepancy object structure
- No corresponding type definition in contracts
- Research shows metadata attached to BasketItem

**Impact:** Unclear how to implement discrepancy tracking in UI.

### Issue A-04: Sync Status Persistence
**Problem:** Orchestration contract shows sync status as state but doesn't clarify persistence.

**Evidence:**
- `prd-basket-page-orchestration.md` line 46: `syncingStatus: 'syncing' | 'synced' | 'failed'`
- Research explicitly states "syncStatus is in-memory only"

**Impact:** Could lead to persisting error states across sessions.

---

## 4. Diagram Issues

### Issue D-01: Incomplete CMS Sync Flow
**Problem:** CMS sync pipeline diagram only shows error handling, not success path with comparison.

**Evidence:**
- `diagram-prd-basket-page-cms-sync-pipeline.md`: Only error handling diagram
- Missing: data transformation, comparison logic, partitioning

### Issue D-02: Missing Persistence Flow
**Problem:** Persistence diagram shows hydration but not debounced write flow.

**Evidence:**
- `diagram-basket-persistence-contract.md`: Shows load/validate but not write debounce
- Research emphasizes debounced persistence as critical

### Issue D-03: View Contract Diagrams Incomplete
**Problem:** View diagrams show rendering logic but not state synchronization.

**Evidence:**
- `diagram-prd-basket-controls-view-contracts.md`: Shows rendering, not state sync
- Missing: how view contracts bind to data contracts

---

## 5. Best Practice Violations

### Violation V-01: Single Responsibility Principle
**Problem:** Some contracts handle multiple concerns (orchestration + flags).

**Evidence:**
- `prd-basket-page-orchestration.md` combines orchestration and flag management
- Should be separate contracts

### Violation V-02: Interface Segregation
**Problem:** Contracts are monolithic; no clear interfaces for consumers.

**Evidence:**
- No explicit TypeScript interfaces defined
- Consumers must infer from operation descriptions

### Violation V-03: Explicit over Implicit
**Problem:** State transitions are implicit in operation descriptions.

**Evidence:**
- No state machine diagrams
- State changes described in prose within operation guarantees

---

## 6. Risk Assessment

| File | Risk | Mitigation |
|------|------|------------|
| `prd-basket-contracts.md` | High - Core operations wrong structure | Rewrite with array-based structure |
| `prd-basket-persistence-contracts.md` | Critical - Violates minimal schema | Explicitly filter CMS fields |
| `prd-basket-page-cms-sync-pipeline.md` | High - Complex discrepancy structure | Simplify with clear metadata schema |
| All diagrams | Medium - Incomplete flows | Add missing success/error paths |

---

## 7. Verification Commands

```bash
# Verify contract consistency with research
grep -r "BasketItem" docs/basket/contract-data/
grep -r "metadata" docs/basket/contract-data/

# Verify implementation alignment
grep -r "Record<productId" docs/basket/
grep -r "Array<BasketItem>" docs/basket/
```

---

## 8. Recommendations

### Immediate Actions
1. **Rewrite core basket contract** using array-based structure with metadata field
2. **Update persistence contract** to explicitly filter CMS fields (minimal schema)
3. **Define metadata schema** as explicit TypeScript interface
4. **Separate orchestration and flag contracts** for single responsibility
5. **Add complete CMS sync diagram** with comparison and partitioning
6. **Add persistence write diagram** showing debounced flow

### Long-term Improvements
1. **Add state machine diagrams** for all stateful contracts
2. **Define explicit TypeScript interfaces** for all contracts
3. **Add contract tests** to verify implementation alignment
4. **Create consumer examples** for each contract
5. **Add error recovery flows** to all contracts

---

## 9. Success Criteria

New contracts must:
- ✅ Align with research findings (minimal schema, in-memory sync status)
- ✅ Use consistent naming throughout
- ✅ Define explicit TypeScript interfaces
- ✅ Include complete state machine diagrams
- ✅ Separate concerns clearly (single responsibility)
- ✅ Define error recovery mechanisms
- ✅ Be simpler and more robust than current version
