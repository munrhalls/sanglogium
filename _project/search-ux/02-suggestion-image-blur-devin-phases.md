# Bug: search suggestion thumbnails stay blurred on mobile

Paste ONE phase at a time to Devin. One branch `fix/search-suggestion-image-blur` from `main`, one PR at the end (`npx -y gh-axi`; no no-mistakes, no CI waiting).

## Rules (Devin: read first)

- Banned: `tsc`, `next build`, lint, tests, `npm run dev`, curl, browser automation against the dev server, `npm install`, subagents. The human does every live check on `localhost:3000`. No `$(...)`/backticks in shell commands.
- Minimal diff. No new deps, no new components, no new CSS files.
- Read `_project/AI_LESSONS.md` L03/L06/L07/L11 and `docs/search-ux.md` first. Do NOT weaken the grid reveal (L06/L07/L11 are why it looks the way it does).

## Root cause (already established from code — Phase 1 only confirms it)

- `app/components/features/products/ProductImage.tsx` always renders the `<img>` with `styles.reveal` and `data-reveal=""`.
- `reveal.module.css`: `.reveal { filter: blur(8px) }`; it only becomes sharp when the `<img>` gets `data-shown`.
- `data-shown` is set **only** by the inline script in `ImageRevealScript.tsx` (capture-phase `load` listener + MutationObserver), and that script is rendered **only** by `ProductGrid` (and its client companion on soft nav).
- The search suggestion rows (`AutocompleteItem` or its current equivalent under `app/components/features/search/`, rendered inside the phone `SearchSheet`) reuse `ProductImage`. On any page that has no `ProductGrid` (home, product page, etc.) nothing ever sets `data-shown` → the thumbnail stays at `blur(8px)` forever. Even where the grid script exists, thumbnails that mount after a keystroke are an unintended fit for a "blur-up on first paint" effect designed for streamed grids.
- Also on the same line: `sizes="(max-width: 768px) 50vw, 25vw"` is wrong for a 48px thumbnail (over-fetches on mobile networks).

## Phase 1 — Confirm (human-assisted, no dev server from Devin)

- T1.1 Read `ProductImage.tsx`, `reveal.module.css`, `ImageRevealScript.tsx`, and find every `ProductImage` consumer under `app/components/features/search/` and `app/components/layout/header/` (`grep -rn "ProductImage" app/components/features/search app/components/layout/header`). List them in the PR description: which pass `className`, which render on phone vs `sm+`.
- T1.2 Answer "is desktop affected?" from code: does the `sm+` popup (`SearchFieldDesktop`) use `ProductImage` too? If yes, the bug exists there on any page without `ProductGrid` and the user's "desktop unaffected" belief is wrong (or masked because they tested on `/products`); say which.
- T1.3 Hand the human this 20-second check for a 390px viewport, sheet open, after typing 2+ chars (paste in DevTools console), on a page WITHOUT a product grid (home) and on `/products`:
  - `!!window.__slImageReveal` → expect `false` on home, `true` on `/products`
  - `document.querySelectorAll('[role=listbox] img[data-reveal]:not([data-shown])').length` → expect >0 on home (blurred), and 0 on `/products` once loaded
  Record the answers in the PR description. If results differ from the prediction, STOP and report — do not patch.

Done =
- [ ] (a) consumers listed; desktop verdict stated from code
- [ ] (b) human console result recorded, matches the root cause (or Devin stopped and reported)

## Phase 2 — Patch (smallest correct fix)

- T2.1 `ProductImage.tsx`: add an optional boolean prop `reveal` (default `true`, so every existing caller — grids, cards, wishlist — is byte-for-byte unchanged). When `reveal === false`: no `styles.reveal` class, no `data-reveal` attribute, no LQIP layer; keep `object-contain mix-blend-multiply`, `fill`, and the wrapper. Also add optional `sizes` prop (default = the current string) passed through to `<Image>`.
- T2.2 In the suggestion row component(s) from T1.1 (phone sheet AND desktop popup if it uses `ProductImage`): pass `reveal={false}` and `sizes="48px"` (use the real rendered width if the thumbnail box is not 48px).
- T2.3 Do not touch `reveal.module.css`, `ImageRevealScript.tsx`, or `ProductGrid.tsx`.
- T2.4 Edge cases to handle in code review (comment in PR, no extra code unless needed):
  - slow network: a not-yet-loaded thumbnail must sit on the flat `bg-surface-productImage` tile (no LQIP, no blur) — no layout shift because the tile is fixed 48px;
  - cached results re-mounting on each keystroke: no flash, since nothing animates;
  - `mix-blend-multiply` stays so transparent PNGs keep the tile colour.
- T2.5 Height/sizing className edit review gate: re-read the diff against `docs/vertical-space-lg-touch.md` (only if any `h-full`/`aspect-` class was touched; it should not be).

Done =
- [ ] (a) diff touches only `ProductImage.tsx` and the search suggestion component(s)
- [ ] (b) default behaviour of `ProductImage` unchanged for all other callers

## Phase 3 — Verify (human on `localhost:3000`) + PR

- T3.1 Hand the human this checklist (390×844, then 320×568; throttle to "Fast 4G" once):
  - Home (no grid): open search, type "hd800" → thumbnails are sharp immediately, both on first results and on every further keystroke; no blur at any point.
  - `/products` and a category page: same.
  - Desktop 1280px: popup thumbnails sharp on home and on `/products`.
  - Console re-run of the T1.3 selector: `[role=listbox] img[data-reveal]` count is 0 (suggestion thumbnails no longer opt into the reveal).
- T3.2 Regression check that the intended blur-up still works on first paint: hard-reload `/products/headphones` with "Slow 4G" throttling → product cards still load blurred and ease to sharp per image as bytes arrive (staggered, not one wall); wishlist and search-results grids (`/search?q=hd800`) same.
- T3.3 Open the PR with `npx -y gh-axi`; title "Fix: search suggestion thumbnails stuck blurred"; include the T1.3 findings and the T3 checklist.

Done =
- [ ] (a) suggestion thumbnails sharp on phone and desktop, on pages with and without a grid
- [ ] (b) grid blur-up unchanged
- [ ] (c) PR open with findings + checklist
