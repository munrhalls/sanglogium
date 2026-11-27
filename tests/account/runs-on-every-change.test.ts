// Does GitHub run every account proof on every change and mark the change
// failed on any NO?
//
// Cannot lie: The proof reads the workflow file GitHub runs and finds the
// exact command the proof book names.

import { prove } from './shop.test.ts'
import { readdirSync, readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const COMMAND = 'npm run --silent proof:account'

prove('Does GitHub run every account proof on every change and mark the change failed on any NO?', 'yes', async () => {
  const script = JSON.parse(readFileSync(new URL('package.json', root), 'utf8')).scripts?.['proof:account']
  if (script !== 'node tests/account/run-all.mjs') return `the proof:account script is ${script ?? 'missing'}`
  const flows = readdirSync(new URL('.github/workflows/', root)).map((name) => readFileSync(new URL(`.github/workflows/${name}`, root), 'utf8'))
  const flow = flows.find((text) => text.includes(COMMAND))
  if (!flow) return 'no GitHub workflow runs the account proofs'
  if (!/pull_request/.test(flow) || !/push:\s*\n\s*branches:\s*\[main\]/.test(flow)) return 'the workflow does not run on every pull request and push to main'
  if (/continue-on-error:\s*true/.test(flow) || /\|\|\s*true/.test(flow)) return 'the workflow lets a NO pass'
  return null
})
