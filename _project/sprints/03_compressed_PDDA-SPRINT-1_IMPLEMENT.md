# Compressed Context: PDDA-SPRINT-1 (Complete)

> **Compression Date:** 2026-04-01
> **Sources:** audit-reports/PRODUCT_DISCOVERY_DATA_ARCHITECTURE_AUDIT.md, PDDA-SPRINT-1.todo
> **Compression Ratio:** 2400 raw → ~800 compressed = **3x reduction**
> **Status:** Ready for /implement consumption

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

## C:SCOPE-CONTRACTS — Compressed DoDs

### SC1: Pagination — Gap G-02 (CRITICAL)
**Target:** Bounded GROQ queries with cursor-based pagination
**Files:** `getProductsByVfsKeys.ts`, `page.tsx`, `ProductGridSkeleton.tsx`
**DoD:**
- P1: Add `MAX_PRODUCTS_LIMIT = 200`, define `GetProductsOptions` interface with `cursor`/`limit`
- P2: Update query with `[0...$limit]`, implement cursor logic, return `nextCursor`/`hasMore`
- P3: L1-4: Skeleton → Layout → Loading states → Load More button; Desktop + Mobile

### SC2: Sanity Typegen — Gap G-03 (CRITICAL)
**Target:** All types from generated `sanity.types.ts`
**Files:** `getProductsByVfsKeys.ts`, `sanity.types.ts`, `ProductCard.tsx`, `ProductGrid.tsx`
**DoD:**
- P1: Audit manual Product interfaces, map to Sanity types, identify null-check needs
- P2: Replace `Product` with `Pick<SanityProduct, ...>`, update brand field, add null checks
- P3: Type imports only, add `typegen` to pre-build, verify zero `any` types

### SC3: Dynamic Filters — Gap G-04 (HIGH)
**Target:** CMS-driven filter options, not hardcoded
**Files:** `FilterConfigProvider.tsx`, `page.tsx`, `getFiltersForCategoryPath.ts`, `FilterSidebar.tsx`
**DoD:**
- P1: Add `categoryKeys` prop to FilterConfigProvider, define filter query interface
- P2: Replace mockFilters with `getFiltersForCategoryPathAction(categoryKeys)`, dedupe/sort options
- P3: L1-4: Pass categoryKeys → Sidebar width → Loading state → Instant feedback; Desktop + Mobile

### SC4: Server-Side Sort — Gap G-05 (HIGH)
**Target:** GROQ `order()` instead of client sort
**Files:** `SortDropdown.tsx`, `CategoryPageClient.tsx`, `page.tsx`
**DoD:**
- P1: Update SortDropdown to `shallow: false`, remove client sort state
- P2: Confirm `getProductsByVfsKeys` accepts sort param, remove client sorting
- P3: L1-4: Structure → Loading position → Active state styling → Transition feedback; Desktop + Mobile

### SC5: Suspense Boundaries — Gap G-06 (HIGH)
**Target:** Streaming with Suspense, static shell renders immediately
**Files:** `page.tsx`, `ProductGridSkeleton.tsx`, `FilterSidebarSkeleton.tsx`, `ShopHeaderSkeleton.tsx`
**DoD:**
- P1: Create `ProductsSection`/`FilterSection` async components, define skeletons
- P2: Pass promises to components, wrap in `<Suspense>`, add `ShopHeaderSkeleton`
- P3: L1-4: Placeholder blocks → Match dimensions → `animate-pulse` → Static; Desktop + Mobile

### SC6: VFS Data Integrity — Gap G-09 (MEDIUM)
**Target:** Build validates all product keys point to valid VFS slots
**Files:** `build-catalogue-index.mjs`, `validate-product-keys.mjs` (new)
**DoD:**
- P1: Create `validateProductKeys()`, extract valid IDs from `slotMetadataMap`, define `OrphanedKey` interface
- P2: Query products for `catalogueLocationKeys`, check against valid IDs, generate console.table report
- P3: Add validation call to build, fail build on orphaned keys (configurable)

### SC7: Filter Architecture — Gap G-08 (MEDIUM)
**Target:** Server-only filtering, single source of truth
**Files:** `CategoryPageClient.tsx`, `getProductsByVfsKeys.ts`, `ActiveFilters.tsx`
**DoD:**
- P1: Document server-driven decision, update architecture notes, define URL filter params
- P2: Verify GROQ filter applies ALL filters, remove client filter logic, handle hydration
- P3: No UI changes (data layer only), filter application via page reload, Desktop + Mobile unchanged

### SC8: Brand Data Model — Gap G-01 (CRITICAL)
**Target:** Brand as reference document type
**Files:** `brandType.ts` (new), `productType.ts`, `sanity.config.ts`, `migrate-brands.mjs` (new), `getProductsByVfsKeys.ts`, `ProductCard.tsx`, `FilterSidebar.tsx`
**DoD:**
- P1: Create `brandType.ts` with `name`/`slug`/`logo`, update `productType.ts` brand to reference, add to config
- P2: Create migration script, extract brand strings, create brand documents, update products, validate references
- P3: L1-4: GROQ projections `brand->{...}` → Brand display layout → Logo rendering → Link hover states; Desktop + Mobile

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
| `getProductsByVfsKeys.ts` | CRITICAL | SC1, SC4, SC7, SC8 |
| `FilterConfigProvider.tsx` | HIGH | SC3, SC7 |
| `CategoryPageClient.tsx` | HIGH | SC4, SC7 |
| `productType.ts` | CRITICAL | SC8 |
| `sanity.types.ts` | HIGH | SC2 |

---

## /implement Trigger

```
Execute PDDA-SPRINT-1 implementation using compressed context above.

MANDATORY: Query _project/lessons/INDEX.md before each SC for relevant keywords.
Apply ALL Critical/High severity lessons as active constraints.

Execution Rules:
1. Follow EXACT sequence: SC2 → SC3 → SC4 → SC5 → SC6 → SC7 → SC1 → SC8
2. Use ONLY patterns listed in C:COMPONENTS
3. Address EVERY Gap ID in C:GAPS with 1:1 DoD mapping
4. Respect ALL boundaries in C:CONSTRAINTS
5. Pass 1→2→3 sequencing mandatory per scope contract
6. Layer 1→2→3→4 mandatory for Pass 3 where UI involved
7. Desktop (1280px) before Mobile (375px) per component
8. /test integration at each contract completion (100% pass required)
9. Build gate must pass before proceeding to next SC
10. Pre-sprint regression containment before SC1

Output: PDDA-SPRINT-1 execution with evidence dashboard per SC.
```

---

**Compressed Sprint Ready for /implement**  
**Total Scope:** 8 contracts, 45h estimated, B- → A- architecture target
