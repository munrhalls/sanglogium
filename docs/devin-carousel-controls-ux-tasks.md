# Devin Task Plan — Homepage Carousel Controls UX Gap

**Scope:** `app/components/features/homepage/featured/`, `app/components/features/homepage/dacs/`, `app/components/features/homepage/accessories/`, `app/components/layout/carousel/`
**Design system reference:** `tailwind.config.ts`
**Gold-standard pattern already in this codebase:** `app/components/features/homepage/newest-release/NewestRelease.tsx` (lines 57-69) and `ProductSpotlight1/2/3.tsx`

---

## 0. Trigger

User-reported: on the homepage "Featured" (Headphones Collection) section, the carousel's prev/next/dots controls are not visible without scrolling — bad desktop UX. Screenshot showed the section cut off before any controls were visible.

---

## 1. Intelligence gathered (verified, not assumed)

### 1.1 Live measurement (ground truth, not a screenshot guess)

Measured directly against the running dev server (`localhost:3000`) via DOM `getBoundingClientRect()`, at the user's actual screen configuration (1536×864 physical resolution, browser chrome present → **1396×632 effective content viewport**):

| Element | Distance from page top |
|---|---|
| Featured section start | 689px |
| "Featured" header | 781px |
| "View All" link | 901px |
| Product row (3 cards) top | 929px |
| Product row bottom | ~1396px |
| **Prev/Next/Dots controls** | **1409–1449px** |

Viewport height: 632px. **The controls sit 777px below the fold** — the user must scroll roughly 1.3× a full screen height past page-load position before the carousel's own navigation controls appear. This reproduces at 1280×800 and other common laptop sizes too (header + "View All" + one 467px-tall card row already exceeds most laptop viewport heights before controls are reached).

### 1.2 Root cause (source-level)

In `Featured.tsx` (and identically in `Dacs.tsx`, `CategorySection.tsx`), the controls are rendered in normal block flow **after** the entire `CarouselTrack` grid:

```tsx
<div className="relative">
  <CarouselTrack>...</CarouselTrack>
</div>

<div className="flex items-center justify-center gap-3">
  <CarouselPrevious .../>
  <CarouselDots truncate />
  <CarouselNext .../>
</div>
```

Controls are not overlaid, not sticky, not adjacent to the visible row — they're stacked below the full section (header + link + card grid), so their position depends on total section height, not viewport height.

### 1.3 This is a systemic pattern issue, not a one-off (verified)

Grepped every homepage carousel usage. Two different patterns exist in this same codebase:

| Section | File | Control pattern | Controls visible with row? |
|---|---|---|---|
| Featured (Headphones) | `featured/Featured.tsx` | Below-grid, in-flow | **No — verified 777px below fold** |
| DACs (Audio Electronics) | `dacs/Dacs.tsx` | Below-grid, in-flow (identical markup) | **No — same defect** |
| Accessories | `accessories/CategorySection.tsx` | Below-grid, in-flow (identical markup) | **No — same defect** |
| Newest Release | `newest-release/NewestRelease.tsx` | Overlaid on the slide (`absolute inset-y-0`) | Yes |
| Product Spotlight 1/2/3 | `product-spotlight-*/ProductSpotlight*.tsx` | Overlaid on the slide (`absolute bottom-4`) | Yes |

**This means the team already implements the correct pattern elsewhere in this exact codebase.** The fix is "apply the existing overlay pattern to the 3 grid-style sections," not "invent a new pattern." This lowers implementation risk and design-system risk considerably.

### 1.4 No alternate navigation path exists (verified)

Grepped `app/components/layout/carousel/` for `onKeyDown`, `keydown`, `onTouchStart`, `onPointerDown`, swipe/drag handling. **Zero matches.** The prev/next buttons and dots are the *only* way to change slides on any carousel in this app — there is no keyboard arrow-key support and no touch swipe/drag support in `CarouselContext.tsx` / `CarouselTrack.tsx`. This compounds the severity: when the sole controls are also unreachable without scrolling, there is no fallback interaction.

### 1.5 Adjacent dead code (verified, minor)

`app/components/features/homepage/featured/FeaturedControls.tsx` exports a control-row component that is **not imported anywhere** (`grep -r "FeaturedControls" app/` returns only its own file). `Featured.tsx` inlines its own controls instead. Also, `featured/index.ts` is a barrel file, which `.devin/rules.md` in this repo explicitly forbids ("Barrel Files (index.ts) - Anti-Pattern for Next.js 15"). Both are pre-existing, unrelated to this bug, listed as a separate low-priority chore below.

---

## 2. Best-practice basis (verified against current, authoritative sources)

Two primary sources checked (fetched directly, not summarized secondhand):

- **Baymard Institute, "10 UX Requirements for Homepage Carousels"** (updated, current as of 2026). Requirement #3 of 3 mandatory desktop+mobile requirements: *"Provide Prominent Manual Controls" — controls should be obvious at a glance, contrast well with the background, and be placed at each side of the carousel.* Baymard's own case-study examples of failure (Newegg, Ulta Beauty) are for controls that are small/easy to miss — same failure family as controls that are entirely off-screen, just a more severe version of it.
- **web.dev / Google, "Best practices for carousels."** Navigation section: *"Carousel navigation controls should be easy to click and highly visible... Provide alternate navigation paths [because] it's unlikely most users will engage with all carousel content"* and *"support mobile gestures."*

### 2.1 Correcting a possible false framing: this is not "fit everything above the fold"

Neither source says a carousel section must fit entirely in the first screen. That would be a bad generalization (Nielsen Norman Group's research on scrolling shows users scroll readily). The actual, narrower principle both sources state is **proximity/visibility of controls relative to the content currently in view** — the controls for a carousel row must be visible *together with* that row, not detached from it by an unrelated amount of additional scrolling. The fix target is control-to-content co-location, not viewport-height compression.

---

## 3. Assumption / false-positive checks performed

| Assumption | Result |
|---|---|
| "Maybe this is just how the screenshot was cropped, not a real defect" | **Rejected** — reproduced live via DOM measurement at the user's actual screen resolution, three independent runs |
| "Maybe this only affects the Featured section" | **Rejected** — identical defect confirmed in `Dacs.tsx` and `CategorySection.tsx` via source read |
| "Maybe the team doesn't have a correct pattern to reuse" | **Rejected** — `NewestRelease.tsx` / `ProductSpotlight1-3.tsx` already implement the correct overlay pattern in production |
| "Maybe keyboard/swipe compensates for unreachable buttons" | **Rejected** — grep confirms no keyboard or touch handlers anywhere in the carousel primitive |
| "Maybe `FeaturedControls.tsx` is used somewhere and is the real component to fix" | **Rejected** — confirmed unused via project-wide grep; `Featured.tsx` inlines its own controls instead |
| "Above the fold is the correct best-practice framing" | **Corrected** — the applicable principle is control/content co-location, not fold compression (see 2.1) |

---

## 4. Metrics: current vs. should-be

| Metric | Current | Should-be | Basis |
|---|---|---|---|
| Controls visible without scrolling past the row they control | 2/10 (777px below fold, measured) | 9/10 | Baymard Req. #3, web.dev nav best practices |
| Control-to-content spatial association | 2/10 (detached below full section) | 9/10 | Same as above; matches existing `NewestRelease` pattern in this repo |
| Consistency of interaction pattern across homepage carousels | 3/10 (2 conflicting patterns for grid vs. hero sections) | 9/10 | Internal consistency, reduces future dev/design drift |
| Alternate navigation paths (keyboard, swipe) | 1/10 (none) | 7/10 | web.dev "support mobile gestures" / "alternate navigation paths" |

---

## 5. Plan

Two separate, independently shippable pieces of work (per this repo's own beads convention: one feature = one clear boundary, don't bundle unrelated capabilities into one issue):

- **Issue A — Control placement fix** (the reported bug): overlay prev/next directly on the visible product row in `Featured.tsx`, `Dacs.tsx`, `CategorySection.tsx`, copying the exact pattern already proven in `NewestRelease.tsx`.
- **Issue B — Keyboard + swipe navigation** (adjacent gap found during investigation, not the reported bug, touches the shared primitive used by *every* carousel on the site — separate blast radius, separate issue).
- **Issue C — Chore** (dead code removal, trivial, unrelated): delete `FeaturedControls.tsx`.

Recommended fix for Issue A: reuse the exact overlay CSS already in `NewestRelease.tsx` lines 60-63 (`absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3 pointer-events-none`, buttons get `pointer-events-auto`), wrapped around each section's existing `<div className="relative">` that already contains `CarouselTrack`. Buttons already render as compact circular hit targets (`rounded-full p-2`) via `BTN_BASE` in `CarouselControls.tsx`, so overlaying them on the outer edge of the card row is consistent with the existing button component — no new component or token needed. Keep `CarouselDots` directly beneath the row (small vertical footprint) since dots are a secondary/supplementary control per Baymard, not primary navigation.

---

## Issue A — Fix carousel control placement (Featured, Dacs, Accessories)

### Phase A1 — `Featured.tsx` only

**File:** `app/components/features/homepage/featured/Featured.tsx`

**Current (lines 144-162):**
```tsx
<div className="relative">
  <CarouselTrack className="mx-0 w-full items-stretch md:-mx-3 md:w-[calc(100%+1.5rem)]">
    {featuredData.map((p, idx) => (
      <CarouselSlide key={p._id || idx} className="flex flex-col px-3">
        <FeaturedCard product={p} idx={idx} />
      </CarouselSlide>
    ))}
  </CarouselTrack>
</div>

<div className="flex items-center justify-center gap-3">
  <CarouselPrevious iconStyle="chevron" className="max-lg:h-9 max-lg:w-9 max-lg:border-0 max-lg:rounded-none max-lg:bg-transparent max-lg:hover:bg-transparent max-lg:!text-brand-800" />
  <CarouselDots truncate />
  <CarouselNext iconStyle="chevron" className="max-lg:h-9 max-lg:w-9 max-lg:border-0 max-lg:rounded-none max-lg:bg-transparent max-lg:hover:bg-transparent max-lg:!text-brand-800" />
</div>
```

**Target — arrows overlaid on the row (pattern copied from `NewestRelease.tsx`), dots kept directly under the row:**
```tsx
<div className="relative">
  <CarouselTrack className="mx-0 w-full items-stretch md:-mx-3 md:w-[calc(100%+1.5rem)]">
    {featuredData.map((p, idx) => (
      <CarouselSlide key={p._id || idx} className="flex flex-col px-3">
        <FeaturedCard product={p} idx={idx} />
      </CarouselSlide>
    ))}
  </CarouselTrack>

  {/* Arrows overlaid on the visible row — always in view with the content they control */}
  <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-1">
    <CarouselPrevious iconStyle="chevron" className="pointer-events-auto" />
    <CarouselNext iconStyle="chevron" className="pointer-events-auto" />
  </div>
</div>

<div className="flex justify-center pt-3">
  <CarouselDots truncate />
</div>
```

**Notes for Devin:**
- Do not change `<CarouselDots>`'s existing props/styling — only its position in the tree.
- The arrow overlay's `px-1` offset is a starting point, not a fixed spec — visually verify the arrows don't visually collide with card content at the `xl` breakpoint (3 cards) and the `mdPortrait`/`mdLandscape` breakpoints (2 cards) per `featuredBreakpointMap` in this same file. If arrows overlap card imagery awkwardly at any breakpoint, increase `px-1` → `px-2`/`px-3`, matching the `px-3` value already used in `NewestRelease.tsx`.
- Keep existing `max-lg:` styling removed only if arrows read fine at all breakpoints with the default (non-`max-lg`) `BTN_BASE` styling; if small-viewport tap targets look wrong, keep a responsive className variant — use judgment, this is a visual call, not a hard rule.

**DoD (binary):**
- [ ] `getBoundingClientRect()` of `[aria-label="Previous slide"]` inside the Featured `<article>` has `top < window.innerHeight` at 1280×800, 1366×768, 1536×864, and 1920×1080 viewport sizes (i.e., visible without additional scroll once the row itself is in view)
- [ ] Clicking prev/next still moves the carousel; dots still jump to the correct slide
- [ ] No visual overlap between arrow buttons and product card content at `xl`, `lgDesktop`, `mdLandscape`, `mdPortrait` breakpoints (manual screenshot check)
- [ ] "View All" link position/behavior unchanged
- [ ] No other file changed

---

### Phase A2 — `Dacs.tsx` only

**File:** `app/components/features/homepage/dacs/Dacs.tsx`

Same transformation as Phase A1, applied to lines 54-72 (identical current structure to Featured.tsx). Do not touch `Featured.tsx` or any other file in this phase — Phase A1 must be complete and verified first.

**DoD:** identical checklist to Phase A1, scoped to the Dacs `<article>` and the "Digital Sources" section.

---

### Phase A3 — `CategorySection.tsx` only

**File:** `app/components/features/homepage/accessories/CategorySection.tsx`

Same transformation, applied to lines ~54-67 (verify exact current line numbers before editing — this file wasn't fully read in this investigation, only its control-row block was confirmed identical via grep; read the full file first). Do not touch other files in this phase.

**DoD:** identical checklist to Phase A1/A2, scoped to the Accessories `<article>`.

---

## Issue B — Add keyboard + touch swipe navigation to the shared carousel primitive

**Files:** `app/components/layout/carousel/CarouselContext.tsx`, `app/components/layout/carousel/CarouselTrack.tsx`

This touches the primitive used by **every** carousel on the site (Featured, Dacs, Accessories, Newest Release, Product Spotlight 1-3, Catalogue nav). The diff should be small and additive (new event handlers only — do not restructure existing scroll/transform logic), but test across *all* carousel instances after this change, not just the three from Issue A.

### Phase B1 — Keyboard arrow-key navigation

Add a `onKeyDown` handler on the scrollable track container (`CarouselTrack.tsx`'s outer `div`, which already holds `ref={scrollRef}`) that calls the existing `scrollPrev`/`scrollNext` from `useCarousel()` on `ArrowLeft`/`ArrowRight`. Give the container `tabIndex={0}` so it's keyboard-focusable, and a `role`/`aria-label` appropriate for a focusable region (do not remove the existing `aria-roledescription="carousel"` already set in `CarouselRoot.tsx`).

**DoD:**
- [ ] Tabbing to the carousel track and pressing `ArrowLeft`/`ArrowRight` moves slides on Featured, Dacs, Accessories, Newest Release, and Product Spotlight 1-3
- [ ] No change to existing click/button behavior
- [ ] No layout shift introduced (focus ring only, per existing `focus-visible:ring-2` pattern already used in `CarouselControls.tsx`)

### Phase B2 — Touch swipe/drag navigation

Add pointer/touch handlers (`onTouchStart`/`onTouchEnd` or `onPointerDown`/`onPointerUp`, Devin's choice based on what's simplest given `CarouselTrack.tsx`'s current transform-based animation) to detect a horizontal swipe past a reasonable threshold (e.g., 40-50px) and call `scrollNext`/`scrollPrev` accordingly. Do not implement live drag-following of the finger unless trivial — a threshold-based swipe-to-advance is sufficient to close this gap.

**DoD:**
- [ ] Swiping left/right on a touch device (or Chrome DevTools touch emulation) moves slides on all carousel instances listed above
- [ ] Existing click/keyboard behavior from Phase B1 unaffected
- [ ] `CatalogueCarousel.tsx` (which already has its own `touch-pan-x snap-x` CSS scroll-snap behavior) is checked for conflicts — if native scroll-snap already handles touch there, do not double-handle; confirm no regression

---

## Issue C — Chore: remove dead code (trivial, unrelated to A/B)

**File to delete:** `app/components/features/homepage/featured/FeaturedControls.tsx`

Confirmed zero imports project-wide (`grep -r "FeaturedControls" app/` → only the file's own definition). Safe to delete with no other changes required.

Separately flag (do **not** fix in this task — needs its own scoped issue): `app/components/features/homepage/featured/index.ts` is a barrel file, which this repo's own `.devin/rules.md` prohibits for Next.js 15. Leave as-is; note it for a future cleanup issue.

**DoD:**
- [ ] `FeaturedControls.tsx` deleted
- [ ] `npx tsc --noEmit` shows no new errors
- [ ] No other file changed

---

## 6. Verification phase (after Issues A, B, C are all complete)

- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npm run build` — succeeds
- [ ] Manual check at 1280×800, 1366×768, 1536×864, 1920×1080: on Featured, Dacs, and Accessories sections, prev/next arrows are visible in the same scroll position as the product row (no extra scroll needed to find them)
- [ ] Manual check: keyboard arrow-key navigation and touch swipe work on all 7 homepage carousel instances (Featured, Dacs, Accessories, Newest Release, Spotlight 1/2/3)
- [ ] Manual check: mobile breakpoints (single-card view) still look and behave correctly — no regression from the overlay change
- [ ] No console errors introduced

Recommend adding a Playwright check under `docs/homepage/__tests__/` (per this repo's test-location convention in `.devin/rules.md`) that asserts, for each of the three grid carousels, `previousButton.boundingBox().y < viewportHeight` at a fixed viewport size — turns this from a manual check into a regression guard.

---

## 7. Out of scope — do not implement in this task

- **`iconStyle` prop dead code in `CarouselControls.tsx`:** `CarouselPrevious`/`CarouselNext` accept an `iconStyle="caret" | "chevron"` prop but always render `CaretLeft`/`CaretRight` regardless of its value — the prop is destructured but never branches the icon. Pre-existing, unrelated to this bug. Do not fix here; file separately if desired.
- **`featured/index.ts` barrel file:** violates this repo's own no-barrel-files rule. Pre-existing, unrelated. Do not fix here.
- **Redesigning the carousel visually** (colors, card layout, spacing) — only control placement and navigation input methods are in scope.
- **`CatalogueCarousel.tsx` navigation drawer carousel** — different UX context (full-screen nav, not a homepage product row); not part of this task beyond the swipe-conflict check in Phase B2.

---

## 8. Files touched

| File | Issue | Action |
|---|---|---|
| `app/components/features/homepage/featured/Featured.tsx` | A1 | Modify — control overlay placement |
| `app/components/features/homepage/dacs/Dacs.tsx` | A2 | Modify — control overlay placement |
| `app/components/features/homepage/accessories/CategorySection.tsx` | A3 | Modify — control overlay placement |
| `app/components/layout/carousel/CarouselTrack.tsx` | B1, B2 | Modify — keyboard + touch handlers |
| `app/components/layout/carousel/CarouselContext.tsx` | B1 | Modify — expose focus/keydown wiring if needed |
| `app/components/features/homepage/featured/FeaturedControls.tsx` | C | Delete |

**Files NOT touched:** `NewestRelease.tsx`, `ProductSpotlight1/2/3.tsx` (already correct — reference only), `CarouselControls.tsx` (no change needed for A or B), `CarouselRoot.tsx`, `CarouselSlide.tsx`, `tailwind.config.ts`.

---

## 9. Filing as beads issues

`bd` was not reachable in the environment this plan was written in, so issues were not created directly. Per this repo's `add-beads-issue.md` convention, file **three separate issues** (one feature = one issue):

```
bd create --type bug --title "Homepage grid carousels: controls not visible without extra scroll"
# Scope 1: Phase A1 (Featured.tsx) — Objective + DoD from section "Phase A1" above, link this file
# Scope 2: Phase A2 (Dacs.tsx)
# Scope 3: Phase A3 (CategorySection.tsx)

bd create --type feature --title "Homepage carousels: keyboard + touch swipe navigation"
# Scope 1: Phase B1 (keyboard)
# Scope 2: Phase B2 (touch swipe)

bd create --type chore --title "Remove unused FeaturedControls.tsx"
```

Each `bd` scope's "Intelligence link" should point to this file: `docs/devin-carousel-controls-ux-tasks.md`.
