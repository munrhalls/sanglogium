// Right after signing in, can Anna change her password, change her email, turn
// two-factor on and delete her account from the account page?
//
// Cannot lie: The proof runs the real account page sections in a stand-in
// browser and clicks their buttons; it checks each change landed in the
// stand-in database.

import { prove, customer, showScreen, linkFor, openDeleteLink, userRow, SHOP } from './shop.test.ts'
import { rows } from './stand-ins/database.mjs'

async function accountPage(anna) {
  const React = await import('react')
  const { default: AccountActions } = await import('@/features/account/ui/AccountActions')
  return React.createElement(AccountActions, { name: 'Anna', email: anna.email, twoFactorEnabled: false })
}
const password = async (anna) => (await rows('account')).find((row) => row.userId === anna.userId && row.providerId === 'credential')?.password

prove('Right after signing in, can Anna change her password, change her email, turn two-factor on and delete her account from the account page?', 'yes', async () => {
  const anna = await customer('anna')
  const page = await showScreen(anna, { path: '/account', load: () => accountPage(anna) })
  const toSignIn = () => page.went.some((to) => new URL(to, SHOP).pathname === '/sign-in')
  const before = await password(anna)
  await page.type('#currentPassword', anna.password)
  await page.type('#newPassword', 'anna-new-password-2')
  await page.type('#confirmPassword', 'anna-new-password-2')
  await page.click('Change Password')
  if (toSignIn()) return 'the Change Password button sent her to sign in again, though she had just signed in'
  if ((await password(anna)) === before) return 'Change Password did not change her password'
  anna.password = 'anna-new-password-2'
  await page.type('#newEmail', 'anna-new@example.com')
  await page.click('Change Email')
  if (toSignIn()) return 'the Change Email button sent her to sign in again, though she had just signed in'
  if (!linkFor('anna-new@example.com', 'Verify')) return 'Change Email sent no confirmation link'
  await page.click('Set up 2FA')
  await page.type('#setupPassword', anna.password)
  await page.click('Generate QR')
  const uri = anna.told?.['/two-factor/enable']?.totpURI
  if (!uri) return `turning two-factor on stopped at the password step${toSignIn() ? ' and sent her to sign in' : ''}`
  const { createOTP } = await import('@better-auth/utils/otp')
  const { base32 } = await import('@better-auth/utils/base32')
  const secret = new TextDecoder().decode(base32.decode(new URL(uri).searchParams.get('secret')))
  await page.type('#totpCode', await createOTP(secret, { digits: 6, period: 30 }).totp())
  await page.click('Enable 2FA')
  if (!(await userRow(anna.email)).twoFactorEnabled) return 'Enable 2FA did not turn two-factor on'
  await page.click('Delete my account')
  if (toSignIn()) return 'the Delete button sent her to sign in again, though she had just signed in'
  await page.type('input[name="password"]', anna.password)
  await page.click('Delete account')
  const link = linkFor(anna.email, 'deletion')
  if (!link) return 'Delete account sent no confirmation link'
  page.close()
  await openDeleteLink(anna, link)
  if (await userRow(anna.email)) return 'after the page, the link in her email did not delete her account in the same browser'
  return null
})
