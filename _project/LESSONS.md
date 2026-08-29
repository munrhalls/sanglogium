# LESSONS

Concrete traps that already cost real time. Add one **only** when a mistake cost >15 min
or a wrong turn **and** you can write a specific trigger. Check this before non-trivial
work in an area it might cover. Keep it lean — if scrolling this feels long, prune it.

## Index

- L01 — judging a change in the in-app preview pane → slow/partial render is not "broken"
- L02 — adding a client component to the streaming POC → collapses RSC streaming
- L03 — want an eased blur→sharp image reveal with next/image → it has no native one
- L04 — reaching for live browser automation to debug a timing/animation bug → cost-ineffective, usually reason from source instead
- L05 — need to confirm a CSS/browser/timing primitive itself → build an ephemeral isolated harness, don't test it in the full app

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
**Lesson:** `placeholder="blur"` is an instant swap, not a transition (Next 15), and the
real bitmap paints **natively on `load`, before any JS** — verified in
`next/dist/shared/lib/get-img-props.js` (no opacity/filter on the img, blur is just a
background-image). So a class added *after* load is always too late; that is why 4
attempts failed. Working approach: a tiny `"use client"` wrapper around `<Image>`; the
`<img>` ships **blurred from the first server-rendered frame** via a class already in the
SSR HTML (`filter: blur(12px); transition: filter 340ms`); `onLoad` (next/image fires it
reliably for cached AND fresh — verified in `image-component.js`) adds a `-done` class →
`filter: blur(0)` → it transitions. ONE class pair, **no cached-vs-fresh branching** (an
`img.complete`-at-hydration check was the bug in v1 + v2). **Do NOT gate it behind
`@media (prefers-reduced-motion: reduce)`** — the dev's own machine reports reduce-motion,
so every attempt that set `animation/transition/filter: none` under it was invisible on
the one machine being tested (root cause of ~a week stuck). A blur/opacity dissolve on
image load is a crossfade, not vestibular motion — keep it (shorten to ~200ms under
reduce-motion at most). Full writeup: `_project/audits/streaming-poc/`.

### L04 · Don't burn time on live browser automation for timing bugs
**When:** tempted to spin up browser automation / a dev-server session to *watch* a
timing- or animation-related bug happen.
**Lesson:** almost never cost-effective. Real example (streaming-poc image reveal):
~12 min of navigate / inject / screenshot loops produced a confident "the page never
hydrates" conclusion that was pure artifact — the automated tab ran backgrounded
(`document.visibilityState: "hidden"`), which freezes React streaming reveal, hydration,
and CSS animation. High time cost, high chance of measuring an artifact, low payoff even
on success. Default instead: reason from installed source (`node_modules/next/...`), the
diff, and known reference patterns. If a live check is truly needed, ask the human to
look at their own already-open foregrounded tab — one round trip.

### L05 · Ephemeral isolated harness — the fast way to test a primitive
**When:** about to check whether a CSS / browser / timing primitive *itself* behaves a
certain way — does this transition fire on a class flip? does the reduce-motion guard
block it? does `onload` land before hydration? — and tempted to answer it from inside
the full app / dev server / RSC stream, where framework timing confounds every reading.
**Lesson:** don't. Write a throwaway single-file `.html` (no Next, no build, no deps)
that reproduces *only* the mechanism under test, add a `performance.now()` event log,
open it in the real browser, read the result. Minutes to build, clean yes/no, zero
framework confounds, and it runs on the actual test machine (reduced-motion and all).
This is the constructive half of L04. Real payoff:
`_project/audits/streaming-poc/reveal-diagnostic.html` settled the ~week-old "does the
blur→sharp class flip even work here" question in one run — it transitioned, it did not
pop, the reduce-motion guard did not kill it — proving the CSS mechanism is sound and
the `sang-logium-7j8` bug lives in the `next/image` + RSC *integration* (trigger timing
/ missing intermediate paint), not the animation. Keep the harness file until the issue
closes, then delete it.
