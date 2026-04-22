// Reset product reservedStock to 0 in test dataset
// Used to clean up accumulated test state

import { createClient } from '@sanity/client'
import 'dotenv/config'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET || 'test',
  useCdn: false,
  apiVersion: '2024-11-14',
  token: process.env.SANITY_STUDIO_READ_WRITE || process.env.SANITY_API_TOKEN,
})

async function resetReservedStock() {
  console.log('=== RESET RESERVED STOCK ===')

  try {
    // Fetch all products
    const products = await client.fetch(`
      *[_type == "product"] { _id, name, reservedStock }
    `)

    console.log(`Found ${products.length} products`)

    if (products.length === 0) {
      console.log('No products to reset')
      return
    }

    // Reset reservedStock to 0 for all products
    const mutations = []
    let resetCount = 0

    products.forEach(product => {
      if (product.reservedStock !== 0) {
        mutations.push({
          patch: {
            id: product._id,
            set: { reservedStock: 0 }
          }
        })
        resetCount++
      }
    })

    if (resetCount === 0) {
      console.log('All products already have reservedStock = 0')
      return
    }

    await client.mutate(mutations)
    console.log(`Reset reservedStock to 0 for ${resetCount} products`)

  } catch (error) {
    console.error('Error resetting reservedStock:', error)
    process.exit(1)
  }
}

resetReservedStock()
