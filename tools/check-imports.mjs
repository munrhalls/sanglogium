#!/usr/bin/env node
// Dependency-free import-resolution check for changed files.
// Usage: node tools/check-imports.mjs [base]   (base defaults to origin/main)
// Certifies only this diff: specifiers starting with '.' or '@/' in changed
// files must resolve, and deleted/renamed-away files must have no referrers.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const base = process.argv[2] || "origin/main";
const root = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

const CODE = /\.(ts|tsx|mts|mjs|js|jsx)$/;
const EXTS = [".ts", ".tsx", ".mts", ".mjs", ".js", ".jsx", ".d.ts", ".json", ".css"];
const SPEC = /(?:from\s+|import\s*\(?\s*)["']([^"']+)["']/g;

function git(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
}

// Diff base against the worktree (not ...HEAD): a commit-to-commit diff misses
// staged and intent-to-add files, which must still be checked.
const changed = git(["diff", "--name-only", "--diff-filter=ACMR", base]);
const deleted = git(["diff", "--name-only", "--diff-filter=D", base]);
for (const line of git(["diff", "--name-status", "-M", base])) {
  const [status, oldPath] = line.split("\t");
  if (status && status.startsWith("R") && oldPath) deleted.push(oldPath);
}

// '@/' -> repo root; '.'/'..' -> importer's directory. Returns a repo-relative path.
function resolveSpec(spec, importer) {
  const abs = spec.startsWith("@/")
    ? path.join(root, spec.slice(2))
    : path.resolve(root, path.dirname(importer), spec);
  return path.relative(root, abs).split(path.sep).join("/");
}

function resolves(rel) {
  const p = path.join(root, rel);
  if (existsSync(p) && statSync(p).isFile()) return true;
  for (const ext of EXTS) {
    if (existsSync(`${p}${ext}`)) return true;
    if (existsSync(path.join(p, `index${ext}`))) return true;
  }
  return false;
}

// Module id for comparison: strip extension and trailing /index.
function moduleId(rel) {
  return rel.replace(/\.(d\.ts|ts|tsx|mts|mjs|js|jsx|json|css)$/, "").replace(/\/index$/, "");
}

const violations = [];
const changedSet = new Set(changed);

for (const file of changed) {
  if (!CODE.test(file) || !existsSync(path.join(root, file))) continue;
  const src = readFileSync(path.join(root, file), "utf8");
  const lines = src.split("\n");
  lines.forEach((line, i) => {
    for (const m of line.matchAll(SPEC)) {
      const spec = m[1];
      if (!spec.startsWith(".") && !spec.startsWith("@/")) continue;
      if (!resolves(resolveSpec(spec, file))) {
        violations.push(`${file}:${i + 1} ${spec}`);
      }
    }
  });
}

// Reverse check: deleted/renamed-away targets whose victims are outside the diff.
if (deleted.length) {
  const allFiles = git(["ls-files"]).filter((f) => CODE.test(f));
  for (const file of allFiles) {
    const src = readFileSync(path.join(root, file), "utf8");
    const lines = src.split("\n");
    lines.forEach((line, i) => {
      for (const m of line.matchAll(SPEC)) {
        const spec = m[1];
        if (!spec.startsWith(".") && !spec.startsWith("@/")) continue;
        const id = moduleId(resolveSpec(spec, file));
        for (const dead of deleted) {
          if (id === moduleId(dead)) {
            violations.push(`${file}:${i + 1} ${spec} (resolves to deleted ${dead})`);
          }
        }
      }
    });
  }
}

if (violations.length) {
  console.log(violations.join("\n"));
  process.exit(1);
}
console.log("clean");
