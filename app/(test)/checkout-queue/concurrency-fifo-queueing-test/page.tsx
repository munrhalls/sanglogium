// Test page: http://localhost:3000/checkout-queue/concurrency-fifo-queueing-test
//
// Server component that uses test products from Sanity test dataset
// and passes them to client component for interactive testing.

import { getTestProducts } from '@/tests/helpers/sanity-test-products'
import CheckoutQueueTestClient from './CheckoutQueueTestClient'

export const dynamic = 'force-dynamic'

export default async function CheckoutQueueE2ETestPage() {
  const testProducts = await getTestProducts()

  const productsForClient = testProducts.map((product: { _id: string; price_data: { currency: string; unit_amount: number } }) => ({
    _id: product._id,
    price_data: product.price_data,
  }))

  return <CheckoutQueueTestClient testProducts={productsForClient} />
}
