// Check "imports": every ./ or @/ specifier in a changed file resolves, and a deleted or
// renamed-away file has no remaining importer. Nothing about where files belong.

export const name = "imports";

// Module id for comparison: strip extension and trailing /index.
const id = (rel) => rel.replace(/\.(d\.ts|ts|tsx|mts|mjs|js|jsx|json|css)$/, "").replace(/\/index$/, "");

export function run(ctx) {
  const out = [];
  for (const file of ctx.changed) {
    for (const { spec, line } of ctx.specs(file)) {
      if (!ctx.resolve(file, spec)) out.push(`${file}:${line} "${spec}" SPEC unresolved`);
    }
  }
  if (ctx.deleted.length) {
    const dead = new Map(ctx.deleted.map((d) => [id(d), d]));
    for (const file of ctx.tracked()) {
      for (const { spec, line } of ctx.specs(file)) {
        const gone = dead.get(id(ctx.rel(file, spec)));
        if (gone) out.push(`${file}:${line} "${spec}" DELETED importer of removed ${gone}`);
      }
    }
  }
  return out;
}
