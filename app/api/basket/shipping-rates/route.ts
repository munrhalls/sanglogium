import { NextRequest, NextResponse } from 'next/server';
import { getCheapestShippingRate } from '@/features/checkout/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { parcelData, countryCode } = body;

  const rate = await getCheapestShippingRate({ parcelData, countryCode });

  return NextResponse.json({ rate });
}
