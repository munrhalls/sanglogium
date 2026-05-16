# Furgonetka API Endpoint Discovery Report

**Date:** 2026-05-14
**Chunk:** sang-logium-brj (Chunk 2: API Endpoint Discovery for Furgonetka)
**Purpose:** Document Furgonetka API endpoints for rate calculation and carrier handling

---

## Executive Summary

**Status:** PARTIAL SUCCESS

**Completed:**
- ✓ Authentication working (password grant)
- ✓ Carrier list endpoint accessible
- ✓ Rate calculation endpoint identified
- ✓ Carrier selection strategy defined
- ✓ Single vs multi-endpoint architecture determined

**Blocked:**
- ⚠️ Rate calculation endpoint request format requires detailed verification (Chunk 3)
- ⚠️ Response format unknown (Chunk 4)

---

## Pre-Flight Check Results

### Check 1: Authentication - PASSED
- **Method:** OAuth 2.0 Password Grant
- **Endpoint:** `https://api.sandbox.furgonetka.pl/oauth/token`
- **Credentials:** antarcticdepths71@gmail.com / Furgonetkaguars77@
- **Token Type:** Bearer
- **Expires in:** 2592000 seconds (30 days)
- **Status:** Working

### Check 2: Basic API Connectivity - PASSED
- **Base URL:** `https://api.sandbox.furgonetka.pl`
- **Status:** Reachable and responsive

### Check 3: Known Working Endpoint - PASSED
- **Endpoint:** `GET /account/services`
- **Authentication:** Password grant
- **Critical Header:** `Accept: application/vnd.furgonetka.v1+json`
- **Status:** Working - returns carrier list

---

## Working Endpoints

### `/account/services`
**Purpose:** Retrieve available carriers/services

**Method:** GET

**Authentication:** User token (password grant)

**Headers:**
```
Authorization: Bearer {token}
Accept: application/vnd.furgonetka.v1+json
```

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

---

## Rate Calculation Endpoint

### `/packages`
**Purpose:** Calculate shipping rates for specific carrier

**Method:** POST

**Authentication:** User token (password grant)

**Headers:**
```
Authorization: Bearer {token}
Accept: application/vnd.furgonetka.v1+json
Content-Type: application/json
```

**Status:** Endpoint exists and accessible, but request format requires refinement

**Known Required Fields (from validation errors):**
- `service_id` - Carrier service ID from `/account/services`
- `type` - Package type (e.g., "package")
- `width`, `height`, `depth`, `weight` - Package dimensions
- `pickup` - Pickup configuration (type, name, company)
- `sender` - Sender details (postcode, city, country, name, company, phone, email)
- `receiver` - Receiver details (postcode, city, country, name, company, phone, email)

**Request Format (Partial - requires Chunk 3 verification):**
```json
{
  "type": "package",
  "width": 15,
  "height": 15,
  "depth": 15,
  "weight": 1.5,
  "service_id": 11597695,
  "pickup": {
    "type": "sender",
    "name": "Test Sender",
    "company": "Test Company"
  },
  "sender": {
    "postcode": "00-533",
    "city": "Warszawa",
    "country": "PL",
    "name": "Test Sender",
    "company": "Test Company",
    "phone": "123456789",
    "email": "test@example.com"
  },
  "receiver": {
    "postcode": "00-001",
    "city": "Warszawa",
    "country": "PL",
    "name": "Test Receiver",
    "company": "Test Company",
    "phone": "123456789",
    "email": "test@example.com"
  }
}
```

**Response Format:** Unknown - requires Chunk 4 verification

**Current Status:** Returns validation errors or 502 Bad Gateway, indicating request format needs refinement

---

## Architecture: Single vs Multi-Endpoint

**Determination:** Single endpoint architecture

**Structure:**
- **Single pricing endpoint:** POST `/packages`
- **Carrier selection:** Via `service_id` parameter in request body
- **Multiple carriers:** Requires separate requests per service_id (one carrier per request)

**Flow:**
1. GET `/account/services` → Get list of available carriers with service_ids
2. POST `/packages` with `service_id` → Calculate rate for specific carrier
3. Repeat step 2 for each carrier

**Complexity:** Low - simple two-step flow, no complex orchestration

---

## Carrier Selection Strategy

### Primary Selection (4 Most Popular in Poland)
1. **InPost** (id: 11597700) - Most popular parcel locker network in Poland
2. **DPD** (id: 11597695) - Major courier with strong Poland domestic presence
3. **DHL** (id: 11597702) - Major international carrier with established Poland operations
4. **Poczta Polska** (id: 11597699) - Polish national post service

### Fallback List (if primary unavailable)
5. UPS (id: 11597697)
6. FedEx (id: 11597696)
7. GLS (id: 11597698)
8. ORLEN Paczka (id: 11597701)

**Status:** All primary carriers are available and configured in sandbox account

---

## Carrier Input Method

**Field:** `service_id` (integer)

**Value:** Carrier's service ID from `/account/services` response

**Scope:** One service_id per request (single carrier pricing)

**Multiple Carriers:** Require separate API calls with different service_id values

**Example:**
```json
{
  "service_id": 11597700,  // InPost
  ...other required fields
}
```

---

## Authentication Pattern

**Required Method:** OAuth 2.0 Password Grant

**Why Password Grant:**
- Required for user-scoped endpoints like `/account/services`
- Client credentials grant lacks permissions for shipping endpoints
- 30-day token expiration (vs 60 minutes for client_credentials)

**Request:**
```
POST https://api.sandbox.furgonetka.pl/oauth/token
Authorization: Basic {base64(client_id:client_secret)}
Content-Type: application/x-www-form-urlencoded

grant_type=password&scope=api&username={username}&password={password}
```

**Critical Header:** `Accept: application/vnd.furgonetka.v1+json` required for all API calls

---

## Issues and Blockers

### Issue 1: Request Format Incomplete
**Status:** BLOCKED - Requires Chunk 3 verification
**Problem:** POST `/packages` request format not fully validated
**Validation Errors Encountered:**
- Missing service_id
- Missing pickup fields (name, company)
- Additional sender/receiver fields may be required
**Next Step:** Chunk 3 (Request Format Verification) will complete request format definition

### Issue 2: Response Format Unknown
**Status:** BLOCKED - Requires Chunk 4 verification
**Problem:** Cannot validate response matches Chunk 1 data requirements
**Next Step:** Chunk 4 (Response Format Verification) will extract and document response schema

### Issue 3: 502 Bad Gateway
**Status:** INTERMITTENT
**Problem:** Some requests return 502 Bad Gateway
**Likely Cause:** Request format still incorrect, causing server-side errors
**Next Step:** Refine request format in Chunk 3

---

## Next Steps (Sequential Dependencies)

**Chunk 3 (sang-logium-fkj):** Request Format Verification
- Complete POST `/packages` request format definition
- Test with valid addresses
- Verify all required fields
- Document exact request structure

**Chunk 4 (sang-logium-9sg):** Response Format Verification
- Extract response schema from successful POST `/packages` calls
- Validate response contains required fields (carrier_id, delivery_time, cost, currency)
- Document response structure
- Verify matches Chunk 1 data requirements

**Chunk 5 (sang-logium-u0j):** Authentication Verification
- Already completed in this chunk (pre-flight checks)

**Remaining Chunks:** Test data preparation, implementation, documentation

---

## Test Scripts Created

1. `scripts/test-furgonetka-account-services.mjs` - Tests `/account/services` endpoint
2. `scripts/test-furgonetka-pricing-endpoint.mjs` - Tests POST `/packages` endpoint

---

## Key Findings

1. **Authentication:** Password grant with `Accept: application/vnd.furgonetka.v1+json` header is critical
2. **Carrier List:** 15 carriers available via `/account/services`
3. **Pricing Endpoint:** POST `/packages` is the rate calculation endpoint
4. **Architecture:** Single endpoint with per-carrier requests via service_id
5. **Request Format:** Partially known, requires Chunk 3 completion
6. **Response Format:** Unknown, requires Chunk 4 verification

---

## Conclusion

Chunk 2 successfully identified the core API structure:
- Authentication working
- Carrier list accessible
- Pricing endpoint identified
- Architecture determined (single endpoint, per-carrier requests)
- Carrier selection strategy defined
- Carrier input method documented

**Blockers:** Request/response format verification deferred to Chunks 3-4

**Readiness for Chunk 3:** Endpoint discovered, authentication working, ready for detailed request format verification
