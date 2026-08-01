# Devin Task Plan — Carousel Arrow Visual Refinement (Featured section)

**Supersedes, for arrow styling only:** the overlay-on-cards arrow treatment shipped in `docs/devin-carousel-controls-ux-tasks.md` Phase A1. That doc's Issue B (keyboard/swipe) and Issue C (dead code) are untouched and still valid — not part of this task.

**Scope (verbatim, nothing else):** carousel arrows become larger bare chevrons, color `brand-400`, no background box; positioned outside the product-card row, not overlapping it; product cards on desktop shrink slightly to make room, using the existing Tailwind spacing scale; preserve visual harmony and proportional relationships. Nothing else changes.

---

## 1. Intelligence gathered (current live state, verified by reading the actual file)

`Featured.tsx` currently renders (lines 156-167):
```tsx
<div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-1">
  <CarouselPrevious iconStyle="chevron" variant="dark" className="pointer-events-auto bg-brand-100/90 hover:bg-brand-200/90" />
  <CarouselNext iconStyle="chevron" variant="dark" className="pointer-events-auto bg-brand-100/90 hover:bg-brand-200/90" />
</div>
```

This is what produced the screenshot the user flagged as "terrible": `bg-brand-100/90` fills each button with a near-opaque light block. `BTN_BASE` in `CarouselControls.tsx` (line 9-16) sets `rounded-full`, so the shape itself should render as a circle — the "square" impression in the screenshot is the button sitting at the vertical midpoint of the **whole card** (image + name + price + Add button, since the arrow overlay is centered against the full `CarouselTrack` height, not just the image), landing across the boundary between the card's light `bg-surface-productImage` image panel and the dark `bg-brand-900` section background. That inconsistent backdrop, plus the semi-opaque fill, is what reads as an awkward box rather than a clean icon.

Two things this confirms and rules out:
- The fix isn't "round the corners more" — the shape is already round. The fix is removing the fill and moving the arrow off the card entirely, onto the uniform dark section background, where a bare `brand-400` icon will have clean, consistent contrast.
- Icon size is hardcoded: `CarouselControls.tsx` renders `<CaretLeft size={24} weight="light" />` / `<CaretRight size={24} .../>` with no size prop exposed. "Bigger chevrons" requires a small additive change to that shared component (optional `size` prop, default stays `24` so every other carousel on the site — Dacs, Accessories, Newest Release, Product Spotlights — is unaffected).
- `brand-400` is not an arbitrary pick — it's already the resting color of the "View All" link two lines above the carousel in this exact file (`text-brand-400 ... hover:text-brand-100`, line 139). Using `text-brand-400` → `hover:text-brand-100` for the arrows reuses an established color relationship already present in this section, which is the most minimal way to guarantee "visual harmony" rather than inventing a new color pairing.
- Container math: the section wraps content in `mx-auto max-w-content px-6 lg:px-8` (`max-w-content` = `1280px`, confirmed in `tailwind.config.ts`). The design-system spacing scale explicitly defines `spacing-12 = 3rem (48px)` and `spacing-16 = 4rem (64px)` as named tokens (not just default Tailwind fallbacks — they're declared explicitly in `tailwind.config.ts`), so either is a legitimate "respect the spatial system" choice for the new arrow gutter.

---

## 2. Gap-scan: assumptions checked, false positives, red flags, overcomplication risks

| Check | Finding |
|---|---|
| Is the button shape actually the problem (needs more `border-radius`)? | **No** — already `rounded-full`. Root cause is the fill color + inconsistent backdrop (light image vs. dark section), not shape. |
| Does "outside the row" mean outside the whole `max-w-content` container (in the page's outer margin)? | **Rejected as the mechanism** — at common widths like 1280–1366px, `max-w-content` (1280px) leaves ~0-40px of page margin, not enough for a comfortable arrow, and it would vary unpredictably by viewport. **Correct mechanism:** free up room *inside* the container by shrinking the row itself, so the gutter exists at every desktop width consistently, not just wide monitors. This is also the direct implementation of "cards should be made slightly smaller anyway." |
| Will "bigger chevrons" require restyling the shared button for every carousel site-wide? | **No, and doing so would be a red flag (out of scope, wider blast radius than requested).** Add an optional `size` prop to `CarouselPrevious`/`CarouselNext` with the existing `24` as default — zero effect on Dacs, Accessories, Newest Release, Product Spotlight 1-3. Only `Featured.tsx` passes a larger explicit value. |
| Does removing the card-overlap change the CarouselTrack's existing bleed math (`md:-mx-3 md:w-[calc(100%+1.5rem)]`)? | **Real risk, flagged for verification, not assumed safe.** That bleed compensates the `CarouselSlide`'s own `px-3` gutter so edge cards align with the container. Adding new horizontal inset on the *outer* wrapper is independent of that inner bleed math (different element), but Devin must visually confirm card edges still align cleanly after the change — do not assume, verify. |
| Does hiding/changing arrows at desktop remove mobile/tablet navigation? | **Real risk if not scoped carefully.** The current overlay has no responsive breakpoint gating — it renders identically at all sizes. The new "outside the row" treatment only makes geometric sense at the 3-up desktop layout (`lg:` and up); mobile/tablet (1-2 cards) don't have spare horizontal room for the same treatment. Scope the new gutter + arrow position to `lg:` and above only, and **do not remove or degrade the existing mobile/tablet tap targets** — carry forward equivalent-functioning arrows below `lg` unchanged in behavior. This keeps the change additive rather than regressive for smaller screens, without expanding scope to "redesign mobile" (which the user did not ask for). |
| Overcomplication check: does this need a new component, a new design token, or JS changes? | **No.** This is achievable with: one small additive prop on an existing component, and className/layout changes in one file (`Featured.tsx`). No new files, no new tokens (reusing `brand-400`/`brand-100` and existing `spacing-12`/`spacing-16`), no logic changes. |
| Does this affect Dacs.tsx / CategorySection.tsx? | **Not in this task.** They currently still have the *original* below-row control layout (never updated to the overlay pattern this conversation is now revising). Touching them is explicitly out of scope per the user's "only the above objective" instruction. Once this pattern is verified on `Featured.tsx`, it can be proposed as a separate, later task to bring Dacs/Accessories in line — not bundled here. |

---

## 3. Objective broken into chunks

1. **Enable bigger icons** — add an optional `size` prop to the shared `CarouselPrevious`/`CarouselNext` (default unchanged).
2. **Strip the background box** — remove `bg-brand-100/90`/`hover:bg-brand-200/90`, replace with transparent + `text-brand-400` / `hover:text-brand-100`.
3. **Create room outside the row** — add a `lg:` horizontal inset to the row's wrapper (shrinks cards slightly, consistent at every desktop width).
4. **Reposition the arrows into that new gutter** — anchor the overlay to the *outer* (now-inset) wrapper edges instead of hugging the card row's own edges.
5. **Preserve mobile/tablet** — confirm below-`lg` behavior is unchanged in function (still tappable, still visible), even though it doesn't get the new "outside the row" treatment.

---

## 4. Plan + sequence

Chunks 1 and 2-4 touch different files and have no dependency conflicts with each other, but chunk 1 (the `size` prop) must exist before `Featured.tsx` can request a larger icon — so it goes first. Chunks 2-4 are all within `Featured.tsx` and are small enough to do as one verified phase (they're one visual change, not three independent ones — splitting them further would be artificial). Chunk 5 is a verification checklist, not a code change.

**Sequence:**
1. `CarouselControls.tsx` — add `size` prop (isolated, low-risk, reused everywhere but backward-compatible)
2. `Featured.tsx` — apply new arrow styling + row inset + reposition (one file, one visual outcome)
3. Verify — measure and screenshot-check before calling it done

---

## 5. Plan verification (against objective + scope + risk table above)

- Bigger chevrons, no background, `brand-400` → satisfied by Phase steps 1-2.
- Outside the row, not overlapping cards → satisfied by the `lg:` inset + reposition in step 2; mechanism chosen specifically to avoid the rejected "depends on viewport margin" approach from the gap-scan.
- Cards slightly smaller on desktop → satisfied as a direct side effect of the same inset (not a separate resize hack — one change serves both requirements, which is the "minimal steps" outcome the user asked for).
- Visual harmony / proportional relationships → color pairing reused from the existing "View All" link in the same file; spacing token reused from the design system's own declared scale (`spacing-12`/`spacing-16`), not an arbitrary pixel value.
- Nothing else touched → Dacs, Accessories, keyboard/swipe nav (Issue B), dead-code cleanup (Issue C) all explicitly left alone; confirmed no other file needs to change to achieve the stated objective.

---

## Phase 1 — `CarouselControls.tsx`: add optional icon size

**File:** `app/components/layout/carousel/CarouselControls.tsx`

Add `size?: number` to both `CarouselPreviousProps` and `CarouselNextProps` (default `24`, matching current hardcoded value), and pass it to the icon:

```tsx
interface CarouselPreviousProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  iconStyle?: "caret" | "chevron";
  variant?: "default" | "dark";
  size?: number;
}

export function CarouselPrevious({ className, iconStyle = "caret", variant = "default", size = 24, ...props }: CarouselPreviousProps) {
  ...
  <CaretLeft size={size} weight="light" />
```

Mirror the same for `CarouselNext` / `CaretRight`. Do not touch `CarouselDots`, `CarouselIndicator`, `BTN_BASE`, or `ARROW_VARIANT`.

**DoD:**
- [ ] `size` prop added to both components, default `24`
- [ ] No other carousel instance (Dacs, Accessories, Newest Release, Product Spotlight 1-3) changes visually — they don't pass `size`, so they keep rendering at `24`
- [ ] `npx tsc --noEmit` clean

---

## Phase 2 — `Featured.tsx`: reposition and restyle arrows, inset the row

**File:** `app/components/features/homepage/featured/Featured.tsx`

**Current (lines 144-168):**
```tsx
<div className="relative">
  <CarouselTrack className="mx-0 w-full items-stretch md:-mx-3 md:w-[calc(100%+1.5rem)]">
    {featuredData.map((p, idx) => (
      <CarouselSlide key={p._id || idx} className="flex flex-col px-3">
        <FeaturedCard product={p} idx={idx} />
      </CarouselSlide>
    ))}
  </CarouselTrack>

  <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-1">
    <CarouselPrevious iconStyle="chevron" variant="dark" className="pointer-events-auto bg-brand-100/90 hover:bg-brand-200/90" />
    <CarouselNext iconStyle="chevron" variant="dark" className="pointer-events-auto bg-brand-100/90 hover:bg-brand-200/90" />
  </div>
</div>
```

**Target — direction, not a pixel-locked spec:**
```tsx
<div className="relative lg:px-12">
  <CarouselTrack className="mx-0 w-full items-stretch md:-mx-3 md:w-[calc(100%+1.5rem)]">
    {featuredData.map((p, idx) => (
      <CarouselSlide key={p._id || idx} className="flex flex-col px-3">
        <FeaturedCard product={p} idx={idx} />
      </CarouselSlide>
    ))}
  </CarouselTrack>

  <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between">
    <CarouselPrevious
      iconStyle="chevron"
      size={36}
      className="pointer-events-auto bg-transparent text-brand-400 hover:bg-transparent hover:text-brand-100 max-lg:static max-lg:h-9 max-lg:w-9"
    />
    <CarouselNext
      iconStyle="chevron"
      size={36}
      className="pointer-events-auto bg-transparent text-brand-400 hover:bg-transparent hover:text-brand-100 max-lg:static max-lg:h-9 max-lg:w-9"
    />
  </div>
</div>
```

**What each change does:**
- `lg:px-12` on the outer `relative` wrapper: shrinks the track (and therefore each card) slightly at desktop only, and simultaneously creates the exact gutter the arrows will sit in — one change serving both stated requirements. `mobile/tablet get no `px-12`, so their layout is untouched.
- Overlay wrapper's `px-1` removed: the arrows now anchor to the *outer* edges of the `lg:px-12`-inset wrapper, landing in the new gutter automatically, instead of hugging the row's own edge.
- `bg-transparent` + `text-brand-400` + `hover:text-brand-100` replaces the filled `bg-brand-100/90` treatment — reuses the exact color pair already used by "View All" in this file.
- `size={36}` — bigger chevron (from `24`); adjust up/down during visual QA if `36` doesn't feel right against the section's proportions — this is a starting value, not a hard requirement.
- `variant="dark"` removed — with a transparent background, the default variant's `text-brand-400` styling (via the `className` override) is what matters; `variant="dark"` was only ever relevant to the old filled-button treatment.
- `max-lg:static max-lg:h-9 max-lg:w-9` on each button: keeps the **existing** below-desktop tap-target sizing/behavior intact (this mirrors the sizing this file used *before* the overlay-on-cards change), so mobile/tablet isn't silently degraded by a desktop-focused redesign. If Devin finds this doesn't look right in context once implemented, treat it as a mobile-preservation checkpoint to fix, not something to drop.

**DoD (binary):**
- [ ] At `lg` and above (1024px+), arrows render as bare chevrons (no visible background box) in `brand-400`, positioned clearly outside the card row — not overlapping any card
- [ ] Card row is visibly narrower than before at desktop (slightly smaller cards), while the 3-card layout, gaps, and aspect ratios are otherwise unchanged
- [ ] Card left/right edges still align cleanly with each other and with the row's own bleed math — no visual misalignment introduced by the new `lg:px-12` inset (visual check, not assumed)
- [ ] Below `lg` (mobile/tablet), arrows remain visible and tappable, same functional behavior as before this change
- [ ] Clicking/tapping prev/next still moves the carousel; dots still work and are unaffected (not touched in this phase)
- [ ] "View All" link and header unaffected
- [ ] No other file changed besides `CarouselControls.tsx` (Phase 1) and `Featured.tsx`

---

## Phase 3 — Verify

- [ ] `npx tsc --noEmit` — zero errors
- [ ] Screenshot at 1280×800, 1440×900, 1536×864, 1920×1080 — arrows sit outside the row, no background box, consistent contrast against the dark section background at every width
- [ ] Screenshot at a mobile width (e.g., 390×844) and a tablet width (e.g., 768×1024) — confirm no regression versus current behavior
- [ ] Side-by-side visual comparison against the "View All" link's color treatment in the same file to confirm the color reuse reads as intentional/harmonious, not coincidental

---

## Out of scope for this task (explicit, per user instruction)

- Dacs (`dacs/Dacs.tsx`) and Accessories (`accessories/CategorySection.tsx`) — still on the original below-row layout, not touched here
- Keyboard navigation / touch swipe (Issue B in the prior plan doc)
- `FeaturedControls.tsx` dead-code removal (Issue C in the prior plan doc)
- `iconStyle` prop's non-functional caret/chevron branching in `CarouselControls.tsx` (pre-existing, unrelated)
- Any change to card content, pricing, or the Add-to-cart button

---

## Files touched

| File | Action |
|---|---|
| `app/components/layout/carousel/CarouselControls.tsx` | Modify — add optional `size` prop, default unchanged |
| `app/components/features/homepage/featured/Featured.tsx` | Modify — row inset, arrow reposition/restyle, mobile preserved |

**Files NOT touched:** everything else, including `Dacs.tsx`, `CategorySection.tsx`, `CarouselContext.tsx`, `CarouselTrack.tsx`, `NewestRelease.tsx`, `ProductSpotlight1/2/3.tsx`, `tailwind.config.ts`.

---
---

# Round 2 — Arrow prominence + card sizing (post-implementation feedback)

Phases 1-3 above were implemented and are live. User feedback on the result (screenshot review): arrows still read as too small/thin relative to the cards and sit too close to them; separately, the product cards themselves should be somewhat smaller for overall desktop visual harmony. Two distinct objectives, tracked and planned separately below, per user instruction. **Everything not named in either objective is out of scope**, same as Round 1.

Note on method: live DOM measurement via the browser automation tool was attempted for this round but the tool returned unreliable/zeroed results (timeouts, zero-size bounding rects) partway through — this is disclosed rather than papered over. Intelligence below is instead grounded in a direct re-read of the current, live source of `Featured.tsx` and `CarouselControls.tsx` (exact, not approximate) plus the user-provided screenshot as visual evidence. Where an exact pixel value matters, it's derived from CSS box-model arithmetic against the real classNames in the file, not guessed.

---

## Objective 1 — Arrows: bigger, bolder, more distance from the cards

### Intelligence gathered

Current live code (`Featured.tsx`, confirmed by re-reading the file just now):
```tsx
<div className="relative lg:px-12">
  ...
  <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between">
    <CarouselPrevious iconStyle="chevron" size={36} className="pointer-events-auto bg-transparent text-brand-400 hover:bg-transparent hover:text-brand-100 max-lg:static max-lg:h-9 max-lg:w-9" />
    <CarouselNext iconStyle="chevron" size={36} className="pointer-events-auto bg-transparent text-brand-400 hover:bg-transparent hover:text-brand-100 max-lg:static max-lg:h-9 max-lg:w-9" />
  </div>
</div>
```
And in `CarouselControls.tsx`, the icon weight is hardcoded, not exposed as a prop:
```tsx
<CaretLeft size={size} weight="light" />
```

**Two concrete, verifiable findings, not just "it looks small":**

1. **Icon weight is stuck at Phosphor's `"light"` weight** — the thinnest usable stroke in the Phosphor icon set short of `"thin"`. There is currently no way to make it bolder without editing the component, because `weight` isn't a prop yet.
2. **The gutter is mathematically too tight for the button that's in it — this is a real CSS box-model bug, not just a visual impression.** `lg:px-12` = 48px of gutter. The button itself, at `size={36}` plus `BTN_BASE`'s `p-2` (8px padding on all sides), occupies a 36 + 8 + 8 = **52px** box. Because the arrow-overlay div is absolutely positioned with `left-0 right-0` against the padding box of the `relative lg:px-12` wrapper, the button's box starts at the wrapper's outer edge and is 4px *wider* than the 48px gutter it needs to fit inside — so the button box actually overlaps ~4px into where the card row begins. That is the objective, measurable cause of "too close": it isn't just tight, it's slightly overlapping by design math.

### Gap-scan: assumptions, false positives, red flags, overcomplication

| Check | Finding |
|---|---|
| Is "too small" purely subjective? | No — verifiable against the specific Phosphor `weight` value in the source (`"light"`, the second-thinnest of six weights) and the fixed `size={36}` against cards that render at several hundred px wide. |
| Is "too close" purely subjective? | No — box-model arithmetic above shows the button box (52px) is larger than its own gutter (48px), i.e. a real overlap, not just a tight-but-correct gap. |
| Does fixing this require touching the shared component in a way that affects other carousels? | Only additively. `weight` will be added as a new optional prop defaulting to `"light"` (today's hardcoded value) — Dacs, Accessories, Newest Release, and Product Spotlight 1-3 don't pass it, so their rendering is byte-for-byte unchanged. |
| Does widening the gutter require a `tailwind.config.ts` change? | **No.** The target gutter width (see plan below) is `80px`, which is Tailwind's own default `spacing-20` token (`5rem`) — already available without any config edit. No permission is needed or used for this objective. |
| Risk: does a wider gutter + bigger icon change mobile/tablet? | No — the gutter (`lg:px-12` → `lg:px-20`) and the `size`/`weight` overrides are only applied inside the `lg:` breakpoint scope in `Featured.tsx`; the `max-lg:` classes already carried over from Round 1 are untouched, so below-`lg` rendering is unaffected. |
| Overcomplication check: new component, new token, animation, JS logic? | None needed. One new prop (`weight`) on an existing component, and three className/prop value changes in one file. |

### Plan

1. `CarouselControls.tsx` — add `weight` prop (mirrors the existing `size` prop pattern exactly: optional, default `"light"`).
2. `Featured.tsx` — bump `size={36}` → `size={48}`, add `weight="bold"`, and widen `lg:px-12` → `lg:px-20` (48px → 80px gutter) so the larger/bolder button has genuine breathing room on both sides instead of overlapping the row.

### Devin phases

**Phase R2-1 — `CarouselControls.tsx`: add optional icon weight**
- Add `weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone"` to both `CarouselPreviousProps` and `CarouselNextProps`, default `"light"`.
- Pass it through: `<CaretLeft size={size} weight={weight} />` / `<CaretRight size={size} weight={weight} />`.
- Do not touch `size`, `BTN_BASE`, `ARROW_VARIANT`, `CarouselDots`, or `CarouselIndicator`.
- **DoD:** prop added, default `"light"`; every other carousel call site (Dacs, Accessories, Newest Release, Product Spotlight 1-3) renders identically since none pass `weight`; `npx tsc --noEmit` clean.

**Phase R2-2 — `Featured.tsx`: apply bigger/bolder/further-spaced arrows**
- Change the wrapper `className="relative lg:px-12"` → `className="relative lg:px-20"`.
- On both `CarouselPrevious` and `CarouselNext`: change `size={36}` → `size={48}`, add `weight="bold"`.
- Do not change color (`text-brand-400`/`hover:text-brand-100`), positioning structure, or the `max-lg:` mobile overrides.
- **DoD:**
  - [ ] Arrows visibly larger and bolder-stroked than the current live state
  - [ ] Clear visual gap between each arrow and the nearest card edge at 1280px, 1440px, 1536px, 1920px widths — no overlap (re-verify the box-model math holds: 48px icon + 16px padding = 64px button in an 80px gutter = 16px genuine clearance)
  - [ ] Mobile/tablet (`max-lg:`) rendering unchanged from current live state
  - [ ] No other file changed

### One-paragraph summary — Objective 1

Devin will make two small, sequenced edits: first add an optional `weight` prop to the shared `CarouselPrevious`/`CarouselNext` components (defaulting to the current `"light"` value, so nothing else on the site changes), then in `Featured.tsx` alone bump the arrows from `size={36}` to `size={48}` with `weight="bold"`, and widen the gutter they sit in from `48px` to `80px` (`lg:px-12` → `lg:px-20`, an existing default Tailwind value — no config changes needed) — this directly fixes a real, measurable box-model overlap where the current 52px button doesn't actually fit in its current 48px gutter, which is the precise cause of the "too close" look.

---

## Objective 2 — Product cards somewhat smaller (desktop only), isolated change

### Intelligence gathered

The 3-card row's width is currently governed entirely by its container: `mx-auto max-w-content` (1280px, sitewide token) at the page level, then `lg:px-12` (soon `lg:px-20` per Objective 1) at the row level, with each card's width being `100% ÷ visibleCount` (3) of whatever width remains — confirmed in `CarouselTrack.tsx`'s `flexBasis: calc(100% / var(--visible-count, 1))`. There is currently no dedicated width constraint on the row *specifically* — its size is a byproduct of the sitewide container and the arrow gutter, not a deliberate design decision about card size.

### Gap-scan: assumptions, false positives, red flags, overcomplication

| Check | Finding |
|---|---|
| Will Objective 1's wider gutter (`lg:px-20`) already shrink the cards somewhat, on its own? | **Yes, partially** — going from a 48px to an 80px gutter on each side removes an additional 64px total from the row's available width, which will already make cards a bit smaller as a side effect. **Sequencing conclusion: implement and screenshot-verify Objective 1 first, then judge how much *additional* shrink is still needed for "professional harmony" before applying Objective 2** — this avoids guessing a shrink percentage blind and then over-correcting. |
| Is a `tailwind.config.ts` change actually the more system-coherent path here, given permission was granted? | **Evaluated and declined for now.** A named token (e.g. a new `maxWidth` entry) would only earn its keep if the same value is reused elsewhere — but Dacs and Accessories are explicitly out of scope for this task (per Round 1's own scoping) and haven't been touched with this pattern yet. Introducing a sitewide config token for a single, single-file use right now is premature abstraction — exactly the kind of unnecessary step this gap-scan is meant to catch. This file already uses local arbitrary-value Tailwind utilities elsewhere (`md:w-[calc(100%+1.5rem)]`), so a local arbitrary max-width value is consistent with the codebase's existing idiom, not a deviation from it. **Recommendation: use a local value in `Featured.tsx` now; promote it to a named `tailwind.config.ts` token later, only if/when Dacs and Accessories actually get the same treatment** (at which point three real usages justify a token). This declines the granted permission on the merits, not out of caution for its own sake. |
| Will constraining the row's width affect the "3 cards visible" logic (`featuredBreakpointMap: { xl: 3, lgDesktop: 3 }`)? | No — that map is pagination/scroll-math only (how many slides to advance per click, how many dots), driven by JS, not CSS. Capping the row's rendered width still fits exactly 3 cards, just smaller ones, via the existing `calc(100% / 3)` flex-basis — no JS change needed. |
| Will this affect anything outside `Featured.tsx`? | No — the constraint is applied to the same `relative` wrapper already scoped to this file only. |

### Plan

After Objective 1 is live and visually re-checked: add a `lg:max-w-[...] lg:mx-auto` constraint directly to the existing `<div className="relative lg:px-20 ...">` wrapper. This caps and centers the whole row-plus-arrows assembly inside the section container, shrinking all 3 cards proportionally via the flex-basis math that already exists — no other mechanism needed. Starting value: `1040px` (roughly an 18% reduction from the current ~1280px-minus-gutter working width) — Devin should treat this as a starting point for visual judgment against "professional harmony," not a locked spec; adjust up or down based on the actual screenshot, not the number in isolation.

### Devin phases

**Phase R2-3 — Re-check after Objective 1, before touching cards**
- With Objective 1 (Phase R2-1, R2-2) already live, take a fresh screenshot at 1280×800, 1440×900, 1536×864, 1920×1080.
- Judge: do the cards still look oversized relative to a "professional e-commerce grid" (reference points: comfortable margin around each card, image-to-card-padding ratio, no single element visually dominating the row)? Record this judgment before proceeding — this is a checkpoint, not a code change.

**Phase R2-4 — `Featured.tsx`: add a dedicated row max-width**
- On the same wrapper touched in Phase R2-2 (`className="relative lg:px-20"`), add `lg:max-w-[1040px] lg:mx-auto`, giving `className="relative lg:px-20 lg:max-w-[1040px] lg:mx-auto"`.
- Do not change `featuredBreakpointMap`, `CarouselTrack`, `CarouselSlide`, or any card-internal markup (`FeaturedCard`, image sizes, text, button).
- **DoD:**
  - [ ] At `lg`+ widths, the row (cards + arrows) renders visibly narrower/more compact than the Phase R2-3 baseline, while still showing exactly 3 cards
  - [ ] Card internal proportions (image aspect ratio, text size, button size) are unchanged — only the row's overall width/scale changed, not the card's internal design
  - [ ] Mobile/tablet breakpoints unchanged (the new class is `lg:`-scoped only)
  - [ ] No file other than `Featured.tsx` changed; `tailwind.config.ts` untouched
  - [ ] `npx tsc --noEmit` clean

### One-paragraph summary — Objective 2

After Objective 1 ships, Devin will take a fresh look at the cards and, if they still look oversized, add a single new Tailwind class (`lg:max-w-[1040px] lg:mx-auto`, starting value to adjust visually if needed) to the same row wrapper already used for the arrow gutter in `Featured.tsx` — this caps and centers the whole row so all 3 cards shrink together at desktop widths only, with no changes to card content, breakpoint logic, or any other file; a `tailwind.config.ts` change was evaluated (and permission for it was noted) but is being deliberately skipped for now since a local value is just as effective, lower-risk, and matches how this file already handles similar sizing elsewhere — worth promoting to a shared config token later only if this same treatment gets applied to the Dacs and Accessories sections too.

---

## Files touched — Round 2

| File | Objective | Action |
|---|---|---|
| `app/components/layout/carousel/CarouselControls.tsx` | 1 | Modify — add optional `weight` prop, default unchanged |
| `app/components/features/homepage/featured/Featured.tsx` | 1, 2 | Modify — gutter width, icon size/weight, row max-width |

**Files NOT touched in Round 2:** `tailwind.config.ts` (evaluated, declined — see gap-scan), `Dacs.tsx`, `CategorySection.tsx`, `CarouselContext.tsx`, `CarouselTrack.tsx`, `CarouselSlide.tsx`, `NewestRelease.tsx`, `ProductSpotlight1/2/3.tsx`.
