// After Anna's account is deleted, is anything of hers left in either store,
// apart from her orders?
//
// Cannot lie: The proof searches every row and document for Anna's account
// number, email and name; Ben's remain as a control.

import { prove, customer, order, askToDelete, openDeleteLink, userRow, turnOnTwoFactor, act, addressForm } from './shop.test.ts'
import { rows, tables } from './stand-ins/database.mjs'
import { all, put } from './stand-ins/sanity.mjs'

prove('After Anna\'s account is deleted, is anything of hers left in either store, apart from her orders?', 'no', async () => {
  put({ _id: 'product-1', _type: 'product', name: 'Proof Product' })
  const anna = await customer('anna')
  const ben = await customer('ben')
  await act(anna, 'account/actions/addAddressAction', addressForm('Anna Street'))
  await act(anna, 'wishlist/actions/addToWishlistAction', 'product-1')
  order(anna)
  const { problem } = await turnOnTwoFactor(anna)
  if (problem) throw new Error(`control: ${problem}`)
  await openDeleteLink(anna, (await askToDelete(anna)).link)
  if (await userRow(anna.email)) throw new Error('control: her account was not deleted')
  if (!(await userRow(ben.email))) throw new Error('control: Ben\'s account went too')
  const marks = [anna.userId, anna.email, 'Anna Street']
  const left = []
  for (const table of await tables()) for (const row of await rows(table)) if (marks.some((mark) => JSON.stringify(row).includes(mark))) left.push(`a row in the ${table} table`)
  for (const doc of all()) if (doc._type !== 'order' && marks.some((mark) => JSON.stringify(doc).includes(mark))) left.push(`a ${doc._type} document`)
  return left.length ? `left behind: ${[...new Set(left)].join(', ')}` : null
})
