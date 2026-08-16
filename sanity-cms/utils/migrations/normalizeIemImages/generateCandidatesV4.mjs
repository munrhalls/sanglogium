import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { readClient } from "./getClient.mjs";
import {
  measureDensity,
  measureImageBuffer,
  computeBucket,
  normalizeImageBufferToTarget,
  normalizeImageBufferManual,
  evaluateSelfPass,
  evaluateCrossSetPass,
  median,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  FILL_RATIO_CLAMP_MIN,
  FILL_RATIO_CLAMP_MAX,
} from "./imageNormalization.mjs";

// Manual per-product overrides — documented exceptions only, applied AFTER
// the normal density-solve pipeline determines the shape genuinely can't
// reach an acceptable fill ratio under the shared anchor formula. See the
// Pi7 S2 diagnostic (diagnosePi7S2.mjs): its bbox (996x941, aspect ratio
// 1.06) is scaled by width (landscape bucket) but is nearly as tall as it
// is wide, so at the shared TOP_MARGIN_BUFFER=0.07 the true maximum fitting
// fill ratio is 27% — confirmed by an independent step-by-step trace, not a
// step-down-loop bug. A smaller buffer (0.03) makes it WORSE (max fitting
// fill ratio drops to ~11.5%) because a smaller buffer pushes the anchor
// line higher, leaving less room for this shape's height. Per the 55%
// hard-floor rule, this product is manually fixed at 65% fill ratio with a
// per-product topMarginBuffer=0.18 (independently verified to fit, ~10px
// top margin) instead of the derived 0.07 — this does not change
// TOP_MARGIN_BUFFER or the shared formula for any other product.
const MANUAL_OVERRIDES = [
  {
    test: (n) => /pi7 s2/i.test(n),
    fillRatio: 65,
    topMarginBuffer: 0.18,
    reason:
      "true max fitting fill ratio at the shared 0.07 buffer is 27% (bbox 996x941, nearly square, scaled by width) — below the 55% floor and confirmed not a loop bug; manually fixed at 65% with a per-product 0.18 buffer instead of loosening the shared formula.",
  },
];

function findManualOverride(name) {
  return MANUAL_OVERRIDES.find((o) => o.test(name)) ?? null;
}

// Generate phase — v4 math (density/ink-fraction calibration), written
// straight to public/normalization-main-images/ for live visual review at
// http://localhost:3000/normalization. Read-only against Sanity; no writes.
// Re-run freely while tuning constants — every file is overwritten each run.
//
// v6 changes on top of v4/v5 (two surgical fixes, see task history):
// Fix 1 — Phase 0d calibration uses a trimmed median (drops 1 high + 1 low
// of the 7 twin-earbuds ink fractions) instead of the raw median of all 7.
// Fix 2 — normalizeImageBufferToTarget() in imageNormalization.mjs no longer
// fails closed when the anchor-formula placement can't fit even at the old
// 55% floor; it now steps down until it fits and reports capped-low, so
// every product always gets a written candidate (asserted at the end).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, "../../../../public/normalization-main-images");
const CANVAS_AREA = CANVAS_WIDTH * CANVAS_HEIGHT;
const NOMINAL_FILL_RATIO_FOR_CALIBRATION = 83; // the v3 target the twin-earbuds group was already validated at

const IEMS_GALLERY_QUERY = `*[_id == "homepageData"][0].iemsGallery[]->{
  _id,
  name,
  image { asset->{ _id, url } }
}`;

function slugifyFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// Diagnostic content-category map (from category-content-to-name-map.md),
// checked in order — first match wins. Does not gate normalization.
const CATEGORY_RULES = [
  { category: "case-only", test: (n) => /quietcomfort ultra/i.test(n) || /pi7 s2/i.test(n) || /linkbuds fit/i.test(n) },
  { category: "twin-earbuds", test: (n) => /\bpi5\b/i.test(n) || /\bpi7\b/i.test(n) || /\bpi6\b/i.test(n) || /\bpi8\b/i.test(n) || /tour pro 2/i.test(n) || /wfl910/i.test(n) },
  { category: "open-case", test: (n) => /fokus rex5/i.test(n) },
  { category: "case+single-bud", test: (n) => /moondrop alice/i.test(n) || /wf-g700n/i.test(n) },
  { category: "case+cable", test: (n) => /momentum sport/i.test(n) },
  { category: "dual-container-bundle", test: (n) => /wf-1000xm5/i.test(n) },
  { category: "side-profile-outlier", test: (n) => /ze8000/i.test(n) },
];

function categorize(name) {
  for (const rule of CATEGORY_RULES) {
    if (rule.test(name)) return rule.category;
  }
  return "uncategorized";
}

// Scale factor implied by the ORIGINAL v3 flat target (83%), used only to
// derive what each twin-earbuds product's canvas ink fraction was at the
// fill ratio it was already visually confirmed correct at. No candidate file
// is read for this — it's fully derivable from the original bbox + density.
function scaleForFillRatio(bboxWidth, bboxHeight, fillRatioPercent) {
  const f = fillRatioPercent / 100;
  return bboxWidth >= bboxHeight ? (f * CANVAS_WIDTH) / bboxWidth : (f * CANVAS_HEIGHT) / bboxHeight;
}

async function main() {
  console.log("🎯 v6 Generate phase — trimmed calibration + guaranteed output (read-only, no Sanity writes)\n");

  const products = await readClient.fetch(IEMS_GALLERY_QUERY);
  console.log(`📦 Found ${products.length} products.\n`);

  // --- Phase 0c: fetch + measure density for every product ---
  const items = [];
  for (const product of products) {
    const assetId = product.image?.asset?._id;
    const url = product.image?.asset?.url;
    if (!assetId || !url) {
      console.log(`⚪ Skipping "${product.name}" — no main image asset on document.`);
      continue;
    }

    const res = await fetch(url);
    if (!res.ok) {
      console.log(`❌ Failed to fetch "${product.name}": ${res.status} ${res.statusText}`);
      continue;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const d = await measureDensity(buffer);
    const bucket = computeBucket(d.bboxWidth, d.bboxHeight);
    const category = categorize(product.name);

    items.push({
      id: product._id,
      name: product.name,
      assetId,
      buffer,
      bboxWidth: d.bboxWidth,
      bboxHeight: d.bboxHeight,
      density: d.density,
      bucket,
      category,
    });
  }

  // --- Phase 0d: calibrate target_ink_fraction from the twin-earbuds bucket ---
  const twinEarbuds = items.filter((it) => it.category === "twin-earbuds");
  console.log(`\n🔧 Phase 0d calibration — twin-earbuds group: ${twinEarbuds.length} products`);
  if (twinEarbuds.length !== 7) {
    console.log(`   ⚠️  Expected 7 twin-earbuds products per the category map, found ${twinEarbuds.length}. Proceeding with what was found.`);
  }

  const calibrationInputs = twinEarbuds.map((it) => {
    const scale = scaleForFillRatio(it.bboxWidth, it.bboxHeight, NOMINAL_FILL_RATIO_FOR_CALIBRATION);
    const bboxAreaAt83 = (scale * it.bboxWidth) * (scale * it.bboxHeight);
    const canvasInkFraction = (it.density * bboxAreaAt83) / CANVAS_AREA;
    return { name: it.name, density: it.density, canvasInkFraction };
  });

  calibrationInputs.forEach((c) =>
    console.log(`   - ${c.name}: density=${c.density.toFixed(3)}, canvas_ink_fraction=${c.canvasInkFraction.toFixed(4)}`)
  );

  const inkFractions = calibrationInputs.map((c) => c.canvasInkFraction);
  const untrimmedMedian = median(inkFractions);
  const untrimmedSpread = (Math.max(...inkFractions) - Math.min(...inkFractions)) / untrimmedMedian;

  // Fix 1: drop the single highest and single lowest of the 7, take the
  // median of the remaining 5 — a wide 7-value spread (WFL910's ring shape
  // vs. the solid Pi6/Pi8 pair) let outliers drag the untrimmed median.
  const sorted = [...inkFractions].sort((a, b) => a - b);
  const trimmed = sorted.slice(1, -1);
  const trimmedMedianValue = median(trimmed);
  const trimmedSpread = (Math.max(...trimmed) - Math.min(...trimmed)) / trimmedMedianValue;

  console.log(`\n   target_ink_fraction (untrimmed median of 7) = ${untrimmedMedian.toFixed(4)} (relative spread ${(untrimmedSpread * 100).toFixed(1)}%)`);
  console.log(`   target_ink_fraction (trimmed median of 5, drops 1 high + 1 low) = ${trimmedMedianValue.toFixed(4)} (relative spread ${(trimmedSpread * 100).toFixed(1)}%)`);
  if (trimmedSpread > 0.15) {
    console.log(`   ⚠️  FLAG: trimmed spread still exceeds 15% — proceeding with it anyway, it remains a strictly better estimate than the untrimmed median.`);
  }

  const targetInkFraction = trimmedMedianValue;
  console.log(`\n   -> using target_ink_fraction = ${targetInkFraction.toFixed(4)} (trimmed) for all 16 products.`);

  // Pure math, no compositing — used to report "old" (v5, untrimmed-median)
  // fill ratios next to the "new" (v6, trimmed-median) ones actually applied.
  function solveFillRatio(it, inkFractionTarget) {
    const rawScale = Math.sqrt((inkFractionTarget * CANVAS_AREA) / (it.density * it.bboxWidth * it.bboxHeight));
    const scaledW = rawScale * it.bboxWidth;
    const scaledH = rawScale * it.bboxHeight;
    const matchingSide = scaledW >= scaledH ? CANVAS_WIDTH : CANVAS_HEIGHT;
    const rawFillRatio = (Math.max(scaledW, scaledH) / matchingSide) * 100;
    const clampedFillRatio = Math.min(FILL_RATIO_CLAMP_MAX, Math.max(FILL_RATIO_CLAMP_MIN, rawFillRatio));
    return { rawFillRatio, clampedFillRatio };
  }

  // --- Per-product target fill ratio, solved from target_ink_fraction ---
  // Fix 2: every product gets a written candidate now — normalizeImageBufferToTarget
  // no longer fails closed, so there is no skip/continue path here anymore.
  const report = [];
  const candidates = [];

  for (const it of items) {
    const oldSolve = solveFillRatio(it, untrimmedMedian); // v5, for comparison only — not composited
    const newSolve = solveFillRatio(it, targetInkFraction); // v6, actually used

    const override = findManualOverride(it.name);
    const result = override
      ? await normalizeImageBufferManual(it.buffer, override.fillRatio, override.topMarginBuffer)
      : await normalizeImageBufferToTarget(it.buffer, newSolve.clampedFillRatio);

    const filename = `${slugifyFilename(it.name)}-${it.assetId}.png`;
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.writeFile(path.join(OUTPUT_DIR, filename), result.buffer);

    const after = await measureImageBuffer(result.buffer, { anchorYFraction: result.anchorYFraction });
    const selfResult = evaluateSelfPass(after.metrics, result.appliedFillRatio);

    let capStatus;
    if (override) {
      capStatus = "manual-override";
    } else {
      const cappedHigh = newSolve.rawFillRatio > FILL_RATIO_CLAMP_MAX + 1e-9;
      // capped-low covers both directions of "needed to go below the density
      // solve": pre-composite clamp to the 55% floor, and Fix 2's new
      // composite-time overflow guard stepping even further below that floor.
      const cappedLow = newSolve.rawFillRatio < FILL_RATIO_CLAMP_MIN - 1e-9 || result.capped;
      capStatus = cappedHigh ? "capped-high" : cappedLow ? "capped-low" : "uncapped";
    }

    candidates.push({
      name: it.name,
      category: it.category,
      bucket: it.bucket,
      density: it.density,
      oldFillRatio: oldSolve.clampedFillRatio,
      idealFillRatio: override ? override.fillRatio : newSolve.clampedFillRatio,
      appliedFillRatio: result.appliedFillRatio,
      capStatus,
      overrideReason: override?.reason ?? null,
      metrics: after.metrics,
      selfResult,
      filename,
    });
  }

  // --- Cross-set margin consistency, scoped to ORIENTATION buckets (unchanged from v3) ---
  function bucketMedians(bucketName) {
    const members = candidates.filter((c) => c.bucket === bucketName);
    if (members.length === 0) return null;
    return {
      leftMargin: median(members.map((c) => c.metrics.leftMargin)),
      rightMargin: median(members.map((c) => c.metrics.rightMargin)),
      topMargin: median(members.map((c) => c.metrics.topMargin)),
      bottomMargin: median(members.map((c) => c.metrics.bottomMargin)),
    };
  }
  const mediansByBucket = { portrait: bucketMedians("portrait"), landscape: bucketMedians("landscape") };

  for (const c of candidates) {
    const medians = mediansByBucket[c.bucket];
    const crossResult = evaluateCrossSetPass(c.metrics, medians);
    const fillPass =
      c.capStatus === "manual-override" ||
      c.capStatus !== "uncapped" ||
      Math.abs(c.appliedFillRatio - c.idealFillRatio) <= 2;
    const overallPass = fillPass && c.selfResult.marginPass && c.selfResult.anchorPass && crossResult.crossSetPass;

    report.push({
      name: c.name,
      category: c.category,
      bucket: c.bucket,
      density: c.density,
      oldFillRatio: c.oldFillRatio,
      idealFillRatio: c.idealFillRatio,
      newFillRatio: c.appliedFillRatio,
      capStatus: c.capStatus,
      overrideReason: c.overrideReason,
      selfMarginPass: c.selfResult.marginPass,
      anchorPass: c.selfResult.anchorPass,
      crossSetPass: crossResult.crossSetPass,
      status: c.capStatus === "manual-override" ? "MANUAL" : overallPass ? "PASS" : "FLAG",
      filename: c.filename,
    });
  }

  // --- Report ---
  console.log("\n\n========== v6 GENERATE REPORT ==========");
  console.log(
    "Product".padEnd(42) +
      "Category".padEnd(20) +
      "Density".padEnd(9) +
      "Fill v5".padEnd(9) +
      "Ideal v6".padEnd(10) +
      "Actual v6".padEnd(11) +
      "Cap status".padEnd(13) +
      "Status"
  );
  console.log("-".repeat(150));
  for (const r of report) {
    console.log(
      r.name.slice(0, 41).padEnd(42) +
        r.category.padEnd(20) +
        (r.density?.toFixed(3) ?? "-").padEnd(9) +
        (r.oldFillRatio != null ? r.oldFillRatio.toFixed(1) + "%" : "-").padEnd(9) +
        (r.idealFillRatio != null ? r.idealFillRatio.toFixed(1) + "%" : "-").padEnd(10) +
        (r.newFillRatio != null ? r.newFillRatio.toFixed(1) + "%" : "-").padEnd(11) +
        r.capStatus.padEnd(13) +
        r.status
    );
  }
  console.log("-".repeat(150));
  console.log("(Ideal v6 = density-solved target after the 55/92% clamp, before any anchor-overflow step-down. Actual v6 = what was actually composited. They differ only on capped-low rows.)");

  const overridden = report.filter((r) => r.capStatus === "manual-override");
  if (overridden.length > 0) {
    console.log("\nManual overrides applied:");
    overridden.forEach((r) => console.log(`   - ${r.name}: ${r.overrideReason}`));
  }

  const passCount = report.filter((r) => r.status === "PASS").length;
  const flagCount = report.filter((r) => r.status === "FLAG").length;
  const manualCount = report.filter((r) => r.status === "MANUAL").length;
  console.log(`\n${passCount} passed, ${flagCount} flagged, ${manualCount} manual override (all still written, check visually).`);

  // Fix 2's guarantee, verified: every product must have a written candidate.
  if (candidates.length !== 16) {
    throw new Error(
      `ASSERTION FAILED: expected 16 candidates written, got ${candidates.length}. This is a bug in the Generate phase, not an acceptable outcome — investigate before trusting the output.`
    );
  }
  console.log(`\n✅ 16/16 candidates written — no product was skipped.`);

  console.log(`\n📁 Candidates written to: ${OUTPUT_DIR}`);
  console.log("👀 Refresh http://localhost:3000/normalization and review the live grid.");
  console.log("🛑 Stopping here — no Sanity writes performed.");
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
