---
description: Systematically diagnose root causes of up to 5 bugs without fixing — outputs diagnostic report for sprint planning
---

# /diagnostic-sprint

**Input:** Human lists 1-5 bugs in chat (observed behavior, expected behavior)
**Output:** `_project/sprints/DIAGNOSTIC_[FEATURE]_[DATE].md` — root causes identified, risk matrix, fix sequencing
**Duration:** 1-3 hours
**Constraint:** Do NOT fix bugs. Only diagnose.

## Input Format (Human Provides)

```
/diagnostic-sprint

Feature: [e.g., PLP, PDP, Checkout]

Bugs:
1. [Observed behavior] → [Expected behavior]
2. [Observed behavior] → [Expected behavior]
3. ... (max 5)
```

## Execution Protocol

### Step 0: System-First Verification (10 minutes) — MANDATORY

**Before tracing any bug, verify global system contracts.** This prevents assumption-based diagnosis and eliminates cascading uncertainty.

#### 0.1 Design System Contract Check
Read and verify against `tailwind.config.ts`:
- [ ] Color tokens exist for observed UI gaps
- [ ] Typography scales match observed rendering issues
- [ ] Spacing values align with layout bugs
- [ ] **Rule:** If bug involves styling, design system is checked FIRST before component-level CSS

#### 0.2 Data Source & Fetching Pattern Check
For bugs involving data display, filtering, or API behavior:

**A. Sanity Schema Verification**
```markdown
Read schemaTypes for affected entities:
- [ ] `sanity/schemaTypes/productType.ts` — field types, references vs strings
- [ ] `sanity/schemaTypes/catalogueItemType.ts` — VFS structure
- [ ] Any custom filter/sort configuration types

**Critical:** Note every field's ACTUAL type:
- Reference fields: use `->` traversal in GROQ
- String/Number/Boolean: direct access
- Arrays: require `count() > 0` or `[@ in $array]` patterns
```

**B. Query-Schema Contract Validation**
For each GROQ query in the data path:
```markdown
| Query File | Line | Field Access | Schema Type | Valid? |
|------------|------|--------------|-------------|--------|
| getProductsByVfsKeys.ts | 56 | `brand->name` | string (not ref) | ❌ |
| getProductsByVfsKeys.ts | 60 | `overviewFields[@.title]` | array | ✓ |
```

**Rule:** Query field access MUST match schema type. When mismatch found, this is PRIMARY root cause.

#### 0.3 Global Configuration Check
- [ ] `next.config.ts` — image domains, rewrites affecting data fetching
- [ ] `sanity/lib/client.ts` — CDN settings, perspective mode
- [ ] `data/catalogue-index.json` — VFS integrity (if catalogue-related)

**Output:**
```markdown
## System-First Findings

| Check | Status | Finding | Risk Level |
|-------|--------|---------|------------|
| Design System | ✓/✗ | [Any token gaps] | Low/Med/High |
| Schema-Query Contract | ✓/✗ | [Any mismatches] | **CRITICAL** |
| VFS Data Integrity | ✓/✗ | [slotMetadataMap gaps] | **CRITICAL** |
```

---

### Step 1: Parse and Scope (5 minutes)

For each bug, extract:
- **Symptom:** What the user sees
- **Expected:** What should happen
- **Component area:** Which page/component is involved

**Output header:**
```markdown
# Diagnostic Sprint: [Feature]
> Date: [YYYY-MM-DD]
> Bugs diagnosed: [N]
> Status: [IN PROGRESS / COMPLETE]

## Bug Inventory

| ID | Symptom | Component | Severity |
|----|---------|-----------|----------|
| B-01 | [Observed] | [File/Area] | High/Med/Low |
| B-02 | [Observed] | [File/Area] | High/Med/Low |
```

### Step 2: Per-Bug Root Cause Analysis (20-30 min each)

For each bug B-XX:

#### 2.1 Trace the Code Path
1. Identify entry point (user action, render, API call)
2. Trace execution through components → hooks → utilities → API
3. **STOP at data fetching layer** — verify query against schema from Step 0.2
4. Identify data flow: where does data come from? Where does it go?

#### 2.2 Query-Schema Contract Verification (NEW — 5 minutes)

For bugs involving data fetching, filtering, or API responses:

**Extract the exact GROQ/SQL construction:**
```typescript
// From getProductsByVfsKeys.ts lines 52-62
const filterClause = filters.map(f => {
  const [field, value] = f.split(':');
  if (field === 'brand') {
    return `&& brand->name == "${value}"`;  // <-- Extract this
  }
  return `&& ${field} == "${value}"`;        // <-- And this
}).join(' ');
```

**Validate against schema from Step 0.2:**
```markdown
| Filter Field | Query Syntax | Schema Type | Match? | Issue |
|--------------|--------------|-------------|--------|-------|
| brand | `brand->name` | string | ❌ | Uses ref syntax on string |
| driverType | direct match | N/A (not in schema) | ❌ | Field doesn't exist |
```

**Critical Rule:**
- If schema shows `type: "string"` → query MUST use `brand == "value"` (no `->`)
- If schema shows `type: "reference"` → query CAN use `brand->name == "value"`
- If field not in schema → query will ALWAYS return 0 results

**Evidence Collection:**
- [ ] Console error: [observed / none]
- [ ] Network status: [200/404/500/not triggered]
- [ ] **Query response:** [empty array / null / malformed / correct]
- [ ] **Schema match:** [verified / mismatch found at line X]

#### 2.2 Identify the Break
```markdown
### B-XX: [Bug Name]

**Symptom:** [What user sees]
**Expected:** [What should happen]

**Code Path Traced:**
```
[Component] → [Hook] → [API/Utility] → [Data Source]
  ↓
[Error point identified]
```

**Root Cause:** [One sentence. The actual failure point]

**File:Line:** `[exact location]`

**Query-Schema Contract:**
- [ ] Verified: Query field access matches schema type
- [ ] **MISMATCH:** Query uses `[syntax]` but schema defines field as `[type]`

**Evidence:**
- [ ] Console error observed: [message or "none"]
- [ ] Network request status: [200/404/500/"not triggered"]
- [ ] State inspection: [observed value vs expected]

**Dependency Analysis:**
- Depends on: [Other bugs this relies on, or "none"]
- Blocks: [Other bugs waiting on this fix, or "none"]
```

#### 2.3 Distinguish Symptom vs. Root Cause
- **Symptom:** "Images don't show" (user-visible)
- **Root cause:** "Image URLs null from Sanity query" (actual bug)
- **Critical:** If B-03's root cause explains B-01's symptom, B-03 is PRIMARY, B-01 is SYMPTOM

### Step 3: Cross-Bug Analysis (15 minutes)

Identify relationships between bugs:

```markdown
## Cross-Bug Dependency Matrix

| Bug | Root Cause File | Is Primary? | Is Symptom Of | Blocks |
|-----|-----------------|-------------|---------------|--------|
| B-01 | `ProductImage.tsx:42` | No | B-03 | B-04 |
| B-02 | `useFilters.ts:17` | Yes | — | B-03 |
| B-03 | `getProducts.ts:89` | Yes | — | — |
```

**Rule:** If fixing one bug automatically fixes another, the dependent bug is a symptom.

### Step 4: Fix Sequencing (10 minutes)

Order bugs by:
1. **Dependencies first:** If B-01 depends on B-02, fix B-02 first
2. **Data flow upstream:** Fix data fetching before UI rendering
3. **Performance before features:** Fix lag before sorting

```markdown
## Recommended Fix Order

1. **B-03** — [Root cause summary] — PRIMARY
   - Fixes: B-01 (symptom)
   - Risk: Low

2. **B-02** — [Root cause summary] — PRIMARY
   - Unblocks: Filtering logic
   - Risk: Medium

3. **B-04** — [Root cause summary] — SECONDARY
   - Depends on: B-02
   - Risk: Low
```

### Step 5: Risk Assessment (10 minutes)

For each primary bug:

```markdown
## Risk Matrix: What Breaks If We Fix This?

| Bug | Fix Location | Files Touched | Regression Risk | Design System Impact |
|-----|--------------|---------------|-----------------|----------------------|
| B-03 | `getProducts.ts` | 3 | Medium | None |
| B-02 | `useFilters.ts` | 5 | High | State management pattern |
```

**Risk levels:**
- **Low:** Isolated utility, no shared components
- **Medium:** Shared hook/component, limited blast radius
- **High:** Core state management, design system tokens affected

### Step 6: Test Requirements (10 minutes)

What tests would have caught each bug?

```markdown
## Missing Test Coverage

| Bug | Test Type | Test Location | What It Checks |
|-----|-----------|---------------|----------------|
| B-03 | Unit | `getProducts.test.ts` | Sanity query returns images |
| B-02 | Integration | `filters.integration.test.ts` | Filter state updates <100ms |
```

**Constraint:** Suggest tests only. Do not write them yet.

### Step 7: Diagnostic Lock (5 minutes)

```markdown
## Diagnostic Lock — Sprint Readiness

- [ ] All bugs have File:Line root causes identified
- [ ] Primary vs. Symptom bugs distinguished
- [ ] Fix order determined by dependencies
- [ ] Risk matrix complete
- [ ] Test gaps identified

## Next Steps

1. **External Design Audit:** Use this diagnostic to scope external agent work
2. **Full Sprint:** Comprehensive fix with `/build` commands per Pass/Layer
3. **Regression Tests:** Write tests identified above before fixing

## Verdict

**DIAGNOSTIC COMPLETE**
- [N] primary bugs identified
- [M] symptom bugs mapped to primaries
- Fix order: [B-XX, B-YY, B-ZZ]
- Recommended: Proceed to external design audit + full sprint
```

## Constraint Rules (Enforced)

- **NO code changes** — Diagnose only, do not fix
- **NO "quick fixes"** — Even if obvious, document don't patch
- **YES File:Line precision** — Every root cause must have exact location
- **YES dependency mapping** — Which bug blocks which must be explicit
- **YES system-first** — Design system and schema-query contracts checked BEFORE per-bug tracing
- **MAX 5 bugs** — More than 5 requires multiple diagnostic sprints

## Anti-Patterns (Diagnostic Failures)

| Pattern | Failure | Prevention |
|---------|---------|------------|
| Component-first tracing | Missed schema-query mismatch | Always do Step 0.2 schema check first |
| Assumed schema | `brand->name` on string field | Read schemaTypes file explicitly |
| Surface-level data flow | Traced to API boundary, stopped | Continue through query construction |
| Build-passing = correct | Query syntax valid but semantically wrong | Add query-schema contract validation |

## Integration with Workflow

**Diagnostic Sprint feeds:**
1. `/audit` → External design audit uses diagnostic to scope design fixes
2. `/sprint` → Full sprint uses diagnostic for scope contract sequencing
3. `/build` → Per-bug fixes executed in diagnostic-determined order

**Reference chain:**
```
/diagnostic-sprint → identifies root causes
  ↓
/audit (external) → designs end-state
  ↓
/sprint → sequences comprehensive fix
  ↓
/build → executes per Pass/Layer
  ↓
/test → verifies fixes
```

## Example Invocation

```
/diagnostic-sprint

Feature: PLP (Product Listing Page)

Bugs:
1. Product images don't render on category page → Images should load from Sanity
2. Clicking filter checkbox takes 5-10 seconds to apply → Filter should apply <100ms
3. Filtering always returns 0 products → Should return matching products
4. Sorting dropdown doesn't change product order → Should sort products
5. PDP shows "something went wrong" with product slug URL → Should show product details
```

**Output:** `DIAGNOSTIC_PLP_2026-03-31.md` with:
- B-01: Image URLs null from `getProductsByVfsKeys.ts:89` — SYMPTOM of B-03
- B-02: `useFilters` hook re-renders entire grid — PRIMARY
- B-03: Sanity query returns empty `image.asset` — PRIMARY, fixes B-01
- B-04: Sort state not passed to query — PRIMARY
- B-05: PDP slug param mismatch with Sanity query — PRIMARY

**Fix order:** B-03 → B-01 (auto), B-04, B-02, B-05

---

## Version

Created: 2026-03-31
Pattern validated: PLP diagnostic (5 bugs → 3 primary root causes identified)
