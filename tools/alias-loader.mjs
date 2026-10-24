// Node alias loader. Its only purpose: plain `node` cannot resolve the repo's
// `@/` alias or extensionless imports, so tests that import app code need this.
// Use: `node --experimental-strip-types --import ./tools/alias-loader.mjs --test <file>`.
//
// It adds `@/` (resolved from the repo root) and extensionless specifiers
// (`./x` -> `./x.ts`, `./x.tsx` or `./x/index.ts`, first existing file wins).
// Everything else —
// bare imports like `nuqs/server` or `node:test`, and specifiers that already
// carry an extension — falls through to the default resolver.
// Dependency-free: Node builtins only.

import { existsSync } from 'node:fs';
import { registerHooks } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

function fileForExtensionless(absPath) {
  for (const ext of ['.ts', '.tsx']) {
    const candidate = `${absPath}${ext}`;
    if (existsSync(candidate)) return candidate;
  }
  const index = path.join(absPath, 'index.ts');
  return existsSync(index) ? index : null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      const abs = path.join(repoRoot, specifier.slice(2));
      const target = path.extname(abs) ? abs : fileForExtensionless(abs);
      if (target) return { url: pathToFileURL(target).href, shortCircuit: true };
      return nextResolve(specifier, context);
    }
    if (context.parentURL && (specifier.startsWith('./') || specifier.startsWith('../'))) {
      const abs = path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier);
      if (!path.extname(abs)) {
        const target = fileForExtensionless(abs);
        if (target) return { url: pathToFileURL(target).href, shortCircuit: true };
      }
    }
    return nextResolve(specifier, context);
  },
});
