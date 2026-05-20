# Shipping Cost Display - Technical Design

## Implementation Overview

The shipping cost display is implemented across three layers:
1. **Frontend:** BasketManager component with debouncing and state management
2. **API:** `/api/basket/shipping-rates` endpoint with parcel aggregation and splitting
3. **Utilities:** CountryDetector with caching

## Component Architecture

### Frontend: BasketManager

**Location:** `app/components/features/basket/BasketManager.tsx`

**Responsibilities:**
- Calculate parcel data from basket items
- Manage shipping cost state (null = calculating, number = cost)
- Implement 500ms debounce on basket changes
- Call shipping rates API
- Handle country detection

**Key Logic:**
```typescript
useEffect(() => {
  if (parcelData.length === 0) return;

  // Reset shipping cost to null to show "Calculating..."
  setShippingCost(null);

  const timeoutId = setTimeout(() => {
    // Fetch shipping rates after 500ms delay
    fetchShippingRates();
  }, 500);

  return () => clearTimeout(timeoutId);
}, [parcelData]);
```

### API: Shipping Rates Endpoint

**Location:** `app/api/basket/shipping-rates/route.ts`

**Responsibilities:**
- Aggregate parcel data (sum weights, max dimensions)
- Calculate parcel splitting for oversized carts
- Call AlleKurier API for Poland shipping rates
- Return cheapest shipping rate

**Courier Limits:**
- MAX_WEIGHT_G = 25,000 (25kg)
- MAX_VOLUME_CM3 = 99,000

**Parcel Splitting Algorithm:**
```typescript
// Calculate total weight and volume
let totalWeight = 0;
let totalVolume = 0;
for (const parcel of parcelData) {
  totalWeight += parcel.weight;
  totalVolume += parcel.length * parcel.width * parcel.height;
}

// Calculate number of parcels needed
const parcelsByWeight = Math.ceil(totalWeight / MAX_WEIGHT_G);
const parcelsByVolume = Math.ceil(totalVolume / MAX_VOLUME_CM3);
const numParcels = Math.max(parcelsByWeight, parcelsByVolume, 1);

// Distribute items evenly across parcels
const parcelsPerSplit = Math.ceil(parcelData.length / numParcels);
const splitParcels = [];
for (let i = 0; i < numParcels; i++) {
  // Aggregate subset into single parcel
  // Sum weights, use max dimensions
  splitParcels.push(aggregatedParcel);
}
```

**AlleKurier API Call:**
```typescript
const alleKurierServices = await fetchAlleKurierRates({
  fromCountry: senderAddress?.country || 'PL',
  fromZip: senderAddress?.zip || '',
  toCountry: countryCode,
  toZip: '02-001', // Warsaw - flat rates for domestic
  packages: splitParcels, // May be multiple parcels
});
```

### Utility: CountryDetector

**Location:** `lib/shipping/countryDetector.ts`

**Responsibilities:**
- Detect user country via IP geolocation
- Cache result for 1 hour to prevent rate limiting
- Fallback to browser locale
- Default to Poland (PL)

**Caching Strategy:**
```typescript
const CACHE_KEY = 'detected_country';
const CACHE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

// Check cache first
const cached = localStorage.getItem(CACHE_KEY);
if (cached) {
  const { country, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp < CACHE_EXPIRY_MS) {
    return country;
  }
}

// IP geolocation (primary)
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
```

### Frontend: BasketSummary

**Location:** `app/components/features/basket/BasketSummary.tsx`

**Responsibilities:**
- Display shipping cost
- Show "Calculating..." when shipping cost is null
- Include shipping cost in total

**Display Logic:**
```typescript
{shippingCost !== null ? (
  <Price value={shippingCost} variant="summary" />
) : (
  <span className="text-secondary-400">Calculating...</span>
)}
```

## Data Structures

### ParcelData
```typescript
interface ParcelData {
  length: number; // cm
  width: number; // cm
  height: number; // cm
  weight: number; // grams
}
```

### ShippingOption (from AlleKurier)
```typescript
interface ShippingOption {
  provider: string;
  servicelevel: { name: string };
  rateId: string;
  rate: { amount: number; currency: string };
}
```

## Error Handling

### API Failures
- AlleKurier API errors: Log to console, keep old shipping cost
- Network errors: Log to console, keep old shipping cost
- Invalid country: Default to PL

### Country Detection Failures
- ipapi.co rate limiting: Fallback to browser locale
- Browser locale unavailable: Default to PL
- All detection methods fail: Default to PL

## Performance Considerations

### Debouncing
- 500ms delay prevents excessive API calls on rapid basket changes
- Cancels previous pending API calls on new changes
- Shows "Calculating..." immediately for user feedback

### Caching
- Country detection cached for 1 hour in localStorage
- Prevents rate limiting on ipapi.co free tier
- Reduces API calls for returning users

### Parcel Splitting
- O(n) complexity for parcel aggregation
- O(n) complexity for parcel distribution
- Efficient for typical basket sizes (1-50 items)

## Testing

### Integration Tests
**Location:** `app/components/features/basket/__tests__/shipping-cost/shipping-rates.integration.test.ts`

**Test Cases:**
1. Empty basket - returns null
2. Single item - returns rate
3. Multiple items - returns rate
4. Edge of limit (24kg) - 1 parcel
5. Spillover (28.8kg) - 2 parcels
6. Extreme scale (96kg) - 4 parcels

### Manual Verification
- Test with 25 items (22.5kg, 165,000cm³) - should split into 2 parcels
- Test with 30 items (27kg, 198,000cm³) - should split into 2-3 parcels
- Test with 100 items (90kg, 660,000cm³) - should split into 4 parcels
- Verify "Calculating..." displays during debounce delay

## Future Enhancements

**Out of Scope (deferred to future issues):**
- Multi-country shipping (GB/DE) via Packlink PRO
- Carrier selection UI (currently returns cheapest only)
- Delivery timeline display
- Checkout flow integration
