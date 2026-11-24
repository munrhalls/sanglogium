# TODO: product-grid LCP is poor on mobile (research, decide, fix)

**Status: not started. This is a concern to research and decide on, not a fix.**

## Issue

Lighthouse reports a poor Largest Contentful Paint on the catalogue listing, worst on throttled mobile.

## Measurement

- Page: `https://www.sanglogium.com/products/headphones` (production, cold load)
- Date: 2026-11-24
- Tool: Lighthouse 13.6.0 CLI, performance category only, headless Chrome, 3 runs per profile
- Mobile: default profile, simulated throttling (150 ms RTT, ~1.6 Mbps, 4x CPU slowdown)
- Desktop: `--preset=desktop`

| Profile | LCP, 3 runs | FCP | CLS |
|---|---|---|---|
| Mobile | 7.9 s, 10.4 s, 10.8 s | 1.2 s | 0 |
| Desktop | 2.6 s, 2.4 s, 1.9 s | 0.3-0.4 s | 0.07 |

Google's thresholds: good <= 2.5 s, poor > 4 s. Mobile is far into poor, desktop is borderline.

What the traces show:
- The LCP element is a product-card image in the grid (`a.block > figure > div > img.object-contain`). It is a different card in different runs.
- The image is discoverable in the initial HTML and not `loading="lazy"`, but has no `fetchpriority="high"`.
- The unthrottled breakdown (TTFB ~0.1 s, resource load delay 0.46-0.58 s, load 0.05-0.21 s, render delay 0.07-0.38 s) adds up to about 1 s, against 8-11 s in the simulated mobile run. The simulation may be exaggerating the real problem, so check against real-user data before acting.

## Limits of this measurement

- Lab data with simulated throttling, from one location and one page, not real-user data.
- Only the headphones listing was measured. Product pages, the homepage and other categories were not.

## What was done

Nothing in the app. This PR adds only this note.

## To research and decide

1. Check real-user LCP (p75) in Vercel Speed Insights and the existing web-vitals beacon, per route and device.
2. Decide whether the lab mobile number reflects real users or is a throttling artefact.
3. Find which image is the LCP candidate and why it is late (candidates: no `fetchpriority="high"` or priority on above-the-fold cards, image sizing, `next/image` `sizes`, Suspense chunk order, the inline reveal script).
4. Fix, then re-measure with the same command and profiles, and record before/after here.
