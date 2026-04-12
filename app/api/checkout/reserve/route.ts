// POST /api/checkout/reserve
// Creates a reservation from the client basket
// Requires: Content-Type: application/json, Idempotency-Key header
// Returns: 202 (processing) or 200 (cached idempotent) or 4xx (error)

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getRedisClient } from '@/lib/checkout/reservation/redis-client'
import { ReservationTTLManager, IdempotencyManager } from '@/lib/checkout/reservation/redis-managers'
import { getLogger } from '@/lib/checkout/reservation/logging'
import { LogCategory } from '@/lib/checkout/reservation/types'
import type {
  ReservedProduct,
  ClientBasket,
  APIResponse,
} from '@/lib/checkout/reservation/types'
import { client } from '@/sanity/lib/client'

export async function POST(request: NextRequest): Promise<NextResponse<APIResponse>> {
  const logger = getLogger()
  const requestId = request.headers.get('x-request-id') || uuidv4()
  const startTime = Date.now()

  try {
    // Validate Content-Type
    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return NextResponse.json({
        success: false,
        requestId,
        status: 'failed',
        error: {
          code: 'INVALID_CONTENT_TYPE',
          message: 'Content-Type must be application/json'
        }
      } as APIResponse, { status: 400 })
    }

    // Validate Idempotency-Key
    const idempotencyKey = request.headers.get('idempotency-key')
    if (!idempotencyKey) {
      return NextResponse.json({
        success: false,
        requestId,
        status: 'failed',
        error: {
          code: 'MISSING_IDEMPOTENCY_KEY',
          message: 'Idempotency-Key header is required'
        }
      } as APIResponse, { status: 400 })
    }

    // Parse body
    const body = await request.json().catch(() => null)
    if (!body?.clientBasket) {
      return NextResponse.json({
        success: false,
        requestId,
        status: 'failed',
        error: {
          code: 'MISSING_CLIENT_BASKET',
          message: 'clientBasket is required in request body'
        }
      } as APIResponse, { status: 400 })
    }

    const clientBasket: ClientBasket = body.clientBasket

    // Check idempotency cache
    const redis = getRedisClient()
    const idempotencyManager = new IdempotencyManager(redis)
    const cached = await idempotencyManager.getResponse(idempotencyKey)

    if (cached) {
      const currentFingerprint = JSON.stringify(body)
      if (cached.requestFingerprint !== currentFingerprint) {
        return NextResponse.json({
          success: false,
          requestId,
          status: 'failed',
          error: {
            code: 'IDEMPOTENCY_KEY_PARAMETER_MISMATCH',
            message: 'Request parameters do not match original'
          }
        } as APIResponse, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        requestId,
        status: 'completed',
        data: cached.response
      } as APIResponse, { status: 200 })
    }

    // Fetch product data from Sanity and check stock
    const productIds = clientBasket.products.map(p => p.id)
    const products = await client.fetch<Array<{
      _id: string
      name: string
      stock: number
      pricePln: number
      slug: { current: string }
      stripePriceId: string
      image: string | null
      brand: { _id: string; name: string; slug: { current: string } } | null
    }>>(
      `*[_type == "product" && _id in $ids]{
        _id, name, stock, pricePln,
        slug, stripePriceId,
        "image": image.asset->url,
        brand->{ _id, name, slug }
      }`,
      { ids: productIds }
    )

    // Build reserved products with stock check
    const reservedProducts: ReservedProduct[] = clientBasket.products.map(item => {
      const product = products.find(p => p._id === item.id)
      if (!product) {
        return {
          id: item.id,
          name: 'Unknown Product',
          stripePriceId: item.stripePriceId,
          requestedQuantity: item.quantity,
          reservedQuantity: 0,
          availableQuantity: 0,
          pricePln: 0,
          totalPricePln: 0,
          imageUrl: null,
          slug: '',
          brand: { id: '', name: '', slug: '' }
        }
      }

      const availableQuantity = Math.max(0, product.stock)
      const reservedQuantity = Math.min(item.quantity, availableQuantity)

      return {
        id: product._id,
        name: product.name,
        stripePriceId: product.stripePriceId || item.stripePriceId,
        requestedQuantity: item.quantity,
        reservedQuantity,
        availableQuantity,
        pricePln: product.pricePln,
        totalPricePln: reservedQuantity * product.pricePln,
        imageUrl: product.image || null,
        slug: typeof product.slug === 'object' ? product.slug.current : product.slug,
        brand: product.brand ? {
          id: product.brand._id,
          name: product.brand.name,
          slug: typeof product.brand.slug === 'object' ? product.brand.slug.current : product.brand.slug
        } : { id: '', name: '', slug: '' }
      }
    })

    // Calculate total amount (only reserved items)
    const amountPln = reservedProducts.reduce((sum, p) => sum + p.totalPricePln, 0)

    // Create reservation token
    const reservationToken = uuidv4()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Two-phase stock update: Redis WATCH/MULTI lock first
    const ttlManager = new ReservationTTLManager(redis)
    await ttlManager.setReservationToken(reservationToken)

    // Then Sanity patch (decrement stock for reserved items)
    for (const rp of reservedProducts) {
      if (rp.reservedQuantity > 0) {
        try {
          await client
            .patch(rp.id)
            .dec({ stock: rp.reservedQuantity })
            .commit()
        } catch (err) {
          logger.error(`Failed to decrement stock for ${rp.id}`, {
            component: 'ReserveAPI',
            category: LogCategory.RESERVATION,
            error: {
              name: 'SanityPatchError',
              message: err instanceof Error ? err.message : String(err)
            }
          })
          // Rollback Redis key on Sanity failure
          await ttlManager.removeReservationToken(reservationToken)
          throw err
        }
      }
    }

    // Store in idempotency cache
    const responseData = {
      reservationToken,
      reservedBasket: {
        products: reservedProducts,
        amountPln,
        currency: clientBasket.currency || 'PLN'
      },
      expiresAt: expiresAt.toISOString()
    }

    await idempotencyManager.storeResponse(
      idempotencyKey,
      responseData,
      JSON.stringify(body)
    )

    logger.info('Reservation created successfully', {
      component: 'ReserveAPI',
      category: LogCategory.RESERVATION,
      requestId,
      reservationToken,
      duration: Date.now() - startTime,
      metadata: { productCount: reservedProducts.length, amountPln }
    })

    return NextResponse.json({
      success: true,
      requestId,
      status: 'processing',
      data: responseData
    } as APIResponse, { status: 202 })

  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error('Reserve API failed', {
      component: 'ReserveAPI',
      category: LogCategory.API,
      requestId,
      duration: Date.now() - startTime,
      error: { name: err.name, message: err.message, stack: err.stack }
    })

    return NextResponse.json({
      success: false,
      requestId,
      status: 'failed',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An internal error occurred'
      }
    } as APIResponse, { status: 500 })
  }
}
