// Does Anna's order list show all of her orders and none of Ben's?
//
// Cannot lie: Both have real orders in the stand-in Sanity; the proof compares
// order numbers both ways.

import { prove, customer, order, openPage } from './shop.test.ts'

prove('Does Anna\'s order list show all of her orders and none of Ben\'s?', 'yes', async () => {
  const anna = await customer('anna')
  const ben = await customer('ben')
  const hers = [order(anna), order(anna, { status: 'shipped' })].map((doc) => doc.orderNumber).sort()
  const his = [order(ben), order(ben)].map((doc) => doc.orderNumber).sort()
  const page = await openPage(anna, 'orders')
  const shown = (page.element?.props?.orders ?? []).map((doc) => doc.orderNumber).sort()
  const benPage = await openPage(ben, 'orders')
  if ((benPage.element?.props?.orders ?? []).length !== 2) throw new Error('control: Ben\'s page did not show his two orders')
  const leaked = shown.filter((number) => his.includes(number))
  if (leaked.length) return `her list showed Ben's ${leaked.join(', ')}`
  const missing = hers.filter((number) => !shown.includes(number))
  return missing.length ? `her list left out ${missing.join(', ')}` : null
})
