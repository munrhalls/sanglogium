Normalization standard — Final Audio ZE8000 vs. Sony WF-1000XM5

This is the one fixed reference both images get checked against. Not "does this look right now" — only "does it match these numbers." Anyone (or anything) checking later applies the same rule, with no judgment call involved.

What gets measured, per image
1. Fill ratio — how much of the frame the product occupies, measured as the smallest rectangle that fully contains the product (both objects together, for the Sony bundle), expressed as a percentage of the frame's shorter/limiting canvas dimension.
2. Margin evenness — the empty space between that rectangle and each of the frame's four edges, compared side to opposite side (left vs. right, top vs. bottom).
3. Centering — how far the middle of that rectangle sits from the exact middle of the frame.

Measured values (diagnostic pass, 2026-08-12, alpha-channel bounding box on the actual downloaded files, cross-checked at two thresholds — results agreed within 0.5%)

| Metric | Final-Audio-ZE8000.png (1200x1200) | Sony-WF-1000XM5.png (1024x1024) |
|---|---|---|
| Fill ratio (longest side of product vs. canvas) | 89.6% | 79.7% |
| Left / right margin | 17.5% / 17.4% | 10.9% / 10.8% |
| Top / bottom margin | 5.2% / 5.0% | 10.1% / 10.0% |
| Center offset (x / y) | ~0% / ~0% | ~0% / ~0.1% |

What this means concretely: margin evenness and centering are already fine on both images individually — left/right and top/bottom margins each match their opposite side almost exactly, and both products sit dead-center in their own canvas. Those two checks are not where the two images disagree. The entire measured disparity between these two specific files is fill ratio: ZE8000 fills 89.6% of its canvas, Sony fills 79.7% of its canvas — roughly a 10-point gap.

Revised target (replaces the earlier placeholder range, now grounded in the two actual files instead of a generic assumption)
- Fill ratio: 80-86% of the frame's limiting dimension. Sony (79.7%) sits essentially at the bottom edge already; ZE8000 (89.6%) is well above it. Closing this gap is the one thing that needs to change for these two files to match.
- Margin evenness: no side's margin more than ~15% wider or narrower than its opposite side. Both files already pass this today.
- Centering: bounding-box center within 5% of canvas center on both axes. Both files already pass this today.

Pass / fail rule (unchanged)
An image passes when fill ratio, margin evenness, and centering all fall inside the ranges above. It fails if any one of the three is outside range, independent of how the two images compare to each other. The two files are never checked against each other directly — each is checked against this standard on its own. If both pass independently, they will look consistent with each other as a result, not as the goal itself.

Open flag, not resolved here: these measured fill ratios (ZE8000 ~90%, Sony ~80%) do not match how the two products appeared on the live homepage screenshots earlier in this process, where ZE8000 rendered as a visibly tiny sliver and Sony rendered as comparatively large. That means either these two downloaded files are not the same source images currently live on the site (e.g., freshly-sourced replacement candidates rather than exports of the current asset), or something between the source file and the rendered card is altering the effective fill ratio beyond what the source crop alone explains. Which of those is true has not been checked and matters before this standard gets applied back to the live page.
