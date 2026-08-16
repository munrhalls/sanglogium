import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const SOURCE_DIR = path.join(ROOT, "normalize-just-two-images", "main-images");
const PUBLIC_DIR = path.join(ROOT, "public", "normalization-main-images");
const BACKUP_DIR = path.join(ROOT, "normalize-just-two-images", "main-images-original-backup");

const OUTPUT_SIZE = 1024;
const TARGET_FILL = 0.83;
const TRIM_THRESHOLD = 10;

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

async function getPngFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".png"))
    .map((e) => e.name)
    .sort();
}

async function measureFill(imageBuffer, canvasSize) {
  const { data, info } = await sharp(imageBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  let minX = width;
  let maxX = -1;
  let minY = height;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const alpha = data[idx + 3];
      if (alpha > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0) {
    return null;
  }

  const bboxW = maxX - minX + 1;
  const bboxH = maxY - minY + 1;
  const fillRatio = (Math.max(bboxW, bboxH) / canvasSize) * 100;

  const left = minX;
  const right = canvasSize - 1 - maxX;
  const top = minY;
  const bottom = canvasSize - 1 - maxY;

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const canvasCenter = (canvasSize - 1) / 2;

  return {
    fillRatio,
    left,
    right,
    top,
    bottom,
    centerOffsetX: (Math.abs(centerX - canvasCenter) / canvasSize) * 100,
    centerOffsetY: (Math.abs(centerY - canvasCenter) / canvasSize) * 100,
    marginEvennessH: Math.abs(left - right),
    marginEvennessV: Math.abs(top - bottom),
    bboxW,
    bboxH,
  };
}

async function normalizeFile(filename) {
  const sourcePath = path.join(SOURCE_DIR, filename);
  const publicPath = path.join(PUBLIC_DIR, filename);
  const backupPath = path.join(BACKUP_DIR, filename);

  await fs.mkdir(BACKUP_DIR, { recursive: true });
  await fs.copyFile(sourcePath, backupPath);

  const originalMeta = await sharp(sourcePath).metadata();

  let trimmed;
  try {
    trimmed = await sharp(sourcePath)
      .trim({ threshold: TRIM_THRESHOLD })
      .toBuffer({ resolveWithObject: true });
  } catch (err) {
    return { status: "trim-failed", error: err.message };
  }

  const { data: trimmedBuffer, info: trimInfo } = trimmed;
  const trimW = trimInfo.width;
  const trimH = trimInfo.height;

  if (trimW >= originalMeta.width && trimH >= originalMeta.height) {
    return { status: "no-trim", error: "No plain background detected — product may touch edges or background is not uniform" };
  }

  const scale = (TARGET_FILL * OUTPUT_SIZE) / Math.max(trimW, trimH);
  const newW = Math.max(1, Math.round(trimW * scale));
  const newH = Math.max(1, Math.round(trimH * scale));

  const resized = await sharp(trimmedBuffer)
    .resize(newW, newH, { kernel: sharp.kernel.lanczos3, fit: "fill" })
    .png()
    .toBuffer();

  const left = Math.round((OUTPUT_SIZE - newW) / 2);
  const top = Math.round((OUTPUT_SIZE - newH) / 2);

  const output = await sharp({
    create: {
      width: OUTPUT_SIZE,
      height: OUTPUT_SIZE,
      channels: 4,
      background: TRANSPARENT,
    },
  })
    .composite([{ input: resized, left, top }])
    .png()
    .toBuffer();

  // Write normalized output to both source and public so they stay in sync
  await fs.writeFile(sourcePath, output);
  await fs.writeFile(publicPath, output);

  const before = await measureFill(trimmedBuffer, OUTPUT_SIZE); // measure trimmed (product) against target canvas
  const after = await measureFill(output, OUTPUT_SIZE);

  return {
    status: "ok",
    original: { width: originalMeta.width, height: originalMeta.height },
    trimmed: { width: trimW, height: trimH },
    scale: scale.toFixed(4),
    output: { width: OUTPUT_SIZE, height: OUTPUT_SIZE, newW, newH, left, top },
    before,
    after,
  };
}

async function main() {
  const files = await getPngFiles(SOURCE_DIR);

  if (files.length === 0) {
    console.log("No PNG files found in", SOURCE_DIR);
    process.exit(1);
  }

  console.log(`Found ${files.length} PNG files. Backups saved to ${BACKUP_DIR}\n`);
  console.log("Processing…\n");

  const results = [];

  for (const filename of files) {
    const result = await normalizeFile(filename);
    results.push({ filename, ...result });

    if (result.status !== "ok") {
      console.log(`❌ ${filename}: ${result.status} — ${result.error}`);
      continue;
    }

    const b = result.before;
    const a = result.after;
    console.log(`✅ ${filename}`);
    console.log(`   original ${result.original.width}x${result.original.height} → trimmed ${result.trimmed.width}x${result.trimmed.height}`);
    console.log(`   scale ${result.scale}, placed ${result.output.newW}x${result.output.newH} at (${result.output.left}, ${result.output.top})`);
    console.log(`   before fill ${b ? b.fillRatio.toFixed(2) : "n/a"}% → after fill ${a ? a.fillRatio.toFixed(2) : "n/a"}%`);
    if (a) {
      console.log(`   center offset ${a.centerOffsetX.toFixed(2)}% / ${a.centerOffsetY.toFixed(2)}%, margin H/V evenness ${a.marginEvennessH.toFixed(2)} / ${a.marginEvennessV.toFixed(2)}`);
    }
    console.log();
  }

  const failed = results.filter((r) => r.status !== "ok");
  const passed = results.filter((r) => r.status === "ok");

  console.log(`\nDone. ${passed.length}/${files.length} normalized successfully. ${failed.length} failed.`);
  if (failed.length > 0) {
    console.log("Failures:", failed.map((f) => f.filename).join(", "));
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
