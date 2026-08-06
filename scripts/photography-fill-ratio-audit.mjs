#!/usr/bin/env node

/**
 * Product Photography Fill Ratio Audit
 *
 * Standalone Node script. Zero writes to Sanity, zero app code changes.
 * Downloads each product's primary image, uses sharp's .trim() to detect the
 * tight product bounding box, and produces a local preview + CSV report showing
 * how a re-crop/pad to a target 4:3 canvas at ~75% fill would look.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import dotenv from "dotenv";
import sharp from "sharp";

// Load .env so NEXT_PUBLIC_SANITY_* are available in scripts/
dotenv.config({ path: ".env" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14";

if (!PROJECT_ID) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env");
}

// Match the read-only, CDN-backed, no-token client used by the storefront.
const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  useCdn: true,
  perspective: "published",
});

const builder = imageUrlBuilder(client);

function urlFor(source) {
  return builder.image(source);
}

const OUTPUT_DIR = path.join(process.cwd(), "scripts", "output", "photography-audit");
const REPORT_PATH = path.join(OUTPUT_DIR, "report.csv");
const PROGRESS_PATH = path.join(OUTPUT_DIR, ".progress.json");
const LOG_PATH = path.join(OUTPUT_DIR, "run.log");

const TARGET_ASPECT_RATIO = 4 / 3;
const TARGET_FILL = 0.75;
const TRIM_THRESHOLD = 10; // sharp default
const MAX_DOWNLOAD_WIDTH = 1600;
const MIN_FRAME_FRAC = 0.15;
const MAX_FRAME_FRAC = 0.98;
const FAIL_FAST_COUNT = 10;
const BG_COLOR = "#FAEEE6";

async function appendLog(message) {
  const line = `${new Date().toISOString()} — ${message}\n`;
  console.log(line.trimEnd());
  await fs.appendFile(LOG_PATH, line).catch(() => {});
}

async function ensureOutputDir() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

async function reportHeaderExists() {
  try {
    const stat = await fs.stat(REPORT_PATH);
    return stat.size > 0;
  } catch {
    return false;
  }
}

const CSV_HEADER =
  "productId,slug,name,originalWidth,originalHeight,trimmedWidth,trimmedHeight," +
  "frameFrac,currentFillRatio,proposedFillRatio,targetAspectRatio," +
  "canvasWidth,canvasHeight,cropWidth,cropHeight,confidence,needsReview,previewPath,error\n";

async function writeReportRow(fields) {
  const needsEscape = (val) => /[\",\n\r]/.test(String(val));
  const escape = (val) => `"${String(val).replace(/"/g, "\"\"")}"`;
  const cells = fields.map((val) => (needsEscape(val) ? escape(val) : String(val)));
  await fs.appendFile(REPORT_PATH, cells.join(",") + "\n");
}

async function loadProgress() {
  try {
    const raw = await fs.readFile(PROGRESS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { processedIds: [], failFastPassed: false };
  }
}

async function saveProgress(progress) {
  await fs.writeFile(PROGRESS_PATH, JSON.stringify(progress, null, 2));
}

async function fetchWithRetry(url, attempts = 2) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(60000),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 500 * (i + 1)));
      }
    }
  }
  throw lastError;
}

function sanitizeSlug(slug) {
  return (slug || "unknown")
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

function getPreviewPath(product) {
  const base = sanitizeSlug(product.slug?.current || product._id);
  return path.join(OUTPUT_DIR, `${base}.jpg`);
}

function computeRecomposition(trimW, trimH) {
  const productAspect = trimW / trimH;
  let cropW, cropH, cropLeft, cropTop;

  if (productAspect >= TARGET_ASPECT_RATIO) {
    // Product is too wide for target ratio — crop width
    cropH = trimH;
    cropW = Math.round(cropH * TARGET_ASPECT_RATIO);
    cropLeft = Math.round((trimW - cropW) / 2);
    cropTop = 0;
  } else {
    // Product is too tall for target ratio — crop height
    cropW = trimW;
    cropH = Math.round(cropW / TARGET_ASPECT_RATIO);
    cropLeft = 0;
    cropTop = Math.round((trimH - cropH) / 2);
  }

  // Pad the crop to reach the target fill ratio.
  const scale = 1 / Math.sqrt(TARGET_FILL);
  const canvasW = Math.round(cropW * scale);
  const canvasH = Math.round(cropH * scale);

  const padLeft = Math.round((canvasW - cropW) / 2);
  const padRight = canvasW - cropW - padLeft;
  const padTop = Math.round((canvasH - cropH) / 2);
  const padBottom = canvasH - cropH - padTop;

  return {
    cropLeft,
    cropTop,
    cropW,
    cropH,
    canvasW,
    canvasH,
    padLeft,
    padRight,
    padTop,
    padBottom,
  };
}

async function generatePreview(trimmedBuffer, product, recomp) {
  const previewPath = getPreviewPath(product);

  const { width: tw, height: th } = await sharp(trimmedBuffer).metadata();
  const extractLeft = Math.max(0, Math.min(recomp.cropLeft, tw - 1));
  const extractTop = Math.max(0, Math.min(recomp.cropTop, th - 1));
  const extractWidth = Math.min(recomp.cropW, tw - extractLeft);
  const extractHeight = Math.min(recomp.cropH, th - extractTop);

  const crop =
    extractWidth <= 0 || extractHeight <= 0
      ? trimmedBuffer
      : await sharp(trimmedBuffer)
          .extract({
            left: extractLeft,
            top: extractTop,
            width: extractWidth,
            height: extractHeight,
          })
          .toBuffer();

  await sharp(crop)
    .extend({
      top: recomp.padTop,
      bottom: recomp.padBottom,
      left: recomp.padLeft,
      right: recomp.padRight,
      background: BG_COLOR,
    })
    .jpeg({ quality: 90 })
    .toFile(previewPath);

  return previewPath;
}

async function processImage(product, index, total) {
  const assetRef = product.imageAssetRef;
  if (!assetRef) {
    return {
      fields: [
        product._id,
        product.slug?.current || "",
        product.name || "",
        "", "", "", "", "", "", "",
        `${TARGET_ASPECT_RATIO.toFixed(4)}`,
        "", "", "", "",
        "low",
        "no-image",
        "",
        "No primary image asset reference",
      ],
      highConfidence: false,
    };
  }

  const imageUrl = urlFor(assetRef)
    .width(MAX_DOWNLOAD_WIDTH)
    .quality(90)
    .auto("format")
    .url();

  await appendLog(`[${index + 1}/${total}] ${product.name} — ${product.slug?.current || product._id}`);

  let buffer;
  try {
    buffer = await fetchWithRetry(imageUrl);
  } catch (err) {
    await appendLog(`  ⚠️ download failed: ${err.message}`);
    return {
      fields: [
        product._id,
        product.slug?.current || "",
        product.name || "",
        "", "", "", "", "", "", "",
        `${TARGET_ASPECT_RATIO.toFixed(4)}`,
        "", "", "", "",
        "low",
        "download-failed",
        "",
        `Download failed: ${err.message}`,
      ],
      highConfidence: false,
    };
  }

  try {
    const metadata = await sharp(buffer).metadata();
    const { data: trimmedBuffer, info } = await sharp(buffer)
      .trim({ threshold: TRIM_THRESHOLD })
      .toBuffer({ resolveWithObject: true });

    const originalW = metadata.width;
    const originalH = metadata.height;
    const trimmedW = info.width;
    const trimmedH = info.height;

    const frameFracX = trimmedW / originalW;
    const frameFracY = trimmedH / originalH;
    const frameFrac = Math.max(frameFracX, frameFracY);
    const currentFill = (trimmedW * trimmedH) / (originalW * originalH);

    let confidence = "high";
    let needsReview = "";

    if (!Number.isFinite(frameFrac) || frameFrac < MIN_FRAME_FRAC) {
      confidence = "low";
      needsReview = "degenerate-trim";
    } else if (frameFrac > MAX_FRAME_FRAC) {
      confidence = "low";
      needsReview = "no-plain-background";
    }

    if (confidence === "low") {
      await appendLog(`  ⚠️ ${needsReview} (frameFrac=${frameFrac.toFixed(4)}) — no preview written`);
      return {
        fields: [
          product._id,
          product.slug?.current || "",
          product.name || "",
          originalW,
          originalH,
          trimmedW,
          trimmedH,
          frameFrac.toFixed(4),
          currentFill.toFixed(4),
          "",
          TARGET_ASPECT_RATIO.toFixed(4),
          "", "", "", "",
          confidence,
          needsReview,
          "",
          "",
        ],
        highConfidence: false,
      };
    }

    const recomp = computeRecomposition(trimmedW, trimmedH);
    const previewPath = await generatePreview(trimmedBuffer, product, recomp);
    const previewRel = path.relative(process.cwd(), previewPath);

    await appendLog(
      `  ✅ frameFrac=${frameFrac.toFixed(4)}, preview=${recomp.canvasW}x${recomp.canvasH} — ${previewRel}`
    );

    return {
      fields: [
        product._id,
        product.slug?.current || "",
        product.name || "",
        originalW,
        originalH,
        trimmedW,
        trimmedH,
        frameFrac.toFixed(4),
        currentFill.toFixed(4),
        TARGET_FILL.toFixed(4),
        TARGET_ASPECT_RATIO.toFixed(4),
        recomp.canvasW,
        recomp.canvasH,
        recomp.cropW,
        recomp.cropH,
        confidence,
        needsReview,
        previewRel,
        "",
      ],
      highConfidence: true,
    };
  } catch (err) {
    await appendLog(`  ⚠️ sharp processing failed: ${err.message}`);
    return {
      fields: [
        product._id,
        product.slug?.current || "",
        product.name || "",
        "", "", "", "", "", "", "",
        TARGET_ASPECT_RATIO.toFixed(4),
        "", "", "", "",
        "low",
        "sharp-error",
        "",
        `Sharp processing failed: ${err.message}`,
      ],
      highConfidence: false,
    };
  }
}

async function fetchProducts() {
  const query = `*[_type == "product" && defined(slug.current) && defined(image) && defined(image.asset)] | order(_createdAt desc) {
    _id,
    _createdAt,
    name,
    slug,
    "imageAssetRef": coalesce(image.asset._ref, image.asset._id)
  }`;
  return client.fetch(query);
}

async function preflightProductCount() {
  const countQuery = `count(*[_type == "product" && defined(slug.current) && defined(image) && defined(image.asset)])`;
  let count;
  try {
    count = await client.fetch(countQuery);
  } catch (err) {
    throw new Error(`Sanity count query failed — cannot reach data source? ${err.message}`);
  }

  if (typeof count !== "number") {
    throw new Error(`Sanity count returned unexpected value: ${count}`);
  }

  await appendLog(`Pre-flight: ${count} products with primary images found`);
  return count;
}

async function runAudit() {
  await ensureOutputDir();

  const progress = await loadProgress();

  const headerExists = await reportHeaderExists();
  if (!headerExists) {
    await fs.writeFile(REPORT_PATH, CSV_HEADER);
  }

  const total = await preflightProductCount();
  const products = await fetchProducts();

  if (products.length === 0) {
    await appendLog("No products to process. Exiting.");
    return;
  }

  const processedSet = new Set(progress.processedIds);
  const unprocessed = products.filter((p) => !processedSet.has(p._id));

  if (unprocessed.length === 0) {
    await appendLog(`All ${products.length} products already processed. Exiting.`);
    return;
  }

  // Fail-fast gate: only run if we are not resuming after a previously passed gate.
  let failFastPassed = progress.failFastPassed;
  const isResumingAfterFailFast = failFastPassed && unprocessed.length < products.length;

  if (!failFastPassed && !isResumingAfterFailFast) {
    await appendLog(`Fail-fast gate: processing first ${FAIL_FAST_COUNT} products...`);
    const firstSlice = unprocessed.slice(0, FAIL_FAST_COUNT);
    let highConfidenceInGate = 0;

    for (let i = 0; i < firstSlice.length; i++) {
      const product = firstSlice[i];
      const result = await processImage(product, i, firstSlice.length);
      await writeReportRow(result.fields);
      progress.processedIds.push(product._id);
      if (result.highConfidence) highConfidenceInGate++;
      await saveProgress(progress);
    }

    if (highConfidenceInGate === 0) {
      await appendLog(
        `Fail-fast gate FAILED: all ${firstSlice.length} first products produced low-confidence / degenerate results. Stopping.`
      );
      return;
    }

    failFastPassed = true;
    progress.failFastPassed = true;
    await saveProgress(progress);
    await appendLog(`Fail-fast gate PASSED: ${highConfidenceInGate}/${firstSlice.length} high-confidence. Continuing...`);
  }

  const remaining = unprocessed.filter(
    (p) => !progress.processedIds.includes(p._id)
  );

  const startIndex = products.length - remaining.length;
  const estimatedSecondsPerImage = 2.5; // will be updated after first real image
  const roughEtaMin = Math.ceil((remaining.length * estimatedSecondsPerImage) / 60);
  await appendLog(`Full run: ${remaining.length} products remaining (rough ETA ~${roughEtaMin} minutes)`);

  for (let i = 0; i < remaining.length; i++) {
    const product = remaining[i];
    const globalIndex = startIndex + i;
    const result = await processImage(product, globalIndex, products.length);
    await writeReportRow(result.fields);
    progress.processedIds.push(product._id);
    await saveProgress(progress);
  }

  await appendLog(`Done. Processed ${progress.processedIds.length}/${products.length} products.`);
}

runAudit().catch(async (err) => {
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await appendLog(`FATAL: ${err.message}`);
    await appendLog(err.stack || "");
  } catch {
    // If output dir creation itself failed, write to stderr as last resort.
    console.error("FATAL:", err);
  }
  process.exit(1);
});
