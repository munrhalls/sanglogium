// Migration script to ensure all products have reservedStock field
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

async function checkReservedStockField() {
  console.log('Checking reservedStock field on all products...')
  
  // Find products without reservedStock field
  const productsWithoutReservedStock = await backendClient.fetch(`
    *[_type == "product" && !defined(reservedStock)] {
      _id,
      name,
      stock,
      slug
    }
  `)
  
  if (productsWithoutReservedStock.length === 0) {
    console.log('  \u2705 All products have reservedStock field')
    return []
  }
  
  console.log(`  Found ${productsWithoutReservedStock.length} products without reservedStock field:`)
  productsWithoutReservedStock.forEach(product => {
    console.log(`    - ${product.name} (${product.slug.current})`)
  })
  
  return productsWithoutReservedStock
}

async function addReservedStockField(products) {
  if (products.length === 0) return
  
  console.log('Adding reservedStock field to products...')
  
  for (const product of products) {
    try {
      await backendClient
        .patch(product._id)
        .set({ reservedStock: 0 })
        .commit()
      
      console.log(`  Added reservedStock to: ${product.name}`)
    } catch (error) {
      console.error(`  Failed to add reservedStock to ${product.name}:`, error.message)
      throw error
    }
  }
}

async function verifyMigration() {
  console.log('Verifying migration...')
  
  const remainingProducts = await backendClient.fetch(`
    *[_type == "product" && !defined(reservedStock)] {
      _id,
      name
    }
  `)
  
  if (remainingProducts.length === 0) {
    console.log('  \u2705 Migration successful - all products have reservedStock field')
    return true
  } else {
    console.log(`  \u274c Migration incomplete - ${remainingProducts.length} products still missing reservedStock field`)
    remainingProducts.forEach(p => console.log(`    - ${p.name}`))
    return false
  }
}

async function migrateReservedStockField() {
  console.log('Starting reservedStock field migration...\n')
  
  try {
    // Step 1: Check products missing the field
    const productsWithoutField = await checkReservedStockField()
    console.log('')
    
    // Step 2: Add field to products that need it
    if (productsWithoutField.length > 0) {
      await addReservedStockField(productsWithoutField)
      console.log('')
    }
    
    // Step 3: Verify migration
    const success = await verifyMigration()
    console.log('')
    
    if (success) {
      console.log('\u2728 Migration completed successfully!')
      console.log('All products now have the reservedStock field for the PRD reservation system.')
    } else {
      console.log('\u26a0\ufe0f Migration verification failed')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('\nMigration failed:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  migrateReservedStockField()
}

module.exports = { migrateReservedStockField, checkReservedStockField }
