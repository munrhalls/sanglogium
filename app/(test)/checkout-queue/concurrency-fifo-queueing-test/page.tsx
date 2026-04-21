// Test page: http://localhost:3000/checkout-queue/concurrency-fifo-queueing-test
//
// Server component that uses test products from Sanity test dataset
// and passes them to client component for interactive testing.

import { TEST_PRODUCTS } from '@/tests/helpers/test-data'
import CheckoutQueueTestClient from './CheckoutQueueTestClient'

export default function CheckoutQueueE2ETestPage() {
  // Use typed test products constant (products exist in Sanity test dataset)
  const productsForClient = TEST_PRODUCTS.map((product) => ({
    _id: product._id,
    stripePriceId: product.stripePriceId,
    displayPrice: product.displayPrice,
  }))

  return <CheckoutQueueTestClient testProducts={productsForClient} />
}
