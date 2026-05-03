#!/usr/bin/env node

// Verification script for E2E Playwright test environment
// Checks dev server, Redis, and Sanity are accessible

import { backendClient } from '../sanity-config/lib/backendClient.js'

async function checkDevServer() {
  console.log('🌐 Checking dev server...')
  try {
    const response = await fetch('http://localhost:3000')
    if (response.ok) {
      console.log('  ✓ Dev server accessible')
      return true
    }
    console.error('  ✗ Dev server returned non-OK status')
    return false
  } catch (error) {
    console.error('  ✗ Dev server not accessible:', error.message)
    return false
  }
}

async function checkRedis() {
  console.log('🔴 Checking Redis...')
  try {
    const response = await fetch('http://localhost:3000/api/checkout-queue/trace')
    if (response.ok) {
      console.log('  ✓ Redis accessible (via API)')
      return true
    }
    console.error('  ✗ Redis trace API returned non-OK status')
    return false
  } catch (error) {
    console.error('  ✗ Redis not accessible:', error.message)
    return false
  }
}

async function checkSanity() {
  console.log('🗄️  Checking Sanity...')
  try {
    const result = await backendClient.fetch(`count(*[_type == "product"])`)
    console.log(`  ✓ Sanity accessible (found ${result} products)`)
    return true
  } catch (error) {
    console.error('  ✗ Sanity not accessible:', error.message)
    return false
  }
}

async function main() {
  console.log('🔍 Verifying E2E test environment...\n')
  
  const devServerOk = await checkDevServer()
  const redisOk = await checkRedis()
  const sanityOk = await checkSanity()
  
  console.log('\n' + '='.repeat(40))
  if (devServerOk && redisOk && sanityOk) {
    console.log('✅ All services accessible - ready for E2E tests')
    process.exit(0)
  } else {
    console.error('❌ Some services not accessible - fix before running tests')
    process.exit(1)
  }
}

main().catch(console.error)
