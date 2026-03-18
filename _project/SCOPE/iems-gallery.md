# IEMs Gallery

## Current State
Skeletal state with haphazard styling. Needs data pass and
proper styling with design system aliases.

## Deliverable State
Responsive grid of IEM product cards.
Desktop: 4-column grid. Mobile: 2-column grid.
Each card: product image, brand (overline), title, price, btn-cart.
Styled with design system aliases throughout.

## Data Contract
interface IemProduct {
  _id: string
  name: string
  brand: string
  displayPrice: number
  image: { asset: { url: string }, alt?: string }
}
GROQ filter: catalogueLocationKeys includes "iem"
Limit: 8 products (fills 2 rows on desktop, 4 rows on mobile)

## In Scope
- GROQ query fetching only fields in data contract
- TypeScript interface for IemProduct
- 4-column desktop grid, 2-column mobile grid via Tailwind
- Each card: image, brand overline, title, price, btn-cart
- Design system aliases for all styling

## Out of Scope
- Filtering or sorting
- Pagination
- Any shared card component extraction
- Future requirements

## Forbidden Scope
- DO NOT touch any other component

## Architecture Decisions
- Simple CSS grid — no JS layout logic
- Product card defined inline — not extracted
- Self-contained server component