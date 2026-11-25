import type {
  CheckoutSessions,
  CheckoutCatalog,
  Payments,
} from "@/features/checkout/core/ports";
import { calculateGrandTotal } from "@/features/checkout/core/rules/paymentSummary";
import type { PaymentHandle } from "@/features/checkout/core/types/checkoutTypes";
import { logEvent } from "@/platform/utils/eventLogger";
import { getSession } from "@/features/auth/server";

type CreatePaymentIntentResult =
  | { ok: true; clientSecret: string | null }
  | { ok: false; error: string; status: number };

export async function createPaymentIntent(
  ports: { sessions: CheckoutSessions; catalogue: CheckoutCatalog; payments: Payments },
  input: { grandTotal?: number; metadata?: Record<string, string> }
): Promise<CreatePaymentIntentResult> {
  try {
    const { grandTotal, metadata } = input;

    // Sanity check: client must send a valid positive integer (display total)
    // Server will re-derive authoritatively from live Sanity data.
    if (grandTotal !== undefined && (!Number.isInteger(grandTotal) || grandTotal < 1)) {
      return { ok: false, error: 'grandTotal must be a positive integer', status: 400 }
    }

    if (!metadata || typeof metadata !== 'object') {
      return { ok: false, error: 'metadata is required', status: 400 }
    }

    const session = await ports.sessions.getCheckoutSession()
    const traceId = session.checkoutSessionId || 'unknown'

    // ── Re-derive grandTotal from live Sanity data (authoritative) ──
    if (!session.basket?.length) {
      await logEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_empty_basket', data: {}, outcome: 'error' })
      return { ok: false, error: 'Basket is empty', status: 400 }
    }

    if (session.shippingCost === undefined || session.shippingCost === null) {
      await logEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_missing_shipping', data: {}, outcome: 'error' })
      return { ok: false, error: 'Shipping cost is missing', status: 400 }
    }
    const shippingCost = session.shippingCost

    const ids = session.basket.map(i => i.productId)
    const products = await ports.catalogue.getProductUnitAmountsByIds(ids)

    if (products.length !== session.basket.length) {
      await logEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_product_mismatch', data: { expected: session.basket.length, received: products.length }, outcome: 'error' })
      return { ok: false, error: 'Product mismatch — one or more basket items not found', status: 400 }
    }

    let subtotal = 0
    const unitPriceParts: string[] = []
    for (const item of session.basket) {
      const product = products.find(p => p._id === item.productId)
      const unitPrice = product?.price_data?.unit_amount
      if (
        typeof item.productId !== 'string' || item.productId === '' ||
        item.productId.includes(',') || item.productId.includes(':') ||
        !Number.isSafeInteger(item.quantity) || item.quantity < 1 ||
        typeof unitPrice !== 'number' || !Number.isSafeInteger(unitPrice) || unitPrice < 1 ||
        !Number.isSafeInteger(unitPrice * item.quantity)
      ) {
        await logEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_invalid_price', data: { productId: item.productId }, outcome: 'error' })
        return { ok: false, error: `Invalid price for product ${item.productId}`, status: 400 }
      }
      subtotal += unitPrice * item.quantity
      unitPriceParts.push(`${item.productId}:${unitPrice}`)
    }

    if (!Number.isSafeInteger(shippingCost) || shippingCost < 0) {
      await logEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_invalid_shipping', data: { shippingCost: shippingCost }, outcome: 'error' })
      return { ok: false, error: 'Invalid shipping cost', status: 400 }
    }

    const exact = subtotal + shippingCost

    if (!Number.isSafeInteger(exact) || exact < 1) {
      await logEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_invalid_total', data: { subtotal, shippingCost: shippingCost, exact }, outcome: 'error' })
      return { ok: false, error: 'Invalid total amount', status: 400 }
    }

    if (calculateGrandTotal(subtotal, shippingCost) !== exact) {
      await logEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_invalid_total', data: { subtotal, shippingCost: shippingCost, exact }, outcome: 'error' })
      return { ok: false, error: 'Invalid total amount', status: 400 }
    }

    // Build a lean address for Stripe metadata. session.address carries the
    // full Google Places enrichment (geocode, placeId, etc.) which is never
    // used downstream and would exceed Stripe's 500-char metadata value limit.
    const a = session.address
    const leanAddress = a
      ? {
          firstName: a.firstName,
          lastName: a.lastName,
          phone: a.phone,
          regionCode: a.regionCode,
          postalCode: a.postalCode,
          street: a.street,
          streetNumber: a.streetNumber,
          city: a.city,
        }
      : {}

    // C-02: Compact basket representation to stay well under Stripe's 500-char metadata limit
    // Format: productId:quantity,productId:quantity
    const basketCompact = session.basket.map(i => `${i.productId}:${i.quantity}`).join(',')

    // H-02: Calculate Polish standard VAT (23%) — gross pricing breakdown
    const vatAmount = exact - Math.round(exact / 1.23)

    // Merge session data into metadata so the webhook can build the order
    // without depending on basketReservation documents
    const authSession = await getSession()

    const enrichedMetadata: Record<string, string> = {
      ...metadata,
      basket: basketCompact,
      unitPrices: unitPriceParts.join(','),
      address: JSON.stringify(leanAddress),
      shippingCode: session.shippingCode ?? '',
      shippingCost: String(shippingCost ?? ''),
      shippingMethodName: session.shippingMethodName ?? '',
      shippingCarrier: session.shippingCarrier ?? '',
      shippingEstimatedDays: String(session.shippingEstimatedDays ?? ''),
      email: session.email ?? '',
      checkoutSessionId: traceId,
      vat: String(vatAmount),
      userId: authSession?.userId ?? '',
    }

    // C-02 guard: Stripe metadata values have a 500-character limit
    const oversizeKeys = Object.entries(enrichedMetadata)
      .filter(([, v]) => v.length > 500)
      .map(([k]) => k)
    if (oversizeKeys.length > 0) {
      await logEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_metadata_oversize', data: { keys: oversizeKeys }, outcome: 'error' })
      return {
        ok: false,
        error: `Metadata values exceed Stripe 500-char limit for keys: ${oversizeKeys.join(', ')}`,
        status: 400,
      }
    }

    let result: PaymentHandle

    // M-03: Reject non-idempotent fallback; idempotency key must be stable
    if (!session.checkoutSessionId) {
      await logEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_missing_session_id', data: {}, outcome: 'error' })
      return { ok: false, error: 'Checkout session ID is missing', status: 400 }
    }
    const idempotencyKey = session.checkoutSessionId

    if (session.paymentIntentId) {
      try {
        result = await ports.payments.updatePaymentAmount(session.paymentIntentId, exact, enrichedMetadata, `${idempotencyKey}:${exact}:${basketCompact}`)
        await logEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_update', data: { paymentIntentId: session.paymentIntentId, amount: exact }, outcome: 'success' })
      } catch (err) {
        await logEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_update_failed', data: { error: err instanceof Error ? err.message : String(err) }, outcome: 'error' })
        session.paymentIntentId = undefined
        result = await ports.payments.createPayment(exact, enrichedMetadata, idempotencyKey)
        session.paymentIntentId = result.id
        await logEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_create', data: { paymentIntentId: result.id, amount: exact, currency: 'pln' }, outcome: 'success' })
      }
    } else {
      result = await ports.payments.createPayment(exact, enrichedMetadata, idempotencyKey)
      session.paymentIntentId = result.id
      await logEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_create', data: { paymentIntentId: result.id, amount: exact, currency: 'pln' }, outcome: 'success' })
    }

    if (!result.clientSecret) {
      await logEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_no_client_secret', data: { paymentIntentId: result.id }, outcome: 'error' })
      return { ok: false, error: 'Stripe did not return client_secret', status: 500 }
    }

    // C-02: Cookie size pre-check before save (warn threshold ~3KB before 4KB hard limit)
    const sessionJsonSize = Buffer.byteLength(JSON.stringify(session), 'utf8')
    if (sessionJsonSize > 3000) {
      await logEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_session_cookie_warn', data: { size: sessionJsonSize }, outcome: 'error' })
    }

    await session.save()

    return { ok: true, clientSecret: result.clientSecret }
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return { ok: false, error: 'Failed to create payment intent', status: 500 }
  }
}
