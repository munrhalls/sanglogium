// Points the save actions at save-stand.mjs.
// Register this after tests/checkout/load.mjs. The last --import runs first.

import { registerHooks } from 'node:module'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const stand = pathToFileURL(path.join(path.dirname(fileURLToPath(import.meta.url)), 'save-stand.mjs')).href

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === '@/features/checkout/server' || specifier === '@/features/address/server') {
      return { url: stand, shortCircuit: true }
    }
    return nextResolve(specifier, context)
  },
})
