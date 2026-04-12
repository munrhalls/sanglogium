import { backendClient } from '../sanity/lib/backendClient'

// Safe migration script to remove the conflicting 'reservations' field
// This field conflicts with our PRD's token-based reservation system

async function checkExistingReservations() {
  console.log('Checking for existing reservation data...')
  
  // Find all products that have reservations data
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
  
  // Save backup to a Sanity document
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
      // Remove the reservations field and reset reservedStock to 0
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
  
  // Check that no products have reservations field
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
    // Step 1: Check existing data
    const productsWithReservations = await checkExistingReservations()
    console.log('')
    
    // Step 2: Create backup if there's data
    if (productsWithReservations.length > 0) {
      await backupReservationsData(productsWithReservations)
      console.log('')
    }
    
    // Step 3: Remove the field
    await removeReservationsField(productsWithReservations)
    console.log('')
    
    // Step 4: Verify migration
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
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateReservationsField()
}

export { migrateReservationsField, checkExistingReservations }
