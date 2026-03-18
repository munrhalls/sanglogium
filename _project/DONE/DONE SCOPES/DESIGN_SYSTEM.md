```
**In scope:**
1. Fix `.card-base` shadow bug — `boxShadow.sm` → `boxShadow.card`
2. Add `boxShadow.button` and `boxShadow.buttonHover` tokens
3. Fix body text in globals.css — `text-brand-100` → `text-text-body`
4. Update `.btn-primary` — add shadow token, verify it is complete
5. Add `.btn-cart` — brand-400 bg, brand-700 text, bold, cart icon slot, shadow, hover, focus, disabled states, 0px border-radius
6. Update `.btn-ghost` — change color from `accent[500]` to `text.heroHeadline` (brand-400) — warm cream with underline, no gold

**Out of scope confirmed:** Nav elements, search bar, header icons, carousel buttons — all correctly excluded. Your reasoning is sound on all of them.

**The carousel navigation buttons** — correct call to leave them inside the carousel component. The carousel is already an abstracted component. Changes propagate automatically. No design system tokens needed.

---

Here is the IDE agent prompt to update the scope file:
```
Replace the entire content of _project/DESIGN_SYSTEM.md
with exactly this. Do not add or remove anything.

---

# Design System Scope

## Status
Typography sprint: COMPLETE AND FROZEN.
Design system sprint: OPEN.

## Non-Interference Rule
These are frozen. This sprint does not touch them under any circumstance:
- tailwind.config.ts fontSize section
- tailwind.config.ts textTokens object
- All .type-* aliases in uiComponentsPlugin
- typographyDefaultsPlugin (.text-cap, .text-ex)

## Current State
Typography, primitives, and semantic tokens are complete and frozen.
Button aliases exist but are incomplete and have bugs.
globals.css body uses a primitive token instead of a semantic token.
boxShadow tokens are incomplete — card shadows exist, button shadows missing.

## Deliverable State
tailwind.config.ts and globals.css where:
- All button aliases are complete with correct hierarchy, states, and shadows
- Shadow tokens are extended to include button shadows
- globals.css body uses semantic token, not primitive
- .card-base shadow bug is fixed
- All aliases verified on a design system test page before component builds

## In Scope

### 1. Shadow tokens — add to tailwind.config.ts boxShadow
button: '0 2px 8px rgba(0, 0, 0, 0.15)'
buttonHover: '0 4px 16px rgba(0, 0, 0, 0.25)'
Rule: buttons reference shadow tokens by name. No inline button shadows.

### 2. Fix .card-base
Replace boxShadow.sm with boxShadow.card.

### 3. Fix globals.css body text
Replace text-brand-100 with text-text-body in the body @layer base rule.
Reason: removes primitive reference, wires body to semantic token correctly.

### 4. Button hierarchy — three buttons

.btn-primary (existing — verify and complete)
Role: main CTA, hero EXPLORE button
Spec: brand-400 bg, brand-700 text, font-bold, 0px border-radius,
      boxShadow.button, hover bg brand-600, focus outline accent-500 2px offset 2px,
      active bg brand-700, disabled opacity-40

.btn-cart (new — replaces .btn-secondary)
Role: add to cart action on product cards
Spec: brand-400 bg, brand-700 text, font-bold, 0px border-radius,
      boxShadow.button, includes slot for Phosphor cart icon left of text,
      icon size matches font size, gap-2 between icon and label,
      hover bg brand-600 + boxShadow.buttonHover,
      focus outline accent-500 2px offset 2px,
      active bg brand-700, disabled opacity-40

.btn-ghost (existing — update color only)
Role: low-weight text link action, "See More" in product spotlights
Spec: transparent bg, no border, brand-400 color (warm cream),
      underline with underlineOffset-4, 0px border-radius,
      hover color brand-600, no shadow
      Remove: accent-500 color (was competing with overline gold)

### 5. Design system test page
Create /app/design-system-test/buttons/page.tsx
Dark background. Shows all three buttons with labels.
Shows hover states via CSS (pointer-fine media query visible).
Shows all three at mobile and desktop widths.
Delete after verification unless retained for portfolio.

## Out of Scope
- Typography scale and aliases (frozen — see Non-Interference Rule)
- Color primitives (complete)
- Semantic text tokens (complete)
- Nav elements, search bar, header icons
- Carousel buttons (abstracted inside carousel component)
- Any alias not used by the 9 homepage components
- New typography scale steps

## Forbidden Scope
- Do not touch fontSize in tailwind.config.ts
- Do not touch textTokens in tailwind.config.ts
- Do not touch any .type-* alias
- Do not touch typographyDefaultsPlugin
- Do not rename existing tokens

## Architecture Rules (reference)
- Components use aliases only — never primitives or semantic tokens directly
- Layout utilities (flex, grid, spacing, sizing) use Tailwind directly
- Shadows reference named tokens — never inline box-shadow values in components
- text-cap applied at point of use in JSX, never inside alias definitions
- Focus outlines use accent-500 at 2px width, 2px offset — consistent across all interactive elements

## Known Exception
globals.css body previously used text-brand-100 (primitive).
This sprint replaces it with text-text-body (semantic token).
After this change, no known primitive tokens remain in globals.css.

---

CONSTRAINTS:
- Replace the entire file with exactly the content above
- Do not preserve anything from the old file
- Do not add anything not written above
- Do not touch any other file
```