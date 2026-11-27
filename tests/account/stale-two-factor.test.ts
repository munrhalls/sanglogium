// Can a session that signed in more than 5 minutes ago turn Anna's two-factor
// on or off?
//
// Cannot lie: At 4 minutes the same request is accepted, so a refusal at 6
// comes from age.

import { prove, customer, turnOnTwoFactor } from './shop.test.ts'
import { clock, minutes } from './stand-ins/world.mjs'

prove('Can a session that signed in more than 5 minutes ago turn Anna\'s two-factor on or off?', 'no', async () => {
  const anna = await customer('anna')
  const ben = await customer('ben')
  const cara = await customer('cara')
  const { problem } = await turnOnTwoFactor(cara)
  if (problem) throw new Error(`control: ${problem}`)
  clock.forward(minutes(4))
  if ((await ben.send('/two-factor/enable', { body: { password: ben.password } })).status !== 200) throw new Error('control: at 4 minutes turning it on was refused')
  clock.forward(minutes(2))
  if ((await anna.send('/two-factor/enable', { body: { password: anna.password } })).status === 200) return 'at 6 minutes after sign-in two-factor could be turned on'
  if ((await cara.send('/two-factor/disable', { body: { password: cara.password } })).status === 200) return 'at 6 minutes after sign-in two-factor could be turned off'
  return null
})
