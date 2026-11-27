// Can Tom, holding a copy of Anna's session, add his own Google account to
// hers so he can sign in to it later?
//
// Cannot lie: Tom's Google sign-in really happens through the stand-in Google;
// Anna adding her own Google account in the same run works.

import { prove, customer, Browser, withGoogle } from './shop.test.ts'
import { rows } from './stand-ins/database.mjs'

prove('Can Tom, holding a copy of Anna\'s session, add his own Google account to hers so he can sign in to it later?', 'no', async () => {
  const anna = await customer('anna')
  const tom = anna.copyTo('tom')
  await withGoogle(tom, { sub: 'google-tom', email: 'tom@example.com' }, '/link-social')
  if ((await rows('account')).some((row) => row.userId === anna.userId && row.accountId === 'google-tom')) return 'Tom\'s Google account was added to hers'
  const later = new Browser('tom-later')
  await withGoogle(later, { sub: 'google-tom', email: 'tom@example.com' })
  if ((await later.session())?.user?.id === anna.userId) return 'Tom signed in to her account with his own Google'
  await withGoogle(anna, { sub: 'google-anna', email: anna.email }, '/link-social')
  if (!(await rows('account')).some((row) => row.userId === anna.userId && row.accountId === 'google-anna')) throw new Error('control: Anna could not add her own Google account')
  return null
})
