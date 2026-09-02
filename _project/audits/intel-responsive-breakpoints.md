# Responsive & Breakpoint Audit — Sang Logium (source-only, 2026 standards)
_Generated 2026-09-02 by automated source audit. Code inspection only; zero doc reliance. No runtime rendering performed — findings are code-level breakpoint risks._

## Summary
3 P0, 6 P1, 7 P2. Verdict: the grid system (product grid `auto-fill`, homepage galleries) is genuinely mobile-first and solid, and the app shell correctly uses `h-dvh` + internal scroll. The weak layer is **interactive-control sizing and fixed-bar handling on small screens**: the primary mobile bottom nav, the price/qty steppers on cards, and pagination all ship sub-44px hit areas, and nothing in the codebase accounts for iOS safe-area insets despite three `fixed`/`sticky` bars. Worst components: `ActionBar.tsx` (mobile nav), `Pagination.tsx`, `FilterSidebar.tsx`, PDP breadcrumb.

## P0 — a professional evaluator would visibly wince

### P0-1 Primary mobile bottom nav: ~20px hit targets in a 44px bar, no safe-area inset
- **Where:** `app/components/layout/navigation/ActionBar.tsx:26` (`ActionButtons` row), `:29-125` (each button/Link), `:132-138` (`h-[var(--mobile-menu-h)]` = 44px, defined `app/globals.css:7`)
- **What:** Every nav control (`Menu`, `Search`, `Account`/`Sign In`/`Sign Up`, `Basket`) is a `flex flex-col items-center` wrapper around a `h-5 w-5` (20px) icon with a permanently-hidden label (`sr-only ... hidden sm:inline-block`). No `min-h`/`min-w`/padding, so the actual tap target is ~20px tall. The containing bar is only 44px, and there is no `padding-bottom: env(safe-area-inset-bottom)`, so on notched iOS the ~34px home indicator overlays the bar. Breaks at every mobile width (320–430).
- **User-visible impact:** Mis-taps between adjacent nav icons; bottom row of icons sits under / is partially obscured by the iOS home indicator and hard to hit.
- **2026 standard:** Bottom-nav items are ≥44x44 tap targets; the bar reserves `env(safe-area-inset-bottom)` and is typically 56–64px tall on mobile.
- **Fix direction:** Give each control `min-h-11 min-w-11` (or `p-2`), raise `--mobile-menu-h` and add `pb-[env(safe-area-inset-bottom)]` to the bar (and matching `--mobile-menu-h` padding on `<main>`).

### P0-2 Pagination row overflows horizontally on phones
- **Where:** `app/components/features/products/Pagination.tsx:99` (`flex items-center justify-center gap-2`, no `flex-wrap`, no `overflow-x` container), buttons `:84` (`h-10 min-w-10 px-3`)
- **What:** The control renders `Prev` + up to ~7 page tokens + `Next` in a single non-wrapping flex row. "Prev" (~64px) + "Next" (~64px) + 5×(40px+8px gap) ≈ 370px, exceeding 320/360/375 viewports. The row has no `overflow-x-auto`, and the PLP content column sits inside `<main class="overflow-x-hidden">` (`app/(store)/layout.tsx:60`), so the overflow is **clipped**, not scrollable.
- **User-visible impact:** "Next" button (and higher page numbers) are cut off / unreachable on any phone when there are 4+ pages.
- **2026 standard:** Pagination wraps or scrolls on narrow screens; primary Prev/Next stay reachable at 320px.
- **Fix direction:** Add `flex-wrap` (or a compact mobile variant: Prev / "Page X of Y" / Next), and bump buttons to `h-11 min-w-11`.

### P0-3 PDP breadcrumb: full product name, no wrap or truncation
- **Where:** `app/(store)/product/[slug]/page.tsx:34` (`<ol class="flex items-center gap-2">`), `:47-49` last `<li>` renders `{product.name}` verbatim with no `truncate`/`line-clamp`/`min-w-0`
- **What:** `Home / Products / <full product name>` on one non-wrapping flex line. Premium audio product names run long (brand + model + descriptor). At 320–414px the row exceeds the viewport and is clipped by `main`'s `overflow-x-hidden`.
- **User-visible impact:** Breadcrumb trail is visually chopped mid-word with no ellipsis on every phone for most products.
- **2026 standard:** Breadcrumbs truncate the current-page crumb with an ellipsis (or collapse to `… / current`) and never cause horizontal overflow.
- **Fix direction:** `min-w-0` on the `<ol>`, `truncate`/`line-clamp-1` + `min-w-0` on the final `<li>`, or hide intermediate crumbs below `sm`.

## P1 — they would note it

### P1-1 Desktop filter sidebar: `max-h-screen` sticky inside a shorter scroll container
- **Where:** `app/components/features/filters/FilterSidebar.tsx:188` (`sticky top-0 pt-6 max-h-screen overflow-y-auto`)
- **What:** The sidebar is `sticky top-0` inside `<main>`, whose visible height is `100dvh − header(64) − catalogue-nav(52)` ≈ viewport − 116px. Its own `max-h-screen` is `100vh`, so when the brand list is long the element extends ~116px below the fold; its internal `overflow-y-auto` cannot reveal that bottom slice because the scroll thumb / last options are off-screen. Visible ≥1024px, worst on short/laptop viewports (the `lg-touch` raw query, `max-height:850px`).
- **User-visible impact:** Last brand checkboxes + any control at the bottom of a long filter list are unreachable on laptops.
- **2026 standard:** Sticky sidebars cap height to the *visible* area: `max-h-[calc(100dvh-var(--desktop-header-h)-var(--desktop-catalogue-nav-h))]`.
- **Fix direction:** Replace `max-h-screen` with the calc above (tokens already exist in `globals.css`).

### P1-2 Card price/qty stepper is a 36px control — below 44px touch target
- **Where:** `tailwind.config.ts:244` (`.btn-stepper-sm` = `spacing.9` = 36px), applied via `app/components/features/basket/BasketControls.tsx:42` when `size="sm"`; used by `app/components/features/products/ProductCard.tsx:73-81`, `app/components/features/homepage/iems-gallery/IemCard.tsx`, `app/components/features/homepage/accessories/AccessoryCard.tsx`
- **What:** After "Add", the − / N / + stepper cells render at 36×36 on the product grid and homepage cards — the exact surface used most on mobile. `fullWidth` fixes horizontal fit but not the 36px height.
- **User-visible impact:** Fiddly quantity tapping on the grid at 320–430px; easy to hit the wrong cell.
- **2026 standard:** 44×44 minimum for all tappable controls; `sm` sizing is a desktop-density affordance, not mobile.
- **Fix direction:** Make `btn-stepper-sm` ≥44px on coarse pointers (`pointer-coarse:` variant already defined in config), or drop `size="sm"` on the card footers.

### P1-3 No `env(safe-area-inset-*)` anywhere in the codebase
- **Where:** `app/components/layout/header/Header.tsx:14` (`sticky top-0`), `app/components/layout/navigation/ActionBar.tsx:132` (`fixed bottom-0`), `app/checkout/shipping/ShippingPageClient.tsx:247` (`md:hidden fixed bottom-0`)
- **What:** Grep for `safe-area` / `env(` across `app/**` returns nothing. All three fixed/sticky bars butt against the physical viewport edge.
- **User-visible impact:** On notched/rounded phones the sticky header crowds the status bar and the two bottom bars sit under the home indicator; the checkout "Przejdź do płatności" CTA is partly obscured.
- **2026 standard:** `padding-top: env(safe-area-inset-top)` on top-fixed chrome, `padding-bottom: env(safe-area-inset-bottom)` on bottom-fixed chrome, plus `viewport-fit=cover`.
- **Fix direction:** Add the insets to the three bars and to `<main>`'s bottom padding.

### P1-4 Checkout mobile sticky CTA can overlap the last form field
- **Where:** `app/checkout/shipping/ShippingPageClient.tsx:247` (`fixed bottom-0 ... py-3` bar with a `btn-cart-large` inside); no compensating `padding-bottom` on the scrolling form container
- **What:** The `md:hidden` fixed CTA (~64px+) overlays page content. Nothing in the visible slice adds bottom padding equal to the bar height, so the final address/shipping field and any inline error sit behind the button on small screens.
- **User-visible impact:** Last field / validation message hidden behind the CTA on phones; user can't see what they're typing.
- **2026 standard:** Reserve scroll padding equal to the fixed bar (`pb-[calc(bar-height+env(safe-area-inset-bottom))]`).
- **Fix direction:** Add that bottom padding to the form wrapper.

### P1-5 ImageGallery zoom modal uses `vh`, close button 40px, no safe-area
- **Where:** `app/components/features/products/ImageGallery.tsx:123` (`w-full h-full p-4` on a `fixed inset-0`), `:125-129` close button `w-10 h-10` at `top-4 right-4`, `:147` / `:156` image `max-w-[90vw] max-h-[90vh]`
- **What:** Fixed full-screen overlay; the only dismiss control is a 40px button pinned to `top-4 right-4` with no `env(safe-area-inset-top)`, so on notched phones it sits behind the status bar / camera cutout. `max-h-[90vh]` (static `vh`) also mis-sizes vs. the dynamic mobile viewport.
- **User-visible impact:** Hard-to-reach / partially-covered close button on phones; image can exceed the visible area.
- **2026 standard:** `dvh` units, ≥44px dismiss target, `top-[calc(1rem+env(safe-area-inset-top))]`.
- **Fix direction:** Swap `vh`→`dvh`, enlarge the button, add the top inset.

### P1-6 `<main>` reserves 44px bottom padding on desktop where the mobile bar doesn't exist
- **Where:** `app/(store)/layout.tsx:63` (`pb-[var(--mobile-menu-h)]` unconditionally), `ActionBar.tsx:136` hides the bar at `lg-touch`/`lg-desktop`, but `--mobile-menu-h` stays `44px` (`globals.css:8`)
- **What:** On ≥1024px the bottom nav is `display:none` yet `<main>` still pads 44px, leaving a dead gap above the footer.
- **User-visible impact:** Minor persistent empty strip / footer never reaches viewport bottom on desktop.
- **2026 standard:** Layout padding tracks the element that's actually present at that breakpoint.
- **Fix direction:** `pb-[var(--mobile-menu-h)] lg-desktop:pb-0 lg-touch:pb-0`, or zero the var in the desktop media block.

## P2 — polish

### P2-1 `CatalogueNavbar` uses the disabled `container` class
- **Where:** `app/components/layout/catalogue/CatalogueNavbar.tsx:27` (`container mx-auto`); `tailwind.config.ts:692` sets `corePlugins: { container: false }`
- **What:** `container` compiles to nothing, so the nav's inner wrapper has no max-width and `mx-auto` is a no-op. Only cosmetic today (`justify-center`), but on `3xl`/`1920`+ the nav items are centered in an unbounded row rather than aligned to the `max-w-content`/`max-w-catalogue` page gutter.
- **Fix direction:** Replace with `mx-auto w-full max-w-content px-4 md:px-8` to match every other top-level wrapper.

### P2-2 Hero `min-h-[80vh]` mixes static `vh` with the `dvh` height calc
- **Where:** `app/components/features/homepage/hero/Hero.tsx:60-62` (`h-[calc(100dvh-...)]` … `min-h-[80vh]`)
- **What:** The primary height is `dvh`-based (correct), but the floor is `80vh` (large-viewport static). On mobile with the URL bar shown, the `min-h` can make the hero taller than the scroll viewport, producing an initial scroll jump.
- **Fix direction:** `min-h-[80svh]`.

### P2-3 `NewestRelease` fixed `min-h-[Npx]` owns layout on the media column
- **Where:** `app/components/features/homepage/newest-release/NewestRelease.tsx:28` (`min-h-[400px] lg:min-h-[260px] xl:min-h-[360px]`), `:31` (`min-h-[280px]` on the image column) alongside `lg:aspect-[4/3] xl:aspect-auto`
- **What:** Pixel `min-h` on the flex row and image column competes with the `aspect-[4/3]` on the same element (the repo's documented `h-full`-vs-explicit-height ownership hazard). Between `lg` and `xl` the image box is driven by both `min-h-[260px]` and `aspect-[4/3]`.
- **Fix direction:** Let the image column's height come from `aspect-*` only; drop the pixel `min-h` on the media side.

### P2-4 Homepage decorative rings positioned with large negative offsets inside `overflow-hidden`
- **Where:** `app/components/features/homepage/iems-gallery/IemsGallery.tsx:19-21`, `dacs/Dacs.tsx:41-47`, `featured/Featured.tsx:106-114`, `product-spotlight-*/*.tsx`, `accessories/Accessories.tsx:23-25` (`absolute -top-[10%] -right-[10%] w-[120%] h-[120%]` etc.)
- **What:** These rely on an ancestor `overflow-hidden` to clip `w-[120%]` / `-right-[20%]` layers. Spot-checked ancestors do clip, but this pattern is one missing `overflow-hidden` away from a full-page horizontal scrollbar; worth a consistency pass since it's copy-pasted across ~7 sections.
- **Fix direction:** Confirm every section root has `overflow-hidden` (or `overflow-x-clip`); consider a shared wrapper component.

### P2-5 `QuantitySelector` ships 32px / 40px targets (currently dormant)
- **Where:** `app/components/ui/QuantitySelector.tsx:27` (`sm` = `w-8 h-8` = 32px, `md` = `w-10 h-10` = 40px); imported at `app/components/features/products/ProductInfo.tsx:8` but not rendered in the component body
- **What:** Both size variants are below 44px. Not user-facing right now (PDP uses `BasketControls`), but it's a reusable primitive that will regress a surface if picked up.
- **Fix direction:** Raise to `h-11 w-11` (coarse pointer at minimum) or delete the unused import + component.

### P2-6 Footer social icons are 32px non-interactive `div`s
- **Where:** `app/components/layout/footer/Footer.tsx:62-73` (`SocialIcon`: `h-8 w-8` `div` with `aria-label` but no `href`/`button`)
- **What:** 32px and not actually focusable/clickable. If they become real links they'd fail the 44px target.
- **Fix direction:** When wiring them up, wrap in a `≥44px` `<a>` with padding.

### P2-7 `xs` (475px) breakpoint barely used and reportedly mis-orders in compiled CSS
- **Where:** `tailwind.config.ts:577` defines `xs`; `app/components/features/products/gridLayout.ts:11-17` documents that `xs:` classes lose the cascade to `sm:`/`md:`/`lg:`; only live use is `app/components/layout/catalogue/details/DetailSection.tsx:29` (`xs:max-w-[320px] max-w-[280px]`)
- **What:** A custom breakpoint that authors are warned off using is a footgun — future `xs:` layout classes may silently not apply at the intended width.
- **Fix direction:** Either remove `xs` or fix the `screens` ordering so it sits between base and `sm`.

## Checked and OK
- **App shell height model:** `html`/`body` use `h-dvh overflow-hidden` with `<main>` as the internal scroll region (`globals.css:37-43`, `app/(store)/layout.tsx:41,57-64`) — correct dynamic-viewport handling, no `h-screen` on scrollable content.
- **Product grid:** `grid-cols-2 sm:grid-cols-products` (`gridLayout.ts:29`) with `auto-fill, minmax(13.5rem, 1fr)` and `min-w-0` on every card (`ProductCard.tsx:34-36`) — genuine mobile-first, container-driven columns, no fixed column count that breaks at a width.
- **Homepage galleries:** `IemsGallery.tsx:27` (`grid-cols-2 md:grid-cols-3 lg:grid-cols-4`) and the spotlight sections (`grid-cols-1 md:grid-cols-2`) all carry responsive column variants.
- **PLP filter adaptation:** desktop `FilterSidebar` is `hidden lg-touch:block lg-desktop:block`; below that a `MobileFilterBar.tsx` bottom-sheet drawer (`vaul`) renders the identical `FilterControls` — the sidebar does collapse/adapt.
- **Specifications table:** wrapped in `overflow-x-auto` (`ProductDetail.tsx:35`).
- **Related products / thumbnail strip:** horizontal carousels use `flex overflow-x-auto` with `flex-shrink-0` items (`RelatedProducts.tsx:41-46`, `ImageGallery.tsx:78`) — no overflow leak.
- **Fluid type:** `tailwind.config.ts:606-641` — headline/display scales use `clamp()`; Hero re-clamps inline. No fixed-px headline sizing that fails to scale.
- **Card titles:** `line-clamp-3 min-h-[3.9em] sm:line-clamp-2 sm:min-h-9` (`ProductCard.tsx:64`), `break-words` on the PDP `<h1>` (`ProductInfo.tsx:82`) — text clamps/wraps rather than overflowing.
- **CheckoutStepper:** mobile hides step labels, connectors shrink `w-8 lg:w-16`; 4 icons + connectors fit 320px (`CheckoutStepper.tsx:26-66`).
- **MobileFilterBar / MobileSortButton drawers:** `max-h-[85vh]` bottom sheets with internal `overflow-y-auto` and `min-h-0` (`MobileFilterBar.tsx:62,83`) — correct flex-scroll containment.
