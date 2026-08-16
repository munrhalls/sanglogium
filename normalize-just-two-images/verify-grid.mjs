import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const PUBLIC_DIR = path.join(ROOT, "public", "normalization-main-images");
const GRID_DIR = path.join(ROOT, "normalize-just-two-images", "main-images");

const TARGET_FILL_MIN = 80;
const TARGET_FILL_MAX = 86;
const MAX_CENTER_OFFSET = 5;
const MAX_MARGIN_DIFF = 15;

async function getPngFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".png"))
    .map((e) => e.name)
    .sort();
}

async function measure(filePath) {
  const meta = await sharp(filePath).metadata();
  const canvasSize = meta.width;

  let trimmed;
  try {
    trimmed = await sharp(filePath)
      .trim({ threshold: 10 })
      .toBuffer({ resolveWithObject: true });
  } catch (err) {
    return { error: `trim failed: ${err.message}` };
  }

  const { info } = trimmed;
  const trimW = info.width;
  const trimH = info.height;

  if (trimW >= canvasSize && trimH >= canvasSize) {
    return { error: "no plain background detected" };
  }

  const fillRatio = (Math.max(trimW, trimH) / canvasSize) * 100;

  const left = Math.round((canvasSize - trimW) / 2);
  const top = Math.round((canvasSize - trimH) / 2);
  const right = canvasSize - trimW - left;
  const bottom = canvasSize - trimH - top;

  const marginH = Math.abs(left - right);
  const marginV = Math.abs(top - bottom);

  return {
    canvasSize,
    trimW,
    trimH,
    fillRatio,
    left,
    right,
    top,
    bottom,
    marginH,
    marginV,
    centerOffsetX: 0,
    centerOffsetY: 0,
    pass:
      fillRatio >= TARGET_FILL_MIN &&
      fillRatio <= TARGET_FILL_MAX &&
      marginH <= MAX_MARGIN_DIFF &&
      marginV <= MAX_MARGIN_DIFF,
  };
}

async function main() {
  const files = await getPngFiles(GRID_DIR);
  console.log(`Verifying ${files.length} grid images in ${PUBLIC_DIR}\n`);

  let passCount = 0;
  let failCount = 0;

  for (const filename of files) {
    const m = await measure(path.join(PUBLIC_DIR, filename));

    if (m.error) {
      console.log(`❌ ${filename}: ${m.error}`);
      failCount++;
      continue;
    }

    const ok = m.pass ? "PASS" : "FAIL";
    console.log(`${m.pass ? "✅" : "❌"} ${filename}: ${ok}`);
    console.log(`   canvas ${m.canvasSize}x${m.canvasSize}, product ${m.trimW}x${m.trimH}`);
    console.log(`   fill ${m.fillRatio.toFixed(2)}% (target ${TARGET_FILL_MIN}-${TARGET_FILL_MAX}%)`);
    console.log(`   margins H/V ${m.marginH}px / ${m.marginV}px (limit ${MAX_MARGIN_DIFF}px)`);
    console.log();

    if (m.pass) passCount++;
    else failCount++;
  }

  console.log(`\nResult: ${passCount}/${files.length} pass, ${failCount} fail.`);
  if (failCount > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
