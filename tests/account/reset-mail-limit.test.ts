// From one place, can someone make the shop send Anna more than 3
// password-reset emails in an hour?
//
// Cannot lie: The proof asks five times from one address, one minute apart,
// and counts the reset emails in Anna's stand-in inbox.

import { prove, customer, Browser, askForReset } from './shop.test.ts'
import { mailsTo } from './stand-ins/email.mjs'
import { clock, minutes } from './stand-ins/world.mjs'

prove('From one place, can someone make the shop send Anna more than 3 password-reset emails in an hour?', 'no', async () => {
  const anna = await customer('anna', { signIn: false })
  const sam = new Browser('sam')
  for (let i = 0; i < 5; i += 1) {
    await askForReset(sam, anna.email)
    clock.forward(minutes(1))
  }
  const count = mailsTo(anna.email).filter((mail) => mail.subject.includes('Reset')).length
  if (count === 0) throw new Error('control: no reset email arrived at all')
  return count > 3 ? `${count} reset emails reached her inbox within 5 minutes` : null
})
