// What the shop's settings and files say about the admin area.
//
// The cache answer comes from Next's own path matcher run over the real rules in
// next.config.ts, applied in Next's order, where the later rule wins
// (node_modules/next/dist/server/lib/router-utils/resolve-routes.js, "handle headers").

import { createRequire } from 'node:module'
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import path from 'node:path'
import { line, tryImport, broken, repoRoot } from './standins.mjs'

export const title = 'What the settings and files say'

const require = createRequire(import.meta.url)
const { getPathMatch } = require('next/dist/shared/lib/router/utils/path-match')
const { modifyRouteRegex } = require('next/dist/lib/redirect-status')

function matcher(source: string) {
  return getPathMatch(source, { strict: true, removeUnnamedParams: true, regexModifier: (regex: string) => modifyRouteRegex(regex, undefined) })
}

// The Cache-Control Next sends for one address, and any rule it could not judge.
function cacheControlFor(rules: Array<{ source: string; has?: unknown; missing?: unknown; headers: Array<{ key: string; value: string }> }>, address: string) {
  let value: string | null = null
  const unsure: string[] = []
  for (const rule of rules) {
    if (matcher(rule.source)(address) === false) continue
    for (const header of rule.headers) {
      if (header.key.toLowerCase() !== 'cache-control') continue
      if (rule.has || rule.missing) unsure.push(rule.source)
      else value = header.value
    }
  }
  return { value, unsure }
}

function shareable(value: string | null) {
  if (!value) return true
  const v = value.toLowerCase()
  return !v.includes('no-store') || v.includes('public') || v.includes('s-maxage')
}

async function cache() {
  const id = 'cache-admin'
  const question = 'Can a shared cache keep an admin page and hand it to someone else?'
  const config = await tryImport('@/next.config.ts')
  if (config.missing) throw broken(`next.config.ts did not load: ${config.missing}`)
  const rules = typeof config.mod.default.headers === 'function' ? await config.mod.default.headers() : []
  const home = cacheControlFor(rules, '/')
  if (!home.value || !home.value.includes('public')) throw broken('the matcher does not find the public rule on the home page')
  const wrong: string[] = []
  for (const address of ['/manager', '/manager/payments', '/manager/a/b']) {
    const { value, unsure } = cacheControlFor(rules, address)
    if (unsure.length) wrong.push(`${address} has a cache rule that depends on the request (${unsure.join(', ')})`)
    else if (shareable(value)) wrong.push(`${address} gets "${value ?? 'no Cache-Control'}"`)
  }
  if (wrong.length) return line(id, question, false, `It answered yes: ${wrong.join('; ')}.`)
  return line(id, question, true, 'It answered no: every admin address gets no-store and nothing public.')
}

const LOG_CALL = /\bconsole\.\w+\s*\(|\blogEvent\s*\(/

export function logProblems(files: Array<{ file: string; text: string }>) {
  return files.filter(({ text }) => LOG_CALL.test(text)).map(({ file }) => `${file} writes to the logs`)
}

function walk(dir: string): string[] {
  if (!existsSync(dir)) return []
  const out: string[] = []
  for (const name of readdirSync(dir).sort()) {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

function logs() {
  const id = 'leak-log'
  const question = 'Does any admin or owner-email code write to the logs?'
  if (logProblems([{ file: 'sample.ts', text: 'console.log(user.email)' }]).length !== 1 || logProblems([{ file: 'ok.ts', text: 'return rows' }]).length !== 0) {
    throw broken('the log check does not tell a log call from plain code')
  }
  const admin = [...walk(path.join(repoRoot, 'app', '(admin)')), ...walk(path.join(repoRoot, 'features', 'admin'))]
  const owner = [...walk(path.join(repoRoot, 'features')), ...walk(path.join(repoRoot, 'platform'))].filter((full) => /owner/i.test(path.basename(full)))
  const files = [...new Set([...admin, ...owner])].map((full) => ({ file: path.relative(repoRoot, full), text: readFileSync(full, 'utf8') }))
  const problems = logProblems(files)
  if (problems.length) return line(id, question, false, `It answered yes: ${problems.join('; ')}.`)
  return line(id, question, true, `It answered no: ${files.length} admin and owner-email file(s), none writes to the logs.`)
}

export async function ask() {
  return [await cache(), logs()]
}
