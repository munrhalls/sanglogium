import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface Address {
  postcode: string;
  city: string;
  country: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  street: string;
}

interface Parcel {
  width: number;
  height: number;
  depth: number;
  weight: number;
}

interface CarrierRate {
  carrier: string;
  serviceId: number;
  priceGross: number;
  priceNet: number;
  currency: string;
}

// Furgonetka API credentials (from environment variables)
const FURGONETKA_CLIENT_ID = process.env.FURGONETKA_SANDBOX_CLIENT_ID || '';
const FURGONETKA_CLIENT_SECRET = process.env.FURGONETKA_SANDBOX_CLIENT_SECRET || '';
const FURGONETKA_USERNAME = process.env.FURGONETKA_USERNAME || '';
const FURGONETKA_PASSWORD = process.env.FURGONETKA_PASSWORD || '';
const FURGONETKA_OAUTH_URL = 'https://api.sandbox.furgonetka.pl/oauth/token';
const FURGONETKA_API_URL = 'https://api.sandbox.furgonetka.pl';

// Carrier service IDs (from research documentation)
const CARRIERS = [
  { name: 'InPost', serviceId: 11597700 },
  { name: 'DPD', serviceId: 11597695 },
  { name: 'DHL', serviceId: 11597702 },
  { name: 'Poczta Polska', serviceId: 11597699 },
];

// Get OAuth token
async function getAuthToken(): Promise<string> {
  const authHeader = Buffer.from(`${FURGONETKA_CLIENT_ID}:${FURGONETKA_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(FURGONETKA_OAUTH_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'password',
      scope: 'api',
      username: FURGONETKA_USERNAME,
      password: FURGONETKA_PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to authenticate with Furgonetka API');
  }

  const data = await response.json();
  return data.access_token;
}

// Call Furgonetka API for a single carrier
async function getRateForCarrier(
  token: string,
  sender: Address,
  receiver: Address,
  parcel: Parcel,
  carrier: { name: string; serviceId: number }
): Promise<CarrierRate | null> {
  try {
    const response = await fetch(`${FURGONETKA_API_URL}/packages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.furgonetka.v1+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'package',
        service_id: carrier.serviceId,
        parcels: [{
          width: parcel.width,
          height: parcel.height,
          depth: parcel.depth,
          weight: parcel.weight,
        }],
        pickup: {
          type: 'sender',
          name: sender.name,
          company: sender.company,
          email: sender.email,
          street: sender.street,
          postcode: sender.postcode,
          city: sender.city,
          phone: sender.phone,
        },
        sender: {
          postcode: sender.postcode,
          city: sender.city,
          country: sender.country,
          name: sender.name,
          company: sender.company,
          phone: sender.phone,
          email: sender.email,
          street: sender.street,
        },
        receiver: {
          postcode: receiver.postcode,
          city: receiver.city,
          country: receiver.country,
          name: receiver.name,
          company: receiver.company,
          phone: receiver.phone,
          email: receiver.email,
          street: receiver.street,
        },
      }),
    });

    if (!response.ok) {
      console.error(`[FURGONETKA] Failed to get rate for ${carrier.name}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (!data.pricing) {
      console.error(`[FURGONETKA] No pricing data for ${carrier.name}`);
      return null;
    }

    return {
      carrier: carrier.name,
      serviceId: carrier.serviceId,
      priceGross: data.pricing.price_gross,
      priceNet: data.pricing.price_net,
      currency: 'PLN',
    };
  } catch (error) {
    console.error(`[FURGONETKA] Error getting rate for ${carrier.name}:`, error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sender, receiver, parcel } = body;

    if (!sender || !receiver || !parcel) {
      return NextResponse.json(
        { error: 'Missing required fields: sender, receiver, parcel' },
        { status: 400 }
      );
    }

    console.log('[FURGONETKA] Getting rates for shipment');
    console.log('[FURGONETKA] Sender:', sender);
    console.log('[FURGONETKA] Receiver:', receiver);
    console.log('[FURGONETKA] Parcel:', parcel);

    // Get authentication token
    const token = await getAuthToken();
    console.log('[FURGONETKA] Authentication successful');

    // Get rates for all carriers
    const rates: CarrierRate[] = [];
    
    for (const carrier of CARRIERS) {
      const rate = await getRateForCarrier(token, sender, receiver, parcel, carrier);
      if (rate) {
        rates.push(rate);
      }
    }

    console.log('[FURGONETKA] Carrier/rate list:', rates);

    return NextResponse.json({
      rates,
      count: rates.length,
    });
  } catch (error) {
    console.error('[FURGONETKA] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get Furgonetka rates' },
      { status: 500 }
    );
  }
}
