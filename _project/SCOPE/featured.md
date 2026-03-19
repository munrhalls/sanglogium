# Featured

## Current State
Component is mostly complete visually. Remaining work:
data pass (replace mock data with real Sanity data) and
replace any one-off Tailwind classes with design system aliases.

## Deliverable State
Responsive carousel of product cards populated from Sanity.
Each card shows: product image (mainImage), brand, title, promot text,
 and price and btn-cart button from design system.
Promo text elements should all expand and have equal height to the tallest promo text element, based on promo text length.
Desktop: 3 cards visible. Tablet: 2 cards visible. Mobile: 1 card visible.
All Tailwind classes use design system aliases from tailwind.config.ts.

## Data Contract
const FEATURED_QUERY = `*[_type == "homepageData"][0].featuredProducts[]{
  productPromo,
  ...productRef->{
    _id,
    name,
    brand,
    displayPrice,
    image{asset->{url}}
  }
}`;

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