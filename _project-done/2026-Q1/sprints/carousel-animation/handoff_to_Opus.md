# Featured Carousel Animation — Handoff to Claude Opus

## Objective

Add a **smooth conveyor-belt animation** to the `Featured` carousel component on the homepage.
The desired effect: when the user clicks prev/next, all visible slides smoothly slide left or right as a unified horizontal belt — like a physical conveyor belt. Professional, lean, zero regressions.

---

## Current State (Clean Baseline)

The codebase is at **exact HEAD** with zero animation-related changes. There is currently NO animation on the Featured carousel — navigation is instant (no visible motion).

Verify clean state: `git diff HEAD -- app/components/features/homepage/featured/` should be empty.

---

## Architecture — Full Picture

### File Locations

| File | Role |
|---|---|
| `app/components/layout/carousel/CarouselContext.tsx` | Brain — state, scroll logic |
| `app/components/layout/carousel/CarouselTrack.tsx` | Scrollable container |
| `app/components/layout/carousel/CarouselSlide.tsx` | Individual slide + IntersectionObserver |
| `app/components/layout/carousel/CarouselRoot.tsx` | Server-compatible shell + provider |
| `app/components/layout/carousel/CarouselControls.tsx` | Prev/Next/Dots buttons |
| `app/components/features/homepage/featured/Featured.tsx` | **Server component** consumer |
| `app/components/features/homepage/product-spotlight-1/ProductSpotlight1.tsx` | Reference — working animation example |

### CarouselContext.tsx — Critical Details

```ts
// The scroll function — THIS is where the conveyor belt must come from
const scroll = useCallback((direction: 'prev' | 'next') => {
  const el = scrollRef.current;
  if (!el || !el.firstElementChild) return;
  const slideWidth = (el.firstElementChild as HTMLElement).offsetWidth;
  const moveAmount = direction === 'next' ? slideWidth : -slideWidth;
  el.scrollBy({ left: moveAmount, behavior: "smooth" }); // ← this is the problem
}, []);

// activeIndex is derived from scroll events, NOT set on button click
// It fires mid-scroll as the user scrolls, not at the START of navigation
setActiveIndex(Math.round(el.scrollLeft / slideWidth)); // in scroll event listener
```

**Key facts:**
- `activeIndex` is updated via `scroll` event listener as scrolling progresses — NOT synchronously when a button is clicked
- `visibleCount` is set from `breakpointMap` + window width
- `--visible-count` CSS variable is set on the context wrapper div

### CarouselTrack.tsx — Critical Classes

```
overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar
```

The track is an `overflow-x-auto` div. Native scroll drives all motion.

### CarouselSlide.tsx — IntersectionObserver Hook

```ts
new IntersectionObserver(([entry]) => {
  node.dataset.active = entry.isIntersecting ? "true" : "false";
}, { root: track, threshold: 0.6 })
```

- Sets `data-active="true/false"` DOM attribute on each slide
- Only fires when a slide crosses 60% visibility threshold in the track
- This is the per-slide CSS hook for `data-[active=true]:` Tailwind variants

### Featured.tsx — Critical Grid Layout

```tsx
// Featured.tsx is a SERVER COMPONENT
<div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
  <div className="md:col-start-1 md:row-start-1">   {/* title */}
  </div>

  <CarouselTrack className="w-full relative mx-0 items-stretch md:-mx-3 md:col-span-full md:row-start-2">
    {/* slides */}
  </CarouselTrack>

  <div className="md:col-start-2 md:row-start-1">   {/* controls */}
  </div>
</div>
```

**CRITICAL CONSTRAINT**: `CarouselTrack` is a **direct CSS grid child** with `md:col-span-full md:row-start-2`. Any wrapper div inserted between the grid container and CarouselTrack MUST carry those two grid placement classes — otherwise the controls disappear and the layout collapses. This caused the worst regression in prior attempts.

### ProductSpotlight1.tsx — The Working Animation Reference

```tsx
<CarouselSlide
  className="opacity-0 scale-95 transition-[opacity,transform] duration-500 ease-out
             data-[active=true]:opacity-100 data-[active=true]:scale-100"
>
```
Per-slide CSS transitions via `data-active`. This works cleanly. Only 1 slide visible at a time, so it gives a clean zoom-in effect. This is the ONLY working animation in the codebase.

---

## The Core Problem — Why Native Scroll Is Instant

**The most critical discovery**: `scroll-behavior: smooth` + `scrollBy({ behavior: 'smooth' })` is **producing no visible animation** for this user. The slide shift is instant. The "conveyor belt doesn't exist at all."

Likely causes (one or more):
1. **`scroll-snap-type: x mandatory`** — in some browsers/versions, mandatory snap can override smooth scroll and snap instantly to the next snap point
2. **`prefers-reduced-motion: reduce`** — browsers honour this by disabling smooth scroll
3. The browser's implementation of smooth scroll with snap is too fast to be perceptible

**Implication**: No CSS-only approach targeting the native scroll animation will work. The scroll animation itself must be replaced with a JavaScript-controlled animation.

---

## Every Approach Tried — With Failure Mode

### Attempt 1: CSS scroll-driven animation (`animation-timeline: view(inline)`)
**What**: `animation-timeline: view(inline)` CSS on `CarouselSlide` — animation triggered by scroll position.
**Failure**: Animation never fired. Layout shift on slide change. Requires Chrome 115+/FF 114+/Safari 17.2+ AND doesn't reliably interact with `scroll-snap`.

### Attempt 2: `data-active` CSS transition with `translateX`
**What**: `opacity-0 translate-x-4 transition-[opacity,transform] data-[active=true]:opacity-100 data-[active=true]:translate-x-0` on `CarouselSlide` in `Featured.tsx`.
**Failure**: Only the 1 entering slide animates (2 staying slides don't change `data-active` state). Perceived as awkward per-card flicker, not a smooth whole-track motion.

### Attempt 3: `FeaturedTrackAnimator` wrapper with `classList` DOM manipulation
**What**: New client component wrapping `CarouselTrack`. On `activeIndex` change: `classList.remove → void offsetWidth → classList.add`.
**Failure**: **Massive layout regression** — wrapper div became the grid item without the grid placement classes. Controls disappeared from viewport. Also `classList` manipulation is an anti-pattern in React.

### Attempt 4: Grid-aware wrapper with WAAPI `translateX`
**What**: Moved grid classes to wrapper div. `FeaturedAnimatedTrack` client component using `element.animate([{ transform: translateX(dir * 10px) }, { transform: translateX(0) }])`.
**Failure**: The WAAPI fires AFTER `activeIndex` changes (which happens mid-scroll), so the wrapper positional shift fights the scroll direction simultaneously. Result: visible "bouncing back and forth."

### Attempt 5: Grid-aware wrapper with WAAPI `opacity` only
**What**: Same wrapper, but only `[{ opacity: 0.82 }, { opacity: 1 }]` — no translateX.
**Result**: Opacity pulse works (no bounce). BUT "conveyor belt doesn't exist at all" — the native scroll itself is instant. The opacity pulse alone doesn't create conveyor belt impression.

---

## The Recommended Path for Claude Opus

### Root cause fix: Replace `scrollBy` with custom RAF animation in `CarouselContext.tsx`

The native `scrollBy({ behavior: 'smooth' })` is not producing visible animation. The fix is to replace it with a `requestAnimationFrame` loop that animates `scrollLeft` directly over a controlled duration with a proper easing curve.

**Conceptual change** (single function in `CarouselContext.tsx`):

```ts
// BEFORE (current):
el.scrollBy({ left: moveAmount, behavior: "smooth" });

// AFTER (proposed):
const start = el.scrollLeft;
const target = start + moveAmount;
const duration = 480; // ms — tune for conveyor belt feel
const startTime = performance.now();
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3); // cubic ease-out

const step = (now: number) => {
  const elapsed = now - startTime;
  const t = Math.min(elapsed / duration, 1);
  el.scrollLeft = start + (target - start) * easeOut(t);
  if (t < 1) requestAnimationFrame(step);
};
requestAnimationFrame(step);
```

**Why this is safe / zero regression risk:**
- `scrollLeft` animation produces the same end state as `scrollBy` — lands on the same snap point
- The `scroll` event fires as scrollLeft updates → `activeIndex` updates exactly as before
- All other carousel consumers (ProductSpotlight1) are unaffected — their CSS transitions respond to `activeIndex`/`data-active`, not to how scroll is driven
- No new components, no layout changes, no shared interface changes
- `duration: 480` gives a clear, satisfying conveyor belt pace — tuneable

**Optional enhancement** (after conveyor belt is confirmed working):
Add a subtle `FeaturedAnimatedTrack` grid-aware wrapper back with WAAPI **opacity only** (`[{ opacity: 0.88 }, { opacity: 1 }]`) — this gives the whole-track a visual "arrival" accent on top of the conveyor belt motion. Now the WAAPI fires post-scroll and the opacity doesn't conflict with position.

---

## Constraints & Rules (non-negotiable)

1. **Zero regressions** to original state — ProductSpotlight1 animation, all carousel controls, all grid layouts must be identical to before
2. **`Featured.tsx` is a server component** — it cannot use `useState`, `useEffect`, or `onClick` directly. Any interactive behavior must be in a separate `"use client"` component
3. **Grid layout constraint** — `md:col-span-full md:row-start-2` must remain on the direct CSS grid child. If adding a wrapper around `CarouselTrack`, these classes MUST move to the wrapper
4. **Do not modify shared carousel infrastructure carelessly** — `CarouselTrack`, `CarouselSlide`, `CarouselRoot`, `CarouselControls` are shared. Changes must be backward compatible
5. **No new external dependencies** — no Framer Motion, no animation libraries
6. **Tailwind for styling** — no inline styles in JSX, scoped CSS classes preferred over globals
7. **Verification**: run `npm run build` after implementation; visual verification by user required before commit

---

## Verification Protocol

1. **`npm run build`** — no TypeScript errors, no build failures
2. **Visual checklist**:
   - Static layout identical to original (controls visible, no layout shift)
   - Navigate next → smooth horizontal conveyor belt motion, all 3 cards move together
   - Navigate prev → same in reverse direction
   - Rapid clicks → no stacking/glitch (cancel previous animation before starting new)
   - Initial page load → no flash or animation
   - ProductSpotlight1 carousel → completely unaffected

---

## Commit Template (after user approves visual)

Reference: `_project/COMMIT_TEMPLATE.txt` for the repository's required commit taxonomy format.

---

## Files to Read First

Before implementing, read these in full:
1. `app/components/layout/carousel/CarouselContext.tsx` — focus on `scroll()` and `updateScrollState()`
2. `app/components/features/homepage/featured/Featured.tsx` — confirm current clean state
3. `app/components/layout/carousel/CarouselTrack.tsx` — confirm `scroll-smooth snap-x snap-mandatory` classes
4. `_project/COMMANDS/Implement_v2.md` — contains the project's implementation protocol and DoD rules

---

*Handoff written by Claude Sonnet 3.7, session ending 2026-03-23.*
