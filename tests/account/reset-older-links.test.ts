// After Anna sets a new password with one reset link, does every other reset
// link she was sent stop working?
//
// Cannot lie: Both links are real and unexpired; the proof checks the older
// one still worked before the reset.

import { prove, customer, Browser, askForReset, resetWith } from './shop.test.ts'
import { mailsTo, linksIn } from './stand-ins/email.mjs'

prove('After Anna sets a new password with one reset link, does every other reset link she was sent stop working?', 'yes', async () => {
  const anna = await customer('anna', { signIn: false })
  const desk = new Browser('anna-laptop')
  await askForReset(desk, anna.email)
  await askForReset(desk, anna.email)
  const [older, newer] = mailsTo(anna.email).filter((mail) => mail.subject.includes('Reset')).map((mail) => linksIn(mail)[0])
  if (!older || !newer || older === newer) throw new Error('control: two different reset links did not arrive')
  const token = new URL(older).searchParams.get('token')
  const check = await desk.send(`/reset-password/${token}`, { method: 'GET', origin: null, query: { callbackURL: '/reset-password' } })
  if (!check.location?.includes('token=') || check.location.includes('error=')) throw new Error('control: the older link was not valid before the reset')
  if ((await resetWith(desk, newer, 'anna-new-password-2')).status !== 200) throw new Error('control: the newer link was refused')
  const late = await resetWith(new Browser('tom'), older, 'tom-password-3')
  return late.status === 200 ? 'after the reset, the older link set her password again' : null
})
