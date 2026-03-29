# SPRINT: Catalogue Data Mapping Correctness

**Date:** SU 29 03 2026  
**Status:** Ready for Execution  
**Estimated Duration:** 7 hours (2 + 3 + 2)

---

## Sprint Contract

### Target State
- Truth table exists documenting expected catalogue item -> product mappings
- All product mix-ups deleted (wrong catalogue assignments removed)
- Validation confirms zero cross-contamination in product subsets
- Each catalogue item key returns only semantically correct products

### Scope Boundaries

**IN SCOPE:**
- Product catalogueLocationKeys audit and correction
- Semantic matching validation
- Truth table creation and verification
- Data integrity validation scripts

**OUT OF SCOPE:**
- UI rebuild (already deleted, stays deleted)
- Basket functionality
- Checkout flow
- Homepage modifications
- Catalog structure changes (VFS is correct)

### Success Criteria
- 100% of products have correct catalogueLocationKeys assignments
- Zero products appear in wrong category subsets
- Automated validation passes with no exceptions

---

## Scope Contract 1: Truth Table - Catalogue Item -> Products

### DOD Layer 1 - Discovery

- [ ] Fetch all products from Sanity with current catalogueLocationKeys
- [ ] Fetch all leaf catalogue items (type: "link") from Sanity
- [ ] Export current state to JSON for analysis
- [ ] Document current mapping state (correct + incorrect)

**Verification:**
- Script: `scripts/audit-catalogue-mappings.mjs` exists and runs
- Output: `data/current-mappings.json` created
- Count: Total products, products with keys, products without keys

### DOD Layer 2 - Semantic Rules Definition

- [ ] Review `lib/catalogue/semanticConfig.ts` for all category rules
- [ ] Ensure every leaf catalogue item has semantic matching rule
- [ ] Document expected product types per catalogue item
- [ ] Create mapping: catalogueItemId -> expectedProductCriteria

**Verification:**
- All 23 leaf categories have semantic rules defined
- Rules cover: headphones, amps, dacs, cables, accessories categories
- Criteria include: positive keywords, negative keywords, required keywords

### DOD Layer 3 - Truth Table Generation

- [ ] Run semantic matching on all products against all categories
- [ ] Generate score matrix: product x category = match score
- [ ] Determine truth: which products SHOULD map to which categories
- [ ] Export truth table: `data/truth-table.json`

**Verification:**
- File: `data/truth-table.json` exists
- Format: `{ productId: { name, brand, truthMappings: [categoryId], score: number } }`
- Coverage: 100% of products have truth assignments

---

## Scope Contract 2: Delete Mix-Ups

### DOD Layer 1 - Mix-Up Detection

- [ ] Compare current mappings vs truth table
- [ ] Identify products with wrong catalogueLocationKeys
- [ ] Identify products that should have keys but don't
- [ ] Generate mix-up report: `data/mix-ups-report.json`

**Verification:**
- Report lists all incorrect assignments
- Each entry: productId, currentWrongKeys, correctKeys, reason
- Severity classified: critical (completely wrong), medium (should have more), low (should have fewer)

### DOD Layer 2 - Dry Run Cleanup

- [ ] Create correction script: `scripts/fix-catalogue-mappings.mjs`
- [ ] Implement dry-run mode (no actual changes)
- [ ] Script reads mix-ups report and simulates fixes
- [ ] Output preview of all changes

**Verification:**
- Script runs without errors
- Preview shows exactly which keys will be added/removed per product
- Sanity credentials not required for dry run

### DOD Layer 3 - Execute Cleanup

- [ ] Run correction script with `--execute` flag
- [ ] Apply all fixes to Sanity
- [ ] Log all changes with before/after state
- [ ] Export change log: `data/mapping-changes-log.json`

**Verification:**
- Script requires `SANITY_API_TOKEN`
- Changes applied successfully
- Log captures: productId, oldKeys, newKeys, timestamp
- Zero errors during execution

---

## Scope Contract 3: Validate Truth Table - No Mix-Ups

### DOD Layer 1 - Post-Cleanup Audit

- [ ] Re-fetch all products with catalogueLocationKeys
- [ ] Re-run semantic matching validation
- [ ] Compare new state vs truth table
- [ ] Generate validation report: `data/validation-report.json`

**Verification:**
- Report shows: total products, correctly mapped, still incorrect
- Match rate >= 95% (some edge cases acceptable)
- Zero critical mix-ups remain

### DOD Layer 2 - Automated Validation Script

- [ ] Create `scripts/validate-catalogue-mappings.mjs`
- [ ] Script checks: every assigned product passes semantic criteria
- [ ] Script checks: no product appears in semantically wrong category
- [ ] Script checks: all leaf categories have expected product counts

**Verification:**
- Script runs as standalone validation tool
- Exit code 0 = all validations pass
- Exit code 1 = validation failures with detailed output
- Can be run in CI/CD pipeline

### DOD Layer 3 - Regression Test Suite

- [ ] Create `tests/catalogue/mappings.validation.test.ts`
- [ ] Test: Sample products return correct catalogue keys
- [ ] Test: Sample catalogue items return correct product sets
- [ ] Test: No cross-contamination between unrelated categories

**Verification:**
- All tests pass
- Coverage: minimum 10 test cases covering all category types
- Tests use actual Sanity data (integration tests)

---

## Regression Risk Analysis & Mitigation

| Risk | Mitigation |
|------|------------|
| Accidental deletion of correct mappings | Dry-run mode mandatory before execution, full backup logged |
| Homepage product queries break | Homepage uses separate query patterns - verify no coupling |
| Basket/checkout product resolution fails | Product ID lookups unaffected - verify isolation |
| Build process breaks | build-catalogue-index.mjs runs independently - no dependencies on product mappings |

---

## Sequenced Execution Order

### PHASE 1: DISCOVERY (Est: 2 hours)
1. SC1-DOD1: Discovery - fetch current state
2. SC1-DOD2: Semantic rules review
3. SC1-DOD3: Truth table generation

### PHASE 2: CLEANUP (Est: 3 hours)
4. SC2-DOD1: Mix-up detection
5. SC2-DOD2: Dry run cleanup
6. SC2-DOD3: Execute cleanup (REQUIRES `SANITY_API_TOKEN`)

### PHASE 3: VALIDATION (Est: 2 hours)
7. SC3-DOD1: Post-cleanup audit
8. SC3-DOD2: Automated validation script
9. SC3-DOD3: Regression test suite

---

## Testing Strategy

### Unit Tests
- Semantic matching algorithm tests
- Truth table generation logic tests

### Integration Tests
- Sanity product fetch tests
- Catalogue key resolution tests
- Validation script tests

### Manual Verification
- Sample 5 products per category, verify semantic correctness
- Spot-check mix-ups report accuracy
- Review change log for unexpected modifications

---

## Deliverables

1. `data/truth-table.json` - Expected mappings
2. `data/mix-ups-report.json` - Issues found
3. `data/mapping-changes-log.json` - Changes applied
4. `data/validation-report.json` - Final validation
5. `scripts/fix-catalogue-mappings.mjs` - Correction script
6. `scripts/validate-catalogue-mappings.mjs` - Validation script
7. `tests/catalogue/mappings.validation.test.ts` - Test suite

---

## Completion Criteria

Sprint complete when:
- [ ] All DOD layers checked off
- [ ] Validation report shows >= 95% accuracy
- [ ] Zero critical mix-ups remain
- [ ] Automated validation script passes
- [ ] All regression tests pass
- [ ] Change log reviewed and approved

### Next Sprint Trigger
- Catalogue data mapping correctness achieved
- Ready for product discovery UI rebuild (future sprint)
