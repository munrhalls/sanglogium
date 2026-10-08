import type { BasketProduct } from '@/features/basket/core/types/basketTypes';
import type { BasketProductsPort } from '@/features/basket/core/ports';

function sanitizeFiniteNonNegative(value: unknown): number {
  if (typeof value !== 'number') return 0
  if (!Number.isFinite(value)) return 0
  return Math.max(0, value)
}

export async function getBasketProducts(
  ports: BasketProductsPort,
  ids: string[]
): Promise<BasketProduct[]> {
  const rawProducts = await ports.getBasketProducts(ids)

  return rawProducts
    .map((product) => {
      const stock = sanitizeFiniteNonNegative(product.stock)
      const reservedStock = Math.min(sanitizeFiniteNonNegative(product.reservedStock), stock)

      if (stock !== product.stock || reservedStock !== product.reservedStock) {
        console.warn(
          `[API/basket/products] Sanitized stock/reservedStock for product ${product._id}: stock ${product.stock} → ${stock}, reservedStock ${product.reservedStock} → ${reservedStock}`
        )
      }

      return {
        ...product,
        stock,
        reservedStock,
      }
    })
    .filter((product) => {
      if (!product._id || !product.name || !product.price_data?.unit_amount) {
        console.warn(`[API/basket/products] Filtered out invalid product: missing _id, name, or price_data`)
        return false
      }
      return true
    })
}
