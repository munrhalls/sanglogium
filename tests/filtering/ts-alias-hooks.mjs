// Node resolve hooks for the parity checks ONLY.
// '@/' -> repo root (the app's path alias); bare 'server-only' -> empty
// stub (it is a Next.js build marker, meaningless under plain node);
// extensionless relative imports -> try '.ts'. Nothing else is touched.
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const STUB = 'data:text/javascript,export default {}';

export async function resolve(specifier, context, next) {
  if (specifier === 'server-only') return { url: STUB, shortCircuit: true };
  if (specifier.startsWith('@/')) {
    const p = new URL('../../' + specifier.slice(2), import.meta.url);
    return next(existsSync(fileURLToPath(p)) ? p.href : p.href + '.ts', context);
  }
  try {
    return await next(specifier, context);
  } catch (e) {
    if (e.code === 'ERR_MODULE_NOT_FOUND' && specifier.startsWith('.')) {
      const p = new URL(specifier + '.ts', context.parentURL);
      if (existsSync(fileURLToPath(p))) return next(p.href, context);
    }
    throw e;
  }
}
