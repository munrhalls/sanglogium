# Workflow: Opus-Powered Sprint Specification Generation

**Date:** 2026-04-01
**Source:** SPRINT_2026_04_01_PLP_DESIGN_ALIGNMENT
**Severity:** High
**Frequency:** Every sprint that requires >3 components

---

## The Problem

Non-Opus sprint specifications result in:
- Ambiguity requiring 2-3 clarification rounds
- Scope drift during implementation
- Missing verification criteria
- Backtracking from wrong approaches
- Executor model asking "which file?" repeatedly

## Root Cause

Sprint specifications lack the **constraint-first, layer-sequenced, gap-mapped** structure that Opus generates naturally when given compressed, high-signal input.

## The Solution: Opus Sprint Quality Factors

### 1. Compressed Input Protocol
**Critical:** Feed Opus load-bearing facts only (~1000 tokens max)

**DO:**
- Provide audit gap table (G1, G2, G3 with file paths)
- List existing component patterns to match
- State scope lock rules explicitly
- Include ONE reference implementation example

**DON'T:**
- Dump full audit prose (5000+ tokens)
- Provide multiple conflicting examples
- Leave scope boundaries undefined

### 2. Gap Coverage Mapping
Every Scope Contract (SC) MUST explicitly reference audit gaps:

```markdown
## SC3: ProductCard — G5, G7, G11
- G5: Card elevation/depth missing
- G7: Typography inconsistent  
- G11: Hover feedback absent
```

This creates traceability: **Audit finding → Spec → Implementation → Verification**

### 3. Line-Number Precision
Opus specs include exact locations:

```
File: app/components/features/products/ProductCard.tsx
Lines 27-37: Figure (image container)
Lines 40-61: Content area
```

**Why this matters:** Executor model (Sonnet/Haiku) can verify location without exploration.

### 4. Constraint-First Architecture
List what NOT to touch BEFORE what to change:

```markdown
## Scope Lock Rules
- ❌ NO globals.css changes
- ❌ NO homepage component changes
- ❌ NO data structure / GROQ changes
- ❌ NO bare `lg:` breakpoint classes
```

This prevents executor drift before it starts.

### 5. Anti-Patterns Section
Explicitly state dangerous defaults:

```markdown
## Anti-Patterns to Avoid
- DON'T use prose-heavy specs (wastes tokens)
- DON'T skip regression containment
- DON'T modify sprint spec mid-execution
- NO DoD without /test invocation
```

### 6. Layer-Based Sequencing (Four Layers)
```markdown
## Pass 1: Skeleton
- Semantic HTML structure
- Debug borders (optional)

## Pass 2: Data
- Real data integration
- Props interface verification

## Pass 3: Build
- Layer 1: Structure (display, position)
- Layer 2: Layout (flex, grid, spacing)
- Layer 3: Surface (colors, borders, radius)
- Layer 4: Interaction (hover, transitions)
```

### 7. Functional Grouping
Group contracts by system function, not alphabetically:

```markdown
Group A — Page Layout (Foundation):
  SC1: Page Layout — Natural Scroll & Spacing

Group B — Product Display (Core UX):
  SC2: ProductImage — Clean Up & Blend
  SC3: ProductCard — Align with Homepage Pattern
  SC4: ProductGrid — Column Count & Spacing

Group C — Filter & Controls:
  SC5-8: Filter system components

Group D — Polish:
  SC9-10: Skeletons, semantic fixes
```

### 8. Verifiable DoDs
Every contract MUST have objective pass/fail criteria:

```markdown
### DoD
- [ ] Page uses natural document scroll (not inner scroll)
- [ ] Breadcrumbs visible at top of scroll
- [ ] `npm run build` passes

Verification:
```bash
npm run build
```
```

**Critical:** Build gate embedded in every SC, not just at end.

## Prevention Rule

**When generating sprint specs, ALWAYS:**
1. Compress input to <1000 tokens of load-bearing facts
2. Include Gap Coverage mapping per SC
3. List Scope Lock Rules FIRST (negative constraints)
4. Specify exact file paths and line numbers
5. Include Anti-Patterns section
6. Use Four Layers sequencing (Structure→Layout→Surface→Interaction)
7. Group by function, not alphabetically
8. Make every DoD objectively verifiable

## Applicability

**When to apply:**
- Any multi-component UI sprint (>2 components)
- Design system alignment work
- Audit remediation sprints
- Feature work requiring consistency across components

**When NOT to apply:**
- Single-file bug fixes
- Documentation-only changes
- Experimental/spike work

## Quality Verification Checklist

Before finalizing any sprint spec, verify:

- [ ] Gap Coverage mapping exists for every SC
- [ ] File paths are absolute, not relative
- [ ] Line numbers specified (or range markers)
- [ ] Scope Lock Rules section exists
- [ ] Anti-Patterns section exists
- [ ] Four Layers sequencing specified
- [ ] Every DoD has explicit verification command
- [ ] Build gate per SC, not just final

## Related

- `_project/lessons/patterns/functional-grouping.md`
- `_project/lessons/workflows/pre-flight-baseline-check.md`
- `_project/lessons/failures/tailwind-breakpoint-shadowing.md`
