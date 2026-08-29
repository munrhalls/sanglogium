# Streaming POC — Gap 1 follow-up TODO

Context: CSS-only blur-to-sharp fade landed (issue sang-logium-7ao / sang-logium-0z2).
Wins: load time greatly reduced, fast even on 3G, streaming cadence intact, no client
component, no card-size changes. Two regressions to clean up before sign-off.

## Open

- [ ] **1. Pixelated LQIP placeholder.** The underlay `<div>` uses the raw ~20px
  base64 stretched with `bg-cover` and no blur → blocky patch during load, vs the
  smooth soft blur `next/image` `placeholder="blur"` used to render (SVG + feGaussianBlur).
  → solve on paper, then implement.

- [ ] **2. Underlay `<div>` never unmounts.** The `aria-hidden` underlay is static
  server-rendered markup with no JS to remove it — sits behind every image forever
  as dead weight + bleed-through risk. `next/image` removed its own placeholder on load.
  → solve on paper, then implement.

## Done

- [x] Gap 1 approach chosen: CSS-only (no client component) after the client-wrapper
  attempt collapsed streaming.
