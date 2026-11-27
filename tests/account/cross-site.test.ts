// Can another website make Anna's signed-in browser change her email or delete
// her account?
//
// Cannot lie: The proof sends Anna's real cookie with a foreign Origin; the
// same request from the shop's own origin is accepted, so a refusal comes from
// the origin.

import { prove, customer } from './shop.test.ts'

prove('Can another website make Anna\'s signed-in browser change her email or delete her account?', 'no', async () => {
  const anna = await customer('anna')
  const foreign = 'https://evil.example'
  const done = []
  const email = await anna.send('/change-email', { origin: foreign, body: { newEmail: 'tom@example.com', callbackURL: '/account' } })
  if (email.status === 200) done.push('changed her email')
  const del = await anna.send('/delete-user', { origin: foreign, body: { password: anna.password } })
  if (del.status === 200) done.push('started deleting her account')
  if (done.length) return `a request from ${foreign} ${done.join(' and ')}`
  const own = await anna.send('/change-email', { body: { newEmail: 'anna-new@example.com', callbackURL: '/account' } })
  if (own.status !== 200) throw new Error(`control: the same request from the shop itself answered ${own.status}`)
  return null
})
