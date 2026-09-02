# Visual & Design-System Audit — Sang Logium (source-only, 2026 standards)
_Generated 2026-09-02 by automated source audit. Code inspection only; zero doc reliance._

## Summary

The storefront has a genuinely strong, token-driven design system in `tailwind.config.ts`
(color tokens, a fluid type scale, `type-*` / `btn-*` / `card-*` / `input-*` component
classes, consistent 2/3/4px radius, defined shadows, focus-visible baked into every button
class). The homepage sections, catalogue PLP/PDP shells, product cards, auth forms and
static content pages are almost entirely on-system and look coherent.

The failure is concentrated and severe: an entire second, un-migrated "light theme in gray
and blue" survives in the **account area, order pages, error boundaries, the brand page,
the shared `Loader`, and a few UI components**. On a store whose `<body>` is `bg-brand-900`
(near-black), these render gray-on-black text, white full-screen overlays, and default
`text-blue-600 underline` links — visibly broken on the happy path once a user signs in.

Counts: **4 P0**, **7 P1**, **6 P2**. Biggest themes: (1) a whole un-themed light-mode
region on a dark store; (2) three parallel link/status-color idioms instead of one;
(3) invalid non-token color classes (`text-primary`/`text-secondary`/`text-caption`) that
silently no-op, including on every breadcrumb.

## P0 — a professional evaluator would visibly wince

### P0-1 Account area is an un-themed light-mode island (gray text on a near-black page)
- **Where:** `app/(store)/account/page.tsx:29,33,40-42,51-59`; `app/(store)/account/orders/page.tsx:28-65`; `app/(store)/account/orders/[orderNumber]/page.tsx:71-238` (pervasive `text-gray-500/600/700/800`, `border-gray-200`, `divide-gray-200`, `hover:bg-gray-50`); `app/(store)/account/addresses/page.tsx`; `app/(store)/account/addresses/AddressesClient.tsx:250,258-268`; `app/(store)/account/wishlist/page.tsx:43,46,57`
- **What:** The signed-in account pages use raw Tailwind palette literals (`text-gray-600`, `border-gray-200`) and bare headings (`text-2xl font-bold`) instead of the design tokens (`text-text-secondary`, `border-border-secondary`, `type-section-hed`). The store body is `bg-brand-900` with `text-text-body` (light), so gray-600 body copy, gray-200 borders and gray-100 image placeholders sit on black.
- **User-visible impact:** Order history, order detail, saved addresses and the account dashboard render with dim gray text that is near-invisible on the dark background, hairline borders that disappear, and headings in a different size/weight than the rest of the site. It reads like a half-finished admin panel bolted onto a premium store.
- **2026 standard:** One theme, one token set. A signed-in account section is styled identically to the storefront — same type scale, same surfaces, same borders.
- **Fix direction:** Replace every `gray-*`/`text-2xl font-bold` in `app/(store)/account/**` with `text-text-*` / `border-border-*` / `type-*` classes; wrap list/detail cards in `card-base`.

### P0-2 `Loader` paints a full white overlay with a blue spinner over dark pages
- **Where:** `app/components/common/Loader.tsx:11-19` — `absolute inset-0 ... bg-white`, `border-gray-200`, default `color = "border-t-blue-500"`, message text `text-black`
- **What:** The shared Suspense fallback is hard-coded to a white background, gray ring, blue accent and black text. It is used directly as the fallback on `app/(store)/basket/page.tsx:14` and elsewhere.
- **User-visible impact:** Navigating to the basket (and any other route that falls back to `Loader`) flashes a full-viewport white panel with a generic blue spinner on an otherwise black, gold-accented store — a jarring theme break on a core commerce path.
- **2026 standard:** Loading states inherit the page surface; spinner uses the brand/accent token; no color/scheme jump between skeleton and content.
- **Fix direction:** `bg-surface-page`/transparent, ring in `border-secondary`, accent in `accent-500`, text `text-text-secondary`; drop the blue default.

### P0-3 `brand/[slug]` is a raw placeholder page in a different visual language
- **Where:** `app/(store)/brand/[slug]/page.tsx:8-20`
- **What:** `bg-gray-100` page, `bg-white ... shadow-md` card, `text-4xl font-bold` heading, and it literally renders `` `${Brand}` `` immediately followed by the word `BRAND` with no separating space (`...join(" ")}` then `BRAND` on the next line → "SennheiserBRAND").
- **User-visible impact:** Any brand link resolves to a white card on light-gray, centered, with an oversized off-scale heading and a visible text bug — on a black storefront. Looks like scaffolding that shipped.
- **2026 standard:** Either a real branded landing (hero + filtered grid) on-theme, or route it to `/products?brand=…`; never a lorem-ipsum placeholder in the nav graph.
- **Fix direction:** Build the page on `max-w-catalogue` + `type-section-hed` + `ProductGrid`, or redirect; fix the missing space.

### P0-4 Error boundaries render an off-brand light theme
- **Where:** `app/error.tsx:13-27`; `app/global-error.tsx:15-33`; `app/checkout/error.tsx:9-24`; `app/(store)/product/[slug]/error.tsx:18-23`; `app/(store)/products/[...slug]/error.tsx:19-24`
- **What:** All error UIs use `bg-gray-50`, `text-gray-900/600/400`, and buttons in `bg-blue-600 hover:bg-blue-700` or `bg-black` — none of the `btn-*` classes or color tokens.
- **User-visible impact:** When something breaks (including checkout), the user is dropped onto a plain light-gray page with a stock blue button — no relationship to the store they were just in. Undermines trust exactly when trust matters.
- **2026 standard:** Error/empty/404 states are first-class, fully themed screens using the same buttons and surfaces as the rest of the app.
- **Fix direction:** Rebuild the five error files on `bg-surface-page` + `type-*` + `btn-primary`/`btn-secondary`.

## P1 — they would note it

### P1-1 Invalid non-token color classes that silently do nothing — including every breadcrumb
- **Where:** `app/components/ui/breadcrumbs/CategoryBreadcrumbs.tsx:49,57,67,74,78`; `app/(store)/product/[slug]/page.tsx:36,42,47` (`text-secondary`, `hover:text-primary`, `text-caption`, `text-primary`); `app/components/ui/QuantitySelector.tsx:43` (`text-primary`); `app/(store)/account/wishlist/page.tsx:46` (`text-secondary`); `app/components/features/checkout/CheckoutPanel.tsx:46` (`text-secondary`)
- **What:** The tokens are `text.primary` / `text.secondary` / `text.caption`, i.e. the classes are `text-text-primary` etc. `colors.secondary` is a nested scale with no `DEFAULT`, and there is no `primary`/`caption` color key at all, so `text-secondary`, `text-primary`, `text-caption` and their `hover:` variants generate **no CSS** and fall through to inherited color.
- **User-visible impact:** Category breadcrumbs and PDP breadcrumbs render in whatever color they inherit with no working hover; the "current page" crumb isn't visually distinguished; quantity value and a couple of empty/complete states lose their intended emphasis.
- **2026 standard:** Design-token classes resolve or the build warns; breadcrumbs have a clear current/link/separator hierarchy.
- **Fix direction:** Global find/replace to `text-text-primary` / `text-text-secondary` / `text-text-caption`.

### P1-2 Three competing link idioms
- **Where:** `text-blue-600 underline` — `app/(store)/account/page.tsx:51,54,57`, `account/orders/page.tsx:63`, `account/orders/[orderNumber]/page.tsx:74,171`, `account/wishlist/page.tsx:57`, `account/addresses/page.tsx`. `text-accent-500 underline underline-offset-4 hover:opacity-70` — `app/(store)/contact/page.tsx:32,46`. `text-text-accent underline hover:text-text-primary` — `sign-in/SignInForm.tsx:247,285`, `sign-up/SignUpForm.tsx:56,145`, `verify-email/VerifyEmailForm.tsx:36`.
- **What:** No shared link component/class; inline text links are styled three different ways (and one of them is a raw palette literal).
- **User-visible impact:** Inline links look and behave differently depending on which page you're on — blue browser-default-ish in account, gold with opacity fade on contact, gold with color swap in auth.
- **2026 standard:** One `link` / `.type-link` primitive (color token, underline offset, one hover behavior, focus-visible) used everywhere.
- **Fix direction:** Add a link component class to the `uiComponentsPlugin`; adopt it site-wide; delete the `text-blue-600` links.

### P1-3 Status/feedback colors: design tokens vs ad-hoc `red-*`
- **Where:** Token idiom (`border-error-500 bg-error-500/10 text-error-500 type-caption`) is used correctly in `AccountActions.client.tsx`, `AddressesClient.tsx`, `SignInForm.tsx`, `account/page.tsx:45`. Ad-hoc: `app/components/common/ErrorMessage.tsx:2-3` (`border-red-300 bg-red-50 text-red-600`); `app/components/features/checkout/CheckoutPanel.tsx:52-53` (`bg-red-50 border-red-200 text-red-800`); `app/components/features/newsletter/NewsletterSignup.client.tsx:62,65` (`text-brand-400` for success, `text-red-400` for error); `app/components/features/basket/BasketItem.tsx:97,161` + `dev/_showcase/BasketItemDisplay.tsx:24` (`hover:text-red-500/80`).
- **What:** Two systems for the same job. The ad-hoc ones use light-mode `red-50/red-800` fills that are wrong on the dark surface, and the newsletter uses a non-semantic `brand-400` to signal success.
- **User-visible impact:** The checkout error box (`bg-red-50` + `text-red-800`) is a pale-pink-on-near-white block on a dark checkout panel; newsletter "success" is indistinguishable from normal text.
- **2026 standard:** One semantic status treatment (`error`/`success`/`warning` tokens) for every inline alert.
- **Fix direction:** Route all three through a single `<Alert variant>` (or the existing `border-<sev>-500 bg-<sev>-500/10 text-<sev>-500` pattern); delete `ErrorMessage`'s bespoke styling.

### P1-4 Bare, off-scale headings outside the type system
- **Where:** `account/page.tsx:41`, `account/orders/page.tsx:29`, `account/orders/[orderNumber]/page.tsx:79`, `account/wishlist/page.tsx:43` (`text-2xl font-bold`); `brand/[slug]/page.tsx:10` (`text-4xl font-bold`); `app/components/ui/buttons/CTA.tsx:5-15` (`text-2xl ... lg:text-5xl`, `text-xl`, `text-lg` for portable-text h1/h2/p)
- **What:** Headings hand-sized with raw `text-2xl/4xl` + `font-bold` instead of `type-section-hed` / `type-section-sub`, so they don't match the fluid clamp-based scale used everywhere else and don't pick up the tuned letter-spacing/line-height.
- **User-visible impact:** Account page `<h1>`s are a visibly different size and tracking than the identical-purpose `<h1>` on `/about-us` or `/basket`.
- **Fix direction:** Swap to `type-section-hed` / `type-section-sub`; migrate `CTA.tsx` PortableText components to `type-*` (or delete — see P2-6).

### P1-5 `focus:outline-none` with no visible replacement
- **Where:** `app/components/ui/info-tool-tip/infoTooltip.tsx:35` (`focus:outline-none`, no ring added)
- **What:** The tooltip trigger button removes the focus outline and adds nothing back. (`CTA.tsx:37` also strips it but at least adds `focus:ring-2` — see P2.)
- **User-visible impact:** Keyboard users get no focus indicator on the info trigger; fails WCAG 2.4.7.
- **2026 standard:** Every interactive element has a visible `:focus-visible` state; the `btn-*` classes already do this correctly — the outliers don't.
- **Fix direction:** Remove `focus:outline-none` or pair it with a token `focus-visible` outline.

### P1-6 `infoTooltip` popover is a light-theme card
- **Where:** `app/components/ui/info-tool-tip/infoTooltip.tsx:35,47-60` — `text-gray-500/600/700`, `border-gray-300`, `bg-white`
- **What:** White popover, gray text/border, on the dark store.
- **User-visible impact:** A bright white box pops over dark UI wherever this tooltip is used.
- **Fix direction:** `bg-surface-elevated`, `border-border-secondary`, `text-text-*`.

### P1-7 Full-screen auth/utility pages use `min-h-screen` while the app is `h-dvh` / overflow-hidden
- **Where:** `app/(store)/sign-in/page.tsx:7` (`min-h-screen`); `app/(store)/brand/[slug]/page.tsx:8` (`min-h-dvh`); error pages `min-h-screen`. Compare `globals.css:37-43` (`html`/`body` are `h-dvh overflow-hidden`) and content pages that size to the scroll container.
- **What:** Inconsistent viewport-height strategy; `min-h-screen` inside an already-`overflow-hidden` `h-dvh` body can double-count the header and produce a dead scroll region on mobile.
- **User-visible impact:** Sign-in card can sit slightly off-center / clipped versus other centered pages.
- **Fix direction:** Standardize on one full-bleed centering wrapper that respects `--desktop-header-h` / `dvh`.

## P2 — polish

### P2-1 Button-class sprawl in the design system
- **Where:** `tailwind.config.ts:99-313` — `btn-primary`, `btn-cart`, `btn-product-add`, `btn-cart-large`, `btn-in-basket-large`, `btn-stepper`, `btn-stepper-sm`, `btn-secondary`, `btn-ghost` (9 classes).
- **What:** `btn-cart` and `btn-product-add` are near-identical "add to cart" buttons that differ mainly in `btn-product-add` using hard-coded `fontSize: "12px"`, `gap: "6px"`, `padding: "7px 10px"` instead of the theme spacing/`fontSize` tokens that `btn-cart` uses. Three "add" variants + two "large" variants is a lot of surface for one action.
- **Fix direction:** Collapse to `btn-primary` / `btn-accent` / `btn-secondary` / `btn-ghost` + a `size` modifier; make every value a `theme()` token.

### P2-2 Hard-coded pixel values inside `type-*` / component classes
- **Where:** `tailwind.config.ts` — `.type-product-brand` (`fontSize: "10px"`, `lineHeight: "14px"`, `letterSpacing: "0.08em"`), `.type-product-title` (`13px`), `.type-product-price` (`14px`), `.btn-product-add` (see P2-1), `.section-header-anchor` width `32px`.
- **What:** These bypass the `fontSize`/`spacing`/`letterSpacing` scales they sit next to (`tiny` is already `10px`, `small` is `12px`, `letterSpacing.editorial` exists).
- **Fix direction:** Reference the existing scale keys.

### P2-3 `.section-header-anchor` is defined twice, differently
- **Where:** `tailwind.config.ts:541-553` (component: `::before` 32px×1px, `gap` via flex) vs `app/globals.css:214-229` (`position: relative`, `padding-left: 1.25rem`, `::before` 0.75rem×2px, hard-coded `#D4AF37`).
- **What:** Two conflicting definitions of the same class; the CSS one hard-codes the accent hex instead of the token.
- **Fix direction:** Keep one; use `theme(colors.accent.500)`.

### P2-4 Raw hex literals in feature code
- **Where:** `app/components/features/filters/PriceRangeSlider.tsx:30-31` (`#D4AF37`, `#4A4948` with "accent-500 / secondary-700" comments); `app/(store)/dev/design-system/**` (many, but dev-only); `tailwind.config.ts:405` select-chevron data-URI derived from a token (acceptable).
- **What:** The slider re-declares token colors as hex because it needs them in JS. Understandable but drift-prone (the comment already has to explain which token it mirrors).
- **Fix direction:** Import from a shared TS token module, or read via CSS custom properties.

### P2-5 `text-white` / `bg-black` raw literals where a token exists
- **Where:** `AccountActions.client.tsx:359` (`bg-error-500 text-white`), `315`; `app/components/features/account/ExitButton.tsx:16` (`bg-black ... text-white hover:bg-gray-800`); `app/checkout/error.tsx:15` (`bg-black`).
- **What:** `secondary.900`/`brand.50` etc. exist; `bg-black`/`text-white` are unmanaged.
- **Fix direction:** Use `brand-50` / `surface` tokens.

### P2-6 Likely-dead component still carrying its own visual language
- **Where:** `app/components/ui/buttons/CTA.tsx` — no importers found in `app/`.
- **What:** Off-scale headings, `text-white`, `style={{ backgroundColor }}` from CMS, `marks.color` renders arbitrary `value.hex` inline — a whole escape hatch from the design system, apparently unused.
- **Fix direction:** Delete, or if it's used via Sanity Portable Text, bring it onto `btn-*` + `type-*` and drop arbitrary `hex`.

## Checked and OK

- `tailwind.config.ts`: coherent token layer — `brand`/`secondary`/`accent`/`success`/`error`/`warning` scales, semantic `surface` / `text` / `border` maps, fluid clamp type scale with tuned tracking, consistent 2/3/4px radius, named shadows.
- Every `btn-*` and `input-*` component class includes a proper `:focus-visible` outline with offset, plus `:disabled` handling.
- Homepage: `SectionHeader.tsx`, `AccessoryCard.tsx`, `IemCard.tsx`, `ProductCard.tsx` are fully token-driven (`card-product-dark`, `type-product-*`, `bg-surface-productImage`, `ProductBadge`) and visually consistent with each other.
- Catalogue PLP (`products/page.tsx`) and PDP (`product/[slug]/page.tsx`) shells use `max-w-catalogue`/`max-w-content`, consistent `px-4 md:px-8` gutters.
- Static content pages (`about-us`, `contact`, `faq`, and the policy pages) all go through `ContentLayout` / `ContentSection` — shared `type-section-hed` / `type-section-sub` / `type-body`, `border-border-secondary`, one link style.
- Auth forms (`SignInForm.tsx`, `SignUpForm.tsx`, `AccountActions.client.tsx` forms, `AddressesClient.tsx` forms) are on-system: `card-base`, `input-field`/`input-select`, `btn-primary`/`btn-secondary`, token status alerts, `type-caption` labels.
- Global CSS keeps the dark scrollbar treatment and `prefers-reduced-motion` fallbacks consistent.
