// Without signing in, can anyone get an export, an order, an address list, a
// wishlist or change any of them?
//
// Cannot lie: The same calls with Anna's session return her data, so a refusal
// comes from the missing sign-in.

import { prove, customer, Browser, order, openPage, exportFor, act, addressForm } from './shop.test.ts'
import { put } from './stand-ins/sanity.mjs'

prove('Without signing in, can anyone get an export, an order, an address list, a wishlist or change any of them?', 'no', async () => {
  put({ _id: 'product-1', _type: 'product', name: 'Proof Product' })
  const anna = await customer('anna')
  const hers = order(anna)
  const nobody = new Browser('nobody')
  const got = []
  if ((await exportFor(nobody)).status !== 401) got.push('an export')
  for (const [page, params] of [['orders', {}], ['orders/[orderNumber]', { orderNumber: hers.orderNumber }], ['addresses', {}], ['wishlist', {}], ['', {}]]) {
    const opened = await openPage(nobody, page.replace(/^$/, '.'), params).catch(() => ({}))
    if (opened.element) got.push(`the ${page || 'account'} page`)
  }
  const actions = [
    ['account/actions/addAddressAction', addressForm('Nobody Street')],
    ['account/actions/updateNameAction', addressForm('x')],
    ['account/actions/updatePreferencesAction', new FormData()],
    ['wishlist/actions/addToWishlistAction', 'product-1'],
    ['wishlist/actions/removeFromWishlistAction', 'product-1'],
    ['account/actions/removeAddressAction', '00000000-0000-4000-8000-000000000000'],
  ]
  for (const [file, arg] of actions) if (!(await act(nobody, file, arg)).refused) got.push(file.split('/').pop())
  const ids = await act(nobody, 'wishlist/actions/getWishlistIdsAction')
  if ((ids.result ?? []).length) got.push('wishlist ids')
  if (got.length) return `without a sign-in it got ${got.join(', ')}`
  if ((await exportFor(anna)).status !== 200 || !(await openPage(anna, 'orders')).element) throw new Error('control: Anna herself was refused')
  return null
})
