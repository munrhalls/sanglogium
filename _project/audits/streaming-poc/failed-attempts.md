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

`LESSONS.md` L03 (same commit) states: "an `img.complete`-at-hydration check was the
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
  (`reveal-diagnostic.html` output line; `LESSONS.md` L03).
- `LESSONS.md` L01: in-app preview pane forces `prefers-reduced-motion: reduce` and
  lags `img.complete` / network readouts.
- `LESSONS.md` L04: prior browser-automation debugging of this bug produced a wrong
  "page never hydrates" reading from a backgrounded tab.

---

## Files

- `app/(test)/streaming-poc/page.tsx` — modified, uncommitted (Attempt D)
- `app/(test)/streaming-poc/RevealImage.tsx` — deleted in working tree; committed form in `efa1b32d`
- `app/globals.css` — modified, uncommitted (Attempt D)
- `_project/audits/streaming-poc/audit.md` — pre-7ao audit + external benchmark
- `_project/audits/streaming-poc/todo.md` — attempt notes, whiteboards
- `_project/audits/streaming-poc/reveal-diagnostic.html` — isolated harness
- `_project/LESSONS.md` — L01–L05

## Commits

- `8c5b28f6` — Attempt A
- `d7959569` — Attempt B
- `efa1b32d` — Attempt C (RevealImage v2) + LESSONS / CLAUDE / harness
- working tree — Attempt D (uncommitted)
- `63a5d2a2` — `objectFit="contain"` added to
  `app/components/features/products/ProductImage.tsx` (catalogue/homepage component,
  not the POC page)
