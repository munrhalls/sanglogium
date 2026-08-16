// Diagnostic: verify the "0 broken" result by inspecting the actual image
// files served for the audio-electronics page. Downloads each unique image
// URL and uses sharp to detect placeholder-style content (uniform grid/band
// pattern, tiny blurry files, etc.). Read-only; downloads to .logs/img-inspect.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ANALYSIS_FILE = "audio-electronics-image-analysis.json";
const OUT_DIR = ".logs/img-inspect";

const analysis = JSON.parse(fs.readFileSync(ANALYSIS_FILE, "utf8"));
const urls = [...new Set(analysis.products.map((p) => p.imgSrc).filter(Boolean))];
console.log("Unique image URLs: " + urls.length);

fs.mkdirSync(OUT_DIR, { recursive: true });

const CONCURRENCY = 6;
const TIMEOUT_MS = 20000;

async function download(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) return { status: res.status };
    const buf = Buffer.from(await res.arrayBuffer());
    const hash = new URL(url).pathname.split("/").pop() || "img";
    const file = path.join(OUT_DIR, hash.replace(/[^a-zA-Z0-9._-]/g, "_"));
    fs.writeFileSync(file, buf);
    return { status: res.status, file, bytes: buf.length };
  } catch {
    return { status: 0 };
  } finally {
    clearTimeout(timer);
  }
}

// Analyze with sharp: dimensions, mean luminance, row-band energy (placeholder
// grids have many sharp horizontal bands), and detect tiny/low-info images.
async function analyze(file) {
  try {
    const img = sharp(file);
    const meta = await img.metadata();
    const { data, info } = await img
      .resize(48, 48, { fit: "fill" })
      .raw()
      .toBuffer({ resolveWithObject: true });
    const size = info.width * info.height;
    const lum = new Float64Array(size);
    for (let i = 0; i < size; i++) {
      lum[i] = 0.299 * data[i * info.channels] + 0.587 * data[i * info.channels + 1] + 0.114 * data[i * info.channels + 2];
    }
    let mean = 0;
    for (let i = 0; i < size; i++) mean += lum[i];
    mean /= size;
    // Row averages -> band transitions
    const rowSum = new Float64Array(info.height);
    for (let y = 0; y < info.height; y++) {
      let s = 0;
      for (let x = 0; x < info.width; x++) s += lum[y * info.width + x];
      rowSum[y] = s / info.width;
    }
    let bandCount = 0;
    let rowEnergy = 0;
    for (let y = 1; y < info.height; y++) {
      const d = Math.abs(rowSum[y] - rowSum[y - 1]);
      if (d > 12) bandCount++;
      rowEnergy += d;
    }
    // Variance of row means (uniform image => ~0)
    let rowMean = 0;
    for (let y = 0; y < info.height; y++) rowMean += rowSum[y];
    rowMean /= info.height;
    let varSum = 0;
    for (let y = 0; y < info.height; y++) varSum += (rowSum[y] - rowMean) ** 2;
    const rowVar = varSum / info.height;
    return {
      width: meta.width,
      height: meta.height,
      bytes: fs.statSync(file).size,
      meanLum: Math.round(mean),
      bandCount,
      rowEnergy: Math.round(rowEnergy),
      rowVar: Math.round(rowVar),
    };
  } catch (err) {
    return { error: err.message };
  }
}

const results = [];
let index = 0;
async function worker() {
  while (index < urls.length) {
    const url = urls[index++];
    const dl = await download(url);
    let imgInfo = null;
    if (dl.file) imgInfo = await analyze(dl.file);
    results.push({ url: url.slice(0, 120), ...dl, ...(imgInfo || {}) });
    if (results.length % 10 === 0 || results.length === urls.length) {
      console.log("  inspected " + results.length + "/" + urls.length);
    }
  }
}
const workers = [];
for (let i = 0; i < CONCURRENCY; i++) workers.push(worker());
await Promise.all(workers);

fs.writeFileSync(
  ".logs/audio-electronics-image-file-analysis.json",
  JSON.stringify(results, null, 2),
);

// Flag suspicious: non-200 status, tiny bytes, uniform content (rowVar ~ 0),
// or heavy band pattern (bandCount >= 12).
const suspicious = results.filter(
  (r) =>
    (r.status !== 200) ||
    (r.bytes != null && r.bytes < 2000) ||
    (r.rowVar != null && r.rowVar < 5) ||
    (r.bandCount != null && r.bandCount >= 12),
);
console.log("\n=== SUSPICIOUS: " + suspicious.length + "/" + results.length + " ===");
for (const s of suspicious) {
  console.log(
    "  " +
      s.url +
      " | status=" + s.status +
      " | bytes=" + s.bytes +
      " | " + (s.width ? s.width + "x" + s.height : "") +
      " | meanLum=" + s.meanLum +
      " | bandCount=" + s.bandCount +
      " | rowVar=" + s.rowVar,
  );
}
console.log("\nDetail saved to .logs/audio-electronics-image-file-analysis.json");
