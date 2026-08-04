# Homepage Structure — Invariants Only

Scope: composition, data source, server/client boundary, state ownership.
Explicitly excludes spacing/padding/aspect-ratio/color — those change weekly, do not trust this file for them.
If a fact here contradicts the code, the code wins — re-verify before relying on this after a large refactor.

## Entry point

`app/(store)/page.tsx` — Server Component. `revalidate = 3600` (ISR, not per-request live query, not fully static). Calls one function, `fetchHomepageData()`, before rendering anything. All section components receive pre-fetched data as props — no section fetches its own data.

## Data source — one batched call, not per-section

`fetchHomepageData()` (`app/(store)/lib/fetchHomepageData.ts`) delegates to `fetchHomepageDataBatched()` in `sanity-cms/lib/homepage/getHomepageData.ts`.

Total Sanity queries for the entire page: **2** — one for `hero` (separate document type), one batched GROQ query for every other section (featured, 3 spotlights, IEMs gallery, newest release, DACs, all 7 accessory categories). This replaced 8-10 separate fetches; documented TTFB win was ~10.9s → <600ms.

**If a future task needs new homepage data: add a field to the existing batched query. Do not add a new separate fetch call** — that reintroduces the waterfall this was built to remove.

## Sections (in render order) and what feeds them

| Section | File | Data field |
|---|---|---|
| Hero | `app/components/features/homepage/hero/Hero.tsx` | `data.hero` |
| TrustBar | `app/components/features/homepage/trust-bar/TrustBar.tsx` | none (static) |
| Featured | `app/components/features/homepage/featured/` | `data.featured` |
| ProductSpotlight1 | `app/components/features/homepage/product-spotlight-1/` | `data.spotlight1` |
| ProductSpotlight2 | `app/components/features/homepage/product-spotlight-2/ProductSpotlight2.tsx` | `data.spotlight2` |
| ProductSpotlight3 | `app/components/features/homepage/product-spotlight-3/ProductSpotlight3.tsx` | `data.spotlight3` |
| IemsGallery | `app/components/features/homepage/iems-gallery/IemsGallery.tsx` | `data.iemsGallery` |
| NewestRelease | `app/components/features/homepage/newest-release/NewestRelease.tsx` | `data.newestRelease` |
| Dacs | `app/components/features/homepage/dacs/Dacs.tsx` | `data.dacs` |
| Accessories | `app/components/features/homepage/accessories/Accessories.tsx` (+ child `CategorySection.tsx`) | `data.accessories.{cables,interconnects,adapters,earpads,eartips,careCleaning,storage}` |

All sections above are wrapped in `Shelf` (`app/components/layout/general/Shelf.tsx`) — the shared section-boundary layout primitive. Every section sits inside one.

## Server/client boundary

The entire page tree is Server Components by default. Confirmed client islands (only these, nothing else in the homepage tree):

- `HeroQualityBar.tsx` (child of Hero)
- `ProductCard.tsx` (`app/components/features/products/ProductCard.tsx`) — used wherever a product tile renders (spotlights, gallery, DACs, accessories, newest release)

Everything else in the homepage component tree — Featured, TrustBar, IemsGallery, NewestRelease, Dacs, Accessories, Shelf, SectionHeader — has no `"use client"` directive.

## State ownership

`ProductCard` itself holds no state. It delegates:

- basket add/remove → `BasketControls` (`app/components/features/basket/BasketControls.tsx`)
- wishlist toggle → `WishlistButton` (`app/components/features/wishlist/WishlistButton.tsx`)

No homepage section component owns Zustand or `nuqs` state directly. If a bug involves "adding to basket from the homepage," the fix is in `BasketControls`, not in the section component or `ProductCard`.

## Shared primitives reused across sections

- `Shelf` — section layout wrapper, used by all 8 sections.
- `SectionHeader` (`app/components/features/homepage/shared/SectionHeader.tsx`) — reused header block.
- `CarouselControls` (`app/components/layout/carousel/CarouselControls.tsx`) — one shared component, imported by 7 sections (Featured, Accessories/CategorySection, Dacs, NewestRelease, all 3 spotlights). Not duplicated per section — a carousel-control bug found in one place is likely present everywhere it's imported.

---

*Built once by direct code exploration, 2026-08-03. Structural facts only — re-check before trusting after a major refactor of data fetching or section composition.*
