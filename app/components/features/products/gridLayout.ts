// Shared product-grid layout primitives — the single source of truth for how
// every product grid and its loading skeleton lay out (category pages, All
// Products, search results, wishlist, and the streaming chunk skeletons).
//
// From `sm` (640px) up, columns key off the grid's OWN width via the `products`
// gridTemplateColumns key (tailwind.config.ts): repeat(auto-fill, minmax(13.5rem,
// 1fr)). The grid is always a min-w-0 flex child / full-width block, so its box
// is already "viewport minus the fixed sidebar minus the gutter" — auto-fill
// then fits as many ~13.5rem cards as that real space allows, identically on the
// sidebar surfaces and the no-sidebar ones (search, wishlist).
//
// Only base + `sm:` are used here on purpose: this repo's compiled CSS emits the
// custom `xs` breakpoint AFTER `sm`/`md`/`lg`, so an `xs:`-prefixed column class
// would win the cascade at every desktop width and defeat auto-fill. The
// unprefixed `grid-cols-2` always loses to `sm:`, and nothing later matches
// `sm:`, so the layering is safe. (The screens-ordering bug itself is repo-wide
// and out of scope here — tracked separately.)
//
// For the cards to actually shrink to that 13.5rem track, every grid item
// (ProductCard root, skeleton item) carries `min-w-0` — without it a card's
// min-content width inflates the track and you get too few, too-wide columns.
//
// See issue sang-logium-dbu.
export const productGridClass =
  "grid gap-6 grid-cols-2 sm:grid-cols-products";
