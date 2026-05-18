import { getBackendClient } from '@/sanity-cms/lib/backendClient';
import { getPolandDomesticRates, getCityCoordinates } from '@/lib/shipping/carrier-rates';
import { fetchPacklinkRates } from '@/lib/shipping/packlink-rates';

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

// Sender address from environment variables
const SENDER_ADDRESS_NAME = process.env.SENDER_ADDRESS_NAME;
const SENDER_ADDRESS_STREET = process.env.SENDER_ADDRESS_STREET;
const SENDER_ADDRESS_CITY = process.env.SENDER_ADDRESS_CITY;
const SENDER_ADDRESS_STATE = process.env.SENDER_ADDRESS_STATE;
const SENDER_ADDRESS_ZIP = process.env.SENDER_ADDRESS_ZIP;
const SENDER_ADDRESS_COUNTRY = process.env.SENDER_ADDRESS_COUNTRY;
const SENDER_ADDRESS_PHONE = process.env.SENDER_ADDRESS_PHONE;
const SENDER_ADDRESS_EMAIL = process.env.SENDER_ADDRESS_EMAIL;


export async function POST(req: Request) {
  const body = await req.json();
  const { basketReservationId, shippingAddress: shippingAddressFromBody } = body;

  if (!basketReservationId) {
    return Response.json(
      { error: 'basketReservationId is required', errorClass: 'VALIDATION', retryable: false },
      { status: 400 }
    );
  }

  // Experiment 3: Accept shippingAddress from request body (optional)
  // Reverted from header approach to avoid encoding issues
  let providedShippingAddress: ShippingAddress | null = shippingAddressFromBody || null;

  if (providedShippingAddress) {
    console.log("[API RATES] Received shippingAddress from request body:", providedShippingAddress);
  }

  // Fetch reservation from Sanity CMS
  const client = getBackendClient();

  try {
    // If shippingAddress provided in body, use it; otherwise fetch from CMS
    let reservation: BasketReservation;

    if (providedShippingAddress) {
      // Fetch basket data only (shippingAddress already provided)
      reservation = await client.fetch<BasketReservation>(
        `*[_id == $id][0]{
          _id,
          basketReservation[]{ _id, quantity, verifiedPrice }
        }`,
        { id: basketReservationId }
      );
      // Add provided shippingAddress to reservation
      if (reservation) {
        reservation.shippingAddress = providedShippingAddress;
      }
    } else {
      // Fetch full reservation including shippingAddress from CMS
      reservation = await client.fetch<BasketReservation>(
        `*[_id == $id][0]{
          _id,
          shippingAddress,
          basketReservation[]{ _id, quantity, verifiedPrice }
        }`,
        { id: basketReservationId }
      );
    }

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

    // Select sender address based on destination country
    const countryCode = shippingAddress.regionCode.toUpperCase();
    const getSenderAddress = (country: string) => {
      // Try country-specific address first (SENDER_ADDRESS_{COUNTRY}_*)
      const prefix = `SENDER_ADDRESS_${country}_`;
      const name = process.env[`${prefix}NAME`];
      const street = process.env[`${prefix}STREET`];
      const city = process.env[`${prefix}CITY`];
      const state = process.env[`${prefix}STATE`];
      const zip = process.env[`${prefix}ZIP`];
      const countryField = process.env[`${prefix}COUNTRY`];
      const phone = process.env[`${prefix}PHONE`];
      const email = process.env[`${prefix}EMAIL`];

      // If country-specific address is configured, use it
      if (name && street && city && zip && countryField) {
        return { name, street, city, state, zip, country: countryField, phone, email };
      }

      // Fallback to DEFAULT address (SENDER_ADDRESS_DEFAULT_*)
      const defaultName = process.env['SENDER_ADDRESS_DEFAULT_NAME'];
      const defaultStreet = process.env['SENDER_ADDRESS_DEFAULT_STREET'];
      const defaultCity = process.env['SENDER_ADDRESS_DEFAULT_CITY'];
      const defaultState = process.env['SENDER_ADDRESS_DEFAULT_STATE'];
      const defaultZip = process.env['SENDER_ADDRESS_DEFAULT_ZIP'];
      const defaultCountry = process.env['SENDER_ADDRESS_DEFAULT_COUNTRY'];
      const defaultPhone = process.env['SENDER_ADDRESS_DEFAULT_PHONE'];
      const defaultEmail = process.env['SENDER_ADDRESS_DEFAULT_EMAIL'];

      if (defaultName && defaultStreet && defaultCity && defaultZip && defaultCountry) {
        return { name: defaultName, street: defaultStreet, city: defaultCity, state: defaultState, zip: defaultZip, country: defaultCountry, phone: defaultPhone, email: defaultEmail };
      }

      // Fallback to base SENDER_ADDRESS_* (no country suffix)
      if (SENDER_ADDRESS_NAME && SENDER_ADDRESS_STREET && SENDER_ADDRESS_CITY && SENDER_ADDRESS_ZIP && SENDER_ADDRESS_COUNTRY) {
        return {
          name: SENDER_ADDRESS_NAME,
          street: SENDER_ADDRESS_STREET,
          city: SENDER_ADDRESS_CITY,
          state: SENDER_ADDRESS_STATE || '',
          zip: SENDER_ADDRESS_ZIP,
          country: SENDER_ADDRESS_COUNTRY,
          phone: SENDER_ADDRESS_PHONE,
          email: SENDER_ADDRESS_EMAIL,
        };
      }

      return null;
    };

    const senderAddress = getSenderAddress(countryCode);

    if (!senderAddress) {
      return Response.json(
        { error: 'Sender address not configured for destination country', errorClass: 'CONFIGURATION', retryable: false },
        { status: 500 }
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

    // Determine sender country (same as destination for domestic shipping)
    const senderCountry = senderAddress.country;

    // === Tier 1: Packlink PRO (free production API, real rates) ===
    const packlinkServices = await fetchPacklinkRates({
      fromCountry: senderCountry,
      fromZip: senderAddress.zip,
      toCountry: shippingAddress.regionCode,
      toZip: shippingAddress.postalCode,
      packages: [{
        width: maxWidth,
        height: maxHeight,
        length: maxLength,
        weight: totalWeight / 1000,
      }],
    });

    let shippingOptions: ShippingOption[] = packlinkServices.map((s) => ({
      provider: s.carrier_name,
      servicelevel: { name: s.name },
      rateId: `packlink_${s.id}`,
      amount: s.price.total_price,
      currency: s.price.currency,
      estimatedDays: Math.ceil(parseInt(s.transit_hours) / 24) || 1,
    }));

    // === Tier 2: Mock rates (fallback for PL domestic) ===
    if (shippingOptions.length === 0 && countryCode === 'PL') {
      console.log('[MOCK] Using realistic mock rates for Poland domestic shipping');
      const senderLocation = getCityCoordinates(senderAddress.city);
      const recipientLocation = getCityCoordinates(shippingAddress.city);
      shippingOptions = getPolandDomesticRates(
        { length: maxLength, width: maxWidth, height: maxHeight, weight: totalWeight },
        senderLocation,
        recipientLocation
      );
    }

    return Response.json({ options: shippingOptions });
  } catch (error) {
    console.error('Error fetching shipping rates:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
