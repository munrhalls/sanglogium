// From one place, can someone make the shop send one inbox more than 3
// verification emails in an hour, by asking for a new link or by changing an
// email to that address?
//
// Cannot lie: The proof asks five times, one minute apart, from one address
// for each way, and counts the emails in the stand-in inbox.

import { prove, customer, Browser } from './shop.test.ts'
import { mailsTo } from './stand-ins/email.mjs'
import { clock, minutes } from './stand-ins/world.mjs'

prove('From one place, can someone make the shop send one inbox more than 3 verification emails in an hour, by asking for a new link or by changing an email to that address?', 'no', async () => {
  const sam = new Browser('sam')
  await sam.send('/sign-up/email', { body: { name: 'Cara', email: 'cara@example.com', password: 'sam-password-1' } })
  const afterSignUp = mailsTo('cara@example.com').length
  for (let i = 0; i < 5; i += 1) {
    await sam.send('/send-verification-email', { body: { email: 'cara@example.com', callbackURL: '/sign-in' } })
    clock.forward(minutes(1))
  }
  const resent = mailsTo('cara@example.com').length - afterSignUp
  if (resent === 0) throw new Error('control: asking for a new link sent nothing at all')
  if (resent > 3) return `asking for a new link sent ${resent} emails to one inbox within 5 minutes`
  const tom = await customer('tom')
  for (let i = 0; i < 5; i += 1) {
    await tom.send('/change-email', { body: { newEmail: 'dan@example.com', callbackURL: '/account' } })
    clock.forward(minutes(1))
  }
  const changed = mailsTo('dan@example.com').length
  if (changed === 0) throw new Error('control: changing an email sent nothing at all')
  return changed > 3 ? `changing an email sent ${changed} emails to one inbox within 5 minutes` : null
})
