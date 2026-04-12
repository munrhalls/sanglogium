import { backendClient } from '../sanity/lib/backendClient.js'
import Redis from 'ioredis'
import Stripe from 'stripe'

// Initialize clients
const redis = new Redis({
  host: process.env.UPSTASH_REDIS_REST_URL ? 'redis.upstash.io' : 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '1')
})

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function verifyEnvironment() {
  console.log('Verifying test environment setup...\n')

  let allChecksPassed = true

  // Check 1: Sanity Connection
  console.log('1. Sanity Connection')
  try {
    await backendClient.fetch(`*[_type == "brand"][0]`)
    console.log('   \u2705 Sanity connection successful')
  } catch (error) {
    console.log(`   \u274c Sanity connection failed: ${error.message}`)
    console.log('   Check SANITY_STUDIO_READ_WRITE_CREATE token')
    allChecksPassed = false
  }
  console.log('')

  // Check 2: Redis Connection
  console.log('2. Redis Connection')
  try {
    await redis.ping()
    console.log('   \u2705 Redis connection successful')
  } catch (error) {
    console.log(`   \u274c Redis connection failed: ${error.message}`)
    console.log('   Check UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN')
    allChecksPassed = false
  }
  console.log('')

  // Check 3: Stripe Connection
  console.log('3. Stripe Connection')
  try {
    await stripe.accounts.retrieve()
    console.log('   \u2705 Stripe connection successful')
  } catch (error) {
    console.log(`   \u274c Stripe connection failed: ${error.message}`)
    console.log('   Check STRIPE_SECRET_KEY (must be test mode)')
    allChecksPassed = false
  }
  console.log('')

  // Check 4: Test Data Exists
  console.log('4. Test Data')
  try {
    const products = await backendClient.fetch(
      `*[_type == "product" && slug.current in ["test-product-alpha", "test-product-beta", "test-product-gamma"]]`
    )

    if (products.length === 3) {
      console.log('   \u2705 All test products found')
      products.forEach(p => {
        console.log(`      - ${p.name}: stock=${p.stock}, price=${p.displayPrice / 100} PLN`)
      })
    } else {
      console.log(`   \u274c Missing test products (found ${products.length}, expected 3)`)
      console.log('   Run: node scripts/setup-test-data.mjs')
      allChecksPassed = false
    }
  } catch (error) {
    console.log(`   \u274c Failed to check test data: ${error.message}`)
    allChecksPassed = false
  }
  console.log('')

  // Check 5: Schema Compatibility
  console.log('5. Schema Compatibility')
  try {
    const sampleProduct = await backendClient.fetch(`*[_type == "product"][0]`)

    const requiredFields = ['name', 'slug', 'brand', 'stripePriceId', 'displayPrice', 'stock', 'reservedStock']
    const missingFields = requiredFields.filter(field => !sampleProduct[field])

    if (missingFields.length === 0) {
      console.log('   \u2705 Product schema has all required fields')
    } else {
      console.log(`   \u274c Missing required fields: ${missingFields.join(', ')}`)
      allChecksPassed = false
    }

    // Check that conflicting reservations field is gone
    if (sampleProduct.reservations) {
      console.log('   \u274c Conflicting "reservations" field still exists')
      console.log('   Run: node scripts/migrate-reservations-field.mjs')
      allChecksPassed = false
    } else {
      console.log('   \u2705 Conflicting "reservations" field removed')
    }
  } catch (error) {
    console.log(`   \u274c Failed to check schema: ${error.message}`)
    allChecksPassed = false
  }
  console.log('')

  // Check 6: Environment Variables
  console.log('6. Environment Variables')
  const requiredEnvVars = [
    'SANITY_STUDIO_READ_WRITE_CREATE',
    'STRIPE_SECRET_KEY',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN'
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

  if (missingVars.length === 0) {
    console.log('   \u2705 All required environment variables set')
  } else {
    console.log(`   \u274c Missing environment variables: ${missingVars.join(', ')}`)
    allChecksPassed = false
  }
  console.log('')

  // Summary
  if (allChecksPassed) {
    console.log('\u2728 All checks passed! Environment is ready for testing.')
    console.log('\nNext steps:')
    console.log('1. Run tests: npm run test:checkout')
    console.log('2. Or run tests with UI: npx playwright test --headed')
  } else {
    console.log('\u26a0\ufe0f Some checks failed. Please fix the issues above.')
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyEnvironment()
}

export { verifyEnvironment }
