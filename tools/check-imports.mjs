// Check "imports": every ./ or @/ specifier in a changed file resolves, every imported or
// re-exported name is exported by its target module, and a deleted or renamed-away file has
// no remaining importer. Nothing about where files belong.

export const name = "imports";

// Module id for comparison: strip extension and trailing /index.
const id = (rel) => rel.replace(/\.(d\.ts|ts|tsx|mts|mjs|js|jsx|json|css)$/, "").replace(/\/index$/, "");

export function run(ctx) {
  const out = [];
  for (const file of ctx.changed) {
    for (const { spec, line, external } of ctx.specs(file)) {
      if (external) continue;
      if (!ctx.resolve(file, spec)) out.push(`${file}:${line} "${spec}" SPEC unresolved`);
    }
  }
  // EXPORT: each imported or re-exported name is exported by the resolved target. Type-only
  // records count too (next build type-checks them). Changed files get every record checked;
  // tracked files get the records resolving into a changed target, so an export rename or
  // removal flags untouched importers.
  const seen = new Set();
  const changedSet = new Set(ctx.changed);
  const exportCheck = (file, { spec, line, imported }) => {
    const target = ctx.resolve(file, spec);
    if (!target) return;
    const exports = ctx.exports(target);
    if (!exports) return;
    for (const n of imported) {
      if (n === "*" || !/^[A-Za-z_$][\w$]*$/.test(n)) continue;
      if (!exports.has(n)) {
        const v = `${file}:${line} "${spec}" EXPORT ${n} not exported by ${target}`;
        if (!seen.has(v)) { seen.add(v); out.push(v); }
      }
    }
  };
  for (const file of ctx.changed) {
    for (const rec of ctx.specs(file)) {
      if (!rec.external) exportCheck(file, rec);
    }
  }
  for (const file of ctx.tracked()) {
    for (const rec of ctx.specs(file)) {
      if (!rec.external && changedSet.has(ctx.resolve(file, rec.spec))) exportCheck(file, rec);
    }
  }
  if (ctx.deleted.length) {
    const dead = new Map(ctx.deleted.map((d) => [id(d), d]));
    for (const file of ctx.tracked()) {
      for (const { spec, line, external } of ctx.specs(file)) {
        if (external) continue;
        const gone = dead.get(id(ctx.rel(file, spec)));
        if (gone) out.push(`${file}:${line} "${spec}" DELETED importer of removed ${gone}`);
      }
    }
  }
  return out;
}
