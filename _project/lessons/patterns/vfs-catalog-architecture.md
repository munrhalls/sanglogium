# patterns: VFS Catalog Architecture

**Date:** 2026-03-31  
**Source:** VFS Audit Report - March 2026  
**Severity:** High  
**Frequency:** Systemic  
**Status:** Active

---

## The Pattern

**Virtual File System (VFS)** for catalogue navigation — pre-computed at build time for O(1) lookups.

**Core Principle:** Query the database recursively for category trees. Build once, query instantly.

## Architecture

```
┌─ VFS (Pre-computed at build) ──────────────┐
│  catalogue-index.json                       │
│  ├── tree (category hierarchy)              │
│  ├── slotMetadataMap (node metadata)        │
│  └── slugToIdMap (leaf lookups)             │
└────────────────────────────────────────────┘
                    ↓
┌─ Runtime ─────────────────────────────────┐
│  O(1) path lookup via prefix matching       │
│  No database recursion                      │
│  Moving slots updates ALL product locations │
└────────────────────────────────────────────┘
```

## Key Principles

**1. Build-Time Computation**
- Daily automatic rebuild (cron)
- All category relationships resolved upfront
- Never query database recursively at runtime

**2. O(1) Lookup Complexity**
- Path-based prefix matching
- Direct ID resolution from maps
- No tree traversal at request time

**3. Automatic Propagation**
- Moving catalogue slots updates ALL associated product locations
- Zero subsequent update work required
- Single source of truth

## Implementation Rules

**When building VFS:**
- Include ALL nodes in `slotMetadataMap` (not just leaves)
- Validate every referenced ID exists
- Test subtree queries with real data

**When consuming VFS:**
- Use `slugToIdMap` for leaf lookups
- Use `unrollDescendantKeys()` for subtree queries
- Always check `slotMetadataMap` completeness

## Critical Bug Pattern (VFS_DATA_INTEGRITY)

**Bug:** `slotMetadataMap` incomplete — missing intermediate header nodes

**Impact:** Subtree queries include invalid IDs that break GROQ

**Prevention:** Build validation must verify all `tree` node IDs exist in `slotMetadataMap`

## Applicability

**When to apply this lesson:**
- Designing hierarchical data systems
- Building category/catalog navigation
- Optimizing tree query performance
- Working with Sanity/headless CMS hierarchies

**Keywords for retrieval:**
- "vfs"
- "catalog"
- "hierarchy"
- "tree"
- "build-time"
- "o1"
- "lookup"
- "category"
- "navigation"

**Related lessons:**
- [groq-reference-syntax.md](../failures/groq-reference-syntax.md) — Query correctness
- [diagnostic-query-mismatch.md](../failures/diagnostic-query-mismatch.md) — Data verification

---

## Codification Log

**Integrated into:**
- [x] `_project/lessons/patterns/` — This file
- [x] INDEX.md — Keywords added
- [ ] Sanity schema — Document VFS principles

**Date integrated:** 2026-03-31
