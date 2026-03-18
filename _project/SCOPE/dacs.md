# DACs

## Current State
Skeletal state with haphazard styling. Needs data pass and
proper styling with design system aliases.

## Deliverable State
Carousel of DAC product cards. Larger cards than Featured.
Each card: product image (larger), brand (overline), title,
short promo description, price, btn-cart.
Desktop: 2-3 cards visible. Mobile: 1 card.
Styled with design system aliases.

## Data Contract
interface DacProduct {
  _id: string
  name: string
  brand: string
  displayPrice: number
  image: { asset: { url: string }, alt?: string }
  overviewFields: Array<{ title: string, value: string }>
}
GROQ filter: catalogueLocationKeys includes "dac"
Limit: 6 products

## In Scope
- GROQ query fetching only fields in data contract
- TypeScript interface for DacProduct
- Carousel imported from /layout/carousel
- Cards slightly larger than Featured cards
- Design system aliases for all styling

## Out of Scope
- Carousel internals
- Shared component extraction
- Future requirements

## Forbidden Scope
- DO NOT touch carousel internals
- DO NOT touch any other component

## Architecture Decisions
- Product card defined inline — not extracted
- Carousel imported externally
- Self-contained server component