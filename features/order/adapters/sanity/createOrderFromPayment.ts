import "server-only";
import { backendClient } from '@/platform/sanity/backendClient'
import { logEvent } from '@/platform/utils/eventLogger'
import type { OrderBasketItem as BasketItem, OrderAddress, OrderSessionData, CreateOrderResult, PaidPayment } from '@/features/order/core/types/orderTypes'
import { z } from 'zod'

interface ProductDoc {
  _id: string
  _rev: string
  name: string
  stock: number
  price_data: { unit_amount: number } | null
}


const STRIPE_METADATA_MAX_SAFE = 450

// C-02: Support both compact format (productId:quantity,...) and legacy JSON
function parseMetadataBasket(rawBasket: string): BasketItem[] {
  if (rawBasket.includes(':')) {
    return rawBasket.split(',').map(s => {
      const [productId, quantity] = s.split(':')
      return { productId, quantity: parseInt(quantity, 10) }
    })
  }
  return JSON.parse(rawBasket)
}

// The charged basket is always the payment metadata basket — a later session
// basket must not replace what the customer was charged for.
function resolveChargedBasket(pi: PaidPayment): BasketItem[] {
  const rawBasket = pi.metadata?.basket
  if (!rawBasket) {
    throw new Error(`Missing basket metadata for PI ${pi.id}`)
  }
  if (rawBasket.length > STRIPE_METADATA_MAX_SAFE) {
    throw new Error(`Metadata value exceeds safe length limit for PI ${pi.id}`)
  }
  let basket: BasketItem[]
  try {
    basket = parseMetadataBasket(rawBasket)
  } catch {
    throw new Error(`Failed to parse basket metadata for PI ${pi.id}`)
  }
  if (!Array.isArray(basket) || basket.length === 0) {
    throw new Error(`Empty basket in metadata for PI ${pi.id}`)
  }
  return basket
}

// The charged unit prices: productId:price pairs, same shape as the basket.
function resolveChargedUnitPrices(pi: PaidPayment): Map<string, number> {
  const prices = new Map<string, number>()
  const raw = pi.metadata?.unitPrices
  if (!raw) return prices
  for (const pair of raw.split(',')) {
    const [productId, price] = pair.split(':')
    const amount = parseInt(price, 10)
    if (productId && Number.isSafeInteger(amount)) {
      prices.set(productId, amount)
    }
  }
  return prices
}

function resolveOrderData(
  pi: PaidPayment,
  sessionData?: OrderSessionData
): {
  basket: BasketItem[]
  address: OrderAddress
  shippingCode: string
  shippingCost: number
  shippingMethodName: string
  shippingCarrier: string
  shippingEstimatedDays?: number
  customerEmail: string
  traceId: string
  userId?: string
} {
  const traceId = sessionData?.checkoutSessionId ?? pi.metadata?.checkoutSessionId ?? 'unknown'

  if (sessionData) {
    if (!sessionData.basket || sessionData.basket.length === 0) {
      throw new Error(`Empty basket in session data for PI ${pi.id}`)
    }
    if (!sessionData.address) {
      throw new Error(`Missing address in session data for PI ${pi.id}`)
    }
    return {
      basket: resolveChargedBasket(pi),
      address: sessionData.address,
      shippingCode: sessionData.shippingCode ?? '',
      shippingCost: sessionData.shippingCost ?? 0,
      shippingMethodName: sessionData.shippingMethodName ?? '',
      shippingCarrier: sessionData.shippingCarrier ?? '',
      shippingEstimatedDays: sessionData.shippingEstimatedDays,
      customerEmail: sessionData.email ?? pi.receiptEmail ?? '',
      traceId,
      userId: sessionData.userId,
    }
  }

  // Fallback to PI metadata (webhook path)
  const rawAddress = pi.metadata?.address
  const shippingCode = pi.metadata?.shippingCode ?? ''
  const shippingCostStr = pi.metadata?.shippingCost ?? '0'
  const shippingMethodName = pi.metadata?.shippingMethodName ?? ''
  const shippingCarrier = pi.metadata?.shippingCarrier ?? ''
  const shippingEstimatedDaysStr = pi.metadata?.shippingEstimatedDays ?? ''
  const customerEmail = pi.metadata?.email || pi.receiptEmail || ''

  if (!rawAddress) {
    throw new Error(`Missing basket/address metadata for PI ${pi.id}`)
  }

  if (rawAddress.length > STRIPE_METADATA_MAX_SAFE) {
    throw new Error(`Metadata value exceeds safe length limit for PI ${pi.id}`)
  }

  const basket = resolveChargedBasket(pi)
  let address: OrderAddress
  try {
    address = JSON.parse(rawAddress)
  } catch {
    throw new Error(`Failed to parse basket/address metadata for PI ${pi.id}`)
  }

  const userId = pi.metadata?.userId || undefined

  return {
    basket,
    address,
    shippingCode,
    shippingCost: parseInt(shippingCostStr, 10) || 0,
    shippingMethodName,
    shippingCarrier,
    shippingEstimatedDays: parseInt(shippingEstimatedDaysStr, 10) || undefined,
    customerEmail,
    traceId,
    userId,
  }
}

/**
 * Creates the order for a succeeded PaymentIntent and decrements stock — atomically.
 * Safe to call any number of times, concurrently, from the webhook and the return
 * handler: a payment ends with exactly one order and its stock decremented exactly once.
 */
export async function createOrderFromPayment(
  pi: PaidPayment,
  sessionData?: OrderSessionData
): Promise<CreateOrderResult> {
  const paymentIntentId = pi.id

  const {
    basket,
    address,
    shippingCode,
    shippingCost,
    shippingMethodName,
    shippingCarrier,
    shippingEstimatedDays,
    customerEmail: rawCustomerEmail,
    traceId,
    userId,
  } = resolveOrderData(pi, sessionData)

  await logEvent({ correlationId: traceId, slice: 'order-create', event: 'order_create_start', data: { paymentIntentId, source: sessionData ? 'session' : 'metadata' }, outcome: 'success' });

  // Step 1: Fast-path idempotency — skip if order already exists for this PI.
  // Also covers orders created before deterministic IDs. The atomic guard is Step 11.
  const existing = await backendClient.fetch<{ _id: string } | null>(
    `*[_type == "order" && paymentIntentId == $paymentIntentId][0]{ _id }`,
    { paymentIntentId }
  )
  if (existing) {
    await logEvent({ correlationId: traceId, slice: 'order-create', event: 'order_already_exists', data: { paymentIntentId }, outcome: 'success' })
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[ORDER CREATE] Order already exists for PI ${paymentIntentId} — skipping`)
    }
    return { created: false }
  }

  await logEvent({ correlationId: traceId, slice: 'order-create', event: 'order_data_resolved', data: { paymentIntentId, itemCount: basket.length }, outcome: 'success' })

  // Step 2: Validate email
  const emailValidation = z.string().email().safeParse(rawCustomerEmail)
  const customerEmail = emailValidation.success ? rawCustomerEmail : ''
  if (rawCustomerEmail && !emailValidation.success) {
    await logEvent({ correlationId: traceId, slice: 'order-create', event: 'order_invalid_email', data: { paymentIntentId, email: rawCustomerEmail }, outcome: 'error' })
  }

  // Step 3: Fetch product names, prices and stock (with revision, for Step 11) from Sanity
  const productIds = basket.map((item) => item.productId)
  const products = await backendClient.fetch<ProductDoc[]>(
    `*[_type == "product" && _id in $ids]{ _id, _rev, name, stock, price_data { unit_amount } }`,
    { ids: productIds }
  )
  const productMap = new Map(products.map((p) => [p._id, p]))

  // Units taken from the shelf per product: the smaller of stock and the paid
  // quantity, and only when the product exists and both counts are usable.
  const requestedByProduct = new Map<string, number>()
  for (const { productId, quantity } of basket) {
    requestedByProduct.set(productId, (requestedByProduct.get(productId) ?? 0) + quantity)
  }
  const untakenByProduct = new Map<string, number>()
  for (const [productId, requested] of requestedByProduct) {
    const product = productMap.get(productId)
    const stock = product?.stock
    const take = product && Number.isSafeInteger(requested) && requested >= 1 && Number.isSafeInteger(stock) && (stock as number) >= 1
      ? Math.min(stock as number, requested)
      : 0
    untakenByProduct.set(productId, take)
  }

  // Step 4: Build order items directly from basket. A charged unit price recorded
  // in the payment metadata wins over the catalog price, which may have changed since.
  // Each line records how many of its units were taken, in basket order.
  const chargedUnitPrices = resolveChargedUnitPrices(pi)
  const items = basket.map((item) => {
    const product = productMap.get(item.productId)
    const price = chargedUnitPrices.get(item.productId) ?? product?.price_data?.unit_amount ?? 0
    const paidQuantity = Number.isSafeInteger(item.quantity) && item.quantity >= 1 ? item.quantity : 0
    const untaken = untakenByProduct.get(item.productId) ?? 0
    const fulfilled = Math.min(paidQuantity, untaken)
    untakenByProduct.set(item.productId, untaken - fulfilled)
    return {
      productId: item.productId,
      name: product?.name ?? item.productId,
      quantity: item.quantity,
      fulfilled,
      price,
      subtotal: price * item.quantity,
      returnStatus: 'none' as const,
    }
  })

  // Step 5: Build shippingMethod
  const shippingMethod = shippingMethodName ? {
    name: shippingMethodName,
    carrier: shippingCarrier || shippingCode,
    price: shippingCost,
    estimatedDays: shippingEstimatedDays,
  } : undefined

  // Step 6: Map address → order shippingAddress shape
  const shippingAddress = {
    name: `${address.firstName ?? ''} ${address.lastName ?? ''}`.trim() || 'Guest',
    line1: `${address.street} ${address.streetNumber}`.trim(),
    city: address.city,
    postalCode: address.postalCode,
    country: address.regionCode,
    phone: address.phone,
  }

  // Step 7: Compute pricing
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const total = pi.amount
  const currency = pi.currency.toUpperCase()

  // H-02: Read VAT from metadata (computed by payment-intent-session route) or recalculate
  const vatFromMetadata = pi.metadata?.vat ? parseInt(pi.metadata.vat, 10) : undefined
  const tax = vatFromMetadata ?? (total - Math.round(total / 1.23))

  const pricing = {
    subtotal,
    shipping: shippingCost,
    tax,
    total,
    currency,
  }

  // Step 8: Extract payment method details from charge (reliable) instead of payment_method_types[0]
  const paymentMethodType = pi.paymentMethod?.type ?? 'unknown'
  const cardDetails = pi.paymentMethod?.card

  // Step 9: Generate order identifiers
  const year = new Date().getFullYear()
  // Use PI ID suffix to guarantee uniqueness without non-atomic counter (M-01)
  const orderNumber = `ORD-${year}-${paymentIntentId.slice(-6).toUpperCase()}`
  // Deterministic: one PaymentIntent can only ever map to one order document (Step 11)
  const orderId = `order_${paymentIntentId}`
  const now = new Date().toISOString()

  // Step 10: Build order document
  const orderDoc = {
    _id: orderId,
    _type: 'order' as const,
    orderNumber,
    orderId,
    paymentIntentId,
    customerEmail,
    ...(userId ? { userId, isGuest: false } : { isGuest: true }),
    items,
    shippingAddress,
    pricing,
    status: 'processing' as const,
    dates: {
      orderedAt: now,
      paidAt: now,
    },
    payment: {
      stripePaymentIntentId: paymentIntentId,
      method: paymentMethodType,
      ...(cardDetails?.brand ? { brand: cardDetails.brand } : {}),
      ...(cardDetails?.last4 ? { last4: cardDetails.last4 } : {}),
    },
    ...(shippingMethod ? { shippingMethod } : {}),
  }

  // Step 11: Commit the order and every stock decrement as ONE Sanity transaction
  // (ADR-002, Pattern 1). All-or-nothing: an order never exists without its stock
  // movement, or the reverse.
  // - `create` on the deterministic _id fails if the order exists, so a concurrent or
  //   retried run can neither create a second order nor decrement stock twice.
  // - `ifRevisionID` makes each decrement conditional on the stock we read: if another
  //   order touched the product meanwhile, the whole transaction is rejected and nothing
  //   is written. The webhook then returns 500 and Stripe retries against fresh stock.
  const transaction = backendClient.transaction().create(orderDoc as Parameters<typeof backendClient.create>[0])
  const shortfalls: Array<{ productId: string; currentStock: number; requested: number }> = []
  for (const [productId, requested] of requestedByProduct) {
    const product = productMap.get(productId)
    const currentStock = product?.stock ?? 0
    // A paid order must always be recorded, so the shelf gives up only the units
    // it has; a shortfall is reported rather than allowed to reject the whole
    // transaction. Nothing is patched when no units can be taken.
    const stock = product?.stock
    const take = product && Number.isSafeInteger(requested) && requested >= 1 && Number.isSafeInteger(stock) && (stock as number) >= 1
      ? Math.min(stock as number, requested)
      : 0
    if (take !== requested) {
      shortfalls.push({ productId, currentStock, requested })
    }
    if (take >= 1) {
      transaction.patch(productId, { ifRevisionID: product!._rev, dec: { stock: take } })
    }
  }

  try {
    await transaction.commit()
  } catch (err) {
    // A failed commit writes nothing. If the order exists, another run got there first
    // (or this commit landed and only the response was lost): nothing left to do.
    if (await backendClient.getDocument(orderId)) {
      await logEvent({ correlationId: traceId, slice: 'order-create', event: 'order_already_exists', data: { paymentIntentId }, outcome: 'success' })
      return { created: false }
    }
    throw err
  }

  await logEvent({ correlationId: traceId, slice: 'order-create', event: 'order_created', data: { orderNumber, orderId, paymentIntentId, itemCount: items.length }, outcome: 'success' })

  for (const shortfall of shortfalls) {
    // Payment already succeeded, so the order stands; the shortfall is left for manual review
    await logEvent({ correlationId: traceId, slice: 'order-create', event: 'order_stock_insufficient', data: shortfall, outcome: 'error' })
  }

  await logEvent({ correlationId: traceId, slice: 'order-create', event: 'order_stock_decremented', data: { itemCount: requestedByProduct.size - shortfalls.length }, outcome: 'success' })

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[ORDER CREATE] Order ${orderNumber} created for PI ${paymentIntentId}, stock decremented for ${requestedByProduct.size - shortfalls.length} products`)
  }
  return { created: true, email: { to: customerEmail, orderNumber, items, total, shippingAddress, shipping: pricing.shipping, ...(shippingMethod ? { shippingMethod: { carrier: shippingMethod.carrier, estimatedDays: shippingMethod.estimatedDays } } : {}) } }
}
