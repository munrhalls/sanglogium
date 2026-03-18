# Accessories

## Current State
Skeletal state with haphazard styling. Needs data pass and
proper styling with design system aliases.

## Deliverable State
Three sequential carousels, one per category:
1. Cables (catalogueLocationKeys includes "cable")
2. Earpads (catalogueLocationKeys includes "earpad")
3. Storage (catalogueLocationKeys includes "storage")
Each carousel has a section label above it.
Each card: product image, brand (overline), title, price, btn-cart.
Styled with design system aliases.

## Data Contract
interface AccessoryProduct {
  _id: string
  name: string
  brand: string
  displayPrice: number
  image: { asset: { url: string }, alt?: string }
}
Three separate GROQ queries — one per category key.
Limit: 6 products per carousel.

## In Scope
- Three GROQ queries, one per category
- TypeScript interface for AccessoryProduct
- Three carousels using /layout/carousel
- Section label above each carousel
- Design system aliases for all styling

## Out of Scope
- Carousel internals
- Shared component extraction
- Combined single carousel
- Future requirements

## Forbidden Scope
- DO NOT touch carousel internals
- DO NOT touch any other component

## Architecture Decisions
- Three independent carousels — not a single configurable one
- Each carousel fetches its own data independently
- Self-contained server component