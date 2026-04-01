# Search UI — Complete Design & Implementation Specifications

**Date:** 2026-04-01
**Scope:** Product-only search — field, autocomplete overlay, results page
**Design System:** `tailwind.config.ts` global tokens
**Coherence Target:** Homepage + PLP design language (dark luxury, editorial, Montserrat)

---

## Part 1: Research

### Research Scope Contract

- **Topic:** E-commerce product search UI — field design, autocomplete, results page
- **First Principles:** Search intent resolution, progressive disclosure, visual continuity
- **Fundamentals:** GROQ `match` operator, URL-driven state, Server Component data fetching
- **Scope Boundary:** Product search only. No blog/page search. No AI/NLP. No third-party search service.
- **Target Audience:** AI agent executing `/sprint` → `/implement` for this feature
- **Decay Risk:** Low (foundational UX + stable Sanity GROQ API)

---

### Source Triangulation

| Source | Type | Credibility | Date | Key Claim | Status |
|--------|------|-------------|------|-----------|--------|
| Baymard: Autocomplete Design | Research | Canonical | 2025 | 9 UX patterns — max 10 suggestions desktop, 4-8 mobile, highlight active, dim background | ✅ Verified |
| Baymard: Search Field Design | Research | Canonical | 2025 | Field prominence should match search importance; spec-driven catalogs benefit from prominent search | ✅ Verified |
| Baymard: Product List UX | Research | Canonical | 2025 | Applied filters overview, 4 essential sort types, visual consistency across site | ✅ Verified |
| Luigi's Box: 14 Best Practices | Industry | High | 2026 | Visible search bar, <0.3s autocomplete, typo tolerance, zero-results recovery, visual consistency | ✅ Verified |
| Prefixbox: 25 Best Practices | Industry | Medium | 2026 | Autocomplete on 82% of top 50 stores, 36% do more harm than good | ✅ Verified |
| Sanity: GROQ Query Cheat Sheet | Official | Canonical | Current | `match` operator for text search, wildcard `*` prefix matching, array field matching | ✅ Verified |
| Constructor.io: Search Best Practices | Industry | High | 2025 | A/B testing autocomplete, pre-merchandised suggestions, speed critical | ✅ Verified |

---

### First Principles Analysis

#### Core Problem Being Solved
**Reduce the distance between user intent ("I want X") and product discovery (finding X in catalogue).**

Category browsing = exploratory ("show me what you have"). Search = targeted ("I know what I want"). For an audiophile equipment store with spec-driven products, search is a **primary** product finding strategy — users often know brand names, model numbers, or product types.

#### Underlying Constraints
1. **GROQ `match` is token-based** — matches word boundaries, not substring. `"wo*"` matches words starting with "wo", but `"*ord"` suffix matching is NOT supported.
2. **Sanity has no built-in relevance scoring** — GROQ returns unranked results; ranking must be applied client-side or via query ordering.
3. **Network latency is unavoidable** — Sanity CDN helps, but search-as-you-type needs debouncing (300ms+) to avoid excessive API calls.
4. **Product schema has limited text fields** — `name` (string), `brand` (reference → name), `sku` (string). No description field currently active. Search surface is narrow.

#### Inherent Tradeoffs

| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Server-side search (URL-driven, page navigation) | SEO-friendly, shareable URLs, server-cached | Slower perceived speed, full page transitions | Results page |
| Client-side instant search (debounced API calls) | Instant feedback, no page reload | Not SEO-indexable, more client JS | Autocomplete overlay |
| Hybrid (autocomplete overlay → results page on submit) | Best of both — instant preview + deep results | More complexity, two UI states | **Recommended** |

#### Failure Modes
1. **No results without recovery** — Dead end kills conversion. Must offer alternatives.
2. **Too many autocomplete items** — >10 causes choice paralysis (Baymard).
3. **Slow autocomplete** — >300ms perceived as broken. Must debounce + cache.
4. **Visual inconsistency** — Search results using different card style than PLP breaks trust.
5. **No query persistence** — User submits search, navigates to product, comes back — query lost.

---

### Code Fundamentals

#### GROQ Text Search Capability

**Claim:** GROQ `match` operator supports word-prefix text search.

**Verified syntax:**
```groq
// Single field match — product name contains word starting with "head"
*[_type == "product" && name match "head*"]

// Multi-field match — name OR dereferenced brand name
*[_type == "product" && (name match $query || brand->name match $query)]

// Array field match for text in array
*[body[].children[].text match "aliens"]
```

**Actual Behavior:**
- `match` operates on word tokens, not substrings
- `"foo bar" match "fo*"` → `true` (prefix match works)
- `"my-pretty-pony.jpg" match "my*.jpg"` → `false` (not glob — token-based)
- Case-insensitive by default
- Multi-word queries: each word must match (AND logic)

**Edge Cases:**
1. SKU matching (e.g., "HD650") — works if SKU is a single token
2. Brand names with spaces — each word treated as separate token
3. Empty query — returns all documents (must guard against this)

#### Searchable Product Fields

| Field | Type | In Schema | Search Value |
|-------|------|-----------|-------------|
| `name` | string | ✅ Required | Primary — product name |
| `brand` | reference → brand.name | ✅ Required | High — users search by brand |
| `sku` | string | ✅ Required | Medium — power users search by SKU |
| `slug.current` | string | ✅ Required | Low — derived from name |
| `displayPrice` | number | ✅ Required | Not text-searchable |
| `description` | blockContent | ❌ Commented out | Would be high if enabled |
| `overviewFields[].value` | string | ✅ Optional | Low — spec values |
| `specifications[].value` | string | ✅ Optional | Low — spec values |

**Search query fields:** `name`, `brand->name`, `sku`

#### Existing Infrastructure

| Component | Path | Status |
|-----------|------|--------|
| `Searchbar.tsx` | `app/components/layout/header/Searchbar.tsx` | Static `<form>` with `<input>` — no functionality, UI only |
| `Header.tsx` | `app/components/layout/header/Header.tsx` | Renders Searchbar between logo and nav actions |
| Search route | `app/(store)/search/page.tsx` | ❌ Does not exist |
| Search GROQ query | — | ❌ Does not exist |
| Search API/action | — | ❌ Does not exist |

---

### Best Practices (Verified)

#### Practice 1: Hybrid Search — Autocomplete Overlay + Results Page
**Consensus:** High (Baymard, Luigi's Box, Constructor.io)

**Supporting Evidence:**
- Baymard: Autocomplete reduces search iterations; results page provides full browsing
- Luigi's Box: Autocomplete conversions +98% in 30 days (Ziaja case study)

**Counter-Evidence:**
- Small catalogs (<100 products) may not need autocomplete — overhead without benefit
- GROQ has no relevance scoring — autocomplete quality depends on query design

**Verdict:** ✅ Recommended — This store has 50-200+ products across multiple categories. Hybrid approach justified.

**When to Use:** Always for stores with >30 products
**When to Skip:** Stores with <20 products (just use results page)

---

#### Practice 2: Prominent Search Field for Spec-Driven Catalogs
**Consensus:** High (Baymard)

**Supporting Evidence:**
- Baymard: "In industries where search is the preferred product finding strategy, promote the search field" — audiophile equipment is spec-driven
- Newegg example: Dominating search field for electronics catalogs

**Counter-Evidence:**
- Urban Outfitters (apparel): Hidden search behind icon — category browsing preferred
- This store already uses prominent category navigation (VFS-based catalogue)

**Verdict:** ✅ Recommended — Current Searchbar is already visible in header. Keep it prominent. Add functional search capability.

---

#### Practice 3: Max 10 Autocomplete Suggestions Desktop, 4-8 Mobile
**Consensus:** High (Baymard — multiple rounds of testing)

**Supporting Evidence:**
- >10 items causes choice paralysis or total ignore
- Most users select from first few suggestions
- Amazon mobile: 6 suggestions

**Verdict:** ✅ Recommended — Limit to 6 suggestions (works for both desktop and mobile)

---

#### Practice 4: Visual Depth for Autocomplete (Background Dimming)
**Consensus:** High (Baymard)

**Supporting Evidence:**
- Target.com: Dimmed background when autocomplete active
- Eliminates visual competition from ads/carousels/page content

**Counter-Evidence:**
- On dark themes, dimming is less dramatic — but overlay still needs elevation
- This store already has dark background — use `bg-surface-elevated` + `shadow-cardDark` for depth

**Verdict:** ✅ Recommended with adaptation — Use elevated surface + shadow instead of dimming (already dark)

---

#### Practice 5: Zero-Results Recovery
**Consensus:** High (Luigi's Box, Baymard)

**Supporting Evidence:**
- 10.4% of searches return no results on average
- Dead ends = lost conversions

**Verdict:** ✅ Recommended — Show "No products found" with suggested categories or popular products

---

#### Practice 6: Keyboard Navigation for Autocomplete
**Consensus:** High (Baymard)

**Supporting Evidence:**
- Arrow keys navigate, Enter submits focused suggestion
- Copy suggestion text to search field on focus for modification
- List loops at boundaries

**Verdict:** ✅ Recommended — Full keyboard navigation required

---

### Common Solutions Landscape

#### Solution A: URL-Driven Search State (nuqs or searchParams)
**Prevalence:** Common in Next.js App Router apps
**Type:** Idiomatic

**Pros:**
- Shareable/bookmarkable search URLs (`/search?q=headphones`)
- Server-side rendering of results
- Browser back/forward works naturally
- SSR cache-friendly

**Cons:**
- Full page navigation on submit (mitigated by client-side router.push)

**Recommendation:** Use for results page. URL pattern: `/search?q={query}`

---

#### Solution B: Client-Side Debounced Fetch for Autocomplete
**Prevalence:** Ubiquitous
**Type:** Idiomatic

**Pros:**
- Instant feedback (<300ms perceived)
- No page navigation during typing

**Cons:**
- Requires client component for input state
- API calls on every debounced keystroke
- Must handle race conditions (stale results)

**Recommendation:** Use for autocomplete overlay. 300ms debounce. AbortController for race conditions.

---

#### Solution C: GROQ `match` with Multi-Field Search
**Prevalence:** Common for Sanity-backed stores
**Type:** Idiomatic

**Pros:**
- No external service needed
- Leverages existing Sanity CDN caching
- Simple query syntax

**Cons:**
- No relevance scoring (order by name or price, not relevance)
- Token-based matching only (no fuzzy/typo tolerance)
- No stemming (searching "headphone" won't match "headphones" — need wildcard)

**Recommendation:** Use `match "$query*"` for prefix matching. Order results by name. Accept limitation of no typo tolerance for v1.

---

## Part 2: Design System Awareness

### Global Design System Summary (from tailwind.config.ts)

**Identity:** Dark luxury audiophile store — editorial, minimal, premium
**Font:** Montserrat
**Palette:** Dark backgrounds (brand-700/800), warm cream text (brand-200/400), gold accents (accent-500)
**Surfaces:** `surface.page` (dark), `surface.card` (slightly lighter), `surface.elevated` (mid-dark), `surface.productImage` (cream)
**Radii:** Tight — lg:4px, md:3px, sm:2px
**Shadows:** cardDark, cardHoverDark (subtle glow on dark)
**Breakpoints:** xs:475px, md:768px, lg-touch:1024px+≤850h, lg-desktop:1024px+>850h

### Homepage Design Language (from screenshot + FeaturedCard)

- **Dark bg-brand-900** full-width sections with fractal ring overlays
- **Section headers:** Gold overline + uppercase section title (`type-section-hed`)
- **Product cards:** Cream image bg, brand badge top-left, name, price+cart inline
- **Carousel navigation:** Gold dots and arrows on dark
- **Category sections:** `IEMs`, `HEADPHONES`, `DACs`, etc. with gold `section-header-anchor` (gold dash before label)
- **Footer:** Dark with gold accents

### PLP Design Language (from audit)

- **Sidebar filters** on left (desktop), bottom-sheet drawer (mobile)
- **Sort + result count** bar above grid
- **Active filter chips** with removable tags
- **3-column grid** (lg-desktop) with `card-product-dark` cards
- **Card pattern:** Image (cream bg, mix-blend-multiply) → Name → Price+Cart inline

---

## Part 3: End-to-End Design Specifications

### 3.1 Architecture Overview

```
Search System = 3 Components:
1. SearchField (enhanced Searchbar.tsx in header)
2. AutocompleteOverlay (client-side dropdown below search field)
3. SearchResultsPage (server-rendered /search?q= route)
```

**User Flow:**
```
User types in SearchField
  → After 300ms debounce, AutocompleteOverlay shows (max 6 product suggestions)
  → User can:
     a) Click a product suggestion → navigates to /product/[slug]
     b) Press Enter or click search icon → navigates to /search?q={query}
     c) Press Escape or click outside → close overlay
     d) Arrow keys → navigate suggestions
     e) Click category suggestion → navigates to /products/[category]

On /search?q={query} page:
  → Server fetches matching products via GROQ
  → Renders results in same ProductGrid/ProductCard as PLP
  → Sort dropdown available
  → "No results" state with recovery suggestions
```

---

### 3.2 Component: SearchField (Enhanced Searchbar)

**File:** `app/components/layout/header/SearchField.tsx` (rename from Searchbar.tsx)
**Type:** Client Component (`"use client"`)

#### Spatial Map — Desktop (1280px)

```
Header: bg-brand-900, h-[var(--desktop-header-h)], sticky top-0
┌────────────────────────────────────────────────────────────┐
│ [Logo]     [═══════ SearchField ═══════]     [🛒] [👤]    │
│            ┌─────────────────────────────┐                 │
│            │ 🔍  Search products...      │  h-9 (36px)    │
│            │    bg-secondary-300         │  max-w-xl       │
│            │    rounded-md (3px)         │                 │
│            └─────────────────────────────┘                 │
└────────────────────────────────────────────────────────────┘
```

#### Spatial Map — Mobile (375px)

```
Header: bg-brand-900, h-[var(--mobile-header-h)]
┌─────────────────────────────┐
│ [Logo]         [🔍] [🛒]   │   Search icon only
└─────────────────────────────┘
                  ↓ tap
┌─────────────────────────────┐
│ [← ] [══ Search... ══] [✕] │   Full-width search mode
│ ┌─────────────────────────┐ │
│ │ AutocompleteOverlay     │ │   Full viewport below
│ │ ...                     │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

#### Design Tokens

| Element | Token/Class | Value |
|---------|-------------|-------|
| Container | `bg-secondary-300` | Warm light gray on dark header |
| Container focused | `bg-brand-400 shadow-md` | Cream highlight on focus |
| Border radius | `rounded-md` | 3px (system md) |
| Height | `h-9 lg:h-9` | 36px consistent |
| Max width | `max-w-xl` | Constrained in header flex |
| Input text | `text-brand-700` | Dark on light bg |
| Input text (focused) | `text-brand-700` | Stays dark |
| Placeholder | `placeholder:text-secondary-600` | Muted gray |
| Placeholder (focused) | `focus:placeholder:text-brand-800` | Slightly darker |
| Search icon | Phosphor `MagnifyingGlass` | 16px, weight="regular" |
| Icon color | `text-secondary-600` → focused: `text-brand-800` | Transitions with focus |
| Clear button (×) | Phosphor `X` | 14px, appears when input has value |
| Selection | `selection:bg-brand-700 selection:text-brand-400` | Inverted selection |

#### Behavior

| Action | Result |
|--------|--------|
| Focus input | bg transitions to brand-400, placeholder darkens, icon darkens |
| Type (after 300ms) | AutocompleteOverlay opens below |
| Press Enter | Navigate to `/search?q={query}`, close overlay |
| Click search icon | Same as Enter |
| Press Escape | Close overlay, keep input focused |
| Click outside | Close overlay, blur input |
| Clear (×) click | Clear input, close overlay, refocus input |
| Empty input + Enter | No navigation (guard) |

#### Accessibility

- `role="search"` on wrapping form
- `aria-label="Search products"` on input
- `aria-expanded="true/false"` when overlay open/closed
- `aria-activedescendant` points to highlighted suggestion
- `aria-controls` points to overlay listbox ID
- `role="combobox"` on input

---

### 3.3 Component: AutocompleteOverlay

**File:** `app/components/features/search/AutocompleteOverlay.tsx`
**Type:** Client Component (rendered by SearchField)

#### Spatial Map — Desktop

```
Below SearchField, aligned to input width:
┌──────────────────────────────────────┐
│ bg-surface-elevated                  │  border border-border-secondary
│ rounded-lg (4px)                     │  shadow-cardDark
│ mt-2                                 │  max-h-[480px] overflow-y-auto
│                                      │
│ ┌─ PRODUCT SUGGESTIONS ───────────┐ │
│ │ type-overline text-accent-500   │ │
│ │ "Products"                       │ │
│ ├─────────────────────────────────┤ │
│ │ ┌──────┐                        │ │
│ │ │ IMG  │  Product Name          │ │  h-16, flex, gap-3, p-3
│ │ │48x48 │  Brand · $Price        │ │  hover:bg-surface-card
│ │ └──────┘                        │ │  rounded-md
│ ├─────────────────────────────────┤ │
│ │ ┌──────┐                        │ │
│ │ │ IMG  │  Product Name          │ │  Active: bg-surface-card
│ │ │48x48 │  Brand · $Price        │ │  border-l-2 border-brand-400
│ │ └──────┘                        │ │
│ ├─────────────────────────────────┤ │
│ │ ... up to 6 product results     │ │
│ └─────────────────────────────────┘ │
│                                      │
│ ┌─ FOOTER ────────────────────────┐ │
│ │ "View all results for '{query}'"│ │  type-caption text-brand-400
│ │  → link to /search?q={query}    │ │  hover:underline
│ └─────────────────────────────────┘ │
└──────────────────────────────────────┘
```

#### Spatial Map — Mobile

```
Full-width below expanded search header:
┌─────────────────────────────┐
│ bg-surface-elevated         │  Full viewport width
│ border-t border-border-sec  │  No rounded top (flush with header)
│ rounded-b-lg                │
│                             │
│ Product Name                │  No image on mobile (space constrained)
│ Brand · $Price              │  p-4, type-body
│ ─────────────────────────── │  border-b border-border-secondary
│ Product Name                │
│ Brand · $Price              │
│ ─────────────────────────── │
│ ...max 6                    │
│                             │
│ View all results →          │  type-caption text-brand-400
└─────────────────────────────┘
```

#### Design Tokens

| Element | Token/Class | Value |
|---------|-------------|-------|
| Overlay container | `bg-surface-elevated` | Dark elevated surface |
| Border | `border border-border-secondary` | Subtle dark border |
| Radius | `rounded-lg` | 4px (system) |
| Shadow | `shadow-cardDark` | Subtle dark glow |
| Section label | `type-overline text-accent-500` | Gold overline — "Products" |
| Suggestion item | `p-3 flex items-center gap-3` | Consistent item spacing |
| Suggestion hover | `bg-surface-card rounded-md` | Subtle highlight |
| Suggestion active (keyboard) | `bg-surface-card border-l-2 border-brand-400` | Gold left accent |
| Product name | `type-body text-primary` | Standard body text |
| Product meta | `type-caption text-secondary` | Brand · $Price |
| Thumbnail | `w-12 h-12 rounded-md bg-surface-productImage` | 48px square, cream bg |
| Thumbnail image | `object-contain mix-blend-multiply` | Consistent with cards |
| Divider | `border-b border-border-secondary` | Between items (mobile only) |
| Footer link | `type-caption text-brand-400 hover:underline` | Gold action link |
| Loading state | `animate-pulse` skeleton bars | Same as system skeletons |
| Empty state | `type-body text-secondary p-6 text-center` | "No products found" |

#### Behavior

| State | Display |
|-------|---------|
| Input empty | Overlay closed |
| Input <2 chars | Overlay closed (minimum query length) |
| Input ≥2 chars, debouncing | Show skeleton loading (3 placeholder items) |
| Results found (1-6) | Show product suggestions + footer link |
| No results | "No products match '{query}'" with "Browse all products" link |
| Keyboard ↑↓ | Move active highlight through suggestions |
| Keyboard Enter on suggestion | Navigate to `/product/[slug]` |
| Keyboard Enter on none | Navigate to `/search?q={query}` |
| Click suggestion | Navigate to `/product/[slug]` |
| Click footer | Navigate to `/search?q={query}` |

#### Accessibility

- `role="listbox"` on suggestions container
- `role="option"` on each suggestion item
- `aria-selected="true"` on active item
- Each item has unique `id` for `aria-activedescendant`
- Announce result count to screen readers via `aria-live="polite"` region

---

### 3.4 Component: SearchResultsPage

**Route:** `app/(store)/search/page.tsx`
**Type:** Server Component (with client-side sort)

#### Spatial Map — Desktop (1280px)

```
┌─────────────────────────────────────────────────────────┐
│ NAV HEADER (with search field pre-filled with query)     │
├─────────────────────────────────────────────────────────┤
│ mx-auto max-w-content px-8 pt-6 pb-12                   │
│                                                          │
│ ┌─ SEARCH HEADER ─────────────────────────────────────┐ │
│ │ Breadcrumb: Home / Search                           │ │
│ │                                                      │ │
│ │ type-overline text-accent-500 section-header-anchor  │ │
│ │ ── Search Results                                    │ │
│ │                                                      │ │
│ │ type-section-hed uppercase                           │ │
│ │ "HEADPHONES"  (echoed query)                         │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─ CONTROLS BAR ──────────────────────────────────────┐ │
│ │ Sort ▼                              12 products     │ │
│ │ border-b border-border-secondary                     │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─ PRODUCT GRID (same as PLP) ────────────────────────┐ │
│ │ grid gap-8                                           │ │
│ │ grid-cols-1 xs:grid-cols-2 md:grid-cols-3            │ │
│ │ lg-desktop:grid-cols-4                               │ │
│ │                                                      │ │
│ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                │ │
│ │ │ CARD │ │ CARD │ │ CARD │ │ CARD │                │ │
│ │ │      │ │      │ │      │ │      │                │ │
│ │ └──────┘ └──────┘ └──────┘ └──────┘                │ │
│ │ ... more rows ...                                    │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ pb-12                                                    │
└─────────────────────────────────────────────────────────┘
```

**Key difference from PLP:** No sidebar filters. Search results page is full-width with 4 columns on lg-desktop (no sidebar eating space). This matches Baymard guidance: search results should be visually consistent but adapted to context.

#### Spatial Map — Mobile (375px)

```
┌───────────────────────────┐
│ NAV HEADER                │
├───────────────────────────┤
│ Breadcrumb: Home / Search │
│ ── Search Results         │
│ "HEADPHONES"              │
├───────────────────────────┤
│ [Sort ▼]      12 products │
├───────────────────────────┤
│ ┌───────────────────────┐ │
│ │ CARD (full-width)     │ │  1-col base
│ └───────────────────────┘ │
│ ┌─────────┐┌─────────┐   │
│ │ CARD    ││ CARD    │   │  2-col xs+
│ └─────────┘└─────────┘   │
└───────────────────────────┘
```

#### Design Tokens

| Element | Token/Class | Value |
|---------|-------------|-------|
| Page container | `mx-auto max-w-content px-4 md:px-8 pt-6 pb-12` | Matches PLP layout (post-alignment) |
| Breadcrumb | Same `CategoryBreadcrumbs` pattern | `Home / Search` |
| Search header overline | `type-overline text-accent-500 section-header-anchor` | Gold dash + "Search Results" |
| Search header title | `type-section-hed uppercase` | Echoed query text |
| Controls bar | `flex items-center justify-between pb-4 mb-6 border-b border-border-secondary` | Matches PLP sort bar |
| Sort dropdown | `input-select` token | Same SortDropdown component |
| Result count | `type-metadata text-secondary` | "N products" |
| Product grid | Same `ProductGrid` component | Reuses existing component |
| Grid columns (no sidebar) | `grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg-desktop:grid-cols-4` | 4-col since no sidebar |
| Product cards | Same `ProductCard` component | Identical to PLP cards |

#### Empty State (No Results)

```
┌──────────────────────────────────────────────┐
│ mx-auto max-w-content                        │
│                                               │
│ ┌─ EMPTY STATE ─────────────────────────────┐│
│ │               text-center py-16            ││
│ │                                            ││
│ │   🔍 (MagnifyingGlass icon, 48px)         ││
│ │   text-secondary-500                       ││
│ │                                            ││
│ │   type-h3 text-primary mb-2               ││
│ │   "No products found"                      ││
│ │                                            ││
│ │   type-body text-secondary mb-8           ││
│ │   "We couldn't find any products           ││
│ │    matching '{query}'"                     ││
│ │                                            ││
│ │   ┌─ SUGGESTIONS ───────────────────────┐ ││
│ │   │ type-overline text-accent-500       │ ││
│ │   │ ── Try Instead                      │ ││
│ │   │                                      │ ││
│ │   │ btn-secondary  btn-secondary         │ ││
│ │   │ [Headphones]   [IEMs]               │ ││
│ │   │ [DACs]         [Accessories]         │ ││
│ │   │                                      │ ││
│ │   │ OR                                   │ ││
│ │   │                                      │ ││
│ │   │ btn-ghost                            │ ││
│ │   │ "Browse all products →"              │ ││
│ │   └──────────────────────────────────────┘ ││
│ └────────────────────────────────────────────┘│
└──────────────────────────────────────────────┘
```

#### Empty State Design Tokens

| Element | Token/Class | Value |
|---------|-------------|-------|
| Container | `text-center py-16` | Generous vertical space |
| Icon | `MagnifyingGlass` from Phosphor | 48px, text-secondary-500 |
| Heading | `type-h3 text-primary mb-2` | "No products found" |
| Subtext | `type-body text-secondary mb-8` | Explanation with query echoed |
| Section label | `type-overline text-accent-500 section-header-anchor` | Gold dash + "Try Instead" |
| Category buttons | `btn-secondary` | Outlined buttons linking to top categories |
| Browse all link | `btn-ghost` | "Browse all products →" |

---

### 3.5 GROQ Query Specification

#### Autocomplete Query

```groq
// File: sanity/lib/products/searchProducts.ts

*[_type == "product" && (
  name match $query ||
  brand->name match $query ||
  sku match $query
)] | order(name asc) [0...6] {
  _id,
  name,
  "brand": brand->name,
  displayPrice,
  slug { current },
  image
}
```

**Parameters:** `{ query: "${userInput}*" }` — append wildcard for prefix matching
**Guard:** Minimum 2 characters before querying
**Limit:** 6 results (Baymard-compliant)

#### Results Page Query

```groq
// File: sanity/lib/products/searchProducts.ts

*[_type == "product" && (
  name match $query ||
  brand->name match $query ||
  sku match $query
)] | order($orderField $orderDirection) {
  _id,
  name,
  "brand": { "name": brand->name },
  displayPrice,
  stock,
  slug { current },
  image
}
```

**Sort options:**
- `name asc` — A-Z (default)
- `name desc` — Z-A
- `displayPrice asc` — Price low-high
- `displayPrice desc` — Price high-low

---

### 3.6 URL & Routing Specification

| URL Pattern | Purpose |
|-------------|---------|
| `/search?q=headphones` | Search results for "headphones" |
| `/search?q=headphones&sort=price-asc` | Sorted search results |
| `/search` (no q) | Redirect to homepage or show empty state |
| `/search?q=` (empty q) | Show empty state: "Enter a search term" |

**Query parameter:** `q` — search query string
**Sort parameter:** `sort` — one of `name-asc`, `name-desc`, `price-asc`, `price-desc`

---

### 3.7 File Structure

```
app/
├── (store)/
│   └── search/
│       └── page.tsx                    # Server Component — search results page
├── components/
│   ├── layout/
│   │   └── header/
│   │       ├── SearchField.tsx         # Client — enhanced search input (replaces Searchbar.tsx)
│   │       └── ...existing header files
│   └── features/
│       └── search/
│           ├── AutocompleteOverlay.tsx  # Client — dropdown suggestions
│           ├── AutocompleteItem.tsx     # Client — individual suggestion row
│           ├── SearchEmpty.tsx          # Server — no results state
│           └── SearchHeader.tsx         # Server — breadcrumb + title for results page
sanity/
└── lib/
    └── products/
        └── searchProducts.ts           # GROQ queries for autocomplete + full results
```

---

### 3.8 State Management

| State | Owner | Mechanism |
|-------|-------|-----------|
| Search input value | `SearchField` | `useState` (local) |
| Autocomplete open/closed | `SearchField` | `useState` (local) |
| Autocomplete results | `SearchField` | `useState` + debounced fetch |
| Active suggestion index | `SearchField` | `useState` (keyboard nav) |
| Results page query | URL | `searchParams.q` (server-read) |
| Results page sort | URL | `searchParams.sort` (server-read) |
| Mobile search expanded | `SearchField` | `useState` (local) |

**No global state.** Search is URL-driven for the results page and local state for the autocomplete interaction. This follows the existing pattern of nuqs/searchParams used in PLP.

---

### 3.9 Component Interaction Map

```
                    ┌─────────────────┐
                    │    Header.tsx    │
                    │  (Server)       │
                    └────────┬────────┘
                             │ renders
                    ┌────────▼────────┐
                    │  SearchField    │
                    │  (Client)       │
                    │                 │
                    │  useState:      │
                    │  - query        │
                    │  - isOpen       │
                    │  - results      │
                    │  - activeIndex  │
                    │  - isMobileOpen │
                    └──┬──────────┬───┘
                       │          │
            onSubmit   │          │ debounced fetch
            (Enter)    │          │ (300ms, ≥2 chars)
                       │          │
              ┌────────▼──┐  ┌────▼──────────────┐
              │ router     │  │ searchProducts()  │
              │ .push(     │  │ (autocomplete)    │
              │ /search    │  │ → returns 0-6     │
              │ ?q=...)    │  │   products        │
              └────────────┘  └────┬──────────────┘
                                   │
                          ┌────────▼────────────┐
                          │ AutocompleteOverlay  │
                          │ (Client)             │
                          │                      │
                          │ Renders max 6        │
                          │ AutocompleteItem     │
                          │ components           │
                          │                      │
                          │ + "View all" footer  │
                          └──────────────────────┘


On /search?q=... page load:
              ┌──────────────────────┐
              │  search/page.tsx     │
              │  (Server Component)  │
              │                      │
              │  reads searchParams  │
              │  calls searchProducts│
              │  (full results)      │
              └──────────┬───────────┘
                         │
              ┌──────────▼───────────┐
              │  SearchHeader        │
              │  Breadcrumbs         │
              │  SortDropdown        │
              │  ProductGrid         │  ← reuses PLP components
              │  (or SearchEmpty)    │
              └──────────────────────┘
```

---

### 3.10 Responsive Behavior Summary

| Breakpoint | Search Field | Autocomplete | Results Grid |
|------------|-------------|--------------|--------------|
| base (0px) | Icon only in header → expands to full-width on tap | Full-width, no thumbnails, dividers between items | 1 column |
| xs (475px) | Icon only → full-width expanded | Full-width, no thumbnails | 2 columns |
| sm (640px) | Visible input field in header | Full-width, no thumbnails | 2 columns |
| md (768px) | Visible input, max-w-sm | Aligned to input, with thumbnails | 3 columns |
| lg-desktop | Visible input, max-w-xl | Aligned to input, with thumbnails, shadow depth | 4 columns |
| lg-touch | Visible input, max-w-md | Aligned to input, with thumbnails | 3 columns |

---

### 3.11 Animation & Transitions

| Element | Transition | Token |
|---------|-----------|-------|
| SearchField focus | bg-color, shadow | `transition-all duration-300 ease-out` |
| AutocompleteOverlay open | opacity + translateY | `transition-all duration-200 ease-out` (0→1 opacity, -4px→0 translateY) |
| AutocompleteOverlay close | opacity | `transition-opacity duration-150 ease-in` |
| Suggestion hover | background-color | `transition-colors duration-150` |
| Active suggestion | border-left + background | `transition-all duration-150` |
| Mobile search expand | width + opacity | `transition-all duration-300 ease-out` |
| Clear button appear | opacity | `transition-opacity duration-200` |

---

### 3.12 Loading States

#### Autocomplete Loading Skeleton

```
┌──────────────────────────────────────┐
│ bg-surface-elevated                  │
│                                      │
│ "Products" (type-overline)           │
│ ┌──────────────────────────────────┐ │
│ │ ████  ██████████████  animate-   │ │  3 skeleton items
│ │ ████  ████████        pulse      │ │
│ ├──────────────────────────────────┤ │
│ │ ████  ██████████████             │ │
│ │ ████  ████████                   │ │
│ ├──────────────────────────────────┤ │
│ │ ████  ██████████████             │ │
│ │ ████  ████████                   │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘

Skeleton colors: bg-secondary-800 (dark theme system)
```

#### Results Page Loading

Use existing `ProductGridSkeleton` component (after SC9 alignment to system colors).

---

## Part 4: Verification & Falsification

### Claims Verified

| Claim | Evidence | Method |
|-------|----------|--------|
| GROQ `match` supports prefix wildcard | Sanity docs: `"fo*"` matches "foo bar" | Official docs |
| Max 6-10 autocomplete items optimal | Baymard: >10 causes choice paralysis | Research (multiple rounds of testing) |
| 300ms debounce is standard | Luigi's Box: "suggestions within 0.3s" | Industry consensus |
| URL-driven search is SEO-friendly | Next.js App Router searchParams are server-readable | Framework docs |
| `brand` is a reference in product schema | `productType.ts` line 35-39: `type: "reference", to: [{ type: "brand" }]` | Source code |

### Falsification Attempts

| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| "GROQ match is sufficient for search" | No fuzzy matching, no typo tolerance, no relevance scoring | **Modified** — Sufficient for v1 with prefix wildcards. Future: consider Algolia/Typesense for typo tolerance |
| "6 autocomplete results is enough" | Some stores show 10 with categories mixed in | **Survived** — For product-only search with thumbnails, 6 is optimal |
| "No sidebar filters on search results" | Some stores (Amazon, Wayfair) have filters on search | **Survived for v1** — This store has limited catalog. Filters can be added later if needed |
| "Search field should stay in header" | Some luxury sites hide search behind icon | **Survived** — Audiophile equipment is spec-driven; prominent search is correct |

### Knowledge Decay Assessment

| Section | Risk | Review Date |
|---------|------|-------------|
| GROQ match syntax | Low | When Sanity releases GROQ v2 |
| Autocomplete UX patterns | Low | Stable for 5+ years |
| Next.js routing patterns | Medium | On Next.js major version bump |
| Design system tokens | Low | Only if tailwind.config.ts changes |

---

## Part 5: Actionable Takeaways

### For This Project

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Hybrid search (autocomplete + results page) | Baymard + Luigi's Box consensus, spec-driven catalog | SearchField + AutocompleteOverlay + /search page |
| GROQ `match` for v1 | No external service dependency, leverages existing Sanity CDN | `searchProducts.ts` with prefix wildcards |
| Reuse PLP components on results page | Visual consistency (Baymard #9), DRY principle | Same ProductGrid, ProductCard, SortDropdown |
| URL-driven results page | Shareable, SEO-friendly, server-cached, Back button works | `/search?q=&sort=` pattern |
| 6 max autocomplete suggestions | Baymard optimal range, works for both desktop and mobile | GROQ `[0...6]` slice |
| No search filters v1 | Catalog size doesn't warrant it yet | Can add FilterSidebar later |
| Zero-results recovery | 10% of searches return no results — must recover | Category suggestions + "Browse all" |

### Implementation Priority

1. **GROQ search query** (`searchProducts.ts`) — data layer first
2. **SearchField** (enhanced Searchbar) — functional input with form submit
3. **Search results page** (`/search/page.tsx`) — server-rendered results
4. **AutocompleteOverlay** — client-side instant suggestions
5. **Empty state** — zero-results recovery
6. **Mobile search expansion** — responsive adaptation
7. **Keyboard navigation** — accessibility polish
