// If Sam signs up with Anna's email and never verifies, is Sam still kept out
// after Anna signs in with Google?
//
// Cannot lie: Sam's password is real, and the proof tries it after Anna's
// Google sign-in through a stand-in Google.

import { prove, Browser, withGoogle, userRow } from './shop.test.ts'

prove('If Sam signs up with Anna\'s email and never verifies, is Sam still kept out after Anna signs in with Google?', 'yes', async () => {
  const sam = new Browser('sam')
  await sam.send('/sign-up/email', { body: { name: 'Sam', email: 'anna@example.com', password: 'sam-password-1' } })
  const squat = await userRow('anna@example.com')
  if (!squat || squat.emailVerified) throw new Error('control: Sam\'s unverified account was not made')
  await withGoogle(new Browser('anna'), { sub: 'google-anna', email: 'anna@example.com' })
  const tried = await sam.send('/sign-in/email', { body: { email: 'anna@example.com', password: 'sam-password-1' } })
  return tried.status === 200 ? 'after Anna\'s Google sign-in, Sam\'s password opens the account' : null
})
