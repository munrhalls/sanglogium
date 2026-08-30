# AI LESSONS

Concrete traps that already cost real time, written for the AI agent. Add one **only**
when a mistake cost >15 min or a wrong turn **and** you can write a specific trigger.
Check this before non-trivial work in an area it might cover. Keep it lean — if scrolling
this feels long, prune it.

_Human-facing takeaways live in `_project/HUMAN_LESSONS.md`._

## Index

- L01 — judging a change in the in-app preview pane → slow/partial render is not "broken"
- L02 — a client component in the streaming POC that *throws/suspends in SSR* collapses streaming; a sync leaf is fine
- L03 — want an eased blur→sharp image reveal with next/image → it has no native one
- L06 — reveal that fades `opacity` gated on client state → images invisible till hydration → "one wall, later" regression; animate blur only
- L04 — reaching for live browser automation to debug a timing/animation bug → cost-ineffective, usually reason from source instead
- L05 — need to confirm a CSS/browser/timing primitive itself → build an ephemeral isolated harness, don't test it in the full app
- L07 — image-reveal that "reveals all at once" on a slow link → the trigger is hydration-gated; dev hydrates in ~15s so every img is `complete` first → move the trigger to an inline script, off React
- L08 — measuring per-image load timing → `performance.getEntriesByType('resource')`, not the Network panel or a React `onLoad` probe
- L09 — a "why does X happen" question is open → no fix code, no option list, until the decisive measurement is run; every causal claim is a hypothesis with a cheap test, done turn 1
- L10 — repo artifacts (audits, plans, older lessons) are evidence, not authority → check what question the doc actually answered before letting it rule an approach in/out
- L11 — representational honesty: an arrival/reveal animation must be driven by the real event it depicts, never a timer/queue/`transition-delay` that fakes the look

## Lessons

### L01 · Preview pane ≠ reality
**When:** verifying any change by loading it in the in-app browser pane.
**Lesson:** the pane forces `prefers-reduced-motion: reduce` (CSS animations won't play),
loads uncached image grids very slowly, and its network / `img.complete` readouts lag
behind the real DOM. A slow or half-loaded page here is not evidence of a bug. Wait
longer, re-check, and confirm motion/perf in a real browser before concluding anything.
Never declare the dev server or streaming "broken" from what this pane shows.

### L02 · Streaming POC — the real constraint is "no SSR throw/suspend", not "no client component"
**When:** touching `app/(test)/streaming-poc/` and adding load/onLoad state.
**Lesson:** a `"use client"` component inside the per-row `<Suspense>` tree that *throws
or suspends during SSR* (bad import, sync data read) makes every row error-boundary out
at once — the page renders as one wall instead of streaming row by row. A small client
leaf that renders synchronously (`useState`, `onLoad`, no throw path) does **not**
collapse streaming and is the shipped pattern (`RevealImage.tsx`). Keep `ProductRow` /
`page.tsx` themselves server components; the client wrapper is a leaf only. See also L06.

### L03 · next/image has no native blur→sharp animation
**When:** asked to make images "ease in" / "resolve gently" from their LQIP.
**Lesson:** `placeholder="blur"` is an instant swap, not a transition (Next 15), and the
real bitmap paints **natively on `load`, before any JS** — verified in
`next/dist/shared/lib/get-img-props.js` (no opacity/filter on the img, blur is just a
background-image). Shipped approach (`RevealImage.tsx`, "Attempt G"): a tiny `"use
client"` wrapper around `<Image>` with **no `placeholder="blur"`** (its load-time
re-render reconciles any external `-done` back off the className — that fought every
script-based attempt). The `<img>` ships blurred from the first SSR frame via
`spoc-reveal` (`filter: blur(8px); transition: filter 450ms`) already in the HTML; a
separate `.spoc-lqip` sibling div is the placeholder and unmounts on load. `onLoad`
**and** a `ref` callback checking `img.complete` both call `setLoaded(true)` → adds
`spoc-reveal-done` → `filter: blur(0)` transitions. The `ref`/`complete` check replaces
the old buggy `img.complete`-at-hydration *branch* — it is an additive trigger, not a
cached-vs-fresh fork. **Do NOT gate it behind
`@media (prefers-reduced-motion: reduce)`** — the dev's own machine reports reduce-motion,
so every attempt that set `animation/transition/filter: none` under it was invisible on
the one machine being tested (root cause of ~a week stuck). A blur/opacity dissolve on
image load is a crossfade, not vestibular motion — keep it (shorten to ~200ms under
reduce-motion at most). Full writeup: `_project/audits/streaming-poc/`.

### L06 · Image-reveal on a streaming grid: animate blur, never opacity
**When:** building an on-load image reveal (client wrapper, `onLoad` → state → class)
for a page whose selling point is that content streams in fast, chunk by chunk.
**Lesson:** if the pre-reveal state is `opacity: 0`, the image is *invisible* until its
client leaf hydrates and flips state. On a slow link every leaf hydrates in one late
pass, so all rows appear together — "one big wall, later" — a regression against the
streaming UX even though per-row `<Suspense>` still works. Fix: the reveal animates
`filter: blur()` only, `opacity` stays `1`. The `<img>` then paints the frame its bytes
arrive, hydration-independent, so products still stream in as fast small chunks;
hydration only decides when the blur eases off. Cost real time as attempt "F.1" in
`_project/audits/streaming-poc/failed-attempts.md`.

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

### L07 · On-load image reveal that fires "all at once" → the trigger is hydration-gated
**When:** an on-load blur→sharp (or fade) reveal on a streaming grid reveals every tile
in one frame on a slow link, even though the images themselves arrive spread out.
**Lesson:** it is not HTTP/2, not React batching, not `img.decode()`. It is that the
trigger — a React `onLoad`, or a `ref` callback checking `img.complete` — only goes live
*after hydration*. The dev server hydrates in ~15s (prod ~1-2s but still often after the
first images); by then every image is already `complete`, so the `img.complete` branch
fires for all of them in the single hydration pass = one batched commit = one wall.
Proven on `sang-logium-7j8`: `getEntriesByType('resource')` showed native `load` events
staggered across ~5s while the reveal stayed batched. Fix (Attempt I, shipped): move the
trigger off React — an inline `<script>` in the streamed shell adds a capture-phase
`load` listener on `document` (fires per image, before hydration), double-rAF for a
painted blurred frame, then set a `data-*` attribute (not a class → no reconcile, no
hydration warning). Needs `next/image` with **no** `placeholder="blur"` or its load
re-render clobbers the attribute. Full writeup: `_project/audits/streaming-poc/`.

### L08 · Per-image load timing → Resource Timing API, not the Network panel
**When:** you need to know when each image's fetch started / finished, or whether load
events are actually staggered.
**Lesson:** `performance.getEntriesByType('resource').filter(e => e.initiatorType ===
'img')` gives `startTime` (fetch start; = intersection time for lazy) and
`startTime + duration` (bytes done) per image, React-independent, retroactively, in one
console paste. Beats squinting at the Network waterfall and beats a React `onLoad` probe
(gated on hydration, lies — L07). In dev, `next/image` + Strict Mode re-requests each
image ~3× — dedupe by URL hash, ignore the disk-cache rows (identical `duration`).

### L09 · Diagnosis-complete gate — measure before you build
**When:** a "why does X happen?" question is still open and you are about to write fix
code, or reach for "here are 3 options".
**Lesson:** don't. Name the decisive measurement, run it, read it — *then* act. Every
causal claim (yours or the human's) is a hypothesis carrying a cheap test; run the test
on turn 1, not after a fix fails. Cost: `sang-logium-7j8` — three discarded reveal
implementations before one `getEntriesByType('resource')` paste (native `load` staggered,
reveal batched) pointed straight at the answer. A weekend that should have been an
afternoon.

### L10 · Repo artifacts are evidence, not authority
**When:** about to cite an audit / plan / older lesson to rule an approach in or out.
**Lesson:** first check *what question that doc was answering* — it may be stale or
scoped to a different problem. Cost: `sang-logium-7j8` — the streaming-poc audit's "do
not build a load sequencer" (about **network requests**, fighting HTTP/2) was used for
many turns to block a discussion about pacing the **reveal animation**, a different
thing entirely.

### L11 · Representational honesty in arrival / reveal UI
**When:** an on-load cascade "looks wrong" (fires all at once, or out of order) and you
are tempted to add a `setTimeout`, a paced queue, or an index-keyed `transition-delay`
to make it look right.
**Lesson:** the animation must be driven by the real event it depicts — an image's own
`load`, on its own byte arrival. If the honest per-item signal seems missing, fix the
signal path (attach the listener earlier, off the hydration-gated trigger — L07), never
simulate it. A choreographed cascade over items that all arrived together is a lie the
user can feel.
