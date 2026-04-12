// Audit and migrate existing stock data for reservedStock implementation
// This script ensures all products have proper stock and reservedStock values

import { createClient } from '@sanity/client'
import 'dotenv/config'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-11-26',
  token: process.env.SANITY_API_TOKEN,
})

async function auditAndMigrateStock() {
  console.log('=== AUDIT AND MIGRATE STOCK DATA ===')
  
  try {
    // Fetch all products with stock data
    const products = await client.fetch(`
      *[_type == "product"] {
        _id,
        name,
        stock,
        reservedStock,
        "hasStock": defined(stock),
        "hasReservedStock": defined(reservedStock),
        "reservedStockValid": reservedStock >= 0,
        "stockValid": stock >= 0
      }
    `)
    
    console.log(`Found ${products.length} products`)
    
    // Analyze current state
    const issues = {
      missingStock: 0,
      missingReservedStock: 0,
      invalidReservedStock: 0,
      invalidStock: 0,
      needsMigration: 0
    }
    
    const productsToFix = []
    
    for (const product of products) {
      let needsFix = false
      const fixes = {}
      
      if (!product.hasStock) {
        issues.missingStock++
        fixes.stock = 0
        needsFix = true
      }
      
      if (!product.hasReservedStock) {
        issues.missingReservedStock++
        fixes.reservedStock = 0
        needsFix = true
      }
      
      if (product.hasReservedStock && !product.reservedStockValid) {
        issues.invalidReservedStock++
        fixes.reservedStock = 0
        needsFix = true
      }
      
      if (product.hasStock && !product.stockValid) {
        issues.invalidStock++
        fixes.stock = 0
        needsFix = true
      }
      
      // Check if reservedStock > stock (invalid state)
      if (product.hasStock && product.hasReservedStock && 
          product.stock >= 0 && product.reservedStock > product.stock) {
        issues.invalidReservedStock++
        fixes.reservedStock = 0
        needsFix = true
        console.warn(`WARNING: Product ${product.name} has reservedStock(${product.reservedStock}) > stock(${product.stock})`)
      }
      
      if (needsFix) {
        issues.needsMigration++
        productsToFix.push({
          id: product._id,
          name: product.name,
          fixes
        })
      }
    }
    
    console.log('\n=== AUDIT RESULTS ===')
    console.log(`Missing stock field: ${issues.missingStock}`)
    console.log(`Missing reservedStock field: ${issues.missingReservedStock}`)
    console.log(`Invalid reservedStock values: ${issues.invalidReservedStock}`)
    console.log(`Invalid stock values: ${issues.invalidStock}`)
    console.log(`Products needing migration: ${issues.needsMigration}`)
    
    if (productsToFix.length === 0) {
      console.log('\n=== NO MIGRATION NEEDED ===')
      console.log('All products have valid stock and reservedStock values')
      return
    }
    
    console.log('\n=== MIGRATION PLAN ===')
    console.log('The following products will be updated:')
    productsToFix.forEach(p => {
      console.log(`- ${p.name} (${p.id}): ${JSON.stringify(p.fixes)}`)
    })
    
    // Ask for confirmation in production
    if (process.env.NODE_ENV === 'production') {
      console.log('\n=== PRODUCTION MODE ===')
      console.log('Run with DRY_RUN=false to apply migration')
      return
    }
    
    // Apply migration
    console.log('\n=== APPLYING MIGRATION ===')
    const transaction = client.transaction()
    
    for (const product of productsToFix) {
      const patch = client.patch(product._id)
      
      if (product.fixes.stock !== undefined) {
        patch.set({ stock: product.fixes.stock })
      }
      
      if (product.fixes.reservedStock !== undefined) {
        patch.set({ reservedStock: product.fixes.reservedStock })
      }
      
      transaction.patch(patch)
    }
    
    const result = await transaction.commit()
    console.log(`Successfully migrated ${productsToFix.length} products`)
    console.log(`Transaction ID: ${result.transactionId}`)
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
auditAndMigrateStock()
