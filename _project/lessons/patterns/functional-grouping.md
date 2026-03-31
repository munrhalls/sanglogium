# patterns: Functional Component Grouping

**Date:** 2026-03-31  
**Source:** SPRINT_2026_03_31_PLP_FIXES — Corrected Pattern Discussion  
**Severity:** High  
**Frequency:** Recurring (applies to all UI work)  
**Status:** Active

---

## The Problem

Initial approach: "Complete one component L1-L4 before starting next component" creates isolated islands with zero global coherence.

**Valid concern:** "You then have a bunch of completely unaligned, locally solved, isolated islands of crap to now cohere and fix..."

Pure isolation breaks system coherence. Pure waterfall (all components L1 skeletons first) creates late integration hell.

## The Pattern

**Complete components as functional groups**, not in isolation:

```
┌─ FILTER SYSTEM ─────────────────────────┐
│  FilterSidebar → SortDropdown → Active  │
│  L1-L4 together as unified system       │
│  Desktop + Mobile at each layer         │
│  → SHIPS as coherent unit               │
└─────────────────────────────────────────┘
              ↓
┌─ PRODUCT DISPLAY ─────────────────────┐
│  ProductCard → ProductGrid              │
│  L1-L4 together                         │
│  → SHIPS as coherent unit               │
└─────────────────────────────────────────┘
```

## Why This Works

**Within group:** Components share spacing, alignment, interaction patterns. Completing together ensures coherence.

**Between groups:** Each group is a **testable, shippable unit**. No isolated islands — you ship working filter system, then working product grid.

## Mental Model: User Flows

Think **user flows**, not components:

1. **"Filter & Sort Flow"** → All filter components L1-L4 together
2. **"Browse Products Flow"** → Grid + card L1-L4 together  
3. **"Product Detail Flow"** → Detail page components L1-L4 together

Each flow is a **vertical slice** through all layers. Complete slice, ship slice, next slice.

## Application Rules

**Good approach:**
- Identify functional group (e.g., "filter system")
- Complete entire group L1-L4
- Ship as coherent unit
- Move to next functional group

**Bad approaches:**
| Approach | Why It Fails |
|----------|--------------|
| Pure isolation | `FilterSidebar` L4 complete, `SortDropdown` not started. No shared state, no alignment. Islands. |
| Pure waterfall | All components L1 skeletons. No working unit. Late integration hell. |

## Applicability

**When to apply this lesson:**
- Frontend UI component development
- Multi-component feature work
- When components share state or visual alignment
- Pass 3 Build phase of any UI sprint

**Keywords for retrieval:**
- "component"
- "ui"
- "frontend"
- "layer"
- "pass-3"
- "functional-group"
- "isolation"
- "coherence"

**Related lessons:**
- [svg-import-assumption.md](../failures/svg-import-assumption.md) — Build tooling within functional groups

---

## Codification Log

**Integrated into:**
- [x] `_project/lessons/patterns/` — This file
- [x] INDEX.md — Keywords added
- [x] `_project/lessons/functional-grouping-pattern.md` — Original writeup

**Date integrated:** 2026-03-31
