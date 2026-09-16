// Minimal custom ESM resolve hook, hand-written for this proof folder only.
// Node's native --experimental-strip-types can execute .ts files directly but
// (unlike ts-node) does not append a missing .ts/.tsx extension when a
// relative import specifier has none -- which is how every file under
// lib/catalogue/ imports its siblings (Next.js "bundler" moduleResolution
// convention). This hook retries with .ts/.tsx before giving up, so
// lib/catalogue/buildProductQuery.ts can be imported, unmodified, exactly as
// it exists in the app.
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
