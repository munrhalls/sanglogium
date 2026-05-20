export type CountryCode = 'PL' | 'GB' | 'DE';

export async function detectCountry(): Promise<CountryCode> {
  // IP geolocation (primary)
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    const countryCode = data.country_code;
    if (countryCode === 'PL' || countryCode === 'GB' || countryCode === 'DE') {
      return countryCode;
    }
  } catch (e) {
    // Fall through to browser locale
  }

  // Browser locale fallback
  const browserLocale = navigator.language;
  const localeCountry = browserLocale.split('-')[1];
  if (localeCountry === 'PL' || localeCountry === 'GB' || localeCountry === 'DE') {
    return localeCountry;
  }

  // Default to PL
  return 'PL';
}
