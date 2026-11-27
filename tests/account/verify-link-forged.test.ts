// Can someone make a working verification link for Anna's email without the
// shop's secret?
//
// Cannot lie: The forged link is built exactly like the shop's but signed with
// another secret; the shop's own link works in the same run.

import { prove, customer, Browser, linkFor, openVerifyLink, verified, userRow } from './shop.test.ts'

prove('Can someone make a working verification link for Anna\'s email without the shop\'s secret?', 'no', async () => {
  const anna = await customer('anna', { verify: false, signIn: false })
  const { SignJWT } = await import('jose')
  const otherSecret = new TextEncoder().encode('a-secret-that-is-not-the-shops-0123456789')
  const signed = await new SignJWT({ email: anna.email }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('1h').sign(otherSecret)
  const part = (value) => Buffer.from(JSON.stringify(value)).toString('base64url')
  const unsigned = `${part({ alg: 'none', typ: 'JWT' })}.${part({ email: anna.email, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600 })}.`
  for (const [what, token] of [['signed with another secret', signed], ['with no signature', unsigned]]) {
    const answer = await openVerifyLink(new Browser('sam'), `https://shop.example/verify-email?token=${token}`)
    if (verified(answer) || (await userRow(anna.email)).emailVerified) return `a link ${what} verified her email`
  }
  if (!verified(await openVerifyLink(anna, linkFor(anna.email, 'Verify')))) throw new Error('control: the shop\'s own link did not work')
  return null
})
