# Shipping Page Polish Shipping Rates - Complete Technical Context Examination

**Date:** 2026-05-14
**Purpose:** Comprehensive examination of all work completed on shipping page Polish shipping rate integration, Furgonetka API implementation challenges, and Polish shipping data/API access issues
**Scope:** Technical context documentation only - no lesson extraction or synthesis

---

# Executive Summary

This document provides a complete technical examination of all work related to Polish shipping rate integration on the shipping page, including:

1. **Furgonetka API Research** - Systematic chunk-based research with contingency planning
2. **Current Shipping Implementation** - Multi-tier API approach with fallback mechanisms
3. **Poland Shipping Rate Research** - Alternative APIs and mock rate implementations
4. **Sprint 10 Remediation** - Previous Shippo API integration fixes

**Key Finding:** Furgonetka API research revealed that the `delivery_time` field is always null in API responses, which blocks the original experiment goal of verifying delivery time differences between geographic distances. The current production implementation uses a multi-tier approach (Packlink PRO → Shippo → Mock Poland rates) to ensure shipping options are always available.

---

# Part 1: Furgonetka API Research (Chunk-Based Approach)

## Research Structure

The Furgonetka API research was conducted using a systematic chunk-based approach with contingency planning to avoid getting lost in API exploration:

- **Chunk 1:** Data Requirements Definition (`research/furgonetka-data-requirements.md`)
- **Chunk 2:** API Endpoint Discovery (`research/furgonetka-endpoint-discovery-report.md`)
- **Chunk 3:** Request Format Verification (`research/furgonetka-request-format-specification.md`)
- **Chunk 4:** Response Format Verification (`research/furgonetka-response-format-specification.md`)
- **Chunk 5:** Authentication Verification (`research/furgonetka-authentication-verification.md`)

Each chunk included a contingency plan document (`furgonetka-chunk{N}-contingencies.md`) with systematic escalation triggers and stop conditions.

## Chunk 1: Data Requirements Definition

**File:** `research/furgonetka-data-requirements.md`

**Objective:** Define exactly what data was needed from Furgonetka API to verify rate calculation realism based on geographic distance.

**Required Data Fields:**

### Delivery Time Estimates Per Carrier
- `carrier_id` (string, required) - Unique identifier for the carrier
- `carrier_name` (string, optional) - Human-readable carrier name
- `estimated_delivery_time` (number, required) - Estimated delivery time in hours/days
- `estimated_delivery_date` (string, optional) - Estimated delivery date (ISO 8601)
- `delivery_time_unit` (string, optional) - Unit of measurement

### Cost Per Carrier
- `carrier_id` (string, required)
- `carrier_name` (string, optional)
- `total_cost` (number, required) - Total shipping cost in PLN
- `currency` (string, required) - Currency code (e.g., "PLN")
- `cost_breakdown` (object, optional) - Breakdown of costs

**Minimum Viable Data Set:**
```json
[
  {
    "carrier_id": "string",
    "estimated_delivery_time": "number",
    "total_cost": "number",
    "currency": "string"
  }
]
```

**Success Criteria for "Realistic" Rate Differences:**

### Time Realism
- Far recipient should have equal or longer delivery time than close recipient
- Delivery time difference should be proportional to geographic distance
- Minimum requirement: Far scenario time >= Close scenario time

### Cost Realism
- Far recipient should have equal or higher cost than close recipient
- Cost difference should be proportional to geographic distance
- Minimum requirement: Far scenario cost >= Close scenario cost

### Carrier Consistency
- Different carriers should show similar patterns
- At least 3 of 4 selected carriers should show realistic patterns

## Chunk 2: API Endpoint Discovery

**File:** `research/furgonetka-endpoint-discovery-report.md`

**Status:** PARTIAL SUCCESS

**Completed:**
- ✓ Authentication working (password grant)
- ✓ Carrier list endpoint accessible
- ✓ Rate calculation endpoint identified
- ✓ Carrier selection strategy defined
- ✓ Single vs multi-endpoint architecture determined

**Blocked:**
- ⚠️ Rate calculation endpoint request format requires verification (Chunk 3)
- ⚠️ Response format unknown (Chunk 4)

### Authentication Details

**Method:** OAuth 2.0 Password Grant

**OAuth Endpoint:** `https://api.sandbox.furgonetka.pl/oauth/token`

**Credentials:**
- Username: `antarcticdepths71@gmail.com`
- Password: `Furgonetkaguars77@`
- Client ID: `sanglogiumsandbox-809e5808a56792b32ed4c06b051b6ad7`
- Client Secret: `bc73ff41ebe5326108df998a8531e2d1fa483678bcc4e3bdfcf1ec50873270d7`

**Token Details:**
- Type: Bearer
- Scope: `api`
- Expires in: 2592000 seconds (30 days)

**Critical Header:** `Accept: application/vnd.furgonetka.v1+json` required for all API calls

### Working Endpoints

#### `/account/services`
**Method:** GET
**Purpose:** Retrieve available carriers/services
**Authentication:** User token (password grant)
**Response:** Carrier/service list with service IDs and configuration

**Sample Response:**
```json
{
  "services": [
    {
      "id": 11597695,
      "service": "dpd",
      "name": "DPD",
      "owner": "furgonetka",
      "configuration": {
        "additional_services": {
          "cod_enabled": true,
          "insurance_set_default_override_enabled": false
        },
        "national_only": false
      },
      "pricelist_id": 957
    }
  ]
}
```

**Available Carriers (15 total):**
1. DPD (id: 11597695)
2. FedEx (id: 11597696)
3. UPS (id: 11597697)
4. GLS (id: 11597698)
5. Poczta Polska (id: 11597699)
6. InPost (id: 11597700)
7. ORLEN Paczka (id: 11597701)
8. DHL (id: 11597702)
9. Meest (id: 11597703)
10. Ambro Express (id: 11597704)
11. DeliGoo (id: 11597706)
12. Xpress Delivery (id: 11597707)
13. SPX (id: 11597708)
14. Postivo (id: 11597709)
15. Furgonetka Giełda (id: 11597710)

#### `/configuration/allowed-countries`
**Method:** GET
**Purpose:** Get allowed shipping countries
**Response:** Country list with codes and duty info

### Rate Calculation Endpoint

#### `/packages`
**Method:** POST
**Purpose:** Calculate shipping rates for specific carrier
**Authentication:** User token (password grant)
**Status:** Endpoint exists and accessible, but request format required refinement

**Known Required Fields:**
- `service_id` - Carrier service ID from `/account/services`
- `type` - Package type (e.g., "package")
- `width`, `height`, `depth`, `weight` - Package dimensions
- `pickup` - Pickup configuration (type, name, company)
- `sender` - Sender details (postcode, city, country, name, company, phone, email)
- `receiver` - Receiver details (postcode, city, country, name, company, phone, email)

### Architecture Determination

**Type:** Single endpoint architecture

**Structure:**
- **Single pricing endpoint:** POST `/packages`
- **Carrier selection:** Via `service_id` parameter in request body
- **Multiple carriers:** Requires separate requests per service_id (one carrier per request)

**Flow:**
1. GET `/account/services` → Get list of available carriers with service_ids
2. POST `/packages` with `service_id` → Calculate rate for specific carrier
3. Repeat step 2 for each carrier

### Carrier Selection Strategy

**Primary Selection (4 Most Popular in Poland):**
1. InPost (id: 11597700) - Most popular parcel locker network in Poland
2. DPD (id: 11597695) - Major courier with strong Poland domestic presence
3. DHL (id: 11597702) - Major international carrier with established Poland operations
4. Poczta Polska (id: 11597699) - Polish national post service

**Fallback List (if primary unavailable):**
5. UPS (id: 11597697)
6. FedEx (id: 11597696)
7. GLS (id: 11597698)
8. ORLEN Paczka (id: 11597701)

## Chunk 3: Request Format Verification

**File:** `research/furgonetka-request-format-specification.md`

**Status:** COMPLETED with Critical Limitation

**Completed:**
- Request format validated
- Phone number format resolved (9 digits, Polish mobile format)
- Pricing data verified (varies by carrier)
- Realistic address scenarios tested

**Blocked:**
- delivery_time not available in API response
- Original experiment goal cannot be completed as specified

### Request Format

**Endpoint:** `https://api.sandbox.furgonetka.pl/packages`
**Method:** POST

**Headers:**
```
Authorization: Bearer {access_token}
Accept: application/vnd.furgonetka.v1+json
Content-Type: application/json
```

**Request Body Structure:**
```json
{
  "type": "package",
  "service_id": 11597700,
  "parcels": [
    {
      "width": 15,
      "height": 15,
      "depth": 15,
      "weight": 1.5
    }
  ],
  "pickup": {
    "type": "sender",
    "name": "string",
    "company": "string",
    "email": "string",
    "street": "string",
    "postcode": "string",
    "city": "string",
    "phone": "string"
  },
  "sender": {
    "postcode": "string",
    "city": "string",
    "country": "PL",
    "name": "string",
    "company": "string",
    "phone": "string",
    "email": "string",
    "street": "string"
  },
  "receiver": {
    "postcode": "string",
    "city": "string",
    "country": "PL",
    "name": "string",
    "company": "string",
    "phone": "string",
    "email": "string",
    "street": "string"
  }
}
```

### Phone Number Format Resolution

**Valid Format:** 9 digits (Polish mobile format)
- Example: `600123456`
- No country code prefix
- No spaces or special characters
- Tested formats that failed: `+48123456789`, `123456789`, `+48 123 456 789`

This was a significant blocker that required multiple attempts to resolve.

### Units

- **Dimensions:** centimeters (cm)
- **Weight:** kilograms (kg)
- **Currency:** Polish Złoty (PLN)

### Response Structure (Partial)

**Key Response Fields:**
- `package_id` - Unique package identifier
- `service` - Carrier name (e.g., "inpost", "dpd")
- `pricing.price_gross` - Total price including tax (PLN)
- `pricing.price_net` - Price excluding tax (PLN)
- `delivery_time` - **ALWAYS NULL** (not provided by API)
- `state` - Package state (e.g., "waiting")

### Critical Limitation: Delivery Time

**Finding:** The API does not provide delivery time estimates in the response.

**Tested Scenarios:**
- Same city (Warszawa to Warszawa): delivery_time = null
- Different city (Warszawa to Kraków): delivery_time = null
- Different region (Warszawa to Gdańsk): delivery_time = null
- Different carrier (DPD): delivery_time = null

**Impact on Original Experiment:**
The original experiment goal was to verify rate calculation realism by comparing delivery time and cost estimates for geographically close and far addresses. Since delivery_time is not available, the experiment cannot be completed as specified.

**Possible Workarounds:**
1. Adjust experiment to only verify cost differences (pricing is available)
2. Contact Furgonetka support to ask if delivery_time is available via different endpoint
3. Use carrier-specific delivery time estimates from carrier documentation (external data source)

## Chunk 4: Response Format Verification

**File:** `research/furgonetka-response-format-specification.md`

**Status:** COMPLETED with Critical Limitation

**Completed:**
- Response format documented with complete field definitions
- Cost extraction method documented
- Response variations identified (by carrier, by distance)
- Critical limitation documented (delivery_time always null)

**Blocked:**
- delivery_time data extraction not possible (API limitation)
- Original experiment goal cannot be completed as specified

### Complete Response Field Definitions

#### Root-Level Fields
- `package_id` (integer) - Unique package identifier
- `service` (string) - Carrier name (lowercase, e.g., "inpost", "dpd")
- `service_id` (integer) - Carrier service ID from request
- `pricing` (object) - Pricing information
- `delivery_time` (null) - **ALWAYS NULL** - delivery time not provided
- `state` (string) - Package state (e.g., "waiting")
- `pickup` (object) - Pickup location details
- `sender` (object) - Sender address details
- `receiver` (object) - Recipient address details
- `parcels` (array) - Package dimensions and weight
- `additional_services` (object) - Additional service flags
- And many metadata fields (edit_url, tracking_url, etc.)

#### Pricing Object
- `price_gross` (number) - Total price including tax (PLN)
- `price_net` (number) - Price excluding tax (PLN)
- `price_base_net` (number) - Base price before adjustments (PLN)
- `tax` (number) - Tax rate percentage (e.g., 23)
- `details` (array) - Price breakdown items (e.g., fuel surcharge)

**Cost Extraction Method:**
```javascript
const cost = {
  gross: response.pricing.price_gross,    // Total with tax
  net: response.pricing.price_net,        // Without tax
  taxRate: response.pricing.tax,         // Tax percentage
  breakdown: response.pricing.details    // Additional fees
};
```

### Response Variations

#### By Carrier
**InPost (service_id: 11597700):**
- `service`: `"inpost"`
- `price_gross`: `19.31` PLN (Warszawa to Kraków)
- `price_net`: `15.7` PLN

**DPD (service_id: 11597695):**
- `service`: `"dpd"`
- `price_gross`: `27.17` PLN (Warszawa to Kraków)
- `price_net`: `22.09` PLN

#### By Distance (No Impact on delivery_time)
**Same City (Warszawa to Warszawa):**
- `delivery_time`: `null`
- `price_gross`: `19.31` PLN (InPost)

**Different City (Warszawa to Kraków):**
- `delivery_time`: `null`
- `price_gross`: `19.31` PLN (InPost)

**Different Region (Warszawa to Gdańsk):**
- `delivery_time`: `null`
- `price_gross`: `19.31` PLN (InPost)

**Finding:** Distance does not affect pricing or delivery_time in sandbox environment. Pricing appears to be flat-rate for InPost within Poland.

### Critical Limitation: Delivery Time

**Finding:** The `delivery_time` field is always null regardless of:
- Distance (same city vs different city vs different region)
- Carrier (InPost vs DPD)
- Service configuration

**Tested Scenarios:**
- Same city (Warszawa to Warszawa): `delivery_time = null`
- Different city (Warszawa to Kraków): `delivery_time = null`
- Different region (Warszawa to Gdańsk): `delivery_time = null`
- Different carrier (DPD): `delivery_time = null`

**Impact on Experiment:**
- Original experiment goal: Verify rate calculation realism using delivery time and cost differences
- Only cost data is available from API
- Cannot verify delivery time differences between carriers or distances
- Experiment scope must be adjusted to cost-only verification

## Chunk 5: Authentication Verification

**File:** `research/furgonetka-authentication-verification.md`

**Status:** PASSED ✓

Authentication is fully functional for the Furgonetka Sandbox API.

**Authentication Details:**
- **Method:** OAuth 2.0 Password Grant
- **OAuth Endpoint:** `https://api.sandbox.furgonetka.pl/oauth/token`
- **Credentials:** antarcticdepths71@gmail.com / Furgonetkaguars77@
- **Token Type:** Bearer
- **Scope:** `api`
- **Expires in:** 2592000 seconds (30 days)
- **Status:** Active and functional

**Endpoint Access Verification:**
- **Tested Endpoint:** POST `/packages`
- **Test Result:** Token accepted by API (authentication successful)
- **Note:** The test request returned 400 Bad Request due to request format validation, but this confirms the token is valid and has permissions to access the endpoint. A 401 or 403 status would indicate authentication/permission failure.

**Permissions Confirmed:**
- ✓ Token has necessary permissions for POST `/packages`
- ✓ Token has necessary permissions for GET `/account/services` (verified in Chunk 2)
- ✓ Token scope is `api` (full API access)

## Furgonetka Authentication Issues (Pre-Flight)

**File:** `research/Furgonetka-Auth-Problem-Description.md`
**File:** `research/Furgonetka-Pre-Flight-Status-Overview.md`

### Initial Authentication Problems

**Issue 1: Password Grant fails with invalid_grant**
- The username/password combination was wrong for the sandbox environment
- Current status: Rate-limited (429 Too Many Requests) from repeated failed attempts

**Issue 2: GET requests return "JSON decode error: Syntax error" (RESOLVED)**
- Sending `Content-Type: application/json` on bodyless GET requests causes Furgonetka's API (built on Symfony/API Platform) to attempt JSON parsing on an empty body
- **Fix Applied:** Remove Content-Type header from GET requests. Only send Authorization and Accept headers.

### Resolution

**After Fix:**
- Password grant: WORKING (token acquired successfully)
- Client credentials grant: WORKING (fallback)
- API access: PARTIALLY WORKING (user-scoped endpoints accessible, shipment/pricing endpoints require password grant)

**Critical Header:** `Accept: application/vnd.furgonetka.v1+json` required for all API calls

## Furgonetka Contingency Planning

**File:** `research/furgonetka-chunk2-contingencies.md`
**File:** `research/furgonetka-chunk3-contingencies.md`

### Contingency Framework

**Decision Rule:** If any step fails or complications arise, follow the contingency for that step before proceeding. If contingency fails, STOP and escalate to user.

### Chunk 2 Escalation Triggers (STOP conditions)

Stop immediately and escalate to user if:
- Authentication fails with both methods (credentials issue)
- Sandbox API completely unreachable (infrastructure issue)
- Known working endpoint `/account/services` fails (account/permission issue)
- `/account/services` returns 500 error consistently (API issue)
- 30+ endpoint patterns tested and pricing endpoint not found (requires official docs)
- Multi-endpoint flow requires >3 endpoints (scope complexity)
- 0 carriers available from `/account/services` (account configuration)

### Chunk 3 Escalation Triggers (STOP conditions)

Stop immediately and escalate to user if:
- Phone number format: 5+ formats tested and all rejected
- Field additions: 10+ attempts and still getting validation errors
- Service_ids: 5+ different carriers tested and all fail with same error
- API stability: /account/services returns 502 (sandbox down)
- Data format: 5+ unit variations tested and all rejected
- Any step requires >3 contingency attempts without progress

## Furgonetka Test Scripts

Multiple test scripts were created to verify different aspects of the Furgonetka API:

### `scripts/test-furgonetka-carriers.mjs`
Tests `/account/services` endpoint to get carrier list. Uses client credentials grant initially.

### `scripts/test-furgonetka-password-auth.mjs`
Tests OAuth password grant authentication method.

### `scripts/test-furgonetka-pricing-endpoint.mjs`
Tests pricing endpoint discovery and attempts to find Swagger/OpenAPI documentation.

### `scripts/test-furgonetka-request-format.mjs`
Incremental field testing to validate POST `/packages` request format by adding fields one at a time.

### `scripts/test-furgonetka-realistic-scenarios.mjs`
Tests close vs far recipient scenarios to verify rate calculation realism.

### `scripts/test-furgonetka-price-calculation.mjs`
Tests price calculation with correct v1+json headers.

### `scripts/verify-furgonetka-auth.mjs`
Verification script to confirm authentication is working.

### `scripts/verify-furgonetka-request-format.mjs`
Verification script for request format validation.

---

# Part 2: Current Shipping Page Implementation

## Multi-Tier API Architecture

**File:** `app/api/shipping/rates/route.ts`

The shipping rates API implements a three-tier fallback approach to ensure shipping options are always available:

### Tier 1: Packlink PRO (Primary)
- **API:** `https://api.packlink.com/v1/services`
- **Auth:** Raw API key in Authorization header (no "Bearer" prefix)
- **Status:** Free-tier production API, real calculated shipping rates
- **Rate quoting:** Read-only, does not require billing method
- **Label purchase:** POST /v1/shipments would require billing - never called

**File:** `lib/shipping/packlink-rates.ts`

**Implementation:**
```typescript
export async function fetchPacklinkRates(input: PacklinkRatesInput): Promise<PacklinkService[]>
```

**Returns:** Array of PacklinkService objects with:
- `id`, `name`, `carrier_name`
- `price.total_price`, `price.base_price`, `price.tax_price`
- `transit_hours`, `transit_time`
- `insurance`, `cash_on_delivery` flags
- `dropoff`, `delivery_to_parcelshop` flags

### Tier 2: Shippo (Fallback)
- **API:** `https://api.goshippo.com/shipments/`
- **Auth:** `ShippoToken {SHIPPO_API_KEY}`
- **Status:** Used only if Packlink returns no rates
- **Resilience features:**
  - Timeout: 15 seconds
  - Retry: 2 retries with exponential backoff (500ms, 1500ms)
  - Circuit breaker: Opens after 5 consecutive failures in 60s, blocks for 30s

**Implementation in route.ts:**
```typescript
const shippoResponse = await fetchWithRetry(
  'https://api.goshippo.com/shipments/',
  {
    method: 'POST',
    headers: {
      'Authorization': `ShippoToken ${SHIPPO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(shippoRequestBody),
  },
  15000,  // 15s timeout
  2       // 2 retries
);
```

### Tier 3: Mock Poland Domestic Rates (Last Resort)
- **Trigger:** Only when countryCode === 'PL' and both Packlink and Shippo return no rates
- **Purpose:** Ensure shipping options are always available for Poland domestic shipping
- **Basis:** Realistic mock rates based on actual carrier pricing research

**File:** `lib/shipping/carrier-rates.ts`

**Implementation:**
```typescript
export function getPolandDomesticRates(
  parcel: ParcelDimensions,
  senderLocation?: GeoPoint,
  recipientLocation?: GeoPoint
): ShippingRate[]
```

**Features:**
- Distance-based delivery time calculation using Haversine formula
- 12 major Polish cities with coordinates for distance calculation
- Carrier pricing based on actual research:
  - DHL Express: Base rate + weight-based pricing
  - FedEx Express: Slightly different pricing structure
  - UPS Standard: More economical pricing
  - InPost Parcel Locker: Fixed pricing by parcel size (Size A/B/C)
  - DPD Classic: Weight-based pricing

**Carriers Provided:**
1. DHL Express Domestic
2. FedEx Express Domestic
3. UPS Standard Poland
4. InPost Parcel Locker
5. DPD Classic Poland

## Sender Address Configuration

**File:** `app/api/shipping/rates/route.ts` (lines 152-209)

The shipping rates API supports destination-based sender address selection to handle multiple shipping origins.

### Environment Variable Convention

**Priority Order (first match wins):**
1. **Country-specific:** `SHIPPO_SENDER_{COUNTRY}_*` (e.g., `SHIPPO_SENDER_PL_NAME`)
2. **Default fallback:** `SHIPPO_SENDER_DEFAULT_*`
3. **Legacy backward compatibility:** `SHIPPO_SENDER_*` (no country suffix)

**Required fields:**
- `NAME` - Company name
- `STREET` - Street address
- `CITY` - City
- `ZIP` - Postal code
- `COUNTRY` - 2-letter ISO country code

**Optional fields:**
- `STATE` - State/province
- `PHONE` - Phone number
- `EMAIL` - Email address

### Selection Logic

The API reads the destination country from `shippingAddress.regionCode` (validated as 2-letter ISO code) and:
1. Checks for country-specific sender address (`SHIPPO_SENDER_{REGIONCODE}_*`)
2. Falls back to default sender address (`SHIPPO_SENDER_DEFAULT_*`)
3. Falls back to legacy sender address (`SHIPPO_SENDER_*`) for backward compatibility
4. Returns CONFIGURATION error if no sender address is configured

## Parcel Data Aggregation

**File:** `app/api/shipping/rates/route.ts` (lines 232-267)

The API derives parcel data from actual basket products:

**Process:**
1. Fetch product parcel data from Sanity CMS using product IDs from basket reservation
2. Aggregate parcel data:
   - Sum weights (multiplied by quantity)
   - Use max dimensions (length, width, height)
3. Validate that all products have parcel data
4. Return VALIDATION error if any product is missing parcel data (no silent fallback)

**Aggregation Logic:**
```typescript
for (const product of products) {
  if (!product.parcel) {
    return Response.json(
      { error: `Product ${product._id} missing parcel data`, errorClass: 'VALIDATION', retryable: false },
      { status: 400 }
    );
  }

  const quantity = basketReservation.find((item) => item._id === product._id)?.quantity || 1;
  totalWeight += product.parcel.weight * quantity;
  maxLength = Math.max(maxLength, product.parcel.length);
  maxWidth = Math.max(maxWidth, product.parcel.width);
  maxHeight = Math.max(maxHeight, product.parcel.height);
}
```

## Error Classification

**File:** `app/api/shipping/rates/route.ts`

Errors are classified into 4 types for appropriate handling:

```typescript
type ShippoErrorClass = 
  | 'CONFIGURATION'  // missing env vars → 500, log alert
  | 'VALIDATION'     // bad address/parcel → 400, user-friendly message
  | 'PROVIDER'       // Shippo returned error → 502, retryable
  | 'NETWORK'        // timeout/fetch failure → 502, retryable
```

**Error Handling:**
- Log full error details server-side with console.error
- Return sanitized `{ error, errorClass, retryable }` to client
- Frontend maps `errorClass` to user-friendly message + optional retry button

## Shipping Page UI

**File:** `app/(store)/checkout/shipping/page.tsx`

**Features:**
- Displays shipping options inline (no page navigation for selection)
- Shows provider name, service level, price, estimated delivery days
- Visual selection feedback (border highlight for selected option)
- Error states with retry button for retryable errors
- "Continue to Payment" button disabled until option selected
- Saves shipping choice to basket reservation on continue

**Data Flow:**
1. Page mounts → Get basketReservationId from sessionStorage
2. Fetch shipping options from `/api/shipping/rates`
3. Display options or error state
4. User selects option → Visual feedback
5. User clicks "Continue to Payment" → PATCH basket reservation with shippingChoice
6. Redirect to payment page

---

# Part 3: Poland Shipping Rate Research

## Epaka.pl API Research

**File:** `scripts/validate-poland-shipping-rates.mjs`

**Purpose:** Validate epaka.pl API returns distance-based shipping rates for Poland domestic shipping.

**Test Configuration:**
- Sender: Warszawa 00-533
- Receivers:
  - CLOSE: Warszawa 00-001 (~2km)
  - MEDIUM: Warszawa Praga 03-001 (~8km)
  - FAR: Kraków 30-001 (~300km)
- Package: 15x15x15 cm, 1.5 kg

**Expected Results:**
- CLOSE: lowest rates / shortest timelines
- MEDIUM: medium rates / medium timelines
- FAR: highest rates / longest timelines

**Validation:**
- Compare cheapest rates across distances
- Verify FAR >= CLOSE (rates increase with distance)
- Document actual rates returned by API

## Poland Shipping API Comparison Research

**File:** `research/poland-shipping-api-comparison.md`

**Purpose:** Compare different Poland shipping APIs for rate calculation capabilities.

**APIs Compared:**
- Furgonetka
- Epaka.pl
- Other potential providers

**Comparison Criteria:**
- Authentication method
- Rate calculation endpoint
- Delivery time availability
- Cost accuracy
- API stability

## Poland Shipping Rate Experiment Contract

**File:** `_project/research/poland-shipping-rate-experiment-contract.md`

**Purpose:** Define contract for Poland shipping rate calculation experiment.

**Experiment Goals:**
- Verify rate calculation realism
- Compare delivery time and cost for close vs far addresses
- Validate distance-based pricing

**Success Criteria:**
- Far recipient has equal or higher cost than close recipient
- Far recipient has equal or longer delivery time than close recipient
- Rates are realistic (not test data)

---

# Part 4: Sprint 10 - Fix Shipping Rates (Shippo Remediation)

**File:** `_project/sprints/10_fix_shipping_rates.md`

**Purpose:** Remediate Shippo API integration issues that were causing shipping rates to fail.

## Root Cause (Verified — Sprint 09)

```
[DEBUG] Shippo API error: {"parcels":[{"mass_unit":["This field is required."]}]}
```

**Direct Cause:**
- `app/api/shipping/rates/route.ts:45-46` sends `distanceUnit` and `massUnit` (camelCase)
- Shippo API requires `distance_unit` and `mass_unit` (snake_case)
- This is the direct cause of "Failed to fetch shipping rates from Shippo"

## Additional Gaps (Trace Verified)

- Hardcoded fake sender address (`"123 Main St, Warsaw"`)
- Sanity client created without auth token
- Parcel data hardcoded, not derived from basket products
- No timeout, retry, or circuit breaker on Shippo fetch
- Raw Shippo error details leaked to client
- `address_to.state` always empty string
- No input validation on shippingAddress fields
- Zero tests

## Scope Contracts

### Scope 1: Fix snake_case Bug (Immediate Unblock)
**UX Slice:** User visits `/checkout/shipping` → shipping rates display instead of error

**Architecture Slice:** Fix `PARCEL_DATA` field names in `app/api/shipping/rates/route.ts:40-47`
- `distanceUnit` → `distance_unit`
- `massUnit` → `mass_unit`

### Scope 2: Real Sender Address from Env Vars
**Architecture Slice:** Read sender address from environment variables at request time
- Remove hardcoded `"123 Main St, Warsaw, MZ, 00-001, PL"`
- Add to `.env.example` with placeholder values

### Scope 3: Authenticated Sanity Client
**Architecture Slice:** Replace `createClient({ projectId, dataset, apiVersion, useCdn: false })` (no token) with `getBackendClient()` from `@/sanity-cms/lib/backendClient` (uses `SANITY_STUDIO_READ_WRITE` token)

### Scope 4: Derive Parcel Data from Basket Products
**Architecture Slice:** Extend GROQ query to fetch `basketReservation` array with product `_id`s, fetch each product's `parcel` field from Sanity, aggregate (sum weights, use max dimensions)

### Scope 5: Resilience — Timeout, Retry, Circuit Breaker
**Architecture Slice:** Wrap Shippo fetch with:
- Timeout: `AbortController` with 15s timeout
- Retry: 2 retries with exponential backoff (500ms, 1500ms) on 5xx or network errors
- Circuit breaker: Simple in-memory counter — 5 consecutive failures in 60s window → fail fast for 30s

### Scope 6: Error Handling + Input Validation
**Architecture Slice:** Classify all errors into 4 types (CONFIGURATION, VALIDATION, PROVIDER, NETWORK), log full error details server-side, return sanitized `{ error, errorClass, retryable }` to client

### Scope 7: Tests (Minimal, Black Box, Valuable)
**Architecture Slice:** Integration test for `GET /api/shipping/rates` with mocked Shippo response, E2E test for shipping page flow

---

# Part 5: Key Technical Findings

## Furgonetka API Limitations

### Critical Limitation: Delivery Time Not Available
**Finding:** The `delivery_time` field is always null in Furgonetka API responses regardless of distance, carrier, or service configuration.

**Impact:**
- Original experiment goal (verify delivery time differences) cannot be completed
- Only cost data is available for rate comparison
- Alternative data sources needed for delivery time estimates

**Workarounds Considered:**
1. Adjust experiment to cost-only verification
2. Contact Furgonetka support for delivery time endpoint
3. Use carrier-specific delivery time estimates from external documentation

### Phone Number Format Complexity
**Finding:** Phone number validation was a significant blocker requiring multiple attempts to resolve.

**Tested Formats (all rejected initially):**
- `+48123456789` - rejected (invalid format)
- `123456789` - rejected (invalid format)
- `+48 123 456 789` - rejected (invalid format)

**Final Solution:** 9 digits, Polish mobile format (e.g., `600123456`)
- No country code prefix
- No spaces or special characters

### Authentication Complexity
**Finding:** Initial authentication failures required systematic troubleshooting.

**Issues:**
- Password grant failed due to incorrect credentials
- Rate-limited (429 Too Many Requests) from repeated failed attempts
- GET requests returned JSON decode errors due to Content-Type header

**Resolution:**
- Updated sandbox account password
- Switched to password grant flow with user credentials
- Removed Content-Type header from GET requests
- Used `Accept: application/vnd.furgonetka.v1+json` header

## Current Production Implementation Strategy

### Multi-Tier Fallback Approach
**Rationale:** Ensure shipping options are always available regardless of external API failures.

**Tier 1: Packlink PRO (Primary)**
- Free-tier production API
- Real calculated shipping rates
- Read-only rate quoting (no billing required)
- Used as first choice for all shipping

**Tier 2: Shippo (Fallback)**
- Used only if Packlink returns no rates
- Includes resilience features (timeout, retry, circuit breaker)
- Historical integration with known issues (fixed in Sprint 10)

**Tier 3: Mock Poland Domestic Rates (Last Resort)**
- Only triggered for Poland domestic shipping (countryCode === 'PL')
- Based on actual carrier pricing research
- Distance-based delivery time calculation
- Ensures shipping options always available for Poland

### Sender Address Flexibility
**Feature:** Destination-based sender address selection

**Implementation:**
- Country-specific environment variables (SHIPPO_SENDER_{COUNTRY}_*)
- Default fallback (SHIPPO_SENDER_DEFAULT_*)
- Legacy backward compatibility (SHIPPO_SENDER_*)

**Use Case:** Support multiple shipping origins (e.g., Poland warehouse, US warehouse)

### Parcel Data Derivation
**Feature:** Derive parcel data from actual basket products

**Implementation:**
- Fetch product parcel data from Sanity CMS
- Aggregate (sum weights, max dimensions)
- Validate all products have parcel data
- Fail with clear error if parcel data missing (no silent fallback)

### Error Classification and Resilience
**Feature:** Systematic error handling with retry capability

**Error Classes:**
- CONFIGURATION (missing env vars) → 500, log alert
- VALIDATION (bad address/parcel) → 400, user-friendly message
- PROVIDER (Shippo error) → 502, retryable
- NETWORK (timeout/fetch failure) → 502, retryable

**Resilience Features:**
- 15-second timeout for external API calls
- 2 retries with exponential backoff (500ms, 1500ms)
- Circuit breaker (5 failures in 60s → block for 30s)

## Poland-Specific Considerations

### Mock Poland Domestic Rates
**Rationale:** Shippo test mode has geographic limitations and does not support Poland domestic shipping in test environment.

**Implementation:**
- Based on actual carrier pricing research (InPost, DPD, DHL, etc.)
- Distance-based delivery time calculation using Haversine formula
- 12 major Polish cities with coordinates
- Carrier-specific pricing models (weight-based, size-based, etc.)

**Carriers:**
- DHL Express (base rate + weight-based)
- FedEx Express (slightly different pricing)
- UPS Standard (more economical)
- InPost Parcel Locker (fixed pricing by size A/B/C)
- DPD Classic (weight-based)

### Alternative APIs Researched
**Epaka.pl:**
- OAuth password grant authentication
- Rate calculation endpoint: `/v1/order/prices`
- Distance-based pricing validation script created
- Considered as alternative to Furgonetka

**Packlink PRO:**
- Currently used as Tier 1 in production
- Free-tier production API
- Real calculated rates
- No billing required for rate quoting

---

# Part 6: Test Scripts and Verification

## Furgonetka Test Scripts

### Authentication Scripts
- `scripts/test-furgonetka-auth.mjs` - Tests both password grant and client credentials
- `scripts/verify-furgonetka-auth.mjs` - Verification script for authentication

### Endpoint Discovery Scripts
- `scripts/test-furgonetka-carriers.mjs` - Tests `/account/services` endpoint
- `scripts/test-furgonetka-pricing-endpoint.mjs` - Tests pricing endpoint discovery

### Request Format Scripts
- `scripts/test-furgonetka-request-format.mjs` - Incremental field testing
- `scripts/verify-furgonetka-request-format.mjs` - Verification script for request format

### Scenario Testing Scripts
- `scripts/test-furgonetka-realistic-scenarios.mjs` - Tests close vs far recipient scenarios
- `scripts/test-furgonetka-price-calculation.mjs` - Tests price calculation with v1+json headers

### Account Services Script
- `scripts/test-furgonetka-account-services.mjs` - Tests `/account/services` endpoint

## Poland Shipping Validation Scripts

- `scripts/validate-poland-shipping-rates.mjs` - Validates epaka.pl API distance-based pricing

## Shippo Verification Scripts

- `scripts/verify-packlink-api-rates.mjs` - Verifies Packlink PRO API integration

---

# Part 7: Documentation Structure

## Furgonetka Research Documents

### Core Research Documents
- `research/furgonetka-data-requirements.md` - Chunk 1: Data requirements definition
- `research/furgonetka-endpoint-discovery-report.md` - Chunk 2: API endpoint discovery
- `research/furgonetka-request-format-specification.md` - Chunk 3: Request format verification
- `research/furgonetka-response-format-specification.md` - Chunk 4: Response format verification
- `research/furgonetka-authentication-verification.md` - Chunk 5: Authentication verification

### Contingency Planning Documents
- `research/furgonetka-chunk2-contingencies.md` - Contingencies for endpoint discovery
- `research/furgonetka-chunk3-contingencies.md` - Contingencies for request format verification

### Problem Description Documents
- `research/Furgonetka-Auth-Problem-Description.md` - Initial authentication problems
- `research/Furgonetka-Pre-Flight-Status-Overview.md` - Pre-flight status after fixes

### Test Plan
- `research/furgonetka-test-plan.md` - Comprehensive test plan in Polish

## Shipping Slice Documentation

### Core Documentation
- `docs/checkout/shipping/README.md` - Shipping slice overview and architecture
- `docs/checkout/shipping/shipping-slice.md` - Flow diagram
- `docs/checkout/shipping/1. PRD.md` - Product requirements
- `docs/checkout/shipping/2. Minimal Viable Solution Design.md` - Technical design

## Sprint Documentation
- `_project/sprints/10_fix_shipping_rates.md` - Sprint 10 remediation plan

## Poland Shipping Research
- `research/poland-shipping-api-comparison.md` - API comparison research
- `_project/research/poland-shipping-rate-experiment-contract.md` - Experiment contract

---

# Part 8: Implementation Files

## Core Implementation Files

### API Routes
- `app/api/shipping/rates/route.ts` - Shipping rates API endpoint (multi-tier approach)

### Shipping Page
- `app/(store)/checkout/shipping/page.tsx` - Shipping page UI component

### Shipping Logic
- `lib/shipping/carrier-rates.ts` - Mock Poland domestic rates implementation
- `lib/shipping/packlink-rates.ts` - Packlink PRO API integration

---

# Part 9: Environment Variables

### Furgonetka Credentials
```
FURGONETKA_SANDBOX_CLIENT_ID=sanglogiumsandbox-809e5808a56792b32ed4c06b051b6ad7
FURGONETKA_SANDBOX_CLIENT_SECRET=bc73ff41ebe5326108df998a8531e2d1fa483678bcc4e3bdfcf1ec50873270d7
FURGONETKA_USERNAME=antarcticdepths71@gmail.com
FURGONETKA_PASSWORD=Furgonetkaguars77@
```

### Shippo Credentials
```
SHIPPO_API_KEY={shippo_api_key}
```

### Packlink Credentials
```
PACKLINK_PRO_API={packlink_api_key}
```

### Sender Address Configuration
```
# Default sender address (fallback for all countries)
SHIPPO_SENDER_DEFAULT_NAME=Sang Logium
SHIPPO_SENDER_DEFAULT_STREET=123 Main St
SHIPPO_SENDER_DEFAULT_CITY=Warsaw
SHIPPO_SENDER_DEFAULT_STATE=MZ
SHIPPO_SENDER_DEFAULT_ZIP=00-001
SHIPPO_SENDER_DEFAULT_COUNTRY=PL
SHIPPO_SENDER_DEFAULT_PHONE=+48123456789
SHIPPO_SENDER_DEFAULT_EMAIL=sender@example.com

# Country-specific: Poland (PL)
SHIPPO_SENDER_PL_NAME=Sang Logium PL
SHIPPO_SENDER_PL_STREET=456 Warsaw St
SHIPPO_SENDER_PL_CITY=Warsaw
SHIPPO_SENDER_PL_STATE=MZ
SHIPPO_SENDER_PL_ZIP=00-001
SHIPPO_SENDER_PL_COUNTRY=PL
SHIPPO_SENDER_PL_PHONE=+48123456789
SHIPPO_SENDER_PL_EMAIL=sender-pl@example.com
```

---

# Part 10: Key Issues and Complexities

## Furgonetka API Complexities

### 1. Authentication Complexity
**Issue:** Initial authentication failures with multiple error modes
- Password grant failed with invalid_grant
- Rate-limited after repeated attempts
- GET requests returned JSON decode errors

**Resolution:** Systematic troubleshooting with contingency planning

### 2. Endpoint Discovery Complexity
**Issue:** 30+ endpoint patterns tested before finding working endpoint
- Documentation not accessible via web scraping
- Changelog referenced endpoints but not actual paths
- Blind testing required

**Resolution:** Systematic testing with contingency planning and stop conditions

### 3. Request Format Complexity
**Issue:** Phone number format blocker requiring multiple attempts
- 3 formats tested and rejected before finding correct format
- Polish-specific format (9 digits, no prefix)

**Resolution:** Incremental field testing with systematic format variations

### 4. Response Format Limitation
**Issue:** delivery_time field always null
- Blocks original experiment goal
- Not documented in API documentation
- No workaround available in API

**Resolution:** Document limitation, consider alternative data sources

## Shippo Integration Complexities

### 1. Field Naming Convention
**Issue:** camelCase vs snake_case mismatch
- Code used `distanceUnit` and `massUnit`
- API required `distance_unit` and `mass_unit`

**Resolution:** Fixed field names to snake_case

### 2. Authentication Token
**Issue:** Sanity client created without auth token
- Used `createClient({ projectId, dataset, apiVersion, useCdn: false })`
- No token for write operations

**Resolution:** Switched to `getBackendClient()` with `SANITY_STUDIO_READ_WRITE` token

### 3. Hardcoded Data
**Issue:** Hardcoded fake sender address and parcel data
- Sender address: `"123 Main St, Warsaw"`
- Parcel data: Fixed dimensions and weight

**Resolution:** Derive from environment variables and basket products

### 4. Lack of Resilience
**Issue:** No timeout, retry, or circuit breaker
- API failures caused hard failures
- No graceful degradation

**Resolution:** Added timeout (15s), retry (2x), circuit breaker (5 failures in 60s)

### 5. Error Handling
**Issue:** Raw API errors leaked to client
- No error classification
- No user-friendly messages

**Resolution:** Added error classification (CONFIGURATION, VALIDATION, PROVIDER, NETWORK)

## Poland-Specific Complexities

### 1. Shippo Geographic Limitations
**Issue:** Shippo test mode does not support Poland domestic shipping
- Test mode has geographic limitations
- Cannot test Poland domestic rates in test environment

**Resolution:** Implemented mock Poland domestic rates based on carrier research

### 2. Delivery Time Data Unavailable
**Issue:** Furgonetka API does not provide delivery time estimates
- delivery_time field always null
- Cannot verify delivery time differences

**Resolution:** Consider alternative data sources or adjust experiment scope

### 3. Multiple API Options
**Issue:** Multiple Poland shipping APIs available with different capabilities
- Furgonetka: Good carrier selection, no delivery time
- Epaka.pl: Distance-based pricing, requires OAuth
- Packlink PRO: Real rates, free tier, currently used

**Resolution:** Multi-tier approach with Packlink PRO as primary

---

# Part 11: Solutions Implemented

## Furgonetka API Solutions

### Authentication Solution
- Updated sandbox account password
- Switched to password grant flow with user credentials
- Removed Content-Type header from GET requests
- Used `Accept: application/vnd.furgonetka.v1+json` header

### Endpoint Discovery Solution
- Systematic testing of 30+ endpoint patterns
- Identified `/packages` as rate calculation endpoint
- Identified `/account/services` as carrier list endpoint
- Documented single-endpoint architecture with per-carrier requests

### Request Format Solution
- Incremental field testing approach
- Resolved phone number format (9 digits, Polish mobile)
- Documented complete request format with all required fields
- Created verification scripts for future validation

### Response Format Solution
- Documented complete response schema
- Identified delivery_time limitation
- Documented cost extraction method
- Created verification scripts for response validation

## Shippo Integration Solutions

### Field Naming Solution
- Changed `distanceUnit` → `distance_unit`
- Changed `massUnit` → `mass_unit`
- Updated ParcelData interface

### Authentication Solution
- Switched to `getBackendClient()` from `sanity-cms/lib/backendClient`
- Uses `SANITY_STUDIO_READ_WRITE` token
- Verified token has create permissions

### Data Derivation Solution
- Derive sender address from environment variables
- Derive parcel data from basket products
- Aggregate parcel data (sum weights, max dimensions)
- Validate all products have parcel data

### Resilience Solution
- Added 15-second timeout with AbortController
- Added 2 retries with exponential backoff (500ms, 1500ms)
- Added circuit breaker (5 failures in 60s → block for 30s)

### Error Handling Solution
- Classify errors into 4 types (CONFIGURATION, VALIDATION, PROVIDER, NETWORK)
- Log full error details server-side
- Return sanitized error responses to client
- Display retry button for retryable errors

## Poland Shipping Solutions

### Mock Poland Rates Solution
- Implemented realistic mock rates based on carrier research
- Distance-based delivery time calculation using Haversine formula
- 12 major Polish cities with coordinates
- 5 carriers with accurate pricing models

### Multi-Tier Fallback Solution
- Tier 1: Packlink PRO (primary, real rates)
- Tier 2: Shippo (fallback with resilience)
- Tier 3: Mock Poland rates (last resort for PL domestic)

### Sender Address Flexibility Solution
- Country-specific environment variables
- Default fallback
- Legacy backward compatibility
- Automatic selection based on destination country

---

# Part 12: Open Issues and Blockers

## Furgonetka API Open Issues

### Critical Blocker: Delivery Time Not Available
**Status:** BLOCKED
**Issue:** delivery_time field is always null in API responses
**Impact:** Original experiment goal cannot be completed
**Workarounds Considered:**
1. Adjust experiment to cost-only verification
2. Contact Furgonetka support for delivery time endpoint
3. Use carrier-specific delivery time estimates from external documentation
**Decision:** Document limitation, proceed with cost-only verification if needed

## Shippo Integration Open Issues

### Geographic Limitations in Test Mode
**Status:** MITIGATED
**Issue:** Shippo test mode does not support Poland domestic shipping
**Mitigation:** Mock Poland domestic rates implemented
**Note:** Production Shippo may support Poland domestic shipping (not tested)

---

# Part 13: Test Coverage

## Furgonetka API Test Coverage

### Authentication Tests
- Password grant authentication ✓
- Client credentials grant ✓
- Token expiration handling ✓

### Endpoint Tests
- `/account/services` endpoint ✓
- `/packages` endpoint ✓
- `/configuration/allowed-countries` endpoint ✓

### Request Format Tests
- Incremental field testing ✓
- Phone number format variations ✓
- Complete request format validation ✓

### Scenario Tests
- Same city (Warszawa to Warszawa) ✓
- Different city (Warszawa to Kraków) ✓
- Different region (Warszawa to Gdańsk) ✓
- Different carrier (DPD) ✓

## Current Production Test Coverage

### Integration Tests
- None currently implemented for shipping rates API
- Scope Contract 7 from Sprint 10 calls for integration tests
- Not yet completed

### E2E Tests
- None currently implemented for shipping page
- Scope Contract 7 from Sprint 10 calls for E2E tests
- Not yet completed

---

# Part 14: Dependencies and Relationships

## Upstream Dependencies

### Shipping Slice Dependencies
- Address slice (shippingAddress in basket reservation)
- Product parcel data in Sanity CMS
- Environment variables for sender addresses
- External APIs (Packlink PRO, Shippo)

### Furgonetka Research Dependencies
- Sandbox account credentials
- OAuth token management
- API documentation (limited access)

## Downstream Dependencies

### Shipping Slice Downstream
- Payment slice (shippingChoice used in order creation)
- Order creation (shipping rates affect total order amount)

---

# Part 15: Technical Debt

## Known Technical Debt

### Sprint 10 Scope Not Completed
**Status:** PARTIALLY COMPLETED
**Issue:** Scope Contract 7 (Tests) not completed
- Integration tests for shipping rates API not implemented
- E2E tests for shipping page not implemented
**Impact:** No automated test coverage for shipping functionality
**Priority:** Medium (manual testing currently used)

### Furgonetka Research Not Integrated
**Status:** RESEARCH ONLY
**Issue:** Furgonetka API research completed but not integrated into production
**Reason:** delivery_time limitation blocked original experiment goal
**Impact:** Furgonetka not used in production (Packlink PRO used instead)
**Priority:** Low (current multi-tier approach working)

### Hardcoded Carrier List in Mock Rates
**Status:** ACCEPTABLE
**Issue:** Mock Poland rates use hardcoded carrier list
**Reason:** Based on actual carrier research, covers major Polish carriers
**Impact:** Limited to 5 carriers (DHL, FedEx, UPS, InPost, DPD)
**Priority:** Low (covers most common use cases)

---

# Conclusion

This examination has documented the complete technical context of all work completed on the shipping page Polish shipping rate integration, including:

1. **Furgonetka API Research** - Systematic chunk-based research with contingency planning, revealing critical limitation that delivery_time is not available in API responses
2. **Current Shipping Implementation** - Multi-tier approach (Packlink PRO → Shippo → Mock Poland rates) with resilience features
3. **Poland Shipping Rate Research** - Alternative APIs and mock rate implementations based on carrier research
4. **Sprint 10 Remediation** - Previous Shippo API integration fixes for field naming, authentication, data derivation, resilience, and error handling

**Key Finding:** The Furgonetka API research revealed that while the API provides accurate cost data and supports multiple Polish carriers, it does not provide delivery time estimates, which blocked the original experiment goal. The current production implementation uses a multi-tier approach with Packlink PRO as the primary API, Shippo as a fallback with resilience features, and mock Poland domestic rates as a last resort to ensure shipping options are always available.

**Open Issues:**
- Furgonetka delivery_time limitation (documented, workarounds considered)
- Sprint 10 test scope not completed (integration and E2E tests missing)

**Technical Debt:**
- Furgonetka research not integrated into production (research only)
- Sprint 10 test scope incomplete (manual testing currently used)

This technical context provides a complete foundation for future learning sessions to extract reusable lessons and patterns.
