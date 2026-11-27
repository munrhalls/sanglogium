// If Anna mistypes her new email, can the stranger who owns that address get
// into her account by opening the link?
//
// Cannot lie: Sam opens the real link from his own inbox in his own browser;
// Anna opening it in hers still changes her email.

import { prove, customer, Browser, linkFor, openVerifyLink, userRow } from './shop.test.ts'

prove('If Anna mistypes her new email, can the stranger who owns that address get into her account by opening the link?', 'no', async () => {
  const anna = await customer('anna')
  const asked = await anna.send('/change-email', { body: { newEmail: 'sam@example.com', callbackURL: '/account?emailChanged=true' } })
  if (asked.status !== 200) throw new Error(`control: asking for the change answered ${asked.status}`)
  const link = linkFor('sam@example.com', 'Verify')
  if (!link) throw new Error('control: no link reached the mistyped address')
  const sam = new Browser('sam')
  await openVerifyLink(sam, link)
  const inside = await sam.session()
  if (inside?.user?.id === anna.userId) return 'opening the link signed Sam in to her account'
  if ((await userRow('sam@example.com'))?.id === anna.userId) return 'her account now carries Sam\'s email, so Sam can reset its password'
  const ben = await customer('ben')
  await ben.send('/change-email', { body: { newEmail: 'ben-new@example.com', callbackURL: '/account?emailChanged=true' } })
  await openVerifyLink(ben, linkFor('ben-new@example.com', 'Verify'))
  if ((await userRow('ben-new@example.com'))?.id !== ben.userId) throw new Error('control: opening the link in his own browser did not change his email')
  return null
})
