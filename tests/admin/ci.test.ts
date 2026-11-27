// Does GitHub run all of these questions on every change?

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { line, repoRoot } from './standins.mjs'

export const title = 'Running on every change'

export const COMMAND = 'node --experimental-strip-types --import ./tools/alias-loader.mjs --import ./tests/admin/load.mjs tests/admin/admin.test.ts'

function escape(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function ask() {
  return [answer()]
}

function answer() {
  const id = 'auto-run'
  const question = 'Does every change to the shop run all of these proofs automatically?'
  const dir = path.join(repoRoot, '.github', 'workflows')
  const files = existsSync(dir) ? readdirSync(dir).filter((name) => /\.ya?ml$/.test(name)).sort() : []
  const runsAll = new RegExp(`${escape(COMMAND)}(?![ \\t]+(entry|config|list|notices|ci)\\b)`)
  for (const name of files) {
    const text = readFileSync(path.join(dir, name), 'utf8')
    const at = text.search(runsAll)
    if (at < 0) continue
    const onPullRequests = /^\s*pull_request\s*:/m.test(text)
    const onMain = /^\s*push\s*:[\s\S]*?branches\s*:\s*\[\s*main\s*\]/m.test(text) || /^\s*push\s*:[\s\S]*?branches\s*:\s*\n\s*-\s*main\b/m.test(text)
    const installsFirst = /npm ci\b/.test(text.slice(0, at))
    if (onPullRequests && onMain && installsFirst) return line(id, question, true, `It answered yes: ${name} runs every question on each pull request and each push to main.`)
    return line(id, question, false, `It answered no: ${name} runs the command but ${!onPullRequests ? 'not on pull requests' : !onMain ? 'not on pushes to main' : 'before installing the packages'}.`)
  }
  return line(id, question, false, 'It answered no: no GitHub workflow runs the full admin proof command.')
}
