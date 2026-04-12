import { backendClient } from '../sanity/lib/backendClient'
import Stripe from 'stripe'

// Initialize Stripe with test key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Test data configuration - using existing schema fields
const TEST_BRANDS = [
  {
    _type: 'brand',
    name: 'Test Brand Alpha',
    slug: { current: 'test-brand-alpha' },
    description: 'Test brand for checkout reservation flow',
    logo: {
      asset: {
        _ref: 'image-test-logo-alpha-ref',
        _type: 'reference'
      }
    },
    website: 'https://test-alpha.example.com'
  },
  {
    _type: 'brand',
    name: 'Test Brand Beta',
    slug: { current: 'test-brand-beta' },
    description: 'Second test brand for checkout flow',
    logo: {
      asset: {
        _ref: 'image-test-logo-beta-ref',
        _type: 'reference'
      }
    },
    website: 'https://test-beta.example.com'
  }
]

const TEST_PRODUCTS = [
  {
    _type: 'product',
    name: 'Test Product Alpha - Full Stock',
    slug: { current: 'test-product-alpha' },
    brand: { _ref: 'test-brand-alpha', _type: 'reference' },
    stripePriceId: 'price_1Q6xrZ2eZvKYlo2C9u2kZvKYlo', // Test price - 100.00 PLN
    displayPrice: 10000,
    stock: 5,
    reservedStock: 0,
    sku: 'TEST-ALPHA-001',
    image: {
      asset: {
        _ref: 'image-test-product-alpha-ref',
        _type: 'reference'
      }
    },
    catalogueLocationKeys: ['test-category-alpha'],
    overviewFields: [
      { title: 'Material', value: 'Test Material', information: 'High quality test material' },
      { title: 'Weight', value: '1.0kg', information: 'Standard weight' }
    ],
    specifications: [
      { title: 'Dimensions', value: '10x10x10cm', information: 'Standard size' },
      { title: 'Color', value: 'Test Color', information: 'Test color variant' }
    ]
  },
  {
    _type: 'product',
    name: 'Test Product Beta - Limited Stock',
    slug: { current: 'test-product-beta' },
    brand: { _ref: 'test-brand-beta', _type: 'reference' },
    stripePriceId: 'price_1Q6xrZ2eZvKYlo2C9u2kZvKYlo', // Same price for simplicity
    displayPrice: 20000,
    stock: 2,
    reservedStock: 0,
    sku: 'TEST-BETA-001',
    image: {
      asset: {
        _ref: 'image-test-product-beta-ref',
        _type: 'reference'
      }
    },
    catalogueLocationKeys: ['test-category-beta'],
    overviewFields: [
      { title: 'Material', value: 'Premium Material', information: 'Premium test material' },
      { title: 'Weight', value: '1.5kg', information: 'Heavier variant' }
    ],
    specifications: [
      { title: 'Dimensions', value: '15x15x15cm', information: 'Larger size' },
      { title: 'Color', value: 'Premium Color', information: 'Premium variant' }
    ]
  },
  {
    _type: 'product',
    name: 'Test Product Gamma - Out of Stock',
    slug: { current: 'test-product-gamma' },
    brand: { _ref: 'test-brand-alpha', _type: 'reference' },
    stripePriceId: 'price_1Q6xrZ2eZvKYlo2C9u2kZvKYlo', // Same price
    displayPrice: 30000,
    stock: 0,
    reservedStock: 0,
    sku: 'TEST-GAMMA-001',
    image: {
      asset: {
        _ref: 'image-test-product-gamma-ref',
        _type: 'reference'
      }
    },
    catalogueLocationKeys: ['test-category-gamma'],
    overviewFields: [
      { title: 'Material', value: 'Rare Material', information: 'Limited edition material' },
      { title: 'Weight', value: '2.0kg', information: 'Heavy variant' }
    ],
    specifications: [
      { title: 'Dimensions', value: '20x20x20cm', information: 'Largest size' },
      { title: 'Color', value: 'Rare Color', information: 'Limited edition' }
    ]
  }
]

// Helper function to verify Stripe prices exist
async function verifyStripePrices() {
  console.log('Verifying Stripe prices...')
  
  const priceIds = [...new Set(TEST_PRODUCTS.map(p => p.stripePriceId))]
  
  for (const priceId of priceIds) {
    try {
      const price = await stripe.prices.retrieve(priceId)
      console.log(`  ${priceId}: ${price.currency.toUpperCase()} ${(price.unit_amount / 100).toFixed(2)} - OK`)
    } catch (error) {
      console.error(`  ${priceId}: ERROR - ${error.message}`)
      throw new Error(`Missing Stripe price: ${priceId}. Please create this price in Stripe test mode.`)
    }
  }
  
  console.log('All Stripe prices verified successfully!')
}

// Helper function to clean existing test data
async function cleanupTestData() {
  console.log('Cleaning up existing test data...')
  
  // Delete test products
  const existingProducts = await backendClient.fetch(
    `*[_type == "product" && slug.current in ["test-product-alpha", "test-product-beta", "test-product-gamma"]]`
  )
  
  for (const product of existingProducts) {
    await backendClient.delete(product._id)
    console.log(`  Deleted product: ${product.name}`)
  }
  
  // Delete test brands
  const existingBrands = await backendClient.fetch(
    `*[_type == "brand" && slug.current in ["test-brand-alpha", "test-brand-beta"]]`
  )
  
  for (const brand of existingBrands) {
    await backendClient.delete(brand._id)
    console.log(`  Deleted brand: ${brand.name}`)
  }
  
  console.log('Cleanup complete!')
}

// Helper function to create test brands
async function createTestBrands() {
  console.log('Creating test brands...')
  
  const createdBrands = []
  
  for (const brand of TEST_BRANDS) {
    try {
      const created = await backendClient.create(brand)
      createdBrands.push(created)
      console.log(`  Created brand: ${created.name} (${created._id})`)
    } catch (error) {
      console.error(`  Failed to create brand ${brand.name}:`, error.message)
      throw error
    }
  }
  
  return createdBrands
}

// Helper function to create test products
async function createTestProducts(brands) {
  console.log('Creating test products...')
  
  const brandMap = brands.reduce((map, brand) => {
    map[brand.slug.current] = brand._id
    return map
  }, {})
  
  const createdProducts = []
  
  for (const product of TEST_PRODUCTS) {
    try {
      // Update brand reference with actual ID
      const productWithBrandRef = {
        ...product,
        brand: { _ref: brandMap[product.brand._ref], _type: 'reference' }
      }
      
      const created = await backendClient.create(productWithBrandRef)
      createdProducts.push(created)
      console.log(`  Created product: ${created.name} (${created._id})`)
    } catch (error) {
      console.error(`  Failed to create product ${product.name}:`, error.message)
      throw error
    }
  }
  
  return createdProducts
}

// Main setup function
async function setupTestData() {
  console.log('Setting up test data for guest checkout inventory reservation tests...\n')
  
  try {
    // Step 1: Verify Stripe prices exist
    await verifyStripePrices()
    console.log('')
    
    // Step 2: Clean up any existing test data
    await cleanupTestData()
    console.log('')
    
    // Step 3: Create test brands
    const brands = await createTestBrands()
    console.log('')
    
    // Step 4: Create test products
    const products = await createTestProducts(brands)
    console.log('')
    
    // Step 5: Verify everything was created correctly
    console.log('Verifying test data...')
    
    const verifyProducts = await backendClient.fetch(
      `*[_type == "product" && slug.current in ["test-product-alpha", "test-product-beta", "test-product-gamma"]]`
    )
    
    if (verifyProducts.length !== 3) {
      throw new Error(`Expected 3 products, found ${verifyProducts.length}`)
    }
    
    console.log('  All products created successfully')
    console.log('')
    
    // Step 6: Print summary for test reference
    console.log('Test Data Summary:')
    console.log('================')
    products.forEach(product => {
      console.log(`${product.name}:`)
      console.log(`  Stock: ${product.stock}`)
      console.log(`  Price: ${product.displayPrice / 100} PLN`)
      console.log(`  Stripe Price ID: ${product.stripePriceId}`)
      console.log('')
    })
    
    console.log('Test data setup complete! Ready to run tests.')
    
  } catch (error) {
    console.error('\nSetup failed:', error.message)
    process.exit(1)
  }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupTestData()
}

export { setupTestData, verifyStripePrices, cleanupTestData }
