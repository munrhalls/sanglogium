// Can a link to the shop send Anna to another website after she signs in,
// verifies or deletes?
//
// Cannot lie: The proof runs the real sign-in form in a stand-in browser and
// records where it goes; a normal shop return address is followed in the same
// run.

import { prove, customer, Browser, showScreen, linkFor, askForReset, askToDelete, SHOP } from './shop.test.ts'
const foreign = (to) => Boolean(to) && new URL(to, SHOP).origin !== SHOP
async function signInScreen() {
  const React = await import('react')
  const { default: SignInForm } = await import('@/features/auth/ui/SignInForm')
  return React.createElement(SignInForm)
}

prove('Can a link to the shop send Anna to another website after she signs in, verifies or deletes?', 'no', async () => {
  const anna = await customer('anna', { signIn: false })
  let n = 0
  for (const returnTo of ['/account/orders', '//evil.example/account', '/\\evil.example/account', 'https://evil.example/account', '/\t/evil.example/account']) {
    const browser = new Browser(`anna-${(n += 1)}`)
    const screen = await showScreen(browser, { path: `/sign-in?returnTo=${encodeURIComponent(returnTo)}`, load: signInScreen })
    await screen.type('input[name="email"]', anna.email)
    await screen.type('input[name="password"]', anna.password)
    await screen.click('Sign In')
    const went = [...screen.went]
    screen.close()
    if (returnTo === '/account/orders') {
      if (!went.includes('/account/orders')) throw new Error(`control: a shop return address was not followed (${went.join(' ') || 'nowhere'})`)
      continue
    }
    const away = went.find(foreign)
    if (away) return `after signing in from a link with returnTo=${returnTo}, the sign-in screen sent her to ${new URL(away, SHOP).host}`
  }
  const sam = await customer('sam', { verify: false, signIn: false })
  const verifyToken = new URL(linkFor(sam.email, 'Verify')).searchParams.get('token')
  const verify = await new Browser('anna-v').send('/verify-email', { method: 'GET', origin: null, query: { token: verifyToken, callbackURL: 'https://evil.example/' } })
  if (foreign(verify.location)) return 'a verify link carrying a foreign return address sent the browser to evil.example'
  await askForReset(sam, sam.email)
  const resetToken = new URL(linkFor(sam.email, 'Reset')).searchParams.get('token')
  const reset = await new Browser('anna-r').send(`/reset-password/${resetToken}`, { method: 'GET', origin: null, query: { callbackURL: 'https://evil.example/' } })
  if (foreign(reset.location)) return 'a reset link carrying a foreign return address sent the browser to evil.example'
  const ben = await customer('ben')
  const { link } = await askToDelete(ben)
  const crafted = new URL(link)
  crafted.searchParams.set('callbackURL', 'https://evil.example/')
  const query = Object.fromEntries(crafted.searchParams)
  const done = await ben.send('/delete-user/callback', { method: 'GET', origin: null, query })
  if (foreign(done.location)) return 'a delete link carrying a foreign return address sent the browser to evil.example'
  return null
})
