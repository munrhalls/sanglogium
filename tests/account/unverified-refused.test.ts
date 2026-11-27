// If someone signs up with Anna's email, are they refused at sign-in, even
// with the right password, until the link sent to Anna's inbox is opened?
//
// Cannot lie: The sign-up and password are real; after the proof opens the
// inbox link the same password gets in, so the refusal came from the missing
// link.

import { prove, Browser, linkFor, openVerifyLink, verified } from './shop.test.ts'

prove('If someone signs up with Anna\'s email, are they refused at sign-in, even with the right password, until the link sent to Anna\'s inbox is opened?', 'yes', async () => {
  const sam = new Browser('sam')
  const signUp = await sam.send('/sign-up/email', { body: { name: 'Sam', email: 'anna@example.com', password: 'sam-password-1' } })
  if (signUp.status !== 200) return `the sign-up answered ${signUp.status}`
  const early = await sam.send('/sign-in/email', { body: { email: 'anna@example.com', password: 'sam-password-1' } })
  if (early.status === 200 || (await sam.session())) return 'the password signed in before the link in Anna\'s inbox was opened'
  const link = linkFor('anna@example.com', 'Verify')
  if (!link || !verified(await openVerifyLink(new Browser('anna'), link))) throw new Error('control: the link in Anna\'s inbox did not work')
  const later = await sam.send('/sign-in/email', { body: { email: 'anna@example.com', password: 'sam-password-1' } })
  if (later.status !== 200) throw new Error(`control: after the link the same password was refused (${later.status})`)
  return null
})
