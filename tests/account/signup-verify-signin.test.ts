// Can Anna create an account, open the link in her own inbox, sign in with her
// password, and is a wrong password refused?
//
// Cannot lie: the proof takes the link from the stand-in inbox addressed to
// Anna, signs in with the password she chose, and tries one wrong letter in the
// same run.

import { prove, Browser, linkFor, openVerifyLink, verified } from './shop.test.ts'

prove('Can Anna create an account, open the link in her own inbox, sign in with her password, and is a wrong password refused?', 'yes', async () => {
  const anna = new Browser('anna')
  const signUp = await anna.send('/sign-up/email', { body: { name: 'Anna', email: 'anna@example.com', password: 'anna-password-1' } })
  if (signUp.status !== 200) return `sign-up answered ${signUp.status}`
  const link = linkFor('anna@example.com', 'Verify')
  if (!link) return 'no verification email reached her inbox'
  if (!verified(await openVerifyLink(anna, link))) return 'her verification link was refused'
  const wrong = await anna.send('/sign-in/email', { body: { email: 'anna@example.com', password: 'anna-password-2' } })
  if (wrong.status === 200) return 'a wrong password signed her in'
  const right = await anna.send('/sign-in/email', { body: { email: 'anna@example.com', password: 'anna-password-1' } })
  if (right.status !== 200) return `her own password was refused (${right.status})`
  const session = await anna.session()
  if (session?.user?.email !== 'anna@example.com') return 'after sign-in the shop did not know her'
  return null
})
