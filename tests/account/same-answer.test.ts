// Do sign-up, sign-in, forgot-password, resend-link and change-email give the
// same answer whether or not the email has an account?
//
// Cannot lie: Each pair of requests differs only in the email, and the proof
// compares the full status and body.

import { prove, customer, Browser, askForReset } from './shop.test.ts'
// Values that differ by what was typed or by chance, not by whether the account exists.
const MASK = new Set(['id', 'createdAt', 'updatedAt', 'email', 'token'])
const shape = (value) => Array.isArray(value) ? value.map(shape) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, MASK.has(k) ? typeof v : shape(v)])) : value
const same = (a, b) => a.status === b.status && JSON.stringify(shape(a.json)) === JSON.stringify(shape(b.json))

prove('Do sign-up, sign-in, forgot-password, resend-link and change-email give the same answer whether or not the email has an account?', 'yes', async () => {
  const anna = await customer('anna', { signIn: false })
  const ben = await customer('ben', { verify: false, signIn: false })
  const fresh = (n) => new Browser(`sam-${n}`)
  const pairs = [
    ['sign-up', (email) => fresh(1).send('/sign-up/email', { body: { name: 'Sam', email, password: 'sam-password-1' } })],
    ['sign-in with a wrong password', (email) => fresh(2).send('/sign-in/email', { body: { email, password: 'wrong-password-1' } })],
    ['forgot-password', (email) => askForReset(fresh(3), email)],
    ['resend-link', (email) => fresh(4).send('/send-verification-email', { body: { email, callbackURL: '/sign-in?verified=true' } })],
  ]
  let n = 0
  for (const [screen, ask] of pairs) {
    for (const existing of [anna.email, ben.email]) {
      n += 1
      const a = await ask(existing)
      const b = await ask(`nobody-${n}@example.com`)
      if (!same(a, b)) return `${screen} answered ${a.status} for an existing account and ${b.status} for an unused email`
    }
  }
  const cara = await customer('cara')
  const taken = await cara.send('/change-email', { body: { newEmail: anna.email, callbackURL: '/account' } })
  const free = await cara.send('/change-email', { body: { newEmail: 'nobody-x@example.com', callbackURL: '/account' } })
  if (!same(taken, free)) return `change-email answered ${taken.status} for a taken email and ${free.status} for a free one`
  return null
})
