// If Anna gets her verification email twice and opens both links, does she end
// up with one working account?
//
// Cannot lie: Both links come from the stand-in inbox; the proof counts
// accounts and signs in afterwards.

import { prove, customer, openVerifyLink } from './shop.test.ts'
import { mailsTo, linksIn } from './stand-ins/email.mjs'
import { rows } from './stand-ins/database.mjs'
import { all } from './stand-ins/sanity.mjs'

prove('If Anna gets her verification email twice and opens both links, does she end up with one working account?', 'yes', async () => {
  const anna = await customer('anna', { verify: false, signIn: false })
  await anna.send('/send-verification-email', { body: { email: anna.email, callbackURL: '/sign-in?verified=true' } })
  const mails = mailsTo(anna.email).filter((mail) => mail.subject.includes('Verify'))
  if (mails.length !== 2) throw new Error(`control: ${mails.length} verification emails arrived, not 2`)
  for (const mail of mails) await openVerifyLink(anna, linksIn(mail)[0])
  const accounts = (await rows('user')).filter((row) => row.email === anna.email)
  if (accounts.length !== 1) return `${accounts.length} accounts exist for her email`
  const profiles = all('userProfile').filter((doc) => doc.authId === accounts[0].id)
  if (profiles.length !== 1) return `${profiles.length} profiles exist for her account`
  if ((await anna.signIn()).status !== 200) return 'she could not sign in afterwards'
  return null
})
