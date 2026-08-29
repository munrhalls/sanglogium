# LESSONS

Concrete traps that already cost real time. Add one **only** when a mistake cost >15 min
or a wrong turn **and** you can write a specific trigger. Check this before non-trivial
work in an area it might cover. Keep it lean — if scrolling this feels long, prune it.

## Index

- L01 — judging a change in the in-app preview pane → slow/partial render is not "broken"
- L02 — adding a client component to the streaming POC → collapses RSC streaming
- L03 — want an eased blur→sharp image reveal with next/image → it has no native one

## Lessons

### L01 · Preview pane ≠ reality
**When:** verifying any change by loading it in the in-app browser pane.
**Lesson:** the pane forces `prefers-reduced-motion: reduce` (CSS animations won't play),
loads uncached image grids very slowly, and its network / `img.complete` readouts lag
behind the real DOM. A slow or half-loaded page here is not evidence of a bug. Wait
longer, re-check, and confirm motion/perf in a real browser before concluding anything.
Never declare the dev server or streaming "broken" from what this pane shows.

### L02 · Streaming POC must stay server-only
**When:** touching `app/(test)/streaming-poc/` and tempted to add load/onLoad state.
**Lesson:** a `"use client"` component inside the per-row `<Suspense>` tree that throws
during SSR (e.g. a bad import) makes every row error-boundary out at once — the page
renders as one wall instead of streaming row by row. Keep `ProductRow` and `page.tsx`
server-only; do any blur/fade/polish with CSS, not a client wrapper.

### L03 · next/image has no native blur→sharp animation
**When:** asked to make images "ease in" / "resolve gently" from their LQIP.
**Lesson:** `placeholder="blur"` is an instant swap, not a transition, and there is no
prop for it (Next 15). Working approach: keep `placeholder="blur"` + `blurDataURL={lqip}`
for the smooth placeholder, and add one shared CSS keyframe class on the `<Image>`:
`opacity ~0.35→1` + `filter: blur(8px)→0`, ~320ms `ease-out`, guarded by
`@media (prefers-reduced-motion: reduce) { animation: none }`. Starting opacity at ~0.35
(not 0) keeps the placeholder from washing out during the fade. One class = uniform
motion across the grid. No client component, no per-tile stagger.
