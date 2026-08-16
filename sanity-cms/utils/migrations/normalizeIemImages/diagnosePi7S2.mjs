import { readClient } from "./getClient.mjs";
import {
  measureDensity,
  computeBucket,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  TOP_MARGIN_BUFFER,
} from "./imageNormalization.mjs";

// One-off diagnostic for the Pi7 S2 capped-low bug — not part of the
// regular pipeline. Traces the step-down loop by hand, independent of
// normalizeImageBufferToTarget, so the trace can't be wrong for the same
// reason the loop under test might be.

const QUERY = `*[_id == "homepageData"][0].iemsGallery[]->{ _id, name, image { asset->{ _id, url } } }`;

function computePlacement(cropWidth, cropHeight, fillRatioPercent, topMarginBuffer) {
  const f = fillRatioPercent / 100;
  const scale = cropWidth >= cropHeight ? (f * CANVAS_WIDTH) / cropWidth : (f * CANVAS_HEIGHT) / cropHeight;
  const newWidth = Math.max(1, Math.round(cropWidth * scale));
  const newHeight = Math.max(1, Math.round(cropHeight * scale));
  const left = Math.round((CANVAS_WIDTH - newWidth) / 2);
  const anchorYFraction = f + topMarginBuffer;
  const targetAnchorY = anchorYFraction * CANVAS_HEIGHT;
  const top = Math.round(targetAnchorY - newHeight);
  return { newWidth, newHeight, left, top, anchorYFraction };
}

function checkEdges({ newWidth, newHeight, left, top }) {
  const right = left + newWidth;
  const bottom = top + newHeight;
  const failures = [];
  if (left < 0) failures.push(`LEFT overflow by ${-left}px`);
  if (top < 0) failures.push(`TOP overflow by ${-top}px`);
  if (right > CANVAS_WIDTH) failures.push(`RIGHT overflow by ${right - CANVAS_WIDTH}px`);
  if (bottom > CANVAS_HEIGHT) failures.push(`BOTTOM overflow by ${bottom - CANVAS_HEIGHT}px`);
  return failures;
}

async function main() {
  const products = await readClient.fetch(QUERY);
  const pi7s2 = products.find((p) => /pi7 s2/i.test(p.name));
  if (!pi7s2) throw new Error("Pi7 S2 not found in iemsGallery");

  const res = await fetch(pi7s2.image.asset.url);
  const buffer = Buffer.from(await res.arrayBuffer());
  const d = await measureDensity(buffer);
  const bucket = computeBucket(d.bboxWidth, d.bboxHeight);

  console.log("========== Pi7 S2 DIAGNOSTIC ==========");
  console.log(`bbox: ${d.bboxWidth} x ${d.bboxHeight} (aspect ratio W/H = ${(d.bboxWidth / d.bboxHeight).toFixed(4)})`);
  console.log(`bucket: ${bucket}`);
  console.log(`density: ${d.density.toFixed(4)}`);
  console.log(`canvas: ${CANVAS_WIDTH}x${CANVAS_HEIGHT}, TOP_MARGIN_BUFFER: ${TOP_MARGIN_BUFFER}`);

  console.log("\n--- Step-down trace, buffer=0.07, from 92% down to 15% in 0.5pp steps ---");
  console.log("Fill%".padEnd(8) + "newW".padEnd(7) + "newH".padEnd(7) + "left".padEnd(7) + "top".padEnd(7) + "right".padEnd(7) + "bottom".padEnd(8) + "Fits?".padEnd(7) + "Failing edges");
  let maxFittingFill007 = null;
  for (let fill = 92; fill >= 15; fill -= 0.5) {
    const p = computePlacement(d.bboxWidth, d.bboxHeight, fill, TOP_MARGIN_BUFFER);
    const failures = checkEdges(p);
    const fits = failures.length === 0;
    if (fits && maxFittingFill007 === null) maxFittingFill007 = fill;
    console.log(
      fill.toFixed(1).padEnd(8) +
        String(p.newWidth).padEnd(7) +
        String(p.newHeight).padEnd(7) +
        String(p.left).padEnd(7) +
        String(p.top).padEnd(7) +
        String(p.left + p.newWidth).padEnd(7) +
        String(p.top + p.newHeight).padEnd(8) +
        (fits ? "YES" : "no").padEnd(7) +
        failures.join("; ")
    );
  }
  console.log(`\n=> Maximum fitting fill ratio at buffer=0.07: ${maxFittingFill007 ?? "NONE FOUND in range"}%`);

  console.log("\n--- Same trace, buffer=0.03 ---");
  let maxFittingFill003 = null;
  for (let fill = 92; fill >= 15; fill -= 0.5) {
    const p = computePlacement(d.bboxWidth, d.bboxHeight, fill, 0.03);
    const failures = checkEdges(p);
    const fits = failures.length === 0;
    if (fits && maxFittingFill003 === null) {
      maxFittingFill003 = fill;
      console.log(`First fitting fill ratio at buffer=0.03: ${fill}% (newW=${p.newWidth}, newH=${p.newHeight}, left=${p.left}, top=${p.top})`);
      break;
    }
  }
  console.log(`=> Maximum fitting fill ratio at buffer=0.03: ${maxFittingFill003 ?? "NONE FOUND in range"}%`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
