// Does Anna's data export hold her profile and her orders, and nothing of
// Ben's?
//
// Cannot lie: Ben has a profile and orders in the same stand-in Sanity; the
// proof searches the export for each of his values.

import { prove, customer, order, exportFor, act, addressForm } from './shop.test.ts'

prove('Does Anna\'s data export hold her profile and her orders, and nothing of Ben\'s?', 'yes', async () => {
  const anna = await customer('anna')
  const ben = await customer('ben')
  await act(anna, 'account/actions/addAddressAction', addressForm('Anna Street'))
  await act(ben, 'account/actions/addAddressAction', addressForm('Ben Street'))
  const hers = [order(anna), order(anna)]
  const his = [order(ben)]
  const download = await exportFor(anna)
  if (download.status !== 200) return `the export answered ${download.status}`
  const text = download.text
  const missing = [...hers.map((doc) => doc.orderNumber), 'Anna Street', anna.email].filter((value) => !text.includes(value))
  if (missing.length) return `her export left out ${missing.join(', ')}`
  const foreign = [ben.email, ben.userId, 'Ben Street', ...his.map((doc) => doc.orderNumber)].filter((value) => text.includes(value))
  return foreign.length ? `her export held Ben's ${foreign.length} values` : null
})
