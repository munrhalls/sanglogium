# Cross-Browser & Cross-Device Audit — Sang Logium (source-only, 2026 standards)
_Generated 2026-09-02 by automated source audit. Code inspection only; no browsers run — findings are source-evident risks._

## Summary

3 P0, 4 P1, 6 P2. Verdict: the CSS foundation is modern (`dvh` app shell, no `backdrop-filter`, reduced-motion honored, 16px inputs everywhere) but **every fixed/sticky bottom bar in the app ignores `env(safe-area-inset-bottom)`** — the global mobile nav and both checkout CTAs.

Biggest theme: iOS Safari home-indicator collision on `position: fixed; bottom: 0` bars. Secondary theme: `vh` used as a fallback/secondary unit in bottom sheets, the hero, and the zoom modal where `dvh`/`svh` is now expected.

Most at risk engine: **Safari iOS** (notch / home indicator / large-vs-small viewport). Chrome Android is a distant second (address-bar resize on the same `vh` spots). Firefox is only exposed on `:has()` and `text-wrap` graceful-degradation points.

## P0 — a professional evaluator would visibly wince

### P0-1 Global mobile bottom nav has no safe-area padding
- **Where:** `app/components/layout/navigation/ActionBar.tsx:132-138` (bar), `app/(store)/layout.tsx:62` (content spacer)
- **Engine(s):** Safari iOS
- **What:** The bottom action bar is `fixed bottom-0 left-0 right-0` with a hard `h-[var(--mobile-menu-h)]` (44px) and no `padding-bottom: env(safe-area-inset-bottom)`. The page content reserves only `pb-[var(--mobile-menu-h)]` (44px), also with no safe-area term.
- **User-visible impact:** On every iPhone with a home indicator the ~34px indicator zone overlaps the lower half of the 44px bar. The 20px icons (Menu / Search / Account / Basket) sit under the indicator, tap targets are cut, and the bar reads as clipped on the site's primary navigation — present on every storefront page.
- **2026 standard:** `padding-bottom: env(safe-area-inset-bottom)` on the fixed bar; add the same term to the content spacer (`calc(var(--mobile-menu-h) + env(safe-area-inset-bottom))`); `viewport-fit=cover` must be set for `env()` to be non-zero.
- **Fix direction:** Add safe-area padding to the bar and to `(store)/layout.tsx` bottom spacer; grow the bar's effective height accordingly.

### P0-2 Checkout mobile sticky Pay bar has no safe-area padding
- **Where:** `app/checkout/payment/PaymentForm.client.tsx:276-278`
- **Engine(s):** Safari iOS
- **What:** `fixed bottom-0 left-0 w-full ... px-4 py-3` wrapping the primary Pay button, no `env(safe-area-inset-bottom)`. Checkout has no bottom nav (`app/checkout/layout.tsx`) so nothing else offsets it. The in-card spacer is a fixed `pb-28` (line 213) that also has no safe-area term.
- **User-visible impact:** The bottom ~20-34px of the "Pay · {total}" button is drawn into / behind the iOS home indicator. The single most important button in the funnel looks clipped and its lower tap region fights the system swipe-up gesture.
- **2026 standard:** `padding-bottom: calc(0.75rem + env(safe-area-inset-bottom))` on the bar; matching term on the `pb-28` content spacer.
- **Fix direction:** One safe-area padding utility on the sticky wrapper; bump the scroll spacer.

### P0-3 Shipping-step mobile sticky CTA has no safe-area padding
- **Where:** `app/checkout/shipping/ShippingPageClient.tsx:247`; skeleton mirrors it at `app/checkout/shipping/loading.tsx:53`
- **Engine(s):** Safari iOS
- **What:** `md:hidden fixed bottom-0 left-0 w-full ... px-4 py-3`, no `env(safe-area-inset-bottom)`. Content spacer is a fixed `pb-28` (line 94).
- **User-visible impact:** "Przejdź do płatności" button clipped behind the home indicator on iPhone, same as P0-2. Same defect duplicated in the loading skeleton so it flashes clipped too.
- **2026 standard:** safe-area-inset-bottom padding on the fixed bar and the skeleton copy.
- **Fix direction:** Same one-line padding fix as P0-2, applied in both files.

## P1 — they would note it

### P1-1 Mobile filter / sort bottom sheets use `85vh` and no safe-area
- **Where:** `app/components/features/filters/MobileFilterBar.tsx:62,83`; `app/components/features/filters/MobileSortButton.tsx:41`
- **Engine(s):** Safari iOS, Chrome Android
- **What:** `Drawer.Content` is `fixed inset-x-0 bottom-0 ... max-h-[85vh]` with the scroll body ending in `pb-8`. `vh` resolves to the **large** viewport on iOS, so 85vh can exceed the visible area when the address bar is shown; there is no `env(safe-area-inset-bottom)` on the sheet.
- **User-visible impact:** The last filter rows and the sheet's bottom padding can sit under the address bar / home indicator; the sheet can feel taller than the screen on first open before the toolbar collapses.
- **2026 standard:** `max-h-[85dvh]` (or `svh`), plus `padding-bottom: env(safe-area-inset-bottom)` on the scroll body.
- **Fix direction:** Swap `vh`→`dvh` on both sheets; add safe-area padding to the scroll container.

### P1-2 Hero uses `vh` as its min-height and top-padding fallback
- **Where:** `app/components/features/homepage/hero/Hero.tsx:60-63` (`min-h-[80vh]`), `:89` (`lg:pt-[22vh]`)
- **Engine(s):** Safari iOS, Chrome Android
- **What:** Primary sizing is correctly `h-[calc(100dvh - headers)]`, but `min-h-[80vh]` overrides it upward on short viewports, and `vh` on iOS = large viewport. `pt-[22vh]` compounds it on desktop-height breakpoints.
- **User-visible impact:** When the iOS address bar is visible the hero can be forced ~80px taller than the real viewport, pushing the CTA button below the fold on the landing screen; slight vertical jump as the toolbar collapses.
- **2026 standard:** `min-h-[80svh]` (small viewport) so the floor never exceeds what is visible; `dvh`/`svh` for the padding.
- **Fix direction:** `80vh`→`80svh`, `22vh`→`22dvh` or a fixed rem.

### P1-3 Persistent `will-change: transform` on many always-animating layers
- **Where:** `app/components/features/homepage/dacs/Dacs.tsx:38-48`; `.../featured/Featured.tsx:102-115`; `.../product-spotlight-1/ProductSpotlight1.tsx:67-70`; `-2/ProductSpotlight2.tsx:61-64`; `-3/ProductSpotlight3.tsx:115-121`; `app/components/layout/carousel/CarouselTrack.tsx:85`
- **Engine(s):** Safari iOS, Chrome Android
- **What:** Each homepage section stacks 4-5 fractal-ring `div`s that are both `will-change-transform` **and** running infinite CSS rotations. `will-change` is meant to be transient; here it permanently promotes ~20+ compositor layers on the homepage.
- **User-visible impact:** Sustained GPU memory / layer pressure — on older iPhones and mid-range Android this shows as scroll jank on the homepage and occasional layer fl! or blank-tile repaint. `prefers-reduced-motion` is handled for the animation but the layer promotion stays.
- **2026 standard:** Drop `will-change` from perpetually-animating elements (the browser already keeps an active-animation layer), or scope it to interaction only.
- **Fix direction:** Remove `will-change-transform` from the fractal-ring layers; keep it only on the carousel belt during drag.

### P1-4 PDP zoom modal sized in `vh`/`vw`, not `dvh`
- **Where:** `app/components/features/products/ImageGallery.tsx:116` (`fixed inset-0`), `:147,156` (`max-w-[90vw] max-h-[90vh]`)
- **Engine(s):** Safari iOS
- **What:** Full-screen zoom overlay caps the image at `90vh`. On iOS large-viewport `90vh` is bigger than the visible area while browser chrome is shown, and body-scroll lock is via `document.body.style.overflow` which the app shell's internal scroll container ignores.
- **User-visible impact:** Zoomed product image can be clipped top/bottom behind the toolbar; background can still scroll on iOS.
- **2026 standard:** `max-h-[90dvh]`; lock the actual scroll container, not `body`.
- **Fix direction:** `vh`→`dvh` on the modal image; scroll-lock the app-shell scroll element.

## P2 — polish

### P2-1 Desktop filter sidebar `max-h-screen` ignores the header offset
- **Where:** `app/components/features/filters/FilterSidebar.tsx:188` (`sticky top-0 ... max-h-screen overflow-y-auto`)
- **Engine(s):** all
- **What:** `max-h-screen` (100vh) on a sticky element that starts below a 64px header + 52px catalogue nav, so its scroll box is ~116px taller than the space it actually occupies.
- **User-visible impact:** On shorter desktop windows the bottom of the filter list is unreachable — it scrolls off under the viewport with no way to reach it.
- **2026 standard:** `max-h-[calc(100dvh - var(--desktop-header-h) - var(--desktop-catalogue-nav-h))]`.
- **Fix direction:** Subtract the sticky offset from the max-height.

### P2-2 `text-wrap: balance` / `pretty` with no fallback
- **Where:** `app/components/features/homepage/product-spotlight-1/ProductSpotlight1.tsx:86-87`, `-2:78-79`, `-3:142-144`; `app/components/layout/content/ContentLayout.tsx:31,54`; `app/(store)/faq/page.tsx:72`
- **Engine(s):** Firefox < 121, older Safari
- **What:** `text-balance` / `text-pretty` are the only line-breaking hints on these headings/paragraphs.
- **User-visible impact:** Acceptable degradation — unsupported engines fall back to normal wrapping (slightly less even headline ragging). Noted for completeness, not a defect.
- **Fix direction:** None required; keep as progressive enhancement.

### P2-3 Image-reveal placeholder relies solely on `:has()`
- **Where:** `app/components/features/products/reveal.module.css:13` (`.wrap:has(img[data-shown]) .lqip { opacity: 0 }`)
- **Engine(s):** Firefox < 121
- **What:** The blurred LQIP layer is hidden only by a `:has()` selector once the real image loads.
- **User-visible impact:** On engines without `:has()` the LQIP stays painted underneath the real (opaque, `object-contain`) image — mostly hidden, but a blurred halo can show around transparent PNG product shots.
- **2026 standard:** back the reveal with a JS class toggle on `.wrap` in addition to the `:has()` hook.
- **Fix direction:** Have `ImageRevealScript` also set a class on the wrapper, key the `.lqip` rule off that too.

### P2-4 Tap-highlight suppressed only on `<button>`, not links
- **Where:** `app/globals.css:48` (`button { -webkit-tap-highlight-color: transparent }`)
- **Engine(s):** Chrome Android, Safari iOS
- **What:** Custom tappable elements built as `<Link>`/`<a>` (bottom-nav items in `ActionBar.tsx:71-125`, product-card links, carousel slides) are not covered.
- **User-visible impact:** Grey/blue native tap flash on the bottom-nav icons and product cards — inconsistent with the buttons, looks unpolished on Android.
- **2026 standard:** `a, button, [role="button"] { -webkit-tap-highlight-color: transparent }`.
- **Fix direction:** Widen the selector in `globals.css`.

### P2-5 `100dvh` app shell with no `svh` guard for keyboard-open on Android
- **Where:** `app/globals.css:37-43` (`html`/`body` `h-dvh overflow-hidden`), `app/(store)/layout.tsx:41`
- **Engine(s):** Chrome Android
- **What:** The whole shell is `h-dvh; overflow:hidden`. When the soft keyboard opens on Android (e.g. mobile search overlay, `SearchField.tsx:202` `fixed inset-0`), `dvh` does not shrink for the keyboard, so the fixed overlay's lower content can be covered by the keyboard with no scroll escape (`overflow:hidden` on the ancestor).
- **User-visible impact:** In the mobile search overlay with results open, the last autocomplete rows can be hidden behind the keyboard on some Android builds.
- **2026 standard:** allow the overlay's own scroll region to use `svh`, or rely on `interactive-widget=resizes-content` in the viewport meta.
- **Fix direction:** Give the search overlay panel an explicit `max-h`/scroll in `svh`, or set the viewport `interactive-widget` hint.

### P2-6 `overflow-x-auto` carousels + `position: sticky` header interaction
- **Where:** `app/components/layout/catalogue/CatalogueCarousel.tsx:26` (`snap-x snap-mandatory overflow-x-auto`), `app/components/features/products/RelatedProducts.tsx:41`
- **Engine(s):** Safari iOS
- **What:** Horizontal scroll-snap containers are fine on 2026 baselines, but they sit inside the `overflow: hidden` app shell alongside a `position: sticky` header (`Header.tsx:14`). Sticky-inside-scroll-container is the known iOS caveat — here the header is sticky relative to the shell, not these carousels, so it is OK, but any future move of a sticky element into these tracks would break on iOS.
- **User-visible impact:** None today; flagged as a latent constraint.
- **Fix direction:** Keep sticky elements out of the horizontal-scroll tracks.

## Checked and OK

- **iOS focus-zoom:** every text input resolves to 16px. The design-system `input-field` / `input-base` / `input-select` set `fontSize: theme("fontSize.body")` = 16px (`tailwind.config.ts:346-424,631`); the header search inputs use `text-body` (16px) (`SearchField.tsx:249,338`); the 2FA input is `type="text" inputMode="numeric"` not `type="number"` (`SignInForm.tsx:185-195`). No `text-sm`/`text-xs` on any real `<input>`.
- **Viewport units for full-height:** the app shell and hero use `dvh` (`globals.css:37-43`, `(store)/layout.tsx:41`, `checkout/layout.tsx:20`, `Hero.tsx:60-61`), not `100vh`/`h-screen`. Remaining `vh` usages are the P1/P2 items above.
- **backdrop-filter:** none in the codebase. The mobile search overlay, cart/menu drawers and filter sheets use solid fills (`bg-surface-elevated`, `bg-black/40`, `bg-black/10`) — no `-webkit-backdrop-filter` fallback gap to worry about (`SearchField.tsx:203`, `DrawersManager.tsx:24-30`, `MobileFilterBar.tsx:61`).
- **Range input:** `PriceRangeSlider.tsx:41-45` ships explicit `::-webkit-slider-runnable-track` / `::-webkit-slider-thumb` resets, and `globals.css:82-86` adds the `-webkit-appearance:none` + `border-radius` the WebKit thumb needs. Cross-engine styled.
- **Select control:** `input-select` (`tailwind.config.ts:395-424`) sets `appearance: none` with an inline SVG chevron — normalized across Chrome/Safari/Firefox.
- **Custom scrollbars:** both `::-webkit-scrollbar` and Firefox `scrollbar-width`/`scrollbar-color` provided (`globals.css:52-74,95-102`).
- **Reduced motion:** honored for the fractal-ring animations (`globals.css:164-181`) and the product-image reveal (`reveal.module.css:57-62`). The carousel belt transition (`CarouselTrack.tsx:85`) is not guarded — minor, subsumed under P1-3.
- **Flex `gap`:** used widely; fine for 2026 Safari baselines (supported since Safari 14.1).
- **Drawers:** `vaul` (Radix Dialog primitive) handles focus trap, scroll-lock and `Escape` for the catalogue/menu drawer and the filter/sort sheets.
- **`aspect-ratio`:** used with a real fl<img>/next/image fill child inside every `aspect-[4/3]` / `aspect-square` box — degrades to intrinsic size on the (now irrelevant) engines without it.
