// Starts the admin proof without the sign-in database, Stripe, Sanity or Resend.
// Each outside system the admin area or the owner emails can reach is swapped
// for a stand-in in standins.mjs. Everything else falls through to
// tools/alias-loader.mjs, which must be imported before this file.
//
// node --experimental-strip-types --import ./tools/alias-loader.mjs --import ./tests/admin/load.mjs tests/admin/admin.test.ts

import { registerHooks } from 'node:module'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

process.env.STRIPE_SECRET_KEY = 'admin-proof-stand-in'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_admin_proof'
process.env.RESEND_API_KEY = 'admin-proof-stand-in'
process.env.RESEND_FROM_EMAIL = 'shop@harbour.invalid'
process.env.NEXT_PUBLIC_BASE_URL = 'https://shop.invalid'
process.env.LOG_LEVEL = 'silent'
process.env.NODE_ENV = 'production'
delete process.env.OWNER_EMAILS

const here = path.dirname(fileURLToPath(import.meta.url))
const standins = pathToFileURL(path.join(here, 'standins.mjs')).href

// Specifier -> the module source that replaces it.
const replaced = {
  'server-only': 'export {}',
  react: `export { cache } from '${standins}'`,
  'next/headers': `export { headers, cookies } from '${standins}'`,
  'next/navigation': `export { notFound, redirect, permanentRedirect } from '${standins}'`,
  '@/features/auth/server': `export { getSignInFacts, getSession, requireSession, verifySession, isGoogleAuthEnabled, authRouteHandlers, updateUserName } from '${standins}'`,
  '@/platform/sanity/backendClient': `export { backendClient } from '${standins}'`,
  stripe: `export { Stripe as default, Stripe } from '${standins}'`,
  resend: `export { Resend } from '${standins}'`,
  '@next/bundle-analyzer': 'export default () => (config) => config',
  '@sentry/nextjs': 'export const withSentryConfig = (config) => config',
}

const SCHEME = 'admin-stand-in:'

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (Object.prototype.hasOwnProperty.call(replaced, specifier)) {
      return { url: `${SCHEME}${specifier}`, shortCircuit: true }
    }
    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (url.startsWith(SCHEME)) {
      return { format: 'module', source: replaced[url.slice(SCHEME.length)], shortCircuit: true }
    }
    return nextLoad(url, context)
  },
})
