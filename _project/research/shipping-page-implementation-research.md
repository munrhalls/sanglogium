# Shipping Page Implementation Research

**Date:** 2026-05-16
**Purpose:** Structured research for shipping page implementation covering Packlink PRO API, Furgonetka API, Sanity CMS basketReservation structure, and .env variable patterns
**Status:** Complete

---

## Research Scope Contract

- **Topic:** Shipping rate calculation APIs and data sources for multi-country (PL/DE/GB) shipping page
- **First Principles:** Real carrier-calculated rates > mock rates; country-specific API selection; parcel data must be derivable from basket contents
- **Fundamentals:** REST API integration, OAuth 2.0 authentication, Sanity GROQ queries, env var configuration patterns
- **Scope Boundary:** Rate calculation only (not label purchase, not tracking, not customs)
- **Target Audience:** Developer implementing shipping page
- **Decay Risk:** Medium (API endpoints stable, but sandbox behavior may differ from production)

---

## 1. Packlink PRO API

### 1.1 Rate Calculation Endpoint

| Property | Value |
|----------|-------|
| **Endpoint** | `GET https://api.packlink.com/v1/services` |
| **Method** | GET with query parameters |
| **Base URL** | `https://api.packlink.com` (production) |
| **Source** | `@lib/shipping/packlink-rates.ts:1-125`, `@scripts/verify-packlink-pro-poland.mjs:1-172` |

### 1.2 Authentication

- **Method:** Raw API key in `Authorization` header (NO "Bearer" prefix)
- **Key env var:** `PACKLINK_PRO_API`
- **Single account works for all countries** — no per-country API keys needed
- **Source:** `@lib/shipping/packlink-rates.ts:59-62`

```typescript
// Correct auth header format
headers: {
  'Authorization': apiKey,  // Raw key, no "Bearer" prefix
  'Accept': 'application/json',
}
```

### 1.3 Request Format

Query parameters (URL-encoded):

| Parameter | Description | Example |
|-----------|-------------|---------|
| `from[country]` | Sender country (2-letter ISO) | `DE`, `GB`, `PL` |
| `from[zip]` | Sender postal code | `80333` |
| `to[country]` | Recipient country (2-letter ISO) | `DE`, `GB`, `PL` |
| `to[zip]` | Recipient postal code | `10115` |
| `packages[0][width]` | Package width (cm) | `15` |
| `packages[0][height]` | Package height (cm) | `15` |
| `packages[0][length]` | Package length (cm) | `15` |
| `packages[0][weight]` | Package weight (kg) | `1.5` |

Multiple packages supported via `packages[1][...]`, `packages[2][...]`, etc.

**Source:** `@lib/shipping/packlink-rates.ts:77-88`, `@scripts/verify-packlink-pro-poland.mjs:21-29`

### 1.4 Response Format

Returns an array of service objects. Key fields:

```typescript
interface PacklinkService {
  id: number;                              // Service ID
  name: string;                            // Service level name (e.g., "Classic Kleinpaket")
  carrier_name: string;                    // Carrier name (e.g., "DPD", "UPS")
  country: string;                         // Origin country (e.g., "DE")
  category: string;                        // "standard", "express", etc.
  transit_time: string;                    // e.g., "1 DAYS"
  transit_hours: string;                   // e.g., "24"
  first_estimated_delivery_date: string;   // e.g., "2020/03/24"
  price: {
    total_price: number;                   // Total price
    base_price: number;                    // Base price
    tax_price: number;                     // Tax amount
    currency: string;                      // e.g., "EUR"
  };
  insurance: {
    base_insurance: string;
    additional_insurance: boolean;
    max_insurance: string;
  };
  cash_on_delivery: {
    offered: boolean;
  };
  dropoff: boolean;                        // Has dropoff option
  delivery_to_parcelshop: boolean;         // Delivers to parcel shop
  logo_id: string;                         // Carrier logo identifier
  service_info: Array<{ text: string; icon: string }>;
  available_dates: Record<string, string>; // Available pickup dates/times
}
```

**Source:** `@lib/shipping/packlink-rates.ts:12-41`, verified against [packlink.cr spec fixture](https://github.com/wout/packlink.cr/blob/master/spec/fixtures/services/all-response.json)

### 1.5 Country-Specific Requirements for DE/GB

| Country | Supported | Notes |
|---------|-----------|-------|
| **DE (Germany)** | ✅ Yes | Full carrier selection (DPD, UPS, DHL, etc.). Prices in EUR. |
| **GB (United Kingdom)** | ✅ Yes | Full carrier selection. Prices in GBP. Post-Brexit: customs may apply for EU destinations. |
| **PL (Poland)** | ❌ **NOT SUPPORTED** | Returns 400 or empty array. Verified via `scripts/verify-packlink-pro-poland.mjs`. |

**CRITICAL FINDING:** Packlink PRO does NOT support Poland domestic shipping. All test scenarios (same city, different city, different region) returned 0 services. This is verified by `@scripts/verify-packlink-pro-poland.mjs:136-143`.

**Source:** `@research/furgonetka-data-contract-analysis.md:136-144`

### 1.6 Production Usage in Codebase

Current implementation at `@app/api/shipping/rates/route.ts:258-279`:
- Tier 1: Packlink PRO (primary for non-PL countries)
- Tier 2: Mock rates (fallback for PL domestic only)
- Furgonetka: NOT integrated into production (tracer bullet only)

---

## 2. Furgonetka API

### 2.1 Related Beads Issues

**Total:** 14 issues. **12 closed correctly**, **2 with status discrepancies**.

| Issue ID | Title | Status | Notes |
|----------|-------|--------|-------|
| sang-logium-brj | Chunk 2: API Endpoint Discovery | CLOSED | ✅ |
| sang-logium-fkj | Chunk 3: Request Format Verification | CLOSED | ✅ |
| sang-logium-9sg | Chunk 4: Response Format Verification | CLOSED | ✅ |
| sang-logium-u0j | Chunk 5: Authentication Verification | CLOSED | ✅ |
| sang-logium-cvj | Chunk 6: Test Data Preparation | CLOSED | ✅ |
| sang-logium-ztc | Chunk 7: Experiment Implementation | CLOSED | ✅ |
| sang-logium-gbd | Chunk 8: Documentation | CLOSED | ✅ |
| sang-logium-57l | Validate Rate Calculation Realism | CLOSED | ✅ |
| sang-logium-nuu | delivery_time field is null | CLOSED | ✅ |
| sang-logium-rk8 | Test Sandbox Price Calculation | CLOSED | ✅ (superseded) |
| sang-logium-09y | Polish carrier list | CLOSED | ✅ |
| sang-logium-tts | Multi-address rate calculation | CLOSED | ✅ |
| sang-logium-97v | Chunk 1: Data Requirements | **IN_PROGRESS** | ⚠ Should be CLOSED |
| sang-logium-yif | Test Sandbox API for PL | **IN_PROGRESS** | ⚠ Should be CLOSED (superseded) |

**Source:** `@research/furgonetka-beads-audit.md:1-170`

### 2.2 Documentation Files

All research deliverables exist in `research/`:

| File | Purpose |
|------|---------|
| `furgonetka-data-requirements.md` | Data requirements specification |
| `furgonetka-endpoint-discovery-report.md` | Endpoint discovery results |
| `furgonetka-request-format-specification.md` | Request format specification |
| `furgonetka-response-format-specification.md` | Response format specification (618 lines, complete) |
| `furgonetka-authentication-verification.md` | Authentication verification |
| `furgonetka-test-addresses.md` | Test addresses |
| `furgonetka-experiment-results.md` | Experiment results |
| `furgonetka-api-complete-documentation.md` | Complete API documentation |
| `furgonetka-data-contract-analysis.md` | Data contract comparison vs Packlink |
| `Furgonetka-Auth-Problem-Description.md` | Auth troubleshooting (RESOLVED) |

### 2.3 Authentication

| Property | Value |
|----------|-------|
| **Method** | OAuth 2.0 Password Grant |
| **Token URL** | `POST https://api.sandbox.furgonetka.pl/oauth/token` |
| **Auth header** | `Basic {base64(client_id:client_secret)}` |
| **Grant body** | `grant_type=password&scope=api&username={username}&password={password}` |
| **API auth** | `Bearer {access_token}` |
| **Token expiry** | 30 days (2,592,000 seconds) |

**Credentials (sandbox):**
- Client ID: `sanglogiumsandbox-809e5808a56792b32ed4c06b051b6ad7`
- Client Secret: `bc73ff41ebe5326108df998a8531e2d1fa483678bcc4e3bdfcf1ec50873270d7`
- Username: `antarcticdepths71@gmail.com`
- Password: `Furgonetkaguars77@`

**Source:** `@research/furgonetka-api-complete-documentation.md:48-72`, `@scripts/test-furgonetka-price-calculation.mjs:30-55`

### 2.4 Request Format

**Endpoint:** `POST https://api.sandbox.furgonetka.pl/packages`

**Headers:**
```
Authorization: Bearer {token}
Accept: application/vnd.furgonetka.v1+json
Content-Type: application/json
```

**Body:**
```json
{
  "type": "package",
  "service_id": 11597700,
  "parcels": [{
    "width": 15,
    "height": 15,
    "depth": 15,
    "weight": 1.5
  }],
  "pickup": {
    "type": "sender",
    "name": "Sender Name",
    "company": "Company",
    "email": "email@example.com",
    "street": "Street 1",
    "postcode": "00-533",
    "city": "Warszawa",
    "phone": "600123456"
  },
  "sender": {
    "postcode": "00-533",
    "city": "Warszawa",
    "country": "PL",
    "name": "Sender Name",
    "company": "Company",
    "phone": "600123456",
    "email": "email@example.com",
    "street": "Street 1"
  },
  "receiver": {
    "postcode": "30-001",
    "city": "Kraków",
    "country": "PL",
    "name": "Receiver Name",
    "company": "Company",
    "phone": "600123456",
    "email": "email@example.com",
    "street": "Street 2"
  }
}
```

**Critical Format Requirements:**
- **Phone:** 9 digits, Polish mobile format (e.g., `600123456`). NO country code prefix, NO spaces.
- **Postcode:** Polish format `XX-XXX` (e.g., `00-533`)
- **Dimensions:** centimeters (cm)
- **Weight:** kilograms (kg)

**Source:** `@research/furgonetka-api-complete-documentation.md:75-134`, `@research/furgonetka-data-contract-analysis.md:16-58`

### 2.5 Response Format

**Key pricing fields:**
```typescript
{
  pricing: {
    price_gross: number;      // Total with tax (PLN)
    price_net: number;        // Without tax (PLN)
    price_base_net: number;   // Base before adjustments (PLN)
    tax: number;              // Tax rate % (e.g., 23)
    details: Array<{
      service: string;        // e.g., "fuel_surcharge"
      price_net: number;
      description: string;    // e.g., "Opłata paliwowa"
    }>;
  };
  service: string;            // Carrier name (e.g., "inpost", "dpd")
  service_id: number;         // Carrier service ID
  delivery_time: null;        // ALWAYS NULL - critical limitation
  state: string;              // e.g., "waiting"
}
```

**Source:** `@research/furgonetka-response-format-specification.md:1-618` (complete field-by-field documentation)

### 2.6 Country-Specific Requirements for PL

| Property | Value |
|----------|-------|
| **Country** | Poland only (PL) |
| **Carriers** | InPost (11597700), DPD (11597695), DHL (11597702), Poczta Polska (11597699) |
| **Currency** | PLN |
| **Delivery time** | ❌ NOT AVAILABLE (always null) |
| **Distance impact** | None in sandbox (flat-rate pricing) |

**Carrier-specific issues:**
- **Poczta Polska:** Requires minimum 16×10 cm package dimensions
- **DHL:** Postcode validation errors for some Warsaw postcodes in sandbox

**Source:** `@research/furgonetka-api-complete-documentation.md:172-194`

### 2.7 Current Integration Status

- **Production:** NOT integrated. Tracer bullet only in shipping page.
- **Route:** `@app/api/shipping/furgonetka/rates/route.ts:1-200` (tracer bullet implementation)
- **Frontend:** `@app/(store)/checkout/shipping/page.tsx:104-157` (tracer bullet display)
- **Credentials hardcoded** in route file (lines 32-37) — needs env var migration before production

### 2.8 Critical Limitations

1. **delivery_time always null** — Cannot provide carrier-calculated delivery estimates
2. **Sandbox flat-rate pricing** — Distance has zero impact on cost (may differ in production)
3. **PL-only** — No support for DE or GB shipping

**Recommendation from prior research:** Use Furgonetka as primary for Poland domestic shipping (real carrier cost data), with estimated delivery times based on service tier. This is the only viable option for real carrier-calculated rates in Poland.

**Source:** `@research/furgonetka-data-contract-analysis.md:267-296`

---

## 3. Sanity CMS basketReservation Structure

### 3.1 basketReservation Schema

**File:** `@sanity-cms/schemaTypes/basketReservationType.ts:1-122`

```typescript
{
  name: "basketReservation",
  type: "document",
  fields: [
    {
      name: "basketReservation",    // Array of basket items
      type: "array",
      of: [{
        type: "object",
        fields: [
          { name: "_id", type: "string" },           // Product ID (reference)
          { name: "quantity", type: "number" },       // Quantity
          { name: "verifiedPrice", type: "number" },  // Price at reservation time
        ]
      }]
    },
    { name: "createdAt", type: "datetime" },
    { name: "expiresAt", type: "datetime" },
    {
      name: "shippingAddress",       // Customer's shipping address
      type: "object",
      fields: [
        { name: "regionCode", type: "string" },      // 2-letter ISO country code
        { name: "postalCode", type: "string" },
        { name: "street", type: "string" },
        { name: "streetNumber", type: "string" },
        { name: "city", type: "string" },
      ]
    },
    {
      name: "shippingChoice",        // User's selected shipping option
      type: "object",
      fields: [
        { name: "provider", type: "string" },
        { name: "serviceLevel", type: "string" },
        { name: "rateId", type: "string" },
        { name: "amount", type: "number" },
        { name: "currency", type: "string" },
        { name: "estimatedDays", type: "number" },
      ]
    }
  ]
}
```

### 3.2 Product Parcel Schema

**File:** `@sanity-cms/schemaTypes/productType.ts:62-111`

```typescript
{
  name: "parcel",
  title: "Parcel Data",
  type: "object",
  description: "Shipping dimensions and weight for Shippo API",
  fields: [
    { name: "length", title: "Length (cm)", type: "number", initialValue: 10 },
    { name: "width", title: "Width (cm)", type: "number", initialValue: 10 },
    { name: "height", title: "Height (cm)", type: "number", initialValue: 5 },
    { name: "weight", title: "Weight (g)", type: "number", initialValue: 500 },
    { name: "distance_unit", type: "string", initialValue: "cm", readOnly: true },
    { name: "mass_unit", type: "string", initialValue: "g", readOnly: true },
  ]
}
```

**Key detail:** Weight is in **grams (g)**, not kilograms. Packlink PRO expects kg, Furgonetka expects kg. Conversion needed.

### 3.3 How to Extract Parcel Data from Basket Contents

**Current implementation at `@app/api/shipping/rates/route.ts:218-253`:**

1. Extract product IDs from `basketReservation` array
2. Fetch products with GROQ: `*[_id in $ids]{ _id, parcel }`
3. Aggregate:
   - **Weight:** Sum of `product.parcel.weight * quantity` (per-item)
   - **Dimensions:** Max of each dimension across all products (`maxLength`, `maxWidth`, `maxHeight`)
4. Validate all products have parcel data (return error if missing)

```typescript
// Aggregation logic (from route.ts:226-253)
let totalWeight = 0;
let maxLength = 0, maxWidth = 0, maxHeight = 0;

for (const product of products) {
  if (!product.parcel) {
    return error;  // Product missing parcel data
  }
  const quantity = basketReservation.find(item => item._id === product._id)?.quantity || 1;
  totalWeight += product.parcel.weight * quantity;
  maxLength = Math.max(maxLength, product.parcel.length);
  maxWidth = Math.max(maxWidth, product.parcel.width);
  maxHeight = Math.max(maxHeight, product.parcel.height);
}
```

**Note:** This uses `getBackendClient()` (with `SANITY_STUDIO_READ_WRITE` token) for authenticated Sanity access.

### 3.4 Unit Conversions Needed

| API | Dimension Unit | Weight Unit |
|-----|---------------|-------------|
| Sanity product.parcel | cm | **grams (g)** |
| Packlink PRO | cm | **kilograms (kg)** |
| Furgonetka | cm | **kilograms (kg)** |

**Conversion:** `weight_kg = product.parcel.weight / 1000`

---

## 4. .env Variable Patterns

### 4.1 Sender Address Convention

**Pattern:** `SENDER_ADDRESS_{COUNTRY}_{FIELD}`

**Priority order (first match wins):**
1. Country-specific: `SENDER_ADDRESS_{COUNTRY}_*`
2. Default fallback: `SENDER_ADDRESS_DEFAULT_*`
3. Base fallback: `SENDER_ADDRESS_*` (no country suffix)

**Source:** `@docs/checkout/shipping/README.md:28-101`, `@docs/checkout/shipping/SanglogiumSenderAddresses.md:1-86`

### 4.2 Existing Sender Address Variables

**Poland (PL):**
```bash
SENDER_ADDRESS_PL_NAME=Sang Logium PL
SENDER_ADDRESS_PL_STREET=Mokotowska 63
SENDER_ADDRESS_PL_CITY=Warszawa
SENDER_ADDRESS_PL_STATE=MZ
SENDER_ADDRESS_PL_ZIP=00-533
SENDER_ADDRESS_PL_COUNTRY=PL
SENDER_ADDRESS_PL_PHONE=+48123456789
SENDER_ADDRESS_PL_EMAIL=pl@sanglogium.com
```

**Germany (DE):**
```bash
SENDER_ADDRESS_DE_NAME=Sang Logium DE
SENDER_ADDRESS_DE_STREET=Residenzstraße 18
SENDER_ADDRESS_DE_CITY=München
SENDER_ADDRESS_DE_STATE=BY
SENDER_ADDRESS_DE_ZIP=80333
SENDER_ADDRESS_DE_COUNTRY=DE
SENDER_ADDRESS_DE_PHONE=+49123456789
SENDER_ADDRESS_DE_EMAIL=de@sanglogium.com
```

**United Kingdom (GB):**
```bash
SENDER_ADDRESS_GB_NAME=Sang Logium GB
SENDER_ADDRESS_GB_STREET=17 Kensington Church Street
SENDER_ADDRESS_GB_CITY=London
SENDER_ADDRESS_GB_STATE=ENG
SENDER_ADDRESS_GB_ZIP=W8 4LF
SENDER_ADDRESS_GB_COUNTRY=GB
SENDER_ADDRESS_GB_PHONE=+44123456789
SENDER_ADDRESS_GB_EMAIL=gb@sanglogium.com
```

**Source:** `@docs/checkout/shipping/SanglogiumSenderAddresses.md:43-75`

### 4.3 NEXT_PUBLIC_SENDER_ADDRESS_PL_* Variables

These exist ONLY in the shipping page tracer bullet code, used client-side:

```typescript
// @app/(store)/checkout/shipping/page.tsx:112-120
process.env.NEXT_PUBLIC_SENDER_ADDRESS_PL_ZIP
process.env.NEXT_PUBLIC_SENDER_ADDRESS_PL_CITY
process.env.NEXT_PUBLIC_SENDER_ADDRESS_PL_NAME
process.env.NEXT_PUBLIC_SENDER_ADDRESS_PL_PHONE
process.env.NEXT_PUBLIC_SENDER_ADDRESS_PL_EMAIL
process.env.NEXT_PUBLIC_SENDER_ADDRESS_PL_STREET
```

**⚠️ Issue:** These are `NEXT_PUBLIC_` prefixed (exposed to client). The server-side `SENDER_ADDRESS_*` pattern is preferred. The tracer bullet should be refactored to use the server-side API route instead of client-side env vars.

### 4.4 Other Relevant .env Variables

| Variable | Purpose | Used In |
|----------|---------|---------|
| `PACKLINK_PRO_API` | Packlink PRO API key | `@lib/shipping/packlink-rates.ts:60` |
| `FURGONETKA_SANDBOX_CLIENT_ID` | Furgonetka OAuth client ID | `@scripts/test-furgonetka-price-calculation.mjs:20` |
| `FURGONETKA_SANDBOX_CLIENT_SECRET` | Furgonetka OAuth client secret | `@scripts/test-furgonetka-price-calculation.mjs:21` |
| `SANITY_STUDIO_READ_WRITE` | Sanity write token | `@sanity-cms/lib/backendClient.ts` |

**Note:** Furgonetka credentials are currently hardcoded in `@app/api/shipping/furgonetka/rates/route.ts:32-37`. They should be migrated to env vars before production use.

---

## 5. Synthesis: Actionable Takeaways

### 5.1 API Selection Matrix

| Destination Country | Primary API | Fallback | Delivery Time |
|---------------------|-------------|----------|---------------|
| **PL (Poland)** | Furgonetka (real cost) | Mock rates | Estimated from service tier |
| **DE (Germany)** | Packlink PRO | None needed | ✅ Available (transit_hours) |
| **GB (United Kingdom)** | Packlink PRO | None needed | ✅ Available (transit_hours) |

### 5.2 Implementation Decisions

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Use Furgonetka for PL domestic | Packlink PRO verified to NOT support PL domestic | Integrate Furgonetka into production rates route |
| Use Packlink PRO for DE/GB | Well-tested, provides cost + delivery time | Already implemented in production |
| Aggregate parcel data from products | Products have parcel dimensions in Sanity | Already implemented in rates route |
| Use server-side SENDER_ADDRESS_* pattern | Avoids exposing addresses to client | Already implemented in rates route |
| Estimate delivery time for PL | Furgonetka delivery_time always null | Map service tiers to estimated business days |

### 5.3 Immediate Actions

1. **Migrate Furgonetka credentials to env vars** — Remove hardcoded credentials from `@app/api/shipping/furgonetka/rates/route.ts:32-37`
2. **Integrate Furgonetka into production rates route** — Add as Tier 1 for PL destinations in `@app/api/shipping/rates/route.ts`
3. **Implement delivery time estimation for PL** — Map carrier service tiers to estimated business days
4. **Close stale beads issues** — `sang-logium-97v` and `sang-logium-yif` should be CLOSED
5. **Remove tracer bullet code** — Clean up `NEXT_PUBLIC_SENDER_ADDRESS_PL_*` usage and Furgonetka tracer display from shipping page

### 5.4 Open Questions

1. Does Furgonetka production API provide distance-based pricing (vs sandbox flat-rate)?
2. Should we contact Furgonetka support about delivery_time availability?
3. Do we need separate Packlink PRO accounts for DE and GB, or does one account cover all?

---

## Verification & Falsification Log

### Claims Verified

| Claim | Evidence | Method |
|-------|----------|--------|
| Packlink PRO does NOT support PL domestic | `scripts/verify-packlink-pro-poland.mjs` returned 0 services | Test script execution |
| Furgonetka delivery_time is always null | All 4 carriers, 3 distance scenarios tested | Test script execution |
| Product schema has parcel dimensions | `sanity-cms/schemaTypes/productType.ts:62-111` | Source code |
| SENDER_ADDRESS_{COUNTRY}_* pattern exists | `docs/checkout/shipping/README.md` and `SanglogiumSenderAddresses.md` | Documentation |
| basketReservation stores product _id + quantity | `sanity-cms/schemaTypes/basketReservationType.ts:8-37` | Source code |

### Knowledge Decay Assessment

| Section | Risk | Review Date |
|---------|------|-------------|
| Packlink PRO API | Low | 2026-11 (6 months) |
| Furgonetka API (sandbox) | Medium | 2026-08 (3 months — sandbox may change) |
| Sanity schemas | Low | On schema change |
| .env patterns | Low | On new country addition |
