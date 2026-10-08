// Check "org-pattern": where every file lives and how slices may import each other, as defined in
// docs/organizational-pattern.md (the tables below mirror its sections 2 and 3; edit both together).
//   PLACE      every changed path has a home (section 3)
//   DOTDOT     no '..' specifier under features/ (studio-plane files excepted)
//   PLANE      runtime never imports a non-runtime plane; studio/tooling never import runtime except platform/sanity/env.ts and the facet vocabulary; nothing imports laws
//   DOOR       a slice is imported only through index.ts or server.ts
//   INWARD     inside a slice, imports follow the archetype table (section 2)
//   PLATFORM   platform/ imports only platform/
//   ROUTE      routes reach data through a slice and import only next, react, slice doors and platform/
//   ENV        client-safe code never imports server-only code
//   SERVERDOOR every server.ts contains import "server-only"
//   CYCLE      the slice-to-slice import graph has no cycle
//   CORE       core/ imports only its own core/, another slice's index.ts and platform/utils/
//   VENDOR     vendor packages only in adapters/, platform/, framework entries or the studio plane
//   VIEWDATA   a view imports only *View components from another slice's server.ts
//   GENERATED  sanity.types.ts only in adapters/sanity/ and platform/
//   ACTION     'use server' files are features/<slice>/actions/<name>Action.ts and vice versa
//   NAMES      view/ components end in View; ui/ names never end in View, Client, Server or Page

export const name = "org-pattern";

const ROOT_ENTRY = /^(middleware\.ts|instrumentation\.ts|instrumentation-client\.ts|sentry\.[a-z]+\.config\.ts)$/;
const ROOT_OTHER = /^(package(-lock)?\.json|tsconfig\.json|next\.config\.ts|postcss\.config\.mjs|tailwind\.config\.ts|eslint\.config\.mjs|\.prettierrc|\.prettierignore|\.node-version|\.gitignore|\.codeiumignore|\.env\.example|sanity\.cli\.ts|schema\.json|skills-lock\.json|vercel\.json|\.no-mistakes\.yaml|README\.md|CLAUDE\.md|AGENTS\.md)$/;
const APP_ROUTE = /^(page|layout|loading|error|global-error|not-found|template|default|route|sitemap|robots|manifest|icon|apple-icon|opengraph-image|twitter-image)\.(ts|tsx|js|jsx)$/;
const PARTS = ["ui", "state", "url", "view", "queries", "commands", "actions"];
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
        return seg[3] === "definitions" || seg[3] === "rules" || seg[3] === "types" || p === `features/${a}/core/ports.ts`
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
  index: ["ui", "state", "url", "core", "actions"],
  server: ["index", "server", "ui", "state", "url", "view", "queries", "commands", "core", "adapters"],
  ui: ["ui", "state", "url", "core", "actions"],
  state: ["state", "url", "core", "actions", "adapters"],
  url: ["url", "core"],
  view: ["view", "ui", "url", "core"],
  queries: ["queries", "core"],
  commands: ["commands", "url", "core"],
  actions: ["url", "core", "server"],
  core: ["core"],
  adapters: ["adapters", "core"],
};
const CLIENT_SAFE_PARTS = ["ui", "state", "url", "core", "index"];
const VENDORS = ["stripe", "@stripe/", "better-auth", "@better-auth/", "kysely", "kysely-libsql", "next-sanity", "@sanity/", "sanity", "groq", "resend", "iron-session", "@vercel/", "@sentry/", "web-vitals"];
const BROWSER_KITS = ["@stripe/stripe-js", "@stripe/react-stripe-js"];
const ACTION_PATH = /^features\/[^/]+\/actions\/([A-Za-z0-9_-]+)Action\.ts$/;
// spec is a vendor package when some entry matches: entries ending in "/" match by prefix,
// any other entry matches when spec equals it or starts with it + "/".
function isVendor(spec) {
  return VENDORS.some((v) => (v.endsWith("/") ? spec.startsWith(v) : spec === v || spec.startsWith(v + "/")));
}
// The model's A9 list of packages a route may import.
function routePackage(spec) {
  return spec === "next" || spec.startsWith("next/") || spec === "react";
}

function edge(ctx, file, rel, { spec, typeOnly, line, imported }) {
  const at = `${file}:${line} "${spec}"`;
  const out = [];
  const A = zone(file);
  if (file.startsWith("features/") && A?.plane !== "studio" && spec.startsWith("..")) out.push(`${at} DOTDOT use ./x or the @/ alias`);
  const B = zone(rel);
  if (!A || !B) return out; // unplaced paths are reported by PLACE
  // Plane rules (A laws: no plane rule).
  if (B.plane === "laws" && A.plane !== "laws") out.push(`${at} PLANE ${A.plane} imports laws`);
  else if (A.plane === "runtime") {
    if (B.plane === "studio") { if (!file.startsWith("app/(studio)/")) out.push(`${at} PLANE runtime imports studio`); }
    else if (B.plane !== "runtime") out.push(`${at} PLANE runtime imports ${B.plane}`);
  } else if ((A.plane === "studio" || A.plane === "tooling") && B.plane === "runtime" && rel !== "platform/sanity/env.ts" && rel !== "features/product-filtering/core/definitions/facetMap.ts") {
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
  if (A.part === "core" && B.slice !== A.slice && B.part !== "index" && !rel.startsWith("platform/utils/"))
    out.push(`${at} CORE core/ imports only its own core/, another slice's index.ts and platform/utils/`);
  if (rel === "sanity.types.ts" && !(A.part === "adapters" && A.system === "sanity") && A.home !== "platform")
    out.push(`${at} GENERATED sanity.types.ts only in adapters/sanity/ and platform/`);
  if (A.part === "view" && B.part === "server" && B.slice !== A.slice && imported.some((n) => !n.endsWith("View")))
    out.push(`${at} VIEWDATA a view imports only *View components from another slice's server.ts`);
  return out;
}

// Slice-to-slice edges over the whole tracked tree (type-only imports included).
function findCycle(ctx) {
  const graph = new Map(); // slice -> Map(target slice -> "file:line")
  for (const f of ctx.tracked()) {
    const seg = f.split("/");
    if (seg[0] !== "features" || seg.length < 3) continue;
    for (const s of ctx.specs(f)) {
      if (s.external) continue;
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
    if (A && A.plane === "runtime") {
      const action = ACTION_PATH.test(file);
      if (ctx.useServer(file) && !action)
        out.push(`${file} ACTION a 'use server' file must be features/<slice>/actions/<name>Action.ts`);
      if (action && !ctx.useServer(file))
        out.push(`${file} ACTION ${file.match(ACTION_PATH)[1]}Action.ts must start with 'use server'`);
      const parts = file.split("/");
      if (parts[0] === "features" && file.endsWith(".tsx")) {
        if (parts[2] === "view" && !file.endsWith("View.tsx"))
          out.push(`${file} NAMES view/ components end in View`);
        if (parts[2] === "ui" && /(View|Client|Server|Page)\.tsx$/.test(file))
          out.push(`${file} NAMES ui/ names never end in View, Client, Server or Page`);
      }
      for (const s of ctx.specs(file)) {
        if (!s.external) continue;
        const at = `${file}:${s.line} "${s.spec}"`;
        if (isVendor(s.spec) && !(A.part === "adapters" || A.home === "platform" || A.part === "entry" || file.startsWith("app/(studio)/") || ((A.part === "ui" || A.part === "state") && BROWSER_KITS.includes(s.spec))))
          out.push(`${at} VENDOR vendor packages only in adapters/, platform/, framework entries or the studio plane`);
        if (A.part === "route" && !routePackage(s.spec) && !file.startsWith("app/(studio)/"))
          out.push(`${at} ROUTE routes import only next, react, slice doors and platform/`);
      }
    }
    for (const s of ctx.specs(file)) {
      if (s.external) continue;
      const rel = ctx.resolve(file, s.spec);
      if (rel) out.push(...edge(ctx, file, rel, s));
    }
  }
  const cycle = findCycle(ctx);
  if (cycle) out.push(cycle);
  return out;
}
