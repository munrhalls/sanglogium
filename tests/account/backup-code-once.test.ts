// Can one of Anna's two-factor backup codes be used twice?
//
// Cannot lie: The first use gets in; the second try uses the identical code.

import { prove, customer, Browser, turnOnTwoFactor } from './shop.test.ts'

prove('Can one of Anna\'s two-factor backup codes be used twice?', 'no', async () => {
  const anna = await customer('anna')
  const { problem } = await turnOnTwoFactor(anna)
  if (problem) throw new Error(`control: ${problem}`)
  const code = anna.backupCodes[0]
  const first = new Browser('anna-tablet')
  await first.send('/sign-in/email', { body: { email: anna.email, password: anna.password } })
  await first.send('/two-factor/verify-backup-code', { body: { code } })
  if (!(await first.session())) throw new Error('control: the backup code did not get in the first time')
  const second = new Browser('tom')
  await second.send('/sign-in/email', { body: { email: anna.email, password: anna.password } })
  await second.send('/two-factor/verify-backup-code', { body: { code } })
  return (await second.session()) ? 'the same backup code got in a second time' : null
})
