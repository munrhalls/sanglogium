# Featured

## Current State
Component is mostly complete visually. Remaining work:
data pass (replace mock data with real Sanity data) and
replace any one-off Tailwind classes with design system aliases.

## Deliverable State
Responsive carousel of product cards populated from Sanity.
Each card shows: product image (mainImage), brand, title, price,
and btn-cart button from design system.
Desktop: 3 cards visible. Mobile: 1 card visible.
All Tailwind classes use design system aliases from tailwind.config.ts.

## Data Contract
interface FeaturedProduct {
  _id: string
  name: string
  brand: string
  displayPrice: number
  image: { asset: { url: string }, alt?: string }
}
GROQ filter: catalogueLocationKeys includes "featured"

## In Scope
- GROQ query fetching only the fields in the data contract above
- TypeScript interface for FeaturedProduct
- Replace mock data with real Sanity data
- Replace any raw Tailwind primitives with design system aliases
- btn-cart from design system on each product card

## Out of Scope
- Carousel implementation or internals — use existing carousel from /layout/carousel
- Carousel buttons, dots, swipe logic
- Any abstraction of product card into shared component
- Any other premature optimizations
- Future requirements

## Forbidden Scope
- DO NOT touch carousel internals in any way
- DO NOT touch Hero or any other component

## Architecture Decisions
- Product card is defined inline within Featured — not extracted
- Carousel imported from /layout/carousel as external component
- Data fetched in Featured server component directly
- No shared hooks or utilities