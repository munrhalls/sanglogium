# Pattern: Opus Audit-to-Sprint Pipeline

**Date:** 2026-04-01
**Source:** product-discovery-ui-audit.md → SPRINT_2026_04_01_PLP_DESIGN_ALIGNMENT.todo
**Severity:** High
**Frequency:** Every design audit that feeds into implementation

---

## The Problem

Traditional audits are diagnostic ("here are the issues") but not prescriptive. They require interpretation, clarification, and replanning before implementation can begin. This creates friction, ambiguity, and wasted cycles.

## Root Cause

Audits lack:
1. Traceable gap numbering (G1, G2...)
2. Exact before/after code states
3. Reference standard (canonical implementation)
4. Quantified ratings with targets
5. Direct SC (Scope Contract) derivation
6. Objective verification criteria

## The Solution: 8-Part Opus Audit Structure

### Part 1: Design System Summary
**Purpose:** Establish ground truth tokens and patterns

```markdown
## Part 1: Global Design System Summary

### Identity
- **Personality:** Dark luxury audiophile store
- **Font:** Montserrat (sans-serif)
- **Color palette:** brand-700 `#151B1B`, brand-200 `#FAEEE6`, accent-500 `#D4AF37`
- **Surface system:** surface.page, surface.card, surface.elevated
- **Border radii:** lg: 4px, md: 3px, sm: 2px

### Design System Component Tokens (from addComponents)
| Token | Purpose | Key Properties |
```

**Why this matters:** Prevents "improvement" drift — all changes anchored to existing system.

### Part 2: Research-Verified Best Practices
**Purpose:** Ground recommendations in authority, not opinion

```markdown
## Part 2: Research — PLP Best Practices (Verified Sources)

### Research Scope Contract
- **Topic:** E-commerce PLP design
- **Sources:** Baymard Institute 2025 PLP benchmark, Baymard 2026 Product Page UX

### Verified Best Practices
| # | Practice | Source | Consensus |
|---|----------|--------|-----------|
| 1 | Display applied filters in visible overview | Baymard (80% fail) | High |
| 2 | Provide 4 essential sort types | Baymard (69% don't) | High |
```

**Critical:** Each practice has consensus rating — no subjective recommendations.

### Part 3: Component-by-Component Audit
**Purpose:** Current state documentation with issue classification

```markdown
## Part 3: Component-by-Component Audit

### 3.1 Page Layout (page.tsx)

**Current implementation:**
```
container mx-auto px-4 pb-6 h-[calc(100vh-var(--desktop-header-h))]
  └─ flex gap-8 h-full overflow-hidden
       ├─ aside: hidden lg:block w-60 shrink-0 pt-6 h-full
       └─ main: flex-1 min-w-0 h-full overflow-y-auto
```

**Issues:**
- ✅ Sidebar/main split is correct pattern
- ⚠️ `h-[calc...)]` creates custom scroll container
- ⚠️ `px-4` too tight for luxury aesthetic
```

**Classification system:**
- ✅ Correct (don't touch)
- ⚠️ Warning (needs improvement)
- ❌ Critical (must fix)

### Part 4: Design Ratings (Quantified)
**Purpose:** Measurable assessment with targets

```markdown
## Part 4: Design Ratings

| # | Dimension | Rating | Evidence |
|---|-----------|--------|----------|
| 1 | Overall Design | 5/10 | Strong foundation undermined by inconsistencies |
| 2 | Visual Hierarchy | 5/10 | Correct structure but weakened by full-width CTA |
| 13 | Holistic | 5/10 | PLP feels like different design era than homepage |

### Aggregate Score: **5.3 / 10**
```

**Key:** Evidence cited per rating — no unexplained numbers.

### Part 5: Gap Analysis
**Purpose:** Traceable problem inventory (G1, G2, G3...)

```markdown
## Part 5: Gap Analysis

### Critical Gaps (Must Fix)
| # | Gap | Current State | Target State | Components |
|---|-----|--------------|--------------|------------|
| G1 | Card layout divergence | PLP: stacked CTA | Homepage: inline CTA | ProductCard.tsx |
| G2 | Missing mix-blend-multiply | White JPEG corners | Seamless blending | ProductImage.tsx |
| G3 | Debug console.log | `console.log('Loader URL:', url)` | Remove entirely | ProductImage.tsx |

### Major Gaps (Should Fix)
| G8 | Custom scroll container | `h-[calc(100vh)]` + overflow | Natural document scroll | page.tsx |
```

**Critical columns:**
- Gap number (G1) for traceability
- Current state (exact code/behavior)
- Target state (exact desired outcome)
- Components affected (file list)

### Part 6: Sequenced Change Specifications
**Purpose:** Direct implementation plan with gap coverage

```markdown
## Part 6: Sequenced Change Specifications

### SC1: ProductImage — Clean Up & Align
**Files:** ProductImage.tsx
**Gap Coverage:** G2, G3, G6, G11

**Current state:**
```tsx
// Debug log in production
console.log('Loader URL:', url);
// Arbitrary sizing
<div className="w-[85%] h-[85%]">
```

**Target state:**
```tsx
// No console.log
// Container uses full space
<div className="w-full h-full">
```

**Changes:**
1. Remove `console.log`
2. Change `w-[85%] h-[85%]` → `w-full h-full`
3. Add `mix-blend-multiply`
```

**Key elements:**
- SC number (SC1-SC10)
- Gap coverage mapping (G2, G3...)
- Exact file paths
- Before/after code blocks
- Change list (numbered steps)

### Part 7: Verification Checklist
**Purpose:** Objective pass/fail criteria

```markdown
## Part 7: Verification Checklist

- [ ] `npm run build` passes
- [ ] Desktop: 3-column grid with sidebar
- [ ] No `console.log` in production
- [ ] No off-system colors (search: `gray-`, `blue-`)
- [ ] Border radii consistent across chips, cards
```

**Characteristics:**
- Binary (pass/fail)
- Searchable commands where possible
- No subjective criteria

### Part 8: Expected Results
**Purpose:** Success metrics defined upfront

```markdown
## Part 8: Expected Post-Implementation Ratings

| Dimension | Current | Target | Delta |
|-----------|---------|--------|-------|
| Design | 5 | 9 | +4 |
| System Coherence | 4 | 9 | +5 |
| **Aggregate** | **5.3** | **8.9** | **+3.6** |
```

## Prevention Rule

**When generating audits with Opus, ALWAYS:**
1. Include Part 1 (Design System Summary) — anchor to tokens
2. Include Part 2 (Research) — ground in authority
3. Use ⚠️/❌/✅ classification in Part 3
4. Number all gaps G1, G2... in Part 5
5. Provide exact current/target states in gap table
6. Derive SCs directly from gaps with Gap Coverage mapping
7. End with verification checklist (objective criteria)
8. Set target ratings in Part 8

## Applicability

**When to apply:**
- Design system alignment audits
- UI remediation work
- Professional standard benchmarking
- Feature consistency reviews

**When NOT to apply:**
- Technical architecture audits (different structure)
- Performance audits (requires different format)
- Security audits (requires different framework)

## Integration with Sprint

```
Opus Audit (8 parts)
       ↓
Part 5: Gap Analysis (G1, G2...)
       ↓
Part 6: Sequenced Changes (SC1, SC2...)
       ↓
[compress] → Opus Sprint Spec
       ↓
Sprint Execution (Sonnet/Haiku)
       ↓
Part 7: Verification Checklist
```

## Related

- `_project/lessons/workflows/opus-sprint-specification-generation.md`
- `_project/lessons/patterns/functional-grouping.md`
