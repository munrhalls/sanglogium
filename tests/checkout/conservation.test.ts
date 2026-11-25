// Conservation.
//
// Do the orders and the stock, read together, explain every unit?
// Stock does not go negative. One payment does not move stock twice.
// When a paid unit was not on the shelf, the order itself says so.
//
// Each sentence is a property. It is checked for every situation in its
// list, in tests/checkout/domain.mjs. The amounts are the numbers written
// there. A PASS means every situation's paperwork explained the units.
// A NO names the smallest situation that did not.

import { orderCountIs, orderMatches, stockExplained } from './books.mjs'
import { checkEvery, filledShelves, shortShelves } from './domain.mjs'
import {
  bankNotice,
  fresh,
  pauseCommits,
  payment,
  resumeCommits,
  seedProduct,
  waitForCommits,
} from './shop.test.ts'

export const question = 'Conservation'

function lineFor(situation) {
  return [{ productId: 'c', quantity: situation.qty, unit: situation.unit }]
}

function paid(id, situation) {
  return payment({ id, amount: situation.amount, basket: situation.basket, shipping: 0, status: 'succeeded' })
}

export async function twoCustomers(situation) {
  fresh()
  seedProduct({ id: 'c', unit: situation.unit, stock: situation.stock })
  const first = paid('pi_c1', situation)
  const second = paid('pi_c2', situation)
  await bankNotice(first)
  await bankNotice(second)
  const line = lineFor(situation)
  return orderMatches('pi_c1', situation.amount, 'pln', line, 0)
    ?? orderMatches('pi_c2', situation.amount, 'pln', line, 0)
    ?? stockExplained({ c: situation.stock })
    ?? orderCountIs(situation.buyers)
}

export async function shortShelf(situation) {
  fresh()
  seedProduct({ id: 'c', unit: situation.unit, stock: situation.stock })
  const line = lineFor(situation)
  const first = paid('pi_c1', situation)
  if (situation.buyers === 1) {
    await bankNotice(first)
    return orderMatches('pi_c1', situation.amount, 'pln', line, 0)
      ?? stockExplained({ c: situation.stock })
      ?? orderCountIs(situation.buyers)
  }
  const second = paid('pi_c2', situation)
  pauseCommits()
  const left = bankNotice(first)
  await waitForCommits(1)
  const right = bankNotice(second)
  await waitForCommits(2)
  resumeCommits()
  await left
  await right
  await bankNotice(second)
  return orderMatches('pi_c1', situation.amount, 'pln', line, 0)
    ?? orderMatches('pi_c2', situation.amount, 'pln', line, 0)
    ?? stockExplained({ c: situation.stock })
    ?? orderCountIs(situation.buyers)
}

export const cases = [
  ['Every pair of payments the shelf can fill takes exactly the units they paid for', () => checkEvery(filledShelves, twoCustomers)],
  ['Every payment for units the shelf does not have leaves a record of those units', () => checkEvery(shortShelves, shortShelf)],
]
