// After Anna resets her password or signs out everywhere, does Tom's copy of
// her session stop opening her account at once?
//
// Cannot lie: Tom's copy opens Anna's orders a moment before; the proof asks
// again right after, with no clock change.

import { prove, customer, letsIn, Browser, askForReset, resetWith, linkFor } from './shop.test.ts'

prove('After Anna resets her password or signs out everywhere, does Tom\'s copy of her session stop opening her account at once?', 'yes', async () => {
  const anna = await customer('anna')
  const tom = anna.copyTo('tom')
  if (!(await letsIn(tom, anna.userId))) throw new Error('control: the copied cookie did not open her account')
  const desk = new Browser('anna-laptop')
  await askForReset(desk, anna.email)
  const reset = await resetWith(desk, linkFor(anna.email, 'Reset'), 'anna-new-password-2')
  if (reset.status !== 200) throw new Error(`control: the reset answered ${reset.status}`)
  const afterReset = await letsIn(tom, anna.userId)
  if (afterReset) return `right after her password reset, Tom's copy still opened ${afterReset}`
  const ben = await customer('ben')
  const thief = ben.copyTo('tom')
  if (!(await letsIn(thief, ben.userId))) throw new Error('control: the copy of Ben\'s cookie did not open his account')
  const everywhere = await ben.send('/revoke-sessions', { body: {} })
  if (everywhere.status !== 200) throw new Error(`control: signing out everywhere answered ${everywhere.status}`)
  const afterAll = await letsIn(thief, ben.userId)
  return afterAll ? `right after signing out everywhere, the copy still opened ${afterAll}` : null
})
