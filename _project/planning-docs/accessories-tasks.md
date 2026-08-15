# Accessories Section — Phases & Tasks

## Context

The accessories section on the Sang Logium homepage currently renders two categories:
**Cables** (4 products) and **Pads** (2 products). It looks sparse.

**End state:** Three categories — Cables (5–6 products), Pads (4 products), Storage (4 products) — each filling a full 4-column row on desktop.

**Key fact:** The Sanity schema already defines `accessoriesStorage` on the `homepageData` document. Zero schema changes needed. The gap is (a) code doesn't wire it up yet, and (b) not enough products are assigned in Sanity.

---

## Phase 1 — Code Wiring (Devin)

**Goal:** Storage category renders on the page. No Sanity data yet — it just won't show if empty, which is fine.

### Task 1.1 — Add Storage to data fetching

**File:** `app/components/features/homepage/accessories/getAccessoryProducts.ts`

Current file has:
```ts
export interface AccessoryData {
  cables: AccessoryProduct[];
  earpads: AccessoryProduct[];
}

const CABLES_Q = `${BASE}.accessoriesCables[]->{...}`;
const EARPADS_Q = `${BASE}.accessoriesEarpads[]->{...}`;

export const getAccessoryProducts = cache(async (): Promise<AccessoryData> => {
  const [cables, earpads] = await Promise.all([
    sanityFetch({ query: CABLES_Q }),
    sanityFetch({ query: EARPADS_Q }),
  ]);
  return {
    cables: (cables as AccessoryProduct[]) ?? [],
    earpads: (earpads as AccessoryProduct[]) ?? [],
  };
});
```

**Changes required:**

1. Add `storage: AccessoryProduct[]` to `AccessoryData` interface
2. Add constant after `EARPADS_Q`:
   ```ts
   const STORAGE_Q = `${BASE}.accessoriesStorage[]->{_id,name,brand->{ _id, name, slug },price_data,stock,"slug": slug.current,"imageUrl": image.asset->url,image{asset->{_id, url}}}`;
   ```
3. Add `storage` to `Promise.all` destructuring
4. Return `storage: (storage as AccessoryProduct[]) ?? []`

### Task 1.2 — Render Storage section in UI

**File:** `app/components/features/homepage/accessories/Accessories.tsx`

Current destructure:
```ts
const { cables, earpads } = accessoriesData;
```

**Changes required:**

1. Add `storage` to destructure: `const { cables, earpads, storage } = accessoriesData;`
2. After the earpads `CategorySection` block, add:
   ```tsx
   {storage.length > 0 && (
     <CategorySection category={{ name: "Storage", filter: "" }} items={storage as any} />
   )}
   ```

### Task 1.3 — Verify

Run `npx tsc --noEmit` from the project root. Must pass with zero type errors.

---

## Phase 2 — Sanity Product Population (Free Model + Manual)

**Goal:** Each of the three categories has enough products to fill a row (4 minimum per category).

The Sanity `homepageData` document has three array fields that accept product references:
- `accessoriesCables` — needs 2 more products (currently 4, target 6)
- `accessoriesEarpads` — needs 2 more products (currently 2, target 4)
- `accessoriesStorage` — needs 4 products (currently 0)

### Task 2.1 — Identify products to add (Free Model)

Search the existing Sanity product catalog for products that fit each category.

**For Cables:** look for products whose `catalogueLocationKeys` or name contains "cable", "cord", "3.5mm", "XLR", "balanced", "interconnect"

**For Pads:** look for products whose name contains "pad", "earpad", "cushion", "foam"

**For Storage:** look for products whose name contains "case", "bag", "pouch", "stand", "holder", "rack", "organizer"

Return a list of `_id` and `name` for each candidate. If fewer than 4 exist for any category, flag it — new products will need to be created (see Task 2.2).

### Task 2.2 — Create missing products in Sanity (if needed)

If existing catalog doesn't have enough products for a category, create new product documents in Sanity Studio.

**Minimum required fields per product:**
- `name` — realistic accessory product name (e.g., "Meze 99 Series 2.5mm Balanced Cable")
- `slug` — auto-generated from name
- `brand` — reference to an existing brand in Sanity
- `price_data` — `{ currency: "usd", unit_amount: <price in cents> }` (e.g., 5500 = $55)
- `stock` — set to 10
- `sku` — unique string (e.g., "CBL-MEZE-25BAL")
- `image` — upload a product image
- `catalogueLocationKeys` — assign appropriately (e.g., `["accessories", "cables"]`)
- `parcel` — use defaults (length: 10, width: 10, height: 5, weight: 500)
- `reservedStock` — set to 0

**Realistic product names to create (if not already in catalog):**

Cables:
- "Meze 99 Series 2.5mm Balanced Replacement Cable" — $55
- "Audio-Technica 3m OFC Replacement Cable" — $45

Pads:
- "Dekoni Audio Elite Fenestrated Sheepskin Pads for Sennheiser HD6XX" — $65
- "ZMF Oval Lambskin Earpads" — $89

Storage:
- "Pelican 1510 Carry-On Case" — $189
- "Headphone Stand — Aluminum Single" — $49
- "Grado Labs Mahogany Headphone Stand" — $85
- "Protective Headphone Travel Pouch" — $29

### Task 2.3 — Assign products to homepage arrays

In Sanity Studio, open the **Homepage** document and:

1. In `Accessories: Cables` — add references to 5–6 cable products
2. In `Accessories: Earpads` — add references to 4 earpad products
3. In `Accessories: Storage` — add references to 4 storage products

Save and publish.

### Task 2.4 — Visual QA

Load the homepage in the browser. Confirm:
- Three category sections render: Cables, Pads, Storage
- Desktop: each section fills a full 4-column row with no empty slots visible
- Mobile: carousel works, dots show correct count, prev/next arrows functional
- No broken images

---

## Definition of Done

- [ ] `getAccessoryProducts.ts` returns `{ cables, earpads, storage }`
- [ ] `Accessories.tsx` renders Storage section when data is present
- [ ] `npx tsc --noEmit` passes clean
- [ ] Cables: 5–6 products in Sanity, all visible on homepage
- [ ] Pads: 4 products in Sanity, all visible on homepage
- [ ] Storage: 4 products in Sanity, all visible on homepage
- [ ] Visual QA passes on desktop and mobile
