// From one place, is the sixth password try in 15 minutes and the fourth
// two-factor try in 10 seconds refused, even when it is right?
//
// Cannot lie: The last try uses the right password or code, so a refusal can
// only come from the limit.

import { prove, customer, Browser, turnOnTwoFactor } from './shop.test.ts'

prove('From one place, is the sixth password try in 15 minutes and the fourth two-factor try in 10 seconds refused, even when it is right?', 'yes', async () => {
  const anna = await customer('anna', { signIn: false })
  const tom = new Browser('tom')
  for (let i = 0; i < 5; i += 1) await tom.send('/sign-in/email', { body: { email: anna.email, password: `wrong-guess-${i}` } })
  if ((await tom.send('/sign-in/email', { body: { email: anna.email, password: anna.password } })).status === 200) return 'the sixth password try in 15 minutes signed in'
  const ben = await customer('ben')
  const { problem } = await turnOnTwoFactor(ben)
  if (problem) throw new Error(`control: ${problem}`)
  const thief = new Browser('tom-2')
  const first = await thief.send('/sign-in/email', { body: { email: ben.email, password: ben.password } })
  if (first.status !== 200 || !first.json?.twoFactorRedirect) throw new Error('control: the password step did not ask for a code')
  const right = await ben.code()
  const wrong = (n) => String((Number(right) + n) % 1000000).padStart(6, '0')
  for (let i = 1; i <= 3; i += 1) await thief.send('/two-factor/verify-totp', { body: { code: wrong(i) } })
  await thief.send('/two-factor/verify-totp', { body: { code: right } })
  return (await thief.session()) ? 'the fourth code in 10 seconds got in' : null
})
