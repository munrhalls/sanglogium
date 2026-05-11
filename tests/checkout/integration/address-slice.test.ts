import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { createClient } from 'next-sanity'
import { apiVersion, projectId, dataset } from '../../../sanity-cms/env'
import { submitShippingAction } from '../../../app/actions/address/address'
import { testAddresses } from '../test-data/test-addresses'

const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE || process.env.SANITY_STUDIO_READ_WRITE_CREATE,
})

const readClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
})

describe('Address Slice Integration', () => {
  let reservationId: string

  beforeEach(async () => {
    // Create a test basket reservation
    const reservation = await writeClient.create({
      _type: 'basketReservation',
      basketReservation: [
        {
          _id: 'test-product-id',
          quantity: 1,
          verifiedPrice: 100,
        },
      ],
      createdAt: new Date().toISOString(),
    })
    reservationId = reservation._id
  })

  afterEach(async () => {
    try {
      await writeClient.delete(reservationId)
    } catch {
      // Reservation may have been deleted already
    }
  })

  test('happy path: validate address via Google API, save to reservation via PATCH', async () => {
    const address = testAddresses.poland

    // Step 1: Call submitShippingAction with valid test address
    const validation = await submitShippingAction(address)

    // Step 2: Assert ACCEPT status + corrected address
    expect(validation.status).toBe('ACCEPT')
    expect(validation.address).toBeDefined()
    expect(validation.address).toMatchObject({
      street: expect.any(String),
      streetNumber: expect.any(String),
      city: expect.any(String),
      postalCode: expect.any(String),
      regionCode: expect.any(String),
    })

    // Step 3: Call PATCH endpoint with corrected address
    // Note: Requires dev server running on localhost:3000
    const patchRes = await fetch(`http://localhost:3000/api/basket-reservations/${reservationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shippingAddress: validation.address }),
    })

    expect(patchRes.ok).toBe(true)

    // Step 4: Query Sanity and assert shippingAddress matches
    const doc = await readClient.fetch(
      `*[_type == "basketReservation" && _id == $id][0]{_id, shippingAddress}`,
      { id: reservationId }
    )

    expect(doc).not.toBeNull()
    expect(doc!._id).toBe(reservationId)
    expect(doc!.shippingAddress).toBeDefined()
    expect(doc!.shippingAddress).toMatchObject({
      street: validation.address.street,
      streetNumber: validation.address.streetNumber,
      city: validation.address.city,
      postalCode: validation.address.postalCode,
      regionCode: validation.address.regionCode,
    })
  })
})
