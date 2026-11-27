// If two sign-ups for Anna's email arrive at the same moment, is only one
// account made?
//
// Cannot lie: Both sign-ups are sent before either answer is read, and the
// proof counts accounts in the stand-in database.

import { prove, Browser } from './shop.test.ts'
import { rows } from './stand-ins/database.mjs'
import { all } from './stand-ins/sanity.mjs'

prove('If two sign-ups for Anna\'s email arrive at the same moment, is only one account made?', 'yes', async () => {
  const one = new Browser('anna-phone')
  const two = new Browser('anna-laptop')
  const body = { name: 'Anna', email: 'anna@example.com', password: 'anna-password-1' }
  await Promise.allSettled([one.send('/sign-up/email', { body }), two.send('/sign-up/email', { body })])
  const accounts = (await rows('user')).filter((row) => row.email === 'anna@example.com')
  if (accounts.length === 0) throw new Error('control: neither sign-up made an account')
  const profiles = all('userProfile').filter((doc) => doc.email === 'anna@example.com')
  if (accounts.length !== 1) return `${accounts.length} accounts were made`
  if (profiles.length !== 1) return `${profiles.length} profiles were made in Sanity`
  return null
})
