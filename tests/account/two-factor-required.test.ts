// If Anna turned two-factor on, is her password alone refused, while her
// password plus her code gets in?
//
// Cannot lie: The proof makes the code from the same key Anna's phone would
// hold, and the same password gets in once the code is added.

import { prove, customer } from './shop.test.ts'
import { turnOnTwoFactor as turnOn } from './shop.test.ts'

prove('If Anna turned two-factor on, is her password alone refused, while her password plus her code gets in?', 'yes', async () => {
  const anna = await customer('anna')
  const { problem } = await turnOn(anna)
  if (problem) throw new Error(`control: ${problem}`)
  await anna.send('/sign-out', { body: {} })
  const first = await anna.signIn()
  if (first.status !== 200) throw new Error(`control: the password step answered ${first.status}`)
  if (await anna.session()) return 'the password alone signed her in'
  const second = await anna.send('/two-factor/verify-totp', { body: { code: await anna.code() } })
  if (second.status !== 200 || !(await anna.session())) throw new Error('control: password plus code did not sign her in')
  return null
})
