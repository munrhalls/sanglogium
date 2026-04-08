# Research: /diagnostic-sprint Command Improvements

**Date:** 2026-03-31
**Topic:** Systematic debugging workflow robustness
**Target:** sang-logium codebase (Next.js + Sanity)
**Decay Risk:** Low (foundational debugging principles)

---

## Research Scope Contract

- **Topic:** Improving `/diagnostic-sprint` workflow to prevent assumption-based diagnosis failures
- **First Principles:**
  1. **Verification before assumption** — data must ground every claim
  2. **System-before-component** — global contracts eliminate cascading uncertainty
  3. **Schema-before-query** — data structure determines query correctness
- **Fundamentals:** GROQ query construction, Sanity schema validation, data flow tracing
- **Scope Boundary:** NOT fixing bugs, NOT writing tests — improving diagnostic protocol only
- **Target Audience:** AI agents executing diagnostic sprints on sang-logium codebase
- **Trigger Event:** PLP diagnostic sprint failure — caught VFS corruption but missed GROQ schema mismatch

---

## Source Triangulation

| Source | URL | Type | Credibility | Key Claim | Verification |
|--------|-----|------|-------------|-----------|--------------|
| RCA Guide (Selementrix) | selementrix.ch/blog | Methodology | High | "Collect comprehensive data before analysis" | ✅ Confirmed — PLP failure skipped data verification |
| Sanity Type Safety (Chin) | chintristan.io/blog | Implementation | High | "Zod schemas from TypeGen for runtime validation" | ⚠️ Applicable — could catch GROQ mismatches |
| TestDevLab RCA | testdevlab.com/blog | QA Process | Med | "Treat symptoms, not root cause = recurring bugs" | ✅ Confirmed — diagnostic stopped at symptom layer |
| Next-Sanity GitHub | sanity-io/next-sanity | Code Source | Canonical | `sanityFetch` behavior | ✅ Verified — no schema validation built-in |
| Bugasura RCA | bugasura.io/blog | Industry Stats | Med | "90% user churn from poor performance" | ⚠️ Context — justifies rigorous diagnosis |

---

## First Principles Analysis

### Core Problem Being Solved
Diagnostic sprints must **eliminate uncertainty in root cause identification** before any fix work begins. The failure mode is confident-but-wrong diagnosis due to assumption-based reasoning.

### Underlying Constraints
1. **GROQ is string-based** — no compile-time type checking for queries
2. **Schema can drift** — queries written for v1 schema fail silently on v2
3. **Sanity returns 200 OK** — even for semantically wrong queries (empty arrays)
4. **Component tracing is insufficient** — data flows through queries that must match schemas
5. **AI context windows are limited** — cannot hold entire codebase in working memory

### Inherent Tradeoffs
| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Component-first tracing | Fast to execute | Misses schema mismatches | Pure UI bugs (no data layer) |
| System-first verification | Catches contract violations | Slower (extra 10 min) | Any bug involving data fetching |
| Query-schema table | Precise mismatch identification | Manual effort required | Sanity/typed data sources |
| Automated schema validation | Zero manual errors | Requires infrastructure investment | Recurring diagnosis patterns |

### Failure Modes (Observed in PLP Case)
1. **Component-first fallacy:** Traced from Filters.tsx → getProductsByVfsKeys.ts, stopped at file boundary
2. **Assumed-schema fallacy:** Saw `brand->name` in query, assumed brand was reference type
3. **Build-passing fallacy:** Query syntax valid → assumed semantics valid
4. **Surface-tracing fallacy:** Followed imports, didn't read query construction logic
5. **Silent-failure fallacy:** Sanity returned 200 OK with empty results → looked for data layer issue, not query layer

---

## Code Fundamentals (sang-logium Specific)

### Fundamental: Schema-Query Contract
**Claim:** `brand->name` in GROQ requires `brand` to be a reference type in schema.

**Verification:**
- [x] Located in our codebase: `sanity/schemaTypes/productType.ts:35-38`
- [x] Schema shows: `type: "string"` (not reference)
- [x] Query uses: `brand->name` (reference syntax)
- [x] Result: Empty product array (silent failure)

**Actual Behavior:**
GROQ does NOT error on invalid reference traversal. `brand->name` on a string field returns `null`, filter clause fails, zero results returned. HTTP 200 OK masks semantic error.

**Edge Cases:**
1. Schema drift: Query written when brand WAS a reference
2. Copy-paste error: Reference pattern copied from other entity types
3. No runtime validation: Sanity client accepts any GROQ string

### Fundamental: VFS Data Consistency
**Claim:** `slotMetadataMap` must contain all node IDs referenced by `tree`.

**Verification:**
- [x] Located: `data/catalogue-index.json` (generated)
- [x] Bug: Header node IDs missing from `slotMetadataMap`
- [x] Impact: `unrollDescendantKeys()` returns non-existent IDs
- [x] Result: GROQ query with invalid keys returns 0 products

**Actual Behavior:**
Build script generated incomplete `slotMetadataMap`. Tree structure correct, metadata map incomplete. Products only have leaf keys in `catalogueLocationKeys`, query includes invalid parent keys.

---

## Real vs. Illusory Improvements

### REAL Improvements (High Impact, Verified Need)

#### 1. System-First Verification Step (ADDED)
**Status:** ✅ Implemented in workflow update
**Impact:** HIGH — prevents entire class of assumption-based failures
**Evidence:** PLP failure would have been caught at Step 0.2
**Implementation:**
- Design system check (tailwind.config.ts) first for UI bugs
- Schema verification BEFORE tracing any code paths
- Query-schema contract table for ALL data bugs

#### 2. Query-Schema Contract Validation Table (ADDED)
**Status:** ✅ Implemented in workflow update
**Impact:** HIGH — forces explicit schema verification
**Evidence:** Would have caught `brand->name` on string field in 30 seconds
**Implementation:**
```markdown
| Query File | Line | Field Access | Schema Type | Valid? |
|------------|------|--------------|-------------|--------|
| getProductsByVfsKeys.ts | 56 | `brand->name` | string | ❌ |
```

#### 3. STOP at Data Fetching Layer Rule (ADDED)
**Status:** ✅ Implemented in workflow update
**Impact:** MEDIUM — prevents surface-level tracing
**Evidence:** Diagnostic traced to `getProductsByVfsKeys.ts` boundary, stopped
**Implementation:** Added to Step 2.1: "STOP at data fetching layer — verify query against schema from Step 0.2"

#### 4. Schema Match Checkboxes in Evidence (ADDED)
**Status:** ✅ Implemented in workflow update
**Impact:** MEDIUM — forces explicit verification documentation
**Evidence:** No verification checkbox = easy to skip schema check
**Implementation:**
```markdown
**Query-Schema Contract:**
- [ ] Verified: Query field access matches schema type
- [ ] **MISMATCH:** Query uses `[syntax]` but schema defines field as `[type]`
```

### ILLUSORY Improvements (Low Impact, False Confidence)

#### ❌ More Verbose Logging in Components
**Why Illusory:** Adds noise without solving root problem (schema mismatch)
**Alternative:** Schema validation at query layer
**Risk:** False sense of thoroughness

#### ❌ Automated Stack Trace Analysis
**Why Illusory:** PLP bug had no stack trace (silent GROQ failure)
**Alternative:** Query result inspection + schema validation
**Risk:** Misses semantic errors entirely

#### ❌ Extended Evidence Collection (More Checkboxes)
**Why Illusory:** Quantity ≠ Quality. More checkboxes without schema verification = more work, same failures
**Alternative:** Focused schema-query contract validation
**Risk:** Checkbox fatigue, ritualistic compliance

#### ❌ "Common Bug Patterns" Reference List
**Why Illusory:** Every bug is context-specific. Reference lists create confirmation bias
**Alternative:** Systematic verification protocol
**Risk:** Pattern-matching instead of investigation

---

## Best Practices (Verified for sang-logium)

### Practice: Schema-First Diagnosis for Data Bugs
**Consensus:** HIGH — Appears in all authoritative sources
**Supporting Evidence:**
- RCA best practices: "Collect comprehensive data first"
- Sanity type safety guide: Schema → Types → Validation
- PLP failure: Schema mismatch was PRIMARY root cause

**Counter-Evidence (Falsification Attempts):**
- Could schema checks slow down diagnosis? Yes, but 10 min upfront saves 30+ min of wrong diagnosis

**Verdict:** ✅ **STRONGLY RECOMMENDED** — Added as mandatory Step 0

### Practice: Query-Schema Contract Table
**Consensus:** MEDIUM — Pattern from type safety guides
**Supporting Evidence:**
- Type safety requires explicit mapping
- PLP case: Table would have exposed mismatch immediately
- Sanity `groqd` library uses exactly this pattern

**Counter-Evidence:**
- Manual effort required — could be automated
- Requires reading both query and schema files

**Verdict:** ⚠️ **RECOMMENDED** — Manual table for now, automation candidate

### Practice: STOP Rule at Data Boundaries
**Consensus:** HIGH — Standard debugging methodology
**Supporting Evidence:**
- RCA guides: "Follow systematic troubleshooting steps"
- Component archaeology principle (from user rules)

**Verdict:** ✅ **RECOMMENDED** — Added to Step 2.1

---

## sang-logium Specific Recommendations

### Immediate: Keep Updated Workflow (Already Done)
The `/diagnostic-sprint.md` update addresses all 4 REAL improvements. No further changes needed to workflow file.

### Medium-Term: Schema-Query Automation
Consider adding `ts-to-zod` or `groqd` to codebase for automated validation:
```bash
npm i -D ts-to-zod groqd
```
This would catch GROQ mismatches at type-check time, not diagnosis time.

### Long-Term: VFS Validation Test
Add test that verifies `slotMetadataMap` completeness:
```typescript
// tests/catalogue/vfs-validation.test.ts
test('all tree node IDs exist in slotMetadataMap', () => {
  const allIds = extractAllIdsFromTree(catalogue.tree);
  allIds.forEach(id => {
    expect(catalogue.slotMetadataMap[id]).toBeDefined();
  });
});
```

---

## Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| Component-first tracing misses schema bugs | PLP diagnostic failure | Case study analysis |
| `brand->name` on string returns 0 results | Schema inspection | Code reading |
| GROQ syntax valid ≠ semantics valid | Sanity behavior observed | Runtime test |
| System-first verification catches contract violations | Workflow update applied | Logical analysis |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| Schema checks are always necessary | Pure UI bugs don't need schema | MODIFIED — Step 0 is conditional on data bugs |
| Query-schema table is sufficient | Could still miss runtime issues | SURVIVED — Table + evidence collection together |
| More verbose logging helps | Adds noise, doesn't solve root | ABANDONED — Not recommended |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| GROQ behavior | Low | 2027-03-31 ( Sanity stable) |
| Schema validation tools | Med | 2026-06-30 ( ecosystem evolving) |
| Workflow patterns | Low | 2027-03-31 ( foundational) |

---

## Synthesis: Actionable Takeaways

### For /diagnostic-sprint Command
| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| **KEEP** System-First Step 0 | Prevents assumption-based diagnosis | Already in workflow |
| **KEEP** Query-Schema Table | Forces explicit contract verification | Already in workflow |
| **KEEP** STOP at Data Layer | Prevents surface-level tracing | Already in workflow |
| **REJECT** Verbose Logging | Illusory improvement, adds noise | Not added |
| **REJECT** Bug Pattern Lists | Creates confirmation bias | Not added |

### Immediate Actions
1. ✅ **DONE** — Updated `/diagnostic-sprint.md` with all real improvements
2. **CONSIDER** — Add `groqd` or `ts-to-zod` for automated validation (medium-term)
3. **CONSIDER** — Add VFS completeness test (long-term)

### Open Questions
- Should we add automated GROQ validation to CI? (Requires infrastructure)
- Is 10-minute System-First step too long for simple bugs? (Monitor and adjust)
- Should schema files be cached/read once per diagnostic? (Optimization)

---

## Verdict

**Research Complete**

**Real Improvements Identified:** 4 (all implemented)
**Illusory Improvements Rejected:** 4 (documented why)
**Recommended Next Step:** Use updated workflow on next diagnostic sprint, observe if failures decrease

**Confidence Level:** HIGH — Based on actual failure analysis (PLP case), verified against multiple sources, with clear falsification criteria.

---

## Version

Created: 2026-03-31
Pattern Validated: PLP diagnostic failure → workflow update
Research Method: Case study analysis + multi-source triangulation
