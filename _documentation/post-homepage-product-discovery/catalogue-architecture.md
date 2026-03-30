# Catalogue & Product Discovery Architecture

## Overview

This document describes how the catalogue system connects to product discovery, from navigation click to rendered product grid.

## Core Concepts

| Term | Definition |
|------|------------|
| **Catalogue** | Hierarchical category structure (Headphones → By Design → Open-Back) |
| **Leaf Node** | Bottom-level category that contains products (e.g., "Open-Back") |
| **Slot ID** | Unique identifier for any catalogue node (e.g., `o7c6baiuobsr7ni2y2vf22sh`) |
| **VFS** | Virtual File System — pre-built catalogue index for O(1) lookups |
| **catalogueLocationKeys** | Array of slot IDs on each product indicating its categories |

## Data Flow: Click to Products

```
User clicks "Open-Back" in navigation
         ↓
Navigate to /shop/headphones/open-back
         ↓
Server Component parses URL → extracts slug "open-back"
         ↓
resolveSlugToId("open-back") → "o7c6baiuobsr7ni2y2vf22sh"
         ↓
unrollDescendantKeys(nodeId) → ["o7c6baiuobsr7ni2y2vf22sh"]
         ↓
getProductsByVfsKeys(["o7c6..."]) → GROQ query
         ↓
Sanity returns products with matching catalogueLocationKeys
         ↓
Render ProductGrid with products
```

## Key Files

### VFS Data Layer
| File | Purpose |
|------|---------|
| `data/catalogue-index.json` | Pre-built index with all slot IDs and tree structure |
| `data/catalogue.ts` | VFS functions: `resolveSlugToId`, `unrollDescendantKeys` |

### Product Resolution Layer
| File | Purpose |
|------|---------|
| `sanity/lib/products/getProductsByVfsKeys.ts` | Fetch products by slot IDs (TO IMPLEMENT) |
| `app/(store)/shop/[...slug]/page.tsx` | Category listing page (TO IMPLEMENT) |
| `app/components/features/products/ProductGrid.tsx` | Product grid presentation (TO IMPLEMENT) |

### Navigation Layer
| File | Purpose |
|------|---------|
| `app/components/layout/catalogue/CatalogueNavbar.tsx` | Renders navigation from VFS |
| `app/components/layout/catalogue/details/DetailSection.tsx` | Renders category links |

## VFS Functions Reference

### resolveSlugToId(slug: string): string | undefined
Converts URL slug to slot ID.

```typescript
const id = resolveSlugToId("open-back");
// Returns: "o7c6baiuobsr7ni2y2vf22sh"
```

### unrollDescendantKeys(nodeId: string): string[]
Returns all descendant slot IDs including the node itself.

```typescript
const keys = unrollDescendantKeys("ugyeto8653n495dpf89nzoar"); // Headphones root
// Returns: ["ugyeto...", "ekv4t...", "o7c6...", "yq3p...", ...] — 7 total
```

For leaf nodes, returns array with just that ID.

## Product GROQ Query

Fetch products by catalogue slot IDs:

```groq
*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] {
  _id,
  name,
  brand,
  displayPrice,
  image,
  catalogueLocationKeys
}
```

This query uses array intersection — returns products where at least one `catalogueLocationKeys` entry matches the provided slot IDs.

## URL Structure

| URL Pattern | Example | Resolves To |
|-------------|---------|-------------|
| `/shop/[category]/[leaf]` | `/shop/headphones/open-back` | Leaf node products |
| `/shop/[category]` | `/shop/headphones` | All products in category (all leaves) |
| `/brand/[slug]` | `/brand/sennheiser` | Brand page (separate system) |

**Note:** Navigation currently generates `/products/*` — should be updated to `/shop/*` for consistency.

## Current Status

### Implemented ✅
- [x] VFS pre-built index (`catalogue-index.json`)
- [x] VFS lookup functions (`resolveSlugToId`, `unrollDescendantKeys`)
- [x] Navigation rendering from VFS
- [x] Test suite (63 tests passing)
- [x] Product schema with `catalogueLocationKeys`

### Not Implemented ❌
- [ ] `getProductsByVfsKeys()` function
- [ ] `/shop/[...slug]/page.tsx` category pages
- [ ] `ProductGrid` component
- [ ] Homepage VFS integration (currently hardcoded)

## Implementation Guide

### Step 1: Create Product Resolution Function

Create `sanity/lib/products/getProductsByVfsKeys.ts`:

```typescript
import { sanityFetch } from "@/sanity/lib/client";
import { cache } from "react";
import groq from "groq";

export const getProductsByVfsKeys = cache(async (keys: string[]) => {
  if (!keys.length) return [];
  
  return sanityFetch({
    query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] {
      _id, name, brand, displayPrice, image,
      "matchedKeys": catalogueLocationKeys[@ in $keys]
    }`,
    params: { keys }
  });
});
```

### Step 2: Create Category Page

Create `app/(store)/shop/[...slug]/page.tsx`:

```typescript
import { resolveSlugToId, unrollDescendantKeys } from "@/data/catalogue";
import { getProductsByVfsKeys } from "@/sanity/lib/products/getProductsByVfsKeys";
import { ProductGrid } from "@/app/components/features/products/ProductGrid";

export default async function CategoryPage({ 
  params: { slug }
}: { params: { slug: string[] } }) {
  const leafSlug = slug[slug.length - 1];
  const nodeId = resolveSlugToId(leafSlug);
  
  if (!nodeId) return <div>Category not found</div>;
  
  const descendantIds = unrollDescendantKeys(nodeId);
  const leafIds = descendantIds.filter(id => 
    // Check if leaf node in metadata map
    isLeafNode(id)
  );
  
  const products = await getProductsByVfsKeys(leafIds);
  
  return <ProductGrid products={products} />;
}
```

### Step 3: Update Navigation URLs

In `data/catalogue.ts`, change URL generation:

```typescript
// From:
url: `/products/${rootItem.slug?.current}/${link.slug?.current}`

// To:
url: `/shop/${rootItem.slug?.current}/${link.slug?.current}`
```

## Testing

Run VFS test suite:

```bash
npx vitest run tests/catalogue/vfs.test.ts
```

Tests verify:
- Node ID → leaf node resolution
- Leaf node → product ID resolution via GROQ
- Parent node → aggregated products
- Pre-computed index consistency

## Architecture Decisions

### Why Pre-built VFS?

Catalogue structure changes infrequently but is queried on every navigation. Pre-building at deploy time eliminates runtime CMS calls for structure.

### Why Array Intersection for Products?

Products can exist in multiple categories (e.g., both "Open-Back" and "Planar Magnetic"). Array intersection (`count(catalogueLocationKeys[@ in $keys]) > 0`) handles this naturally.

### Why Server Components?

Data fetching happens server-side for:
- Cache efficiency (shared across users)
- Bundle size (VFS data not sent to client)
- SEO (products rendered in initial HTML)

## Related Documentation

- [VFS Test Plan](../tests/catalogue/VFS_TEST_PLAN.md)
- [Frontend VFS Audit](../audit-reports/FRONTEND_VFS_CONSUMPTION_AUDIT.md)
- [Sanity Schema](../sanity/schemaTypes/productType.ts)

---

*Last updated: March 30, 2026*
