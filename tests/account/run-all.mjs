// Runs every account proof, each in its own fresh shop, and prints one line per
// proof in name order, then one last line:
//   PASS          every proof said the safe answer
//   N NO          N proofs did not; each NO line says what happened instead
//   proof broken  a proof could not be trusted; nothing it printed counts
// Exit codes 0, 1 and 2. The shop's own log lines are not printed.
//
// npm run proof:account

import { spawn } from 'node:child_process'
import { readdirSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '../..')

// Proofs that time the shop run alone, after the others, so other work on the
// machine cannot slow one side of the comparison.
const ALONE = new Set(['same-time.test.ts'])

// Proofs whose NO only the owner can change. Each still runs, and its line says what happened.
const BLOCKED = {
  'guess-all-copies.test.ts': 'counting guesses across server copies needs one shared store, such as a new table in the real sign-in database, which only the owner may add',
}

// shop.test.ts is the part every proof shares, not a proof of its own.
const files = readdirSync(here).filter((name) => name.endsWith('.test.ts') && name !== 'shop.test.ts').sort()

function run(file) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [
      '--experimental-strip-types', '--no-warnings',
      '--import', './tools/alias-loader.mjs',
      '--import', './tests/account/load.mjs',
      path.join('tests/account', file),
    ], { cwd: repoRoot })
    let out = ''
    child.stdout.on('data', (chunk) => { out += chunk })
    child.stderr.resume()
    child.on('close', (code) => {
      const lines = out.split('\n').filter((line) => /^(PASS|NO) {2,}|^proof broken: /.test(line))
      if (lines.length !== 1) resolve({ code: 2, line: `proof broken: ${file} printed ${lines.length} answer lines` })
      else resolve({ code: code ?? 2, line: lines[0] })
    })
  })
}

const results = new Map()
const together = files.filter((file) => !ALONE.has(file))
const width = Math.max(1, Math.min(4, os.cpus().length - 1))
let next = 0
await Promise.all(Array.from({ length: width }, async () => {
  while (next < together.length) {
    const file = together[next++]
    results.set(file, await run(file))
  }
}))
for (const file of files.filter((name) => ALONE.has(name))) results.set(file, await run(file))

let no = 0
let brokenCount = 0
for (const file of files) {
  const { code, line } = results.get(file)
  if (code === 1 && BLOCKED[file]) {
    console.log(`${line.replace(/^NO {4}/, 'BLOCKED  ')} Waiting on the owner: ${BLOCKED[file]}.`)
    continue
  }
  console.log(line)
  if (code === 1) no += 1
  else if (code !== 0) brokenCount += 1
}
if (brokenCount) {
  console.log('proof broken')
  process.exitCode = 2
} else if (no) {
  console.log(`${no} NO`)
  process.exitCode = 1
} else {
  console.log('PASS')
}
