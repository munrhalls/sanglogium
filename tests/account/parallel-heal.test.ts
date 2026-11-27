// If Anna opens two account pages at the same moment while her profile is
// missing, does she end up with exactly one profile?
//
// Cannot lie: Both page loads start before either finishes, and the proof
// counts profiles with Anna's account number.

import { prove, customer, openPage } from './shop.test.ts'
import { all, outage, wire } from './stand-ins/sanity.mjs'

prove('If Anna opens two account pages at the same moment while her profile is missing, does she end up with exactly one profile?', 'yes', async () => {
  outage.writes = () => true
  const anna = await customer('anna')
  outage.writes = null
  const profiles = () => all('userProfile').filter((doc) => doc.authId === anna.userId)
  if (profiles().length !== 0) throw new Error('control: the profile was written although Sanity was down')
  await import('@/app/(store)/account/orders/page')
  await import('@/app/(store)/account/addresses/page')
  wire.delayMs = 20
  await Promise.all([openPage(anna, 'orders'), openPage(anna, 'addresses')])
  const count = profiles().length
  return count === 1 ? null : `she ended up with ${count} profiles`
})
