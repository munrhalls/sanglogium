// Can a session that signed in more than 5 minutes ago change Anna's password,
// even with her current password?
//
// Cannot lie: At 4 minutes the same request is accepted, so a refusal at 6
// comes from age.

import { prove, customer } from './shop.test.ts'
import { clock, minutes } from './stand-ins/world.mjs'

prove('Can a session that signed in more than 5 minutes ago change Anna\'s password, even with her current password?', 'no', async () => {
  const anna = await customer('anna')
  const ben = await customer('ben')
  clock.forward(minutes(4))
  if ((await ben.send('/change-password', { body: { currentPassword: ben.password, newPassword: 'ben-new-password-2' } })).status !== 200) throw new Error('control: at 4 minutes the change was refused')
  clock.forward(minutes(2))
  const late = await anna.send('/change-password', { body: { currentPassword: anna.password, newPassword: 'tom-password-2' } })
  return late.status === 200 ? 'at 6 minutes after sign-in the change was accepted' : null
})
