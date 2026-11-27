// Starts a search proof on the shop's own search code in plain node.
//
// Plain node cannot draw screens (.tsx), has no `server-only` package and cannot import a JSON file
// without an import attribute. So, and only so:
// - `server-only` has no behavior;
// - the slice doors that also export screens are swapped for the same doors without the screens
//   (every function they export is the real one, from the same file);
// - a screen file (.tsx) is replaced by one with the same export names; drawing one throws;
// - the catalogue index JSON is read as a module;
// - `@/platform/sanity/client` (sanityFetch and client.fetch) hands every read to `globalThis.__searchRead`, which the proof sets:
//   the real catalogue (live.mjs) or a stand-in. The query text and params are the shop's own.
// Everything else falls through to tools/alias-loader.mjs, which must be imported before this file.
//
// node --import ./tools/alias-loader.mjs --import ./tests/product-search/load.mjs tests/product-search/<proof>.test.ts

import { readFileSync } from 'node:fs'
import { registerHooks } from 'node:module'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const at = (file) => JSON.stringify(pathToFileURL(path.join(root, file)).href)
const module = (text) => ({ url: `data:text/javascript,${encodeURIComponent(text)}`, shortCircuit: true })

const SWAPS = {
  'server-only': '',
  'next-sanity': 'export const groq = (s, ...v) => s.reduce((a, c, i) => a + c + (v[i] ?? ""), "")',
  '@/platform/sanity/client': [
    'const read = (query, params = {}) => { if (typeof globalThis.__searchRead !== "function") throw new Error("no catalogue set"); return globalThis.__searchRead(query, params) }',
    'export const sanityFetch = ({ query, params = {} }) => read(query, params)',
    'export const client = { fetch: (query, params) => read(query, params) }',
  ].join('\n'),
  '@/features/catalogue/server': `export * from ${at('features/catalogue/adapters/catalogue-index/catalogueIndex.ts')}`,
  '@/features/catalogue': `export { isFacetedQuery, canonicalCategoryPath } from ${at('features/catalogue/core/rules/seo.ts')}`,
  '@/features/product-filtering': [
    `export { isCategory, CATEGORIES, CATEGORY_LABELS } from ${at('features/product-filtering/core/definitions/category.ts')}`,
    `export { scopeOf } from ${at('features/product-filtering/core/rules/scopeOf.ts')}`,
  ].join('\n'),
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (Object.hasOwn(SWAPS, specifier)) return module(SWAPS[specifier])
    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (url.startsWith('file:') && url.endsWith('.tsx')) {
      const source = readFileSync(fileURLToPath(url), 'utf8')
      const exported = [...source.matchAll(/export\s+(?:async\s+)?(?:function|const|class)\s+([A-Za-z_$][\w$]*)/g)].map((m) => m[1])
      const screen = 'function () { throw new Error("a proof does not draw screens") }'
      const lines = exported.map((name) => `export const ${name} = ${screen}`)
      if (/export\s+default\b/.test(source)) lines.push(`export default ${screen}`)
      return { format: 'module', source: lines.join('\n'), shortCircuit: true }
    }
    if (url.startsWith('file:') && url.endsWith('.json')) {
      return { format: 'module', source: `export default ${readFileSync(fileURLToPath(url), 'utf8')}`, shortCircuit: true }
    }
    return nextLoad(url, context)
  },
})
