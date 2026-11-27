// After Sam signed up with Anna's email first, can Anna still get into an
// account under her email that Sam cannot enter?
//
// Cannot lie: Sam's sign-up is real; the proof uses only Anna's inbox and then
// tries Sam's password.

import { prove, Browser, askForReset, resetWith, linkFor, openVerifyLink, verified } from './shop.test.ts'

prove('After Sam signed up with Anna\'s email first, can Anna still get into an account under her email that Sam cannot enter?', 'yes', async () => {
  const sam = new Browser('sam')
  await sam.send('/sign-up/email', { body: { name: 'Sam', email: 'anna@example.com', password: 'sam-password-1' } })
  const anna = new Browser('anna')
  await askForReset(anna, 'anna@example.com')
  const reset = await resetWith(anna, linkFor('anna@example.com', 'Reset'), 'anna-password-1')
  if (reset.status !== 200) return `her reset answered ${reset.status}`
  const first = await anna.send('/sign-in/email', { body: { email: 'anna@example.com', password: 'anna-password-1' } })
  if (first.status !== 200) {
    if (first.json?.code !== 'EMAIL_NOT_VERIFIED') return `sign-in answered ${first.status} and offered no next step`
    await anna.send('/send-verification-email', { body: { email: 'anna@example.com', callbackURL: '/sign-in?verified=true' } })
    if (!verified(await openVerifyLink(anna, linkFor('anna@example.com', 'Verify')))) return 'the new verification link was refused'
    if ((await anna.send('/sign-in/email', { body: { email: 'anna@example.com', password: 'anna-password-1' } })).status !== 200) return 'she still could not sign in'
  }
  const tried = await sam.send('/sign-in/email', { body: { email: 'anna@example.com', password: 'sam-password-1' } })
  return tried.status === 200 ? 'Sam\'s password still opens the account' : null
})
