// If Anna is signed in, can she open Ben's order by typing its number?
//
// Cannot lie: Ben's order really exists in the test, and the proof says NO to
// Anna and YES to Ben.

import { prove, customer, order, openPage } from './shop.test.ts'

prove('If Anna is signed in, can she open Ben\'s order by typing its number?', 'no', async () => {
  const anna = await customer('anna')
  const ben = await customer('ben')
  const bens = order(ben)
  order(anna)
  const asAnna = await openPage(anna, 'orders/[orderNumber]', { orderNumber: bens.orderNumber })
  if (asAnna.element) return `her page showed Ben's order ${bens.orderNumber}`
  const asBen = await openPage(ben, 'orders/[orderNumber]', { orderNumber: bens.orderNumber })
  if (asBen.element?.props?.order?.orderNumber !== bens.orderNumber) throw new Error('control: Ben could not open his own order')
  return null
})
