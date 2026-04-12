// POST /api/checkout/rollback
// Rolls back a reservation, restoring stock
// Requires: Content-Type: application/json, Idempotency-Key header
// Returns: 200 (completed) or 4xx (error)

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getRedisClient } from '@/lib/checkout/reservation/redis-client'
import { ReservationTTLManager, IdempotencyManager } from '@/lib/checkout/reservation/redis-managers'
import { getLogger } from '@/lib/checkout/reservation/logging'
import { LogCategory } from '@/lib/checkout/reservation/types'
import type { APIResponse } from '@/lib/checkout/reservation/types'
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

    const { reservationToken } = body

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

    // Check reservation exists in Redis
    const ttlManager = new ReservationTTLManager(redis)
    const reservationData = await ttlManager.checkReservationToken(reservationToken)

    if (!reservationData) {
      logger.warn('Rollback attempted for non-existent/expired reservation', {
        component: 'RollbackAPI',
        category: LogCategory.RESERVATION,
        requestId,
        reservationToken
      })
      // Still return success for idempotency (reservation may have already expired)
    }

    // Remove Redis TTL key
    await ttlManager.removeReservationToken(reservationToken)

    // Restore stock in Sanity (fetch reservation data to know quantities)
    // In production, reservation data would be stored in Sanity or Redis
    // For now, the client sends the products to rollback
    if (body.products && Array.isArray(body.products)) {
      for (const product of body.products) {
        if (product.id && product.reservedQuantity > 0) {
          try {
            await client
              .patch(product.id)
              .inc({ stock: product.reservedQuantity })
              .commit()
          } catch (err) {
            logger.error(`Failed to restore stock for ${product.id}`, {
              component: 'RollbackAPI',
              category: LogCategory.RESERVATION,
              error: {
                name: 'SanityPatchError',
                message: err instanceof Error ? err.message : String(err)
              }
            })
          }
        }
      }
    }

    // Build response
    const responseData = {
      message: 'Reservation rolled back successfully',
      rollbackCompleted: true
    }

    // Store in idempotency cache
    await idempotencyManager.storeResponse(
      idempotencyKey,
      responseData,
      JSON.stringify(body)
    )

    logger.info('Reservation rolled back successfully', {
      component: 'RollbackAPI',
      category: LogCategory.RESERVATION,
      requestId,
      reservationToken,
      duration: Date.now() - startTime
    })

    return NextResponse.json({
      success: true,
      requestId,
      status: 'completed',
      data: responseData
    } as APIResponse, { status: 200 })

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
