// Check "guard": approval gates and the never-committed sweep.
//   ENV       (blocks) a .env* path other than .env.example is tracked or added
//   IGNORED   (blocks) a tracked file matches .gitignore — secrets, logs, caches are never committed
//   TESTFILE  (warns)  new file under tests/ that is not a .laws.ts — owner approval required
//   TESTCFG   (warns)  new test-runner config — owner approval required
//   DEP       (warns)  added dependency pin in package.json — owner approval required
//   INSTR     (warns)  always-loaded instruction files exceed the word ceiling — context must not grow back

import { existsSync, readFileSync } from "node:fs";

export const name = "guard";

const ENV_FILE = /(^|\/)\.env($|\.)/;
const DEP_LINE = /"[^"]+"\s*:\s*"[\^~>=*]?\d/;
const TEST_CONFIG = /(^|\/)(vitest|jest|playwright|cypress)\.config\./;
const INSTR_FILES = ["CLAUDE.md", ".claude/CLAUDE.md"];
const INSTR_WORDS_MAX = 700;

export function run(ctx) {
  const out = [];
  for (const f of ctx.ignored)
    out.push(`${f} IGNORED tracked file matches .gitignore — secrets, logs and caches are never committed`);
  for (const f of ctx.changed)
    if (ENV_FILE.test(f) && !f.endsWith(".env.example"))
      out.push(`${f} ENV .env* files are never committed — names live in .env.example`);
  for (const f of ctx.newFiles) {
    if (f.startsWith("tests/") && !f.endsWith(".laws.ts") && f !== "tests/README.md")
      out.push(`WARN: ${f} TESTFILE new test files need owner approval (behaviour laws tests/<feature>/*.laws.ts excepted)`);
    if (TEST_CONFIG.test(f))
      out.push(`WARN: ${f} TESTCFG new test configs need owner approval (test suites were retired 2026-10-02)`);
  }
  if (ctx.changed.includes("package.json")) {
    const hit = ctx.diffLines("package.json").add.find((l) => DEP_LINE.test(l));
    if (hit) out.push(`WARN: package.json DEP added "${hit.trim()}" — new dependencies need owner approval`);
  }
  if (INSTR_FILES.some((f) => ctx.changed.includes(f) || ctx.newFiles.includes(f))) {
    let words = 0;
    for (const f of INSTR_FILES)
      if (existsSync(f)) words += readFileSync(f, "utf8").split(/\s+/).filter(Boolean).length;
    if (words > INSTR_WORDS_MAX)
      out.push(`WARN: instruction files total ${words}w > ${INSTR_WORDS_MAX}w — always-loaded context must not grow back`);
  }
  return out;
}
