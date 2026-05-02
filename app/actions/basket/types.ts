// Server Action request payload for fetching basket products from CMS
export interface BasketSyncRequest {
  productIds: string[]
}

// CMS product data as returned from Sanity
export interface CMSProductData {
  _id: string
  price_data: { currency: string; unit_amount: number }
  stock: number
  reservedStock: number
}

// Transformed product data after CMS fetch (price_data, availableStock calculated)
export interface TransformedProductData {
  productId: string
  price_data: { currency: string; unit_amount: number }
  availableStock: number
}

// Server Action response payload
export interface BasketSyncResponse {
  available: TransformedProductData[]
  unavailable: TransformedProductData[]
}
