import sharp from "sharp";

const ALPHA_THRESHOLD = 10;
const NO_ALPHA_COLOR_TOLERANCE = 30; // Euclidean RGB distance treated as "same as background"

export const TARGET_FILL_RATIO = 83; // percent, nominal target before any per-product capping

// Shared output canvas — derived in Phase 0 from IemCard.tsx's rendered image
// slot (aspect-[4/3] container, h-[70%]/w-[70%] resp. xs:h-[60%]/w-[60%] using
// matching percentages on both axes, so the slot itself is always 4:3 regardless
// of breakpoint). object-contain means no cropping happens at render time — the
// full asset is always visible, scaled to fit. 1200x900 keeps the canvas close
// in scale to the existing 1200px-wide originals while giving enough headroom
// that the 83%-fill product region rarely needs more than mild upscaling.
export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 900; // 4:3

// Vertical placement is a derived formula, not a magic number: anchor_y_fraction
// = applied_fill_fraction + TOP_MARGIN_BUFFER. TOP_MARGIN_BUFFER=0.07 is the
// value the v2 dry run empirically validated (0.83 + 0.07 = 0.90, ~7% top /
// ~10% bottom margin, confirmed not to overflow for height-limited products).
// Deriving it this way means a future change to TARGET_FILL_RATIO recomputes
// the anchor automatically instead of silently reintroducing the v2 bug
// (fixed 78% anchor + 83% fill pushed the top edge above the canvas).
export const TOP_MARGIN_BUFFER = 0.07;

// If a product's own bbox aspect ratio is extreme enough that TARGET_FILL_RATIO
// would push an edge outside the canvas even with the derived anchor, the fill
// ratio for THAT PRODUCT ONLY is reduced in FILL_RATIO_STEP steps until it fits.
// FILL_RATIO_FLOOR is the minimum attempted — below that, the product is
// flagged failed rather than degraded further.
export const FILL_RATIO_FLOOR = 79; // percent
export const FILL_RATIO_STEP = 0.5; // percentage points per retry step

// v4: per-product target fill ratio (derived from density/ink-fraction
// calibration) is clamped to this band before anything else happens to it —
// see generateCandidatesV4.mjs.
export const FILL_RATIO_CLAMP_MIN = 55; // percent
export const FILL_RATIO_CLAMP_MAX = 92; // percent

function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

/** Single source of truth for the foreground test, shared by bbox detection
 * and density counting so both always agree on the same mask. */
function isForegroundPixel(data, idx, hasAlpha, bg) {
  if (hasAlpha) {
    return data[idx + 3] > ALPHA_THRESHOLD;
  }
  const dist = colorDistance(data[idx], data[idx + 1], data[idx + 2], bg.r, bg.g, bg.b);
  return dist > NO_ALPHA_COLOR_TOLERANCE;
}

/**
 * Loads an image buffer and returns raw RGBA pixel data plus metadata,
 * along with whether the source actually had its own alpha channel
 * (ensureAlpha() always yields 4 channels, so hasAlpha must be read from metadata first).
 */
async function loadRaw(buffer) {
  const image = sharp(buffer);
  const metadata = await image.metadata();
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return {
    data,
    width: info.width,
    height: info.height,
    channels: info.channels,
    hasAlpha: Boolean(metadata.hasAlpha),
  };
}

function sampleCornerBackground(data, width, height, channels) {
  const corners = [
    0, // top-left
    (width - 1) * channels, // top-right
    (height - 1) * width * channels, // bottom-left
    ((height - 1) * width + (width - 1)) * channels, // bottom-right
  ];
  const samples = corners.map((idx) => ({
    r: data[idx],
    g: data[idx + 1],
    b: data[idx + 2],
  }));
  const r = Math.round(samples.reduce((s, c) => s + c.r, 0) / samples.length);
  const g = Math.round(samples.reduce((s, c) => s + c.g, 0) / samples.length);
  const b = Math.round(samples.reduce((s, c) => s + c.b, 0) / samples.length);
  return { r, g, b, samples };
}

/**
 * Builds the foreground bounding box per the established method:
 * alpha > 10 counts as foreground when the source has an alpha channel;
 * otherwise, pixels further than a color-distance tolerance from the
 * corner-sampled background color count as foreground.
 */
function computeBBox({ data, width, height, channels, hasAlpha }) {
  let bg = null;
  let cornersDisagree = false;

  if (!hasAlpha) {
    bg = sampleCornerBackground(data, width, height, channels);
    const maxCornerDistance = Math.max(
      ...bg.samples.map((c) => colorDistance(c.r, c.g, c.b, bg.r, bg.g, bg.b))
    );
    cornersDisagree = maxCornerDistance > NO_ALPHA_COLOR_TOLERANCE;
  }

  let minX = width;
  let maxX = -1;
  let minY = height;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const isForeground = isForegroundPixel(data, idx, hasAlpha, bg);

      if (isForeground) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0) {
    throw new Error("No foreground pixels found (all pixels below threshold)");
  }

  return {
    bbox: { minX, maxX, minY, maxY },
    hasAlpha,
    background: bg,
    ambiguousBackground: cornersDisagree,
  };
}

/**
 * Orientation bucket from a bbox's own width/height — computed on the
 * ORIGINAL (pre-scaling) crop. Uniform scaling preserves aspect ratio exactly,
 * so this also works unchanged when applied to a normalized candidate's own
 * bbox (used by Phase 2 to recover a candidate's bucket without re-fetching
 * the source image).
 */
export function computeBucket(cropWidth, cropHeight) {
  return cropWidth / cropHeight < 1.0 ? "portrait" : "landscape";
}

/**
 * Per-image measurement against whatever canvas the buffer actually is
 * (the original asset for "before", the shared CANVAS_WIDTH x CANVAS_HEIGHT
 * output for "after"). baseAnchorOffset is only computed when anchorYFraction
 * is supplied (meaningful for "after" measurements against that product's own
 * derived/capped anchor; irrelevant for "before").
 */
function measure(bbox, width, height, anchorYFraction) {
  const bboxWidth = bbox.maxX - bbox.minX + 1;
  const bboxHeight = bbox.maxY - bbox.minY + 1;

  const fillRatio =
    bboxWidth >= bboxHeight
      ? (bboxWidth / width) * 100
      : (bboxHeight / height) * 100;

  const leftMargin = (bbox.minX / width) * 100;
  const rightMargin = ((width - 1 - bbox.maxX) / width) * 100;
  const topMargin = (bbox.minY / height) * 100;
  const bottomMargin = ((height - 1 - bbox.maxY) / height) * 100;

  const bboxCenterX = (bbox.minX + bbox.maxX) / 2;
  const canvasCenterX = (width - 1) / 2;
  const centerOffsetX = (Math.abs(bboxCenterX - canvasCenterX) / width) * 100;

  const baseAnchorOffset =
    anchorYFraction != null
      ? (Math.abs(bbox.maxY - anchorYFraction * height) / height) * 100
      : null;

  // Self-symmetry applies to left/right only — the anchor rule
  // deliberately replaces top/bottom evenness for vertical placement.
  const marginEvennessH = Math.abs(leftMargin - rightMargin);

  return {
    bboxWidth,
    bboxHeight,
    aspectRatio: bboxWidth / bboxHeight,
    fillRatio,
    leftMargin,
    rightMargin,
    topMargin,
    bottomMargin,
    centerOffsetX,
    baseAnchorOffset,
    marginEvennessH,
  };
}

/**
 * Self-contained checks only (fill ratio vs. its own applied/capped target,
 * horizontal margin evenness, anchor). Cross-set margin consistency requires
 * the batch's per-bucket medians and is evaluated separately in dryRun.mjs.
 */
export function evaluateSelfPass(metrics, appliedFillRatioPercent) {
  const fillPass = Math.abs(metrics.fillRatio - appliedFillRatioPercent) <= 2;
  const marginPass = metrics.marginEvennessH <= 2;
  const anchorPass =
    metrics.centerOffsetX <= 2 && metrics.baseAnchorOffset != null && metrics.baseAnchorOffset <= 2;
  return { fillPass, marginPass, anchorPass, selfPass: fillPass && marginPass && anchorPass };
}

/**
 * Cross-set margin consistency: for each side independently, this candidate's
 * margin must be within 2pp of the median for that side WITHIN ITS OWN
 * ORIENTATION BUCKET (portrait vs. landscape) — not the whole batch. Caller
 * is responsible for computing bucket-scoped medians and passing the right one.
 */
export function evaluateCrossSetPass(metrics, medians) {
  const leftOk = Math.abs(metrics.leftMargin - medians.leftMargin) <= 2;
  const rightOk = Math.abs(metrics.rightMargin - medians.rightMargin) <= 2;
  const topOk = Math.abs(metrics.topMargin - medians.topMargin) <= 2;
  const bottomOk = Math.abs(metrics.bottomMargin - medians.bottomMargin) <= 2;
  return {
    leftOk,
    rightOk,
    topOk,
    bottomOk,
    crossSetPass: leftOk && rightOk && topOk && bottomOk,
  };
}

export function median(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * Measures a source image buffer per the established method.
 * Returns bbox, metrics, and background-detection diagnostics
 * (relevant only for images without an alpha channel).
 * anchorYFraction is optional — pass it to also get a meaningful baseAnchorOffset.
 */
export async function measureImageBuffer(buffer, { anchorYFraction } = {}) {
  const raw = await loadRaw(buffer);
  const { bbox, hasAlpha, background, ambiguousBackground } = computeBBox(raw);
  const metrics = measure(bbox, raw.width, raw.height, anchorYFraction);
  return {
    width: raw.width,
    height: raw.height,
    bbox,
    hasAlpha,
    background,
    ambiguousBackground,
    metrics,
  };
}

/**
 * v4 Phase 0c — density measurement on the ORIGINAL image. Scale-invariant:
 * measured once here, reused for every candidate fill ratio later, since
 * uniform resizing doesn't change the fraction of the bbox that's foreground.
 */
export async function measureDensity(buffer) {
  const raw = await loadRaw(buffer);
  const { bbox, hasAlpha, background, ambiguousBackground } = computeBBox(raw);

  const bboxWidth = bbox.maxX - bbox.minX + 1;
  const bboxHeight = bbox.maxY - bbox.minY + 1;
  const bboxArea = bboxWidth * bboxHeight;

  let foregroundPixelCount = 0;
  for (let y = bbox.minY; y <= bbox.maxY; y++) {
    for (let x = bbox.minX; x <= bbox.maxX; x++) {
      const idx = (y * raw.width + x) * raw.channels;
      if (isForegroundPixel(raw.data, idx, hasAlpha, background)) {
        foregroundPixelCount += 1;
      }
    }
  }

  return {
    width: raw.width,
    height: raw.height,
    bbox,
    bboxWidth,
    bboxHeight,
    bboxArea,
    foregroundPixelCount,
    density: foregroundPixelCount / bboxArea,
    hasAlpha,
    ambiguousBackground,
  };
}

function computePlacement(cropWidth, cropHeight, fillRatioPercent, topMarginBuffer = TOP_MARGIN_BUFFER) {
  const f = fillRatioPercent / 100;
  const scale =
    cropWidth >= cropHeight ? (f * CANVAS_WIDTH) / cropWidth : (f * CANVAS_HEIGHT) / cropHeight;
  const newWidth = Math.max(1, Math.round(cropWidth * scale));
  const newHeight = Math.max(1, Math.round(cropHeight * scale));
  const left = Math.round((CANVAS_WIDTH - newWidth) / 2);
  const anchorYFraction = f + topMarginBuffer;
  const targetAnchorY = anchorYFraction * CANVAS_HEIGHT;
  const top = Math.round(targetAnchorY - newHeight);
  return { newWidth, newHeight, left, top, anchorYFraction, fillRatioPercent };
}

function fitsCanvas({ newWidth, newHeight, left, top }) {
  return left >= 0 && top >= 0 && left + newWidth <= CANVAS_WIDTH && top + newHeight <= CANVAS_HEIGHT;
}

/**
 * One-shot manual placement — NO step-down retry. For documented per-product
 * overrides only (e.g. a shape where the standard anchor formula's derived
 * buffer genuinely cannot reach an acceptable fill ratio; see Pi7 S2 in
 * generateCandidatesV4.mjs). Throws if the requested fillRatio/topMarginBuffer
 * pair doesn't actually fit — that would mean the override values themselves
 * are wrong, not something to silently degrade further.
 */
export async function normalizeImageBufferManual(buffer, fillRatioPercent, topMarginBuffer) {
  const before = await measureImageBuffer(buffer);
  const { bbox, hasAlpha, background } = before;

  const cropWidth = bbox.maxX - bbox.minX + 1;
  const cropHeight = bbox.maxY - bbox.minY + 1;
  const bucket = computeBucket(cropWidth, cropHeight);

  const placement = computePlacement(cropWidth, cropHeight, fillRatioPercent, topMarginBuffer);
  if (!fitsCanvas(placement)) {
    throw new Error(
      `normalizeImageBufferManual: manual override fillRatio=${fillRatioPercent}% topMarginBuffer=${topMarginBuffer} does not fit a ${cropWidth}x${cropHeight} crop on the ${CANVAS_WIDTH}x${CANVAS_HEIGHT} canvas — pick different override values.`
    );
  }

  const { newWidth, newHeight, left, top, anchorYFraction } = placement;

  const resizedProductBuffer = await sharp(buffer)
    .ensureAlpha()
    .extract({ left: bbox.minX, top: bbox.minY, width: cropWidth, height: cropHeight })
    .resize(newWidth, newHeight, { kernel: sharp.kernel.lanczos3, fit: "fill" })
    .png()
    .toBuffer();

  const canvasBackground = hasAlpha
    ? { r: 0, g: 0, b: 0, alpha: 0 }
    : { r: background.r, g: background.g, b: background.b, alpha: 1 };

  const outBuffer = await sharp({
    create: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, channels: 4, background: canvasBackground },
  })
    .composite([{ input: resizedProductBuffer, left, top }])
    .png()
    .toBuffer();

  return {
    buffer: outBuffer,
    bucket,
    appliedFillRatio: fillRatioPercent,
    topMarginBuffer,
    anchorYFraction,
    newWidth,
    newHeight,
    left,
    top,
    before,
    manualOverride: true,
  };
}

/**
 * Produces a normalized candidate buffer on the SHARED canvas
 * (CANVAS_WIDTH x CANVAS_HEIGHT, same for every product): crops to the
 * foreground bbox, scales uniformly so the crop's limiting side hits
 * TARGET_FILL_RATIO of the canvas's matching side, then composites it
 * horizontally centered and vertically base-anchored per the derived
 * anchor_y_fraction. If that overflows the canvas on any edge, the fill
 * ratio for this product only is stepped down (FILL_RATIO_STEP at a time,
 * floor FILL_RATIO_FLOOR) until it fits; if even the floor doesn't fit,
 * returns { failed: true } instead of compositing.
 */
export async function normalizeImageBuffer(buffer) {
  const before = await measureImageBuffer(buffer);
  const { bbox, hasAlpha, background } = before;

  const cropWidth = bbox.maxX - bbox.minX + 1;
  const cropHeight = bbox.maxY - bbox.minY + 1;
  const bucket = computeBucket(cropWidth, cropHeight);

  let placement = computePlacement(cropWidth, cropHeight, TARGET_FILL_RATIO);
  let capped = false;
  let cappedSteps = 0;

  while (!fitsCanvas(placement)) {
    const nextFill = Math.round((placement.fillRatioPercent - FILL_RATIO_STEP) * 100) / 100;
    if (nextFill < FILL_RATIO_FLOOR - 1e-9) {
      return {
        failed: true,
        reason: `even at the ${FILL_RATIO_FLOOR}% fill-ratio floor, the product region cannot fit inside the shared canvas without exceeding an edge`,
        bucket,
        before,
        cropWidth,
        cropHeight,
      };
    }
    capped = true;
    cappedSteps += 1;
    placement = computePlacement(cropWidth, cropHeight, nextFill);
  }

  const { newWidth, newHeight, left, top, anchorYFraction, fillRatioPercent } = placement;

  const resizedProductBuffer = await sharp(buffer)
    .ensureAlpha()
    .extract({ left: bbox.minX, top: bbox.minY, width: cropWidth, height: cropHeight })
    .resize(newWidth, newHeight, { kernel: sharp.kernel.lanczos3, fit: "fill" })
    .png()
    .toBuffer();

  const canvasBackground = hasAlpha
    ? { r: 0, g: 0, b: 0, alpha: 0 }
    : { r: background.r, g: background.g, b: background.b, alpha: 1 };

  const outBuffer = await sharp({
    create: {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      channels: 4,
      background: canvasBackground,
    },
  })
    .composite([{ input: resizedProductBuffer, left, top }])
    .png()
    .toBuffer();

  return {
    failed: false,
    buffer: outBuffer,
    bucket,
    appliedFillRatio: fillRatioPercent,
    capped,
    cappedSteps,
    anchorYFraction,
    newWidth,
    newHeight,
    left,
    top,
    before,
  };
}

/**
 * v4 variant of normalizeImageBuffer — same anchor/overflow-cap mechanics,
 * but the target fill ratio is supplied per-product instead of the flat v3
 * constant, since v4 derives it from density/ink-fraction calibration rather
 * than a single number shared by every product.
 *
 * v6 (Fix 2): guaranteed output — no fail-closed floor. If the requested
 * fill ratio overflows the canvas under the anchor rule, this steps down
 * (same FILL_RATIO_STEP mechanics as before) until it fits, with no lower
 * bound other than physically fitting. That reachable maximum is what gets
 * composited and reported as `capped: true` ("capped-low" in the caller's
 * report) — every product gets a real candidate, never a hard failure.
 * The iteration cap below is a bug guard, not a real limit: the anchor
 * formula (anchor_y = f + 0.07) always has a fitting solution as f -> 0
 * (see generateCandidatesV4.mjs's Fix 2 notes), so this should never trip
 * outside of an actual defect in the placement math.
 */
export async function normalizeImageBufferToTarget(buffer, targetFillRatioPercent) {
  const before = await measureImageBuffer(buffer);
  const { bbox, hasAlpha, background } = before;

  const cropWidth = bbox.maxX - bbox.minX + 1;
  const cropHeight = bbox.maxY - bbox.minY + 1;
  const bucket = computeBucket(cropWidth, cropHeight);

  let placement = computePlacement(cropWidth, cropHeight, targetFillRatioPercent);
  let capped = false;
  let cappedSteps = 0;
  const MAX_STEPS = 400; // 0.5pp steps; bug guard only, see doc comment above

  while (!fitsCanvas(placement)) {
    if (cappedSteps >= MAX_STEPS) {
      throw new Error(
        `normalizeImageBufferToTarget: no fitting fill ratio found for a ${cropWidth}x${cropHeight} crop after ${MAX_STEPS} steps — this indicates a bug in the placement math, not an expected per-product outcome.`
      );
    }
    const nextFill = Math.round((placement.fillRatioPercent - FILL_RATIO_STEP) * 100) / 100;
    capped = true;
    cappedSteps += 1;
    placement = computePlacement(cropWidth, cropHeight, nextFill);
  }

  const { newWidth, newHeight, left, top, anchorYFraction, fillRatioPercent } = placement;

  const resizedProductBuffer = await sharp(buffer)
    .ensureAlpha()
    .extract({ left: bbox.minX, top: bbox.minY, width: cropWidth, height: cropHeight })
    .resize(newWidth, newHeight, { kernel: sharp.kernel.lanczos3, fit: "fill" })
    .png()
    .toBuffer();

  const canvasBackground = hasAlpha
    ? { r: 0, g: 0, b: 0, alpha: 0 }
    : { r: background.r, g: background.g, b: background.b, alpha: 1 };

  const outBuffer = await sharp({
    create: {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      channels: 4,
      background: canvasBackground,
    },
  })
    .composite([{ input: resizedProductBuffer, left, top }])
    .png()
    .toBuffer();

  return {
    failed: false,
    buffer: outBuffer,
    bucket,
    targetFillRatioPercent,
    appliedFillRatio: fillRatioPercent,
    capped,
    cappedSteps,
    anchorYFraction,
    newWidth,
    newHeight,
    left,
    top,
    before,
  };
}
