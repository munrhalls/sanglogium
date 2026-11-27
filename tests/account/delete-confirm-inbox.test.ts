// Does deleting Anna's account wait for a link opened from her own inbox, and
// does that email say it cannot be undone?
//
// Cannot lie: The account still exists after the request; it is gone only
// after the proof opens the inbox link.

import { prove, customer, askToDelete, openDeleteLink, mailFor, userRow } from './shop.test.ts'

prove('Does deleting Anna\'s account wait for a link opened from her own inbox, and does that email say it cannot be undone?', 'yes', async () => {
  const anna = await customer('anna')
  const { asked, link } = await askToDelete(anna)
  if (asked.status !== 200) throw new Error(`control: asking to delete answered ${asked.status}`)
  if (!(await userRow(anna.email))) return 'her account was gone before she opened any link'
  if (!link) return 'no confirmation email reached her inbox'
  if (!/cannot be undone/i.test(mailFor(anna.email, 'deletion').html)) return 'the email does not say it cannot be undone'
  await openDeleteLink(anna, link)
  if (await userRow(anna.email)) throw new Error('control: opening the link did not delete her account')
  return null
})
