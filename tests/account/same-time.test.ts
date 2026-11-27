// Do those same screens take about the same time whether or not the email has
// an account?
//
// Cannot lie: The stand-in email service takes 300 ms like a real one, and the
// proof compares the middle of five timings with a wide margin.

import { prove, customer, Browser, askForReset, outbox } from './shop.test.ts'
import { clock } from './stand-ins/world.mjs'
import { wire as databaseWire } from './stand-ins/database.mjs'
import { wire as sanityWire } from './stand-ins/sanity.mjs'

const middle = (list) => [...list].sort((a, b) => a - b)[Math.floor(list.length / 2)]
async function timed(ask) {
  const start = performance.now()
  await ask()
  return performance.now() - start
}

prove('Do those same screens take about the same time whether or not the email has an account?', 'yes', async () => {
  const anna = await customer('anna', { signIn: false })
  const ben = await customer('ben', { verify: false, signIn: false })
  const cara = await customer('cara')
  // Real services answer after a delay: email about 300 ms, Sanity about 150 ms, the sign-in database about 20 ms a statement.
  outbox.delayMs = 300
  sanityWire.delayMs = 150
  databaseWire.delayMs = 20
  let n = 0
  const fresh = () => new Browser(`sam-${(n += 1)}`)
  const screens = [
    ['sign-up', anna.email, (email) => fresh().send('/sign-up/email', { body: { name: 'Sam', email, password: 'sam-password-1' } })],
    ['sign-in with a wrong password', anna.email, (email) => fresh().send('/sign-in/email', { body: { email, password: 'wrong-password-1' } })],
    ['forgot-password', anna.email, (email) => askForReset(fresh(), email)],
    ['resend-link', ben.email, (email) => fresh().send('/send-verification-email', { body: { email, callbackURL: '/sign-in?verified=true' } })],
    ['change-email', anna.email, (email) => { clock.forward(11000); return cara.send('/change-email', { body: { newEmail: email, callbackURL: '/account' } }) }],
  ]
  for (const [screen, existing, ask] of screens) {
    const known = []
    const unknown = []
    for (let i = 0; i < 5; i += 1) {
      known.push(await timed(() => ask(existing)))
      unknown.push(await timed(() => ask(`nobody-${screen.length}-${i}@example.com`)))
    }
    const gap = middle(known) - middle(unknown)
    if (Math.abs(gap) > 150) return `${screen} takes clearly longer for ${gap > 0 ? 'an email that has an account' : 'an email that has none'}`
  }
  return null
})
