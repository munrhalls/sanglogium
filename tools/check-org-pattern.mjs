// Check "org-pattern": where every file lives and how slices may import each other, as defined in
// docs/organizational-pattern.md (the tables below mirror its sections 2 and 3; edit both together).
//   PLACE      every changed path has a home (section 3)
//   DOTDOT     no '..' specifier under features/
//   PLANE      runtime never imports a non-runtime plane; studio/tooling never import runtime; nothing imports laws
//   DOOR       a slice is imported only through index.ts or server.ts
//   INWARD     inside a slice, imports follow the archetype table (section 2)
//   PLATFORM   platform/ imports only platform/
//   ROUTE      routes reach data through a slice, never directly
//   ENV        client-safe code never imports server-only code
//   SERVERDOOR every server.ts contains import "server-only"
//   CYCLE      the slice-to-slice import graph has no cycle

export const name = "org-pattern";

const ROOT_ENTRY = /^(middleware\.ts|instrumentation\.ts|instrumentation-client\.ts|sentry\.[a-z]+\.config\.ts)$/;
const ROOT_OTHER = /^(package(-lock)?\.json|tsconfig\.json|next\.config\.ts|postcss\.config\.mjs|tailwind\.config\.ts|eslint\.config\.mjs|\.prettierrc|\.prettierignore|\.node-version|\.gitignore|\.codeiumignore|\.env\.example|sanity\.cli\.ts|schema\.json|skills-lock\.json|vercel\.json|\.no-mistakes\.yaml|README\.md|CLAUDE\.md|AGENTS\.md)$/;
const APP_ROUTE = /^(page|layout|loading|error|global-error|not-found|template|default|route|sitemap|robots|manifest|icon|apple-icon|opengraph-image|twitter-image)\.(ts|tsx|js|jsx)$/;
const PARTS = ["ui", "state", "url", "view", "queries", "commands"];
const Z = (plane, extra) => ({ plane, home: null, slice: null, part: null, system: null, clientSafe: false, ...extra });

// path -> zone (null = no home). First match wins.
function zone(p) {
  if (p.endsWith(".laws.ts")) return Z("laws");
  const seg = p.split("/");
  const [top, a, b] = seg;
  const n = seg.length;
  if (n === 1) {
    if (ROOT_ENTRY.test(p)) return Z("runtime", { home: "app", part: "entry" });
    if (p === "sanity.types.ts") return Z("runtime", { home: "leaf" });
    if (p === "sanity.config.ts") return Z("studio");
    return ROOT_OTHER.test(p) ? Z("other") : null;
  }
  switch (top) {
    case "app":
      return p === "app/globals.css" || APP_ROUTE.test(seg[n - 1])
        ? Z("runtime", { home: "app", part: "route" })
        : null;
    case "features": {
      const slice = { slice: a };
      if (n === 3) {
        if (b === "index.ts") return Z("runtime", { ...slice, home: "slice", part: "index" });
        if (b === "server.ts") return Z("runtime", { ...slice, home: "slice", part: "server" });
        return null;
      }
      if (PARTS.includes(b)) return Z("runtime", { ...slice, home: "slice", part: b });
      if (b === "core") {
        return seg[3] === "definitions" || seg[3] === "rules" || p === `features/${a}/core/ports.ts`
          ? Z("runtime", { ...slice, home: "slice", part: "core" })
          : null;
      }
      if (b === "adapters") {
        return n >= 5
          ? Z("runtime", { ...slice, home: "slice", part: "adapters", system: seg[3] })
          : null;
      }
      if (b === "schema") return Z("studio", slice);
      return null;
    }
    case "platform":
      if (a === "design" && b === "ui") return Z("runtime", { home: "platform", clientSafe: true });
      if (a === "design" && b === "styles") return Z("config");
      return ["sanity", "email", "analytics", "utils"].includes(a) ? Z("runtime", { home: "platform" }) : null;
    case "studio": return Z("studio");
    case "data": return Z("runtime", { home: "leaf" });
    case "scripts": case "tools": return Z("tooling");
    case "docs": case "_project": case ".github": case ".claude": case ".codex": case ".devin": case "public": return Z("other");
    default: return null;
  }
}

// Section 2 archetype table: importer part -> parts it may import inside the same slice.
const ALLOW = {
  index: ["ui", "state", "url", "core", "commands"],
  server: ["index", "server", "ui", "state", "url", "view", "queries", "commands", "core", "adapters"],
  ui: ["ui", "state", "url", "core", "commands"],
  state: ["state", "url", "core", "commands", "adapters"],
  url: ["url", "core"],
  view: ["view", "ui", "url", "core"],
  queries: ["queries", "core"],
  commands: ["commands", "url", "core", "server"],
  core: ["core"],
  adapters: ["adapters", "core"],
};
const CLIENT_SAFE_PARTS = ["ui", "state", "url", "core", "index"];

function edge(ctx, file, rel, { spec, typeOnly, line }) {
  const at = `${file}:${line} "${spec}"`;
  const out = [];
  if (file.startsWith("features/") && spec.startsWith("..")) out.push(`${at} DOTDOT use ./x or the @/ alias`);
  const A = zone(file);
  const B = zone(rel);
  if (!A || !B) return out; // unplaced paths are reported by PLACE
  // Plane rules (A laws: no plane rule).
  if (B.plane === "laws" && A.plane !== "laws") out.push(`${at} PLANE ${A.plane} imports laws`);
  else if (A.plane === "runtime") {
    if (B.plane === "studio") { if (!file.startsWith("app/(studio)/")) out.push(`${at} PLANE runtime imports studio`); }
    else if (B.plane !== "runtime") out.push(`${at} PLANE runtime imports ${B.plane}`);
  } else if ((A.plane === "studio" || A.plane === "tooling") && B.plane === "runtime" && rel !== "platform/sanity/env.ts") {
    out.push(`${at} PLANE ${A.plane} imports runtime`);
  }
  // Non-runtime planes stop here.
  if (A.plane !== "runtime" || B.plane !== "runtime") return out;
  if (B.slice && A.slice !== B.slice && B.part !== "index" && B.part !== "server")
    out.push(`${at} DOOR import ${B.slice} only through index.ts or server.ts`);
  if (A.slice && A.slice === B.slice) {
    if (!(ALLOW[A.part] ?? []).includes(B.part)) out.push(`${at} INWARD ${A.part} may not import ${B.part}`);
    else if (A.part === "adapters" && B.part === "adapters" && A.system !== B.system)
      out.push(`${at} INWARD adapters/${A.system} may not import adapters/${B.system}`);
    else if (A.part === "server" && ctx.useServer(rel))
      out.push(`${at} INWARD server must not import a 'use server' file`);
  }
  if (A.home === "platform" && B.home !== "platform" && !(typeOnly && rel === "sanity.types.ts"))
    out.push(`${at} PLATFORM platform imports only platform/`);
  if ((A.part === "route" || A.part === "entry") && B.home === "leaf" && !typeOnly)
    out.push(`${at} ROUTE routes reach data through a slice`);
  if (!typeOnly && (CLIENT_SAFE_PARTS.includes(A.part) || A.clientSafe || ctx.useClient(file)) && ctx.serverOnly(rel))
    out.push(`${at} ENV client-safe code imports server-only code`);
  return out;
}

// Slice-to-slice edges over the whole tracked tree (type-only imports included).
function findCycle(ctx) {
  const graph = new Map(); // slice -> Map(target slice -> "file:line")
  for (const f of ctx.tracked()) {
    const seg = f.split("/");
    if (seg[0] !== "features" || seg.length < 3) continue;
    for (const s of ctx.specs(f)) {
      const rel = ctx.resolve(f, s.spec);
      const t = rel?.split("/");
      if (!t || t[0] !== "features" || t.length < 3 || t[1] === seg[1]) continue;
      if (!graph.has(seg[1])) graph.set(seg[1], new Map());
      if (!graph.get(seg[1]).has(t[1])) graph.get(seg[1]).set(t[1], `${f}:${s.line}`);
    }
  }
  const color = new Map();
  const stack = [];
  const dfs = (u) => {
    color.set(u, 1);
    stack.push(u);
    for (const [v, at] of graph.get(u) ?? []) {
      if (color.get(v) === 1) return `CYCLE ${[...stack.slice(stack.indexOf(v)), v].join(" -> ")} (example edge ${at})`;
      if (!color.get(v)) { const r = dfs(v); if (r) return r; }
    }
    stack.pop();
    color.set(u, 2);
    return null;
  };
  for (const u of graph.keys()) if (!color.get(u)) { const r = dfs(u); if (r) return r; }
  return null;
}

// Untracked files count as changed: a new file the executor has not staged yet must not escape the gate.

export function run(ctx) {
  const out = [];
  for (const file of ctx.changed) {
    const A = zone(file);
    if (!A) out.push(`${file} PLACE no home (docs/organizational-pattern.md section 3)`);
    if (A?.part === "server" && !ctx.serverOnly(file))
      out.push(`${file} SERVERDOOR server.ts must contain import "server-only"`);
    for (const s of ctx.specs(file)) {
      const rel = ctx.resolve(file, s.spec);
      if (rel) out.push(...edge(ctx, file, rel, s));
    }
  }
  const cycle = findCycle(ctx);
  if (cycle) out.push(cycle);
  return out;
}
