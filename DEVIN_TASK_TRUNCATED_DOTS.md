# Devin Task: Dynamic Truncated Dots (iOS Pattern) for Homepage Carousels

## Goal

Replace the current "render all dots" behavior in `CarouselDots` with the iOS-style truncated 5-dot window on mobile. Always show exactly 5 dots. The center dot is the active page, styled in brand gold (`accent-500`). The two adjacent dots are medium-sized/opacity. The two edge dots are minimal size/opacity.

This makes mobile dot indicators clean and uncluttered regardless of how many slides a carousel has.

---

## Visual Spec

When `dotsCount > 5`, render exactly 5 dots representing a sliding window over the real dot range:

```
Position in window:  0     1     2     3     4
Dot size:          small  med  LARGE  med  small
Opacity:           30%   60%   100%   60%   30%
Active highlight:                gold
```

- **Position 2** (center): `w-2 h-2` (8×8px), `opacity-100`, `bg-accent-500` (gold `#D4AF37`)
- **Positions 1 & 3** (adjacent): `w-1.5 h-1.5` (6×6px), `opacity-60`, inactive color
- **Positions 0 & 4** (edges): `w-1 h-1` (4×4px), `opacity-30`, inactive color

**Window logic:** The active dot always appears at position 2 (center) except when near the first or last slides:

```
windowStart = clamp(activeIndex - 2,  0,  dotsCount - 5)
activePositionInWindow = activeIndex - windowStart   // always 0..4
```

**Clicking a dot** navigates to its `realIndex = windowStart + positionInWindow`.

When `dotsCount <= 5`, render all dots normally (no truncation — existing behavior is fine).

---

## Color Tokens

From `tailwind.config.ts`:
- Active gold: `bg-accent-500` = `#D4AF37`
- Default variant inactive: `bg-brand-400` = `#F6E3D5`
- Dark variant inactive: `bg-secondary-600` = `#6E6D6B`

---

## Phase 1 — Extend `CarouselDots` in `CarouselControls.tsx`

**File:** `app/components/layout/carousel/CarouselControls.tsx`

### 1a. Add `truncate` prop to the `CarouselDotsProps` interface

Find this block (lines 101–103):

```tsx
interface CarouselDotsProps {
  className?: string;
  variant?: "default" | "dark";
}
```

Replace with:

```tsx
interface CarouselDotsProps {
  className?: string;
  variant?: "default" | "dark";
  truncate?: boolean;
}
```

### 1b. Update the `CarouselDots` function signature

Find:

```tsx
export function CarouselDots({ className, variant = "default" }: CarouselDotsProps) {
```

Replace with:

```tsx
export function CarouselDots({ className, variant = "default", truncate = false }: CarouselDotsProps) {
```

### 1c. Add the truncated rendering branch

After the existing `const aIndex = Math.round(Number(activeIndex));` line (currently line 111), insert the truncated rendering block immediately before the `const dotColor = ...` line.

The full updated `CarouselDots` function body should be:

```tsx
export function CarouselDots({ className, variant = "default", truncate = false }: CarouselDotsProps) {
  const context = useCarousel();
  if (!context) return null;

  const { dotsCount, activeIndex, goTo } = context;
  const aIndex = Math.round(Number(activeIndex));

  // ── Truncated (iOS) mode ──────────────────────────────────────────────────
  const WINDOW = 5;
  if (truncate && dotsCount > WINDOW) {
    const windowStart = Math.max(0, Math.min(aIndex - 2, dotsCount - WINDOW));
    const activePos = aIndex - windowStart; // 0..4

    const inactiveColor = variant === "dark" ? "bg-secondary-600" : "bg-brand-400";

    return (
      <div
        className={cn("flex justify-center items-center gap-1", className)}
        role="tablist"
      >
        {Array.from({ length: WINDOW }).map((_, pos) => {
          const realIndex = windowStart + pos;
          const dist = Math.abs(pos - activePos);
          const isActive = dist === 0;

          const sizeClass = dist === 0 ? "w-2 h-2" : dist === 1 ? "w-1.5 h-1.5" : "w-1 h-1";
          const opacityClass = dist === 0 ? "opacity-100" : dist === 1 ? "opacity-60" : "opacity-30";
          const colorClass = isActive ? "bg-accent-500" : inactiveColor;

          return (
            <button
              key={realIndex}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Go to slide ${realIndex + 1}`}
              onClick={() => goTo(realIndex)}
              className="flex h-4 w-4 cursor-pointer touch-manipulation items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50"
            >
              <span
                className={cn(
                  "block rounded-sm transition-all duration-300",
                  sizeClass,
                  opacityClass,
                  colorClass
                )}
              />
            </button>
          );
        })}
      </div>
    );
  }
  // ── End truncated mode ────────────────────────────────────────────────────

  const dotColor =
    variant === "dark"
      ? { active: "bg-brand-800", inactive: "bg-secondary-600 hover:bg-secondary-700" }
      : { active: "bg-brand-700", inactive: "bg-brand-400 hover:bg-brand-500" };

  return (
    <div className={cn("flex justify-center items-center", className)} role="tablist">
      {Array.from({ length: dotsCount }).map((_, i) => {
        const isActive = i === aIndex;

        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className="mx-0.5 flex h-4 w-4 cursor-pointer touch-manipulation items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50"
          >
            <span
              className={cn(
                "block h-2 w-2 rounded-sm transition-colors duration-300",
                isActive ? dotColor.active : dotColor.inactive
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
```

---

## Phase 2 — Apply `truncate` to all homepage mobile dot instances

Add `truncate` prop to every `<CarouselDots .../>` call in the homepage sections listed below. No other changes to these files.

### 2a. `app/components/features/homepage/featured/Featured.tsx`

Line ~162:

```tsx
// BEFORE
<CarouselDots />

// AFTER
<CarouselDots truncate />
```

### 2b. `app/components/features/homepage/dacs/Dacs.tsx`

Line ~74 (inside `flex md:hidden` row):

```tsx
// BEFORE
<CarouselDots />

// AFTER
<CarouselDots truncate />
```

Line ~79 (desktop `hidden md:flex` row — optional, apply for consistency):

```tsx
// BEFORE
<CarouselDots className="hidden md:flex mt-2 justify-center" />

// AFTER
<CarouselDots truncate className="hidden md:flex mt-2 justify-center" />
```

### 2c. `app/components/features/homepage/accessories/CategorySection.tsx`

Line ~72 (inside `flex md:hidden` row):

```tsx
// BEFORE
<CarouselDots />

// AFTER
<CarouselDots truncate />
```

Line ~74 (desktop `hidden md:flex` row — optional):

```tsx
// BEFORE
<CarouselDots className="hidden md:flex mt-2 justify-center" />

// AFTER
<CarouselDots truncate className="hidden md:flex mt-2 justify-center" />
```

### 2d. `app/components/features/homepage/product-spotlight-1/ProductSpotlight1.tsx`

Both `<CarouselDots variant="dark" />` instances (lines ~50 and ~53):

```tsx
// BEFORE
<CarouselDots variant="dark" />

// AFTER
<CarouselDots truncate variant="dark" />
```

### 2e. `app/components/features/homepage/product-spotlight-2/ProductSpotlight2.tsx`

Both `<CarouselDots variant="dark" />` instances (lines ~46 and ~49):

```tsx
// BEFORE
<CarouselDots variant="dark" />

// AFTER
<CarouselDots truncate variant="dark" />
```

### 2f. `app/components/features/homepage/product-spotlight-3/ProductSpotlight3.tsx`

Both `<CarouselDots variant="dark" />` instances (lines ~93 and ~96):

```tsx
// BEFORE
<CarouselDots variant="dark" />

// AFTER
<CarouselDots truncate variant="dark" />
```

### 2g. `app/components/features/homepage/newest-release/NewestRelease.tsx`

Line ~66:

```tsx
// BEFORE
<CarouselDots className="[&>button[aria-selected=true]>span]:bg-brand-200 [&>button[aria-selected=false]>span]:border [&>button[aria-selected=false]>span]:border-brand-400 [&>button[aria-selected=false]>span]:bg-transparent" />

// AFTER
<CarouselDots truncate className="[&>button[aria-selected=true]>span]:bg-brand-200 [&>button[aria-selected=false]>span]:border [&>button[aria-selected=false]>span]:border-brand-400 [&>button[aria-selected=false]>span]:bg-transparent" />
```

---

## Phase 3 — Verification

1. Run `npm run build` from the project root. It must complete with no TypeScript errors.
2. Run `npm run dev` and open `http://localhost:3000` on a mobile viewport (375px width in DevTools).
3. On the homepage, scroll through each carousel section. For any carousel with more than 5 slides, confirm:
   - Exactly 5 dots are visible
   - The center dot is gold (`#D4AF37`)
   - The two flanking dots are smaller and partially transparent
   - The two edge dots are the smallest and most transparent
   - Navigating forward/back slides the window (the gold dot stays centered when possible)
   - Tapping an edge dot navigates to that slide
4. For carousels with 5 or fewer slides, confirm the existing dot style is unchanged.

---

## Files Modified

| File | Change |
|------|--------|
| `app/components/layout/carousel/CarouselControls.tsx` | Add `truncate` prop + iOS window rendering branch |
| `app/components/features/homepage/featured/Featured.tsx` | `<CarouselDots truncate />` |
| `app/components/features/homepage/dacs/Dacs.tsx` | `<CarouselDots truncate />` (both instances) |
| `app/components/features/homepage/accessories/CategorySection.tsx` | `<CarouselDots truncate />` (both instances) |
| `app/components/features/homepage/product-spotlight-1/ProductSpotlight1.tsx` | `<CarouselDots truncate variant="dark" />` (both) |
| `app/components/features/homepage/product-spotlight-2/ProductSpotlight2.tsx` | `<CarouselDots truncate variant="dark" />` (both) |
| `app/components/features/homepage/product-spotlight-3/ProductSpotlight3.tsx` | `<CarouselDots truncate variant="dark" />` (both) |
| `app/components/features/homepage/newest-release/NewestRelease.tsx` | `<CarouselDots truncate className="..." />` |

**No schema, Sanity, or styling (CSS/Tailwind config) changes required.** All new classes used (`bg-accent-500`, `w-1.5`, `h-1.5`, `w-1`, `h-1`, `opacity-60`, `opacity-30`) are standard Tailwind utilities already available in the project.
