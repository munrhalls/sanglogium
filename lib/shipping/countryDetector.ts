export type CountryCode = 'PL' | 'GB' | 'DE';

const CACHE_KEY = 'detected_country';
const CACHE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export async function detectCountry(): Promise<CountryCode> {
  // Check cache first
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { country, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_EXPIRY_MS) {
      return country;
    }
  }

  // IP geolocation (primary)
  let detectedCountry: CountryCode | null = null;
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    const countryCode = data.country_code;
    if (countryCode === 'PL' || countryCode === 'GB' || countryCode === 'DE') {
      detectedCountry = countryCode;
    }
  } catch (e) {
    // Fall through to browser locale
  }

  // Browser locale fallback
  if (!detectedCountry) {
    const browserLocale = navigator.language;
    const localeCountry = browserLocale.split('-')[1];
    if (localeCountry === 'PL' || localeCountry === 'GB' || localeCountry === 'DE') {
      detectedCountry = localeCountry;
    }
  }

  // Default to PL
  const result = detectedCountry || 'PL';

  // Cache the result
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    country: result,
    timestamp: Date.now(),
  }));

  return result;
}
