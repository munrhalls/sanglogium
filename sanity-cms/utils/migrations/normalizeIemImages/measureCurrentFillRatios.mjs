import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { measureImageBuffer } from "./imageNormalization.mjs";

// One-off: read each existing composited candidate and report its actual
// fill ratio, purely as a baseline reference for picking the new flat
// per-product numbers. Read-only, writes nothing.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, "../../../../public/normalization-main-images");

async function main() {
  const files = (await fs.readdir(OUTPUT_DIR)).filter((f) => f.endsWith(".png"));
  const rows = [];
  for (const f of files) {
    const buffer = await fs.readFile(path.join(OUTPUT_DIR, f));
    const { metrics } = await measureImageBuffer(buffer);
    rows.push({ file: f, fillRatio: metrics.fillRatio });
  }
  rows.sort((a, b) => a.file.localeCompare(b.file));
  for (const r of rows) {
    console.log(`${r.fillRatio.toFixed(1)}%`.padEnd(8) + r.file);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
