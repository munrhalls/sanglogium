// If Sanity is down when Anna signs up, does she have exactly one profile once
// she opens her account after Sanity is back?
//
// Cannot lie: The stand-in Sanity refuses the real write during sign-up, and
// the proof counts profiles afterwards.

import { prove, customer, openPage } from './shop.test.ts'
import { all, outage } from './stand-ins/sanity.mjs'

prove('If Sanity is down when Anna signs up, does she have exactly one profile once she opens her account after Sanity is back?', 'yes', async () => {
  outage.writes = () => true
  const anna = await customer('anna')
  outage.writes = null
  const profiles = () => all('userProfile').filter((doc) => doc.authId === anna.userId)
  if (profiles().length !== 0) throw new Error('control: the profile was written although Sanity was down')
  await openPage(anna, 'orders')
  const count = profiles().length
  return count === 1 ? null : `after opening her account she has ${count} profiles`
})
