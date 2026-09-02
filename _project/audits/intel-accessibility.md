# Accessibility Audit — Sang Logium (source-only, WCAG 2.2 AA, 2026)
_Generated 2026-09-02 by automated source audit. Code inspection only; zero doc reliance._

## Summary

Source read across the storefront happy path: `app/(store)/layout.tsx`, header/nav, mobile bottom bar, search overlay, catalogue mega-nav, product card, PDP gallery, filters, basket, checkout address form, auth, newsletter, plus `tailwind.config.ts` and `app/globals.css`.

Verdict: not shippable against WCAG 2.2 AA. 6 P0, 12 P1, 9 P2.

Biggest themes: (1) no skip link and no `id` on `<main>`; (2) the mobile bottom navigation is a `<div>` of icon-only controls with **no accessible names** (the `sr-only` labels are also `hidden`); (3) the checkout address form has **zero label/input association**; (4) overlays (PDP zoom, mobile search dialog, desktop account menu, catalogue mega-nav) lack focus management / keyboard operability; (5) no live regions anywhere for cart updates or form errors; (6) `prefers-reduced-motion` is honored only for the decorative fractal rings, not the perpetually-animating product-spotlight orbits or any transition; (7) `error-700` text and `border-secondary` control borders fail contrast.

## P0 — a professional evaluator would visibly wince

### P0-1 No skip link; `<main>` has no target id
- **Where:** `app/(store)/layout.tsx:57` (the `<main>`), whole file (no skip anchor)
- **What:** There is no "Skip to content" link as the first focusable element, and `<main>` has no `id` to jump to. Every keyboard user tabs through the logo, full search field, catalogue mega-nav triggers, and account/cart on every page load.
- **User-visible impact:** Keyboard and switch users cannot bypass the ~10-15 repeated header controls to reach page content. Screen-reader users have landmark nav, but keyboard-only users do not.
- **2026 standard:** WCAG 2.4.1 Bypass Blocks (A). A skip link is table stakes for commerce.
- **Fix direction:** Add `<a href="#main-content" class="sr-only focus:not-sr-only …">Skip to content</a>` as the first child of `<body>`, and `id="main-content"` on `<main>`.

### P0-2 Mobile bottom-nav controls have no accessible name
- **Where:** `app/components/layout/navigation/ActionBar.tsx:29-50` (menu button), `:70-125` (account / sign-in / sign-up / basket links)
- **What:** Each control is icon-only. The text label is `<span className="sr-only mt-1 hidden text-xs … sm:inline-block">`. `hidden` sets `display:none`, which removes it from the accessibility tree, so below `sm` the label is exposed to nobody; at `sm+` it becomes a normal visible span (no longer `sr-only`). The hamburger `<button>` and the basket `<Link>` have no `aria-label` at all. Only the search toggle has its own `aria-label`.
- **User-visible impact:** A screen-reader user on mobile hears "button" / "link" with no name for Menu, Account, Sign In, Sign Up, and Basket — the entire primary mobile nav.
- **2026 standard:** WCAG 4.1.2 Name, Role, Value (A); 2.4.4 Link Purpose (A).
- **Fix direction:** Put `aria-label` on each button/link (`"Open menu"`, `"Basket"`, `"Account"`, …). Drop `hidden` from the label spans or replace the whole pattern with `aria-label`.

### P0-3 Checkout address form: no label is associated with its input
- **Where:** `app/checkout/address/AddressForm.tsx:136-242` — every field: First Name, Last Name, Phone, Country, City, Street, Number, Postal Code
- **What:** Labels are `<label className="type-caption mb-1.5 block">First Name</label>` with no `htmlFor`, and the following `<input>` / `<select>` has `name` but no `id`. Nothing ties them together.
- **User-visible impact:** Screen-reader users tabbing the checkout form hear "edit text" with no field name. Clicking the label text does not focus the field. This is the highest-stakes form on the site.
- **2026 standard:** WCAG 1.3.1 Info and Relationships (A), 3.3.2 Labels or Instructions (A), 4.1.2 (A).
- **Fix direction:** Add `id` to each control and `htmlFor` to its label (or wrap the control inside the `<label>`).

### P0-4 Desktop account menu is hover-only and keyboard-inoperable
- **Where:** `app/components/layout/header/NavbarActions.tsx:29-60`
- **What:** The "Account" trigger is a `<button>` with no `onClick`, no `aria-expanded`, no `aria-controls`. The dropdown (My Account, Orders, Sign Out) is shown purely by `group-hover:visible group-hover:opacity-100`. There is no focus-triggered reveal and no `:focus-within` fallback.
- **User-visible impact:** Keyboard-only and screen-reader users on desktop cannot open the account menu at all — Orders and Sign Out are unreachable from the header.
- **2026 standard:** WCAG 2.1.1 Keyboard (A), 4.1.2 (A), 1.4.13 Content on Hover or Focus (AA).
- **Fix direction:** Make it a real disclosure: toggle state on click, `aria-expanded`/`aria-controls`, reveal on focus-within, Escape to close, arrow-key movement (or a menu library).

### P0-5 Catalogue mega-nav: no ARIA state, no Escape, hidden panel stays focusable
- **Where:** `app/components/layout/catalogue/NavbarManager.tsx:56-134`
- **What:** Category trigger `<button>`s toggle a panel but expose no `aria-expanded` / `aria-controls`. When closed the panel is `opacity-0 pointer-events-none grid-rows-[0fr]` — visually collapsed but still in the DOM with `aria-hidden` unset, so its links remain in the tab order and pull focus off-screen. No Escape handler; no focus move into the panel on open.
- **User-visible impact:** Screen-reader users get no open/closed feedback; keyboard users tab into an invisible category panel; there is no way to dismiss it with the keyboard.
- **2026 standard:** WCAG 4.1.2 (A), 2.1.1 (A), 2.1.2 No Keyboard Trap-adjacent, 1.3.1 (A).
- **Fix direction:** Add `aria-expanded`/`aria-controls` to triggers; set `hidden`/`aria-hidden` (or `visibility:hidden`) on the closed panel so its links leave the tab order; add Escape-to-close and focus management.

### P0-6 `error-700` status text fails contrast on dark surfaces
- **Where:** token `error.700 = #991B1B` (`tailwind.config.ts:51`); used in `app/components/features/basket/BasketItem.tsx:62,130` ("Out of Stock") and `app/components/features/basket/BasketManager.tsx:191` (basket load error)
- **What:** `#991B1B` on `surface.card #1A1A19` computes to roughly 2.2:1; on `surface.elevated #2E2E2D` roughly 2.0:1. Both are well under 4.5:1 for this normal-size body text.
- **User-visible impact:** Low-vision users cannot reliably read the "Out of Stock" flag or the basket error message — content that changes a purchase decision.
- **2026 standard:** WCAG 1.4.3 Contrast (Minimum) (AA).
- **Fix direction:** Use `error-500 #EF4444` (or lighter) for text on dark; reserve `error-700` for borders/fills only.

## P1 — they would note it

### P1-1 PDP image-zoom modal has no focus management
- **Where:** `app/components/features/products/ImageGallery.tsx:111-163`
- **What:** `role="dialog" aria-modal="true"` and Escape + body-scroll-lock are wired, but focus is never moved into the dialog on open, there is no focus trap (Tab escapes to the page behind), and focus is not restored to the trigger on close.
- **Impact:** Screen-reader/keyboard users open the zoom and are still effectively on the page behind it; on close they are dumped at the top of the document.
- **2026 standard:** WCAG 2.4.3 Focus Order (A), 2.1.2 (A), APG dialog pattern.
- **Fix:** Move focus to the close button on open, trap Tab within the dialog, restore focus to the main-image button on close.

### P1-2 Mobile search dialog is not a focus trap
- **Where:** `app/components/layout/header/SearchField.tsx:195-293`
- **What:** `role="dialog" aria-modal="true"`; it autofocuses the input and restores focus to `#mobile-search-trigger` on close (good), and Escape works. But nothing constrains Tab — focus moves into the page behind the full-screen overlay.
- **Impact:** Keyboard/SR users tab out of the search dialog into hidden page content.
- **2026 standard:** WCAG 2.4.3 (A); aria-modal implies the trap.
- **Fix:** Trap focus within the dialog while `mobileExpanded`.

### P1-3 No live region for cart updates
- **Where:** `app/components/features/basket/BasketControls.tsx:85-134`, badge in `app/components/layout/header/NavbarActions.tsx:103-114` and `app/components/layout/navigation/ActionBar.tsx:117-121`
- **What:** "Add to Cart", increment/decrement, and remove all mutate the Zustand store with no `aria-live` announcement anywhere. The quantity is a bare `<span data-testid="quantity-display">`. The header/nav basket badge count is not in a live region.
- **Impact:** Screen-reader users get no confirmation that an item was added or that quantity changed — a core commerce interaction is silent.
- **2026 standard:** WCAG 4.1.3 Status Messages (AA).
- **Fix:** Add a visually-hidden `aria-live="polite"` region that announces "Added to basket" / "Quantity: N" / "Removed".

### P1-4 Stepper +/- buttons have no accessible name
- **Where:** `app/components/features/basket/BasketControls.tsx:102-120`
- **What:** The decrement button's content is a lone `−` (U+2212) and increment is `+`; no `aria-label`. The quantity `<span>` is not associated with them.
- **Impact:** Screen readers announce "minus, button" / "plus, button" with no product or purpose context; some voices skip punctuation-only labels entirely.
- **2026 standard:** WCAG 4.1.2 (A).
- **Fix:** `aria-label="Decrease quantity"` / `"Increase quantity"`; consider `aria-label` including the product name.

### P1-5 Form errors are not announced (address, sign-in, basket)
- **Where:** `app/checkout/address/AddressForm.tsx:123-127,259-269`; `app/(store)/sign-in/SignInForm.tsx:139-168`; `app/components/features/basket/BasketManager.tsx:188-194`
- **What:** Error containers are plain `<div><p>` with no `role="alert"` / `aria-live`, and (address form) are not referenced by `aria-describedby` from any field.
- **Impact:** After a failed submit, a screen-reader user gets no notification; focus stays on the button and the error is never read.
- **2026 standard:** WCAG 3.3.1 Error Identification (A), 4.1.3 (AA).
- **Fix:** `role="alert"` on the error container; on validation failure move focus to it or to the first invalid field; link field-level errors with `aria-describedby`.

### P1-6 `prefers-reduced-motion` not honored for the product-spotlight orbit animations
- **Where:** `app/globals.css:140-181` — `.spotlight-whirl`, `.spotlight-orbit-1..3` run `fractal-cw/ccw` infinitely; the `@media (prefers-reduced-motion: reduce)` block at `:164` only lists `.fractal-spin-*` / `.fractal-depth-*`, not the spotlight classes.
- **Impact:** Users with vestibular disorders and `reduce` set still get continuous large-area rotation on the homepage spotlight sections.
- **2026 standard:** WCAG 2.3.3 Animation from Interactions (AAA) is AAA, but 2.2.2 Pause/Stop/Hide (A) applies to auto-playing motion that lasts >5s with no pause control.
- **Fix:** Add the `.spotlight-*` classes to the reduced-motion `animation: none` list, or provide a pause control.

### P1-7 No pause/stop control for perpetual homepage animation
- **Where:** `app/globals.css:122-147` (fractal + spotlight spins, 151-601s loops); `app/(store)/page.tsx` composition
- **What:** Multiple infinite background animations auto-play with no mechanism to pause them, and (P1-6) reduced-motion only stops some.
- **2026 standard:** WCAG 2.2.2 Pause, Stop, Hide (A).
- **Fix:** Honor `prefers-reduced-motion` fully (freeze all), which is the accepted equivalent.

### P1-8 `border-secondary` used as the visible boundary of interactive controls — fails non-text contrast
- **Where:** token `border.secondary = secondary[700] #4A4948` (`tailwind.config.ts:85`); `app/components/features/filters/SortDropdown.tsx:35` (`<select>`), `app/components/features/filters/MobileFilterBar.tsx:53` (Filters trigger), `app/components/features/filters/MobileSortButton.tsx` (Sort trigger)
- **What:** `#4A4948` against `surface.elevated #2E2E2D` is roughly 1.5:1; against the page `#0D0F0F` roughly 2.2:1. The border is the only thing defining these control edges.
- **Impact:** Low-vision users cannot perceive the sort/filter control boundaries.
- **2026 standard:** WCAG 1.4.11 Non-text Contrast (AA) — 3:1 for control boundaries.
- **Fix:** Use `border.primary` (`#E5E4E2`) or a mid-grey ≥3:1 for interactive-control borders; keep `border-secondary` for decorative dividers only.

### P1-9 Search input suppresses its focus indicator
- **Where:** `app/components/layout/header/SearchField.tsx:247-252, 337-343` — input has `outline-none` with no replacement; the only focus feedback is the wrapper `focus-within:bg-brand-400` (light-on-light background swap)
- **Impact:** Keyboard users get a weak, easily-missed focus cue on the primary search field; fails as a clear indicator.
- **2026 standard:** WCAG 2.4.7 Focus Visible (AA), 2.4.11 Focus Appearance (AA, 2.2).
- **Fix:** Add a real `focus-visible` ring on the input (or on the wrapper via `focus-within`) with ≥3:1 contrast against adjacent colors.

### P1-10 Catalogue mega-nav closed panel keeps links focusable (also see P0-5)
- **Where:** `app/components/layout/catalogue/NavbarManager.tsx:86-116`
- **What:** `pointer-events-none` blocks the mouse but not keyboard focus; `grid-rows-[0fr] overflow-hidden` clips visually but children stay tabbable and will scroll into view on focus.
- **2026 standard:** WCAG 2.4.3 (A), 1.3.1 (A).
- **Fix:** Toggle `hidden` (or `inert`) on the panel when closed.

### P1-11 Autocomplete listbox structure is not a valid listbox
- **Where:** `app/components/features/search/AutocompleteOverlay.tsx:38-93`, `AutocompleteItem.tsx:16-50`
- **What:** `role="listbox"` wraps a heading `<div>` ("Products"), a `<ul>` of `role="option"` `<li>`s, and a footer "View all results" `<Link>`. A listbox may only contain `option`/`group` children. The active option is tracked via `aria-activedescendant` on the input, but the extra non-option children and the `<ul>` between listbox and options break the pattern.
- **Impact:** Screen readers may miscount options or not expose them; the "View all" link inside the listbox is not reachable by the documented arrow-key model.
- **2026 standard:** WCAG 1.3.1 (A), 4.1.2 (A); ARIA APG combobox.
- **Fix:** Put `role="option"` elements as direct children of the listbox (drop the `<ul>`), move the heading to `aria-label` / a `group`, and move "View all" outside the listbox.

### P1-12 Mobile bottom bar is not a navigation landmark
- **Where:** `app/components/layout/navigation/ActionBar.tsx:130-142`
- **What:** The fixed bottom bar containing Menu/Search/Account/Basket is a `<div>`, not `<nav aria-label="…">`.
- **Impact:** Screen-reader users cannot jump to the primary mobile nav via landmarks; combined with P0-2 the bar is close to unusable non-visually.
- **2026 standard:** WCAG 1.3.1 (A); ARIA landmark practice.
- **Fix:** Wrap in `<nav aria-label="Primary">`.

## P2 — polish

### P2-1 Heading level jump on the homepage Featured section
- **Where:** `app/components/features/homepage/featured/Featured.tsx:69` / `card/CardDetails.tsx:29` — `<h3>` with no `<h2>` in that section; page `<h1>` is the Hero headline (`Hero.tsx:100`).
- **What:** h1 → h3 with no h2. Other spotlight sections correctly use h2 then h3.
- **2026 standard:** WCAG 1.3.1 (A) / 2.4.10 (AAA).
- **Fix:** Give the Featured section an `<h2>` (visually-hidden if needed).

### P2-2 Homepage can render with no `<h1>`
- **Where:** `app/components/features/homepage/hero/Hero.tsx:12-14` returns `null` when `heroData` is missing; the homepage has no other `<h1>`.
- **Fix:** Ensure a page-level `<h1>` exists independent of hero data.

### P2-3 Newsletter field is placeholder-labelled
- **Where:** `app/components/features/newsletter/NewsletterSignup.client.tsx:43-51`
- **What:** `aria-label="Email address"` is present (so it passes 4.1.2), but there is no visible persistent label — only the placeholder.
- **2026 standard:** WCAG 3.3.2 (A) is met via aria-label; 2.5.3 fine. This is a usability/robustness nit.
- **Fix:** Add a visible `<label>` (can be visually compact).

### P2-4 Newsletter success message not announced
- **Where:** `NewsletterSignup.client.tsx:61-63` — success `<p>` has no `role="status"` (the error branch at `:65` correctly has `role="alert"`).
- **Fix:** `role="status"` on the success message.

### P2-5 Target size below 24×24 (WCAG 2.2 2.5.8)
- **Where:** `app/components/features/filters/ActiveFilterChips.tsx:130` chip-remove button `h-5 w-5` (20px); `app/components/layout/carousel/CarouselControls.tsx:152,188` dot buttons render a 16px hit target inside a 16px flex box.
- **What:** Below the 24px AA minimum with no spacing exception large enough.
- **2026 standard:** WCAG 2.5.8 Target Size (Minimum) (AA, 2.2).
- **Fix:** Pad the hit area to ≥24×24 (keep the visual glyph small).

### P2-6 Dual range slider has no value text
- **Where:** `app/components/features/filters/PriceRangeSlider.tsx:146-163`
- **What:** Two overlapped `<input type="range">` with `aria-label` "Minimum/Maximum price" but no `aria-valuetext`, so the screen reader announces a bare number, not "$1,200".
- **Fix:** Add `aria-valuetext={\`$${value}\`}`.

### P2-7 Hero background image alt is generic
- **Where:** `app/components/features/homepage/hero/Hero.tsx:42-51` — `alt` falls back to `"Hero Image"`.
- **What:** A purely decorative backdrop should be `alt=""`; a meaningful one should be described.
- **2026 standard:** WCAG 1.1.1 (A).
- **Fix:** `alt=""` for the decorative case.

### P2-8 `DrawersManager` drawer title is non-descriptive
- **Where:** `app/components/layout/drawers/DrawersManager.tsx:47` — `<Drawer.Title className="sr-only">Drawer Content</Drawer.Title>`
- **What:** vaul provides focus trap/restore/Escape (good), but the accessible name of the catalogue drawer is literally "Drawer Content".
- **Fix:** `"Catalogue"` / `"Browse categories"`.

### P2-9 Icon-only phone/social and decorative SVGs mostly fine, but verify `CheckoutStepper` mobile
- **Where:** `app/checkout/_components/CheckoutStepper.tsx:24-72`
- **What:** `<nav aria-label="Checkout progress">` + `<ol>` is good; icons are `aria-hidden`; `aria-current="step"` is on the step-label `<span>` which is `hidden lg:block`, so below `lg` there is no current-step indication in the accessibility tree.
- **Fix:** Move `aria-current="step"` to the `<li>` (or a visually-hidden label) so it is exposed at all breakpoints.

## Checked and OK

- `<html lang="en">` set (`app/(store)/layout.tsx:33`).
- Landmark set present: `<header>`, `<nav aria-label="Catalogue Navigation">`, `<main>`, `<footer>` (`layout.tsx`, `CatalogueNavbar.tsx:21`).
- Product-listing, search, basket, sign-in, sign-up, account, order pages each have exactly one `<h1>` (`ShopHeader.tsx:21`, `SearchHeader.tsx:32`, `basket/page.tsx`, `SignInForm.tsx:131`, etc.).
- `SignInForm` inputs use proper `htmlFor`/`id`, `type="email"`, `autoComplete="one-time-code"` on the 2FA field (`SignInForm.tsx:185-241`).
- `SortDropdown` uses a native `<select>` with associated `<label htmlFor>` (`SortDropdown.tsx:26-42`) — correct, no fake combobox.
- `MobileSortButton` implements a real `role="radiogroup"` / `role="radio"` sheet via vaul with labelled close button (`MobileSortButton.tsx`).
- `MobileFilterBar` / `MobileSortButton` drawers use vaul (focus trap, restore, Escape, `Drawer.Title`).
- `Checkbox` wraps its `<input>` inside `<label>` (implicit association) and forwards focus ring via `peer-focus-visible` (`Checkbox.tsx:15-53`); count has an `aria-label`.
- `ActiveFilterChips` remove buttons and "Clear all" have `aria-label` / text and `focus-visible` outlines (`ActiveFilterChips.tsx:126-155`).
- `CarouselControls` prev/next have `aria-label`, disabled state, `focus-visible:ring`; `CarouselIndicator` is `role="status" aria-live="polite"`; dots have `role="tab"`/`aria-selected`/`aria-label` (`CarouselControls.tsx`).
- `CheckoutStepper` is `<nav aria-label="Checkout progress">` + `<ol>`, decorative icons `aria-hidden` (see P2-9 for the one gap).
- Button/input design-system classes in `tailwind.config.ts` (`.btn-primary`, `.btn-cart`, `.input-field`, `.btn-stepper`, …) all define `:focus-visible` outlines with offset.
- Reduced-motion IS handled for the fractal-ring layers (`globals.css:164-181`) and the image-reveal module (`reveal.module.css` matched the guard) — the gap is the spotlight orbits (P1-6).
- `ProductCard` link has `aria-label={product.name}`; `ProductImage` provides `alt` and an `sr-only` "No image" for the placeholder; `WishlistButton` has `aria-label` reflecting state and a ≥44px hit area in the `quiet` variant.
- Search field `role="search"` on both mobile and desktop `<form>`; mobile overlay is `role="dialog" aria-modal` with focus-in on the input, Escape, and focus restore (missing only the trap — P1-2).
- `SortBar` result count is `aria-live="polite"` (`SortBar.tsx:22`).
- Contrast that passes: `text-primary` (`brand-400`) on all dark surfaces (~12:1); `accent-500` gold on dark (~6.5-9:1); `text-caption` (`secondary-500`) on `surface-elevated` (~4.8:1, marginal pass at 12px); `btn-primary` / `btn-cart` fill-vs-text pairs (dark text on light/gold).
