# Streaming POC — image-arrival UX audit

Pre-requirement for `sang-logium-7ao`. Tracks issue `sang-logium-0z2`.
Date: 2026-08-29. Scope: **only** the three criteria in 7ao — blur-to-sharp transition,
coherent load order, uniform motion. Everything else (skeleton design, chunk sizing,
data fetching, perceived-perf metrics) is out of scope.

Source audited: `app/(test)/streaming-poc/page.tsx` (self-contained — the only file on
the page's image path besides the global loader).
Image path: Sanity `image.asset->metadata.lqip` → `<Image>` (`next/image`) →
custom global loader `lib/utils/sanityImageLoader.ts` → `cdn.sanity.io`.
Versions verified against installed: next 15.5.15, react 19.2.6, @sanity/image-url 1.2.0.

---

## 1. Current behaviour (measured in-browser, dev)

| Criterion | What the code does | What the user sees |
|---|---|---|
| **Blur-to-sharp** | `placeholder="blur"` + `blurDataURL={lqip}` on every `<Image>` when `lqip` present. Next renders the LQIP as a `background-image` (blurred SVG) on the `<img>` and **removes it in one frame** when the real image's `load` fires. Computed `transition: all` = `0s` (no duration). No `onLoad` handler, no opacity/filter animation. | LQIP blur is visible while loading, then the sharp image **snaps in instantly** — no ease. Not blank-to-pop (the blur is there), but not a transition either. |
| **Load order** | Three `<Suspense>` boundaries, one per 10-item row. Row 1 `<ProductRow priority>` → all 10 `<Image priority>` (eager, `fetchpriority=high`). Rows 2–3 `priority={false}` → `loading="lazy"`. Within any row the 10 `<Image>` elements are emitted together; the browser opens all in-viewport requests in parallel; paint order = **whichever Sanity CDN response returns first**. | Row-level order is roughly top-to-bottom (row 1 first). **Within a row: scattered pops** in network-arrival order, no left-to-right wave. |
| **Uniform motion** | There is no motion. Every image swaps identically (instantly). No per-tile `transition-delay` or stagger anywhere. | Trivially uniform because nothing animates. The moment a real transition is added, uniformity must be preserved deliberately. |

Controlling code: all three behaviours are governed by lines `56–65` of
`app/(test)/streaming-poc/page.tsx` (the `<Image>` element and its props) plus the
per-row `priority` split at lines `87–95`. **Nothing** in the codebase currently adds
an eased transition or sequences intra-row arrival.

---

## 2. External benchmark (4 stores, listing pages, computed styles read live)

| Store | Placeholder | Transition (property / duration / easing) | Load-order mechanism | Uniform? |
|---|---|---|---|---|
| **Everlane** | `filter: blur(20px)` + `opacity:0` | `opacity 0.3s` **and** `filter 0.4s linear` (blur 20px→0) | lazysizes / IntersectionObserver → viewport-driven | Yes — single `.lazyload/.lazyloaded` class pair |
| **Bang & Olufsen** | solid colour swatch (`#fafafa`) | `opacity 0.4s ease-in-out` (0→1) | IntersectionObserver (`.a-observer -placehold`) | Yes — one class |
| **Nike** | solid / low-res | `opacity 1e-6s` — **deliberately ~0ms** (avoids flash, no fade) | `loading="lazy"` → viewport-driven | Yes — one class (`product-card__hero-image`) |
| **headphones.com** (Shopify) | none | `transition: none` — instant | `loading="lazy"` | Yes (nothing animates) |

**Concrete consensus:**
- **Transition:** when there is one, it is an **opacity fade, 300–400 ms**, `ease-in-out`
  or `linear`. Everlane also animates `blur(20px)→0` over ~400 ms. Two of four do
  effectively no fade — a fast, calm snap is an accepted professional choice.
- **Placeholder:** split — solid colour (B&O, Nike) vs blur-up (Everlane). LQIP-style
  blur is legitimate; nobody uses a *long* blur animation.
- **Load order:** **universal — viewport-driven via IntersectionObserver / native lazy.**
  Zero stores sequence network arrival or add ordered delays. Top-to-bottom emerges
  because top rows enter the viewport first; images already in the viewport still
  resolve in parallel/arrival order and this is considered fine.
- **Uniformity:** **100% class-based** in every store. No per-tile stagger anywhere.

---

## 3. Stack-standard approach (Next 15 / React 19 / Sanity)

| Criterion | Idiomatic mechanism in our stack | Notes / gotchas |
|---|---|---|
| **Blur-to-sharp** | `next/image` has **no native blur→sharp animation** (confirmed: vercel/next.js discussions #20155, #39029 — still unresolved). Standard community fix: track load with the `onLoad` prop on `<Image>`, toggle a class, and animate in CSS. Common recipe: `transition: opacity .2s cubic-bezier(.3,.2,.2,.8)` (olivierlarose guide) or opacity+`blur()` ~300–400 ms to match the LQIP. | `onLoad` (not `onLoadingComplete`, deprecated in 15) may **not fire for cached images** → guard with `img.complete` in the handler / initialise state from a ref. Keep Next's own `placeholder="blur"` as the pre-load layer OR replace it with a manual LQIP `<img>`; running both can double-render. `next/image` clears its blur bg on load regardless, so a manual fade layer must sit **on top**. |
| **Load order** | RSC streaming already flushes each `<Suspense>` row as its Sanity promise resolves (per `next.config.ts` note: `optimizeCss:false` deliberately preserves this). Within a row, `next/image` `priority` sets `fetchpriority=high` + preload; lazy rows use native `loading="lazy"`. There is **no idiomatic "sequence the grid" primitive** — matches the benchmark (nobody does it). | To get a visible top-to-bottom wave *within* content already in the viewport you must add it yourself (JS load-queue, or staggered `fetchpriority`/`decoding`, or IntersectionObserver-gated rendering). This is **non-idiomatic** and fights the parallelism the platform wants. Cheaper lever: smaller rows / more Suspense boundaries so the *row* streaming does the ordering. |
| **Uniform motion** | One shared transition utility class (Tailwind `transition-opacity duration-300 ease-in-out` or a CSS class) applied to every tile. Our build-time VFS (`data/catalogue.ts`) already carries LQIP with no request cost, so every tile can have a placeholder → uniform starting state. | Do **not** put the duration/easing on `<Image>` inline per-call; centralise it so "every image identical" is structurally guaranteed. No `transition-delay` keyed to index. |

---

## 4. Gaps & recommended direction (ranked by user-visible impact)

### Gap 1 — no eased blur-to-sharp transition *(highest impact; directly criterion 1 & 3)*
- **Now:** LQIP blur → instant snap to sharp (`transition: all 0s`).
- **Target (measurable):** on the real image's load, fade `opacity 0→1` (and optionally
  `blur(12–20px)→0`) over **300 ms, `ease-in-out`**, from one shared class; identical
  for all 30 tiles; no `transition-delay`. Respect `prefers-reduced-motion` (→ 0 ms,
  per Nike/`motion-reduce` precedent).
- **Code delta:** in `page.tsx` `<Image>` (lines 56–65): add an `onLoad` handler that
  sets a `loaded` state (initialised from `ref.current?.complete` to cover cached
  images), and a shared className toggled on `loaded`. Keep `placeholder="blur"` as the
  underlay. ~15–20 lines, one component.
- **Risk:** `onLoad` + cached-image edge case; the `img.complete` guard is required or
  cached tiles start at `opacity:0` and never fade in.

### Gap 2 — scattered intra-row arrival, no wave *(medium impact; criterion 2)*
- **Now:** 10 parallel requests per row, paint in CDN-response order.
- **Benchmark verdict:** **no professional store sequences this** — they rely on
  viewport order + lazy. Recommendation: **do not build a JS load-sequencer.** Instead:
  (a) shrink `ROW_SIZE` (10 → 4–5) so more `<Suspense>` boundaries exist and RSC row
  streaming produces the top-to-bottom cascade for free; and/or (b) drop `priority` from
  all but the true above-the-fold row so lazy loading enforces top-down as the user
  scrolls. Accept that images sharing the viewport resolve in parallel — with Gap 1
  fixed, each one still *eases* in, so parallel arrival reads as calm, not as pops.
- **Code delta:** change `ROW_SIZE` (line 5); narrow the `priority` prop to row 1 only
  (already the case) and consider `priority` only on the first 4–5 images.
- **Conflict flag:** a bespoke sequencer would fight RSC streaming + `next/image`
  parallelism and is non-idiomatic — explicitly **not recommended**.

### Gap 3 — uniformity is currently accidental *(low now, rises after Gap 1)*
- **Now:** uniform only because nothing moves.
- **Target:** the Gap-1 transition must live in exactly one place (shared class /
  wrapper component), never per-`<Image>` inline values, so "no two tiles fading at
  different speeds" is structural. No index-keyed `transition-delay`.
- **Conflict flag:** if Gap 1 keeps `next/image`'s own blur underlay *and* adds a manual
  fade, verify the two don't produce a double transition (Next's bg clears with no
  transition, so layering a fade on top is fine — but test).

---

## Height/sizing review gate (CLAUDE.md)

The `<Image fill>` sits in `relative aspect-square w-full overflow-hidden` (line 55) —
container owns size via `aspect-square`, image uses `fill` + `object-cover`. None of the
recommended deltas touch `h-full` / `min-h-` / `max-h-` / `aspect-`. **Gate not
triggered by this audit.** If Gap 1's implementation adds a wrapper around `<Image>`,
re-run the gate on that diff.

---

## Handoff to `sang-logium-7ao`

1. Implement Gap 1 (shared eased fade, `onLoad` + `complete` guard, reduced-motion).
2. Apply Gap 2 via `ROW_SIZE` / `priority` tuning only — no sequencer.
3. Enforce Gap 3 by construction (single source for the transition).
4. Human sign-off: watch `/streaming-poc` under real devtools Slow-4G throttling and
   confirm the grid resolves as a calm top-to-bottom cascade with identical motion.
