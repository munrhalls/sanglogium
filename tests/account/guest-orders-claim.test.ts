// Can Anna pull Ben's guest orders into her account without opening Ben's
// inbox?
//
// Cannot lie: Ben's guest order really exists under his email; Ben verifying
// that email pulls it into his account in the same run.

import { prove, customer, order, act } from './shop.test.ts'
import { all } from './stand-ins/sanity.mjs'

prove('Can Anna pull Ben\'s guest orders into her account without opening Ben\'s inbox?', 'no', async () => {
  const guest = order(null, { guestEmail: 'ben@example.com' })
  const anna = await customer('anna')
  await anna.send('/change-email', { body: { newEmail: 'ben@example.com', callbackURL: '/account' } })
  const name = new FormData()
  name.set('name', 'Anna Again')
  await act(anna, 'account/actions/updateNameAction', name)
  const now = () => all('order').find((doc) => doc._id === guest._id)
  if (now().userId === anna.userId) return 'Ben\'s guest order now belongs to her account'
  const ben = await customer('ben')
  if (now().userId !== ben.userId) throw new Error('control: Ben verifying his email did not bring his guest order in')
  return null
})
