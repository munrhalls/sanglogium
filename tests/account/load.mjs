// Starts the account proofs with stand-ins at the shop's edges only:
// the sign-in database driver, Sanity, the email service, Next's request and
// navigation, and server-only. Everything between them is the shop's own code.
// tools/alias-loader.mjs must be imported before this file.
//
// node --experimental-strip-types --import ./tools/alias-loader.mjs --import ./tests/account/load.mjs tests/account/<proof>.test.ts

import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { createRequire, registerHooks } from 'node:module'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

// The shop runs as in production: origin checks and guess limits are on.
// Every value here is made up. No real address, key or secret is read.
Object.assign(process.env, {
  NODE_ENV: 'production',
  BETTER_AUTH_SECRET: 'account-proof-secret-not-real-0123456789abcdef',
  BETTER_AUTH_URL: 'https://shop.example',
  NEXT_PUBLIC_BASE_URL: 'https://shop.example',
  DATABASE_URL: 'http://sign-in-database.invalid',
  TURSO_AUTH_TOKEN: 'stand-in',
  NEXT_PUBLIC_SANITY_PROJECT_ID: 'standin',
  NEXT_PUBLIC_SANITY_DATASET: 'standin',
  LOG_LEVEL: 'silent',
})
for (const name of ['BETTER_AUTH_SECRETS', 'RESEND_API_KEY', 'SANITY_STUDIO_READ_WRITE']) delete process.env[name]
// Google sign-in is on, as in a shop that has its Google keys; Google itself is a stand-in (shop.test.ts).
process.env.GOOGLE_CLIENT_ID = 'stand-in-google-client'
process.env.GOOGLE_CLIENT_SECRET = 'stand-in-google-secret'

await import('./stand-ins/world.mjs')

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '../..')
const standIn = (name) => ({ url: pathToFileURL(path.join(here, 'stand-ins', name)).href, shortCircuit: true })
const SWAPS = {
  'server-only': 'empty.mjs',
  'next/headers': 'request.mjs',
  'next/headers.js': 'request.mjs',
  'next/navigation': 'navigation.mjs',
  'next/navigation.js': 'navigation.mjs',
  '@/platform/sanity/backendClient': 'sanity.mjs',
  '@/platform/email/send': 'email.mjs',
  'next/link': 'link.mjs',
  'next/link.js': 'link.mjs',
}
const AUTH_FILE = path.join(repoRoot, 'features/auth/adapters/better-auth/auth.ts')

const require = createRequire(import.meta.url)
let ts = null

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (SWAPS[specifier]) return standIn(SWAPS[specifier])
    if (specifier === 'kysely-libsql' && context.parentURL && fileURLToPath(context.parentURL) === AUTH_FILE) {
      return standIn('database.mjs')
    }
    try {
      return nextResolve(specifier, context)
    } catch (error) {
      const candidate = path.join(repoRoot, 'node_modules', `${specifier}.js`)
      if (error?.code === 'ERR_MODULE_NOT_FOUND' && existsSync(candidate)) {
        return { url: pathToFileURL(realpathSync(candidate)).href, shortCircuit: true }
      }
      throw error
    }
  },
  load(url, context, nextLoad) {
    // Styles have no behavior; a screen's class names are not part of any answer.
    if (url.startsWith('file:') && url.endsWith('.css')) return { format: 'module', source: 'export default new Proxy({}, { get: (_, key) => String(key) })', shortCircuit: true }
    // The shop's TypeScript is compiled the way Next compiles it: imports used only as types are dropped.
    const file = url.startsWith('file:') ? fileURLToPath(url) : ''
    if (!/\.tsx?$/.test(file) || !file.startsWith(repoRoot) || file.includes(`${path.sep}node_modules${path.sep}`)) return nextLoad(url, context)
    ts ??= require('typescript')
    const source = readFileSync(fileURLToPath(url), 'utf8')
    const { outputText } = ts.transpileModule(source, {
      fileName: fileURLToPath(url),
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    })
    return { format: 'module', source: outputText, shortCircuit: true }
  },
})
