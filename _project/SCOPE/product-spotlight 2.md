# Product Spotlight 2

## Current State
Component is mostly complete visually with mock data.
Remaining work: data pass only.
Layout: product image on the right, promo copy on the left.

## Deliverable State
Same as Spotlight 1 but mirrored layout (image right, copy left).
Copy shows: brand (overline), headline, subheadline, body copy,
btn-ghost "SEE MORE" button. Styled with design system aliases.

## Data Contract
Same interface as Spotlight 1 (SpotlightProduct).
GROQ filter: specific product _id hardcoded for this component.

## In Scope
- GROQ query for a single product by hardcoded _id
- TypeScript interface (same as Spotlight 1)
- Replace mock data with real Sanity data
- Fractal star background decoration

## Out of Scope
- Layout changes
- Shared component extraction
- Future requirements
- Carousel internals


## Forbidden Scope
- DO NOT touch any other component

## Architecture Decisions
- Hardcoded product _id — not dynamic
- Self-contained server component