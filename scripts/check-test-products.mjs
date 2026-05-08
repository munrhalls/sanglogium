import { createClient } from 'next-sanity'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.test' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-01-01',
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE_CREATE || process.env.SANITY_API_TOKEN,
})

async function checkTestProducts() {
  const products = await client.fetch(`
    *[_type == "product" && (name match "test" || name match "Test")]{
      _id, 
      name, 
      stock, 
      reservedStock,
      stripePriceId,
      displayPrice
    } | order(name asc)
  `)

  console.log('Test Products from CMS:')
  console.log(JSON.stringify(products, null, 2))
}

checkTestProducts().catch(console.error)
