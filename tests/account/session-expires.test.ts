// After a week with no visits, does Anna's session stop opening her account?
//
// Cannot lie: The proof clock moves 7 days and 1 minute; at 6 days and 23
// hours the same session still works.

import { prove, customer, letsIn } from './shop.test.ts'
import { clock, days, hours, minutes } from './stand-ins/world.mjs'

prove('After a week with no visits, does Anna\'s session stop opening her account?', 'yes', async () => {
  const anna = await customer('anna')
  const ben = await customer('ben')
  clock.forward(days(6) + hours(23))
  if (!(await letsIn(ben, ben.userId))) throw new Error('control: at 6 days and 23 hours the session no longer worked')
  clock.forward(hours(1) + minutes(1))
  const still = await letsIn(anna, anna.userId)
  return still ? `after 7 days and 1 minute without a visit, her session still opened ${still}` : null
})
