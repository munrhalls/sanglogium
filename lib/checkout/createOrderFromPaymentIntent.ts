import { backendClient } from '@/sanity-cms/lib/backendClient'
import { logCheckoutEvent } from '@/lib/dev/event-logger'
import Stripe from 'stripe'

interface ProductDoc {
  _id: string
  name: string
  price_data: { unit_amount: number } | null
}

interface BasketItem {
  productId: string
  quantity: number
}

export async function createOrderFromPaymentIntent(pi: Stripe.PaymentIntent): Promise<void> {
  const paymentIntentId = pi.id
  const traceId = pi.metadata?.checkoutSessionId || 'unknown'

  await logCheckoutEvent({ correlationId: traceId, slice: 'order-create', event: 'order_create_start', data: { paymentIntentId }, outcome: 'success' });

  // Step 1: Idempotency — skip if order already exists for this PI
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

  // Step 2: Read order data from PI metadata (enriched by payment-intent-session route)
  const rawBasket = pi.metadata?.basket
  const rawAddress = pi.metadata?.address
  const shippingCode = pi.metadata?.shippingCode ?? ''
  const shippingCostStr = pi.metadata?.shippingCost ?? '0'
  const shippingMethodName = pi.metadata?.shippingMethodName ?? ''
  const shippingCarrier = pi.metadata?.shippingCarrier ?? ''
  const shippingEstimatedDaysStr = pi.metadata?.shippingEstimatedDays ?? ''
  const customerEmail = pi.metadata?.email ?? ''

  if (!rawBasket || !rawAddress) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'order-create', event: 'order_missing_metadata', data: { paymentIntentId }, outcome: 'error' })
    throw new Error(`Missing basket/address metadata for PI ${paymentIntentId}`)
  }

  let basket: BasketItem[]
  let address: { firstName?: string; lastName?: string; regionCode: string; postalCode: string; street: string; streetNumber: string; city: string }
  try {
    basket = JSON.parse(rawBasket)
    address = JSON.parse(rawAddress)
  } catch {
    await logCheckoutEvent({ correlationId: traceId, slice: 'order-create', event: 'order_metadata_parse_error', data: { paymentIntentId }, outcome: 'error' })
    throw new Error(`Failed to parse basket/address metadata for PI ${paymentIntentId}`)
  }

  if (!Array.isArray(basket) || basket.length === 0) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'order-create', event: 'order_empty_basket', data: { paymentIntentId }, outcome: 'error' })
    throw new Error(`Empty basket in metadata for PI ${paymentIntentId}`)
  }

  await logCheckoutEvent({ correlationId: traceId, slice: 'order-create', event: 'order_metadata_parsed', data: { paymentIntentId, itemCount: basket.length }, outcome: 'success' })

  // Step 3: Fetch product names and prices from Sanity
  const productIds = basket.map((item) => item.productId)
  const products = await backendClient.fetch<ProductDoc[]>(
    `*[_type == "product" && _id in $ids]{ _id, name, price_data { unit_amount } }`,
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

  // Step 5: Build shippingMethod from metadata
  const shippingMethod = shippingMethodName ? {
    name: shippingMethodName,
    carrier: shippingCarrier || shippingCode,
    price: parseInt(shippingCostStr, 10) || 0,
    estimatedDays: parseInt(shippingEstimatedDaysStr, 10) || undefined,
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
  const shippingCost = parseInt(shippingCostStr, 10) || 0
  const total = pi.amount
  const currency = pi.currency.toUpperCase()

  const pricing = {
    subtotal,
    shipping: shippingCost,
    tax: 0,
    total,
    currency,
  }

  // Step 8: Generate order identifiers
  const year = new Date().getFullYear()
  const orderCount = await backendClient.fetch<number>(
    `count(*[_type == "order" && dates.orderedAt >= $yearStart])`,
    { yearStart: `${year}-01-01T00:00:00.000Z` }
  )
  const orderNumber = `ORD-${year}-${String(orderCount + 1).padStart(4, '0')}`
  const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  const now = new Date().toISOString()

  // Step 9: Create order document
  const orderDoc = {
    _type: 'order' as const,
    orderNumber,
    orderId,
    paymentIntentId,
    customerEmail: customerEmail || 'guest@checkout',
    isGuest: true,
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
    },
    ...(shippingMethod ? { shippingMethod } : {}),
  }

  await backendClient.create(orderDoc as Parameters<typeof backendClient.create>[0])

  await logCheckoutEvent({ correlationId: traceId, slice: 'order-create', event: 'order_created', data: { orderNumber, orderId, paymentIntentId, itemCount: items.length }, outcome: 'success' })

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[ORDER CREATE] Order ${orderNumber} created for PI ${paymentIntentId}`)
  }

  // Step 9: Decrement stock
  await Promise.all(
    basket.map((item) =>
      backendClient
        .patch(item.productId)
        .dec({ stock: item.quantity })
        .commit()
    )
  )

  await logCheckoutEvent({ correlationId: traceId, slice: 'order-create', event: 'order_stock_decremented', data: { itemCount: basket.length }, outcome: 'success' })

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[ORDER CREATE] Stock decremented for ${basket.length} items`)
  }
}
