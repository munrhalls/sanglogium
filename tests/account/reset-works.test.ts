// If Anna forgets her password, can she set a new one from the link in her
// inbox, sign in with it, and is the old one refused?
//
// Cannot lie: The proof uses only the link the stand-in inbox received and
// tries both passwords afterwards.

import { prove, customer, Browser, askForReset, resetWith, linkFor } from './shop.test.ts'

prove('If Anna forgets her password, can she set a new one from the link in her inbox, sign in with it, and is the old one refused?', 'yes', async () => {
  const anna = await customer('anna')
  const desk = new Browser('anna-laptop')
  const asked = await askForReset(desk, anna.email)
  if (asked.status !== 200) return `asking for a reset answered ${asked.status}`
  const link = linkFor(anna.email, 'Reset')
  if (!link) return 'no reset email reached her inbox'
  const reset = await resetWith(desk, link, 'anna-new-password-2')
  if (reset.status !== 200) return `setting the new password answered ${reset.status}`
  if ((await desk.send('/sign-in/email', { body: { email: anna.email, password: 'anna-new-password-2' } })).status !== 200) return 'the new password was refused'
  if ((await desk.send('/sign-in/email', { body: { email: anna.email, password: anna.password } })).status === 200) return 'the old password still signs her in'
  return null
})
