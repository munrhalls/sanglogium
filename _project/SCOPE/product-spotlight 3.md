# Product Spotlight 3

## Current State
Component is mostly complete visually with mock data.
Remaining work: data pass only.
Layout: large centered product image, copy below or beside.

## Deliverable State
Single featured product. Large product image prominent.
Copy shows: brand (overline), headline, body copy,
btn-ghost "SEE MORE" button. Styled with design system aliases.
Background: subtle fractal star decoration using CSS background-image
at low opacity — accomplished via CSS background repeat/position,
not as a Next.js Image component.

## Data Contract
Same interface as Spotlight 1 (SpotlightProduct).
GROQ filter: specific product _id hardcoded for this component.

## In Scope
- GROQ query for a single product by hardcoded _id
- Replace mock data with real Sanity data
- Fractal star background via CSS only

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
- Fractal background is CSS only — no additional image component