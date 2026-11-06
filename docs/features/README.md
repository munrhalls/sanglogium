# Feature map & UX reference

Read **before** exploring, not after — this answers "where does X live" and "what already went wrong here" without a grep session. Tech stack list lives in `README.md` (single copy, avoids drift).

## Feature map

- `catalogue`: build-time VFS catalogue (`data/catalogue-index.json`, read only by `adapters/catalogue-index/`) — headless CMS data pre-materialized at build time for sub-second navigation. See `features/catalogue/` and `docs/features/catalogue-architecture.md`.
- `product-filtering`: URL-driven filter/sort state, category vocabulary, Sanity GROQ query builder. Outside code uses `@/features/product-filtering` (client) or `@/features/product-filtering/server` (`getFilterPanel`, `getFilterPanelOver`, `getControlLabels`).
- `product-search`: header field, results view, `actions/fetchSearchSuggestionsAction.ts`. Search consumes filters only through `@/features/product-filtering` and draws the panel over its matched products via `getFilterPanelOver`.
- `products`: PDP, listing grids, `productType`/`brandType` schemas.
- `wishlist`: wishlist heart, its two Server Actions, page view, ids read.
- `basket`: client store `state/basketStore.ts`, product hydration via `adapters/sanity/`.
- `shipping`: courier rates, parcel rules, browser country detection.
- `address`: address type, TERYT/Google checks and suggestions.
- `checkout`: checkout steps, session, vendor-neutral payments (`adapters/stripe/` maps Stripe).
- `order`: order document (schema, ADR-002 placement transaction, guest-order merge, anonymisation).
- `profile`: user profile document (schema and every write).
- `auth`: sign-in/up UI and flows, session guards, purpose-named account-security functions.
- `account`: account pages and actions.
- `homepage`: storefront sections, data via `adapters/sanity/`.
- `shell`: store chrome (header, footer, navigation, drawers, content layout).
- `newsletter`: signup form and Resend subscription.
- `performance`: admin Lighthouse baseline report.

## Route/folder map

`app/` holds Next route files only: route groups `(store)` (public storefront), `(admin)`, `(studio)` (Sanity Studio), plus `checkout/` (pages) and `api/` (route handlers). Feature code lives in `features/<slice>/` per the archetype in `docs/organizational-pattern.md` section 2. `platform/` (`design`, `sanity`, `email`, `analytics`, `utils`) knows no slice; `studio/` collects slice-owned CMS schemas; `data/` holds generated data.

## UX reference docs — read before exploring

- Desktop layout cramped/short on vertical room → `docs/features/vertical-space-lg-touch.md` (the `lg-touch` breakpoint, the no-inheritance gotcha, the h-full-vs-aspect-ratio ownership gotcha, proven fixes) before touching spacing. `check-turn`'s review-gate warns on any sizing-class change under `features/shell/`, `platform/design/`, `features/*/ui/`.
- Homepage data fetching or section composition → `docs/features/homepage-structure.md` (which section owns what data/state).
- Header search, the mobile search sheet, or `/search` → `docs/features/search-ux.md` (surfaces, history + on-screen-keyboard contracts, combobox semantics).
- Product images, the grid, chunk streaming or the blur-to-sharp reveal → the reveal is an inline script running before hydration, on purpose: `features/products/ui/card/ImageRevealScript.tsx` + client companion `ImageReveal.tsx` + `reveal.module.css` + `ProductImage.tsx`. The invariants live in that file's header comment; why and the failed attempts: `_project/AI_LESSONS.md` L02, L06, L07, L11.
