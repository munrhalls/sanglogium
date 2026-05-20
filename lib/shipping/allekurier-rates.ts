/**
 * AlleKurier Shipping Rates Fetcher
 * 
 * Uses the AlleKurier API to fetch real calculated shipping rates.
 * Rate quoting is read-only and does not create actual shipments.
 * 
 * API: POST https://allekurier.pl/api_v1/service_list
 * Auth: Username/password via form data (User[email], User[password])
 * 
 * Reference: https://github.com/AlleKurier/api_v1
 */

export interface AlleKurierService {
  Carrier: {
    code: string;
    name: string;
  };
  Service: {
    code: string;
    name: string;
  };
  Order: {
    net: number;
    gross: number;
  };
  Time: {
    days: string;
    description: string;
  };
}

export interface AlleKurierRatesInput {
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
 * Get AlleKurier credentials from environment variables
 */
function getCredentials(): { email: string | undefined; password: string | undefined } {
  return {
    email: process.env['ALLEKURIER_EMAIL'],
    password: process.env['ALLEKURIER_PASSWORD'],
  };
}

/**
 * Parse days string (e.g., "1-2") to number (use max value for conservative estimate)
 */
function parseDaysString(daysStr: string): number {
  if (!daysStr) return 1;
  
  const parts = daysStr.split('-').map(p => parseInt(p.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return Math.max(parts[0], parts[1]);
  }
  
  const single = parseInt(daysStr.trim());
  return !isNaN(single) ? single : 1;
}

/**
 * Fetch real shipping rates from AlleKurier API
 * Returns empty array if no credentials configured or API error
 */
export async function fetchAlleKurierRates(
  input: AlleKurierRatesInput
): Promise<AlleKurierService[]> {
  const { email, password } = getCredentials();
  
  if (!email || !password) {
    console.log('[ALLEKURIER] No credentials configured');
    return [];
  }

  const ENDPOINT = 'https://allekurier.pl/api_v1/service_list';
  const TIMEOUT_MS = 15000;

  const params = new URLSearchParams();
  params.set('User[email]', email);
  params.set('User[password]', password);
  params.set('Order[package]', 'parcel');
  params.set('Order[cod]', '0');
  params.set('Order[insurance]', '0');
  params.set('Sender[country]', input.fromCountry);
  params.set('Sender[postal_code]', input.fromZip);
  params.set('Recipient[country]', input.toCountry);
  params.set('Recipient[postal_code]', input.toZip);

  input.packages.forEach((pkg, i) => {
    params.set(`Packages[${i}][weight]`, String(pkg.weight));
    params.set(`Packages[${i}][width]`, String(pkg.width));
    params.set(`Packages[${i}][height]`, String(pkg.height));
    params.set(`Packages[${i}][length]`, String(pkg.length));
    params.set(`Packages[${i}][custom]`, '0');
  });

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
        'cache-control': 'no-cache',
      },
      body: params,
      signal: controller.signal,
    });

    clearTimeout(timer);

    const rawBody = await res.text();
    let data;

    try {
      data = JSON.parse(rawBody);
    } catch {
      console.error('[ALLEKURIER] Response is not valid JSON:', rawBody.substring(0, 200));
      return [];
    }

    if (!res.ok) {
      console.error(`[ALLEKURIER] HTTP ${res.status} - API rejected the request`);
      return [];
    }

    if (data.Error && Array.isArray(data.Error) && data.Error.length > 0) {
      console.error('[ALLEKURIER] API returned errors:', data.Error);
      return [];
    }

    if (!data.Response || !Array.isArray(data.Response)) {
      console.error('[ALLEKURIER] Unexpected response structure');
      return [];
    }

    const services = data.Response;

    console.log(`[ALLEKURIER] ${input.fromCountry}->${input.toCountry}: ${services.length} services`);
    return services;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.error(`[ALLEKURIER] Request timed out after ${TIMEOUT_MS / 1000}s`);
    } else {
      console.error('[ALLEKURIER] Fetch failed:', err);
    }
    return [];
  }
}

/**
 * Transform AlleKurier service to ShippingOption interface
 * Mapping per docs/checkout/shipping/Q & A.md:
 * - provider ← Carrier.name
 * - servicelevel.name ← Service.name
 * - rateId ← Carrier.code + Service.code
 * - amount ← Order.gross (B2C gross price)
 * - currency ← "PLN"
 * - estimatedDays ← parse Time.days
 */
export function transformAlleKurierToShippingOption(
  service: AlleKurierService
): {
  provider: string;
  servicelevel: { name: string };
  rateId: string;
  amount: number;
  currency: string;
  estimatedDays: number;
} {
  const carrier = service.Carrier || {};
  const svc = service.Service || {};
  const order = service.Order || {};
  const time = service.Time || {};

  return {
    provider: carrier.name || 'Unknown',
    servicelevel: { name: svc.name || 'Unknown' },
    rateId: `${carrier.code || ''}_${svc.code || ''}`,
    amount: order.gross || 0,
    currency: 'PLN',
    estimatedDays: parseDaysString(time.days),
  };
}
