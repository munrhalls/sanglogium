// Fixture for DoD-5 unit test. tsc --noEmit against this file should produce
// exactly the @ts-expect-error-covered diagnostics and no others.

import type { UIRequest } from '@/lib/queue/types'

// Valid baseline - must type-check clean
export const good: UIRequest = { n: 1 }

// Missing required field `n`
// @ts-expect-error - malformed: missing `n`
export const bad1: UIRequest = {}

// Wrong type for `n`
// @ts-expect-error - malformed: n must be number
export const bad2: UIRequest = { n: 'one' }

// Extra foreign field (strict mode rejects via excess property check)
// @ts-expect-error - malformed: unknown field
export const bad3: UIRequest = { n: 1, wrong: 'shape' }
