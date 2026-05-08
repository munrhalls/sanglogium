// Test page: http://localhost:3000/checkout-queue/concurrency-fifo-queueing-test
//
// Server component that uses test products from Sanity test dataset
// and passes them to client component for interactive testing.
//
// This page is isolated from production via:
// 1. Environment guard (only renders in development)
// 2. Separate layout (avoids production layout dependencies)
// 3. Test-only dependencies (no production component imports)

import { getTestProducts } from '@/tests/helpers/sanity-test-products'
import CheckoutQueueTestClient from './CheckoutQueueTestClient'

export const dynamic = 'force-dynamic'

export default async function CheckoutQueueE2ETestPage() {
  // Environment guard: only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const testProducts = await getTestProducts()

  const productsForClient = testProducts.map((product: { _id: string; price_data: { currency: string; unit_amount: number } }) => ({
    _id: product._id,
    price_data: product.price_data,
  }))

  return <CheckoutQueueTestClient testProducts={productsForClient} />
}
