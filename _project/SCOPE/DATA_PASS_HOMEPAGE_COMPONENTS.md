Replace the entire content of
_project/SCOPE/DATA_PASS_HOMEPAGE_COMPONENTS.md
with exactly this:

# Data Pass — Homepage Components

## Purpose
Implement data fetching for all homepage components except Hero
using the homepageData Sanity singleton as the single source of truth.

## The Architecture — LOCKED

Source: One Sanity document of type "homepageData".
Pattern: Each component is an async React Server Component with
its own dedicated GROQ query file in its component folder.
ISR: export const revalidate = 3600 in app/(store)/page.tsx.
No Suspense. No shared fetch hooks. No waterfalls. No client fetching.

The query pattern for every component:
*[_type == "homepageData"][0].<fieldName>->{fields}
or for arrays:
*[_type == "homepageData"][0].<fieldName>[]->{fields}

## Sanity Schema Field Map
featured          → array of product references → Featured carousel
spotlight1Data    → object with productRef + promo fields → ProductSpotlight1
spotlight2Data    → object with productRef + promo fields → ProductSpotlight2
spotlight3Data    → object with productRef + promo fields → ProductSpotlight3
iemsGallery       → array of product references → IemsGallery grid
newestReleaseData → object with productRef + promo fields → NewestRelease
dacs              → array of product references → Dacs carousel
accessoriesCables → array of product references → Accessories cables carousel
accessoriesEarpads → array of product references → Accessories earpads carousel
accessoriesStorage → array of product references → Accessories storage carousel

## Product Fields Available Per Component
Every component fetches only what it renders:
Cards (Featured, IemsGallery, Dacs, Accessories):
  _id, name, brand, displayPrice, image{asset->{url}}

Spotlights (1, 2, 3) and NewestRelease:
  productRef->{_id, name, brand, displayPrice, image{asset->{url}}}
  plus promo fields: promoTitle, promoSubtitle, promoText

NewestRelease additionally needs:
  productRef->{..., gallery[]{asset->{url}}}

## Deliverable State
Every homepage component (Featured ✓ already done,
ProductSpotlight1, ProductSpotlight2, ProductSpotlight3,
IemsGallery, NewestRelease, Dacs, Accessories) fetches real
Sanity data. No mock data remains anywhere on the homepage.

## In Scope
- One GROQ query file per component (getData.ts or similar)
- One TypeScript interface per component
- async server component pattern on every component
- revalidate = 3600 already on page.tsx

## Out of Scope
- Hero component — locked, do not touch
- Image optimization
- Search functionality
- Styling changes
- Carousel internals
- Any shared fetch utilities

## Forbidden Scope
- Do not touch Hero
- Do not add Suspense
- Do not create shared query files
- Do not fetch fields the component does not render
- Do not change any JSX, className, or styling

CONSTRAINTS:
- Replace the entire file with exactly this content
- Do not touch any other file