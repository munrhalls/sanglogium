// Atomic Reservation Manager with Redis WATCH/MULTI
// Implements optimistic locking for race condition prevention
// Follows PRD requirement: "first atomically reserve in Redis (with lock), then patch Sanity"

import type Redis from 'ioredis'
import { v4 as uuidv4 } from 'uuid'
import { getLogger } from './logging'
import { LogCategory } from './types'
import { client, writeClient } from '@/sanity/lib/client'

interface StockCheck {
  productId: string
  requestedQuantity: number
  availableStock: number
  reservedStock: number
}

interface ReservationResult {
  success: boolean
  reservationId?: string
  products?: Array<{
    id: string
    requestedQuantity: number
    reservedQuantity: number
    availableQuantity: number
    pricePln: number
    totalPricePln: number
    name: string
    stripePriceId: string
    imageUrl: string | null
    slug: string
    brand: {
      id: string
      name: string
      slug: string
    }
  }>
  error?: string
}

export class AtomicReservationManager {
  private logger = getLogger()
  private maxRetries = 3

  constructor(private redis: Redis) {}

  /**
   * Atomically reserve stock using Redis WATCH/MULTI pattern
   * Phase 1: Check and lock stock in Redis
   * Phase 2: Update Sanity with confirmed quantities
   */
  async reserveStock(clientBasket: any): Promise<ReservationResult> {
    const reservationId = uuidv4()
    const startTime = Date.now()

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.info(`Reservation attempt ${attempt}/${this.maxRetries}`, {
          component: 'AtomicReservationManager',
          category: LogCategory.RESERVATION,
          metadata: { reservationId, attempt }
        })

        // Phase 1: Atomic stock check and lock in Redis
        const stockChecks = await this.performAtomicStockCheck(
          clientBasket.products,
          reservationId
        )

        if (!stockChecks.success) {
          return stockChecks
        }

        // Phase 2: Update Sanity with confirmed quantities
        const sanityResult = await this.updateSanityStock(
          stockChecks.products!,
          reservationId
        )

        if (!sanityResult.success) {
          // Rollback Redis locks on Sanity failure
          await this.rollbackRedisLocks(reservationId)
          return sanityResult
        }

        // Success - commit Redis locks
        await this.commitRedisLocks(reservationId)

        this.logger.info(`Reservation successful: ${reservationId}`, {
          component: 'AtomicReservationManager',
          category: LogCategory.RESERVATION,
          reservationId,
          duration: Date.now() - startTime,
          metadata: { productCount: stockChecks.products?.length }
        })

        return {
          success: true,
          reservationId,
          products: stockChecks.products
        }

      } catch (error: any) {
        if (error.message?.includes('WATCH')) {
          // Optimistic lock conflict - retry
          if (attempt < this.maxRetries) {
            const delay = Math.random() * 100 + 50 // 50-150ms jitter
            this.logger.warn(`Optimistic lock conflict, retrying in ${delay}ms`, {
              component: 'AtomicReservationManager',
              category: LogCategory.RESERVATION,
              reservationId,
              attempt,
              error: error.message
            })
            await new Promise(resolve => setTimeout(resolve, delay))
            continue
          }
        }

        this.logger.error(`Reservation failed after ${attempt} attempts`, {
          component: 'AtomicReservationManager',
          category: LogCategory.RESERVATION,
          reservationId,
          attempt,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack
          }
        })

        // Cleanup any partial Redis locks
        await this.rollbackRedisLocks(reservationId)

        return {
          success: false,
          error: attempt >= this.maxRetries ? 'Max retries exceeded' : error.message
        }
      }
    }

    return {
      success: false,
      error: 'Max retries exceeded'
    }
  }

  /**
   * Phase 1: Atomic stock check using Redis WATCH/MULTI
   */
  private async performAtomicStockCheck(
    products: any[],
    reservationId: string
  ): Promise<ReservationResult> {
    const productIds = products.map(p => p.id)

    // Fetch current stock from Sanity
    const sanityProducts = await client.fetch<Array<{
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
        brand->{_id, name, slug}
      }`,
      { ids: productIds }
    )

    // Build reserved products with stock availability
    const reservedProducts: any[] = []
    const redisLocks: Array<{ key: string; value: string }> = []

    for (const item of products) {
      const product = sanityProducts.find(p => p._id === item.id)
      if (!product) {
        return {
          success: false,
          error: `Product ${item.id} not found`
        }
      }

      // Calculate available stock
      const availableStock = Math.max(0, product.stock - product.reservedStock)
      const reservedQuantity = Math.min(item.quantity, availableStock)

      if (reservedQuantity === 0 && item.quantity > 0) {
        return {
          success: false,
          error: `Product ${product.name} is out of stock`
        }
      }

      reservedProducts.push({
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
      })

      // Prepare Redis lock for this product
      if (reservedQuantity > 0) {
        redisLocks.push({
          key: `stock_lock:${product._id}`,
          value: `${reservationId}:${reservedQuantity}`
        })
      }
    }

    // Atomic Redis operation with WATCH/MULTI
    const watchKeys = redisLocks.map(lock => lock.key)

    // Start WATCH transaction
    await this.redis.watch(...watchKeys)

    // Check if any locks already exist (conflict)
    const existingLocks = await this.redis.mget(...watchKeys)
    const hasConflict = existingLocks.some(lock => lock !== null)

    if (hasConflict) {
      await this.redis.unwatch()
      return {
        success: false,
        error: 'Stock conflict detected'
      }
    }

    // MULTI transaction to set locks
    const multi = this.redis.multi()

    // Set locks with 5-minute TTL
    for (const lock of redisLocks) {
      multi.setex(lock.key, 300, lock.value) // 5 minutes
    }

    // Also set reservation metadata
    multi.setex(`reservation:${reservationId}`, 600, JSON.stringify({
      status: 'locked',
      createdAt: new Date().toISOString(),
      products: reservedProducts.map(p => ({
        id: p.id,
        reservedQuantity: p.reservedQuantity
      }))
    }))

    const results = await multi.exec()

    if (!results) {
      // Transaction failed due to WATCH conflict
      throw new Error('WATCH transaction failed - concurrent modification detected')
    }

    return {
      success: true,
      products: reservedProducts
    }
  }

  /**
   * Phase 2: Update Sanity with confirmed quantities
   */
  private async updateSanityStock(
    products: any[],
    reservationId: string
  ): Promise<ReservationResult> {
    try {
      // Increment reservedStock for all reserved items
      const sanityTransaction = writeClient.transaction()

      for (const product of products) {
        if (product.reservedQuantity > 0) {
          sanityTransaction.patch(product.id)
            .inc({ reservedStock: product.reservedQuantity })
        }
      }

      console.log('Committing Sanity transaction...')
      await sanityTransaction.commit()
      console.log('Sanity transaction committed successfully')

      return {
        success: true,
        products
      }
    } catch (error: any) {
      this.logger.error('Sanity stock update failed', {
        component: 'AtomicReservationManager',
        category: LogCategory.RESERVATION,
        reservationId,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      })

      return {
        success: false,
        error: `Sanity update failed: ${error.message}`
      }
    }
  }

  /**
   * Commit Redis locks (convert to active reservation)
   */
  private async commitRedisLocks(reservationId: string): Promise<void> {
    const reservationKey = `reservation:${reservationId}`
    const reservation = await this.redis.get(reservationKey)

    if (reservation) {
      const data = JSON.parse(reservation)
      data.status = 'active'
      data.committedAt = new Date().toISOString()

      await this.redis.setex(reservationKey, 600, JSON.stringify(data)) // 10 minutes TTL
    }
  }

  /**
   * Rollback Redis locks on failure
   */
  private async rollbackRedisLocks(reservationId: string): Promise<void> {
    try {
      // Get reservation data to find locks
      const reservationKey = `reservation:${reservationId}`
      const reservation = await this.redis.get(reservationKey)

      if (reservation) {
        const data = JSON.parse(reservation)

        // Delete all stock locks for this reservation
        const pipeline = this.redis.pipeline()

        if (data.products) {
          for (const product of data.products) {
            pipeline.del(`stock_lock:${product.id}`)
          }
        }

        pipeline.del(reservationKey)
        await pipeline.exec()
      }
    } catch (error: any) {
      this.logger.error('Failed to rollback Redis locks', {
        component: 'AtomicReservationManager',
        category: LogCategory.RESERVATION,
        reservationId,
        error: {
          name: error.name,
          message: error.message
        }
      })
    }
  }

  /**
   * Rollback a completed reservation
   */
  async rollbackReservation(reservationId: string, products: any[]): Promise<boolean> {
    try {
      // Phase 1: Decrement reservedStock in Sanity
      const sanityTransaction = writeClient.transaction()

      for (const product of products) {
        if (product.id && product.reservedQuantity > 0) {
          sanityTransaction.patch(product.id)
            .dec({ reservedStock: product.reservedQuantity })
        }
      }

      console.log('Committing Sanity transaction...')
      await sanityTransaction.commit()
      console.log('Sanity transaction committed successfully')

      // Phase 2: Clean up Redis
      await this.rollbackRedisLocks(reservationId)

      this.logger.info(`Reservation rolled back: ${reservationId}`, {
        component: 'AtomicReservationManager',
        category: LogCategory.RESERVATION,
        reservationId
      })

      return true
    } catch (error: any) {
      this.logger.error('Rollback failed', {
        component: 'AtomicReservationManager',
        category: LogCategory.RESERVATION,
        reservationId,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      })

      return false
    }
  }

  /**
   * Realize a reservation (payment successful)
   */
  async realizeReservation(reservationId: string, products: any[]): Promise<boolean> {
    try {
      // Phase 1: Decrement both stock and reservedStock in Sanity
      const sanityTransaction = writeClient.transaction()

      for (const product of products) {
        if (product.id && product.reservedQuantity > 0) {
          sanityTransaction.patch(product.id)
            .dec({
              stock: product.reservedQuantity,
              reservedStock: product.reservedQuantity
            })
        }
      }

      console.log('Committing Sanity transaction...')
      await sanityTransaction.commit()
      console.log('Sanity transaction committed successfully')

      // Phase 2: Clean up Redis
      await this.rollbackRedisLocks(reservationId)

      this.logger.info(`Reservation realized: ${reservationId}`, {
        component: 'AtomicReservationManager',
        category: LogCategory.RESERVATION,
        reservationId
      })

      return true
    } catch (error: any) {
      this.logger.error('Realization failed', {
        component: 'AtomicReservationManager',
        category: LogCategory.RESERVATION,
        reservationId,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      })

      return false
    }
  }
}
