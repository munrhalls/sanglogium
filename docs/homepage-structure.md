# Homepage Structure — Invariants Only

Scope: composition, data source, server/client boundary, state ownership.
Excludes spacing/padding/aspect-ratio/color — those change weekly, don't trust this file for them.
If a fact here contradicts the code, the code wins — re-verify after any large refactor.

## Entry point

`app/(store)/page.tsx` — Server Component, `revalidate = 3600` (ISR). Fetches data, then renders. Sections receive data as props — no section fetches its own Sanity data.

## Data fetching — two calls in `page.tsx`

1. `fetchHomepageData()` → `fetchHomepageDataBatched()` (`features/homepage/adapters/sanity/getHomepageData.ts`; the section data types live in `features/homepage/core/rules/homepageTypes.ts` and the fetcher imports them from `@/features/homepage`) — **2 Sanity queries**: one for `hero`, one batched GROQ query for every other section (featured, 3 spotlights, newestRelease, dacs, all 7 accessory categories). Replaced ~10 separate fetches; TTFB ~10.9s → <600ms.
2. `getIemProductsBySlugs(HOME_12)` (`features/homepage/adapters/sanity/getIemProductsBySlugs.ts`; `HOME_12` lives in `features/homepage/core/definitions/homeIems.ts`) — separate query, IEM products by a hardcoded slug list, passed to `IemsGallery` as `iemsData`. The `iemsGallery` field on `fetchHomepageData`'s return is unused dead weight.

**New homepage data → add a field to the batched query. Do not add a third separate fetch.**

## Sections (render order) and what feeds them

| Section | File | Data prop |
|---|---|---|
| Hero | `features/homepage/view/hero/HeroView.tsx` | `data.hero` |
| TrustBar | `features/homepage/ui/trust-bar/TrustBar.tsx` | none (static) |
| Featured | `features/homepage/view/featured/FeaturedView.tsx` | `data.featured` |
| ProductSpotlightMediaLeft / MediaRight / Fractal | `features/homepage/view/product-spotlight-{media-left,media-right}/ and features/homepage/ui/product-spotlight-fractal/` | `data.spotlight{1,2,3}` |
| IemsGallery | `features/homepage/ui/iems-gallery/IemsGallery.tsx` | `iemsData` (call #2) |
| NewestRelease | `features/homepage/view/newest-release/NewestReleaseView.tsx` | `data.newestRelease` |
| Dacs | `features/homepage/view/dacs/DacsView.tsx` | `data.dacs` |
| Accessories | `features/homepage/view/accessories/AccessoriesView.tsx` (+ `CategorySection.tsx`) | `data.accessories.{cables,interconnects,adapters,earpads,eartips,careCleaning,storage}` |

Every section except Hero and TrustBar is wrapped in `Shelf` (`platform/design/ui/Shelf.tsx`) in `features/homepage/view/HomepageView.tsx`, with a `spacing` prop and optional `fullBleed`.

## Cards — bespoke per section, NOT shared

There is no shared homepage product card. Each section has its own:

- Featured → `FeaturedCard` in `features/homepage/view/featured/FeaturedView.tsx`
- IemsGallery → `features/homepage/ui/iems-gallery/IemCard.tsx`
- Dacs → `features/homepage/ui/dacs/DacCard.tsx`
- Accessories → `features/homepage/ui/accessories/AccessoryCard.tsx`
- Spotlights, NewestRelease → no card component; bespoke single-product layouts.

`IemCard.tsx` and `AccessoryCard.tsx` are structurally identical and must be kept in sync by hand.
`features/products/ui/card/ProductCard.tsx` is the **product-listing** grid card — not used anywhere on the homepage.

## Server/client boundary

Page tree is Server Components by default. Client islands:

- `HeroQualityBar.tsx` (child of Hero)
- The carousel primitives (`platform/design/ui/carousel/Carousel*.tsx`)
- Leaf controls inside cards: `BasketControls.tsx`, `WishlistButton.tsx`

The card components themselves (`Card`, `IemCard`, `DacCard`, `AccessoryCard`) are Server Components that render those client leaves.

## State ownership

No section component or card owns Zustand / `nuqs` state. Cards delegate:

- basket add/remove → `BasketControls` (`features/basket/ui/BasketControls.tsx`)
- wishlist toggle → `WishlistButton` (`features/products/ui/card/WishlistButton.tsx`)

A "add to basket from the homepage" bug is in `BasketControls`, not the section or card.

## Shared primitives

- `Shelf` — section layout wrapper.
- `SectionHeader` (`features/homepage/ui/shared/SectionHeader.tsx`) — reused header block (e.g. via `IemsGalleryHeader`).
- Carousel (`platform/design/ui/carousel/`) — imported by 7 sections (Featured, Accessories/CategorySection, Dacs, NewestRelease, all 3 spotlights). One implementation — a carousel bug in one place is present everywhere.

---

*Structural facts only. Re-check against code after any major refactor of data fetching or section composition. Last verified 2026-08-31.*
