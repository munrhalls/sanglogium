# Streaming POC — Gap 1 follow-up TODO

Context: CSS-only blur-to-sharp fade landed (issue sang-logium-7ao / sang-logium-0z2).
Wins: load time greatly reduced, fast even on 3G, streaming cadence intact, no client
component, no card-size changes. Two regressions to clean up before sign-off.

## Open

Issue sang-logium-7j8 — images still pop, no perceptible blur->sharp reveal.
Root cause: `spoc-image-in` keyframe fires on DOM insertion (during streaming,
while only the LQIP shows), finishes long before the real bytes arrive, then
`next/image` swaps the sharp image in one frame = pop. Fixing it needs the
animation class attached at the real `load` moment, which needs JS.

Whiteboard solution (paper first, resolve risks upstream -> downstream):

1. STREAMING INTEGRITY (upstream-most). Do not touch `page.tsx` /
   `ProductRow` / `<Suspense>` — the row-by-row flush is a pure server
   property and stays byte-identical. Add ONE non-hydrating inline `<script>`
   in `page.tsx` (server-rendered text, no `"use client"`, no React client
   node, cannot throw or suspend in SSR). It attaches a capture-phase `load`
   listener on the grid wrapper; on each POC image `load` it adds
   `spoc-image-in`. Streaming risk = 0 by construction, not by testing.
2. TRIGGER CORRECTNESS. Class is added *by the load listener*, never on
   mount — animation start is now genuinely synced to image arrival.
3. NO-JS / SCRIPT-FAIL DEGRADATION. Default state = plain fully-visible sharp
   image (no start class). If the script never runs, images just appear
   (today's behaviour) — never invisible, never broken.
4. CACHED-REVISIT FLASH. Script's init pass scans existing images; any with
   `complete && naturalWidth > 0` are marked done and NOT animated. Later
   `load` events on cached images are ignored via the same done-flag.
5. REDUCED-MOTION + API (downstream-most). Reuse the existing
   `@media (prefers-reduced-motion: reduce)` guard on the new class; no
   `onLoadingComplete`. Pure CSS/hygiene, no architecture impact.

Fallback if the script island is rejected: a `"use client"` leaf wrapping
only `<Image>` (sync, imports only react + next/image, cannot throw in SSR),
class added in `onLoad`. Blast radius = one new file + one import swap in
`ProductRow`; revert = one line.

## Done

- [x] Gap 1 approach chosen: CSS-only (no client component) after the client-wrapper
  attempt collapsed streaming.
- [x] **1 + 2 fixed in one move:** dropped the custom underlay `<div>`, restored
  `next/image` `placeholder="blur"` (smooth blur back, and Next removes it on load so
  nothing lingers), kept the `spoc-image-in` animation with `from` opacity `0.35`
  (was `0`) so the fade eases the sharp image in without washing out the placeholder.
  Verified: 0 underlay divs, smooth blur placeholders present, grid/container classes
  unchanged, no console errors, progressive top-to-bottom load intact.
