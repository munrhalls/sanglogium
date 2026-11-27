// If the email service is down when Anna signs up, can she later get a new
// link and finish?
//
// Cannot lie: The stand-in email service fails the first send for real, and
// the proof finishes using only what the sign-in screen offers.

import { prove, Browser, linkFor, openVerifyLink, verified, outbox } from './shop.test.ts'

prove('If the email service is down when Anna signs up, can she later get a new link and finish?', 'yes', async () => {
  outbox.failures = 1
  const anna = new Browser('anna')
  const body = { name: 'Anna', email: 'anna@example.com', password: 'anna-password-1' }
  const signUp = await anna.send('/sign-up/email', { body })
  if (signUp.status !== 200) return `the sign-up screen answered ${signUp.status}`
  if (linkFor(body.email, 'Verify')) throw new Error('control: the email went out although the service was down')
  const tryIn = await anna.send('/sign-in/email', { body: { email: body.email, password: body.password } })
  if (tryIn.json?.code !== 'EMAIL_NOT_VERIFIED') return `sign-in did not say her email is unverified (${tryIn.status}), so the screen offers no new link`
  const resent = await anna.send('/send-verification-email', { body: { email: body.email, callbackURL: '/sign-in?verified=true' } })
  if (resent.status !== 200) return `asking for a new link answered ${resent.status}`
  const link = linkFor(body.email, 'Verify')
  if (!link) return 'no new link arrived'
  if (!verified(await openVerifyLink(anna, link))) return 'the new link was refused'
  const done = await anna.send('/sign-in/email', { body: { email: body.email, password: body.password } })
  return done.status === 200 ? null : `sign-in afterwards answered ${done.status}`
})
