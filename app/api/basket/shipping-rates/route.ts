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
      packages: parcelData.map((parcel: ParcelData) => ({
        width: parcel.width,
        height: parcel.height,
        length: parcel.length,
        weight: parcel.weight / 1000, // Convert g to kg
      })),
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
