// If Anna has an order still being fulfilled, is her deletion refused and her
// account left whole?
//
// Cannot lie: Each open status is tried; with only delivered orders the same
// deletion goes through.

import { prove, customer, order, askToDelete, openDeleteLink, userRow } from './shop.test.ts'
import { readFileSync } from 'node:fs'
import { all } from './stand-ins/sanity.mjs'

// Finished means nothing more will be sent or paid back. Every other status the order schema allows is still being fulfilled.
const FINISHED = ['delivered', 'cancelled', 'refunded', 'failed']
const schema = readFileSync(new URL('../../features/order/schema/orderType.ts', import.meta.url), 'utf8')
const block = schema.slice(schema.indexOf('name: "status"'), schema.indexOf(']', schema.indexOf('name: "status"')))
const OPEN = [...block.matchAll(/value: "([a-z_]+)"/g)].map((match) => match[1]).filter((status) => !FINISHED.includes(status))

prove('If Anna has an order still being fulfilled, is her deletion refused and her account left whole?', 'yes', async () => {
  if (OPEN.length < 5) throw new Error(`control: only ${OPEN.length} open statuses were read from the order schema`)
  const names = ['anna', 'ben', 'cara', 'dan', 'eve', 'fay', 'gus', 'hal']
  for (const [index, status] of OPEN.entries()) {
    const who = await customer(names[index])
    const doc = order(who, { status })
    const { link } = await askToDelete(who)
    if (link) await openDeleteLink(who, link)
    const kept = all('order').find((o) => o._id === doc._id)
    const profile = all('userProfile').find((p) => p.authId === who.userId)
    if (!(await userRow(who.email)) || !profile || kept?.userId !== who.userId) return `with an order ${status.replace(/_/g, ' ')}, her account was deleted or changed`
  }
  const zoe = await customer('zoe')
  order(zoe)
  await openDeleteLink(zoe, (await askToDelete(zoe)).link)
  if (await userRow(zoe.email)) throw new Error('control: with only a delivered order the deletion did not go through')
  return null
})
