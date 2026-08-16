// Verify all downloaded replacement images are valid, readable files with
// sane dimensions. Reads the two result JSONs, checks each localPath with sharp.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const FILES = [
  "scripts/replacement-images-combined-result.json",
  "scripts/replacement-images-mapped-result.json",
];

const okEntries = [];
for (const f of FILES) {
  if (!fs.existsSync(f)) {
    console.error("MISSING " + f);
    continue;
  }
  const list = JSON.parse(fs.readFileSync(f, "utf8"));
  for (const e of list) {
    if (e.status === "OK") okEntries.push(e);
  }
}
console.log("OK entries: " + okEntries.length);

const problems = [];
for (const e of okEntries) {
  const lp = e.localPath;
  if (!fs.existsSync(lp)) {
    problems.push(lp + "  -> FILE MISSING");
    continue;
  }
  try {
    const meta = await sharp(lp).metadata();
    if (!meta.width || meta.width < 100 || !meta.height || meta.height < 100) {
      problems.push(lp + "  -> tiny/odd dims " + meta.width + "x" + meta.height);
    } else {
      console.log("OK  " + lp.replace(/\\/g, "/") + "  " + meta.width + "x" + meta.height);
    }
  } catch (err) {
    problems.push(lp + "  -> sharp error: " + err.message);
  }
}

console.log("\nPROBLEMS: " + problems.length);
for (const p of problems) console.log("  " + p);
