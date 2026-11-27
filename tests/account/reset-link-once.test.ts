// Can a password-reset link be used a second time?
//
// Cannot lie: The first use works and changes the password; the second try
// uses the identical link.

import { prove, customer, Browser, askForReset, resetWith, linkFor } from './shop.test.ts'

prove('Can a password-reset link be used a second time?', 'no', async () => {
  const anna = await customer('anna', { signIn: false })
  const desk = new Browser('anna-laptop')
  await askForReset(desk, anna.email)
  const link = linkFor(anna.email, 'Reset')
  if ((await resetWith(desk, link, 'anna-new-password-2')).status !== 200) throw new Error('control: the first use was refused')
  const again = await resetWith(new Browser('tom'), link, 'tom-password-3')
  if (again.status === 200) return 'the same link set a password a second time'
  if ((await desk.send('/sign-in/email', { body: { email: anna.email, password: 'tom-password-3' } })).status === 200) return 'the second password now signs her in'
  return null
})
