// Can Anna change or remove Ben's saved address?
//
// Cannot lie: The proof uses Ben's real address key; Ben removing it himself
// works in the same run.

import { prove, customer, act, addressForm } from './shop.test.ts'
import { all } from './stand-ins/sanity.mjs'

prove('Can Anna change or remove Ben\'s saved address?', 'no', async () => {
  const anna = await customer('anna')
  const ben = await customer('ben')
  await act(ben, 'account/actions/addAddressAction', addressForm('Ben Street'))
  const bensProfile = () => all('userProfile').find((doc) => doc.authId === ben.userId)
  const before = bensProfile().addresses ?? []
  if (before.length !== 1) throw new Error('control: Ben\'s address was not saved')
  const key = before[0]._key
  await act(anna, 'account/actions/updateAddressAction', key, addressForm('Anna Street'))
  await act(anna, 'account/actions/removeAddressAction', key)
  const after = bensProfile().addresses ?? []
  if (JSON.stringify(after) !== JSON.stringify(before)) return 'Ben\'s saved address changed after Anna\'s requests'
  await act(ben, 'account/actions/removeAddressAction', key)
  if ((bensProfile().addresses ?? []).length !== 0) throw new Error('control: Ben could not remove his own address')
  return null
})
