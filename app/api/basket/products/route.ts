import { NextRequest, NextResponse } from 'next/server'
import { getBasketProducts } from '@/sanity-cms/lib/products/getBasketProducts'

function sanitizeFiniteNonNegative(value: unknown): number {
  if (typeof value !== 'number') return 0
  if (!Number.isFinite(value)) return 0
  return Math.max(0, value)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const idsParam = searchParams.get('ids')

  if (!idsParam) {
    return NextResponse.json({ success: true, data: [] })
  }

  const ids = idsParam.split(',').filter(Boolean)

  try {
    const rawProducts = await getBasketProducts(ids)

    const products = rawProducts
      .map((product) => {
        const stock = sanitizeFiniteNonNegative(product.stock)
        const reservedStock = sanitizeFiniteNonNegative(product.reservedStock)

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

    return NextResponse.json({ success: true, data: products })
  } catch (error) {
    console.error('API: Failed to fetch basket products:', error)
    return NextResponse.json({ success: false, error: 'Unable to load products' }, { status: 500 })
  }
}
