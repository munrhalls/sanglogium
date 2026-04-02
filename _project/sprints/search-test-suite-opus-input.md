# COMPRESSED: Search Test Suite Sprint — Opus Input

## Ground Factor: Fix 5/10 → 8/10 Professional Rating

---

### LOAD-BEARING FACTS (Verified)

**Current State (5/10 rating):**
- Report: `_project/research/search-ui-test-suite-report.md`
- Self-critique: `_project/audits/search-test-suite-self-critique.md`
- Test count: 16 tests across 4 files
- **BLOCKER:** Test 4.2 uses `[data-testid="price"]` — selector DOES NOT EXIST in `ProductCard.tsx:45`
- **FIXED:** Added `data-testid="product-price"` to line 45 (verified in last edit)

**Code Locations (Verified):**
- `SearchField.tsx:14-316` — search with autocomplete, 300ms debounce, mobile/desktop dual mode
- `AutocompleteOverlay.tsx:36-86` — role="listbox", skeleton loading, empty state
- `search/page.tsx:11-26` — Server Component with Suspense, URL params `?q=` and `?sort=`
- `ProductCard.tsx:45` — NOW HAS `data-testid="product-price"` ✅
- `searchProducts.ts:26-82` — GROQ queries for autocomplete and full search

**Missing Critical Tests (7 gaps from self-critique):**
1. Search → PDP navigation (primary conversion path)
2. Query persistence on page refresh
3. Empty state → category recovery
4. Cross-page search (from PDP/PLP, not just home)
5. Accessibility scan (axe-core for WCAG 2.1 AA)
6. API error handling (graceful degradation)
7. URL param modification on results page

**Over-engineered:** Test 1.4 (race condition) — 20 lines complex routing, timing-dependent = flaky

---

### GAP COVERAGE MAPPING (G-SXX)

| ID | Gap | Severity | Target Test |
|----|-----|----------|-------------|
| G-S01 | Test 4.2 selector broken | Critical | Use `data-testid="product-price"` |
| G-S02 | No search→PDP test | Critical | Add navigation verification |
| G-S03 | No query persistence | High | Add refresh test |
| G-S04 | No empty state recovery | High | Add recovery flow |
| G-S05 | No cross-page search | High | Add PDP origin test |
| G-S06 | No a11y scan | High | Add axe-core test |
| G-S07 | No API error test | Medium | Add abort/fail test |
| G-S08 | Race condition over-engineered | Medium | Simplify/remove |

---

### PROFESSIONAL AUDIT FORMAT REQUIREMENTS

**Must Include (from PLP audit standard):**
1. Gap ID system (G-S01, G-S02...)
2. Severity matrix (Critical/High/Medium/Low)
3. Data-testid verification table
4. Spatial architecture (component hierarchy)
5. Exact verification commands (copy-paste ready)
6. RWD strategy table
7. Files at risk + mitigations

**Scope Lock (NO TOUCH):**
- NO SearchField.tsx changes (selectors already exist, verified)
- NO search functionality changes
- NO homepage/PLP/PDP changes
- This sprint = SPEC DOCUMENTATION ONLY

---

### FINAL TEST SUITE STRUCTURE (23 tests)

```
tests/e2e/search/
├── search-field.spec.ts          # 4 tests (was 5, removed race condition)
├── search-mobile.spec.ts         # 4 tests (was 3, +keyboard dismiss)
├── search-keyboard.spec.ts       # 4 tests (was 4, +a11y scan)
├── search-results.spec.ts          # 5 tests (was 4, +URL persistence)
├── search-errors.spec.ts           # NEW 3 tests (API error states)
└── search-cross-page.spec.ts       # NEW 3 tests (search from PDP/PLP)
```

---

### VERIFICATION COMMANDS

```bash
# Pre-sprint
npm run build  # MUST PASS

# Post-sprint verification
npm run build
# Expect: Zero errors, same build output as baseline
```

---

### CONSTRAINTS (From User Rules)

- Signal density: Max 1000 tokens for Opus input
- No prose, no explanation — only verified facts
- File paths must exist (verified in codebase)
- Test names must be component classes from addComponents

**Opus Task:** Generate professional sprint spec with gap IDs, severity matrix, selector audit, spatial mapping, and 23 test specifications.
