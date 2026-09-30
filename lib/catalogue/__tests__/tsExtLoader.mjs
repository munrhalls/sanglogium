// Minimal custom ESM resolve hook so a plain .mjs proof script can import
// features/product-filtering/config/facetMap.ts unmodified (Node's --experimental-strip-types
// executes .ts files but, unlike ts-node, does not append a missing .ts
// extension to an extensionless relative specifier). Retries with .ts/.tsx
// before giving up. Copied verbatim from lib/filter-sort/__tests__/tsExtLoader.mjs
// so this proof has no dependency on that folder.
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (err?.code === 'ERR_MODULE_NOT_FOUND' && specifier.startsWith('.')) {
      for (const ext of ['.ts', '.tsx']) {
        try {
          return await nextResolve(specifier + ext, context);
        } catch {
          // try next extension
        }
      }
    }
    throw err;
  }
}
