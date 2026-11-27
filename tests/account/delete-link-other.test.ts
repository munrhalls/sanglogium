// Can anyone other than signed-in Anna use her delete link?
//
// Cannot lie: The link is real and unexpired; Anna using it afterwards does
// delete her account.

import { prove, customer, Browser, askToDelete, openDeleteLink, userRow } from './shop.test.ts'

prove('Can anyone other than signed-in Anna use her delete link?', 'no', async () => {
  const anna = await customer('anna')
  const ben = await customer('ben')
  const { link } = await askToDelete(anna)
  if (!link) throw new Error('control: no delete link arrived')
  await openDeleteLink(new Browser('sam'), link)
  if (!(await userRow(anna.email))) return 'a browser with no sign-in deleted her account'
  await openDeleteLink(ben, link)
  if (!(await userRow(anna.email))) return 'Ben, signed in as himself, deleted her account'
  if (!(await userRow(ben.email))) return 'her link deleted Ben\'s account'
  await openDeleteLink(anna, link)
  if (await userRow(anna.email)) throw new Error('control: Anna herself could not use her link')
  return null
})
