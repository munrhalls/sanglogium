const sharp = require('sharp');

const CANVAS = 1024;
const CONTENT_FRACTION = 0.8;
const ALPHA_THRESHOLD = 10;
const COLOR_THRESHOLD = 20;

// Do NOT use sharp's built-in .trim() — verified unreliable in this environment on both
// a real transparent Sanity PNG and a synthetic solid-white-background PNG (returned the
// untouched canvas size both times). This replaces it with a manual scan, verified correct
// on both cases.
async function detectContentBBox(inputPath) {
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  let minAlpha = 255, maxAlpha = 0;
  for (let i = 3; i < data.length; i += channels) {
    if (data[i] < minAlpha) minAlpha = data[i];
    if (data[i] > maxAlpha) maxAlpha = data[i];
  }
  const hasRealAlpha = minAlpha < 10 && maxAlpha > 245;

  let minX = width, minY = height, maxX = -1, maxY = -1;

  if (hasRealAlpha) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const a = data[(y * width + x) * channels + 3];
        if (a > ALPHA_THRESHOLD) {
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
      }
    }
  } else {
    const bg = [data[0], data[1], data[2]];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * channels;
        const d = Math.abs(data[i]-bg[0]) + Math.abs(data[i+1]-bg[1]) + Math.abs(data[i+2]-bg[2]);
        if (d > COLOR_THRESHOLD) {
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
      }
    }
  }

  if (maxX < 0) return null;
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1, mode: hasRealAlpha ? 'alpha' : 'color' };
}

async function normalize(inputPath, outputPath) {
  const bbox = await detectContentBBox(inputPath);
  if (!bbox) throw new Error('no detectable content in ' + inputPath);

  const cropped = await sharp(inputPath).extract(bbox).toBuffer();
  const scale = (CANVAS * CONTENT_FRACTION) / Math.max(bbox.width, bbox.height);
  const newW = Math.round(bbox.width * scale);
  const newH = Math.round(bbox.height * scale);
  const resized = await sharp(cropped).resize(newW, newH).toBuffer();

  await sharp({ create: { width: CANVAS, height: CANVAS, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: resized, left: Math.round((CANVAS - newW) / 2), top: Math.round((CANVAS - newH) / 2) }])
    .png()
    .toFile(outputPath);

  const v = await detectContentBBox(outputPath);
  return {
    mode: bbox.mode,
    marginPct: {
      L: +(100 * v.left / CANVAS).toFixed(1),
      T: +(100 * v.top / CANVAS).toFixed(1),
      R: +(100 * (CANVAS - v.left - v.width) / CANVAS).toFixed(1),
      B: +(100 * (CANVAS - v.top - v.height) / CANVAS).toFixed(1),
    },
  };
}

module.exports = { normalize, detectContentBBox };
