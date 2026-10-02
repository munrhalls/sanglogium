# Poland Shipping API Comparison - Furgonetka vs Alternatives

**Date:** 2026-05-14
**Purpose:** Evaluate Furgonetka Sandbox API against Apaczka.pl API and Xpress Delivery API for Poland shipping rate calculation

---

## Contract Requirements

### Objective
Find a Poland shipping API that provides calculated shipping rates and delivery timelines with minimal implementation complexity.

### Hard Constraints
- **Zero monetary cost** - No paid subscriptions, no commercial account requirements, no paid API tiers
- Free registration is acceptable (zero money required)
- Simplest possible solution

### Functional Requirements
- API must work for Poland domestic shipping
- API must provide calculated shipping rates based on sender and receiver addresses
- API must provide estimated delivery timelines
- Both rates AND timelines must be available in the same API call
- Results must be real API data, not mock responses

### Validation Criteria
- Rates and timelines must vary based on distance between sender and receiver
- Close receiver address to sender = lower rates/timelines
- Far receiver address from sender = higher rates/timelines

### Test Configuration
- **Package:** 15x15x15 cm, 1.5 kg
- **Sender:** Warsaw, Poland (postal code 00-533)
- **Receiver addresses:** 3 realistic Poland addresses at different distances
  - Close: Warsaw (~2-5km from sender)
  - Medium: Warsaw Praga (~5-10km from sender)
  - Far: Kraków (~300km from sender)

---

## API Comparison

### 1. Furgonetka.pl

**Type:** Polish shipping broker / aggregator

**API Capabilities:**
- REST API with OAuth 2.0 authentication
- Sandbox environment available at `https://sandbox.furgonetka.pl`
- Documentation available at `https://furgonetka.pl/api/rest` and `https://sandbox.furgonetka.pl/api/rest`
- OAuth 2.0 documentation available
- PHP client libraries available on GitHub (Kwarcek/furgonetka-rest-api-php, rataq-pl/furgonetka)

**Rate Calculation Endpoint:**
- Unknown from publicly accessible documentation
- Requires registration to access full API specification
- Rate calculation endpoint details not publicly visible without account

**Delivery Timeline:**
- Unknown if delivery timelines are provided in rate calculation response
- Cannot verify without registration and access to full API documentation

**Integration Difficulty:**
- **Authentication:** OAuth 2.0 (standard, well-understood)
- **Documentation:** Partially accessible, requires registration for full specs
- **Libraries:** PHP libraries available, may have TypeScript/Node equivalents
- **Setup:** Requires OAuth app creation (Client ID, Client Secret)
- **Complexity:** Medium - OAuth flow is standard, but lack of public documentation increases uncertainty

**Cost:**
- Free registration likely (zero monetary cost)
- Sandbox environment available for testing

**Zero-Cost Compliance:** ✅ Likely compliant, but cannot verify rate+timeline capability without registration

**Critical Blocker:**
1. API documentation not fully accessible without registration
2. Cannot verify if rate calculation endpoint provides delivery timelines
3. Unknown if single API call provides both rates and timelines
4. Requires registration to assess full capabilities

**Sources:**
- Furgonetka REST API: https://furgonetka.pl/api/rest?lang=en_GB
- Furgonetka Sandbox: https://sandbox.furgonetka.pl/api/rest?lang=en_GB
- Furgonetka OAuth: https://furgonetka.pl/api/oauth
- GitHub PHP Client: https://github.com/Kwarcek/furgonetka-rest-api-php

---

### 2. Apaczka.pl

**Type:** Polish shipping broker / aggregator

**API Capabilities:**
- Web API v2 with detailed public documentation at `https://panel.apaczka.pl/dokumentacja_api_v2.php`
- REST API with HMAC-SHA256 signature authentication
- Rate calculation endpoint: `POST /api/v2/order_valuation/`
- Order sending endpoint: `POST /api/v2/order_send/`
- Tracking endpoint: `GET /api/v2/tracking/:waybill_number/`
- Pickup hours endpoint: `GET /api/v2/pickup_hours/`
- Service structure endpoint: `GET /api/v2/service_structure/`

**Rate Calculation Endpoint:**
- Endpoint: `POST /api/v2/order_valuation/`
- Returns pricing information in grosz (Polish currency cents)
- Returns valuation for all services that can handle the shipment parameters
- If service_id is provided, returns valuation for that specific service

**Delivery Timeline:**
- **Rate Response:** Does NOT include delivery timeline fields
- **Timeline Location:** Delivery timeline fields (`deliveryDate`, `plannedDeliveryDate`) exist in `OrderDetailsResponse`
- **Timeline Access:** `OrderDetailsResponse` is returned by `GET /v1/user/orders/{id}`
- **Timeline Requirement:** This endpoint requires an actual order ID
- **Order ID Requirement:** To get an order ID, you must create an order via `POST /v1/order`
- **Order Creation Requirement:** Creating an order requires payment

**Integration Difficulty:**
- **Authentication:** HMAC-SHA256 signature (custom, more complex than OAuth)
- **Documentation:** Excellent - fully accessible public documentation
- **Libraries:** PHP SDK available at https://panel.apaczka.pl/files/sdk-apiv2-0.3.zip
- **Setup:** Requires contract with apaczka.pl, account activation, App ID and App Secret generation
- **Complexity:** Medium-High - Custom signature authentication, contract requirement

**Cost:**
- Free registration available (zero monetary cost)
- Requires contract with apaczka.pl (business relationship)
- Zero-cost compliance for rate calculation: ✅
- Zero-cost compliance for delivery timelines: ❌ (requires payment)

**Zero-Cost Compliance:** ⚠️ Partial - Rate calculation is zero-cost, but delivery timelines require payment

**Critical Blocker:**
1. Rate calculation endpoint does NOT provide delivery timeline fields
2. Delivery timeline fields exist only in OrderDetailsResponse
3. OrderDetailsResponse requires creating and paying for an order
4. Cannot get both rates AND delivery timelines in a single zero-cost API call

**Sources:**
- Apaczka Web API v2 Documentation: https://panel.apaczka.pl/dokumentacja_api_v2.php
- Previous Research: research/poland-shipping-api-zero-cost-validation.md

---

### 3. Xpress Delivery

**Type:** Same-day courier service (not a broker)

**Service Coverage:**
- Operating in 87 Polish cities
- Same-day deliveries within region
- Average delivery time: 97 minutes
- Specializes in urgent/same-day delivery

**API Capabilities:**
- No public API documentation found
- Integration through BaseLinker requires direct contact with Xpress Delivery support
- API access requires partnership agreement with courier
- No evidence of public REST API or developer portal

**Rate Calculation:**
- Integration through BaseLinker allows checking shipping costs
- Requires API access data from Xpress Delivery support
- No public API endpoint documentation available

**Delivery Timeline:**
- Same-day delivery (97 minutes average)
- Timeline is inherent to service model (same-day)
- No API-based timeline calculation needed (fixed service promise)

**Integration Difficulty:**
- **Authentication:** Unknown (no public documentation)
- **Documentation:** None publicly available
- **Libraries:** None found
- **Setup:** Requires direct contact with Xpress Delivery support, partnership agreement
- **Complexity:** High - No public documentation, requires business partnership

**Cost:**
- Not a zero-cost solution
- Requires business partnership agreement
- Pricing model unknown (likely per-shipment or subscription)

**Zero-Cost Compliance:** ❌ Not compliant - requires business partnership

**Critical Blocker:**
1. No public API documentation available
2. Requires direct contact and partnership agreement
3. Not a zero-cost solution
4. Service model is same-day only (not suitable for standard e-commerce shipping with multiple delivery options)

**Sources:**
- Base.com Integration Help: https://base.com/en-EN/help/knowledgebase/xpress-delivery/
- Xpress Delivery Website: https://xpress.delivery/
- Courier Information: https://city-drive.pl/en/xpress-delivery

---

## Comparison Summary

| Criteria | Furgonetka.pl | Apaczka.pl | Xpress Delivery |
|----------|---------------|------------|-----------------|
| **API Type** | Broker/Aggregator | Broker/Aggregator | Same-day Courier |
| **Public Documentation** | Partial (requires registration) | Full public documentation | None |
| **Authentication** | OAuth 2.0 | HMAC-SHA256 signature | Unknown |
| **Rate Calculation** | Unknown (requires registration) | ✅ Available | Unknown (requires partnership) |
| **Delivery Timeline in Rate Response** | Unknown | ❌ Not available | N/A (same-day service) |
| **Single Call for Rates+Timelines** | Unknown | ❌ Requires payment | N/A |
| **Zero-Cost Rate Calculation** | ✅ Likely | ✅ Yes | ❌ Requires partnership |
| **Zero-Cost Delivery Timelines** | Unknown | ❌ Requires payment | N/A |
| **Integration Complexity** | Medium (OAuth standard) | Medium-High (custom auth) | High (no docs, partnership) |
| **Libraries Available** | PHP libraries | PHP SDK | None |
| **Setup Requirements** | OAuth app creation | Contract, account activation | Partnership agreement |
| **Sandbox Environment** | ✅ Available | ❌ Not mentioned | ❌ Not available |

---

## Analysis

### Furgonetka.pl
**Pros:**
- OAuth 2.0 authentication (standard, well-understood)
- Sandbox environment available for testing
- PHP client libraries available
- Likely zero-cost registration

**Cons:**
- API documentation not fully accessible without registration
- Cannot verify if rate calculation provides delivery timelines
- Unknown if single API call provides both rates and timelines
- Requires registration to assess full capabilities

**Verdict:** **Uncertain** - Cannot assess without registration. May or may not meet contract requirements.

### Apaczka.pl
**Pros:**
- Excellent public documentation
- Rate calculation endpoint is well-documented
- PHP SDK available
- Free registration available

**Cons:**
- Rate calculation endpoint does NOT provide delivery timelines
- Delivery timelines require creating and paying for an order
- Cannot get both rates AND delivery timelines in a single zero-cost API call
- Custom HMAC-SHA256 authentication (more complex than OAuth)
- Requires contract with apaczka.pl

**Verdict:** **Does NOT meet contract** - Confirmed blocker: separates rate calculation from delivery timeline, requiring payment.

### Xpress Delivery
**Pros:**
- Same-day delivery (97 minutes average)
- Integration through BaseLinker available

**Cons:**
- No public API documentation
- Requires business partnership agreement
- Not a zero-cost solution
- Service model is same-day only (not suitable for standard e-commerce)
- No evidence of public REST API

**Verdict:** **Does NOT meet contract** - Not a zero-cost solution, no public API, wrong service model.

---

## Recommendations

### Recommendation 1: Register for Furgonetka Sandbox to Verify Capabilities

**Rationale:**
- Furgonetka is the only candidate that might meet the contract requirements
- OAuth 2.0 authentication is standard and well-understood
- Sandbox environment available for zero-cost testing
- PHP libraries indicate active developer community

**Action Steps:**
1. Register for Furgonetka account (free)
2. Create OAuth application in sandbox environment
3. Access full API documentation
4. Test rate calculation endpoint with 3 distance scenarios
5. Verify if delivery timelines are included in rate response
6. Document results

**Expected Outcome:**
- Either confirmation that Furgonetka meets contract requirements
- Or documentation of why it doesn't (similar to Apaczka.pl blocker)

**Risk:** Low - Registration is free, sandbox is available, OAuth is standard

---

### Recommendation 2: If Furgonetka Fails, Relax Delivery Timeline Requirement

**Rationale:**
- Both Furgonetka and Apaczka.pl provide rate calculation
- Neither provides delivery timelines in rate calculation endpoint (confirmed for Apaczka, unknown for Furgonetka)
- Delivery timelines can be estimated based on courier service tiers

**Implementation:**
- Use Apaczka.pl rate calculation endpoint (`/api/v2/order_valuation/`)
- Implement estimated delivery timelines based on service tier:
  - Standard service: 2-3 business days
  - Express service: 1-2 business days
  - Same-day service: same day (if available)
- Use distance-based adjustments to estimates

**Trade-off:** Delivery timelines are estimated based on service tier, not real carrier-calculated values

---

### Recommendation 3: Use Mock Data Layer for Development

**Rationale:**
- No zero-cost API provides both rates AND delivery timelines in a single call
- Mock data allows demonstrating distance-based variation
- Can switch to paid API for production

**Implementation:**
- Implement realistic mock rate data based on distance tiers:
  - Close (0-10km): 15-20 PLN, 1-2 days
  - Medium (10-50km): 20-25 PLN, 2-3 days
  - Far (50-300km): 25-35 PLN, 2-3 days
  - Very far (300km+): 30-45 PLN, 3-4 days
- Use Apaczka.pl rate calculation as baseline for pricing accuracy
- Implement distance-based timeline estimation logic

**Trade-off:** Not real carrier data, but demonstrates distance-based variation for development

---

### Recommendation 4: Use Alternative Country for Development

**Rationale:**
- Poland shipping APIs have zero-cost limitations
- Other countries may have better zero-cost API options
- Develop shipping integration architecture with working API
- Switch to Poland-specific API for production (with payment)

**Implementation:**
- Research zero-cost shipping APIs for other countries (e.g., FedEx Rates and Transit Times API)
- Develop shipping integration architecture
- Implement rate calculation and delivery timeline features
- Document Poland-specific requirements for production switch

**Trade-off:** Development environment differs from production, but architecture is proven

---

## Conclusion

### Current Status
- **Apaczka.pl:** Confirmed does NOT meet contract (rate calculation lacks delivery timelines, requires payment for timelines)
- **Xpress Delivery:** Does NOT meet contract (not zero-cost, no public API, wrong service model)
- **Furgonetka.pl:** Unknown - requires registration to verify capabilities

### Recommended Path Forward
1. **Immediate action:** Register for Furgonetka sandbox account to verify API capabilities
2. **If Furgonetka meets contract:** Proceed with Furgonetka integration
3. **If Furgonetka fails:** Choose from Recommendations 2, 3, or 4 based on project priorities

### Key Insight
The fundamental issue with Poland shipping APIs is that rate calculation and delivery timeline estimation are separated, requiring payment to access the latter. This is consistent across the evaluated options and may be a structural feature of the Poland shipping market rather than an API-specific limitation.

---

## Sources

- Furgonetka REST API: https://furgonetka.pl/api/rest?lang=en_GB
- Furgonetka Sandbox: https://sandbox.furgonetka.pl/api/rest?lang=en_GB
- Furgonetka OAuth: https://furgonetka.pl/api/oauth
- Furgonetka GitHub PHP Client: https://github.com/Kwarcek/furgonetka-rest-api-php
- Apaczka Web API v2: https://panel.apaczka.pl/dokumentacja_api_v2.php
- Apaczka Integrations: https://www.apaczka.pl/en/integrations/
- Base.com Xpress Delivery Integration: https://base.com/en-EN/help/knowledgebase/xpress-delivery/
- Xpress Delivery: https://xpress.delivery/
- Previous Research Files:
  - research/furgonetka-test-plan.md
  - research/poland-shipping-api-zero-cost-validation.md
  - research/Poland-Shipping-API-Research.md
