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
import { AtomicReservationManager } from '@/lib/checkout/reservation/atomic-reservation-manager'

// ============================================================================
// Queue Handler Functions
// ============================================================================

async function handleReservationCreation(clientBasket: any) {
  const logger = getLogger()
  const redis = getRedisClient()
  const atomicManager = new AtomicReservationManager(redis)

  console.log('handleReservationCreation called with:', JSON.stringify(clientBasket, null, 2))

  // Use AtomicReservationManager with WATCH/MULTI pattern
  let result;
  try {
    result = await atomicManager.reserveStock(clientBasket)
    console.log('AtomicReservationManager result:', JSON.stringify(result, null, 2))
    console.log('Products in result:', result.products?.length || 0)
    if (result.products && result.products.length > 0) {
      console.log('First product:', JSON.stringify(result.products[0], null, 2))
    }
  } catch (error) {
    console.error('AtomicReservationManager threw error:', error)
    throw error
  }

  if (!result.success) {
    logger.error(`Atomic reservation failed: ${result.error}`, {
      component: 'ReservationHandler',
      category: LogCategory.RESERVATION,
      metadata: { error: result.error }
    })
    throw new Error(result.error || 'Reservation failed')
  }

  logger.info(`Atomic reservation successful: ${result.reservationId}`, {
    component: 'ReservationHandler',
    category: LogCategory.RESERVATION,
    reservationId: result.reservationId,
    metadata: { productCount: result.products?.length }
  })

  return result.products
}

async function handleReservationRollback(payload: any) {
  const logger = getLogger()
  const redis = getRedisClient()
  const atomicManager = new AtomicReservationManager(redis)

  if (!payload.reservationId || !payload.products || !Array.isArray(payload.products)) {
    logger.error('Invalid rollback payload', {
      component: 'ReservationHandler',
      category: LogCategory.RESERVATION,
      metadata: { payload }
    })
    return
  }

  const success = await atomicManager.rollbackReservation(
    payload.reservationId,
    payload.products
  )

  if (!success) {
    logger.error(`Atomic rollback failed: ${payload.reservationId}`, {
      component: 'ReservationHandler',
      category: LogCategory.RESERVATION,
      reservationId: payload.reservationId
    })
    throw new Error('Rollback failed')
  }

  logger.info(`Atomic rollback successful: ${payload.reservationId}`, {
    component: 'ReservationHandler',
    category: LogCategory.RESERVATION,
    reservationId: payload.reservationId
  })
}

async function handleReservationRealization(payload: any) {
  const logger = getLogger()
  const redis = getRedisClient()
  const atomicManager = new AtomicReservationManager(redis)

  if (!payload.reservationId || !payload.products || !Array.isArray(payload.products)) {
    logger.error('Invalid realization payload', {
      component: 'ReservationHandler',
      category: LogCategory.RESERVATION,
      metadata: { payload }
    })
    return
  }

  const success = await atomicManager.realizeReservation(
    payload.reservationId,
    payload.products
  )

  if (!success) {
    logger.error(`Atomic realization failed: ${payload.reservationId}`, {
      component: 'ReservationHandler',
      category: LogCategory.RESERVATION,
      reservationId: payload.reservationId
    })
    throw new Error('Realization failed')
  }

  logger.info(`Atomic realization successful: ${payload.reservationId}`, {
    component: 'ReservationHandler',
    category: LogCategory.RESERVATION,
    reservationId: payload.reservationId
  })
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
