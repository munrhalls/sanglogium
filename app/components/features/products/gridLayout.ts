// Shared product-grid layout primitives — the single source of truth for how
// every product grid and its loading skeleton lay out (category pages, All
// Products, search results, wishlist, and the streaming chunk skeletons).
//
// From `sm` up, columns key off the grid's OWN width via the `products`
// gridTemplateColumns key (tailwind.config.ts): repeat(auto-fill, minmax(15rem,
// 1fr)). The grid is always a min-w-0 flex child / full-width block, so its box
// is already "viewport minus the fixed sidebar minus the gutter" — auto-fill
// then fits as many ~15rem cards as that real space allows, identically on the
// sidebar surfaces and the no-sidebar ones (search, wishlist).
//
// For the cards to actually shrink to that 15rem track, every grid item
// (ProductCard root, skeleton item) carries `min-w-0` — without it a card's
// min-content width inflates the track and you get too few, too-wide columns.
//
// Below `sm` the phone layout is fixed: 1-up, then 2-up from the `xs`
// breakpoint. See issue sang-logium-dbu.
export const productGridClass =
  "grid gap-6 grid-cols-1 xs:grid-cols-2 sm:grid-cols-products";
