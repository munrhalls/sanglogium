/**
 * Packlink PRO Shipping Rates Fetcher
 * 
 * Uses the free-tier production API to fetch real calculated shipping rates.
 * Rate quoting is read-only and does not require a billing method.
 * Label purchase (POST /v1/shipments) would require billing - we never call that.
 * 
 * API: GET https://api.packlink.com/v1/services
 * Auth: Raw API key in Authorization header (no "Bearer" prefix)
 */

export interface PacklinkService {
  id: number;
  name: string;
  carrier_name: string;
  country: string;
  base_price: string;
  currency: string;
  transit_time: string;
  transit_hours: string;
  first_estimated_delivery_date: string;
  category: string;
  price: {
    total_price: number;
    base_price: number;
    tax_price: number;
    currency: string;
  };
  insurance: {
    base_insurance: string;
    additional_insurance: boolean;
    max_insurance: string;
  };
  cash_on_delivery: {
    offered: boolean;
  };
  dropoff: boolean;
  delivery_to_parcelshop: boolean;
  logo_id: string;
  service_info: Array<{ text: string; icon: string }>;
}

export interface PacklinkRatesInput {
  fromCountry: string;
  fromZip: string;
  toCountry: string;
  toZip: string;
  packages: Array<{
    width: number;
    height: number;
    length: number;
    weight: number;
  }>;
}

/**
 * Get the Packlink API key (single account works for all countries)
 */
function getApiKey(): string | undefined {
  const key = process.env['PACKLINK_PRO_API'];
  return key || undefined;
}

/**
 * Fetch real shipping rates from Packlink PRO production API
 * Returns empty array if no API key configured or no services available
 */
export async function fetchPacklinkRates(
  input: PacklinkRatesInput
): Promise<PacklinkService[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.log('[PACKLINK] No API key configured');
    return [];
  }

  const params = new URLSearchParams();
  params.set('from[country]', input.fromCountry);
  params.set('from[zip]', input.fromZip);
  params.set('to[country]', input.toCountry);
  params.set('to[zip]', input.toZip);
  
  input.packages.forEach((pkg, i) => {
    params.set(`packages[${i}][width]`, String(pkg.width));
    params.set(`packages[${i}][height]`, String(pkg.height));
    params.set(`packages[${i}][length]`, String(pkg.length));
    params.set(`packages[${i}][weight]`, String(pkg.weight));
  });

  const url = `https://api.packlink.com/v1/services?${params}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      headers: {
        'Authorization': apiKey,
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      console.error(`[PACKLINK] API error: ${res.status} ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    
    if (!Array.isArray(data)) {
      console.error('[PACKLINK] Unexpected response format:', typeof data);
      return [];
    }

    console.log(`[PACKLINK] ${input.fromCountry}->${input.toCountry}: ${data.length} services`);
    return data;
  } catch (e) {
    console.error('[PACKLINK] Fetch failed:', e);
    return [];
  }
}
