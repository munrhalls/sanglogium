// Server Action request payload for fetching basket products from CMS
export interface BasketSyncRequest {
  productIds: string[]
}

// CMS product data as returned from Sanity
export interface CMSProductData {
  _id: string
  price_data: number // cents
  stock: number
  reservedStock: number
}

// Transformed product data after CMS fetch (cents → displayPrice, availableStock calculated)
export interface TransformedProductData {
  productId: string
  displayPrice: number
  availableStock: number
}

// Server Action response payload
export interface BasketSyncResponse {
  available: TransformedProductData[]
  unavailable: TransformedProductData[]
}
