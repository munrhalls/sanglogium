// Does a password-reset link stop working after the hour the email promises?
//
// Cannot lie: At 59 minutes a second link works; at 61 minutes the first is
// refused.

import { prove, customer, Browser, askForReset, resetWith, linkFor, mailFor } from './shop.test.ts'
import { clock, minutes } from './stand-ins/world.mjs'

prove('Does a password-reset link stop working after the hour the email promises?', 'yes', async () => {
  const anna = await customer('anna', { signIn: false })
  const ben = await customer('ben', { signIn: false })
  await askForReset(new Browser('anna-laptop'), anna.email)
  await askForReset(new Browser('ben-laptop'), ben.email)
  const promise = mailFor(anna.email, 'Reset').html.match(/expires in (\d+) hour/)
  if (!promise) throw new Error('control: the email does not say when the link expires')
  const limit = minutes(60 * Number(promise[1]))
  clock.forward(limit - minutes(1))
  if ((await resetWith(new Browser('ben-laptop'), linkFor(ben.email, 'Reset'), 'ben-new-password-2')).status !== 200) throw new Error('control: a link one minute before its time was refused')
  clock.forward(minutes(2))
  const late = await resetWith(new Browser('anna-laptop'), linkFor(anna.email, 'Reset'), 'anna-new-password-2')
  return late.status === 200 ? 'one minute after the promised time her link still set a new password' : null
})
