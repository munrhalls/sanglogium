// Does Anna's verification link stop working after the hour her email
// promises?
//
// Cannot lie: At 59 minutes a second link of the same kind still works; at 61
// minutes the first is refused.

import { prove, customer, linkFor, mailFor, openVerifyLink, verified, userRow } from './shop.test.ts'
import { clock, minutes } from './stand-ins/world.mjs'

prove('Does Anna\'s verification link stop working after the hour her email promises?', 'yes', async () => {
  const anna = await customer('anna', { verify: false, signIn: false })
  const ben = await customer('ben', { verify: false, signIn: false })
  const promise = mailFor(anna.email, 'Verify').html.match(/expires in (\d+) hour/)
  if (!promise) throw new Error('control: the email does not say when the link expires')
  const limit = minutes(60 * Number(promise[1]))
  clock.forward(limit - minutes(1))
  if (!verified(await openVerifyLink(ben, linkFor(ben.email, 'Verify')))) throw new Error('control: a link one minute before its time was refused')
  clock.forward(minutes(2))
  const late = await openVerifyLink(anna, linkFor(anna.email, 'Verify'))
  if (verified(late) || (await userRow(anna.email)).emailVerified) return 'one minute after the promised time her link still verified her email'
  return null
})
