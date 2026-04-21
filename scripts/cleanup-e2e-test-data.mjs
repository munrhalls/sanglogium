#!/usr/bin/env node

// Cleanup script for E2E Playwright tests
// Resets test product reservedStock and clears traces/queue after test runs

import { backendClient } from '../sanity/lib/backendClient.js'

const TEST_PRODUCT_IDS = [
  'YcMKSEyusPBTcaoe1xiP1b',
  // Add more test product IDs as needed
]

async function resetTestProducts() {
  console.log('🔧 Resetting test products reservedStock to 0...')
  
  for (const id of TEST_PRODUCT_IDS) {
    try {
      await backendClient.patch(id).set({ reservedStock: 0 }).commit()
      console.log(`  ✓ Reset ${id}`)
    } catch (error) {
      console.error(`  ✗ Failed to reset ${id}:`, error.message)
    }
  }
}

async function clearTraces() {
  console.log('🧹 Clearing traces...')
  try {
    await fetch('http://localhost:3000/api/checkout-queue/clear-trace', { 
      method: 'POST' 
    })
    console.log('  ✓ Traces cleared')
  } catch (error) {
    console.error('  ✗ Failed to clear traces:', error.message)
  }
}

async function main() {
  await clearTraces()
  await resetTestProducts()
  console.log('✅ E2E test data cleanup complete')
}

main().catch(console.error)
