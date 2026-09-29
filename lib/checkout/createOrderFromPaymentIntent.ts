import { backendClient } from '@/sanity-cms/lib/backendClient'
import { logCheckoutEvent } from '@/lib/dev/event-logger'
import { sendOrderConfirmationEmail } from '@/lib/email'
import Stripe from 'stripe'
import { z } from 'zod'

interface ProductDoc {
  _id: string
  _rev: string
  name: string
  stock: number
  price_data: { unit_amount: number } | null
}

interface BasketItem {
  productId: string
  quantity: number
}

interface OrderAddress {
  firstName?: string
  lastName?: string
  regionCode: string
  postalCode: string
  street: string
  streetNumber: string
  city: string
}

export interface OrderSessionData {
  basket: BasketItem[]
  address?: OrderAddress
  shippingCode?: string
  shippingCost?: number
  shippingMethodName?: string
  shippingCarrier?: string
  shippingEstimatedDays?: number
  email?: string
  checkoutSessionId?: string
  userId?: string
}

const STRIPE_METADATA_MAX_SAFE = 450

function resolveOrderData(
  pi: Stripe.PaymentIntent,
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
      basket: sessionData.basket,
      address: sessionData.address,
      shippingCode: sessionData.shippingCode ?? '',
      shippingCost: sessionData.shippingCost ?? 0,
      shippingMethodName: sessionData.shippingMethodName ?? '',
      shippingCarrier: sessionData.shippingCarrier ?? '',
      shippingEstimatedDays: sessionData.shippingEstimatedDays,
      customerEmail: sessionData.email ?? pi.receipt_email ?? '',
      traceId,
      userId: sessionData.userId,
    }
  }

  // Fallback to PI metadata (webhook path)
  const rawBasket = pi.metadata?.basket
  const rawAddress = pi.metadata?.address
  const shippingCode = pi.metadata?.shippingCode ?? ''
  const shippingCostStr = pi.metadata?.shippingCost ?? '0'
  const shippingMethodName = pi.metadata?.shippingMethodName ?? ''
  const shippingCarrier = pi.metadata?.shippingCarrier ?? ''
  const shippingEstimatedDaysStr = pi.metadata?.shippingEstimatedDays ?? ''
  const customerEmail = pi.metadata?.email || pi.receipt_email || ''

  if (!rawBasket || !rawAddress) {
    throw new Error(`Missing basket/address metadata for PI ${pi.id}`)
  }

  if (rawBasket.length > STRIPE_METADATA_MAX_SAFE || rawAddress.length > STRIPE_METADATA_MAX_SAFE) {
    throw new Error(`Metadata value exceeds safe length limit for PI ${pi.id}`)
  }

  // C-02: Support both compact format (productId:quantity,...) and legacy JSON
  let basket: BasketItem[]
  let address: OrderAddress
  try {
    if (rawBasket.includes(':')) {
      basket = rawBasket.split(',').map(s => {
        const [productId, quantity] = s.split(':')
        return { productId, quantity: parseInt(quantity, 10) }
      })
    } else {
      basket = JSON.parse(rawBasket)
    }
    address = JSON.parse(rawAddress)
  } catch {
    throw new Error(`Failed to parse basket/address metadata for PI ${pi.id}`)
  }

  if (!Array.isArray(basket) || basket.length === 0) {
    throw new Error(`Empty basket in metadata for PI ${pi.id}`)
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
export async function createOrderFromPaymentIntent(
  pi: Stripe.PaymentIntent,
  sessionData?: OrderSessionData
): Promise<void> {
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

  await logCheckoutEvent({ correlationId: traceId, slice: 'order-create', event: 'order_create_start', data: { paymentIntentId, source: sessionData ? 'session' : 'metadata' }, outcome: 'success' });

  // Step 1: Fast-path idempotency — skip if order already exists for this PI.
  // Also covers orders created before deterministic IDs. The atomic guard is Step 11.
  const existing = await backendClient.fetch<{ _id: string } | null>(
    `*[_type == "order" && paymentIntentId == $paymentIntentId][0]{ _id }`,
    { paymentIntentId }
  )
  if (existing) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'order-create', event: 'order_already_exists', data: { paymentIntentId }, outcome: 'success' })
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[ORDER CREATE] Order already exists for PI ${paymentIntentId} — skipping`)
    }
    return
  }

  await logCheckoutEvent({ correlationId: traceId, slice: 'order-create', event: 'order_data_resolved', data: { paymentIntentId, itemCount: basket.length }, outcome: 'success' })

  // Step 2: Validate email
  const emailValidation = z.string().email().safeParse(rawCustomerEmail)
  const customerEmail = emailValidation.success ? rawCustomerEmail : ''
  if (rawCustomerEmail && !emailValidation.success) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'order-create', event: 'order_invalid_email', data: { paymentIntentId, email: rawCustomerEmail }, outcome: 'error' })
  }

  // Step 3: Fetch product names, prices and stock (with revision, for Step 11) from Sanity
  const productIds = basket.map((item) => item.productId)
  const products = await backendClient.fetch<ProductDoc[]>(
    `*[_type == "product" && _id in $ids]{ _id, _rev, name, stock, price_data { unit_amount } }`,
    { ids: productIds }
  )
  const productMap = new Map(products.map((p) => [p._id, p]))

  // Step 4: Build order items directly from basket
  const items = basket.map((item) => {
    const product = productMap.get(item.productId)
    const price = product?.price_data?.unit_amount ?? 0
    return {
      productId: item.productId,
      name: product?.name ?? item.productId,
      quantity: item.quantity,
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
    state: address.regionCode,
    postalCode: address.postalCode,
    country: address.regionCode,
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
  const charge =
    typeof pi.latest_charge === 'object' && pi.latest_charge !== null
      ? pi.latest_charge
      : null
  const paymentMethodType = charge?.payment_method_details?.type ?? 'unknown'
  const cardDetails = charge?.payment_method_details?.card

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
  const quantityByProduct = new Map<string, number>()
  for (const { productId, quantity } of basket) {
    quantityByProduct.set(productId, (quantityByProduct.get(productId) ?? 0) + quantity)
  }

  const transaction = backendClient.transaction().create(orderDoc as Parameters<typeof backendClient.create>[0])
  const shortfalls: Array<{ productId: string; currentStock: number; requested: number }> = []
  for (const [productId, requested] of quantityByProduct) {
    const product = productMap.get(productId)
    const currentStock = product?.stock ?? 0
    // A paid order must always be recorded, so a line that cannot be decremented
    // (unknown product, malformed quantity, not enough stock) is skipped and reported
    // rather than allowed to reject the whole transaction.
    if (!product || !Number.isInteger(requested) || requested < 1 || currentStock < requested) {
      shortfalls.push({ productId, currentStock, requested })
      continue
    }
    transaction.patch(productId, { ifRevisionID: product._rev, dec: { stock: requested } })
  }

  try {
    await transaction.commit()
  } catch (err) {
    // A failed commit writes nothing. If the order exists, another run got there first
    // (or this commit landed and only the response was lost): nothing left to do.
    if (await backendClient.getDocument(orderId)) {
      await logCheckoutEvent({ correlationId: traceId, slice: 'order-create', event: 'order_already_exists', data: { paymentIntentId }, outcome: 'success' })
      return
    }
    throw err
  }

  await logCheckoutEvent({ correlationId: traceId, slice: 'order-create', event: 'order_created', data: { orderNumber, orderId, paymentIntentId, itemCount: items.length }, outcome: 'success' })

  for (const shortfall of shortfalls) {
    // Payment already succeeded, so the order stands; the shortfall is left for manual review
    await logCheckoutEvent({ correlationId: traceId, slice: 'order-create', event: 'order_stock_insufficient', data: shortfall, outcome: 'error' })
  }

  await logCheckoutEvent({ correlationId: traceId, slice: 'order-create', event: 'order_stock_decremented', data: { itemCount: quantityByProduct.size - shortfalls.length }, outcome: 'success' })

  try {
    await sendOrderConfirmationEmail({
      to: customerEmail,
      orderNumber,
      items,
      total,
      shippingAddress,
    })
  } catch {
    // email failure is non-fatal — order already created
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[ORDER CREATE] Order ${orderNumber} created for PI ${paymentIntentId}, stock decremented for ${quantityByProduct.size - shortfalls.length} products`)
  }
}
