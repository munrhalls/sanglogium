// DoD-5: TypeScript type validation
// Runs `tsc --noEmit` on the bad-request fixture. Passes if:
//   - every @ts-expect-error line is hit (i.e. tsc did produce a diagnostic there)
//   - no unexpected diagnostics remain
// With @ts-expect-error in place, tsc returns exit code 0 when errors match expectations
// and nonzero when they don't. So passing tsc == all expectations met.

import { describe, it, expect } from 'vitest'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const FIXTURE = path.resolve(
  __dirname,
  'type-fixtures',
  'bad-request.ts'
)

const TSCONFIG = path.resolve(__dirname, 'tsconfig.fixture.json')

describe('TypeScript type validation', () => {
  it('bad-request fixture: every malformed line is caught by tsc', () => {
    const result = spawnSync(
      'npx',
      ['--no-install', 'tsc', '--noEmit', '-p', TSCONFIG],
      {
        encoding: 'utf-8',
        shell: true,
        cwd: path.resolve(__dirname, '..', '..', '..'),
      }
    )

    const out = (result.stdout || '') + (result.stderr || '')
    // tsc exits 0 when all errors were expected via @ts-expect-error, nonzero otherwise.
    expect(result.status, `tsc output:\n${out}`).toBe(0)
  }, 60_000)
})
