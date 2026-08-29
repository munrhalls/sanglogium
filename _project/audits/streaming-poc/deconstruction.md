# Streaming POC image reveal — problem deconstruction

Issue: `sang-logium-7j8` (open). Parent: `sang-logium-7ao` (closed).
Scope: `/streaming-poc` (`app/(test)/streaming-poc/`).
Companion docs: `audit.md` (pre-7ao audit + benchmark), `failed-attempts.md` (record of
attempts A–D), `reveal-diagnostic.html` (isolated CSS/plain-img harness), `todo.md`.

---

## Why every past attempt sucked

Each attempt swapped one component — manual underlay div, next/image blur, client
wrapper v1, v2, inline script — and looked at `:3000`. But "hard snap" is the output of
**six independent failure modes that look visually identical**. At no point was each
link known-green in isolation. So "still snaps" was consistent with all six root causes
and eliminated none. That is guessing with a confirmation step, not debugging.

Deconstruction = split the causal chain into links that can each be forced to a yes/no
answer on their own, outside the full app.

---

## The causal chain: bitmap downloaded -> eye sees an ease

Every link must be TRUE for an ease to be seen. Any one FALSE = hard snap.

- **L1** — at the instant the real bitmap first paints, the `<img>` is in a blurred state.
- **L2** — at least one full frame renders the real bitmap *still blurred*, before un-blur starts.
- **L3** — the browser interpolates blur->sharp (real transition/animation, intermediate values across frames).
- **L4** — duration and visual delta are above this user's perception threshold on this monitor.
- **L5** — the un-blur trigger is bound to *bitmap arrival* — not DOM-insert / mount / hydration (too early), not well after paint (too late).
- **L6** — nothing clears or overrides the blurred state before the bitmap arrives (time-fused failsafe, React re-render, next/image placeholder clear).

Two cross-cutting contexts that can independently break any link:

- **X1** — RSC streaming: rows inserted after the script runs; per-row hydration; `img.complete` maybe already true on first scan.
- **X2** — `prefers-reduced-motion: reduce` = ON on the test machine.

---

## What is already established (evidence mapped onto the links)

From `reveal-diagnostic.html`, on the dev machine:

- **L3 — GREEN at 600ms.** Class-flip `filter: blur -> 0` interpolated, did not pop.
- **L4 / X2 — GREEN at 600ms.** Reduced-motion did not kill it (unguarded *and* ship-guard variants).
- **L1 / L2 / L5 — GREEN** for a plain `<img>` + real network image + `.done` flipped in `onload` after a double `requestAnimationFrame`.

From installed `next/image` source (15.5.15):

- Sets no `filter`/`opacity`/`transition`. LQIP is a background SVG, removed in one React commit on `load`.
- On `load`: `img.decode()` -> `setBlurComplete(true)` (a re-render) -> then caller `onLoad`. Fires for cached and fresh.

From Attempt D:

- A failsafe `animation: spocRevealFailsafe 340ms ease-out 2s forwards` was added to `.spoc-reveal`.
  Animations override transitions; `forwards` fill; **2s fuse**. On Slow-4G any image slower
  than 2s is force-unblurred before it arrives -> **L6 FALSE by construction for most tiles.**

From process history:

- The user live-checked every attempt on `:3000`, foregrounded, Slow-4G. The "hard snap"
  symptom is REAL and TRUSTED — not a preview-pane artifact. So the fault lives in the
  `next/image` layer or the streaming layer, since the CSS + plain-img layers are green.

---

## The actual gap

Proven in isolation: the CSS mechanism, and the plain-`<img>` trigger recipe.

**Never tested in isolation: `next/image` wrapper behavior.** Every attempt jumped from
the plain-img harness straight to the full streaming page, so next/image and RSC
streaming were *always confounded*.

That layer splits into four independent questions, all observable in a **minimal Next
route** — one `<Image>`, hardcoded `src` + `blurDataURL`, no Suspense, no streaming, no
Sanity fetch:

- **C1** — at the bitmap's first paint, is `filter: blur(12px)` still on the `<img>`, or has React / next-image already cleared it?
- **C2** — does a load signal (onLoad prop, or native `load` to the script listener) land at/before that first paint — in time to schedule an intermediate frame?
- **C3** — when next/image re-renders on `setBlurComplete(true)`, does React 19 keep a class that external JS added to the DOM `classList` (not in the `className` prop)?
- **C4** — does next/image removing its background-SVG placeholder in one commit produce a visible step that itself reads as "the snap", separate from the filter transition?

---

## Streaming-specific questions — only isolable once C1–C4 are green

- **D1** — does the MutationObserver arm *every* streamed row's images? (armed count vs rendered count)
- **D2** — row-1 `priority` images: is `img.complete` already true on first scan (network is throttled, local render is not)? Does the early-return path still yield an intermediate frame?
- **D3** — does per-row hydration reset the imgs?

---

## Harness-only, no dependencies — answerable now

- **E1** — is `blur(12px) -> 0` over **340ms** perceptible to this user on this monitor? (harness proved 600ms; ship value untested)
- **E2** — is the reduced-motion-shortened **150ms** transition the "imperceptible" the issue actually describes?

---

## Dependency order

1. **E1, E2, and delete the 2s failsafe** — no dependencies, cheap, do first.
2. **C1–C4** — build the minimal Next route. This is *the* blocking unknown.
3. **D1–D3** — meaningful only after C1–C4 are green.
4. **Integration check on `:3000` Slow-4G** — only once C and D are each green, so the streaming page is the sole remaining variable.
