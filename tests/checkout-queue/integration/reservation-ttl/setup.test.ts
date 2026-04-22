// Setup verification tests for reservation TTL functionality
// Verifies infrastructure is ready before running feature tests

import { describe, it, expect, beforeAll } from 'vitest'
import { fetch } from 'undici'
import { getTestProducts } from '@/tests/helpers/test-data'
import { createClient } from 'next-sanity'
import { apiVersion, projectId, dataset } from '@/sanity/env'

const BASE = process.env.QUEUE_TEST_BASE_URL || 'http://localhost:3000'

// Read client for querying test dataset
const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
})

describe('Reservation TTL - Setup Verification', () => {
  beforeAll(async () => {
    // Check if queue is active and available for tests
    const res = await fetch(`${BASE}/api/checkout-queue`, { method: 'OPTIONS' }).catch(() => null)
    if (!res) throw new Error(`Dev server not running at ${BASE}. Run 'npm run dev' first.`)
  })

  it('dev server is running and queue endpoint responds', async () => {
    const res = await fetch(`${BASE}/api/checkout-queue`, { method: 'OPTIONS' })
    expect(res.status).toBe(204)
  })

  it('Sanity client can connect to test dataset', async () => {
    const products = await getTestProducts()
    expect(Array.isArray(products)).toBe(true)
    expect(products.length).toBeGreaterThan(0)
  })

  it('test dataset has products with required fields', async () => {
    const products = await getTestProducts()
    const firstProduct = products[0]
    expect(firstProduct._id).toBeDefined()
    expect(firstProduct.stripePriceId).toBeDefined()
    expect(firstProduct.displayPrice).toBeDefined()
    expect(firstProduct.stock).toBeDefined()
  })
})
