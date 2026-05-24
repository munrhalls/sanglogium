import { getBackendClient } from '@/sanity-cms/lib/backendClient';
import { fetchPacklinkRates } from '@/lib/shipping/packlink-rates';
import { fetchAlleKurierRates, transformAlleKurierToShippingOption } from '@/lib/shipping/allekurier-rates';
import { calculatePackagesFromReservation } from '@/lib/shipping/parcel-calculator';

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
    parcel?: {
      length: number;
      width: number;
      height: number;
      weight: number;
      distance_unit: string;
      mass_unit: string;
    };
  }>;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { basketReservationId, shippingAddress: shippingAddressFromBody } = body;

  if (!basketReservationId) {
    return Response.json(
      { error: 'basketReservationId is required', errorClass: 'VALIDATION', retryable: false },
      { status: 400 }
    );
  }

  let providedShippingAddress: ShippingAddress | null = shippingAddressFromBody || null;

  if (providedShippingAddress) {
    console.log("[API RATES] Received shippingAddress from request body:", providedShippingAddress);
  }

  const client = getBackendClient();

  try {
    let reservation: BasketReservation;

    if (providedShippingAddress) {
      reservation = await client.fetch<BasketReservation>(
        `*[_id == $id][0]{
          _id,
          basketReservation[]{ _id, quantity, verifiedPrice, parcel }
        }`,
        { id: basketReservationId }
      );
      if (reservation) {
        reservation.shippingAddress = providedShippingAddress;
      }
    } else {
      reservation = await client.fetch<BasketReservation>(
        `*[_id == $id][0]{
          _id,
          shippingAddress,
          basketReservation[]{ _id, quantity, verifiedPrice, parcel }
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

    if (!shippingAddress.regionCode || !/^[A-Z]{2}$/.test(shippingAddress.regionCode)) {
      return Response.json(
        { error: 'Invalid country code. Please use 2-letter ISO country code.', errorClass: 'VALIDATION', retryable: false },
        { status: 400 }
      );
    }

    const countryCode = shippingAddress.regionCode.toUpperCase();

    const getSenderAddress = (country: string) => {
      const prefix = `SENDER_ADDRESS_${country}_`;
      const name = process.env[`${prefix}NAME`];
      const street = process.env[`${prefix}STREET`];
      const city = process.env[`${prefix}CITY`];
      const state = process.env[`${prefix}STATE`];
      const zip = process.env[`${prefix}ZIP`];
      const countryField = process.env[`${prefix}COUNTRY`];

      if (name && street && city && zip && countryField) {
        return { name, street, city, state, zip, country: countryField };
      }

      const defaultName = process.env['SENDER_ADDRESS_DEFAULT_NAME'];
      const defaultStreet = process.env['SENDER_ADDRESS_DEFAULT_STREET'];
      const defaultCity = process.env['SENDER_ADDRESS_DEFAULT_CITY'];
      const defaultState = process.env['SENDER_ADDRESS_DEFAULT_STATE'];
      const defaultZip = process.env['SENDER_ADDRESS_DEFAULT_ZIP'];
      const defaultCountry = process.env['SENDER_ADDRESS_DEFAULT_COUNTRY'];

      if (defaultName && defaultStreet && defaultCity && defaultZip && defaultCountry) {
        return {
          name: defaultName,
          street: defaultStreet,
          city: defaultCity,
          state: defaultState,
          zip: defaultZip,
          country: defaultCountry,
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

    // Calculate packages using shared utility (handles quantity aggregation)
    const packages = calculatePackagesFromReservation(basketReservation);

    const senderCountry = senderAddress.country;
    let shippingOptions: ShippingOption[] = [];
    let errorClass: string | null = null;
    let retryable = false;

    // AlleKurier API (Polish shipping rates)
    if (countryCode === 'PL') {
      console.log('[ALLEKURIER] Fetching rates for Polish domestic shipping');
      const alleKurierServices = await fetchAlleKurierRates({
        fromCountry: senderCountry,
        fromZip: senderAddress.zip,
        toCountry: shippingAddress.regionCode,
        toZip: shippingAddress.postalCode,
        packages: packages,
      });

      if (alleKurierServices.length > 0) {
        shippingOptions = alleKurierServices.map(transformAlleKurierToShippingOption);
        console.log(`[ALLEKURIER] Transformed ${shippingOptions.length} shipping options`);
      } else {
        console.log('[ALLEKURIER] No services returned, falling back to Packlink');
        errorClass = 'PROVIDER';
        retryable = true;
      }
    }

    // Packlink PRO (fallback for non-Polish routes or if AlleKurier fails)
    if (shippingOptions.length === 0) {
      console.log('[PACKLINK] Fetching rates as fallback');
      const packlinkServices = await fetchPacklinkRates({
        fromCountry: senderCountry,
        fromZip: senderAddress.zip,
        toCountry: shippingAddress.regionCode,
        toZip: shippingAddress.postalCode,
        packages: packages,
      });

      if (packlinkServices.length > 0) {
        shippingOptions = packlinkServices.map((s) => ({
          provider: s.carrier_name,
          servicelevel: { name: s.name },
          rateId: `packlink_${s.id}`,
          amount: s.price.total_price,
          currency: s.price.currency,
          estimatedDays: Math.ceil(parseInt(s.transit_hours) / 24) || 1,
        }));
      } else {
        errorClass = errorClass || 'PROVIDER';
        retryable = true;
      }
    }

    if (shippingOptions.length === 0) {
      return Response.json(
        {
          error: 'No shipping options available',
          errorClass: errorClass || 'PROVIDER',
          retryable,
          options: [],
        },
        { status: 503 }
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
