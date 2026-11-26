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

import { marksAre, nothingTaken, orderCountIs, orderMatches, stockExplained } from './books.mjs'
import { ORDER_DELIVERY, SHORT, checkEvery, filledShelves, removedProducts, shortShelves } from './domain.mjs'
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
  return payment({ id, amount: situation.amount, basket: situation.basket, shipping: 0, status: 'succeeded', unitPrices: `c:${situation.unit}` })
}

export async function twoCustomers(situation) {
  fresh()
  seedProduct({ id: 'c', unit: situation.unit, stock: situation.stock })
  const first = paid('pi_c1', situation)
  const second = paid('pi_c2', situation)
  await bankNotice(first)
  await bankNotice(second)
  const line = lineFor(situation)
  return orderMatches('pi_c1', situation.amount, 'pln', line, 0, ORDER_DELIVERY)
    ?? orderMatches('pi_c2', situation.amount, 'pln', line, 0, ORDER_DELIVERY)
    ?? stockExplained({ c: situation.stock })
    ?? marksAre(['pi_c1', 'pi_c2'], situation.marks)
    ?? orderCountIs(situation.buyers)
}

export async function shortShelf(situation) {
  fresh()
  seedProduct({ id: 'c', unit: situation.unit, stock: situation.stock })
  const line = lineFor(situation)
  const first = paid('pi_c1', situation)
  if (situation.buyers === 1) {
    await bankNotice(first)
    return orderMatches('pi_c1', situation.amount, 'pln', line, 0, ORDER_DELIVERY)
      ?? stockExplained({ c: situation.stock })
      ?? marksAre(['pi_c1'], situation.marks)
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
  return orderMatches('pi_c1', situation.amount, 'pln', line, 0, ORDER_DELIVERY)
    ?? orderMatches('pi_c2', situation.amount, 'pln', line, 0, ORDER_DELIVERY)
    ?? stockExplained({ c: situation.stock })
    ?? marksAre(['pi_c1', 'pi_c2'], situation.marks)
    ?? orderCountIs(situation.buyers)
}

// The product is never put on the shelf: it was removed after the payment.
export async function removedProduct(situation) {
  fresh()
  await bankNotice(paid('pi_c1', situation))
  return orderMatches('pi_c1', situation.amount, 'pln', lineFor(situation), 0, ORDER_DELIVERY)
    ?? nothingTaken('pi_c1')
    ?? marksAre(['pi_c1'], [SHORT])
    ?? orderCountIs(1)
}

export const cases = [
  ['Every pair of payments the shelf can fill takes exactly the units they paid for, and neither is marked short of stock', () => checkEvery(filledShelves, twoCustomers)],
  ['Every payment for units the shelf does not have is marked short of stock, and its lines record the missing units', () => checkEvery(shortShelves, shortShelf)],
  ['A payment for a product removed from the shop is still written, marked short of stock', () => checkEvery(removedProducts, removedProduct)],
]
