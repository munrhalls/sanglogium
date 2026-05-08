import { BasketProduct } from '@/sanity-cms/lib/products/getBasketProducts'

export interface CMSBasketItem {
  productId: string
  name: string
  displayPrice: number
  availableStock: number
  price_data: { currency: string; unit_amount: number }
  image: any
}

export function parseBasketItems(cmsProducts: BasketProduct[]): CMSBasketItem[] {
  return cmsProducts.map(product => ({
    productId: product._id,
    name: product.name,
    displayPrice: product.price_data.unit_amount / 100, // cents to dollars
    availableStock: product.stock - product.reservedStock,
    price_data: product.price_data,
    image: product.image
  }))
}
