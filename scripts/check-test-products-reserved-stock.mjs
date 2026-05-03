#!/usr/bin/env node

import { backendClient } from '../sanity-config/lib/backendClient.js'

async function checkTestProducts() {
  const products = await backendClient.fetch(`
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
