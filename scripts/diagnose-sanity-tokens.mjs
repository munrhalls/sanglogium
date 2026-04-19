// Diagnose which Sanity tokens support which permissions
import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = '2024-11-14'

const testProductId = 'YcMKSEyusPBTcaoe1xiP1b'

const tokens = {
  SANITY_API_TOKEN: process.env.SANITY_API_TOKEN,
  SANITY_STUDIO_READ_WRITE: process.env.SANITY_STUDIO_READ_WRITE,
  SANITY_STUDIO_READ_WRITE_CREATE: process.env.SANITY_STUDIO_READ_WRITE_CREATE,
  SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN,
}

for (const [name, token] of Object.entries(tokens)) {
  if (!token) {
    console.log(`${name}: NOT SET`)
    continue
  }
  const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token })
  try {
    await client.patch(testProductId).inc({ reservedStock: 0 }).commit()
    console.log(`${name}: UPDATE OK`)
  } catch (err) {
    console.log(`${name}: UPDATE FAIL - ${err.message}`)
  }
}
