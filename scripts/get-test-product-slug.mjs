#!/usr/bin/env node

import { backendClient } from '../sanity-cms/lib/backendClient.js'

const productId = 'YcMKSEyusPBTcaoe1xiP1b'

async function getSlug() {
  try {
    const product = await backendClient.fetch(
      `*[_id == $productId]{_id, slug.current}[0]`,
      { productId }
    )
    console.log(JSON.stringify(product, null, 2))
  } catch (error) {
    console.error('Error:', error.message)
  }
}

getSlug()
