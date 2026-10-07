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

const exportCache = new Map();
const exportOpen = new Set(); // files whose export set is being computed (export * cycle guard)
const NO_EXPORTS = new Set();
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, " ");
// Index of the first `ch` at bracket depth 0 (quotes skipped), or -1.
function topChar(s, ch) {
  let depth = 0, q = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === "\\") i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === "`") q = c;
    else if ("([{".includes(c)) depth++;
    else if (")]}".includes(c)) depth--;
    else if (c === ch && depth === 0) return i;
  }
  return -1;
}
// Split on commas at bracket depth 0 (quotes skipped).
function splitTop(s) {
  const parts = [];
  let depth = 0, q = null, start = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === "\\") i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === "`") q = c;
    else if ("([{".includes(c)) depth++;
    else if (")]}".includes(c)) depth--;
    else if (c === "," && depth === 0) { parts.push(s.slice(start, i)); start = i + 1; }
  }
  parts.push(s.slice(start));
  return parts;
}
// Bound names of a destructuring pattern body: `key: alias` -> alias, `...rest` -> rest, defaults
// dropped; nested { } / [ ] patterns recurse.
function patternNames(body, out) {
  for (const raw of splitTop(stripComments(body))) {
    let part = raw.trim();
    if (!part) continue;
    if (part.startsWith("...")) part = part.slice(3).trim();
    const eq = topChar(part, "=");
    if (eq !== -1) part = part.slice(0, eq).trim();
    const colon = topChar(part, ":");
    if (colon !== -1) part = part.slice(colon + 1).trim();
    if (/^[A-Za-z_$][\w$]*$/.test(part)) out.add(part);
    else if (part.startsWith("{") || part.startsWith("[")) {
      const end = part.lastIndexOf(part[0] === "{" ? "}" : "]");
      if (end > 0) patternNames(part.slice(1, end), out);
    }
  }
}
// Names a module exports ("default" for a default export, alias side for `as`), or null when they
// cannot be known: non-code/missing file, `export =`, or an `export *` whose specifier is external,
// unresolvable or a target whose own exports are null.
function moduleExports(file) {
  if (!CODE.test(file) || !exists(file)) return null;
  const src = read(file);
  const names = new Set();
  // Advance past whitespace and comments.
  const skip = (i) => {
    for (;;) {
      const t = /^(?:\s+|\/\*[\s\S]*?\*\/|\/\/[^\n]*)+/.exec(src.slice(i));
      if (!t) return i;
      i += t[0].length;
    }
  };
  // [identifier, position past it and trailing ws/comments] or [null, skipped position].
  const ident = (i) => {
    const p = skip(i);
    const w = /^[A-Za-z_$][\w$]*/.exec(src.slice(p));
    return w ? [w[0], skip(p + w[0].length)] : [null, p];
  };
  // [string literal contents, position past it] or [null, skipped position].
  const strLit = (i) => {
    const p = skip(i);
    const s = /^["']([^"']+)["']/.exec(src.slice(p));
    return s ? [s[1], p + s[0].length] : [null, p];
  };
  // End index of the bracket group starting at i (comments/strings skipped), or -1.
  const closeIdx = (i) => {
    let depth = 0, q = null;
    for (let j = i; j < src.length; j++) {
      const c = src[j];
      if (q) { if (c === "\\") j++; else if (c === q) q = null; continue; }
      if (c === '"' || c === "'" || c === "`") q = c;
      else if (c === "/" && src[j + 1] === "/") { const e = src.indexOf("\n", j); if (e === -1) return -1; j = e; }
      else if (c === "/" && src[j + 1] === "*") { const e = src.indexOf("*/", j + 2); if (e === -1) return -1; j = e + 1; }
      else if ("([{".includes(c)) depth++;
      else if (")]}".includes(c) && --depth === 0) return j;
    }
    return -1;
  };
  // Index of the next top-level ',' starting a new declarator, or -1 at ';', newline or EOF.
  const nextDecl = (i) => {
    let depth = 0, q = null;
    for (let j = i; j < src.length; j++) {
      const c = src[j];
      if (q) { if (c === "\\") j++; else if (c === q) q = null; continue; }
      if (c === '"' || c === "'" || c === "`") q = c;
      else if (c === "/" && src[j + 1] === "/") return -1;
      else if (c === "/" && src[j + 1] === "*") { const e = src.indexOf("*/", j + 2); if (e === -1) return -1; j = e + 1; }
      else if ("([{".includes(c)) depth++;
      else if (")]}".includes(c)) depth--;
      else if (depth === 0 && c === ",") return j;
      else if (depth === 0 && (c === ";" || c === "\n")) return -1;
    }
    return -1;
  };
  for (const m of src.matchAll(/^[ \t]*export\b/gm)) {
    let i = skip(m.index + m[0].length);
    if (src[i] === "=") return null; // export =
    // Peel modifiers: declare / abstract / async.
    let w, p;
    for (;;) {
      [w, p] = ident(i);
      if (w === "declare" || w === "abstract" || w === "async") i = p;
      else break;
    }
    i = p;
    if (w === "default") { names.add("default"); continue; }
    if (w === null || w === "type") {
      if (src[i] === "{") {
        // export { ... } / export type { ... }, with or without `from "spec"`.
        const end = closeIdx(i);
        if (end === -1) continue;
        for (const raw of splitTop(stripComments(src.slice(i + 1, end)))) {
          const s = raw.trim().replace(/^type\s+/, "");
          const as = /^[A-Za-z_$][\w$]*\s+as\s+([A-Za-z_$][\w$]*)$/.exec(s);
          if (as) names.add(as[1]);
          else if (/^[A-Za-z_$][\w$]*$/.test(s)) names.add(s);
        }
        continue;
      }
      if (src[i] === "*") {
        // export * as NS from "spec" / export [type] * from "spec".
        const [w2, j2] = ident(i + 1);
        if (w2 === "as") {
          const [ns] = ident(j2);
          if (ns) names.add(ns);
          continue;
        }
        if (w2 === "from") {
          const [spec] = strLit(j2);
          if (spec == null) continue;
          if (!spec.startsWith(".") && !spec.startsWith("@/")) return null;
          const target = ctx.resolve(file, spec);
          if (!target) return null;
          const sub = ctx.exports(target);
          if (sub === null) return null;
          for (const n of sub) if (n !== "default") names.add(n);
        }
        continue;
      }
      if (w === "type") {
        // export type NAME = ... / NAME<...> = ...
        const [nm, jn] = ident(i);
        if (nm && (src[jn] === "=" || src[jn] === "<")) names.add(nm);
      }
      continue;
    }
    if (w === "const" || w === "let" || w === "var") {
      let q = i;
      for (let decl = 0;; decl++) {
        const pk = skip(q);
        if (src[pk] === "{" || src[pk] === "[") {
          const end = closeIdx(pk);
          if (end === -1) break;
          patternNames(src.slice(pk + 1, end), names);
          q = end + 1;
        } else {
          const [nm, jn] = ident(pk);
          if (!nm) break;
          if (decl === 0 && nm === "enum") { // export const enum X
            const [nm2] = ident(jn);
            if (nm2) names.add(nm2);
            break;
          }
          names.add(nm);
          q = jn;
        }
        const nx = nextDecl(q);
        if (nx === -1) break;
        q = nx + 1;
      }
      continue;
    }
    if (w === "function" || w === "class" || w === "interface" || w === "enum" ||
        w === "namespace" || w === "module") {
      const [nm] = ident(w === "function" && src[i] === "*" ? i + 1 : i);
      if (nm) names.add(nm);
    }
  }
  return names;
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
  // Parsed imports of a file: [{ spec, line, typeOnly, external, imported }], parsed once per file.
  // external is true for vendor package specifiers (neither "./" nor "@/"). imported is the list of
  // names brought in: each named binding ("type"/"as alias" stripped), "default" for a default
  // binding and "*" for a namespace binding; empty for dynamic import() and require().
  specs(file) {
    if (!specCache.has(file)) {
      const out = [];
      if (CODE.test(file)) {
        const src = read(file);
        for (const m of src.matchAll(STMT)) {
          const spec = m[3] ?? m[4] ?? m[5];
          const external = !spec.startsWith(".") && !spec.startsWith("@/");
          const clause = (m[2] || "").replace(/\s+from\s+$/, "");
          const names = (/\{([^}]*)\}/.exec(clause)?.[1] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
          const lone = clause.replace(/\{[^}]*\}/, "").replace(/[,\s]/g, "");
          const typeOnly = !!m[1] || (names.length > 0 && !lone && names.every((s) => s.startsWith("type ")));
          const imported = names.map((s) => s.replace(/^type\s+/, "").replace(/\s+as\s+\w+$/, ""));
          const bare = clause.replace(/\{[^}]*\}/, "").replace(/,/g, " ").trim();
          if (/\*\s*as\s+/.test(bare)) imported.push("*");
          else if (/^(?:type\s+)?\w+$/.test(bare)) imported.push("default");
          out.push({ spec, typeOnly, line: src.slice(0, m.index + m[0].search(/[^\s;]/)).split("\n").length, external, imported });
        }
      }
      specCache.set(file, out);
    }
    return specCache.get(file);
  },
  // Exported names of a module ("default" for a default export, alias side for `as`), or null when
  // they cannot be known: non-code/missing file, `export =`, or an `export *` whose specifier is
  // external, unresolvable or a target whose own exports are null. Computed once per file; while a
  // file's set is being computed a re-entrant `export *` call for it contributes no names.
  exports(file) {
    if (exportOpen.has(file)) return NO_EXPORTS;
    if (!exportCache.has(file)) {
      exportOpen.add(file);
      exportCache.set(file, moduleExports(file));
      exportOpen.delete(file);
    }
    return exportCache.get(file);
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
