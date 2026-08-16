Task: normalize two product image assets to a fixed, already-measured target so both are visually consistent in product size, margin, and centering.

Files — do not touch any other file in this repository:
- C:\webdev\sang-logium\normalize-just-two-images\Final-Audio-ZE8000.png (1200x1200, RGBA, transparent background)
- C:\webdev\sang-logium\normalize-just-two-images\Sony-WF-1000XM5.png (1024x1024, RGBA, transparent background)

Reference standard — already established, do not re-derive or change these numbers:
- Target fill ratio: 83%. The product's bounding box (the smallest rectangle containing all non-transparent pixels) should span 83% of the canvas's limiting side.
- Margin evenness: opposite margins (left vs. right, top vs. bottom) must be within 2 percentage points of canvas size of each other.
- Centering: the bounding box's center must be within 2% of canvas width/height from the exact canvas center.

Measurement method — use exactly this, so results are comparable to the numbers already recorded:
1. Load each PNG preserving its alpha channel.
2. Build a foreground mask: any pixel with alpha greater than 10 counts as product; everything else is background.
3. Compute the bounding box of that mask (min/max x and y of foreground pixels).
4. Fill ratio = max(bbox width, bbox height) / canvas side x 100 (both canvases are square).
5. Margins = empty space outside the bbox on each side, as a percentage of that side's canvas dimension.
6. Center offset = abs(bbox center - canvas center) / canvas dimension x 100, computed separately for x and y.

Current measured state, for reference — already confirmed, do not re-measure the originals before starting:
- ZE8000: fill ratio 89.6%, margins even, centered. Needs to shrink toward 83%.
- Sony: fill ratio 79.7%, margins even, centered. Needs to grow slightly toward 83%.

What to do, for each of the two files:
1. Measure the current bounding box using the method above.
2. Compute a uniform scale factor = 83 / current fill ratio. Apply it equally to width and height — preserve the product's proportions, do not stretch or distort it.
3. Resize the product region by that factor using high-quality resampling (e.g. Lanczos).
4. Composite the resized product onto a new transparent canvas at the exact same original dimensions as the source file (1200x1200 for ZE8000, 1024x1024 for Sony), centered exactly — equal left/right margin, equal top/bottom margin.
5. Save the result as a new file in the same folder: `Final-Audio-ZE8000-normalized.png` and `Sony-WF-1000XM5-normalized.png`. Do not overwrite or delete the originals.

Verification — required, not optional:
1. Run the exact same measurement method above on both newly created files.
2. Print a plain results table for each new file: fill ratio, left/right margin, top/bottom margin, center offset (x and y).
3. State plainly whether each new file passes: fill ratio within 81-85%, margin evenness within 2 percentage points, centering within 2%. If either file fails any check, say so directly — do not round up or call it close enough.

Constraints:
- Use Node.js with the `sharp` library, already a dependency of this repository. Do not install any new package.
- Write the logic as one standalone script file, `normalize-just-two-images/normalize.mjs` — not inline shell one-liners. Do not use `$()` or backticks in any terminal command, per this repository's CLAUDE.md.
- Do not modify, move, or delete any file outside `normalize-just-two-images/`.
- Do not touch Sanity, the live site, or any other part of the codebase.
- Do not run `npm install`, `npm run build`, or start a dev server.
- When finished, report only: the script's location, the two new file paths, and the verification table with pass/fail results. Nothing else.
