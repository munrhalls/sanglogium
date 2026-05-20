import { NextRequest, NextResponse } from 'next/server';
import { fetchAlleKurierRates, transformAlleKurierToShippingOption } from '@/lib/shipping/allekurier-rates';

export const runtime = 'nodejs';

interface ParcelData {
  length: number;
  width: number;
  height: number;
  weight: number;
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

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { parcelData, countryCode } = body;

  // Courier limits
  const MAX_WEIGHT_G = 25000; // 25kg in grams
  const MAX_VOLUME_CM3 = 99000; // ~99,000 cm³

  // Aggregate parcels
  let totalWeight = 0;
  let totalVolume = 0;
  let maxLength = 0;
  let maxWidth = 0;
  let maxHeight = 0;

  if (Array.isArray(parcelData)) {
    for (const parcel of parcelData) {
      totalWeight += parcel.weight;
      totalVolume += parcel.length * parcel.width * parcel.height;
      maxLength = Math.max(maxLength, parcel.length);
      maxWidth = Math.max(maxWidth, parcel.width);
      maxHeight = Math.max(maxHeight, parcel.height);
    }
  }

  // Calculate number of parcels needed
  const parcelsByWeight = Math.ceil(totalWeight / MAX_WEIGHT_G);
  const parcelsByVolume = Math.ceil(totalVolume / MAX_VOLUME_CM3);
  const numParcels = Math.max(parcelsByWeight, parcelsByVolume, 1);

  // Split parcelData into multiple parcels if needed
  const parcelsPerSplit = Math.ceil(parcelData.length / numParcels);
  const splitParcels: ParcelData[] = [];

  for (let i = 0; i < numParcels; i++) {
    const startIdx = i * parcelsPerSplit;
    const endIdx = Math.min(startIdx + parcelsPerSplit, parcelData.length);
    const subset = parcelData.slice(startIdx, endIdx);

    let splitWeight = 0;
    let splitMaxLength = 0;
    let splitMaxWidth = 0;
    let splitMaxHeight = 0;

    for (const parcel of subset) {
      splitWeight += parcel.weight;
      splitMaxLength = Math.max(splitMaxLength, parcel.length);
      splitMaxWidth = Math.max(splitMaxWidth, parcel.width);
      splitMaxHeight = Math.max(splitMaxHeight, parcel.height);
    }

    splitParcels.push({
      length: splitMaxLength,
      width: splitMaxWidth,
      height: splitMaxHeight,
      weight: splitWeight,
    });
  }

  // If only one parcel, use aggregated (for backward compatibility)
  const packages = numParcels === 1
    ? [{
        width: maxLength,
        height: maxHeight,
        length: maxLength,
        weight: totalWeight / 1000,
      }]
    : splitParcels.map(p => ({
        width: p.width,
        height: p.height,
        length: p.length,
        weight: p.weight / 1000,
      }));

  // Select sender address based on country
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

    // Fallback to default
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

  let shippingOptions: ShippingOption[] = [];

  // Call country-specific shipping API
  if (countryCode === 'PL') {
    const alleKurierServices = await fetchAlleKurierRates({
      fromCountry: senderAddress?.country || 'PL',
      fromZip: senderAddress?.zip || '',
      toCountry: countryCode,
      toZip: '02-001', // Warsaw - Polish domestic shipping uses flat rates
      packages: packages,
    });

    shippingOptions = alleKurierServices.map(transformAlleKurierToShippingOption);
  } else if (countryCode === 'GB') {
    // TODO: GB API integration (Task 6)
    const mockShippingOptions: ShippingOption[] = [
      {
        provider: 'Mock GB Carrier',
        servicelevel: { name: 'Standard' },
        rateId: 'gb_mock_1',
        amount: 20.00,
        currency: 'GBP',
        estimatedDays: 3,
      },
    ];
    shippingOptions = mockShippingOptions;
  } else if (countryCode === 'DE') {
    // TODO: DE API integration (Task 8)
    const mockShippingOptions: ShippingOption[] = [
      {
        provider: 'Mock DE Carrier',
        servicelevel: { name: 'Standard' },
        rateId: 'de_mock_1',
        amount: 18.00,
        currency: 'EUR',
        estimatedDays: 2,
      },
    ];
    shippingOptions = mockShippingOptions;
  }

  // Select cheapest rate
  if (shippingOptions.length === 0) {
    return NextResponse.json({ rate: null });
  }

  const cheapestRate = shippingOptions.reduce((min, option) =>
    option.amount < min.amount ? option : min
  );

  return NextResponse.json({ rate: cheapestRate });
}
