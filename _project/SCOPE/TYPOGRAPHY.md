# Typography Scope

## Purpose
Verify and lock the complete fluid typography scale before any component
builds on it. This sprint produces a verified, frozen typography foundation.
After this sprint, no typography token changes during component builds.

## Current State
Typography scale exists in tailwind.config.ts as fluid clamp values.
It has never been verified as a complete system on a test page.
Individual values may be correct in isolation but wrong in relationship.

## Deliverable State
A test page at /design-system-test/typography showing the full hierarchy
at three viewport widths (375px, 768px, 1280px), where every scale step
is visually distinct, proportionally correct, and readable.
After verification, the test page is deleted and the scale is frozen.

## The Scale to Verify (in hierarchy order)
- display-1: hero headline — largest text on the site
- display-2: section headline alternative — second largest
- h1: primary section headline
- h2: secondary section headline
- h3: tertiary headline, card titles, subheadlines in large contexts
- h4: small headline, metadata labels, subheadlines in compact contexts
- body: paragraph text
- small: captions, labels, overlines

## Verification Criteria Per Step
Each scale step must satisfy all three:
1. DISTINCT: visually separable from adjacent steps without reading the label
2. PROPORTIONAL: the ratio between adjacent steps feels intentional, not accidental
3. READABLE: at its minimum clamp value (375px viewport), not uncomfortably small

## Known Issue to Resolve During This Sprint
Hero subheadline "Winter Collection" uses text-h4 (16-21px).
Next to display-1/display-2 (36-90px) this reads as a caption, not a subtitle.
This sprint must determine the correct scale step for the hero subheadline role
and document it as a named role in DESIGN_SYSTEM.md.

## In Scope
- Verify all 8 scale steps on the test page at 375px, 768px, 1280px
- Adjust clamp values if any step fails the three criteria above
- Define named roles that map scale steps to semantic contexts:
  hero-headline → display-1 (mobile) / display-1 (desktop)
  hero-subheadline → [to be determined by this sprint]
  section-headline → h1 or h2 depending on context
  card-title → h3
  metadata → h4 or small
- Document final role mappings in DESIGN_SYSTEM.md
- Verify font weights at each scale step
- Verify letter-spacing at each scale step
- Verify line-height at each scale step, single and multiline

## Out of Scope
- Colors (verified in design system sprint separately)
- Component-level spacing
- Interactive states
- Any component other than the test page

## Forbidden Scope
- Do not change font family
- Do not change the 8pt spacing system
- Do not add new scale steps — work with the existing 8
- Do not touch any component file during this sprint
- Do not begin any component build until this sprint is locked

## Definition of Soil-Ready
This sprint is complete when:
every scale step passes all three criteria at all three viewports,
role mappings are documented,
and the test page is deleted.
Only then is typography soil ready for components to build on.