import { NextRequest, NextResponse } from 'next/server'
import { getBasketProducts } from '@/sanity-config/lib/products/getBasketProducts'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const idsParam = searchParams.get('ids')

  if (!idsParam) {
    return NextResponse.json({ success: true, data: [] })
  }

  const ids = idsParam.split(',').filter(Boolean)

  try {
    const products = await getBasketProducts(ids)
    return NextResponse.json({ success: true, data: products })
  } catch (error) {
    console.error('API: Failed to fetch basket products:', error)
    return NextResponse.json({ success: false, error: 'Unable to load products' }, { status: 500 })
  }
}
