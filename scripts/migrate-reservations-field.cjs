// Simple migration script that loads .env and removes conflicting reservations field
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

// Migration functions
async function checkExistingReservations() {
  console.log('Checking for existing reservation data...')
  
  const productsWithReservations = await backendClient.fetch(`
    *[_type == "product" && defined(reservations) && count(reservations) > 0] {
      _id,
      name,
      reservations,
      stock,
      reservedStock
    }
  `)
  
  if (productsWithReservations.length === 0) {
    console.log('  No products with reservation data found - safe to proceed')
    return []
  }
  
  console.log(`  Found ${productsWithReservations.length} products with reservation data:`)
  productsWithReservations.forEach(product => {
    console.log(`    - ${product.name}: ${product.reservations.length} reservations`)
  })
  
  return productsWithReservations
}

async function backupReservationsData(products) {
  if (products.length === 0) return
  
  console.log('Creating backup of reservation data...')
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupData = {
    timestamp,
    products: products.map(p => ({
      _id: p._id,
      name: p.name,
      reservations: p.reservations,
      stock: p.stock,
      reservedStock: p.reservedStock
    }))
  }
  
  try {
    await backendClient.create({
      _type: 'backup',
      name: `Reservations Field Backup - ${timestamp}`,
      backupData,
      migratedAt: new Date().toISOString()
    })
    console.log('  Backup saved to Sanity')
  } catch (error) {
    console.error('  Failed to save backup:', error.message)
    throw error
  }
}

async function removeReservationsField(products) {
  if (products.length === 0) return
  
  console.log('Removing reservations field from products...')
  
  for (const product of products) {
    try {
      await backendClient
        .patch(product._id)
        .unset(['reservations'])
        .set({ reservedStock: 0 })
        .commit()
      
      console.log(`  Removed reservations from: ${product.name}`)
    } catch (error) {
      console.error(`  Failed to remove reservations from ${product.name}:`, error.message)
      throw error
    }
  }
}

async function verifyMigration() {
  console.log('Verifying migration...')
  
  const remainingProducts = await backendClient.fetch(`
    *[_type == "product" && defined(reservations)] {
      _id,
      name
    }
  `)
  
  if (remainingProducts.length === 0) {
    console.log('  \u2705 Migration successful - no products have reservations field')
    return true
  } else {
    console.log(`  \u274c Migration incomplete - ${remainingProducts.length} products still have reservations field`)
    remainingProducts.forEach(p => console.log(`    - ${p.name}`))
    return false
  }
}

async function migrateReservationsField() {
  console.log('Starting safe migration of reservations field...\n')
  
  try {
    const productsWithReservations = await checkExistingReservations()
    console.log('')
    
    if (productsWithReservations.length > 0) {
      await backupReservationsData(productsWithReservations)
      console.log('')
    }
    
    await removeReservationsField(productsWithReservations)
    console.log('')
    
    const success = await verifyMigration()
    console.log('')
    
    if (success) {
      console.log('\u2728 Migration completed successfully!')
      console.log('The reservations field has been safely removed from all products.')
      console.log('This clears the way for the token-based reservation system from the PRD.')
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
  migrateReservationsField()
}

module.exports = { migrateReservationsField, checkExistingReservations }
