// After Anna signs out, does a copy of her old session cookie stop opening her
// account at once?
//
// Cannot lie: Tom's copy opens Anna's account before she signs out, so a
// refusal afterwards comes from the sign-out.

import { prove, customer, letsIn } from './shop.test.ts'

prove('After Anna signs out, does a copy of her old session cookie stop opening her account at once?', 'yes', async () => {
  const anna = await customer('anna')
  const tom = anna.copyTo('tom')
  if (!(await letsIn(tom, anna.userId))) throw new Error('control: the copied cookie did not open her account before sign-out')
  const out = await anna.send('/sign-out', { body: {} })
  if (out.status !== 200) throw new Error(`control: sign-out answered ${out.status}`)
  const still = await letsIn(tom, anna.userId)
  return still ? `right after she signed out, the copy still opened ${still}` : null
})
