// Starts the proof without booting the database, the card network, or Sanity.
// A guest has no account. server-only has no behavior. The warehouse import
// points at stock-book.mjs. Everything else falls through to tools/alias-loader.mjs,
// which must be imported before this file.
//
// node --experimental-strip-types --import ./tools/alias-loader.mjs --import ./tests/checkout/load.mjs tests/checkout/payment-order.test.ts

import { existsSync } from 'node:fs'
import { registerHooks } from 'node:module'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

process.env.STRIPE_SECRET_KEY ||= 'checkout-proof-stand-in'
process.env.STRIPE_WEBHOOK_SECRET ||= 'whsec_checkout_proof'
process.env.LOG_LEVEL ||= 'silent'
process.env.NODE_ENV ||= 'production'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '../..')
const file = (name) => pathToFileURL(path.join(here, name)).href

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'server-only') return { url: file('empty.mjs'), shortCircuit: true }
    if (specifier === '@/features/auth/server') return { url: file('guest-session.mjs'), shortCircuit: true }
    if (specifier === '@/platform/sanity/backendClient') return { url: file('stock-book.mjs'), shortCircuit: true }
    try {
      return nextResolve(specifier, context)
    } catch (error) {
      // Node ESM does not add .js. Next's navigation entry is that file.
      const candidate = path.join(repoRoot, 'node_modules', `${specifier}.js`)
      if (error?.code === 'ERR_MODULE_NOT_FOUND' && existsSync(candidate)) {
        return { url: pathToFileURL(candidate).href, shortCircuit: true }
      }
      throw error
    }
  },
})
