// Does a 'recent sign-in' count from when Anna typed her password, not from
// her last page visit?
//
// Cannot lie: Anna keeps browsing for 6 minutes, which renews the session; one
// minute after a sign-in the same action is accepted.

import { prove, customer, openPage } from './shop.test.ts'
import { clock, minutes } from './stand-ins/world.mjs'

prove('Does a \'recent sign-in\' count from when Anna typed her password, not from her last page visit?', 'yes', async () => {
  const anna = await customer('anna')
  const ben = await customer('ben')
  clock.forward(minutes(1))
  if ((await ben.send('/change-email', { body: { newEmail: 'ben-new@example.com', callbackURL: '/account' } })).status !== 200) throw new Error('control: one minute after sign-in the change was refused')
  for (let minute = 0; minute < 6; minute += 1) {
    clock.forward(minutes(1))
    await anna.session()
    await openPage(anna, 'orders')
  }
  const late = await anna.send('/change-email', { body: { newEmail: 'anna-new@example.com', callbackURL: '/account' } })
  return late.status === 200 ? 'after 7 minutes of browsing, with no new sign-in, her email change was accepted' : null
})
