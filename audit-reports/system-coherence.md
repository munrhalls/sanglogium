# Sang Logium: System Coherence & Design Blueprint

## 1. Visual Hierarchy & Spacing (The 8pt Lead Domino)
- **Structural Rhythm**: All major sections must be wrapped in `<Shelf />`.
- **Vertical Padding**: Standardized at `py-20` (80px) to ensure "Luxury Breathing Room."
- **Horizontal Constraints**: Standardized at `px-6 md:px-12` within the Shelf.
- **Grid Gaps**: Standardized at `gap-24` for 50/50 splits (Spotlights) and `gap-6` for product grids.

## 2. Color Theory & Environment Mapping
Every "Shelf" must adopt one of these three semantic environments:

| Environment | Background | Title Color | Body/Meta Color | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Light (Paper)** | `bg-secondary-50` | `text-brand-900` | `text-secondary-600` | Featured, Clean Grids |
| **Void (Standard)** | `bg-brand-700` | `text-brand-100` | `text-secondary-400` | IEMs, DACs, Default |
| **Deep Void (High Drama)** | `bg-brand-900` | `text-brand-100` | `text-brand-400` (Peach) | Spotlights, Hero, Newest |

## 3. Typography Law (Fluid & Trimmed)
*All text must use the `.text-cap` utility to ensure perfect baseline alignment with MediaBoxes.*

- **Headlines**: `text-display-2` (Fluid) + `italic` + `tracking-tighter`.
- **Labels (Overlines)**: `text-small` + `text-cap` + `uppercase` + `font-bold` + `text-brand-400`.
- **Body Copy**: `text-body` + `font-light` + `leading-relaxed`.
- **Price Indicators**: `text-display-2` (for Hero) or `text-body font-bold` (for Cards).

## 4. Component Personality & Physics
- **MediaBox Scaling**: All images must use a specialized MediaBox (`Grid`, `Carousel`, or `Spotlight`).
- **Interaction Layer**:
    - **Hover**: `group-hover:scale-[1.03]` with `duration-700` (Slow, cinematic zoom).
    - **Borders**: `border-brand-800/20` for subtle definition on dark backgrounds.
    - **Shadows**: `drop-shadow-2xl` reserved exclusively for `SpotlightMediaBox`.

## 5. Performance Image Strategy (Sanity Integration)
- **Constraint**: Never download pixels that are cropped out.
- **Implementation**: Always use the Custom Loader with `.rect()` parameters.
- **Priority**: `priority={true}` is reserved ONLY for the first `Hero` and the first `ProductSpotlight` image.
