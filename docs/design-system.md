# Design System — As Codified From The Live Site

Scope: visual/layout design only — colors, type, spacing, radii, shadows, breakpoints, component
classes, layout patterns. Explicitly excludes conversion-UX recommendations (reviews, trust copy,
cross-sell) — those live in `docs/pdp-ux-audit-2026-08-05.md` and `docs/homepage-ux-audit-2026-08-05.md`,
a separate workstream, out of scope here.

Methodology: every token below is read directly from `tailwind.config.ts` / `app/globals.css`,
cross-referenced against the live production site (sanglogium.com, desktop screenshots at
1440×800 and 1440×960) and real component source — not `/design-system-test` or `/dev/design-system`
(neither is the source of truth — see note at the end). If a value here contradicts the code, the
code wins — re-verify before trusting this after a config change.

This document exists because a real, professional design already exists in this codebase — it
just was never written down in one place. Read this before proposing any visual change to the
app. Companion execution spec: `_project/reports/design-system-completion-DEVIN-PLAN.md`.

## Visual language (the intent behind the tokens)

Dark, minimal, "precision engineered" audiophile-retail aesthetic: near-black canvas
(`brand.700/800/900`), warm cream/blush foreground text (`brand.200/400`), a single gold accent
(`accent.500`, `#D4AF37`) used sparingly for overlines, section-header rules, and hover/active
states — never as a fill for large areas. Corners are nearly sharp (2–4px radius everywhere,
see below); shadows are almost flat (`0 4px 20px rgba(0,0,0,0.03)` at rest). Nothing skeuomorphic,
nothing soft-rounded. Type is Montserrat throughout with a deliberate editorial contrast: large
display/headline sizes carry tight-to-negative tracking (`-0.01em` to `-0.02em`), overlines and
captions carry wide `0.26em` uppercase tracking — the same contrast technique luxury-goods sites
use. A thin gold rule before section headers (`.section-header-anchor`) is the one recurring
signature motif.

A proposed change that introduces a new hue, a softer/rounder corner, a heavier shadow, or a
different type rhythm is a redesign, not a fix — see the checklist at the end.

## Color tokens

`tailwind.config.ts:6–86`. Raw scales:

| Scale | Use | Key stops |
|---|---|---|
| `brand` | Canvas + cream text | 900 `#070808` (page black) → 700 `#151B1B` (surface.page) → 400 `#F6E3D5` (primary text) → 200 `#FAEEE6` (body text) |
| `secondary` | Neutral grays — borders, muted text | 900 `#1A1A19` (surface.card) → 700 `#4A4948` (default border) → 500/400 (captions, metadata) |
| `accent` | Gold — the one accent hue | 500 `#D4AF37` |
| `success` / `error` / `warning` | Status only (stock state, form errors) | 500/700 |

Semantic aliases (`tailwind.config.ts:59–86`) — **use these class names for anything with a
defined role, not raw scale numbers**:

| Token | Resolves to | Tailwind class | Use |
|---|---|---|---|
| `surface.page` | brand.700 | `bg-surface-page` | Page-level background |
| `surface.card` | secondary.900 | `bg-surface-card` | Cards, panels |
| `surface.elevated` | secondary.800 | `bg-surface-elevated` | Dropdowns, inputs, drawers |
| `surface.productImage` | brand.200 | `bg-surface-productImage` | Product photo background block |
| `text.primary` | brand.400 | `text-text-primary` | Headings, product names |
| `text.body` | brand.200 | `text-text-body` | Body copy |
| `text.secondary` | secondary.400 | `text-text-secondary` | Supporting copy |
| `text.caption` | secondary.500 | `text-text-caption` | Metadata, timestamps |
| `text.accent` / `text.overline` | accent.500 | `text-text-accent` | Overlines, active labels |
| `border.primary` | secondary.300 | `border-border-primary` | Prominent dividers |
| `border.secondary` | secondary.700 | `border-border-secondary` | Default border (also the global default — `globals.css:34`) |

**Known trap:** `text-primary`, `text-secondary`, `text-caption`, `text-headline` — without the
doubled `text-text-` — are **not valid classes** in this config (no top-level `primary`/`caption`
color exists, and `secondary` has no `DEFAULT` shade). Tailwind silently drops them, no error.
Currently mis-used in five real files — see Gap 2.

## Typography scale

`tailwind.config.ts:508–543`, applied via `.type-*` component classes (`tailwind.config.ts:365–442`)
— reach for the `.type-*` class over hand-assembling `text-*`/`leading-*`/`tracking-*`:

| Class | Token | Size | Use |
|---|---|---|---|
| `.type-hero-headline` | `display-1` | clamp(3rem, 4vw+2rem, 5.625rem) | Homepage hero only — used in exactly one place |
| `.type-section-hed` | `h1` | clamp(1.6875rem…3.1875rem) | Section/page headings |
| `.type-hero-sub` / `.type-section-sub` | `h2` | clamp(1.25rem…2.375rem) | Subheadings |
| `.type-card-title` | `body` | 16px/24px | Card titles |
| `.type-metadata` / `.type-price` | `h4` | clamp(1rem…1.375rem) | Metadata labels / price |
| `.type-overline` / `.type-section-caption` | `small` | 12px/16px, `0.26em` tracking, uppercase | Overlines, kickers |
| `.type-body` | `body` | 16px/24px | Body copy |
| `.type-caption` | `small` | 12px/16px | Captions |

Font weights: `thin 100 · light 300 · regular 400 · medium 500 · semibold 600 · bold 700`
(`tailwind.config.ts:544–551`). Font family is Montserrat everywhere (`--font-montserrat`,
`tailwind.config.ts:503–507`).

## Spacing, radius, shadow, breakpoints

- **Border radius** — only three steps, all tight: `sm 2px · md 3px · lg 4px`
  (`tailwind.config.ts:472–476`). Nothing larger exists anywhere in the system. A `rounded-xl`/
  `rounded-full` outside an icon-button context (e.g. `WishlistButton`'s circular badge) is off-system.
- **Shadows** — `card`/`cardHover`/`cardDark`/`cardHoverDark`/`button`/`buttonHover`
  (`tailwind.config.ts:566–573`), all low-alpha (0.03–0.25). Nothing heavier exists.
- **Spacing extensions** — `12 (3rem)`, `16 (4rem)`, `112 (28rem)`, `128 (32rem)`,
  `feature-media (450px)`, plus two CSS-var-backed tokens `desktop-header-h` / `mobile-menu-h`
  (`tailwind.config.ts:486–494`, wired in `globals.css:6–13`). Otherwise standard Tailwind scale.
- **Breakpoints** — standard Tailwind plus `xs 475px`, `3xl 1920px`, and two height-aware custom
  ones: `lg-touch` (≥1024w, ≤850h — laptop) / `lg-desktop` (≥1024w, ≥851h — external monitor),
  plus `pointer-fine`/`pointer-coarse` (`tailwind.config.ts:478–485`). Mechanics, the
  "doesn't inherit from `lg:`" gotcha, and proven fix patterns: `docs/vertical-space-lg-touch.md`
  — read before touching any `lg-touch:`/`lg-desktop:` class. Site-wide convention: 28 files, 70 usages.
- **Content width** — `max-w-content` = 1280px (`tailwind.config.ts:563–565`) is the standard page
  cap. `ContentLayout.tsx` (policy/FAQ pages) uses a narrower `max-w-3xl` for prose — intentional,
  different content type, not an inconsistency.

## Component classes

Defined once in `uiComponentsPlugin` (`tailwind.config.ts:99–457`), used across 33 files
(buttons) / 57 files (semantic tokens). **Reach for one of these before writing a new className
string.**

| Class | What it is |
|---|---|
| `.btn-primary` | Solid cream button, dark text — general primary action |
| `.btn-cart` | Small cart-icon button — product grid cards |
| `.btn-cart-large` | Full-size cart button — PDP buy box |
| `.btn-in-basket-large` | Green "in basket" confirmed state |
| `.btn-secondary` | Outlined, transparent — secondary action |
| `.btn-ghost` | Text-only, underlined, uppercase — tertiary/link CTA |
| `.card-base` | Generic panel: `surface.card` bg, `lg` radius, `card` shadow, secondary border |
| `.card-product` / `.card-product-dark` | Product card chrome, hover lift + border shift |
| `.input-base` / `.input-field` / `.input-select` | Form controls, `surface.elevated` bg |
| `.section-header-anchor` | Gold rule prefix before a section heading |

There is no `.btn-accent`. Any gold/filled CTA that isn't `.btn-primary` is currently hand-rolled
— see Gap 3.

## Layout architecture (do not fight this)

The app is a **fixed-viewport shell**, not a normally-scrolling document: `html`/`body` are
`h-dvh overflow-hidden` (`globals.css:37–43`, `app/(store)/layout.tsx`); sticky `Header` +
`CatalogueNavbar` sit outside the scroll region, and `<main className="overflow-y-auto …">`
(`app/(store)/layout.tsx`) is the *only* scroll container, wrapping every page's content plus
`Footer`. This is why `lg-touch`/`lg-desktop` exist — vertical room is a real, actively-managed
constraint, not an incidental detail. Any new page/component composes inside `<main>`; never
reintroduce document-level scroll.

`Shelf` (`app/components/layout/general/Shelf.tsx`) is the shared homepage section wrapper
(`docs/homepage-structure.md`). `ContentLayout` (`app/components/layout/content/ContentLayout.tsx`)
is the shared wrapper for prose pages. Product grids and the PDP compose directly inside `max-w-content`.

## Patterns already professional — reference, do not redesign

Confirmed via live screenshots (sanglogium.com, 2026-08-06) and source:

- **Homepage** — hero, carousel sections (`CarouselControls` shared across 7 sections), editorial
  spotlight blocks, footer. Consistent card chrome, gold section-header rule, `.btn-secondary`
  "SEE MORE" buttons. (One exception: Gap 3.)
- **Product grid / listing (`/products`)** — `ProductCard.tsx`: `.card-product-dark`,
  `aspect-[16/9]` image on `surface.productImage`, brand label, wishlist heart, price + `.btn-cart`.
  Reused everywhere a product tile renders (homepage, category, related products) — don't fork it.
- **Product image treatment** — cream `surface.productImage` block, `object-contain`, hover
  zoom-scale. Confirmed good on both grid cards and the PDP main image.

## Confirmed gaps — fix, not redesign

Each is broken *relative to the codebase's own already-defined system*. Closing them requires
zero new colors, sizes, or components.

### Gap 1 — Product Detail Page: two-column layout has no floor, goes empty

`ProductDetail.tsx:19` splits `grid-cols-1 lg:grid-cols-2`: image column (`ImageGallery`) vs. info
column (`ProductInfo`). The image column's height is fixed by the product photo + thumbnail strip
(≈600px+ at desktop). The info column's height is entirely a function of `product.overviewFields`
content, which `docs/pdp-ux-audit-2026-08-05.md` already found data-quality-inconsistent. When a
product has no short/quick-scan overview fields — confirmed live at
`/product/xduoo-xd-05-bal-balanced-dac-amp`, screenshotted at 1440×800 and 1440×960 — the info
column renders brand/title/price/stock/buy-box/shipping-line and stops, leaving ~300–350px of
unbounded dead space beside the image, worse on taller (`lg-desktop`) monitors since nothing in
the info column scales to fill height. This is the layout the project brief calls out by name —
it reads as unfinished because it structurally has no lower bound.

This is adjacent to but distinct from the PDP audit's buy-box-ordering finding (already fixed —
see the comment at `ProductInfo.tsx:89–91`) and key-collision finding (already fixed — fields now
key on `_key`). This is a new, purely visual/layout finding: those fixes removed the "wall of
text" failure mode but added no floor for the opposite case.

**Resolved fix direction** (existing classes/patterns only — exact diff in the execution plan, Task 3):

1. Source the quick-facts area from `product.specifications` (always populated — 8/10 in the PDP
   audit) as a fallback when `overviewFields` yields zero quick groups — reusing the exact
   `grid grid-cols-2 gap-4` / `type-caption` / `type-body` pattern already coded for `quickGroups`
   two lines away (`ProductInfo.tsx:128–136`). No new component.
2. Extend the existing `border-y border-border-secondary` panel (or wrap in `.card-base`) so any
   residual whitespace reads as a considered panel, not a void.

### Gap 2 — Broken semantic-token classes (dead CSS, 24 instances)

Bare `text-primary` / `text-secondary` / `text-caption` / `text-headline` / `text-body` (missing
the doubled `text-text-` prefix) resolve to nothing — elements silently inherit `text-text-body`
instead of the intended muted/emphasized tone:

| File | Lines | Notes |
|---|---|---|
| `app/(store)/product/[slug]/page.tsx` | 36, 42, 47 (breadcrumb) | lines 36 & 42 each carry two bare tokens: base `text-secondary` **and** `hover:text-primary` |
| `app/components/features/products/ProductDetail.tsx` | 39, 40, 42, 49, 50, 52 (spec table) | |
| `app/components/features/products/ProductInfo.tsx` | 34, 37, 82, 101, 108, 118, 121, 140 | |
| `app/components/features/products/ProductCard.tsx` | 62 | |
| `app/components/features/products/ImageGallery.tsx` | 127 | base `text-body` **and** `hover:text-primary` on the same line |
| `app/components/features/products/EmptyResults.tsx` | 10 | |
| `app/components/features/products/ProductGrid.tsx` | 16 | |

Effect on the flagged PDP specifically: spec-table labels/values and price/quantity text all
render in the same color instead of the intended label-vs-value contrast — flattening exactly the
hierarchy `.type-caption`/`.type-body` were meant to create. Mechanical fix: prefix each with
`text-` (`text-primary` → `text-text-primary`, etc.). Zero design judgment required.

### Gap 3 — Homepage: one-off CTA button + broken hover state

`NewestRelease.tsx:106` hand-rolls `border-accent-600 bg-accent-600 text-secondary-900 …
hover:bg-transparent hover:text-secondary-900` instead of `.btn-primary`/`.btn-secondary`/
`.btn-ghost`. Flagged in `docs/homepage-ux-audit-2026-08-05.md`; still present, unfixed as of this
writing. Two problems in one: it's a fourth, undocumented button style on the page's single
highest-value CTA, and the hover state sets background transparent while keeping dark text — text
goes near-invisible against the dark page on hover. Fix direction (execution plan, Task 2): reuse
`.btn-primary`, or — only if the gold-fill "featured product" treatment is worth keeping as its
own class — add one `.btn-accent` entry to `uiComponentsPlugin`, following the exact structural
pattern of the existing `.btn-primary` entry.

## The flaw-vs-taste test

Apply before changing any className, anywhere, during a professionalization pass:

1. **Does it reference a token/class not defined in `tailwind.config.ts`?** (dead class, typo,
   off-scale radius/shadow) → Bug. Point it at the correct existing token.
2. **Does realistic real data (long/short/missing content) break proportion, overflow, or leave
   unbounded empty space?** → Structural flaw. Fix by sourcing a more reliable data field or
   bounding the container, using only patterns already present elsewhere in the same file/codebase.
3. **Does it duplicate an existing `.btn-*`/`.card-*`/`.type-*`/`.input-*` class with near-identical
   values?** → Consolidate to the existing class. Only add a new named class if the pattern repeats
   2+ times, has no existing home, and is built from tokens already in `tailwind.config.ts`.
4. **Would fixing it "properly" require a new hex value, a new `clamp()` size, a new spacing
   number, a new radius, or a new shadow not already in the config?** → Stop. That's a redesign
   decision. Write it up; don't implement a guess.
5. **Placed next to an already-professional page (homepage hero, product grid), would the fix look
   like it belongs?** → If no, stop. If unsure, treat it as (4).

## Not the source of truth

`app/design-system-test/**` is a standalone portfolio/showcase page (see
`design-system-page-execution.md`) built to demonstrate design-system work to a hiring reviewer —
not wired into the app; never copy its content into real pages. `app/dev/design-system/page.tsx`
is closer to reality (renders real components: `BasketItemDisplay`, `PaymentMethodSelector`,
`CheckoutSummary`) but is still a dev-only showcase. `tailwind.config.ts` plus the live site are
the only sources of truth.

---

*Built 2026-08-06 from `tailwind.config.ts`, `app/globals.css`, live-site screenshots
(sanglogium.com, desktop 1440×800/1440×960, `/product/xduoo-xd-05-bal-balanced-dac-amp`), and the
component source cited inline. Cross-referenced against `docs/pdp-ux-audit-2026-08-05.md` and
`docs/homepage-ux-audit-2026-08-05.md` (conversion-UX findings, separate workstream). Verify line
numbers against actual files before relying on them after further edits — this codebase iterates
fast; two of the PDP audit's own findings were already fixed by the time this document was written.*
