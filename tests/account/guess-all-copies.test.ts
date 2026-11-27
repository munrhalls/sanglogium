// Is the number of guesses at Anna's password limited across all copies of the
// shop's server, not just one?
//
// Cannot lie: A count kept in one server copy's memory cannot be seen by
// another copy; the proof reads which kind of count the shop's own sign-in
// code keeps.

import { prove, signInContext } from './shop.test.ts'

prove('Is the number of guesses at Anna\'s password limited across all copies of the shop\'s server, not just one?', 'yes', async () => {
  const context = await signInContext()
  if (!context.rateLimit.enabled) return 'guess limits are switched off'
  if (context.rateLimit.storage === 'memory') return 'guesses are counted in each server copy\'s own memory, so every copy allows its own five'
  return null
})
