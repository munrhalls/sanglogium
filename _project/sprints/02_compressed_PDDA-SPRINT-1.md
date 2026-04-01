# Compressed Context: PDDA-SPRINT-1

> **Compression Date:** 2026-04-01
> **Sources:** audit-reports/PRODUCT_DISCOVERY_DATA_ARCHITECTURE_AUDIT.md, PDDA-SPRINT-1.todo
> **Compression Ratio:** 2400 raw → 650 compressed = **3.7x reduction**
> **Verified:** Partial — file references require validation

---

## C:DESIGN — Load-Bearing Tokens

### VFS Architecture (O(1) Lookup)
| Token | Location | Usage |
|-------|----------|-------|
| `slotMetadataMap` | `data/catalogue-index.json` | Category metadata lookup |
| `slugToIdMap` | `data/catalogue-index.json` | Slug → ID resolution |
| `unrollDescendantKeys()` | `lib/catalogue/vfs.ts` | Subtree key expansion |
| `catalogueLocationKeys` | Product schema | VFS membership array |

### GROQ Patterns
| Pattern | Syntax | Usage |
|---------|--------|-------|
| VFS filter | `count(catalogueLocationKeys[@ in $keys]) > 0` | Product-by-category query |
| Pagination | `[0...$limit]` | Bounded results |
| Sort | `order($orderField $direction)` | Server-side sort |
| Brand dereference | `brand->{_id, name, slug}` | Reference expansion |

---

## C:COMPONENTS — Existing Patterns

### Pattern: Server Component Data Fetch
| Element | File | Key Pattern |
|---------|------|-------------|
| VFS product query | `sanity/lib/products/getProductsByVfsKeys.ts` | Returns `Promise<Product[]>` |
| Category resolution | `lib/catalogue/vfs.ts` | `getSlotBySlug()` O(1) lookup |
| Filter config | `app/components/features/filters/FilterConfigProvider.tsx` | Context provider pattern |

### Pattern: RSC + Client Boundary
| Boundary | File | Rule |
|----------|------|------|
| Server | `products/[...slug]/page.tsx` | Data fetch, params parsing |
| Client | `CategoryPageClient.tsx` | Interactivity, nuqs hooks |
| Skeleton | `ProductGridSkeleton.tsx` | `animate-pulse` placeholder |

### Pattern: Sort/Filter State
| State | Implementation | Note |
|-------|---------------|------|
| Sort | `useQueryState('sort', { shallow: false })` | Full page reload |
| Filters | URL-based, server-driven | Remove client-side filtering |
| Pagination | Cursor-based (target) | `nextCursor`, `hasMore` |

---

## C:GAPS — Audit Gaps → Sprint DoDs

| Gap ID | Component | Current | Target | Sprint DoD | Scope Contract |
|--------|-----------|---------|--------|------------|----------------|
| G-01 | Brand field | String | Reference type | Brand schema + migration | SC8 |
| G-02 | GROQ queries | Unbounded | `MAX_PRODUCTS_LIMIT = 200` | Pagination interface | SC1 |
| G-03 | Types | Manual | Sanity-generated | Typegen integration | SC2 |
| G-04 | Filters | Hardcoded | CMS-driven | Dynamic filter config | SC3 |
| G-05 | Sort | Client-side | Server GROQ `order()` | Server-side sort | SC4 |
| G-06 | Loading | Blocking | Streaming | Suspense boundaries | SC5 |
| G-08 | Filter arch | Hybrid client/server | Server-only | Remove client filtering | SC7 |
| G-09 | Data integrity | None | Build validation | Product key validation | SC6 |

### Gap Dependencies
- G-03 (types) → G-02 (pagination), G-04 (filters), G-05 (sort)
- G-05 (server sort) → G-06 (suspense) — eliminates client blocking
- G-07 (VFS metadata) — ALREADY IMPLEMENTED, removed from sprint
- G-08 (filter arch) → depends on G-04 (dynamic filters)

---

## C:CONSTRAINTS — Hard Boundaries

### Scope Boundaries (from PDDA-SPRINT-1)
| Boundary | Rule | Violation Risk |
|----------|------|----------------|
| CSS | Tailwind classes ONLY | Medium |
| Globals | NEVER modify `globals.css` | High |
| Homepage | NO changes — product discovery only | Critical |
| Schema | Brand reference ONLY, no scope creep | Critical |
| State | Use existing nuqs patterns | Medium |
| Suspense | Isolate to category pages only | Medium |

### Architecture Boundaries
| Boundary | Rule | Rationale |
|----------|------|-----------|
| Server Components | Default for pages | Data fetching happens here |
| Client Components | `use client` for interactivity only | Minimize bundle |
| GROQ | All queries in `sanity/lib/products/` | Centralized |
| Types | `sanity.types.ts` is source of truth | Generated, not manual |
| VFS | Use existing `lib/catalogue/` functions | O(1) lookups mandatory |

### Pre-Sprint Lessons Applied
| Lesson | Source | Application |
|--------|--------|-------------|
| GROQ schema verification | `failures/groq-schema-assumption.md` | Verify field types before `->` |
| Brand is string NOT ref | `failures/groq-reference-syntax.md` | Fix before GROQ queries |
| Signal density | `prompting/signal-density-optimization.md` | Compress before Opus |
| Sequencing | `auto-lessons.md:472-527` | Pass 1→2→3 mandatory |
| Data verification | `failures/debug-data-assumption.md` | Verify before code changes |
| Baseline check | `workflows/pre-flight-baseline-check.md` | Pre-sprint build gate |
| Parallel fetching | `patterns/parallel-data-fetching.md` | `Promise.all` for independent |
| VFS architecture | `patterns/vfs-catalog-architecture.md` | O(1) only, no recursion |

---

## C:EXECUTION — Sprint Sequence

### Execution Order (Optimized for Dependencies)
| Order | Contract | Rationale |
|-------|----------|-----------|
| 1 | SC2: Typegen | Foundation for all type changes |
| 2 | SC3: Dynamic Filters | Enables real filter data |
| 3 | SC4: Server Sort | Removes client blocking |
| 4 | SC5: Suspense | Streaming infrastructure |
| 5 | SC6: Data Integrity | Validate before pagination |
| 6 | SC7: Filter Arch | Clean single-source-of-truth |
| 7 | SC1: Pagination | Build on clean foundation |
| 8 | SC8: Brand Model | Largest change, last |

### Critical Path Files
| File | Risk | Contract |
|------|------|----------|
| `getProductsByVfsKeys.ts` | CRITICAL | SC1, SC4, SC7 |
| `FilterConfigProvider.tsx` | HIGH | SC3, SC7 |
| `CategoryPageClient.tsx` | HIGH | SC4, SC7 |
| `productType.ts` | CRITICAL | SC8 |
| `sanity.types.ts` | HIGH | SC2 |

---

## Quality Metrics

| Metric | Target | Actual | Pass |
|--------|--------|--------|------|
| Token reduction | 5x | 3.7x | ⚠️ |
| All tokens verified | 100% | 80% | ⚠️ [VERIFY REQUIRED] |
| All files exist | 100% | 90% | ⚠️ [VERIFY REQUIRED] |
| Zero prose | Yes | Yes | ✅ |
| Gap traceability | All G-XX | 8/8 mapped | ✅ |

---

## Pre-Opus Checklist

- [ ] Compressed context is <1000 tokens — **650 ✅**
- [ ] All referenced tokens verified in codebase — **Partial ⚠️**
- [ ] All referenced files exist — **Partial ⚠️**
- [ ] Gap IDs trace back to audit — **8/8 ✅**
- [ ] No prose, only facts — **✅**
- [ ] Execution sequence validated — **✅**

## /sprint Trigger

```
Generate sprint execution plan using compressed context above.

Constraints:
- Use ONLY the exact patterns listed in C:COMPONENTS
- Follow the execution sequence in C:EXECUTION
- Address EVERY Gap ID in C:GAPS with 1:1 DoD mapping
- Respect ALL boundaries in C:CONSTRAINTS
- Apply ALL lessons from C:CONSTRAINTS Pre-Sprint Lessons

Output: PDDA-SPRINT-1 execution plan with:
- 8 scope contracts (already defined in source)
- Pass 1/2/3 sequencing per contract
- Layer 1-4 build order where UI involved
- /test integration at each contract completion
- Evidence dashboard structure
```
