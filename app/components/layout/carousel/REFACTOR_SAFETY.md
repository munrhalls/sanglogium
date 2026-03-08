# Carousel Refactor: Safety & Non-Regression Manifesto
**Status:** Pre-Modularization Refactor
**Core Objective:** Split monolithic `Carousel.tsx` into a folder-based structure without altering internal logic or breaking the `/catalogue` implementation.

---

## 1. COMPONENT SIGNATURES (The "Do Not Touch" Zone)
The following exports must maintain their current Prop Types and Logic to ensure `/catalogue` and `/featured` remain functional:

| Component | Required Props | Critical Logic |
| :--- | :--- | :--- |
| **Carousel** | `{ children, itemsCount, className }` | Must provide `CarouselContext` via `useSnapCarousel`. |
| **CarouselTrack** | `{ children, className }` | Must attach `scrollRef` from context. |
| **CarouselSlide** | `{ children, className }` | Must execute `IntersectionObserver` to toggle `data-active`. |
| **CarouselDots** | `{ className }` | Must calculate `isAnchor` and `isInView` for `CarouselIcon`. |
| **CarouselPrev/Next**| `{ className, ...props }` | Must consume `scrollPrev/Next` and `canScrollPrev/Next`. |

---

## 2. CATALOGUE USAGE AUDIT (Non-Regression Check)
The `/catalogue` implementation relies on the following visual and functional anchors:
1. **Z-Index & Positioning:** `CarouselPrevious/Next` use `BTN_BASE` which includes `backdrop-blur-md`. Changing this breaks the "Glassmorphism" look in the Catalogue.
2. **Snap Points:** The `CarouselTrack` relies on `no-scrollbar flex` and `useSnapCarousel` hook alignment.
3. **Intersection Threshold:** `CarouselSlide` is hardcoded to `0.6` threshold. Changing this affects how the "Active" state triggers in the Catalogue gallery.

---

## 3. MODULARIZATION MAP
To be executed via PowerShell to ensure atomic file creation:
- `index.ts` -> Centralized exports (barrel file).
- `CarouselRoot.tsx` -> Context Provider & Logic.
- `CarouselTrack.tsx` -> The Scrolling Container.
- `CarouselSlide.tsx` -> The Intersection Wrapper.
- `CarouselControls.tsx` -> Prev/Next/Dots (The Navigation Layer).
- `CarouselContext.ts` -> Type definitions and Context creation.

---

## 4. FINAL VERIFICATION STEP
After modularization, the following command must return **0 results** (indicating no missing exports):
`grep -r "import { Carousel" ./app/components/features/catalogue`
