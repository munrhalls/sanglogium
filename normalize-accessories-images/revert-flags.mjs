import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAIN_DIR = path.join(__dirname, "main-images");
const MAP_PATH = path.join(__dirname, "flagged-map.json");

async function main() {
  const map = JSON.parse(await fs.readFile(MAP_PATH, "utf-8"));
  let reverted = 0;
  for (const { originalFilename, flaggedFilename } of map) {
    const from = path.join(MAIN_DIR, flaggedFilename);
    const to = path.join(MAIN_DIR, originalFilename);
    if (await fs.stat(from).then(() => true).catch(() => false)) {
      await fs.rename(from, to);
      reverted++;
    }
  }
  await fs.unlink(MAP_PATH);
  console.log(`Reverted ${reverted} renames.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
