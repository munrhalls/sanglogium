// Can someone make the shop email Anna a link that leads to another website?
//
// Cannot lie: The proof asks for every kind of email with a foreign Host
// header and foreign return addresses, then reads every link in the stand-in
// inbox.

import { prove, customer, Browser, askForReset, askToDelete } from './shop.test.ts'
import { outbox, linksIn } from './stand-ins/email.mjs'

prove('Can someone make the shop email Anna a link that leads to another website?', 'no', async () => {
  const foreign = { host: 'evil.example', 'x-forwarded-host': 'evil.example', 'x-forwarded-proto': 'https' }
  await new Browser('sam').send('/sign-up/email', { headers: foreign, body: { name: 'Sam', email: 'sam@example.com', password: 'sam-password-1' } })
  const anna = await customer('anna')
  await askForReset(new Browser('tom'), anna.email)
  await new Browser('tom-2').send('/request-password-reset', { headers: foreign, body: { email: anna.email, redirectTo: '/reset-password' } })
  await new Browser('tom-3').send('/send-verification-email', { headers: foreign, body: { email: 'sam@example.com', callbackURL: '/sign-in' } })
  await anna.send('/change-email', { headers: foreign, body: { newEmail: 'anna-new@example.com', callbackURL: '/account' } })
  await anna.send('/delete-user', { headers: foreign, body: { password: anna.password } })
  const kinds = new Set(outbox.mails.map((mail) => mail.type))
  if (kinds.size < 3) throw new Error(`control: only ${kinds.size} kinds of email went out`)
  const away = outbox.mails.flatMap((mail) => linksIn(mail).filter((link) => !link.startsWith('https://shop.example/')).map(() => mail.type))
  return away.length ? `a ${away[0]} email links away from the shop` : null
})
