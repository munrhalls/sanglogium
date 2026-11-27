// If Sanity fails while Anna's account is being deleted, can she finish the
// deletion and leave nothing of hers in either store?
//
// Cannot lie: The stand-in Sanity refuses the real write mid-deletion, and the
// proof finishes using only what Anna can do herself.

import { prove, customer, order, askToDelete, openDeleteLink, userRow } from './shop.test.ts'
import { all, outage } from './stand-ins/sanity.mjs'

prove('If Sanity fails while Anna\'s account is being deleted, can she finish the deletion and leave nothing of hers in either store?', 'yes', async () => {
  const anna = await customer('anna')
  order(anna)
  const { link } = await askToDelete(anna)
  outage.writes = () => true
  await openDeleteLink(anna, link)
  outage.writes = null
  if (await userRow(anna.email)) {
    await anna.signIn()
    await openDeleteLink(anna, (await askToDelete(anna)).link)
  }
  if (await userRow(anna.email)) return 'she could not finish the deletion once Sanity was back'
  if (all('userProfile').some((doc) => doc.authId === anna.userId)) return 'her profile is left in Sanity, and with her sign-in gone she cannot remove it'
  if (all('order').some((doc) => doc.userId === anna.userId)) return 'her orders still point to her deleted account'
  return null
})
