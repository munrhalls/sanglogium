import { getBackendClient } from '@/sanity-cms/lib/backendClient';

export const runtime = 'nodejs';

interface ShippingAddress {
  regionCode: string;
  postalCode: string;
  street: string;
  streetNumber: string;
  city: string;
}

interface ParcelData {
  length: number;
  width: number;
  height: number;
  weight: number;
  distance_unit: string;
  mass_unit: string;
}

interface ShippingOption {
  provider: string;
  servicelevel: {
    name: string;
  };
  rateId: string;
  amount: number;
  currency: string;
  estimatedDays: number;
}

interface BasketReservation {
  _id: string;
  shippingAddress?: ShippingAddress;
  basketReservation?: Array<{
    _id: string;
    quantity: number;
    verifiedPrice: number;
  }>;
}

const SHIPPO_API_KEY = process.env.SHIPPO_API_KEY;

// Sender address from environment variables
const SHIPPO_SENDER_NAME = process.env.SHIPPO_SENDER_NAME;
const SHIPPO_SENDER_STREET = process.env.SHIPPO_SENDER_STREET;
const SHIPPO_SENDER_CITY = process.env.SHIPPO_SENDER_CITY;
const SHIPPO_SENDER_STATE = process.env.SHIPPO_SENDER_STATE;
const SHIPPO_SENDER_ZIP = process.env.SHIPPO_SENDER_ZIP;
const SHIPPO_SENDER_COUNTRY = process.env.SHIPPO_SENDER_COUNTRY;
const SHIPPO_SENDER_PHONE = process.env.SHIPPO_SENDER_PHONE;
const SHIPPO_SENDER_EMAIL = process.env.SHIPPO_SENDER_EMAIL;

// Circuit breaker state (module-level, simplest approach)
let failureCount = 0;
let circuitOpenUntil = 0;
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_WINDOW_MS = 60000; // 60 seconds
const CIRCUIT_BREAKER_TIMEOUT_MS = 30000; // 30 seconds

// Timeout helper (inline)
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Retry helper (inline)
async function fetchWithRetry(url: string, options: RequestInit, timeoutMs: number, retries: number) {
  const backoffDelays = [500, 1500]; // exponential backoff
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetchWithTimeout(url, options, timeoutMs);
      if (res.ok || res.status < 500) return res; // don't retry 4xx
      if (i === retries) return res;
    } catch (e) {
      if (i === retries) throw e;
    }
    if (i < retries) {
      await new Promise(r => setTimeout(r, backoffDelays[i] || 500));
    }
  }
  throw new Error('Max retries exceeded');
}

console.log('[DEBUG] SHIPPO_API_KEY loaded:', !!SHIPPO_API_KEY);
console.log('[DEBUG] SHIPPO_API_KEY length:', SHIPPO_API_KEY?.length);
console.log('[DEBUG] SHIPPO_API_KEY prefix:', SHIPPO_API_KEY?.substring(0, 10));

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const basketReservationId = searchParams.get('basketReservationId');

  if (!basketReservationId) {
    return Response.json(
      { error: 'basketReservationId is required', errorClass: 'VALIDATION', retryable: false },
      { status: 400 }
    );
  }

  if (!SHIPPO_API_KEY) {
    return Response.json(
      { error: 'Shippo API key not configured', errorClass: 'CONFIGURATION', retryable: false },
      { status: 500 }
    );
  }

  // Validate required sender address fields
  if (!SHIPPO_SENDER_NAME || !SHIPPO_SENDER_STREET || !SHIPPO_SENDER_CITY || !SHIPPO_SENDER_ZIP || !SHIPPO_SENDER_COUNTRY) {
    console.error('[CONFIGURATION] Missing required SHIPPO_SENDER_* environment variables');
    return Response.json(
      { error: 'Sender address not configured', errorClass: 'CONFIGURATION', retryable: false },
      { status: 500 }
    );
  }

  // Fetch reservation from Sanity CMS
  const client = getBackendClient();

  try {
    const reservation = await client.fetch<BasketReservation>(
      `*[_id == $id][0]{
        _id,
        shippingAddress,
        basketReservation[]{ _id, quantity, verifiedPrice }
      }`,
      { id: basketReservationId }
    );

    if (!reservation) {
      return Response.json(
        { error: 'Reservation not found', errorClass: 'VALIDATION', retryable: false },
        { status: 404 }
      );
    }

    if (!reservation.shippingAddress) {
      return Response.json(
        { error: 'Shipping address not found in reservation', errorClass: 'VALIDATION', retryable: false },
        { status: 400 }
      );
    }

    if (!reservation.basketReservation || reservation.basketReservation.length === 0) {
      return Response.json(
        { error: 'Basket is empty', errorClass: 'VALIDATION', retryable: false },
        { status: 400 }
      );
    }

    const { shippingAddress, basketReservation } = reservation;

    // Validate shipping address fields
    if (!shippingAddress.regionCode || !/^[A-Z]{2}$/.test(shippingAddress.regionCode)) {
      return Response.json(
        { error: 'Invalid country code. Please use 2-letter ISO country code.', errorClass: 'VALIDATION', retryable: false },
        { status: 400 }
      );
    }

    if (!shippingAddress.postalCode || shippingAddress.postalCode.trim() === '') {
      return Response.json(
        { error: 'Postal code is required.', errorClass: 'VALIDATION', retryable: false },
        { status: 400 }
      );
    }

    if (!shippingAddress.street || shippingAddress.street.trim() === '') {
      return Response.json(
        { error: 'Street address is required.', errorClass: 'VALIDATION', retryable: false },
        { status: 400 }
      );
    }

    if (!shippingAddress.city || shippingAddress.city.trim() === '') {
      return Response.json(
        { error: 'City is required.', errorClass: 'VALIDATION', retryable: false },
        { status: 400 }
      );
    }

    // Fetch product parcel data from Sanity
    const productIds = basketReservation.map((item) => item._id);
    const products = await client.fetch(
      `*[_id in $ids]{ _id, parcel }`,
      { ids: productIds }
    );

    // Aggregate parcel data: sum weights, use max dimensions
    let totalWeight = 0;
    let maxLength = 0;
    let maxWidth = 0;
    let maxHeight = 0;

    for (const product of products) {
      if (!product.parcel) {
        return Response.json(
          { error: `Product ${product._id} missing parcel data`, errorClass: 'VALIDATION', retryable: false },
          { status: 400 }
        );
      }

      const quantity = basketReservation.find((item) => item._id === product._id)?.quantity || 1;
      totalWeight += product.parcel.weight * quantity;
      maxLength = Math.max(maxLength, product.parcel.length);
      maxWidth = Math.max(maxWidth, product.parcel.width);
      maxHeight = Math.max(maxHeight, product.parcel.height);
    }

    const aggregatedParcel: ParcelData = {
      length: maxLength,
      width: maxWidth,
      height: maxHeight,
      weight: totalWeight,
      distance_unit: 'cm',
      mass_unit: 'g',
    };

    console.log('[DEBUG] Request body structure:', JSON.stringify({
      address_from: {
        name: SHIPPO_SENDER_NAME,
        street1: SHIPPO_SENDER_STREET,
        city: SHIPPO_SENDER_CITY,
        state: SHIPPO_SENDER_STATE || '',
        zip: SHIPPO_SENDER_ZIP,
        country: SHIPPO_SENDER_COUNTRY,
        phone: SHIPPO_SENDER_PHONE,
        email: SHIPPO_SENDER_EMAIL,
      },
      address_to: {
        name: 'Customer',
        street1: `${shippingAddress.street} ${shippingAddress.streetNumber}`,
        city: shippingAddress.city,
        state: '',
        zip: shippingAddress.postalCode,
        country: shippingAddress.regionCode,
      },
      parcels: [aggregatedParcel],
    }, null, 2));

    // Circuit breaker check
    const now = Date.now();
    if (now < circuitOpenUntil) {
      console.error('[CIRCUIT BREAKER] Circuit open, failing fast');
      return Response.json(
        { error: 'Shipping rates temporarily unavailable. Please try again.', errorClass: 'NETWORK', retryable: true },
        { status: 502 }
      );
    }

    // Reset failure count if window expired
    if (now - circuitOpenUntil > CIRCUIT_BREAKER_WINDOW_MS) {
      failureCount = 0;
    }

    // Call Shippo API to fetch rates with resilience
    let shippoResponse;
    try {
      shippoResponse = await fetchWithRetry(
        'https://api.goshippo.com/shipments/',
        {
          method: 'POST',
          headers: {
            'Authorization': `ShippoToken ${SHIPPO_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address_from: {
              name: SHIPPO_SENDER_NAME,
              street1: SHIPPO_SENDER_STREET,
              city: SHIPPO_SENDER_CITY,
              state: SHIPPO_SENDER_STATE || '',
              zip: SHIPPO_SENDER_ZIP,
              country: SHIPPO_SENDER_COUNTRY,
              phone: SHIPPO_SENDER_PHONE,
              email: SHIPPO_SENDER_EMAIL,
            },
            address_to: {
              name: 'Customer',
              street1: `${shippingAddress.street} ${shippingAddress.streetNumber}`,
              city: shippingAddress.city,
              state: '',
              zip: shippingAddress.postalCode,
              country: shippingAddress.regionCode,
            },
            parcels: [aggregatedParcel],
          }),
        },
        15000, // 15s timeout
        2 // 2 retries
      );

      // Success - reset circuit breaker
      failureCount = 0;
    } catch (error) {
      // Failure - increment circuit breaker
      failureCount++;
      if (failureCount >= CIRCUIT_BREAKER_THRESHOLD) {
        circuitOpenUntil = Date.now() + CIRCUIT_BREAKER_TIMEOUT_MS;
        console.error(`[CIRCUIT BREAKER] Threshold reached, opening circuit for ${CIRCUIT_BREAKER_TIMEOUT_MS}ms`);
      }
      console.error('[NETWORK] Shippo fetch failed:', error);
      return Response.json(
        { error: 'Shipping rates temporarily unavailable. Please try again.', errorClass: 'NETWORK', retryable: true },
        { status: 502 }
      );
    }

    if (!shippoResponse.ok) {
      const errorText = await shippoResponse.text();
      console.error('[PROVIDER] Shippo API error:', shippoResponse.status, errorText);
      // Increment circuit breaker on provider errors
      failureCount++;
      if (failureCount >= CIRCUIT_BREAKER_THRESHOLD) {
        circuitOpenUntil = Date.now() + CIRCUIT_BREAKER_TIMEOUT_MS;
        console.error(`[CIRCUIT BREAKER] Threshold reached, opening circuit for ${CIRCUIT_BREAKER_TIMEOUT_MS}ms`);
      }
      return Response.json(
        { error: 'Failed to fetch shipping rates from Shippo', errorClass: 'PROVIDER', retryable: true },
        { status: 502 }
      );
    }

    const shippoData = await shippoResponse.json();

    // Extract shipping options from Shippo response
    const shippingOptions: ShippingOption[] = shippoData.rates
      .filter((rate: any) => rate.object_state === 'VALID')
      .map((rate: any) => ({
        provider: rate.provider,
        servicelevel: {
          name: rate.servicelevel?.name || rate.servicelevel,
        },
        rateId: rate.object_id,
        amount: rate.amount,
        currency: rate.currency,
        estimatedDays: rate.estimated_days || 0,
      }));

    return Response.json({ options: shippingOptions });
  } catch (error) {
    console.error('Error fetching shipping rates:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
