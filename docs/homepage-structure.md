# Homepage Structure — Invariants Only

Scope: composition, data source, server/client boundary, state ownership.
Excludes spacing/padding/aspect-ratio/color — those change weekly, don't trust this file for them.
If a fact here contradicts the code, the code wins — re-verify after any large refactor.

## Entry point

`app/(store)/page.tsx` — Server Component, `revalidate = 3600` (ISR). Fetches data, then renders. Sections receive data as props — no section fetches its own Sanity data.

## Data fetching — two calls in `page.tsx`

1. `fetchHomepageData()` → `fetchHomepageDataBatched()` (`sanity-cms/lib/homepage/getHomepageData.ts`) — **2 Sanity queries**: one for `hero`, one batched GROQ query for every other section (featured, 3 spotlights, newestRelease, dacs, all 7 accessory categories). Replaced ~10 separate fetches; TTFB ~10.9s → <600ms.
2. `getIemProductsBySlugs(HOME_12)` (`app/components/features/homepage/iems-gallery/getIemProducts.ts`) — separate query, IEM products by a hardcoded slug list, passed to `IemsGallery` as `iemsData`. The `iemsGallery` field on `fetchHomepageData`'s return is unused dead weight.

**New homepage data → add a field to the batched query. Do not add a third separate fetch.**

## Sections (render order) and what feeds them

| Section | File | Data prop |
|---|---|---|
| Hero | `homepage/hero/Hero.tsx` | `data.hero` |
| TrustBar | `homepage/trust-bar/TrustBar.tsx` | none (static) |
| Featured | `homepage/featured/` | `data.featured` |
| ProductSpotlight1/2/3 | `homepage/product-spotlight-{1,2,3}/` | `data.spotlight{1,2,3}` |
| IemsGallery | `homepage/iems-gallery/IemsGallery.tsx` | `iemsData` (call #2) |
| NewestRelease | `homepage/newest-release/NewestRelease.tsx` | `data.newestRelease` |
| Dacs | `homepage/dacs/Dacs.tsx` | `data.dacs` |
| Accessories | `homepage/accessories/Accessories.tsx` (+ `CategorySection.tsx`) | `data.accessories.{cables,interconnects,adapters,earpads,eartips,careCleaning,storage}` |

Every section except Hero and TrustBar is wrapped in `Shelf` (`app/components/layout/general/Shelf.tsx`) in `page.tsx`, with a `spacing` prop and optional `fullBleed`.

## Cards — bespoke per section, NOT shared

There is no shared homepage product card. Each section has its own:

- Featured → `homepage/featured/card/Card.tsx`
- IemsGallery → `homepage/iems-gallery/IemCard.tsx`
- Dacs → `homepage/dacs/DacCard.tsx`
- Accessories → `homepage/accessories/AccessoryCard.tsx`
- Spotlights, NewestRelease → no card component; bespoke single-product layouts.

`IemCard.tsx` and `AccessoryCard.tsx` are structurally identical and must be kept in sync by hand.
`app/components/features/products/ProductCard.tsx` is the **product-listing** grid card — not used anywhere on the homepage.

## Server/client boundary

Page tree is Server Components by default. Client islands:

- `HeroQualityBar.tsx` (child of Hero)
- The carousel primitives (`app/components/layout/carousel/Carousel*.tsx`)
- Leaf controls inside cards: `BasketControls.tsx`, `WishlistButton.tsx`

The card components themselves (`Card`, `IemCard`, `DacCard`, `AccessoryCard`) are Server Components that render those client leaves.

## State ownership

No section component or card owns Zustand / `nuqs` state. Cards delegate:

- basket add/remove → `BasketControls` (`app/components/features/basket/BasketControls.tsx`)
- wishlist toggle → `WishlistButton` (`app/components/features/wishlist/WishlistButton.tsx`)

A "add to basket from the homepage" bug is in `BasketControls`, not the section or card.

## Shared primitives

- `Shelf` — section layout wrapper.
- `SectionHeader` (`homepage/shared/SectionHeader.tsx`) — reused header block (e.g. via `IemsGalleryHeader`).
- Carousel (`app/components/layout/carousel/`) — imported by 7 sections (Featured, Accessories/CategorySection, Dacs, NewestRelease, all 3 spotlights). One implementation — a carousel bug in one place is present everywhere.

---

*Structural facts only. Re-check against code after any major refactor of data fetching or section composition. Last verified 2026-08-31.*
