# Streaming POC — image "pop" fix: record of failed attempts

Observational record for handoff. Scope: `/streaming-poc` (`app/(test)/streaming-poc/`).
Issue: `sang-logium-7j8` (open). Parent: `sang-logium-7ao` (closed).
Each section states what an attempt changed and the reported outcome. No analysis.

---

## Reported symptom

`sang-logium-7j8` description: images "snap into view in a single frame the moment
their download completes - no visible blur-to-sharp reveal"; "The existing spoc-image-in
CSS fade (opacity 0.35->1 + blur 8px->0, 320ms) is either not firing or is imperceptible".

On the Attempt D code, this session, the user reports: "It doesn't work."

---

## Baseline (before any pop fix)

Per `audit.md` §1 and the parent of commit `8c5b28f6`:

- `<Image fill className="object-cover" placeholder="blur" blurDataURL={lqip}
  priority={priority} sizes="(max-width: 768px) 50vw, 20vw" />`
- No `onLoad`. No animation or transition class.
- `audit.md` §1 measured: "the sharp image snaps in instantly — no ease";
  "Computed `transition: all` = `0s`".

---

## Attempt A — CSS keyframe + manual LQIP underlay (commit `8c5b28f6`)

`app/globals.css`:
- `@keyframes spoc-image-in { from { opacity: 0; filter: blur(8px) } to { opacity: 1; filter: blur(0) } }`
- `.spoc-image-in { animation: spoc-image-in 320ms ease-out both }`
- `@media (prefers-reduced-motion: reduce) { .spoc-image-in { animation: none } }`

`page.tsx`:
- `<Image>` wrapped in a fragment with a sibling
  `<div aria-hidden className="absolute inset-0 bg-cover bg-center"
  style={{ backgroundImage: `url(${lqip})` }} />`
- `<Image>` `className` → `"object-cover spoc-image-in"`
- `placeholder="blur"` / `blurDataURL` **removed** from `<Image>`

`sang-logium-7ao` was closed "Completed" (reason text references
"CSS-only blur-to-sharp fade ... over next/image placeholder=blur").

---

## Attempt B — drop underlay, restore next/image blur, raise keyframe floor (commit `d7959569`)

`page.tsx`:
- Manual underlay `<div>` removed.
- `placeholder="blur" blurDataURL={lqip}` restored on `<Image>`.
- `className` stays `"object-cover spoc-image-in"`.

`app/globals.css`:
- keyframe `from` changed `opacity: 0` → `opacity: 0.35`.

`todo.md` records this state as: "`spoc-image-in` keyframe fires on DOM insertion
(during streaming, while only the LQIP shows), finishes long before the real bytes
arrive, then `next/image` swaps the sharp image in one frame = pop".

---

## Attempt C — `RevealImage` client wrapper (v1 uncommitted; v2 in commit `efa1b32d`)

New `app/(test)/streaming-poc/RevealImage.tsx` (committed form):
- `"use client"`; wraps `next/image` `<Image>`
- `const [done, setDone] = useState(false)`
- `onLoad={() => setDone(true)}`
- `className = [props.className, "spoc-reveal", done && "spoc-reveal-done"].filter(Boolean).join(" ")`

`page.tsx`:
- `import Image from "next/image"` → `import { RevealImage } from "./RevealImage"`;
  `<Image>` → `<RevealImage>`
- `className="object-cover"` (`spoc-image-in` removed); `placeholder="blur"` / `blurDataURL` kept

`app/globals.css`:
- `@keyframes spoc-image-in` and `.spoc-image-in` removed
- `.spoc-reveal { filter: blur(12px); transition: filter 340ms ease-out }`
- `.spoc-reveal-done { filter: blur(0) }`
- `@media (prefers-reduced-motion: reduce) { .spoc-reveal { transition: filter 150ms ease-out } }`

`AI_LESSONS.md` L03 (same commit) states: "an `img.complete`-at-hydration check was the
bug in v1 + v2". The committed `RevealImage.tsx` contains no `img.complete` check;
v1's code is not in git history.

`todo.md` (same commit) lists "7ao, script island, RevealImage v1, RevealImage v2" as
"Four attempts ... failed the same way: a load-time class toggle".

---

## Attempt D — inline non-hydrating script (working tree, uncommitted)

`git status`: `RevealImage.tsx` deleted; `page.tsx`, `globals.css` modified.

`page.tsx`:
- `import { RevealImage }` → `import Image from "next/image"`; `<RevealImage>` → `<Image>`
  with `className="object-cover spoc-reveal"`; `placeholder="blur"` / `blurDataURL` kept
- No `onLoad` prop passed to `<Image>`
- New `REVEAL_SCRIPT` string rendered as
  `<script dangerouslySetInnerHTML={{ __html: REVEAL_SCRIPT }} />`, placed as the first
  child of `<div className="space-y-8 p-6">` (before `<h1>`). Script contents:
  - `done(img)`: `requestAnimationFrame(() => requestAnimationFrame(() => img.classList.add('spoc-reveal-done')))`
  - `arm(img)`: return if `img[data-spoc-armed]`; set it; if `img.complete && img.naturalWidth > 0`
    → `done(img)`; else `img.addEventListener('load', …, {once:true})` and `'error'` → `done`
  - `scan()`: `document.querySelectorAll('img.spoc-reveal')` → `arm` each
  - runs `scan()` immediately; `new MutationObserver(scan).observe(document.documentElement,
    {childList:true, subtree:true})`; `document.addEventListener('DOMContentLoaded', scan)`;
    `window.addEventListener('load', scan)`

`app/globals.css`:
- second `.spoc-reveal` rule added: `animation: spocRevealFailsafe 340ms ease-out 2s forwards`
- `@keyframes spocRevealFailsafe { to { filter: blur(0) } }` (no `from`)
- reduced-motion block unchanged (overrides `transition` only)

Reported outcome this session: "It doesn't work."

**Diagnosis (this session, from installed source).** `next/image` re-renders its own
`<img>` when the bitmap loads — `image-component.js` `handleLoading` → `setBlurComplete(true)`
→ React reconciles `className` on the `<img>` back to its VDOM value
(`object-cover spoc-reveal`), **dropping any class added from outside React**. So the
script island, the `MutationObserver`, and Attempt D's inline script all lose the race:
their `-done` class is clobbered by next/image's own load re-render. External JS cannot
win. Separately, `spocRevealFailsafe` clears the blur at a fixed `2s` regardless of
whether the bitmap arrived → re-introduces a load-independent pop.

---

## Attempt E — client leaf, React owns the class (working tree, uncommitted)

Acts on the diagnosis above: the `-done` class must be React state on the same element,
so next/image's load re-render *carries* it instead of clobbering it.

- New `app/(test)/streaming-poc/RevealImage.tsx` — `"use client"` leaf, imports only
  `react` + `next/image`, renders synchronously (no suspend/throw path → L02 safe).
  `useState(false)`; `className` appends `spoc-reveal` always, `spoc-reveal-done` when
  revealed; `onLoad` → `requestAnimationFrame` ×2 → `setRevealed(true)`. No `img.complete`
  branch (that was the v1/v2 bug; `onLoad` fires for cached images too).
- `page.tsx` — inline script + `REVEAL_SCRIPT` removed; `import Image from "next/image"`
  → `import { RevealImage }`; `<Image>` → `<RevealImage>`; `className` back to
  `"object-cover"` (RevealImage owns `spoc-reveal`). `placeholder="blur"` kept.
  `ProductRow` / `<Suspense>` / fetch code byte-identical.
- `app/globals.css` — `spocRevealFailsafe` keyframe + its `.spoc-reveal { animation }`
  block deleted. `.spoc-reveal` → `blur(14px)` / `transition: filter 450ms`. Reduced-motion
  block kept, shortened to `180ms` (still blurs, never `filter: none`).

vs v2: identical shape + the double `requestAnimationFrame` (forces one painted blurred
frame before the flip — the "from" state v2 never painted) − the `img.complete` check.

Outcome: pending human sign-off on a real foregrounded tab under Slow-4G (per L01/L04,
not verified via the preview pane or browser automation). Reported "it doesn't work" —
the blurred-frame window between next/image's blur-drop and the `-done` flip was too
thin to perceive, and next/image removes its own blur floor at that same instant.

---

## Attempt F — persistent LQIP underlay + load-gated opacity/blur crossfade

Combines the two halves no prior attempt had together: the persistent manual LQIP
underlay from Attempt A + the load-gated foreground transition from C–E.
`placeholder="blur"` dropped entirely.

### F.1 — client leaf (RevealImage) — REVEAL WORKS, but regressed streaming

- `page.tsx` — per tile, when `lqip` present, a sibling `<div aria-hidden
  className="spoc-lqip" style={{ backgroundImage: url(lqip) }} />` before `<RevealImage>`.
  `<RevealImage>` client leaf, `useState`, `onLoad` → rAF×2 → `setRevealed`.
- `app/globals.css` — new `.spoc-lqip` (absolute inset-0, `background-size: cover`,
  `filter: blur(10px)`, `transform: scale(1.1)`). `.spoc-reveal` →
  `opacity: 0; filter: blur(8px); transition: opacity+filter 450ms`. `-done` →
  `opacity: 1; filter: blur(0)`. Reduced-motion → 320ms.

Outcome: the blur→sharp reveal itself is correct (user: "7j8 is actually solved").
BUT reintroducing a `"use client"` component in every tile regressed the
sang-logium-7ao streaming UX — 30 client leaves ship + hydrate in one React pass, so
on a slow link the rows reveal together as one wall instead of arriving as fast small
chunks. Hard constraint now recorded on sang-logium-7j8.

### F.2 — inline script, no client component (working tree, uncommitted) — HARMONIZED

Same `.spoc-lqip` underlay + same CSS as F.1. Difference: the `-done` trigger moves
back off React.

- `page.tsx` — `RevealImage` deleted; plain server `<Image className="object-cover
  spoc-reveal">` (no `placeholder`/`blurDataURL`). Attempt D's `REVEAL_SCRIPT`
  restored (inline `<script>`, first child of the page — no hydration, cannot collapse
  per-row `<Suspense>` streaming). `.spoc-lqip` sibling div kept.
- `globals.css` — unchanged from F.1 (comment updated: `-done` now from the script).
- `RevealImage.tsx` — deleted.

Why the script wins this time (D's blocker is gone): next/image calls
`setBlurComplete()` — and re-renders its `<img>`, reconciling `className` from the
VDOM and wiping an externally-added `-done` — **only when `placeholder !== 'empty'`**
(`node_modules/next/dist/client/image-component.js` `handleLoading`). D still had
`placeholder="blur"`, so its script lost the race. F.2 passes no placeholder, so
next/image does no load-time state change and the script's class sticks. The blurred
preview that `placeholder="blur"` used to provide is now the `.spoc-lqip` layer.

Outcome (live check, dev :3000): reveal works, streaming UX intact — meets the hard
constraint. Two follow-up hassles surfaced, fixed in F.3.

### F.3 — hydration + cleanup (superseded by G)

Two defects in F.2, both from the script mutating the DOM before React hydrates row 1
(cached / priority images are already `complete`):

1. **Hydration console error** — `classList.add('spoc-reveal-done')` changed the
   React-controlled `className`; at hydration React saw `object-cover spoc-reveal` in
   its VDOM vs `... spoc-reveal-done` in the DOM → "tree hydrated but some attributes
   … didn't match … won't be patched up". Fix: the reveal is now a **`data-spoc-done`
   attribute**, not a class. React only reconciles attributes it rendered itself, so
   an extra `data-*` is ignored — the same reason the script's pre-existing
   `data-spoc-armed` never warned. `globals.css`: `.spoc-reveal-done` →
   `.spoc-reveal[data-spoc-done]`.
2. **`.spoc-lqip` underlay lingered** in the final DOM behind every tile — 30 inert
   `filter: blur` + `transform: scale` composite layers. Fix: `done()` now
   `p.remove()`s the underlay sibling 700ms after reveal (after the 450ms transition,
   long after that Suspense boundary hydrated; ProductRow is a server component that
   never re-renders client side, so nothing reconciles against it).

No `suppressHydrationWarning` needed. `<Image>` unchanged from F.2
(`className="object-cover spoc-reveal"`, no placeholder).

Outcome: works, but the mechanism (inline `<script dangerouslySetInnerHTML>` +
`MutationObserver` on `documentElement` + attribute-mutating framework-owned DOM +
`setTimeout` node removal) is not something a production team ships.

---

## Attempt G — small "use client" wrapper, blur-only reveal (working tree, uncommitted) — CURRENT

The industry-standard next/image reveal (Vercel commerce does the same): a small
`"use client"` leaf, `onLoad` → `setState` → class, state seeded from
`ref.current?.complete`. F.1 tried this and regressed the sang-logium-7ao streaming;
G keeps the pattern but removes the regression by fixing *what* the reveal animates.

- `RevealImage.tsx` — `"use client"`, `useState(false)`. `ref` callback:
  `if (img?.complete) setLoaded(true)` (an image done before this leaf hydrates —
  priority / warm cache — reveals at once). `onLoad` → `setLoaded(true)`. Renders the
  `.spoc-lqip` sibling while `!loaded` and unmounts it on load (one commit — exactly
  what next/image's own `placeholder="blur"` does). `className` appends `spoc-reveal`
  always, `spoc-reveal-done` when loaded. Takes `lqip` as a prop.
- `page.tsx` — `REVEAL_SCRIPT` + `<script>` deleted; `import Image` → `import
  { RevealImage }`; `<Image>` → `<RevealImage … lqip={lqip} />`. `ProductRow` /
  `<Suspense>` / fetch unchanged.
- `globals.css` — `.spoc-reveal` is **blur only, no `opacity`**:
  `filter: blur(8px)` → `.spoc-reveal-done { filter: blur(0) }`, `transition:
  filter 450ms` (320ms reduced-motion). `.spoc-lqip` unchanged.

Why F.1 regressed and G does not: F.1's `.spoc-reveal` was `opacity: 0` until the
client state flipped, so on a slow link every image stayed invisible until its leaf
hydrated, and the hydration pass flipped them in a burst = one wall, later. G's image
is `opacity: 1` always and only *blurred* pre-reveal, so it paints the frame its
bytes arrive — hydration-independent — and products still stream in as fast small
chunks. Hydration only decides when the blur eases off (and a synchronised un-blur is
7ao criterion 3, "uniform motion, no stagger", not a defect).

No hydration mismatch: `useState(false)` renders identically on both sides; the class
change is a normal post-hydration update, not a hydration-time DOM diff. No
`suppressHydrationWarning`, no `data-*` attribute hack, no script.

Outcome: pending human sign-off on :3000 — reveal visible, console clean, rows 1/2/3
still flush independently under throttling.

---

## Attempt H — `/streaming-poc-3`: per-row client component, blur-only (new page, alongside G)

Separate page (`app/(test)/streaming-poc-3/`), left next to G for side-by-side sign-off.
Streaming shape per audit Gap 2: **6 `<Suspense>` rows of 5** (was 3×10), async server
`ProductRow`, **first 2 rows `priority`**, rows 3-6 `priority={false}` (→ `loading="lazy"`,
downloads start on scroll — this is what staggers the lower rows).

Changes vs Attempt G:

- One `"use client"` component **per row** (`RevealRow`), not one per tile. G ships 30
  client leaves; H ships 3. `RevealRow` holds a `Set<productId>` of loaded ids in
  `useState`; each local `Tile` gets `revealed` as a plain prop and React toggles the
  blur-clear class. No imperative DOM, no `data-*` attribute, no reliance on next/image's
  no-placeholder re-render behaviour — React owns the className.
- LQIP is the tile container's `background-image` (CSS `background-size: cover`), not a
  sibling `<div>`. No node to unmount (G) and no persistent scaled-blur layer (F.1 /
  poc-2). Nothing to clean up.
- `.reveal` is `filter: blur(8px); transition: filter 350ms ease-out` in a CSS **module**
  (`reveal.module.css`, isolated like poc-2). `opacity` untouched. `.done { filter:
  blur(0) }` added by React state. 350ms is inside the 300–400ms benchmark band
  (audit §2); G used 450ms.
- Reveal triggers: `onLoad` + `onError` + a `ref` callback checking `img.complete &&
  naturalWidth > 0`, all calling one idempotent `reveal(id)`. No `img.complete` *fork*
  (that was the v1/v2 bug — L03); it is an additive trigger. `onError` replaces poc-2's
  6s failsafe animation (a load-independent reveal — the D/E flaw).
- No `placeholder="blur"` on `<Image>` (L03). Verified in installed source
  (`node_modules/next/dist/client/image-component.js` L49): with no placeholder,
  `handleLoading` never calls `setBlurComplete` → next/image does no load-time re-render
  → a React-owned className is safe regardless. It still replays `onLoad` for
  already-complete images (L52), so the `ref`/`complete` check is belt-and-suspenders.

Why H does not regress 7ao streaming: identical to G's reasoning — the `<img>` is
`opacity: 1` and ships blurred from the static stylesheet, so it paints on byte-arrival
with no JS on the path; rows still flush chunk by chunk. Per-row vs per-tile does not
change when any image loads or when its blur clears (each tile's `onLoad` still fires
independently), so reveals stay as independent as the load events. Fewer hydration
units, same guarantee.

The blur→sharp cascade is data-driven — each `<img>` reveals on its own `load`. It is
visible only when byte arrivals are spread over time (DevTools Slow 4G, or lazy rows on
scroll). On localhost / warm cache all bytes land in one frame, React batches the
`setRevealed` calls, and every in-view tile reveals in the same commit. That is correct
(audit §2); a guaranteed cascade on any connection would need an artificial per-tile
`transition-delay`, which 7ao criterion 3 ruled out.

Outcome: pending human sign-off on :3000 — under DevTools Slow 4G, confirm the 6 rows
flush independently (blurred images visible immediately, not one late wall), lower rows
start loading on scroll, and each image visibly eases blur→sharp on its own load.

---

## Attempt I — inline-script reveal, capture-phase `load` delegation — SHIPPED

The per-row / per-tile React approaches (H, G, F.1) all walled the same way, and
Resource Timing finally showed why. `performance.getEntriesByType('resource')` on
`/streaming-poc-3` under 3G: **native `load` events are staggered across ~5s**
(`nativeLoad` spread ≈ 4980ms, tracking `bytesDone` to the millisecond). The
reveal still collapsed to one frame. So the transport was never the problem — the
byte cascade is real and visible (it is the "enhanced blur" phase: real image
painted, still `blur(8px)`, arriving tile by tile).

The collapse: every React trigger (`onLoad`, or a `ref` callback checking
`img.complete`) only goes live **after hydration**. On the dev server hydration
is ~15s (Exp 2); by then every image is `complete`, so the `img.complete` branch
fires for all 30 in the single hydration pass → one batched commit → synchronised
un-blur. `next/image`'s own `onLoad` (routed through `img.decode()`) has the same
end result. Hydration-gated == batched, regardless of the component shape.

Fix — take the trigger off React entirely:

- `page.tsx` — a `<script dangerouslySetInnerHTML>` as the first child of the
  page. It runs in the streamed shell, **before any row `<img>` is parsed and
  before hydration**. It adds one capture-phase `load` listener on `document`
  (`load` does not bubble but IS delivered capture-phase), plus a
  `MutationObserver`/`scan` for images already `complete`. On fire → double
  `requestAnimationFrame` (one painted blurred frame) → `img.setAttribute
  ('data-shown','')`.
- `reveal.module.css` — `.reveal { filter: blur(8px); transition: filter 350ms }`,
  `.reveal[data-shown] { filter: blur(0) }`. Attribute selector, not a class:
  React never renders `data-shown`, so no reconcile, no hydration warning.
- Page is 100% server components. `RevealRow.tsx` unused (left in place).
- Transparent-PNG bleed: the LQIP underlay (container `background-image`) shows
  through transparent regions of the loaded image. Fixed server-side — query
  `metadata.isOpaque`, and only set the LQIP background when `isOpaque !== false`;
  transparent products get plain `bg-neutral-100`. No cleanup script, no
  `setTimeout` node/style removal.

Outcome: confirmed working on the dev server under 3G — LQIP fill → real image
eases blur→sharp on its own `load`, staggered across the whole download window,
no final wall. Streaming (6 Suspense rows of 5) intact.

Why it beats the earlier script attempts (D, F.2, F.3): no `placeholder="blur"`
(so `next/image` never re-renders the `<img>` and never clobbers the attribute —
verified `image-component.js` L49), attribute not class (no hydration warning,
the F.3 fix), LQIP is a plain container background (nothing to remove, unlike
F.3's `.spoc-lqip` node), and `isOpaque` handles transparency without any
post-reveal cleanup.

---

## Attempt J — nav + history-restore resilience on the real grid (sang-logium-3kd)

Umbrella issue over p0g/7j8: prove the ported mechanism survives Back/Forward,
soft nav, every grid route, and a warm Next cache. No new reveal mechanism —
wiring only.

- **Route coverage** is structural: `/products` and `/products/[...slug]` both
  render the grid solely through `ChunkedProductGrid`, which owns the reveal
  script. Any category slug gets the identical path — nothing per-route to port.
- **Soft nav from a non-grid first page** (e.g. home → `/products`): React does
  not execute an inline `<script dangerouslySetInnerHTML>` inserted during client
  render, so the capture-phase `load` listener would never install. New
  `ImageRevealClient` (`"use client"`, renders `null`, next to `<ImageRevealScript>`
  in `ChunkedProductGrid`) injects `REVEAL_SCRIPT` as a real `<script>` node on
  mount **only when `window.__slImageReveal` is still falsy** — the inline copy's
  own guard makes it a no-op otherwise, and a hard grid load is left entirely to
  the inline script (7j8's eased first-view reveal untouched).
- **Back / Forward** (bfcache or RSC router cache replays a painted tree, no
  `load` re-fires): `pageshow`/`persisted` re-runs the scan. Script's `scan()` /
  `reveal()` gained an `instant` flag → sets `data-instant` + `data-shown`
  together; `reveal.module.css` `.reveal[data-instant]{transition:none}` so
  already-painted images resolve sharp with no fake ease (L11). First-view eased
  path unchanged (MutationObserver/DOMContentLoaded/load callers now wrapped so
  their event/record args can't leak in as a truthy `instant`).
- **Warm cache**: cached chunks render already-complete; the persistent
  MutationObserver from the inline script catches them (eased). No code path
  asserts AC4 — warm-cache verdict is the human's.
- `isOpaque` LQIP gate confirmed live: `getProductsByVfsKeys.ts` L50 selects
  `metadata { lqip, isOpaque }`; `ProductImage.tsx` gates the underlay on it.

Files: `ImageRevealScript.tsx` (export + `instant` flag + `window.__slImageRevealScan`),
`ImageRevealClient.tsx` (new), `reveal.module.css` (`.reveal[data-instant]`),
`ChunkedProductGrid.tsx` (render `<ImageRevealClient>`). No deps/config. POC
untouched. Pending: human runs AC1–AC4 on :3000.

---

## Isolated harness

`_project/audits/streaming-poc/reveal-diagnostic.html` (committed in `efa1b32d`).
Plain HTML, no Next/build. Tests: (A) class-flip `filter: blur(14px)→blur(0)` transition
600ms — plain, and with a `@media (prefers-reduced-motion: reduce) { filter: none;
transition: none }` guard; (B) end-to-end with a real `cdn.sanity.io` image, `.done`
added in `img.onload` after a double `requestAnimationFrame`. Logs
`transitionstart` / `transitionend` with `performance.now()`.

Reported outcome this session (dev machine, `prefers-reduced-motion: reduce` = TRUE):
"it did transition, it didn't pop".

---

## next/image behaviour — installed source, next 15.5.15

`node_modules/next/dist/shared/lib/get-img-props.js`:
- `<img>` inline `style` for `fill`: `position:absolute; top/left/right/bottom:0;
  width:100%; height:100%; objectFit; objectPosition`, plus `color: transparent`
  (until alt text shown), plus any caller `style`.
- `placeholder: "blur"` while internal `blurComplete` state is `false`: `style` also
  gets `backgroundImage` = a URL-encoded SVG containing `<feGaussianBlur
  stdDeviation="20">` (twice) over an `<image href="<lqip>">`, with `backgroundSize` =
  the `objectFit` value (`cover`), `backgroundPosition: 50% 50%`, `backgroundRepeat:
  no-repeat`.
- next/image sets no `filter`, `opacity`, or `transition` on the `<img>`.
- When `blurComplete` flips to `true`, `backgroundImage` recomputes to `null`; the
  `<img>` re-renders without it (one React commit, no transition).
- The dev-only branch that swaps the blur SVG for a raw URL applies only when
  `blurDataURL` starts with `/`. Sanity `lqip` is a `data:image/...` string.

`node_modules/next/dist/client/image-component.js`:
- `handleLoading(img, …)`: returns early if `img['data-loaded-src'] === img.src`.
  Otherwise sets `data-loaded-src`, calls `img.decode()`, and in the resolved promise:
  if `placeholder !== 'empty'` calls `setBlurComplete(true)`, then if a caller `onLoad`
  exists builds a synthetic `load` event and calls it.
- Called from: (a) the `<img onLoad>` React handler; (b) the `ownRef` callback —
  `if (img.complete) handleLoading(...)` — which runs when React attaches the ref
  (mount / hydration).
- `priority` → `ImagePreload` calls `ReactDOM.preload(src, { as: 'image', … })`.

`lib/utils/sanityImageLoader.ts`: builds `cdn.sanity.io` URLs via `@sanity/image-url`
(`.width(w).quality(q||75).auto('format')`); passes `http` / `/` srcs through unchanged.

`next.config.ts`: `images.loader: "custom"`, `loaderFile:
"./lib/utils/sanityImageLoader.ts"`, `qualities: [75,90]`, `formats:
["image/avif","image/webp"]`, `deviceSizes`, `imageSizes`, `minimumCacheTTL: 31536000`.
`experimental.optimizeCss: false`, `inlineCss: true` (comment: preserves per-row
Suspense streaming).

---

## Current CSS state — `app/globals.css` (~lines 231–268)

- `.spoc-reveal` matched by two rule blocks:
  `{ filter: blur(12px); transition: filter 340ms ease-out }` and
  `{ animation: spocRevealFailsafe 340ms ease-out 2s forwards }`
- `.spoc-reveal-done { filter: blur(0) }`
- `@keyframes spocRevealFailsafe { to { filter: blur(0) } }`
- `@media (prefers-reduced-motion: reduce) { .spoc-reveal { transition: filter 150ms ease-out } }`
  — does not mention `animation` or `filter`

---

## Environment facts

- `next` 15.5.15 (`package.json`), `react` 19.2.6 (`audit.md`).
- Dev machine reports `prefers-reduced-motion: reduce` = TRUE
  (`reveal-diagnostic.html` output line; `AI_LESSONS.md` L03).
- `AI_LESSONS.md` L01: in-app preview pane forces `prefers-reduced-motion: reduce` and
  lags `img.complete` / network readouts.
- `AI_LESSONS.md` L04: prior browser-automation debugging of this bug produced a wrong
  "page never hydrates" reading from a backgrounded tab.

---

## Files

- `app/(test)/streaming-poc/page.tsx` — modified, uncommitted (Attempt D)
- `app/(test)/streaming-poc/RevealImage.tsx` — deleted in working tree; committed form in `efa1b32d`
- `app/globals.css` — modified, uncommitted (Attempt D)
- `_project/audits/streaming-poc/audit.md` — pre-7ao audit + external benchmark
- `_project/audits/streaming-poc/todo.md` — attempt notes, whiteboards
- `_project/audits/streaming-poc/reveal-diagnostic.html` — isolated harness
- `_project/AI_LESSONS.md` — L01–L08

## Commits

- `8c5b28f6` — Attempt A
- `d7959569` — Attempt B
- `efa1b32d` — Attempt C (RevealImage v2) + LESSONS / CLAUDE / harness
- working tree — Attempt D (uncommitted)
- `63a5d2a2` — `objectFit="contain"` added to
  `app/components/features/products/ProductImage.tsx` (catalogue/homepage component,
  not the POC page)
