// Can Anna change Ben's name, marketing choice or wishlist?
//
// Cannot lie: Anna's own changes land in her profile in the same run, and
// Ben's profile is compared before and after.

import { prove, customer, act } from './shop.test.ts'
import { all, put } from './stand-ins/sanity.mjs'

prove('Can Anna change Ben\'s name, marketing choice or wishlist?', 'no', async () => {
  put({ _id: 'product-1', _type: 'product', name: 'Proof Product' })
  const anna = await customer('anna')
  const ben = await customer('ben')
  const profileOf = (who) => all('userProfile').find((doc) => doc.authId === who.userId)
  const plain = (doc) => { const { _rev, _updatedAt, ...rest } = doc; return JSON.stringify(rest) }
  const before = plain(profileOf(ben))
  const name = new FormData()
  name.set('name', 'Anna Changed')
  await act(anna, 'account/actions/updateNameAction', name)
  const choice = new FormData()
  choice.set('marketingEmailsOptIn', 'on')
  await act(anna, 'account/actions/updatePreferencesAction', choice)
  await act(anna, 'wishlist/actions/addToWishlistAction', 'product-1')
  const hers = profileOf(anna)
  if (hers.name !== 'Anna Changed' || hers.marketingEmailsOptIn !== true || hers.wishlist?.[0]?._ref !== 'product-1') throw new Error('control: Anna\'s own changes did not land in her profile')
  return plain(profileOf(ben)) === before ? null : 'Ben\'s profile changed after Anna\'s requests'
})
