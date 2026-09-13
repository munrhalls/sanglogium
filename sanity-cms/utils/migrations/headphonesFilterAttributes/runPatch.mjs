import path from "path";
import { pathToFileURL } from "url";
import { runProductPatch } from "./engine.mjs";

// CLI entry point — shared across every sang-logium-1xs.9 brand issue.
//
//   node runPatch.mjs products/hd-560s.mjs           # dry run (no writes)
//   node runPatch.mjs products/hd-560s.mjs --write   # phased patch (writes to Sanity)
//
// Always run the dry run first, review the printed field diff, then re-run
// with --write. Never skip straight to --write.

const [, , specPathArg, flag] = process.argv;

if (!specPathArg) {
  console.error("Usage: node runPatch.mjs <path-to-product-spec.mjs> [--write]");
  process.exit(1);
}

const write = flag === "--write";
const specPath = path.resolve(process.cwd(), specPathArg);

const mod = await import(pathToFileURL(specPath).href);
const spec = mod.default;

try {
  await runProductPatch(spec, { write });
} catch (err) {
  console.error(`\n❌ ${err.message}`);
  process.exit(1);
}
