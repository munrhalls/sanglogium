import { describe, it, expect } from 'vitest'

describe('Shipping Rates Integration Tests (PL)', () => {
  const API_URL = 'http://localhost:3000/api/basket/shipping-rates'

  it('Case 1: Baseline (Small & Light)', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parcelData: [
          { length: 15, width: 10, height: 10, weight: 500 }
        ],
        countryCode: 'PL',
      }),
    })

    const data = await response.json()
    expect(response.ok).toBe(true)
    expect(data.rate).toBeDefined()
    expect(data.rate.amount).toBeGreaterThan(0)
    // Should be lowest possible base rate
  })

  it('Case 2: Volume Jump (Light but Bulky)', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parcelData: [
          { length: 25, width: 20, height: 15, weight: 1000 },
          { length: 25, width: 20, height: 15, weight: 1000 },
          { length: 25, width: 20, height: 15, weight: 1000 },
        ],
        countryCode: 'PL',
      }),
    })

    const data = await response.json()
    expect(response.ok).toBe(true)
    expect(data.rate).toBeDefined()
    expect(data.rate.amount).toBeGreaterThan(0)
  })

  it('Case 3: Weight Jump (Small but Heavy)', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parcelData: [
          { length: 20, width: 15, height: 10, weight: 5000 },
          { length: 20, width: 15, height: 10, weight: 5000 },
          { length: 20, width: 15, height: 10, weight: 5000 },
        ],
        countryCode: 'PL',
      }),
    })

    const data = await response.json()
    expect(response.ok).toBe(true)
    expect(data.rate).toBeDefined()
    expect(data.rate.amount).toBeGreaterThan(0)
  })

  it('Case 4: Edge of Limit (Maxing out one box)', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parcelData: Array(5).fill({
          length: 40,
          width: 30,
          height: 25,
          weight: 4800,
        }),
        countryCode: 'PL',
      }),
    })

    const data = await response.json()
    expect(response.ok).toBe(true)
    expect(data.rate).toBeDefined()
    expect(data.rate.amount).toBeGreaterThan(0)
  })

  it('Case 5: Spillover (Breaching limits)', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parcelData: Array(6).fill({
          length: 40,
          width: 30,
          height: 25,
          weight: 4800,
        }),
        countryCode: 'PL',
      }),
    })

    const data = await response.json()
    expect(response.ok).toBe(true)
    expect(data.rate).toBeDefined()
    expect(data.rate.amount).toBeGreaterThan(0)
  })

  it('Case 6: Extreme Scale (50 items)', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parcelData: Array(50).fill({
          length: 20,
          width: 15,
          height: 10,
          weight: 2000,
        }),
        countryCode: 'PL',
      }),
    })

    const data = await response.json()
    expect(response.ok).toBe(true)
    expect(data.rate).toBeDefined()
    expect(data.rate.amount).toBeGreaterThan(0)
  })
})
