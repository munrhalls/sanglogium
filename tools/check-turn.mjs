#!/usr/bin/env node
// End-of-turn gate. Builds the turn's context once (changed files, deleted files, parsed imports),
// runs every check in CHECKS against it and prints violations per check.
// Usage: node tools/check-turn.mjs [base] [--all]
//   base defaults to origin/main; --all checks the whole tree (owner use, not the turn gate).
// A check is a module exporting `name` and `run(ctx) -> string[]` (violations). To add a check,
// create its file and add it to CHECKS; no existing check changes.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import * as imports from "./check-imports.mjs";
import * as orgPattern from "./check-org-pattern.mjs";

const CHECKS = [imports, orgPattern];
const CODE = /\.(ts|tsx|mts|mjs|js|jsx)$/;
const EXTS = [".ts", ".tsx", ".mts", ".mjs", ".js", ".jsx", ".d.ts", ".json", ".css"];
// import/export statements, dynamic import() and require(); group 1 = `type` modifier, 2 = import clause, 3-5 = specifier
const STMT = /(?:^|[\n;])\s*(?:import|export)\s+(type\s+)?([^'";]*?\s+from\s+)?["']([^"']+)["']|\bimport\(\s*["']([^"']+)["']\s*\)|\brequire\(\s*["']([^"']+)["']\s*\)/g;

const args = process.argv.slice(2);
const all = args.includes("--all");
const baseArg = args.find((a) => !a.startsWith("--")) || "origin/main";
const root = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
const git = (a) => execFileSync("git", a, { cwd: root, encoding: "utf8" }).split("\n").filter(Boolean);
const exists = (f) => existsSync(path.join(root, f));
const read = (f) => readFileSync(path.join(root, f), "utf8");

// Diff against the merge base so a branch that is behind main never inherits main's changes.
const base = all ? "" : git(["merge-base", baseArg, "HEAD"])[0];
// One diff call yields added/modified (changed), deleted and renamed-away paths. Untracked files count as
// changed too: a new file the executor has not staged yet must not escape the gate.
const changed = [];
const deleted = [];
if (all) changed.push(...git(["ls-files"]));
else {
  for (const line of git(["diff", "--name-status", "-M", base])) {
    const [status, from, to] = line.split("\t");
    if (status.startsWith("D")) deleted.push(from);
    else if (status.startsWith("R")) { deleted.push(from); changed.push(to); }
    else changed.push(from);
  }
  changed.push(...git(["ls-files", "--others", "--exclude-standard"]));
}
const files = changed.filter(exists);

const specCache = new Map();
const resolveCache = new Map();
const flagCache = new Map();
// Per-file flags computed once: a server-only marker anywhere, and the first-statement directive
// after comments and blank lines. Non-code and missing files get all-false.
function flags(file) {
  if (!flagCache.has(file)) {
    let serverOnly = false;
    let first = null;
    if (CODE.test(file) && exists(file)) {
      const src = read(file);
      serverOnly = /^import\s+["']server-only["']/m.test(src);
      first = /^(?:\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*["']use (client|server)["']/.exec(src)?.[1] ?? null;
    }
    flagCache.set(file, { serverOnly, first });
  }
  return flagCache.get(file);
}
const ctx = {
  changed: files,
  deleted,
  tracked: () => git(["ls-files"]).filter((f) => CODE.test(f) && exists(f)),
  // True when the file has a line starting with import "server-only" (either quote style).
  serverOnly: (file) => flags(file).serverOnly,
  // True when the first statement is the "use client" / "use server" directive.
  useClient: (file) => flags(file).first === "client",
  useServer: (file) => flags(file).first === "server",
  // Parsed relative and @/ imports of a file: [{ spec, line, typeOnly }], parsed once per file.
  specs(file) {
    if (!specCache.has(file)) {
      const out = [];
      if (CODE.test(file)) {
        const src = read(file);
        for (const m of src.matchAll(STMT)) {
          const spec = m[3] ?? m[4] ?? m[5];
          if (!spec.startsWith(".") && !spec.startsWith("@/")) continue;
          const clause = (m[2] || "").replace(/\s+from\s+$/, "");
          const names = (/\{([^}]*)\}/.exec(clause)?.[1] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
          const lone = clause.replace(/\{[^}]*\}/, "").replace(/[,\s]/g, "");
          const typeOnly = !!m[1] || (names.length > 0 && !lone && names.every((s) => s.startsWith("type ")));
          out.push({ spec, typeOnly, line: src.slice(0, m.index + m[0].search(/[^\s;]/)).split("\n").length });
        }
      }
      specCache.set(file, out);
    }
    return specCache.get(file);
  },
  // '@/' -> repo root; '.'/'..' -> importer's directory. Repo-relative path, whether or not it exists.
  rel(importer, spec) {
    const abs = spec.startsWith("@/") ? path.join(root, spec.slice(2)) : path.resolve(root, path.dirname(importer), spec);
    return path.relative(root, abs).split(path.sep).join("/");
  },
  // The repo-relative file a specifier resolves to, or null.
  resolve(importer, spec) {
    const key = `${importer}\0${spec}`;
    if (!resolveCache.has(key)) {
      const rel = ctx.rel(importer, spec);
      const cand = [rel, ...EXTS.map((e) => rel + e), ...EXTS.map((e) => `${rel}/index${e}`)];
      resolveCache.set(key, cand.find((c) => { const f = path.join(root, c); return existsSync(f) && statSync(f).isFile(); }) ?? null);
    }
    return resolveCache.get(key);
  },
};

const lines = CHECKS.flatMap((check) => check.run(ctx).map((v) => `[${check.name}] ${v}`));
if (lines.length) {
  console.log(lines.join("\n"));
  process.exit(1);
}
console.log(`clean · ${files.length} files · ${CHECKS.map((c) => c.name).join(", ")}`);
