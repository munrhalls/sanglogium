# Furgonetka API Rate Calculation - Complete Documentation

**Date:** 2026-05-14
**Project:** sang-logium-fkj through sang-logium-gbd (Chunks 2-8)
**Purpose:** Comprehensive documentation of Furgonetka API rate calculation experiment

---

## Executive Summary

**Status:** PARTIAL SUCCESS with Critical Limitation

**Completed:**
- ✓ Endpoint discovery (POST /packages)
- ✓ Request format verification
- ✓ Response format verification
- ✓ Authentication verification
- ✓ Test data preparation
- ✓ Experiment implementation
- ✓ Cost realism analysis (partial)

**Critical Limitation:**
- ⚠ delivery_time field is always null (see issue sang-logium-nuu)
- Original experiment goal (delivery time + cost verification) cannot be completed as specified
- Experiment adjusted to cost-only verification

**Key Findings:**
- Furgonetka Sandbox API provides rate calculation via POST /packages
- Request format validated (parcels array, service_id, pickup, sender, receiver)
- Authentication working (OAuth 2.0 Password Grant)
- Carrier pricing varies realistically (InPost 19.31 PLN vs DPD 27.17 PLN)
- Distance has no impact on pricing in sandbox (flat-rate behavior)

---

## API Endpoint

**Endpoint:** `POST /packages`
**Base URL:** `https://api.sandbox.furgonetka.pl`
**Authentication:** OAuth 2.0 Password Grant
**Content-Type:** `application/json`
**Accept:** `application/vnd.furgonetka.v1+json`

**Purpose:** Calculate shipping rates for packages based on carrier, dimensions, weight, and addresses.

---

## Authentication Setup

### OAuth 2.0 Password Grant

**OAuth Endpoint:** `https://api.sandbox.furgonetka.pl/oauth/token`

**Credentials:**
- Username: `antarcticdepths71@gmail.com`
- Password: `Furgonetkaguars77@`
- Client ID: `sanglogiumsandbox-809e5808a56792b32ed4c06b051b6ad7`
- Client Secret: `bc73ff41ebe5326108df998a8531e2d1fa483678bcc4e3bdfcf1ec50873270d7`

**Request Format:**
```
POST /oauth/token
Authorization: Basic {base64(client_id:client_secret)}
Content-Type: application/x-www-form-urlencoded

grant_type=password&scope=api&username={username}&password={password}
```

**Response:** Bearer token (expires in 2592000 seconds = 30 days)

**Verification:** ✓ Working (verified in Chunk 5)

---

## Request Format Specification

### Required Fields

**Root-Level:**
- `type`: "package"
- `service_id`: Carrier service ID (integer)
- `parcels`: Array of package objects

**Parcels Array:**
- `parcels[].width`: Package width in cm (number)
- `parcels[].height`: Package height in cm (number)
- `parcels[].depth`: Package depth in cm (number)
- `parcels[].weight`: Package weight in kg (number)

**Pickup Object:**
- `pickup.type`: "sender"
- `pickup.name`: Contact name (string)
- `pickup.company`: Company name (string)
- `pickup.email`: Contact email (string)
- `pickup.street`: Street address (string)
- `pickup.postcode`: Postal code (XX-XXX format)
- `pickup.city`: City (string)
- `pickup.phone`: Phone number (9 digits, Polish mobile format)

**Sender Object:**
- `sender.postcode`: Postal code (XX-XXX format)
- `sender.city`: City (string)
- `sender.country`: "PL"
- `sender.name`: Contact name (string)
- `sender.company`: Company name (string)
- `sender.phone`: Phone number (9 digits, Polish mobile format)
- `sender.email`: Contact email (string)
- `sender.street`: Street address (string)

**Receiver Object:**
- `receiver.postcode`: Postal code (XX-XXX format)
- `receiver.city`: City (string)
- `receiver.country`: "PL"
- `receiver.name`: Contact name (string)
- `receiver.company`: Company name (string)
- `receiver.phone`: Phone number (9 digits, Polish mobile format)
- `receiver.email`: Contact email (string)
- `receiver.street`: Street address (string)

### Critical Format Requirements

**Phone Number Format:**
- Valid: 9 digits (e.g., "600123456")
- Invalid: "+48123456789", "123456789", "+48 123 456 789"
- No country code prefix
- No spaces or special characters

**Postal Code Format:**
- Polish format: XX-XXX (e.g., "00-533")

**Units:**
- Dimensions: centimeters (cm)
- Weight: kilograms (kg)

---

## Response Format Specification

### Key Fields for Rate Calculation

**Pricing Object:**
- `pricing.price_gross`: Total price including tax (PLN)
- `pricing.price_net`: Price excluding tax (PLN)
- `pricing.price_base_net`: Base price before adjustments (PLN)
- `pricing.tax`: Tax rate percentage (e.g., 23)
- `pricing.details`: Array of additional fees (e.g., fuel surcharge)

**Carrier Identification:**
- `service`: Carrier name (e.g., "inpost", "dpd")
- `service_id`: Carrier service ID from request

**Delivery Time:**
- `delivery_time`: **ALWAYS NULL** (not provided by API)
- This is a critical limitation (see issue sang-logium-nuu)

**Package State:**
- `state`: Package state (e.g., "waiting")

### Complete Response Structure

The response includes 80+ fields including:
- Package identification (package_id, group_id)
- Address details (pickup, sender, receiver)
- Parcel information (dimensions, weight, tracking URL)
- Additional services flags (cod, insurance, etc.)
- Metadata (timestamps, URLs, etc.)

**Full specification available in:** `research/furgonetka-response-format-specification.md`

---

## Carrier Selection

### Primary Carriers (from /account/services)

| Carrier | Service ID | Pricing (Warsaw to Kraków) | Status |
|---------|------------|---------------------------|--------|
| InPost | 11597700 | 19.31 PLN | ✓ Working |
| DPD | 11597695 | 27.17 PLN | ✓ Working |
| DHL | 11597702 | 24.20 PLN | ⚠ Postcode issues |
| Poczta Polska | 11597699 | Unknown | ✗ Dimension error |

### Carrier-Specific Requirements

**Poczta Polska:**
- Minimum package dimensions: 16x10 cm
- Test package (15x15x15 cm) too small
- Cannot test with current package size

**DHL:**
- Postcode validation errors for some Warsaw postcodes
- Works for Kraków postcode (30-001)
- May have sandbox-specific validation rules

---

## Test Data

### Fixed Sender Address

**Location:** Warsaw (central Poland)
- Street: Marszałkowska 1
- Postcode: 00-533
- City: Warszawa
- Country: PL

### Recipient A (Close)

**Location:** Warsaw (same city)
- Distance: ~2 km
- Street: Nowy Świat 1
- Postcode: 00-001
- City: Warszawa
- Country: PL

### Recipient B (Far)

**Location:** Kraków (southern Poland)
- Distance: ~300 km
- Street: Floriańska 1
- Postcode: 30-001
- City: Kraków
- Country: PL

**Full details available in:** `research/furgonetka-test-addresses.md`

---

## Experiment Results

### Cost Comparison (Far Scenario)

| Carrier | Price Gross (PLN) | Price Net (PLN) | Rank |
|---------|-------------------|-----------------|------|
| InPost | 19.31 | 15.70 | 1 (lowest) |
| DHL | 24.20 | 19.67 | 2 |
| DPD | 27.17 | 22.09 | 3 (highest) |

**Price Variance:** 7.86 PLN (40.7% difference)

### Distance Impact

| Carrier | Close (PLN) | Far (PLN) | Difference | % Change |
|---------|-------------|-----------|------------|----------|
| InPost | 19.31 | 19.31 | 0.00 | 0.00% |
| DPD | 27.17 | 27.17 | 0.00 | 0.00% |

**Finding:** Distance has zero impact on pricing in sandbox (flat-rate behavior)

---

## Rate Realism Analysis

### ✓ Confirmed Realistic: Carrier Price Differences

**Finding:** Carriers show meaningful price differences (7.86 PLN variance).

**Assessment:** This reflects real-world carrier pricing. Different carriers have different pricing structures, and the variance between InPost (cheapest) and DPD (most expensive) is realistic.

### ⚠ Not Realistic: Distance Impact

**Finding:** Distance has no impact on pricing (0.00 PLN difference between 2 km and 300 km).

**Assessment:** In real-world scenarios, shipping costs typically increase with distance. The sandbox API uses flat-rate pricing regardless of distance, which is likely a simplification for testing purposes.

**Recommendation:** Verify production API pricing behavior before production deployment.

---

## Critical Findings and Limitations

### 1. Delivery Time Not Available (CRITICAL)

**Issue:** sang-logium-nuu (P1)

**Finding:** The `delivery_time` field is always null regardless of:
- Distance (same city vs different city vs different region)
- Carrier (InPost vs DPD vs DHL)
- Service configuration

**Impact:**
- Original experiment goal cannot be completed as specified
- Cannot verify delivery time differences between carriers or distances
- Experiment limited to cost-only verification

**Workarounds:**
- Adjust experiment to cost-only verification
- Contact Furgonetka support for delivery_time specification
- Use carrier-specific delivery time estimates from external sources

### 2. Sandbox Flat-Rate Pricing

**Finding:** Distance has no impact on pricing in sandbox environment.

**Impact:**
- Cannot verify distance-based pricing realism
- Production API may behave differently

**Recommendation:** Verify production API pricing behavior.

### 3. Carrier Validation Errors

**DHL:** Postcode validation errors for some Warsaw postcodes
**Poczta Polska:** Requires minimum 16x10 cm package dimensions

**Impact:** Not all carriers can be tested with current test data.

---

## Complications and Multi-Endpoint Requirements

### Single Endpoint Architecture

**Finding:** Rate calculation uses single endpoint (POST /packages).

**No multi-endpoint complexity:** Unlike some APIs that require separate endpoints for different carriers or services, Furgonetka uses a single endpoint with carrier selection via `service_id`.

### Carrier Selection

**Method:** Carrier selection via `service_id` field in request body.

**Carrier List:** Available from `/account/services` endpoint (GET request with authentication).

**No separate carrier configuration:** All carriers use the same endpoint with different service IDs.

---

## Documentation References

### Chunk-Specific Documentation

- **Chunk 2 (Endpoint Discovery):** `research/furgonetka-endpoint-discovery-report.md`
- **Chunk 3 (Request Format):** `research/furgonetka-request-format-specification.md`
- **Chunk 4 (Response Format):** `research/furgonetka-response-format-specification.md`
- **Chunk 5 (Authentication):** `research/furgonetka-authentication-verification.md`
- **Chunk 6 (Test Data):** `research/furgonetka-test-addresses.md`
- **Chunk 7 (Experiment Results):** `research/furgonetka-experiment-results.md`

### Verification Scripts

- **Request Format Verification:** `scripts/verify-furgonetka-request-format.mjs`
- **Authentication Verification:** `scripts/verify-furgonetka-auth.mjs`
- **Experiment Execution:** `scripts/run-furgonetka-experiment.mjs`

### Contingency Plans

- **Chunk 3 Contingencies:** `research/furgonetka-chunk3-contingencies.md`
- **Chunk 2 Contingencies:** `research/furgonetka-chunk2-contingencies.md`

---

## Recommendations

### For Experiment Purpose

1. **Proceed with cost-only verification:** The API provides sufficient cost data to verify carrier pricing differences.
2. **Use InPost and DPD:** These carriers are reliable in sandbox with consistent results.
3. **Document flat-rate limitation:** Note that sandbox uses flat-rate pricing, which may differ in production.

### For Production Deployment

1. **Verify production API pricing:** Confirm whether production uses distance-based pricing.
2. **Address delivery_time limitation:** If delivery time data is required, resolve issue sang-logium-nuu.
3. **Test with production carriers:** Verify all carriers work in production environment.
4. **Adjust package dimensions:** Use larger package (16x10 cm minimum) to include Poczta Polska.

### For Future Work

1. **Investigate delivery_time:** Contact Furgonetka support or research alternative data sources.
2. **Test additional scenarios:** More distance variations, different package sizes, weight variations.
3. **Carrier-specific testing:** Test with additional carriers beyond the primary 4.

---

## Conclusion

The Furgonetka Sandbox API provides functional rate calculation via POST /packages endpoint. Authentication is working, request/response formats are documented, and carrier pricing shows realistic variance. However, the critical limitation (delivery_time always null) prevents completion of the original experiment goal as specified.

**Status:** Cost verification is feasible and shows realistic carrier pricing differences. Delivery time verification is not possible with current API.

**Next Steps:** Proceed with cost-only verification or resolve delivery_time limitation via issue sang-logium-nuu.
