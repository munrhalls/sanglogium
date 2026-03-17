# Design System Scope

## Current State
The config is substantially complete. Primitives, semantic tokens, and core
component aliases exist. This sprint closes the remaining gaps only.
Do not rebuild what exists. Do not reorganize what works.

## Deliverable State
A complete tailwind.config.ts and globals.css where:
- Every component alias includes its own color (no component assembles
  color + typography separately)
- All aliases used by the 9 homepage components exist and are verified
- No bug exists between defined aliases and consumed Tailwind values
- One test page verifies every alias visually before component builds begin

## In Scope — Gaps to Close

### Fix existing bugs
- `.card-base` references `boxShadow.sm` which is not defined.
  Replace with `boxShadow.card` which is defined.
- `.btn-primary` missing fontSize and letterSpacing.
  Add: fontSize body size, letterSpacing wide.

### Check existing component aliases (in uiComponentsPlugin)
- `.overline` — combines: text-small size + text.overline color
  + letter-spacing editorial + uppercase + font-medium
- `.price-tag` — combines: body size + text.priceTag color
  + tabular-nums + font-semibold
- `.product-card-title` — h3 size + text.headline color + font-semibold
  (used in IemsGallery, NewestRelease, Dacs, Accessories)
- `.section-label` — overline size + text.accent color
  + letter-spacing signature + uppercase
  (used above section headlines across homepage)

### Verify globals.css has no gaps
- Confirm body background and text defaults match surface.page and text.body
- Confirm no component-level styles hiding in globals that should be in config

## Typography Role Aliases

### Role Map
| Alias               | Scale Step  | Color Token          | Usage                    |
|---------------------|-------------|----------------------|--------------------------|
| .type-hero-headline | display-1   | text.heroHeadline    | Hero main headline       |
| .type-hero-sub      | h2          | text.heroSubHeadline | Hero subheadline         |
| .type-section-hed   | h1          | text.headline        | Section headings         |
| .type-section-sub   | h2          | text.subtitle        | Section subheadings      |
| .type-card-title    | h3          | text.headline        | Product card titles      |
| .type-metadata      | h4          | text.secondary       | Labels and metadata      |
| .type-price         | h4          | text.priceTag        | Product prices           |
| .type-overline      | small       | text.overline        | Overline labels (gold)   |
| .type-body          | body        | text.body            | Paragraph and body copy  |
| .type-caption       | small       | text.body            | Captions and small text  |

### Hero Subheadline Decision
Role uses h2 scale step, not h4.
Reason: hero subheadline carries meaningful content ("Winter Collection")
requiring subtitle prominence. h4 at mobile (16px) is caption-adjacent
and loses hierarchy next to display-scale headline. h2 maintains
readable subtitle weight at all viewports.

### text-cap Usage Rule
text-cap is NOT encoded in alias definitions.
Apply text-cap at point of use in component JSX when precise
spacing control is needed.
Correct: <h1 className="type-hero-headline text-cap">

### Consumption Rule
Components use alias classes only. Never raw scale steps or primitives.
Correct:   className="type-hero-headline text-cap"
Incorrect: className="text-display-1 font-bold text-brand-400"


## Out of Scope
- Reorganizing existing plugin structure
- Changing existing primitive tokens
- Changing existing semantic token names
- Adding aliases for features not used by the 9 homepage components
- Animation utilities (already handled by tailwindcss-animate)
- Responsive variants inside aliases (components own their responsive behavior)

## Forbidden Scope
- Do not rename existing tokens — components already consume them
- Do not touch the fluid typography scale — it is correct
- Do not add new primitives — the palette is complete
- Do not restructure the plugin architecture
- Do not modify this config once component builds begin

## Architecture Rules (for component authors)
- Never use a primitive directly: never `text-brand-400`, never `text-5xl`
- Never use a semantic token directly: never `text-text-primary`
- Always use a component alias: `.display-1`, `.overline`, `.btn-primary`
- Exception: layout properties (flex, grid, spacing, width) use
  Tailwind utilities directly — aliases are for typography, color, and
  interactive component states only
- One alias = complete visual treatment for that element type

