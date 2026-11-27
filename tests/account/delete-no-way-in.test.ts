// After Anna's account is deleted, can her old password, session or two-factor
// code still get in?
//
// Cannot lie: Each worked a moment before the deletion.

import { prove, customer, Browser, askToDelete, openDeleteLink, userRow, turnOnTwoFactor, letsIn } from './shop.test.ts'

prove('After Anna\'s account is deleted, can her old password, session or two-factor code still get in?', 'no', async () => {
  const anna = await customer('anna')
  const { problem } = await turnOnTwoFactor(anna)
  if (problem) throw new Error(`control: ${problem}`)
  const phone = new Browser('anna-phone')
  phone.email = anna.email
  phone.password = anna.password
  await phone.signIn()
  await phone.send('/two-factor/verify-totp', { body: { code: await anna.code() } })
  const tom = anna.copyTo('tom')
  for (const who of [phone, tom]) if (!(await letsIn(who, anna.userId))) throw new Error(`control: ${who.name} was not signed in before the deletion`)
  await openDeleteLink(anna, (await askToDelete(anna)).link)
  if (await userRow(anna.email)) throw new Error('control: her account was not deleted')
  if ((await new Browser('sam').send('/sign-in/email', { body: { email: anna.email, password: anna.password } })).status === 200) return 'her old password still signs in'
  for (const who of [phone, tom]) {
    const still = await letsIn(who, anna.userId)
    if (still) return `${who.name === 'tom' ? 'a copy of her session' : 'her phone'} still opened ${still}`
  }
  return null
})
