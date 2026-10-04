// Check "org-pattern": where every file lives and how zones may import each other, as defined in
// docs/organizational-pattern.md (the tables below mirror its sections 2 to 4; edit both together).
//   PLACE    every changed path belongs to a zone (no unknown root file, folder or feature subfolder)
//   DOTDOT   no '..' specifier under features/
//   PLANE    runtime never imports tooling/studio/config; tooling and studio never import runtime
//   SURFACE  another feature is imported only through index.ts, server.ts, actions.ts or domain/index.ts
//   LEVEL    cross-feature imports go to a strictly lower level
//   RANK     value imports go strictly down the ladder (same layer is free)
//   ENV      client-safe code (ui, model, domain, config, shared/ui) never imports server-only code

export const name = "org-pattern";

const LEVEL = { catalogue: 0, "product-filtering": 0, checkout: 0, auth: 0, basket: 1, account: 1, products: 2, homepage: 2, "product-search": 3 };
const ROOT_APP = /^(middleware\.ts|instrumentation(-client)?\.ts|sentry\.[a-z]+\.config\.ts)$/;
const ROOT_OTHER = /^(package(-lock)?\.json|tsconfig\.json|next\.config\.ts|postcss\.config\.mjs|tailwind\.config\.ts|eslint\.config\.mjs|\.prettierrc|\.prettierignore|\.node-version|\.gitignore|\.codeiumignore|\.env\.example|sanity\.cli\.ts|schema\.json|skills-lock\.json|vercel\.json|\.no-mistakes\.yaml|README\.md|CLAUDE\.md|AGENTS\.md)$/;
const Z = (plane, layer, rank, env, extra) => ({ plane, layer, rank, env, ...extra });

// path -> zone (null = no home). Runtime layers: 0 leaf, 1 core/shared, 2 data, 3 server, 4 logic, 5 ui, 6 app.
function zone(p) {
  const [top, a, b, c] = p.split("/");
  const n = p.split("/").length;
  if (n === 1) {
    if (ROOT_APP.test(p)) return Z("runtime", "app", 6, "any");
    if (p === "sanity.types.ts") return Z("runtime", "leaf", 0, "any");
    if (p === "sanity.config.ts") return Z("studio");
    return ROOT_OTHER.test(p) ? Z("other") : null;
  }
  switch (top) {
    case "app": return Z("runtime", "app", 6, "any");
    case "lib": case "data": return Z("runtime", "leaf", 0, "any");
    case "shared": return a === "ui" ? Z("runtime", "shared", 1, "client") : a === "styles" ? Z("other") : null;
    case "sanity-cms":
      if (a === "lib") return Z("runtime", "data", 2, "server");
      if (a === "env.ts") return Z("runtime", "leaf", 0, "any");
      return a === "schemaTypes" || a === "structure.ts" ? Z("studio") : null;
    case "scripts": case "tools": return Z("tooling");
    case "docs": case "_project": case ".github": case ".claude": case ".codex": case ".devin": case "public": return Z("other");
    case "features": {
      const f = { slice: a };
      if (n === 3) {
        if (b === "index.ts") return Z("runtime", "ui", 5, "client", { ...f, surface: true });
        if (b === "server.ts") return Z("runtime", "server", 3, "server", { ...f, surface: true });
        if (b === "actions.ts") return Z("runtime", "logic", 4, "any", { ...f, surface: true });
        return null;
      }
      if (b === "domain") return Z("runtime", "core", 1, "client", { ...f, surface: n === 4 && c === "index.ts" });
      if (b === "config") return Z("runtime", "core", 1, "client", f);
      if (b === "adapters") return Z("runtime", "server", 3, "server", f);
      if (b === "model") return Z("runtime", "logic", 4, "client", f);
      if (b === "ui") return Z("runtime", "ui", 5, "client", f);
      return b === "proofs" ? Z("tooling") : null;
    }
    default: return null;
  }
}

function edge(file, rel, { spec, typeOnly, line }) {
  const at = `${file}:${line} "${spec}"`;
  const out = [];
  if (file.startsWith("features/") && spec.startsWith("..")) out.push(`${at} DOTDOT use ./x or the @/ alias`);
  const A = zone(file), B = zone(rel);
  if (!A || !B) return out; // unplaced paths are reported by PLACE
  if (A.plane === "runtime") {
    if (B.plane === "studio") { if (!file.startsWith("app/(studio)/")) out.push(`${at} PLANE runtime imports studio`); }
    else if (B.plane !== "runtime") out.push(`${at} PLANE runtime imports ${B.plane}`);
  } else if ((A.plane === "tooling" || A.plane === "studio") && B.plane === "runtime" && rel !== "sanity-cms/env.ts") {
    out.push(`${at} PLANE ${A.plane} imports runtime`);
  }
  if (A.plane !== "runtime" || B.plane !== "runtime") return out;
  const cross = B.slice && A.slice !== B.slice;
  if (cross && !B.surface) out.push(`${at} SURFACE import ${B.slice} only through index, server, actions or domain/index`);
  if (cross && A.slice && !(LEVEL[A.slice] > LEVEL[B.slice])) out.push(`${at} LEVEL ${A.slice} (L${LEVEL[A.slice]}) may not import ${B.slice} (L${LEVEL[B.slice]})`);
  if (typeOnly) return out; // erased at compile time: exempt from RANK and ENV
  if (A.env === "client" && B.env === "server") out.push(`${at} ENV client-safe ${A.layer} imports server-only ${B.layer}`);
  if (A.layer !== B.layer && A.rank <= B.rank) out.push(`${at} RANK ${A.layer}(${A.rank}) may not import ${B.layer}(${B.rank})`);
  return out;
}

// Untracked files count as changed: a new file the executor has not staged yet must not escape the gate.

export function run(ctx) {
  const out = [];
  for (const file of ctx.changed) {
    if (!zone(file)) out.push(`${file} PLACE no zone: unknown root file, folder or feature subfolder`);
    for (const s of ctx.specs(file)) {
      const rel = ctx.resolve(file, s.spec);
      if (rel) out.push(...edge(file, rel, s));
    }
  }
  return out;
}
