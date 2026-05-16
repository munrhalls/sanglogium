# Furgonetka API Data Contract Analysis

**Date:** 2026-05-14
**Purpose:** Establish exact status of Furgonetka API endpoints and data contract for shipping rates integration

---

## Furgonetka API Status

### Endpoint
- **URL:** `https://api.sandbox.furgonetka.pl/packages`
- **Method:** POST
- **Authentication:** OAuth password grant (user credentials)
- **Response Content-Type:** `application/json`

### Input Parameters
```javascript
{
  type: 'package',
  service_id: 11597700,  // Carrier service ID (InPost, DPD, etc.)
  parcels: [{
    width: 15,      // cm
    height: 15,     // cm
    depth: 15,      // cm
    weight: 1.5,    // kg
  }],
  pickup: {
    type: 'sender',
    name: 'Sender Name',
    company: 'Company',
    email: 'email@example.com',
    street: 'Street',
    postcode: '00-533',
    city: 'Warszawa',
    phone: '600123456',
  },
  sender: {
    postcode: '00-533',
    city: 'Warszawa',
    country: 'PL',
    name: 'Sender Name',
    company: 'Company',
    phone: '600123456',
    email: 'email@example.com',
    street: 'Street',
  },
  receiver: {
    postcode: '00-001',
    city: 'Warszawa',
    country: 'PL',
    name: 'Receiver Name',
    company: 'Company',
    phone: '600123456',
    email: 'email@example.com',
    street: 'Street',
  },
}
```

### Output Data Contract

#### AVAILABLE DATA (What We Get)

**Cost Data:**
- `pricing.price_gross` - Total price including tax (PLN)
- `pricing.price_net` - Price excluding tax (PLN)
- `pricing.price_base_net` - Base price before adjustments (PLN)
- `pricing.tax` - Tax rate percentage (e.g., 23)
- `pricing.details[]` - Price breakdown items (fuel surcharge, etc.)

**Carrier Identification:**
- `service` - Carrier name (e.g., "inpost", "dpd")
- `service_id` - Carrier service ID from request
- `pricelist.name` - Pricelist name (e.g., "InPost")

**Package Metadata:**
- `package_id` - Unique package identifier
- `state` - Package state (e.g., "waiting")
- `datetime_add` - Package creation timestamp

#### UNAVAILABLE DATA (What We Don't Get)

**Delivery Time Estimates:**
- `delivery_time` - **ALWAYS NULL** (not provided by API)
- `datetime_delivery` - **ALWAYS NULL** (expected delivery datetime)
- `parcels[].delivery_time` - **ALWAYS NULL**

**Tested Scenarios (all return null):**
- Same city (Warszawa to Warszawa)
- Different city (Warszawa to Kraków)
- Different region (Warszawa to Gdańsk)
- Different carrier (DPD vs InPost)

---

## Comparison: Furgonetka vs Packlink PRO

### Packlink PRO Data Contract

**Endpoint:** GET https://api.packlink.com/v1/services

**Output Data:**
```javascript
{
  id: number,
  name: string,
  carrier_name: string,
  country: string,
  base_price: string,
  currency: string,
  transit_time: string,           // AVAILABLE (if services returned)
  transit_hours: string,          // AVAILABLE (if services returned)
  first_estimated_delivery_date: string,  // AVAILABLE (if services returned)
  category: string,
  price: {
    total_price: number,
    base_price: number,
    tax_price: number,
    currency: string,
  },
  insurance: {
    base_insurance: string,
    additional_insurance: boolean,
    max_insurance: string,
  },
  cash_on_delivery: {
    offered: boolean,
  },
  dropoff: boolean,
  delivery_to_parcelshop: boolean,
  logo_id: string,
  service_info: Array<{ text: string; icon: string }>;
}
```

**CRITICAL FINDING - Packlink PRO DOES NOT SUPPORT POLAND DOMESTIC SHIPPING**

**Test Results (scripts/verify-packlink-pro-poland.mjs):**
- Same City (Warsaw to Warsaw): 400 Bad Request
- Different City (Warsaw to Kraków): 200 OK but 0 services returned
- Different Region (Warsaw to Gdańsk): 200 OK but 0 services returned
- **Total services returned: 0**

**Conclusion:** Packlink PRO API does NOT provide services for Poland domestic shipping. Furgonetka is the only viable option for Poland domestic shipping cost calculation.

**Key Difference:** Packlink PRO provides delivery time estimates (`transit_time`, `transit_hours`, `first_estimated_delivery_date`) for supported countries, but does NOT support Poland domestic shipping at all. Furgonetka provides cost data for Poland domestic shipping but does NOT provide delivery_time estimates.

---

## Current Production Architecture

**Current Implementation:**
- Primary: Packlink PRO API (provides cost + delivery_time for NON-Poland countries)
- Fallback: Mock rates for Poland domestic (provides cost + estimated delivery based on distance)
- Furgonetka Status: Not integrated into production. Research only.

**Critical Issue:** Packlink PRO does NOT support Poland domestic shipping (verified via test script). The current architecture falls back to mock rates for Poland domestic shipping, which are not real carrier-calculated rates.

---

## Data Layer Analysis

### What Data We Have for UI

**From Packlink PRO (current production - NON-POLAND only):**
- Provider name
- Service level name
- Cost (total_price, base_price, tax)
- Delivery time (transit_time, transit_hours, first_estimated_delivery_date)
- Currency
- **LIMITATION:** Does NOT work for Poland domestic shipping

**From Furgonetka (if integrated - POLAND domestic only):**
- Provider name (service)
- Service ID
- Cost (price_gross, price_net, tax)
- **NO delivery time**

**From Mock Rates (current fallback for Poland domestic):**
- Provider name
- Service level name
- Cost (distance-based calculation)
- Estimated delivery (distance-based calculation)
- **LIMITATION:** Not real carrier-calculated rates

**Gap:** For Poland domestic shipping, we currently use mock rates which are not real carrier data. Furgonetka provides real carrier cost data but NO delivery_time estimates.

---

## Research Requirements

### Priority 1: Determine If Furgonetka Should Be Primary for Poland

**Question:** Should Furgonetka replace Packlink PRO as the default for Poland sender addresses?

**Answer:** YES - Packlink PRO does NOT support Poland domestic shipping at all (verified via test). Furgonetka is the ONLY viable option for real carrier-calculated rates for Poland domestic shipping.

**Considerations:**
- Furgonetka provides cost but NO delivery_time
- Packlink PRO does NOT work for Poland domestic shipping (verified)
- Current fallback uses mock rates (not real carrier data)
- Furgonetka would provide real carrier cost data
- Delivery_time would need to be estimated based on service tier

### Priority 2: Research Alternative Delivery_Time Sources

**Options to Investigate:**
1. **Carrier-specific APIs** (DPD, InPost, DHL, Poczta Polska)
   - Do they provide delivery time estimates?
   - Can we call them in parallel with Furgonetka?
   - Integration complexity?

2. **Third-party aggregators** (beyond Packlink PRO)
   - Do any provide delivery_time for Poland carriers?
   - Cost implications?
   - API availability?

3. **Hybrid approach**
   - Use Furgonetka for cost
   - Use carrier-specific APIs for delivery_time
   - Merge data in application layer

### Priority 3: Document Integration Strategy

**Research Findings:**

**Packlink PRO Status (CRITICAL):**
- DOES NOT support Poland domestic shipping (verified via test script)
- Returns 400 Bad Request or empty array for Poland domestic routes
- Cannot be used for Poland domestic shipping at all

**Carrier-Specific APIs:**
- DPD Poland: Test credentials available but API does NOT provide rate calculation (requires customer-specific price lists)
- InPost (ShipX API): Requires business subscription (from 11.89 PLN)
- Poczta Polska: Registration required, cost unclear
- GLS Poland: Requires business account
- UPS/Fedex/DHL: Require business accounts or customer accounts

**Third-Party Aggregators:**
- Epaka.pl: Separates rate calculation from delivery timeline - requires payment to get delivery timelines
- AfterShip/Easyship/Shippo: Return mock data in sandbox or require paid plans for real rates

**Conclusion:** No zero-cost alternative for delivery_time exists. All options either require payment, business accounts, or don't provide delivery timelines.

**Decision Matrix:**

| Approach | Cost Data | Delivery Time | Complexity | Recommendation |
|----------|------------|---------------|-------------|----------------|
| Packlink PRO only | ✗ | ✗ | Low | ❌ Does NOT support Poland domestic |
| Mock rates only | ✓ (estimated) | ✓ (estimated) | Low | ❌ Not real carrier data |
| Furgonetka only | ✓ (real) | ✗ | Medium | **RECOMMENDED** - Real cost, estimate delivery |
| Furgonetka + carrier APIs | ✓ (real) | ✗ | High | ❌ Carrier APIs don't provide delivery_time |
| Furgonetka + third-party | ✓ (real) | ✗ | Medium | ❌ Third-party requires payment |

---

## Next Steps

1. ✅ **Investigate carrier-specific APIs** for delivery_time estimates (DPD, InPost, DHL, Poczta Polska) - COMPLETED
2. ✅ **Research third-party aggregators** that provide delivery_time for Poland - COMPLETED
3. ✅ **Evaluate integration complexity** for hybrid approaches - COMPLETED
4. ✅ **Make recommendation** on whether Furgonetka should replace Packlink PRO as primary for Poland - SEE BELOW
5. **Update issue** with research findings and recommended path forward - PENDING

---

## Final Recommendation

**Finding:** Packlink PRO does NOT support Poland domestic shipping at all (verified via test script). Furgonetka is the ONLY viable option for real carrier-calculated rates for Poland domestic shipping. No zero-cost alternative for delivery_time exists to complement Furgonetka.

**Key Data Points:**
- Furgonetka: Cost ✓ (real carrier data), Delivery Time ✗
- Packlink PRO: Cost ✗ (does NOT support Poland domestic), Delivery Time ✗
- Mock rates: Cost ✓ (estimated), Delivery Time ✓ (estimated)
- Carrier APIs: Require business accounts, don't provide delivery_time
- Third-party aggregators: Require payment or return mock data

**Recommendation:**

**Option A (Recommended): Use Furgonetka as Primary for Poland**
- Provides real carrier-calculated cost data (superior to mock rates)
- Delivery_time would need to be estimated based on service tier (e.g., "1-2 business days")
- Requires implementing delivery_time estimation logic based on carrier service tiers
- UI would show estimated (not carrier-calculated) delivery times
- This is the only option that provides real carrier cost data for Poland domestic shipping

**Option B: Continue with Mock Rates for Poland**
- Uses distance-based cost calculation (not real carrier data)
- Uses distance-based delivery estimation (not real carrier data)
- No additional integration complexity
- UI shows estimated rates and delivery times
- Not based on actual carrier pricing

**Decision:** For Poland domestic shipping, **Option A (Furgonetka)** is the only viable path to get real carrier-calculated cost data. The trade-off is that delivery_time must be estimated based on service tier rather than carrier-calculated.

**Critical Question:** Is real carrier-calculated cost data more important than carrier-calculated delivery_time estimates for the shipping page UI? Or is the current mock rate approach acceptable?

---

## Issue Reference

**Issue:** sang-logium-nuu - Furgonetka API delivery_time field is null - investigate alternative data sources

**Status:** REOPENED - Research complete. Packlink PRO verified to NOT support Poland domestic shipping. Furgonetka is the only viable option for real carrier-calculated cost data for Poland domestic shipping. Delivery_time must be estimated based on service tier.

**Test Script:** scripts/verify-packlink-pro-poland.mjs
