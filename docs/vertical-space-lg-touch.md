# Not Enough Vertical Height on Desktop — `lg-touch`

Scope: the mechanism and proven techniques only. No pixel/rem values — those drift, don't trust them here, read the target component.

## The mechanism

`tailwind.config.ts` defines two mutually exclusive breakpoints that split all ≥1024px-wide screens by *height*, not just width:

- `lg-touch` = width ≥1024px **and** height ≤850px (typical laptop viewport: 13"–16" built-in displays)
- `lg-desktop` = width ≥1024px **and** height ≥851px (typical external monitor)

This is the codebase's actual name for "not enough vertical room on desktop." If a desktop layout looks cramped, check whether it's specifically a laptop-viewport (`lg-touch`) problem before touching anything.

## #1 gotcha — do not skip

`lg-touch` and `lg-desktop` are raw custom media queries. They do **not** inherit from Tailwind's normal `lg:` or from each other. Any lg+ behavior that must work on both screen types needs **both** variants written explicitly (`lg-touch:x lg-desktop:x`), even when the value is identical. Forgetting one means the feature silently breaks on one screen height class only — this is the actual bug shape to expect, not a hypothetical.

## #2 gotcha — h-full vs. aspect-ratio ownership

Every sized element picks one height model: it **owns** its height (`aspect-*`, or a literal `h-[Npx]`) or it **inherits** height from a parent (`h-full`, `min-h-*`, `max-h-*`). The two models aren't interchangeable mid-refactor — switching an element from `aspect-*` to `h-full` only works if every ancestor up to the nearest self-owned/explicit-height box also carries a matching height utility. Drop one link and the element collapses or overflows silently, often only at one breakpoint.

Real instance: `ProductSpotlight1/2/3` carousel slides moved from `aspect-[4/3]` to `h-full` in the same diff that dropped the parent grid's own `max-h-[350px]` mobile constraint (`d8bb31ac`) — the slide had nothing left to inherit from on mobile. Fixed by keeping the constraint on the sized ancestor and letting `h-full` chain down to it cleanly.

This is why `sang-logium-review` runs it as a mechanical check (Check C) on any `app/components/**` diff touching these utilities — reading this once was not enough to prevent the regression above.

## Proven techniques already in this codebase (in order of how often they're used)

1. **Shrink spacing one step at `lg-touch:`** — padding/gap/margin one Tailwind step tighter than at `lg-desktop:`. Most common fix. Example: `Featured.tsx`, `Dacs.tsx`, `Accessories.tsx`.
2. **Cap a region's own height and let it scroll, instead of shrinking everything** — `sticky ... h-[calc(100vh-var(--desktop-header-h))] overflow-y-auto`. Used for the filters sidebar on `/products`. Use this when content is inherently long (lists, filters) rather than trying to compress it.
3. **Flatten image aspect ratio** — wider/shorter ratio at `lg-touch:` than at `lg:`/`lg-desktop:`. Example: `DacCard.tsx` (`aspect-[3/2]` → `lg-touch:aspect-[16/9]`).
4. **Drop large reserved bottom padding once desktop layout applies** — mobile layouts often reserve space for a sticky bottom CTA (`pb-48`); that space is dead weight at `lg+` and gets zeroed (`lg-touch:pb-0 lg-desktop:pb-0`). Example: `BasketManager.tsx`, `BasketSkeleton.tsx`.

## Where this is used

Not homepage-only — 28 files, 70 usages, spanning basket, checkout, product listing/filters, homepage cards, hero. Treat it as a site-wide convention, not a one-off.

---
*Built from grep across the live codebase, 2026-08-03. Verify against the actual component before assuming a value.*
