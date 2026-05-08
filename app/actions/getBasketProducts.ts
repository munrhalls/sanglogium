"use server"

import { getBasketProducts } from "@/sanity-config/lib/products/getBasketProducts"

/**
 * Server Action to fetch basket products from Sanity CMS
 * Called from client components to fetch product data server-side
 */
export async function getBasketProductsAction(ids: string[]) {
  try {
    const products = await getBasketProducts(ids)
    return { success: true, data: products }
  } catch (error) {
    console.error('Server Action: Failed to fetch basket products:', error)
    return { success: false, error: 'Unable to load products' }
  }
}
