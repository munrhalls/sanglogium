// After Anna's account is deleted, does every order she placed still exist in
// the shop, with nothing pointing to her old account?
//
// Cannot lie: The proof records every order before the deletion and finds each
// one afterwards.

import { prove, customer, order, askToDelete, openDeleteLink, userRow } from './shop.test.ts'
import { all } from './stand-ins/sanity.mjs'

prove('After Anna\'s account is deleted, does every order she placed still exist in the shop, with nothing pointing to her old account?', 'yes', async () => {
  const anna = await customer('anna')
  const placed = [order(anna), order(anna, { status: 'cancelled' }), order(anna, { status: 'refunded' })]
  await openDeleteLink(anna, (await askToDelete(anna)).link)
  if (await userRow(anna.email)) throw new Error('control: her account was not deleted')
  for (const doc of placed) {
    const kept = all('order').find((o) => o._id === doc._id)
    if (!kept) return `order ${doc.orderNumber} is gone`
    if (kept.userId) return `order ${doc.orderNumber} still points to her old account`
  }
  return null
})
