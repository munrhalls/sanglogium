# Product Spotlight 1

## Current State
Component is mostly complete visually with mock data.
Remaining work: data pass only.
Layout: product image on the left, promo copy on the right.

## Deliverable State
Single featured product images displayed in a carousel with image left, copy right.
Copy shows: brand (overline), headline (h1 scale), subheadline,
body copy (from Sanity), and btn-ghost "SEE MORE" button.
Background has subtle linear gradient. Styled with design system aliases.

## Data Contract
interface SpotlightProduct {
  _id: string
  name: string
  brand: string
  displayPrice: number
  image: { asset: { url: string }, alt?: string }
  imageGallery: Array<{ asset: { url: string }, alt?: string }>
  overviewFields: Array<{ title: string, value: string }>
}
GROQ filter: specific product _id hardcoded per spotlight component
(each spotlight shows a specific curated product)

## In Scope
- GROQ query for a single product by hardcoded _id
- TypeScript interface for SpotlightProduct
- Replace mock data with real Sanity data
- Styling uses design system aliases only
- Fractal star background decoration

## Out of Scope
- Layout changes — layout is already done
- Any shared component extraction
- Future requirements
- Carousel internals

## Forbidden Scope
- DO NOT touch any other component

## Architecture Decisions
- Single product fetched by hardcoded _id — not dynamic
- No shared component between Spotlight 1, 2, 3
- Each spotlight is a self-contained server component