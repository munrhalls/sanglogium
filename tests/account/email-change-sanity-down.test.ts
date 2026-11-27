// If Sanity is down when Anna's new email is confirmed, does Sanity catch up
// with her new email once it is back?
//
// Cannot lie: The stand-in Sanity refuses the real write, and the proof
// compares both stores after Anna's next visit.

import { prove, customer, openPage, linkFor, openVerifyLink, userRow } from './shop.test.ts'
import { all, outage } from './stand-ins/sanity.mjs'

prove('If Sanity is down when Anna\'s new email is confirmed, does Sanity catch up with her new email once it is back?', 'yes', async () => {
  const anna = await customer('anna')
  await anna.send('/change-email', { body: { newEmail: 'anna-new@example.com', callbackURL: '/account?emailChanged=true' } })
  outage.writes = () => true
  await openVerifyLink(anna, linkFor('anna-new@example.com', 'Verify'))
  outage.writes = null
  if ((await userRow('anna-new@example.com'))?.id !== anna.userId) throw new Error('control: her new email was not confirmed')
  await openPage(anna, 'orders')
  const profile = all('userProfile').find((doc) => doc.authId === anna.userId)
  return profile?.email === 'anna-new@example.com' ? null : 'after her next visit Sanity still holds her old email'
})
