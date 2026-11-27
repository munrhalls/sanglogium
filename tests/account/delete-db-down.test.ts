// If the sign-in database fails while Anna's account is being deleted, can she
// finish the deletion by trying again?
//
// Cannot lie: The stand-in database refuses the real delete once, and the
// proof checks both stores after the retry.

import { prove, customer, order, askToDelete, openDeleteLink, userRow, Browser, askForReset, resetWith, linkFor } from './shop.test.ts'
import { refuseOnce } from './stand-ins/database.mjs'
import { all } from './stand-ins/sanity.mjs'

prove('If the sign-in database fails while Anna\'s account is being deleted, can she finish the deletion by trying again?', 'yes', async () => {
  const anna = await customer('anna')
  order(anna)
  const { link } = await askToDelete(anna)
  refuseOnce(/^delete from "user"/i)
  await openDeleteLink(anna, link)
  if (!(await userRow(anna.email))) throw new Error('control: the refused delete still removed her account')
  if ((await anna.signIn()).status !== 200) {
    // Her password stopped working. What a person does next: forgot password, from her own inbox.
    await askForReset(new Browser('anna-laptop'), anna.email)
    const reset = await resetWith(new Browser('anna-laptop'), linkFor(anna.email, 'Reset'), 'anna-new-password-2')
    if (reset.status !== 200) return 'after the failure her password stopped working and a reset could not restore it'
    anna.password = 'anna-new-password-2'
    if ((await anna.signIn()).status !== 200) return 'after the failure she could not sign in again'
  }
  await openDeleteLink(anna, (await askToDelete(anna)).link)
  if (await userRow(anna.email)) return 'trying again did not delete her account'
  if (all('userProfile').some((doc) => doc.authId === anna.userId)) return 'her profile is left in Sanity'
  if (all('order').some((doc) => doc.userId === anna.userId)) return 'her orders still point to her deleted account'
  return null
})
