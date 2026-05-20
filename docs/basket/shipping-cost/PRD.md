# Shipping Cost Display - Product Requirements Document

## Objective

Display shipping costs on the basket page for Poland (PL) domestic shipping to prevent cart abandonment from hidden fees.

## Problem Statement

Users abandon carts when they discover shipping costs at checkout. Displaying shipping costs upfront on the basket page increases transparency and conversion.

## Scope

**In Scope:**
- Poland (PL) domestic shipping via AlleKurier API
- Parcel aggregation from basket items
- Parcel splitting for oversized carts (25kg/99,000cm³ limits)
- Country detection with caching (ipapi.co → browser locale → default PL)
- Debouncing (500ms) to prevent excessive API calls
- "Calculating..." state during debounce delay
- Display cheapest shipping rate in basket summary

**Out of Scope:**
- Multi-country shipping (GB/DE) - deferred to future issues
- Carrier selection UI - currently returns cheapest option only
- Delivery timeline display - deferred to future issues
- Checkout flow integration - basket page only

## Requirements

### Functional Requirements

1. **Parcel Aggregation**
   - Sum weights from all basket items
   - Use max dimensions (length, width, height) for parcel dimensions
   - Convert grams to kg for API call

2. **Parcel Splitting**
   - Calculate total weight and total volume
   - Split into multiple parcels when weight exceeds 25kg OR volume exceeds 99,000cm³
   - Distribute items evenly across required number of parcels
   - Send multiple parcels to AlleKurier API
   - Return total cost as sum of all parcel rates

3. **Country Detection**
   - Detect user country via IP geolocation (ipapi.co)
   - Cache result for 1 hour to prevent rate limiting
   - Fallback to browser locale
   - Default to Poland (PL)

4. **Debouncing**
   - 500ms delay after basket changes before API call
   - Set shipping cost to null during delay (shows "Calculating...")
   - Cancel previous pending API calls on new changes

5. **Display**
   - Show "Calculating..." when shipping cost is null
   - Display shipping cost in basket summary
   - Include shipping cost in total

### Non-Functional Requirements

- **Performance:** API response < 2 seconds for typical basket (1-10 items)
- **Reliability:** Graceful fallback if API fails (show error or default cost)
- **User Experience:** "Calculating..." state provides immediate feedback
- **Scalability:** Caching prevents excessive API calls

## Definition of Done

- [x] API endpoint `/api/basket/shipping-rates` implemented
- [x] Parcel aggregation logic implemented
- [x] Parcel splitting logic implemented (25kg/99,000cm³ limits)
- [x] AlleKurier API integration for PL shipping
- [x] Country detection with caching implemented
- [x] Debouncing (500ms) implemented
- [x] "Calculating..." state implemented
- [x] Shipping cost displays in basket summary
- [x] Integration tests for 6 critical cases
- [x] Documentation updated

## Success Metrics

- Shipping cost displays correctly for all basket sizes
- Parcel splitting works for oversized carts
- "Calculating..." displays during debounce delay
- No rate limiting errors (caching works)
- Integration tests pass

## Related Issues

- sang-logium-gv9: Handle Oversized Cart Edge Case (completed)
- sang-logium-d0r: Fix Parcel Splitting Logic (completed - working correctly)
- sang-logium-nnz: Show Calculating During Shipping Cost Debounce Delay (completed)
- sang-logium-nx8: IP Geolocation API Rate Limiting Issue (resolved via caching)
