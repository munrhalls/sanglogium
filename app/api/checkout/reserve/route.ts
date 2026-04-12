// POST /api/checkout/reserve
// Creates a reservation from the client basket
// Requires: Content-Type: application/json, Idempotency-Key header
// Returns: 202 (processing) or 200 (cached idempotent) or 4xx (error)

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getRedisClient } from '@/lib/checkout/reservation/redis-client'
import { FIFOQueue } from '@/lib/checkout/reservation/fifo-queue'
import { getLogger } from '@/lib/checkout/reservation/logging'
import { LogCategory } from '@/lib/checkout/reservation/types'
import type {
  QueueRequest,
  APIResponse,
} from '@/lib/checkout/reservation/types'
import { client } from '@/sanity/lib/client'
import type { ReservedProduct } from '@/lib/checkout/reservation/types'

// ============================================================================
// Queue Handler Functions
// ============================================================================

async function handleReservationCreation(clientBasket: any) {
  const logger = getLogger()

  // Fetch product data from Sanity
  const productIds = clientBasket.products.map((p: any) => p.id)
  const products = await client.fetch<Array<{
    _id: string
    name: string
    stock: number
    reservedStock: number
    pricePln: number
    slug: { current: string }
    stripePriceId: string
    image: string | null
    brand: { _id: string; name: string; slug: { current: string } } | null
  }>>(
    `*[_type == "product" && _id in $ids]{
      _id, name, stock, reservedStock, pricePln,
      slug, stripePriceId,
      "image": image.asset->url,
      brand->{ _id, name, slug }
    }`,
    { ids: productIds }
  )

  // Build reserved products with stock check
  const reservedProducts: ReservedProduct[] = clientBasket.products.map((item: any) => {
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

    // Calculate available stock: stock - reservedStock
    const availableQuantity = Math.max(0, product.stock - product.reservedStock)
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

  // Increment reservedStock for reserved items (PRD requirement)
  for (const rp of reservedProducts) {
    if (rp.reservedQuantity > 0) {
      try {
        await client
          .patch(rp.id)
          .inc({ reservedStock: rp.reservedQuantity })
          .commit()

        logger.info(`Incremented reservedStock for ${rp.id}`, {
          component: 'ReservationHandler',
          category: LogCategory.RESERVATION,
          metadata: {
            productId: rp.id,
            reservedQuantity: rp.reservedQuantity,
            requestedQuantity: rp.requestedQuantity
          }
        })
      } catch (err) {
        logger.error(`Failed to increment reservedStock for ${rp.id}`, {
          component: 'ReservationHandler',
          category: LogCategory.RESERVATION,
          error: {
            name: err instanceof Error ? err.name : 'Unknown',
            message: err instanceof Error ? err.message : String(err)
          }
        })
        throw err
      }
    }
  }

  return reservedProducts
}

async function handleReservationRollback(payload: any) {
  const logger = getLogger()

  if (!payload.products || !Array.isArray(payload.products)) {
    logger.error('Invalid rollback payload', {
      component: 'ReservationHandler',
      category: LogCategory.RESERVATION,
      metadata: { payload }
    })
    return
  }

  // Decrement reservedStock for rollback (PRD requirement)
  for (const product of payload.products) {
    if (product.id && product.reservedQuantity > 0) {
      try {
        await client
          .patch(product.id)
          .dec({ reservedStock: product.reservedQuantity })
          .commit()

        logger.info(`Decremented reservedStock for rollback: ${product.id}`, {
          component: 'ReservationHandler',
          category: LogCategory.RESERVATION,
          metadata: {
            productId: product.id,
            reservedQuantity: product.reservedQuantity
          }
        })
      } catch (err) {
        logger.error(`Failed to decrement reservedStock for rollback: ${product.id}`, {
          component: 'ReservationHandler',
          category: LogCategory.RESERVATION,
          error: {
            name: err instanceof Error ? err.name : 'Unknown',
            message: err instanceof Error ? err.message : String(err)
          }
        })
      }
    }
  }
}

async function handleReservationRealization(payload: any) {
  const logger = getLogger()

  if (!payload.products || !Array.isArray(payload.products)) {
    logger.error('Invalid realization payload', {
      component: 'ReservationHandler',
      category: LogCategory.RESERVATION,
      metadata: { payload }
    })
    return
  }

  // Decrement both stock and reservedStock for payment realization (PRD requirement)
  for (const product of payload.products) {
    if (product.id && product.reservedQuantity > 0) {
      try {
        await client
          .patch(product.id)
          .dec({
            stock: product.reservedQuantity,
            reservedStock: product.reservedQuantity
          })
          .commit()

        logger.info(`Realized reservation: decremented stock and reservedStock for ${product.id}`, {
          component: 'ReservationHandler',
          category: LogCategory.RESERVATION,
          metadata: {
            productId: product.id,
            reservedQuantity: product.reservedQuantity
          }
        })
      } catch (err) {
        logger.error(`Failed to realize reservation for ${product.id}`, {
          component: 'ReservationHandler',
          category: LogCategory.RESERVATION,
          error: {
            name: err instanceof Error ? err.name : 'Unknown',
            message: err instanceof Error ? err.message : String(err)
          }
        })
      }
    }
  }
}

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

    // Initialize queue with handlers
    const redis = getRedisClient()
    const queue = new FIFOQueue(
      redis,
      async (request: QueueRequest) => {
        // Handle reservation creation
        await handleReservationCreation(request.payload.clientBasket)
      },
      async (request: QueueRequest) => {
        // Handle rollback
        await handleReservationRollback(request.payload)
      },
      async (request: QueueRequest) => {
        // Handle realization
        await handleReservationRealization(request.payload)
      }
    )

    // Enqueue reservation request
    const queueRequest: QueueRequest = {
      id: uuidv4(),
      type: 'create_reservation',
      idempotencyKey,
      priority: 'normal',
      payload: {
        clientBasket: body.clientBasket
      },
      retryCount: 0
    }

    const queueResponse = await queue.enqueue(queueRequest)

    if (queueResponse.status === 'error') {
      return NextResponse.json({
        success: false,
        requestId,
        status: 'failed',
        error: {
          code: queueResponse.error || 'QUEUE_ERROR',
          message: 'Failed to process reservation request'
        }
      } as APIResponse, { status: 500 })
    }

    logger.info('Reservation request enqueued', {
      component: 'ReserveAPI',
      category: LogCategory.QUEUE,
      requestId,
      reservationId: queueResponse.requestId,
      duration: Date.now() - startTime
    })

    // Return processing status for async queue processing
    return NextResponse.json({
      success: true,
      requestId,
      status: 'processing',
      data: {
        reservationId: queueResponse.requestId,
        message: 'Reservation is being processed'
      }
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
