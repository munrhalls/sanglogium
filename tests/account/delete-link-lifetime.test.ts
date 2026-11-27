// Does the delete link stop working after the hour the email promises?
//
// Cannot lie: The proof reads the promise from the real email text; at 59
// minutes a second link still works.

import { prove, customer, askToDelete, openDeleteLink, mailFor, userRow } from './shop.test.ts'
import { clock, minutes } from './stand-ins/world.mjs'

prove('Does the delete link stop working after the hour the email promises?', 'yes', async () => {
  const anna = await customer('anna')
  const ben = await customer('ben')
  const annaLink = (await askToDelete(anna)).link
  const benLink = (await askToDelete(ben)).link
  const promise = mailFor(anna.email, 'deletion').html.match(/expires in (\d+) hour/)
  if (!promise) throw new Error('control: the email does not say when the link expires')
  clock.forward(minutes(60 * Number(promise[1])) - minutes(1))
  await ben.signIn()
  await openDeleteLink(ben, benLink)
  if (await userRow(ben.email)) throw new Error('control: a link one minute before its time did not delete')
  clock.forward(minutes(2))
  await anna.signIn()
  await openDeleteLink(anna, annaLink)
  return (await userRow(anna.email)) ? null : 'one minute after the promised time her link still deleted her account'
})
