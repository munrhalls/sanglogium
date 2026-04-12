// Audit script to verify test products and schema migration
const fs = require('fs')
const path = require('path')

// Load .env file
const envPath = path.join(__dirname, '..', '.env')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim().replace(/"/g, '')
  }
})

// Set environment variables
Object.assign(process.env, envVars)

// Load Sanity client
const { createClient } = require('next-sanity')

// Initialize Sanity client
const backendClient = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-26',
  dataset: process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: true,
  token: process.env.SANITY_STUDIO_READ_WRITE_CREATE || process.env.SANITY_API_TOKEN,
})

async function auditTestProducts() {
  console.log('=== AUDIT: Test Products and Schema ===\n')

  // 1. Check if test products exist
  console.log('1. Checking Test Products Exist')
  const testProductSlugs = ['test-product-alpha', 'test-product-beta', 'test-product-gamma']

  const testProducts = await backendClient.fetch(
    `*[_type == "product" && slug.current in $slugs] {
      _id,
      name,
      slug,
      stock,
      reservedStock,
      stripePriceId,
      displayPrice,
      brand->{name, slug}
    }`,
    { slugs: testProductSlugs }
  )

  if (testProducts.length === 0) {
    console.log('   \u274c No test products found')
    console.log('   Run: node scripts/setup-test-data.cjs')
    return
  }

  console.log(`   \u2705 Found ${testProducts.length} test products:`)
  testProducts.forEach(product => {
    console.log(`      - ${product.name}: stock=${product.stock}, reserved=${product.reservedStock || 0}, price=${product.displayPrice / 100} PLN`)
  })
  console.log('')

  // 2. Verify expected test products
  console.log('2. Verifying Expected Test Products')
  const expectedProducts = [
    { slug: 'test-product-alpha', name: 'Test Product Alpha - Full Stock', stock: 5 },
    { slug: 'test-product-beta', name: 'Test Product Beta - Limited Stock', stock: 2 },
    { slug: 'test-product-gamma', name: 'Test Product Gamma - Out of Stock', stock: 0 }
  ]

  let allProductsMatch = true
  expectedProducts.forEach(expected => {
    const found = testProducts.find(p => p.slug.current === expected.slug)
    if (!found) {
      console.log(`   \u274c Missing: ${expected.name}`)
      allProductsMatch = false
    } else if (found.stock !== expected.stock) {
      console.log(`   \u274c Stock mismatch for ${found.name}: expected ${expected.stock}, got ${found.stock}`)
      allProductsMatch = false
    } else {
      console.log(`   \u2705 ${found.name}: stock=${found.stock} \u2713`)
    }
  })
  console.log('')

  // 3. Check all CMS products for reservedStock field
  console.log('3. Checking All Products Have reservedStock Field')
  const allProducts = await backendClient.fetch(
    `*[_type == "product"][0..10] {
      _id,
      name,
      stock,
      reservedStock
    }`
  )

  if (allProducts.length === 0) {
    console.log('   \u274c No products found in CMS')
    return
  }

  const productsWithoutReservedStock = allProducts.filter(p => p.reservedStock === undefined)

  if (productsWithoutReservedStock.length === 0) {
    console.log(`   \u2705 All checked products have reservedStock field`)
  } else {
    console.log(`   \u274c ${productsWithoutReservedStock.length} products missing reservedStock:`)
    productsWithoutReservedStock.forEach(p => {
      console.log(`      - ${p.name} (${p._id})`)
    })
  }
  console.log('')

  // 4. Check total product count and reservedStock migration
  console.log('4. Checking Product Migration Status')
  const totalProducts = await backendClient.fetch(`count(*[_type == "product"])`)
  const productsWithReservedStock = await backendClient.fetch(`count(*[_type == "product" && defined(reservedStock)])`)

  console.log(`   Total products: ${totalProducts}`)
  console.log(`   Products with reservedStock: ${productsWithReservedStock}`)

  if (totalProducts === productsWithReservedStock) {
    console.log('   \u2705 All products have reservedStock field migrated')
  } else {
    console.log(`   \u26a0\ufe0f ${totalProducts - productsWithReservedStock} products need migration`)
  }
  console.log('')

  // 5. Verify Stripe price exists
  console.log('5. Checking Stripe Test Price')
  const stripePriceIds = [...new Set(testProducts.map(p => p.stripePriceId).filter(Boolean))]

  if (stripePriceIds.length > 0) {
    console.log(`   Found Stripe price IDs: ${stripePriceIds.join(', ')}`)
    console.log('   \u2705 Stripe prices configured')
  } else {
    console.log('   \u274c No Stripe price IDs found on test products')
  }
  console.log('')

  // Summary
  console.log('=== AUDIT SUMMARY ===')
  console.log(`Test Products: ${testProducts.length}/3 found`)
  console.log(`Stock Levels: ${allProductsMatch ? '\u2705 Correct' : '\u274c Mismatch'}`)
  console.log(`Schema Migration: ${totalProducts === productsWithReservedStock ? '\u2705 Complete' : '\u26a0\ufe0f Partial'}`)
  console.log(`Ready for Tests: ${testProducts.length === 3 && allProductsMatch && totalProducts === productsWithReservedStock ? '\u2705 YES' : '\u274c NO'}`)
}

// Run if called directly
if (require.main === module) {
  auditTestProducts()
}

module.exports = { auditTestProducts }
