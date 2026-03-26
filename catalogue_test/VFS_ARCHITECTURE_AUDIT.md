# VFS Architecture Audit

**Auditor:** Antigravity Deterministic Execution Engine
**Date:** 2026-03-26
**Scope:** Sanity CMS Virtual File System — Full Stack

---

## 1. Executive Summary

The VFS concept is architecturally sound: a JSON manifest (`data/catalogue-index.json`) decouples logical navigation from physical product storage. Products store flat `catalogueLocationKeys[]` arrays. The manifest provides O(1) slug-to-ID and ID-to-metadata lookups. A build script (`scripts/build-catalogue-index.mjs`) generates the manifest from Sanity at build time.

**However, the implementation is critically incomplete.** The VFS manifest exists and is well-structured, but the application **does not use it for product queries**. The live product-fetching path (`sanity/lib/products/getSelectedProducts.ts`) uses legacy `categoryPath` string matching — the exact anti-pattern the VFS was designed to eliminate. The VFS-aware code path exists only as commented-out prototype code in `app/(store)/products/[...category]/page.tsx` (lines 150-288). No key-unrolling utility function exists anywhere in the codebase.

### Health Verdict

| System Layer | Status | Severity |
|---|---|---|
| VFS Manifest (`catalogue-index.json`) | Healthy — correctly generated | — |
| Build Script (`build-catalogue-index.mjs`) | Functional, minor issues | Low |
| Semantics (naming conventions) | Ambiguous names in manifest | Medium |
| Frontend Catalogue UI | Functional but phantom type import | Medium |
| Click Resolution (GROQ Queries) | **Uses string-path matching, not VFS** | **Critical** |
| Key Unrolling Logic | **Does not exist** | **Critical** |
| Type Safety (`data` module) | **Module is missing from filesystem** | **Critical** |
| Test Suite | **No VFS-specific tests exist** | High |

### Mathematical Reality of Data Contracts

The codebase currently operates two **incompatible** product-location systems simultaneously:

1. **Legacy System (LIVE):** Products have a `categoryPath` field (string). Queries use `categoryPath match "headphones/*"` — O(n) substring scanning.
2. **VFS System (DORMANT):** Products have a `catalogueLocationKeys` field (string[]). Queries should use `count(catalogueLocationKeys[@ in $unrolledKeys]) > 0` — O(1) array intersection.

The `productType.ts` schema defines **both** `catalogueLocationKeys` (line 102-110) and implicitly relies on `categoryPath` through query code. The VFS is fully designed but zero percent integrated into the live product resolution pipeline.

---

## 2. Semantics Audit

### 2.1 Manifest Field Names

| Current Name | Problem | Recommended Name | Rationale |
|---|---|---|---|
| `urlMap` | Ambiguous — a "URL map" could map URLs to anything. | `slugToIdMap` | Precisely communicates: input is a URL slug, output is a VFS node ID. |
| `idMap` | Dangerously vague — could be any map keyed by ID. | `slotMetadataMap` | Communicates that each ID maps to a catalogue slot's metadata (title, breadcrumbs, children, type). |
| `tree` | Acceptable but generic. | `tree` | Acceptable — universally understood. No change needed. |

### 2.2 Build Script Variable Names

The build script (`build-catalogue-index.mjs`) uses the same `urlMap`/`idMap` names internally. These must be renamed in lockstep with the output JSON.

### 2.3 Consumer Code (`data/catalogue.ts`)

| Current | Recommended |
|---|---|
| `getCatalogueIdByUrl(url)` | `resolveSlugToId(slug)` — the parameter is actually a slug, not a full URL. |

### 2.4 Sanity Schema Naming

| Item | Status |
|---|---|
| `catalogueItem` schema type name | Clear and correct. |
| `catalogueLocationKeys` product field | Correctly describes the VFS linkage. |
| `categoryPath` product field | Legacy field. Must be deprecated when VFS goes live. |

### 2.5 Frontend Type: `CatalogueItem`

The frontend UI components use a `CatalogueItem` type imported from `./data` or `../data`. This is the **UI rendering type** — it describes what the catalogue dropdown needs (id, label, imageUrl, sections, features). This is a different concept from `catalogueItem` (the Sanity schema object type). The naming collision is manageable but worth noting.

**Critical Issue:** The `data` module does not exist on the filesystem. Six files import from it. This implies either:
- It was deleted during refactoring and the app is currently broken, OR
- TypeScript resolves it through a mechanism not visible (e.g., ambient declaration, build artifact). Given no `.d.ts` files or path aliases match this path, this is most likely a **build-breaking phantom import**.

---

## 3. Folder and File Structure Audit

### 3.1 Current Layout

```
app/components/layout/catalogue/
  catalogue.json            <- Static UI-only catalogue data (3 categories)
  CatalogueNavbar.tsx        <- Server component, transforms JSON to UI
  CatalogueCarousel.tsx      <- Client component, same transform
  CatalogueView.tsx          <- Composed layout (Hero + Details)
  CatalogueItem.tsx          <- 100% commented-out dead code
  NavbarManager.tsx          <- State management for dropdown
  README.md                  <- Conceptual overview (CSV-formatted, not markdown)
  catalogue-alignment.test.ts <- Stale test (imports deleted data module)
  details/
    SliceDetails.tsx
    DetailSection.tsx
    DetailWatermark.tsx
  hero/
    SliceHero.tsx
    HeroImage.tsx
    SliceTitle.tsx

data/
  catalogue-index.json       <- VFS Manifest (build-time generated, 882 lines)
  catalogue.ts               <- VFS accessor module (getCatalogue, getCatalogueIdByUrl)

scripts/
  build-catalogue-index.mjs  <- VFS build script (fetches from Sanity, writes manifest)

sanity/schemaTypes/
  catalogueItemType.ts       <- Sanity object schema for VFS nodes
  productType.ts             <- Product schema (contains catalogueLocationKeys)

sanity/lib/products/
  getSelectedProducts.ts     <- PRIMARY query path (uses legacy categoryPath matching)
  getProductsByCategoryPath.ts <- Also legacy string-path matching
```

### 3.2 Separation of Concerns Assessment

| Concern | Verdict |
|---|---|
| `catalogue.json` in UI folder | Incorrect. This is a UI-specific data structure for the dropdown, NOT the VFS manifest. But its name collides conceptually with the VFS. Should be renamed to `catalogue-nav-data.json` or similar. |
| `catalogue-index.json` in `data/` | Correct. The VFS manifest is correctly separated from UI components. |
| `catalogue.ts` in `data/` | Correct. VFS utility functions belong here, not in UI. |
| Missing `data` type module in catalogue UI folder | Broken. The type `CatalogueItem` (UI shape) needs to exist either as `data.ts` in the catalogue folder or be extracted to a shared types file. |
| Duplicate transformation logic | Both `CatalogueNavbar.tsx` and `CatalogueCarousel.tsx` contain identical JSON-to-CatalogueItem transformation code (lines 10-21 and 14-25 respectively). This must be consolidated into a single utility. |
| `CatalogueItem.tsx` | 120 lines of commented-out dead code. Must be deleted. |
| `README.md` | Content is CSV-formatted, not proper markdown. Conceptually useful but poorly formatted. |
| `catalogue-alignment.test.ts` | Stale. Imports from a deleted module (`./app/components/layout/catalogue/data`). Cannot execute. |

### 3.3 Recommended Structure

```
data/
  catalogue-index.json         <- VFS Manifest (no change)
  catalogue.ts                 <- VFS accessors + key unrolling utilities
  catalogue.types.ts           <- VFS TypeScript types

app/components/layout/catalogue/
  catalogue-nav-data.json      <- Renamed from catalogue.json
  catalogue-nav.types.ts       <- UI-specific CatalogueItem type
  catalogue-nav.utils.ts       <- Shared JSON-to-CatalogueItem transform
  CatalogueNavbar.tsx
  CatalogueCarousel.tsx
  CatalogueView.tsx
  NavbarManager.tsx
  details/
    SliceDetails.tsx
    DetailSection.tsx
    DetailWatermark.tsx
  hero/
    SliceHero.tsx
    HeroImage.tsx
    SliceTitle.tsx
```

---

## 4. GROQ Queries and Click Resolution Audit

### 4.1 The Critical Defect

The live product resolution path (`getSelectedProducts.ts`, line 113) constructs this GROQ:

```groq
*[_type == "product" && (categoryPath == "headphones" || categoryPath match "headphones/*")]
```

This is **leaky string-path matching.** It:
- Performs O(n) substring scanning across every product document.
- Breaks instantly if a slug contains a substring of another slug.
- Cannot be cached efficiently by Sanity's query engine.
- Completely ignores the VFS manifest and `catalogueLocationKeys`.

The VFS-correct query is:

```groq
*[_type == "product" && count(catalogueLocationKeys[@ in $unrolledKeys]) > 0]
```

### 4.2 Click Resolution — What Should Happen

**Leaf Slot Click (e.g., "Earbuds")**

1. User clicks "Earbuds" - URL = `/shop/headphones/earbuds`.
2. App resolves slug `headphones` to ID `zemHaTBY7QMZEyx6WgMYi` via `slugToIdMap`.
3. The leaf `earbuds` has `_key = "k3_InLGWRyJsBJfwNrnyB"` and `children = []`.
4. Unrolled keys = `["k3_InLGWRyJsBJfwNrnyB"]`.
5. GROQ: `count(catalogueLocationKeys[@ in ["k3_InLGWRyJsBJfwNrnyB"]]) > 0`.

**Top-Level Slot Click (e.g., "Headphones and Personal Audio")**

1. User clicks "Headphones" - URL = `/shop/headphones`.
2. App resolves slug `headphones` to ID `zemHaTBY7QMZEyx6WgMYi` via `slugToIdMap`.
3. `slotMetadataMap["zemHaTBY7QMZEyx6WgMYi"].children` = `["gJvupOFvek9IA28wG1pJw", "R9bVoOi1wleAgXnCXER9q", "cwjfSx5AHHNGTf46j6BXj"]`.
4. **Key Unrolling:** Recursively resolve all descendant IDs from `slotMetadataMap`:
   - Start: `zemHaTBY7QMZEyx6WgMYi`
   - Children (headers): `gJvupOFvek9IA28wG1pJw`, `R9bVoOi1wleAgXnCXER9q`, `cwjfSx5AHHNGTf46j6BXj`
   - Grandchildren (leaves): `463Jo7gWrpfJ7BMSgdMQF`, `DyVY7prFN3BC14f8eO2SE`, `w80_8SIwE560_gk-Va6Jk`, `k3_InLGWRyJsBJfwNrnyB`, `wFwdlX0H3-t0zyFmSwV6z`, `aqXYUeh6N6amoDuFDT0sG`, `5M88xGQXUCgqbwR9FvLag`, `n6pRz-Gxgikq6r3c2b3Sy`, `n6ZmERWp5SWJ7iNdblPDC`
5. Unrolled keys = all 13 IDs (root + headers + leaves).
6. GROQ: `count(catalogueLocationKeys[@ in $unrolledKeys]) > 0`.

**Mid-Level Slot Click (e.g., "By category" header — not applicable in current URL scheme)**

Headers (`type: "header"`) have no slug in the manifest's `slugToIdMap`. Mid-level headers are not directly clickable via URL. They are resolved as part of their parent's unrolling. This is correct behavior.

### 4.3 Auxiliary Queries Also Affected

| File | Problem |
|---|---|
| `getProductsByCategoryPath.ts` | Uses `categoryPath match $path + "/*"` — same leaky pattern. |
| `getFiltersForCategoryPath.ts` | Accepts string path, not VFS IDs. |
| `getSortablesForCategoryPath.ts` | Accepts string path, not VFS IDs. |

### 4.4 Summary of Query Path Issues

```
Current Flow (BROKEN):
URL -> path string -> GROQ with categoryPath match "string/*" -> scan all products

Target Flow (VFS):
URL -> slugToIdMap -> slotMetadataMap -> unrollDescendantKeys() -> GROQ with catalogueLocationKeys[@ in $keys] -> O(1) intersection
```

---

## 5. Testing and Evaluation Strategy

### 5.1 What Must Be Tested

All VFS logic is **pure functions** — they take a static JSON manifest as input and return computed values. No Sanity client, no network, no database. This makes them ideal for unit testing.

### 5.2 Test Suite Definition

The following tests should cover the complete VFS utility surface. All tests are pure function evaluations using the real `catalogue-index.json` as input.

**Module Under Test:** `data/catalogue.ts` (after refactoring)

#### Test Group 1: Slug Resolution (`slugToIdMap`)

| # | Test Name | Input | Expected Output |
|---|---|---|---|
| 1.1 | Resolves top-level slug to correct ID | `"headphones"` | `"zemHaTBY7QMZEyx6WgMYi"` |
| 1.2 | Resolves another top-level slug | `"accessories"` | `"_EDhByj4HR6NH7X1DHHfr"` |
| 1.3 | Returns `undefined` for non-existent slug | `"nonexistent"` | `undefined` |
| 1.4 | Returns `undefined` for empty string | `""` | `undefined` |

#### Test Group 2: Slot Metadata Lookup (`slotMetadataMap`)

| # | Test Name | Input ID | Assertion |
|---|---|---|---|
| 2.1 | Returns metadata for known ID | `"zemHaTBY7QMZEyx6WgMYi"` | `.title === "Headphones & Personal Audio "` |
| 2.2 | Returns correct children array | `"zemHaTBY7QMZEyx6WgMYi"` | `.children.length === 3` |
| 2.3 | Returns correct breadcrumbs | `"zemHaTBY7QMZEyx6WgMYi"` | `.breadcrumbs[0].label === "Headphones & Personal Audio "` |
| 2.4 | Leaf node has empty children | `"k3_InLGWRyJsBJfwNrnyB"` (Earbuds) | `.children.length === 0` |
| 2.5 | Returns `undefined` for unknown ID | `"fake_id"` | `undefined` |

#### Test Group 3: Key Unrolling (the core VFS operation)

| # | Test Name | Input ID | Expected Output |
|---|---|---|---|
| 3.1 | Leaf node returns only its own ID | `"k3_InLGWRyJsBJfwNrnyB"` | `["k3_InLGWRyJsBJfwNrnyB"]` |
| 3.2 | Mid-level header returns self + leaf children | `"gJvupOFvek9IA28wG1pJw"` (By category) | Array containing `"gJvupOFvek9IA28wG1pJw"` + 4 leaf IDs = 5 total |
| 3.3 | Top-level returns self + all descendants | `"zemHaTBY7QMZEyx6WgMYi"` (Headphones) | Array containing root + 3 headers + 9 leaves = 13 total |
| 3.4 | On Sale (no children) returns only self | `"sXIqLWIxMpCT5E2VxPkad"` | `["sXIqLWIxMpCT5E2VxPkad"]` |
| 3.5 | All unrolled IDs exist in slotMetadataMap | Any valid root ID | Every ID in result is a key in `slotMetadataMap` |

#### Test Group 4: GROQ Query String Generation

| # | Test Name | Input | Expected Output Pattern |
|---|---|---|---|
| 4.1 | Single leaf generates valid GROQ param | `["k3_InLGWRyJsBJfwNrnyB"]` | `["k3_InLGWRyJsBJfwNrnyB"]` (valid GROQ array) |
| 4.2 | Unrolled top-level generates valid GROQ param | Unrolled "Headphones" keys | Array of 13 strings, all valid IDs |
| 4.3 | Empty input generates empty array | `[]` | `[]` |
| 4.4 | Query string uses correct operator | Any | Output contains `catalogueLocationKeys[@ in $` pattern, NOT `match` or `startsWith` |

#### Test Group 5: Full-Path Slug Resolution (integration-level)

| # | Test Name | Input URL slug | Expected Behavior |
|---|---|---|---|
| 5.1 | Root slug resolves and unrolls | `"headphones"` | Slug -> ID -> unroll -> 13 keys |
| 5.2 | Unknown slug returns null/empty | `"fake-category"` | Returns `undefined` or `null` |

### 5.3 What Must NOT Be Tested Here

- Sanity client connectivity
- Actual GROQ execution against a database
- UI rendering of catalogue components
- Build script execution (`build-catalogue-index.mjs`)

---

## Appendix A: File Reference Index

| File | Role | Status |
|---|---|---|
| `data/catalogue-index.json` | VFS Manifest | Healthy |
| `data/catalogue.ts` | VFS Accessors | Incomplete (no unrolling) |
| `scripts/build-catalogue-index.mjs` | Build Script | Minor issues |
| `sanity/schemaTypes/catalogueItemType.ts` | Sanity Schema | Healthy |
| `sanity/schemaTypes/productType.ts` | Product Schema | Has `catalogueLocationKeys` but unused |
| `sanity/lib/products/getSelectedProducts.ts` | Live Query Path | Uses legacy string matching |
| `sanity/lib/products/getProductsByCategoryPath.ts` | Legacy Query | Uses `categoryPath match` |
| `app/(store)/products/[...category]/page.tsx` | Category Page | VFS code is 100% commented out |
| `app/components/layout/catalogue/CatalogueNavbar.tsx` | Navbar UI | Has duplicate transform |
| `app/components/layout/catalogue/CatalogueCarousel.tsx` | Carousel UI | Has duplicate transform |
| `app/components/layout/catalogue/CatalogueItem.tsx` | Dead Code | 100% commented out |
| `app/components/layout/catalogue/catalogue-alignment.test.ts` | Stale Test | Broken imports |

## Appendix B: VFS Node Count Inventory

Extracted from `data/catalogue-index.json`:

| Level | Count |
|---|---|
| Top-level navigable slots (in `slugToIdMap`) | 7 |
| Total nodes in `slotMetadataMap` (includes headers) | 62 |
| Leaf nodes (children = []) | 42 |
| Header-only nodes (type = "header") | 20 |
