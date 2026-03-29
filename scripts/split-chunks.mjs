import { readFileSync, writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CHUNKS_DIR = join(__dirname, "..", "_temporary", "catalogue-mapping", "chunks");

// Define the chunks to split with their new boundaries
const splits = [
  { original: "products-0-99.json", first: { name: "products-0-49.json", start: 0, end: 50 }, second: { name: "products-50-99.json", start: 50, end: 100 } },
  { original: "products-100-199.json", first: { name: "products-100-149.json", start: 0, end: 50 }, second: { name: "products-150-199.json", start: 50, end: 100 } },
  { original: "products-200-299.json", first: { name: "products-200-249.json", start: 0, end: 50 }, second: { name: "products-250-299.json", start: 50, end: 100 } },
  { original: "products-300-399.json", first: { name: "products-300-349.json", start: 0, end: 50 }, second: { name: "products-350-399.json", start: 50, end: 100 } },
  { original: "products-400-499.json", first: { name: "products-400-449.json", start: 0, end: 50 }, second: { name: "products-450-499.json", start: 50, end: 100 } },
  { original: "products-500-582.json", first: { name: "products-500-541.json", start: 0, end: 42 }, second: { name: "products-542-582.json", start: 42, end: 83 } },
];

for (const split of splits) {
  const originalPath = join(CHUNKS_DIR, split.original);
  const products = JSON.parse(readFileSync(originalPath, "utf-8"));
  
  console.log(`Splitting ${split.original} (${products.length} products)...`);
  
  // First half
  const firstHalf = products.slice(split.first.start, split.first.end);
  const firstPath = join(CHUNKS_DIR, split.first.name);
  writeFileSync(firstPath, JSON.stringify(firstHalf, null, 2));
  console.log(`  -> ${split.first.name} (${firstHalf.length} products)`);
  
  // Second half
  const secondHalf = products.slice(split.second.start, split.second.end);
  const secondPath = join(CHUNKS_DIR, split.second.name);
  writeFileSync(secondPath, JSON.stringify(secondHalf, null, 2));
  console.log(`  -> ${split.second.name} (${secondHalf.length} products)`);
  
  // Delete original
  unlinkSync(originalPath);
  console.log(`  -> Deleted ${split.original}`);
}

console.log("\nAll chunks split successfully!");
