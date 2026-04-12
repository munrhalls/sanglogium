// POST /api/checkout/rollback
// Rolls back a reservation, restoring stock
// Requires: Content-Type: application/json, Idempotency-Key header
// Returns: 200 (completed) or 4xx (error)

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
import { AtomicReservationManager } from '@/lib/checkout/reservation/atomic-reservation-manager'

// ============================================================================
// Queue Handler Functions (shared with reserve API)
// ============================================================================

async function handleReservationCreation(clientBasket: any) {
  const logger = getLogger()
  const redis = getRedisClient()
  const atomicManager = new AtomicReservationManager(redis)

  // Use AtomicReservationManager with WATCH/MULTI pattern
  const result = await atomicManager.reserveStock(clientBasket)

  if (!result.success) {
    logger.error(`Atomic reservation failed: ${result.error}`, {
      component: 'RollbackHandler',
      category: LogCategory.RESERVATION,
      metadata: { error: result.error }
    })
    throw new Error(result.error || 'Reservation failed')
  }

  logger.info(`Atomic reservation successful: ${result.reservationId}`, {
    component: 'RollbackHandler',
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
      component: 'RollbackHandler',
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
      component: 'RollbackHandler',
      category: LogCategory.RESERVATION,
      reservationId: payload.reservationId
    })
    throw new Error('Rollback failed')
  }

  logger.info(`Atomic rollback successful: ${payload.reservationId}`, {
    component: 'RollbackHandler',
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
      component: 'RollbackHandler',
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
      component: 'RollbackHandler',
      category: LogCategory.RESERVATION,
      reservationId: payload.reservationId
    })
    throw new Error('Realization failed')
  }

  logger.info(`Atomic realization successful: ${payload.reservationId}`, {
    component: 'RollbackHandler',
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
    if (!body?.reservationToken) {
      return NextResponse.json({
        success: false,
        requestId,
        status: 'failed',
        error: {
          code: 'MISSING_RESERVATION_TOKEN',
          message: 'reservationToken is required in request body'
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

    // Enqueue rollback request
    const queueRequest: QueueRequest = {
      id: uuidv4(),
      type: 'rollback_reservation',
      idempotencyKey,
      priority: 'normal',
      reservationToken: body.reservationToken,
      payload: {
        reservationToken: body.reservationToken,
        products: body.products
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
          message: 'Failed to process rollback request'
        }
      } as APIResponse, { status: 500 })
    }

    logger.info('Rollback request enqueued', {
      component: 'RollbackAPI',
      category: LogCategory.QUEUE,
      requestId,
      reservationToken: body.reservationToken,
      duration: Date.now() - startTime
    })

    // Return processing status for async queue processing
    return NextResponse.json({
      success: true,
      requestId,
      status: 'processing',
      data: {
        reservationId: queueResponse.requestId,
        message: 'Rollback is being processed'
      }
    } as APIResponse, { status: 202 })

  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error('Rollback API failed', {
      component: 'RollbackAPI',
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
