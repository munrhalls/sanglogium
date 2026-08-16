import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ALPHA_THRESHOLD = 10;
const TARGET_FILL_RATIO = 83;

async function loadRawWithAlpha(filePath) {
  const image = sharp(filePath);
  const meta = await image.metadata();
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height, channels: info.channels, meta };
}

function computeBBox(data, width, height, channels) {
  let minX = width;
  let maxX = -1;
  let minY = height;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const alpha = data[idx + 3];
      if (alpha > ALPHA_THRESHOLD) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0) {
    throw new Error("No foreground pixels found (all pixels below alpha threshold)");
  }

  return { minX, maxX, minY, maxY };
}

function measure(bbox, canvasSize) {
  const bboxWidth = bbox.maxX - bbox.minX + 1;
  const bboxHeight = bbox.maxY - bbox.minY + 1;

  const fillRatio = (Math.max(bboxWidth, bboxHeight) / canvasSize) * 100;

  const leftMargin = (bbox.minX / canvasSize) * 100;
  const rightMargin = ((canvasSize - 1 - bbox.maxX) / canvasSize) * 100;
  const topMargin = (bbox.minY / canvasSize) * 100;
  const bottomMargin = ((canvasSize - 1 - bbox.maxY) / canvasSize) * 100;

  const bboxCenterX = (bbox.minX + bbox.maxX) / 2;
  const bboxCenterY = (bbox.minY + bbox.maxY) / 2;
  const canvasCenter = (canvasSize - 1) / 2;

  const centerOffsetX = (Math.abs(bboxCenterX - canvasCenter) / canvasSize) * 100;
  const centerOffsetY = (Math.abs(bboxCenterY - canvasCenter) / canvasSize) * 100;

  return {
    bboxWidth,
    bboxHeight,
    fillRatio,
    leftMargin,
    rightMargin,
    topMargin,
    bottomMargin,
    centerOffsetX,
    centerOffsetY,
  };
}

async function measureFile(filePath) {
  const { data, width, height, channels } = await loadRawWithAlpha(filePath);
  const bbox = computeBBox(data, width, height, channels);
  const canvasSize = width; // square canvases
  return { bbox, canvasSize, metrics: measure(bbox, canvasSize) };
}

async function normalize(filePath, outPath, canvasSize) {
  const { bbox, metrics } = await measureFile(filePath);

  const scaleFactor = TARGET_FILL_RATIO / metrics.fillRatio;

  const cropWidth = bbox.maxX - bbox.minX + 1;
  const cropHeight = bbox.maxY - bbox.minY + 1;

  const newWidth = Math.max(1, Math.round(cropWidth * scaleFactor));
  const newHeight = Math.max(1, Math.round(cropHeight * scaleFactor));

  // Extract just the product's bounding box region (with alpha) and resize it uniformly.
  const resizedProductBuffer = await sharp(filePath)
    .ensureAlpha()
    .extract({ left: bbox.minX, top: bbox.minY, width: cropWidth, height: cropHeight })
    .resize(newWidth, newHeight, { kernel: sharp.kernel.lanczos3, fit: "fill" })
    .png()
    .toBuffer();

  const left = Math.round((canvasSize - newWidth) / 2);
  const top = Math.round((canvasSize - newHeight) / 2);

  await sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: resizedProductBuffer, left, top }])
    .png()
    .toFile(outPath);

  return { scaleFactor, newWidth, newHeight, left, top };
}

function printTable(label, canvasSize, m) {
  console.log(`\n=== ${label} (${canvasSize}x${canvasSize}) ===`);
  console.log(`Fill ratio:        ${m.fillRatio.toFixed(2)}%`);
  console.log(`Left margin:       ${m.leftMargin.toFixed(2)}%`);
  console.log(`Right margin:      ${m.rightMargin.toFixed(2)}%`);
  console.log(`Top margin:        ${m.topMargin.toFixed(2)}%`);
  console.log(`Bottom margin:     ${m.bottomMargin.toFixed(2)}%`);
  console.log(`Center offset X:   ${m.centerOffsetX.toFixed(2)}%`);
  console.log(`Center offset Y:   ${m.centerOffsetY.toFixed(2)}%`);

  const marginEvennessH = Math.abs(m.leftMargin - m.rightMargin);
  const marginEvennessV = Math.abs(m.topMargin - m.bottomMargin);

  const fillPass = m.fillRatio >= 81 && m.fillRatio <= 85;
  const marginPass = marginEvennessH <= 2 && marginEvennessV <= 2;
  const centerPass = m.centerOffsetX <= 2 && m.centerOffsetY <= 2;

  console.log(`Margin evenness H/V: ${marginEvennessH.toFixed(2)}% / ${marginEvennessV.toFixed(2)}%`);
  console.log(`Fill ratio check (81-85%):     ${fillPass ? "PASS" : "FAIL"}`);
  console.log(`Margin evenness check (<=2pp): ${marginPass ? "PASS" : "FAIL"}`);
  console.log(`Centering check (<=2%):        ${centerPass ? "PASS" : "FAIL"}`);

  return fillPass && marginPass && centerPass;
}

async function main() {
  const files = [
    {
      name: "ZE8000",
      src: path.join(__dirname, "Final-Audio-ZE8000.png"),
      out: path.join(__dirname, "Final-Audio-ZE8000-normalized.png"),
      canvasSize: 1200,
    },
    {
      name: "Sony",
      src: path.join(__dirname, "Sony-WF-1000XM5.png"),
      out: path.join(__dirname, "Sony-WF-1000XM5-normalized.png"),
      canvasSize: 1024,
    },
  ];

  for (const file of files) {
    const before = await measureFile(file.src);
    console.log(`\n[${file.name}] Original fill ratio: ${before.metrics.fillRatio.toFixed(2)}%`);

    const result = await normalize(file.src, file.out, file.canvasSize);
    console.log(
      `[${file.name}] Applied scale factor ${result.scaleFactor.toFixed(4)} -> resized product ${result.newWidth}x${result.newHeight}, placed at (${result.left}, ${result.top})`
    );
  }

  console.log("\n\n########## VERIFICATION ##########");

  let allPass = true;
  for (const file of files) {
    const after = await measureFile(file.out);
    const pass = printTable(file.name + " normalized", file.canvasSize, after.metrics);
    allPass = allPass && pass;
  }

  console.log(`\nOverall: ${allPass ? "ALL CHECKS PASS" : "ONE OR MORE CHECKS FAILED"}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
