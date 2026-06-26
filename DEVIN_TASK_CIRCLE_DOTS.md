# Devin Task: Circle Dots + Brand Orbit Active Icon for Homepage Carousels

## Context

The `CarouselDots` component currently renders filled rounded-square dots. This task replaces them with:

- **Inactive dots** → empty circles (border only, no fill), color from the design system, sized to the context
- **Active dot** → the brand orbit icon (`CarouselIcon` from `DotIcon.tsx`), same color, slightly larger

The orbit icon is the same ring-shape used as the `@` glyph in the SANG @ LOGIUM logo. It already exists as a React component at `app/components/layout/carousel/DotIcon.tsx` and uses `fill="currentColor"`, so it inherits text color automatically.

---

## Visual Spec

```
Inactive:  ○  ○  ○          empty circle, border only
Active:    ◎                 orbit icon (brand @-ring), same color, ~1.75× size
```

### Sizes

| State | Size class | Pixels |
|-------|-----------|--------|
| Inactive | `h-2 w-2` | 8 × 8 |
| Active orbit | `h-3.5 w-3.5` | 14 × 14 |
| Truncated adjacent (dist 1) | `h-2 w-2` | 8 × 8 |
| Truncated edge (dist 2) | `h-1.5 w-1.5` | 6 × 6 |
| Truncated center orbit | `h-3.5 w-3.5` | 14 × 14 |

All buttons keep `h-4 w-4` hit area for touch targets.

### Colors (from `tailwind.config.ts`)

| Variant | Context background | Inactive border | Active orbit color |
|---------|-------------------|----------------|-------------------|
| `"default"` | Dark (`brand-900`, `brand-700`) | `border-brand-400` (#F6E3D5 warm cream) | `text-brand-400` |
| `"dark"` | Light (`surface-productImage` = brand-200) | `border-brand-700` (#151B1B) | `text-brand-700` |

---

## Phase 1 — Update `CarouselControls.tsx`

**File:** `app/components/layout/carousel/CarouselControls.tsx`

### 1a. Add import for `CarouselIcon`

At the top of the file, after the existing imports, add:

```tsx
import { CarouselIcon } from "./DotIcon";
```

### 1b. Replace the full `CarouselDots` function

The existing `CarouselDots` function (starting at line 106) must be replaced entirely with the version below. The interface changes (`truncate` prop) from the previous task spec are already assumed to be in place — if they are not, apply them here too.

```tsx
interface CarouselDotsProps {
  className?: string;
  variant?: "default" | "dark";
  truncate?: boolean;
}

export function CarouselDots({ className, variant = "default", truncate = false }: CarouselDotsProps) {
  const context = useCarousel();
  if (!context) return null;

  const { dotsCount, activeIndex, goTo } = context;
  const aIndex = Math.round(Number(activeIndex));

  // Color tokens per variant
  const borderColor = variant === "dark" ? "border-brand-700" : "border-brand-400";
  const orbitColor  = variant === "dark" ? "text-brand-700"   : "text-brand-400";

  // ── Truncated (iOS) mode ──────────────────────────────────────────────────
  const WINDOW = 5;
  if (truncate && dotsCount > WINDOW) {
    const windowStart = Math.max(0, Math.min(aIndex - 2, dotsCount - WINDOW));
    const activePos = aIndex - windowStart; // 0..4

    return (
      <div
        className={cn("flex justify-center items-center gap-1.5", className)}
        role="tablist"
      >
        {Array.from({ length: WINDOW }).map((_, pos) => {
          const realIndex = windowStart + pos;
          const dist = Math.abs(pos - activePos);
          const isActive = dist === 0;

          // Size: active orbit 14px, adjacent 8px, edge 6px
          const sizeClass = dist === 0 ? "h-3.5 w-3.5" : dist === 1 ? "h-2 w-2" : "h-1.5 w-1.5";
          // Opacity: full / 60% / 30%
          const opacityClass = dist === 0 ? "opacity-100" : dist === 1 ? "opacity-60" : "opacity-30";

          return (
            <button
              key={realIndex}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Go to slide ${realIndex + 1}`}
              onClick={() => goTo(realIndex)}
              className="flex h-4 w-4 cursor-pointer touch-manipulation items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50"
            >
              {isActive ? (
                <CarouselIcon className={cn(sizeClass, opacityClass, orbitColor, "transition-all duration-300")} />
              ) : (
                <span
                  className={cn(
                    "block rounded-full border bg-transparent transition-all duration-300",
                    sizeClass,
                    opacityClass,
                    borderColor
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }
  // ── End truncated mode ────────────────────────────────────────────────────

  // ── Standard mode (dotsCount ≤ 5, or truncate=false) ─────────────────────
  return (
    <div className={cn("flex justify-center items-center gap-1.5", className)} role="tablist">
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
            className="flex h-4 w-4 cursor-pointer touch-manipulation items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50"
          >
            {isActive ? (
              <CarouselIcon className={cn("h-3.5 w-3.5 transition-all duration-300", orbitColor)} />
            ) : (
              <span
                className={cn(
                  "block h-2 w-2 rounded-full border bg-transparent transition-colors duration-300",
                  borderColor
                )}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
```

---

## Phase 2 — Clean up `NewestRelease.tsx`

**File:** `app/components/features/homepage/newest-release/NewestRelease.tsx`

The existing `<CarouselDots>` call has a complex className override that was manually trying to replicate empty circles. Now that the component handles this natively, remove the override.

Find (line ~66):

```tsx
<CarouselDots truncate className="[&>button[aria-selected=true]>span]:bg-brand-200 [&>button[aria-selected=false]>span]:border [&>button[aria-selected=false]>span]:border-brand-400 [&>button[aria-selected=false]>span]:bg-transparent" />
```

Replace with:

```tsx
<CarouselDots truncate />
```

> The context background is `bg-brand-700` (dark), so the default variant (`variant="default"`) already produces warm cream (`brand-400`) empty circles and orbit icon — exactly right. No className override needed.

---

## Phase 3 — Verify all variant assignments are correct

Cross-check: every `<CarouselDots>` call must use the correct variant for its background.

| File | Background | Correct variant | Current variant |
|------|-----------|----------------|----------------|
| `featured/Featured.tsx` | `bg-brand-900` (dark) | `default` | *(none = default)* ✓ |
| `dacs/Dacs.tsx` (both) | `bg-surface-page` = brand-700 (dark) | `default` | *(none = default)* ✓ |
| `accessories/CategorySection.tsx` (both) | `bg-brand-700` (dark) | `default` | *(none = default)* ✓ |
| `newest-release/NewestRelease.tsx` | `bg-brand-700` (dark) | `default` | *(none = default)* ✓ |
| `product-spotlight-1/ProductSpotlight1.tsx` (both) | `bg-surface-productImage` = brand-200 (light) | `dark` | `variant="dark"` ✓ |
| `product-spotlight-2/ProductSpotlight2.tsx` (both) | `bg-surface-productImage` = brand-200 (light) | `dark` | `variant="dark"` ✓ |
| `product-spotlight-3/ProductSpotlight3.tsx` (both) | `bg-surface-productImage` = brand-200 (light) | `dark` | `variant="dark"` ✓ |

**No variant changes needed** — all assignments are already correct from the previous refactor.

---

## Phase 4 — Verification

1. Run `npm run build` from the project root. Zero TypeScript errors required.
2. Run `npm run dev` and open `http://localhost:3000`.
3. Mobile viewport (375px width in DevTools), scroll through each homepage section:

   **Featured** (`bg-brand-900`, dark):
   - Inactive dots: warm cream (`#F6E3D5`) empty circles
   - Active dot: warm cream orbit icon (the brand `@` ring), visibly larger than the circles
   - Truncation window works (if >5 slides)

   **DACs** (`bg-surface-page`, dark):
   - Same as Featured

   **Accessories** (`bg-brand-700`, dark):
   - Same as Featured

   **NewestRelease** (`bg-brand-700`, dark):
   - Cream empty circles + cream orbit active
   - NO className override artifacts

   **ProductSpotlight 1, 2, 3** (`bg-surface-productImage`, light cream):
   - Dark (`#151B1B`) empty circles
   - Dark orbit icon for active

4. Confirm the orbit icon is recognizably the same `@` ring shape from the header logo.
5. Confirm no filled square dots remain anywhere on the homepage.

---

## Files Modified

| File | Change |
|------|--------|
| `app/components/layout/carousel/CarouselControls.tsx` | Import `CarouselIcon`; replace dot rendering with empty circles + orbit icon |
| `app/components/features/homepage/newest-release/NewestRelease.tsx` | Remove now-redundant className override from `<CarouselDots>` |

**All other homepage files are unchanged.** No Tailwind config changes needed — all classes used (`rounded-full`, `border`, `border-brand-400`, `border-brand-700`, `text-brand-400`, `text-brand-700`, `h-1.5 w-1.5`, `h-3.5 w-3.5`, `gap-1.5`) are standard Tailwind utilities available in the project.

---

## Asset Reference

The orbit icon component lives at:
```
app/components/layout/carousel/DotIcon.tsx
```

Export name: `CarouselIcon`

It renders the same 3-ring orbit shape as the `@` glyph in the SANG @ LOGIUM header logo. It uses `fill="currentColor"` so it inherits whatever text color class is applied to it. The SVG `viewBox` is `"0 0 64 63"`.

A static copy also exists at `public/icons/carousel_dot_active.svg` (hardcoded `#F6E3D5` fill) — **do not use this file**. Use `CarouselIcon` from `DotIcon.tsx` instead so the color adapts to each context.
