import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity-cms/env";

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
  distanceUnit: string;
  massUnit: string;
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
}

// Parcel configuration - TODO: Move to environment variables or config
const PARCEL_DATA: ParcelData = {
  length: 10,
  width: 10,
  height: 5,
  weight: 500, // grams
  distanceUnit: 'cm',
  massUnit: 'g',
};

const SHIPPO_API_KEY = process.env.SHIPPO_API_KEY;

console.log('[DEBUG] SHIPPO_API_KEY loaded:', !!SHIPPO_API_KEY);
console.log('[DEBUG] SHIPPO_API_KEY length:', SHIPPO_API_KEY?.length);
console.log('[DEBUG] SHIPPO_API_KEY prefix:', SHIPPO_API_KEY?.substring(0, 10));

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const basketReservationId = searchParams.get('basketReservationId');

  if (!basketReservationId) {
    return Response.json(
      { error: 'basketReservationId is required' },
      { status: 400 }
    );
  }

  if (!SHIPPO_API_KEY) {
    return Response.json(
      { error: 'Shippo API key not configured' },
      { status: 500 }
    );
  }

  // Fetch reservation from Sanity CMS
  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
  });

  try {
    const reservation = await client.fetch<BasketReservation>(
      `*[_id == $id][0]{
        _id,
        shippingAddress
      }`,
      { id: basketReservationId }
    );

    if (!reservation) {
      return Response.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    if (!reservation.shippingAddress) {
      return Response.json(
        { error: 'Shipping address not found in reservation' },
        { status: 400 }
      );
    }

    const { shippingAddress } = reservation;

    console.log('[DEBUG] Request body structure:', JSON.stringify({
      address_from: {
        name: 'Sang Logium',
        street1: '123 Main St',
        city: 'Warsaw',
        state: 'MZ',
        zip: '00-001',
        country: 'PL',
      },
      address_to: {
        name: 'Customer',
        street1: `${shippingAddress.street} ${shippingAddress.streetNumber}`,
        city: shippingAddress.city,
        state: '',
        zip: shippingAddress.postalCode,
        country: shippingAddress.regionCode,
      },
      parcels: [PARCEL_DATA],
    }, null, 2));

    // Call Shippo API to fetch rates
    const shippoResponse = await fetch('https://api.goshippo.com/shipments/', {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${SHIPPO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address_from: {
          name: 'Sang Logium',
          street1: '123 Main St',
          city: 'Warsaw',
          state: 'MZ',
          zip: '00-001',
          country: 'PL',
        },
        address_to: {
          name: 'Customer',
          street1: `${shippingAddress.street} ${shippingAddress.streetNumber}`,
          city: shippingAddress.city,
          state: '',
          zip: shippingAddress.postalCode,
          country: shippingAddress.regionCode,
        },
        parcels: [PARCEL_DATA],
      }),
    });

    if (!shippoResponse.ok) {
      const errorText = await shippoResponse.text();
      console.error('[DEBUG] Shippo API status:', shippoResponse.status);
      console.error('[DEBUG] Shippo API error:', errorText);
      return Response.json(
        { error: 'Failed to fetch shipping rates from Shippo', details: errorText },
        { status: 500 }
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
