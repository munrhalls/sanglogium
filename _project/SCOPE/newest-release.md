# Newest Release

## Current State
Skeletal state with haphazard styling. Needs data pass and
proper styling with design system aliases.

## Deliverable State
Two-column layout: product image carousel on the right,
promo copy on the left. Background has subtle fractal star
decoration at low opacity via CSS. Styled with design system aliases.
Left copy: brand (overline), product name (h1 scale), subheadline,
body copy, btn-ghost "SEE MORE". Right: carousel showing mainImage
followed by gallery images.

## Data Contract
interface NewestReleaseProduct {
  _id: string
  name: string
  brand: string
  displayPrice: number
  image: { asset: { url: string }, alt?: string }
  gallery: Array<{ asset: { url: string }, alt?: string }>
  overviewFields: Array<{ title: string, value: string }>
}
GROQ filter: specific product _id hardcoded — the newest release
is a curated editorial choice, not a dynamic sort.

## In Scope
- GROQ query for single product by hardcoded _id including gallery
- TypeScript interface for NewestReleaseProduct
- Image carousel: mainImage + gallery images combined into one array
- Carousel imported from /layout/carousel as external component
- Fractal star background via CSS background-image repeat/position
- Design system aliases for all styling

## Out of Scope
- Carousel internals — use existing carousel from /layout/carousel
- Dynamic "newest" sorting
- Shared component extraction
- Future requirements

## Forbidden Scope
- DO NOT touch carousel internals
- DO NOT touch any other component

## Architecture Decisions
- Hardcoded product _id — editorial choice, not dynamic
- Carousel imported externally, not modified
- Fractal decoration is CSS only, not a Next.js Image component
- Self-contained server component