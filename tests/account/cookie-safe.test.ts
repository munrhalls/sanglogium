// Is Anna's session cookie hidden from page scripts, sent only over https, and
// kept from other sites' requests?
//
// Cannot lie: The proof reads the Set-Cookie line the shop really sends at
// sign-in on its https address.

import { prove, customer } from './shop.test.ts'

prove('Is Anna\'s session cookie hidden from page scripts, sent only over https, and kept from other sites\' requests?', 'yes', async () => {
  const anna = await customer('anna', { signIn: false })
  const answer = await anna.signIn()
  if (answer.status !== 200 || !answer.setCookie.length) throw new Error('control: sign-in set no cookie')
  const session = answer.setCookie.filter((line) => /session_token=/.test(line))
  if (!session.length) throw new Error('control: no session cookie was set')
  const weak = []
  for (const line of answer.setCookie) {
    const name = line.split('=')[0]
    if (!/;\s*HttpOnly/i.test(line)) weak.push(`${name} can be read by page scripts`)
    if (!/;\s*Secure/i.test(line)) weak.push(`${name} can travel over plain http`)
    if (!/;\s*SameSite=(Lax|Strict)/i.test(line)) weak.push(`${name} goes along with other sites' requests`)
  }
  return weak.length ? weak.join('; ') : null
})
