// After Anna changes her password on the account page, does Tom's copy of her
// session stop opening her account at once?
//
// Cannot lie: Tom's copy opens her account a moment before; the change is made
// through the real account page in a stand-in browser.

import { prove, customer, letsIn, showScreen } from './shop.test.ts'
import { rows } from './stand-ins/database.mjs'

async function accountPage(anna) {
  const React = await import('react')
  const { default: AccountActions } = await import('@/features/account/ui/AccountActions')
  return React.createElement(AccountActions, { name: 'Anna', email: anna.email, twoFactorEnabled: false })
}
const password = async (anna) => (await rows('account')).find((row) => row.userId === anna.userId && row.providerId === 'credential')?.password

prove('After Anna changes her password on the account page, does Tom\'s copy of her session stop opening her account at once?', 'yes', async () => {
  const anna = await customer('anna')
  const tom = anna.copyTo('tom')
  if (!(await letsIn(tom, anna.userId))) throw new Error('control: the copied cookie did not open her account')
  const before = await password(anna)
  const page = await showScreen(anna, { path: '/account', load: () => accountPage(anna) })
  await page.type('#currentPassword', anna.password)
  await page.type('#newPassword', 'anna-new-password-2')
  await page.type('#confirmPassword', 'anna-new-password-2')
  await page.click('Change Password')
  page.close()
  if ((await password(anna)) === before) throw new Error('control: the page did not change her password')
  const still = await letsIn(tom, anna.userId)
  return still ? `right after her password change, Tom's copy still opened ${still}` : null
})
