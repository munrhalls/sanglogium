# Scope: Featured Component Carousel Refinement

## Inside Scope
* Fixing slide-to-slide layout shifts by establishing fixed/minimum heights for the text area.
* Increasing the mobile image container height slightly, ensuring the full card remains visible above the fold.
* Enforcing an 8-point Tailwind vertical spacing rhythm across the component.
* Overriding mobile carousel buttons: absolute positioning on image edges, vertically centered, thick `text-brand-900` chevrons, transparent backgrounds.
* Overriding desktop carousel buttons: positioned inline with navigation dots, `text-brand-400` chevrons, transparent backgrounds.
* All styling changes must be injected via props/classes from the parent `Featured` component.

## Outside Scope
* Modifying the base code within `CarouselPrevious`, `CarouselNext`, or `CarouselDots` components (zero regression risk requirement).
* Any architectural changes to the carousel context or state management.
* Creating new wrapper components or abstractions.
* Adding new features or animations.
* Hacky CSS overrides (`!important` usage unless strictly required by component library limitations, negative margins for standard spacing).

## Strict Constraints
* Tailwind spacing must use global config multiples (e.g., `space-y-2`, `gap-4`, `mt-8`).
* Mobile viewport overflow is strictly forbidden; the card must fit.
* Desktop breakpoint logic must use standard Tailwind prefixes (e.g., `md:`, `lg:`).