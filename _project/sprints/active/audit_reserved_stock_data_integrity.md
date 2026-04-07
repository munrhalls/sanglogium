# Audit: Reserved Stock Data Integrity Migration

## Executive Summary

**Current State**: 578 out of 582 products (99.3%) lack the `reservedStock` field, forcing the checkout system to use `setIfMissing` as a runtime workaround. This creates technical debt, potential race conditions, and query complexity.

**Migration Target**: All products have `reservedStock: 0` field properly set, enabling clean checkout code without runtime patches.

**Risk Level**: Medium - Well-researched migration pattern with existing Sanity transaction infrastructure.

---

## 1. Current Data State

### Product Field Distribution
- **Total products**: 582
- **With reservedStock field**: 4 (0.7%)
- **Without reservedStock field**: 578 (99.3%)
- **Null values**: 578
- **Zero values**: 1
- **Positive values**: 3

### Schema Configuration
```typescript
// productType.ts lines 62-70
defineField({
  name: "reservedStock",
  title: "Reserved Stock",
  type: "number",
  description: "Stock reserved by active checkout sessions",
  initialValue: 0,
  readOnly: false,
  validation: (Rule) => Rule.min(0),
})
```

### Current Workarounds in Code
```typescript
// validateBasket.ts lines 81-82, 106-107
.setIfMissing({ reservedStock: 0 })
.inc({ reservedStock: item.quantity })
```

---

## 2. Technical Architecture Analysis

### 2.1 Current Implementation Pattern

**Reservation Flow**:
1. Fetch product with `stock` and `reservedStock` fields
2. Calculate: `availableStock = (stock || 0) - (reservedStock || 0)`
3. Atomic transaction: `setIfMissing({ reservedStock: 0 }) + inc({ reservedStock: quantity })`
4. On success: `dec({ stock, reservedStock })`
5. On failure: `dec({ reservedStock })` only

**Client Configuration**:
- Uses `checkoutClient` (useCdn: false) for immediate consistency
- Transaction-based atomic operations
- Revision-based concurrency control (`ifRevisionId`)

### 2.2 Migration Infrastructure

**Existing Patterns**:
- Transaction batching in `scripts/migrations/index.mjs`
- Dry-run capability with `--dry-run` flag
- Progress tracking and error handling
- Rollback via backup/restore strategy

**Client Setup**:
```javascript
// Standard migration client pattern
const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-11-14',
  useCdn: false  // Critical for mutations
});
```

---

## 3. Gap Analysis

| ID | Component | Current State | Target State | Severity |
|----|-----------|---------------|--------------|----------|
| G-01 | Data Consistency | 578 products missing field | All products have `reservedStock: 0` | Critical |
| G-02 | Checkout Code | Uses `setIfMissing` workaround | Direct field access | High |
| G-03 | Query Complexity | `(reservedStock || 0)` patterns | Simple `reservedStock` access | Medium |
| G-04 | Type Safety | Field optional in queries | Field guaranteed present | Medium |
| G-05 | Performance | Runtime patch overhead | Direct field access | Low |

---

## 4. Migration Strategy

### 4.1 Recommended Approach: Custom Script with Transactions

**Rationale**:
- Project already uses `@sanity/client` with token
- Need custom verification logic
- Batch processing for 582 documents
- Integration with existing migration patterns

**Alternative Rejected**: Sanity CLI Migration
- Limited customization for verification
- No integration with existing client config

### 4.2 Migration Script Design

```javascript
// scripts/migrations/addReservedStock.mjs
export async function* migrate(documents, context) {
  for await (const document of documents()) {
    if (!defined(document.reservedStock)) {
      yield patch(document._id, [
        at('reservedStock', set(0))  // Not setIfMissing - we know it's missing
      ]);
    }
  }
}
```

**Batch Processing**:
- 50 documents per transaction (under 500KB limit)
- Progress tracking with console output
- Error handling per batch

### 4.3 Verification Strategy

**Pre-Migration**:
```javascript
// Count documents needing migration
const count = await client.fetch(
  'count(*[_type == "product" && !defined(reservedStock)])'
);
```

**Post-Migration**:
```javascript
// Verify all documents have field
const missing = await client.fetch(
  'count(*[_type == "product" && !defined(reservedStock)])'
);
```

---

## 5. Risk Assessment

### 5.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Transaction timeout | Low | Medium | Batch size 50, progress tracking |
| Partial migration | Low | High | Atomic transactions, verification |
| CDN consistency | Medium | Low | Use useCdn: false client |
| Type errors | Low | Medium | TypeScript verification |

### 5.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Checkout downtime | Low | High | Schedule low-traffic window |
| Data loss | Very Low | Critical | Full backup before migration |
| Performance impact | Low | Medium | Batch processing, monitoring |

---

## 6. Implementation Plan

### Phase 1: Preparation (2-3 hours)
1. Create backup of all product documents
2. Create migration script with dry-run capability
3. Create verification script
4. Test on staging environment

### Phase 2: Migration (1-2 hours)
1. Run migration in dry-run mode
2. Execute full migration with progress tracking
3. Verify completion
4. Monitor system performance

### Phase 3: Code Cleanup (1 hour)
1. Remove `setIfMissing` from `validateBasket.ts`
2. Remove `setIfMissing` from `rollbackReservations`
3. Update TypeScript interfaces if needed
4. Run full test suite

### Phase 4: Validation (1 hour)
1. End-to-end checkout testing
2. Performance verification
3. Data integrity checks
4. Monitor production metrics

---

## 7. Files Requiring Changes

### Migration Files (CREATE)
- `scripts/migrations/addReservedStock.mjs` - Main migration script
- `scripts/migrations/verifyReservedStock.mjs` - Verification script
- `scripts/migrations/backupProducts.mjs` - Backup script

### Application Files (MODIFY)
- `app/actions/checkout/validateBasket.ts` - Remove `setIfMissing`
- Lines 81-82: Remove `.setIfMissing({ reservedStock: 0 })`
- Lines 106-107: Remove `.setIfMissing({ reservedStock: 0 })`

### Test Files (CREATE)
- `tests/integration/migrations/reservedStock.test.ts` - Migration tests
- `tests/integration/checkout/reservedStock.test.ts` - Checkout tests

---

## 8. Verification Commands

### Pre-Migration
```bash
# Count products needing migration
node scripts/migrations/verifyReservedStock.mjs --count

# Backup products
node scripts/migrations/backupProducts.mjs
```

### Migration
```bash
# Dry run
node scripts/migrations/addReservedStock.mjs --dry-run

# Execute migration
node scripts/migrations/addReservedStock.mjs

# Verify completion
node scripts/migrations/verifyReservedStock.mjs
```

### Post-Migration
```bash
# Type checking
npx tsc --noEmit

# Unit tests
npx vitest run tests/unit/preCheckout/

# Integration tests
npx vitest run tests/integration/checkout/

# E2E tests
npx playwright test checkout-flow.spec.ts
```

---

## 9. Success Criteria

1. **Data Integrity**: All 582 products have `reservedStock: 0`
2. **Code Cleanliness**: No `setIfMissing` usage in checkout code
3. **Performance**: No regression in checkout response time
4. **Testing**: All tests pass with migrated data
5. **Monitoring**: No errors in production for 24 hours

---

## 10. Rollback Plan

### If Migration Fails
1. Restore from backup: `node scripts/migrations/restoreProducts.mjs`
2. Verify restore: `node scripts/migrations/verifyReservedStock.mjs`
3. Check system functionality

### If Issues Detected Post-Migration
1. Revert code changes to restore `setIfMissing` workaround
2. Investigate root cause
3. Re-schedule migration after fixes

---

## 11. Timeline Estimate

- **Phase 1**: 2-3 hours (Preparation)
- **Phase 2**: 1-2 hours (Migration execution)
- **Phase 3**: 1 hour (Code cleanup)
- **Phase 4**: 1 hour (Validation)

**Total: 5-7 hours** (excluding backup/restore time)

---

## 12. Dependencies

- Sanity CMS access with write permissions
- Product data backup location (S3/local storage)
- Low-traffic window (recommended: 2-4 AM UTC)
- Test environment with copy of production data

---

## 13. Monitoring Checklist

### During Migration
- [ ] Transaction success rate
- [ ] API response times
- [ ] Error logs
- [ ] Progress tracking

### Post-Migration (24 hours)
- [ ] Checkout conversion rate
- [ ] Stock accuracy
- [ ] Error rates
- [ ] Performance metrics

---

## 14. Lessons Learned from Previous Migrations

### From Brand Reference Migration Failure
- **Search entire codebase** for field usage BEFORE migration
- **Update ALL interfaces, queries, and components** in single atomic change
- **Verify field types** with generated Sanity types

### From Catalog Migration Scope Drift
- **Document component contracts** explicitly
- **Define migration strategy** (incremental vs big-bang)
- **Map data dependencies** before implementation

### Applied to This Migration
- Limited scope: Single field addition, no type changes
- No component impact: Field is internal to checkout logic
- Atomic operation: Single script with transaction batches
- Comprehensive verification: Pre/post migration checks

---

*Audit completed: 2026-04-06*
*Next step: Execute sprint based on this audit*
