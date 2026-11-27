// Can a session that signed in more than 5 minutes ago start or finish
// deleting Anna's account?
//
// Cannot lie: At 4 minutes the same request is accepted, so a refusal at 6
// comes from age.

import { prove, customer, askToDelete, openDeleteLink, userRow } from './shop.test.ts'
import { clock, minutes } from './stand-ins/world.mjs'

prove('Can a session that signed in more than 5 minutes ago start or finish deleting Anna\'s account?', 'no', async () => {
  const anna = await customer('anna')
  const ben = await customer('ben')
  const cara = await customer('cara')
  const bensLink = (await askToDelete(ben)).link
  clock.forward(minutes(4))
  const control = await askToDelete(cara)
  if (control.asked.status !== 200) throw new Error('control: at 4 minutes asking to delete was refused')
  await openDeleteLink(cara, control.link)
  if (await userRow(cara.email)) throw new Error('control: at 4 minutes the link did not delete')
  clock.forward(minutes(2))
  if ((await askToDelete(anna)).asked.status === 200) return 'at 6 minutes after sign-in a deletion could be started'
  await openDeleteLink(ben, bensLink)
  return (await userRow(ben.email)) ? null : 'at 6 minutes after sign-in the link finished the deletion'
})
